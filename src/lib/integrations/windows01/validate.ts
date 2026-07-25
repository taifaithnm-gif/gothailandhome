import {
  FORBIDDEN_WORKER_STATES,
  SUPPORTED_WINDOWS01_SCHEMA_VERSIONS,
  type ForbiddenWorkerState,
  type Windows01EvidenceRefs,
  type Windows01ManifestV0,
  type Windows01RecordV0,
  type Windows01SchemaVersion,
} from "./types.ts";

export class Windows01ValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "Windows01ValidationError";
    this.code = code;
  }
}

const MAX_PAYLOAD_BYTES = 512 * 1024; // 512 KiB per record payload JSON
const MAX_BATCH_RECORDS = 5_000;
const MIN_HASH_LEN = 16;

/** Schema / worker version gate — mismatch → quarantine, do not continue. */
export type SchemaVersionCheck = {
  ok: boolean;
  schemaVersion: string | null;
  workerVersion: string | null;
  reasons: string[];
};

export function isSupportedSchemaVersion(
  version: unknown,
): version is Windows01SchemaVersion {
  return (
    typeof version === "string" &&
    (SUPPORTED_WINDOWS01_SCHEMA_VERSIONS as readonly string[]).includes(version)
  );
}

export function assertNoPathTraversal(relativePath: string): void {
  const p = relativePath.replace(/\\/g, "/");
  if (
    p.startsWith("/") ||
    p.includes("://") ||
    p.split("/").some((seg) => seg === ".." || seg === "")
  ) {
    throw new Windows01ValidationError(
      "PATH_TRAVERSAL",
      `Illegal evidence path: ${relativePath}`,
    );
  }
}

export function assertSafeHttpUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Windows01ValidationError("MALICIOUS_URL", "Invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Windows01ValidationError(
      "MALICIOUS_URL",
      "Only http(s) source URLs are allowed",
    );
  }
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host === "169.254.169.254" ||
    host === "metadata.google.internal"
  ) {
    throw new Windows01ValidationError(
      "MALICIOUS_URL",
      "URL targets a blocked private/metadata host",
    );
  }
}

export function assertWorkerStateAllowed(state: string | undefined): void {
  if (!state) return;
  const upper = state.toUpperCase();
  if (
    (FORBIDDEN_WORKER_STATES as readonly string[]).includes(upper) ||
    (FORBIDDEN_WORKER_STATES as readonly ForbiddenWorkerState[]).includes(
      state as ForbiddenWorkerState,
    )
  ) {
    throw new Windows01ValidationError(
      "FORBIDDEN_WORKER_STATE",
      `Worker must not emit publish state: ${state}`,
    );
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertIsoTimestamp(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Windows01ValidationError(
      "INVALID_MANIFEST",
      `${field} required (ISO timestamp)`,
    );
  }
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    throw new Windows01ValidationError(
      "INVALID_MANIFEST",
      `${field} must be a valid ISO timestamp`,
    );
  }
  return value;
}

function assertHash(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length < MIN_HASH_LEN) {
    throw new Windows01ValidationError(
      "INVALID_MANIFEST",
      `${field} required (min ${MIN_HASH_LEN} chars)`,
    );
  }
  return value;
}

/**
 * Version check gate for schema_version + worker_version.
 * Schema mismatch must quarantine and must not continue.
 */
export function checkSchemaVersions(input: {
  schemaVersion?: unknown;
  workerVersion?: unknown;
  expectedSchema?: Windows01SchemaVersion;
}): SchemaVersionCheck {
  const reasons: string[] = [];
  const schemaVersion =
    typeof input.schemaVersion === "string" ? input.schemaVersion : null;
  const workerVersion =
    typeof input.workerVersion === "string" ? input.workerVersion : null;

  if (!schemaVersion) {
    reasons.push("schema_version missing");
  } else if (
    input.expectedSchema &&
    schemaVersion !== input.expectedSchema
  ) {
    reasons.push(
      `schema_version mismatch: got ${schemaVersion}, expected ${input.expectedSchema}`,
    );
  } else if (!isSupportedSchemaVersion(schemaVersion)) {
    reasons.push(`unsupported schema_version: ${schemaVersion}`);
  }

  if (!workerVersion || !workerVersion.trim()) {
    reasons.push("worker_version missing");
  }

  return {
    ok: reasons.length === 0,
    schemaVersion,
    workerVersion,
    reasons,
  };
}

function parseEvidence(
  input: Record<string, unknown>,
): Windows01EvidenceRefs | undefined {
  if (!isPlainObject(input.evidence)) return undefined;
  const e = input.evidence;
  const out: Windows01EvidenceRefs = {};
  if (typeof e.image === "string") {
    assertNoPathTraversal(e.image);
    out.image = e.image;
  }
  if (typeof e.pdf === "string") {
    assertNoPathTraversal(e.pdf);
    out.pdf = e.pdf;
  }
  if (typeof e.news === "string") {
    // news may be a relative evidence path OR a URL — validate accordingly
    if (e.news.includes("://")) {
      assertSafeHttpUrl(e.news);
    } else {
      assertNoPathTraversal(e.news);
    }
    out.news = e.news;
  }
  if (typeof e.imageHash === "string" && e.imageHash.length >= MIN_HASH_LEN) {
    out.imageHash = e.imageHash;
  }
  if (typeof e.pdfHash === "string" && e.pdfHash.length >= MIN_HASH_LEN) {
    out.pdfHash = e.pdfHash;
  }
  if (typeof e.newsUrl === "string" && e.newsUrl) {
    assertSafeHttpUrl(e.newsUrl);
    out.newsUrl = e.newsUrl;
  }
  return out;
}

export function validateManifest(input: unknown): Windows01ManifestV0 {
  if (!isPlainObject(input)) {
    throw new Windows01ValidationError("INVALID_MANIFEST", "Manifest must be an object");
  }

  const versionCheck = checkSchemaVersions({
    schemaVersion: input.schemaVersion,
    workerVersion: input.workerVersion,
    expectedSchema: "windows01.manifest.v0",
  });
  if (!versionCheck.ok) {
    const unsupported = versionCheck.reasons.some((r) =>
      r.includes("unsupported") || r.includes("mismatch"),
    );
    throw new Windows01ValidationError(
      unsupported ? "UNSUPPORTED_SCHEMA" : "VERSION_MISMATCH",
      versionCheck.reasons.join("; "),
    );
  }

  if (typeof input.batchId !== "string" || !input.batchId.trim()) {
    throw new Windows01ValidationError("INVALID_MANIFEST", "batchId required");
  }
  const producedAt = assertIsoTimestamp(input.producedAt, "timestamp/producedAt");
  if (input.sourceMachine !== "windows01") {
    throw new Windows01ValidationError(
      "INVALID_MANIFEST",
      "sourceMachine must be windows01",
    );
  }
  if (typeof input.recordCount !== "number" || input.recordCount < 0) {
    throw new Windows01ValidationError("INVALID_MANIFEST", "recordCount invalid");
  }
  if (input.recordCount > MAX_BATCH_RECORDS) {
    throw new Windows01ValidationError(
      "OVERSIZED_PAYLOAD",
      `recordCount exceeds ${MAX_BATCH_RECORDS}`,
    );
  }
  const contentHash = assertHash(
    input.contentHash ?? input.hash,
    "hash/contentHash",
  );
  if (!Array.isArray(input.evidencePaths)) {
    throw new Windows01ValidationError("INVALID_MANIFEST", "evidencePaths required");
  }
  for (const p of input.evidencePaths) {
    if (typeof p !== "string") {
      throw new Windows01ValidationError("INVALID_MANIFEST", "evidence path must be string");
    }
    assertNoPathTraversal(p);
  }

  return {
    schemaVersion: "windows01.manifest.v0",
    batchId: input.batchId.trim(),
    producedAt,
    sourceMachine: "windows01",
    workerVersion: (input.workerVersion as string).trim(),
    recordCount: input.recordCount,
    contentHash,
    evidencePaths: input.evidencePaths as string[],
  };
}

export function validateRecord(input: unknown): Windows01RecordV0 {
  if (!isPlainObject(input)) {
    throw new Windows01ValidationError("UNSUPPORTED_SCHEMA", "Record must be an object");
  }

  const versionCheck = checkSchemaVersions({
    schemaVersion: input.schemaVersion,
    workerVersion: input.workerVersion ?? "record-inherits-manifest",
    expectedSchema: "windows01.results.v0",
  });
  // Records inherit worker_version from manifest; allow missing on record if placeholder used.
  // Still require schema_version match.
  if (
    !versionCheck.schemaVersion ||
    !isSupportedSchemaVersion(versionCheck.schemaVersion) ||
    versionCheck.schemaVersion !== "windows01.results.v0"
  ) {
    throw new Windows01ValidationError(
      "UNSUPPORTED_SCHEMA",
      `Unsupported record schema: ${String(input.schemaVersion)}`,
    );
  }

  if (typeof input.recordId !== "string" || !input.recordId.trim()) {
    throw new Windows01ValidationError("INVALID_MANIFEST", "record_id required");
  }
  const contentHash = assertHash(input.contentHash, "content_hash");
  const timestamp = assertIsoTimestamp(
    input.timestamp ?? input.producedAt,
    "timestamp",
  );
  if (!Array.isArray(input.evidenceRefs) || input.evidenceRefs.length === 0) {
    throw new Windows01ValidationError(
      "MISSING_EVIDENCE",
      "evidenceRefs must be a non-empty array",
    );
  }
  for (const ref of input.evidenceRefs) {
    if (typeof ref !== "string") {
      throw new Windows01ValidationError("MISSING_EVIDENCE", "evidence ref must be string");
    }
    assertNoPathTraversal(ref);
  }
  if (typeof input.sourceUrl === "string" && input.sourceUrl) {
    assertSafeHttpUrl(input.sourceUrl);
  }
  if (typeof input.workerState === "string") {
    assertWorkerStateAllowed(input.workerState);
  }
  if (!isPlainObject(input.payload)) {
    throw new Windows01ValidationError("UNSUPPORTED_SCHEMA", "payload must be object");
  }
  const payloadBytes = Buffer.byteLength(JSON.stringify(input.payload), "utf8");
  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    throw new Windows01ValidationError(
      "OVERSIZED_PAYLOAD",
      `payload exceeds ${MAX_PAYLOAD_BYTES} bytes`,
    );
  }

  const evidence = parseEvidence(input);

  return {
    schemaVersion: "windows01.results.v0",
    recordId: input.recordId.trim(),
    sourceUrl: typeof input.sourceUrl === "string" ? input.sourceUrl : undefined,
    contentHash,
    timestamp,
    entityHints: isPlainObject(input.entityHints) ? input.entityHints : undefined,
    evidenceRefs: input.evidenceRefs as string[],
    evidence,
    workerState: typeof input.workerState === "string" ? input.workerState : undefined,
    payload: input.payload,
  };
}

export function assertEvidenceIntegrity(
  manifest: Windows01ManifestV0,
  record: Windows01RecordV0,
): void {
  const allowed = new Set(manifest.evidencePaths);
  for (const ref of record.evidenceRefs) {
    if (!allowed.has(ref)) {
      throw new Windows01ValidationError(
        "MISSING_EVIDENCE",
        `evidence ref not listed in manifest: ${ref}`,
      );
    }
  }
  if (record.evidence?.image && !allowed.has(record.evidence.image)) {
    throw new Windows01ValidationError(
      "MISSING_EVIDENCE",
      `image evidence not listed in manifest: ${record.evidence.image}`,
    );
  }
  if (record.evidence?.pdf && !allowed.has(record.evidence.pdf)) {
    throw new Windows01ValidationError(
      "MISSING_EVIDENCE",
      `pdf evidence not listed in manifest: ${record.evidence.pdf}`,
    );
  }
}

/** Required schema fields checklist for reports. */
export const REQUIRED_SCHEMA_FIELDS = [
  "schema_version",
  "worker_version",
  "manifest",
  "hash",
  "source_url",
  "record_id",
  "content_hash",
  "timestamp",
] as const;
