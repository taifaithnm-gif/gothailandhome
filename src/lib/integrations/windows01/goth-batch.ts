/**
 * Goth Batch package (Windows01 EXPORTS ZIP layout) support.
 * Distinct from windows01.manifest.v0 mock packages.
 * Never writes databases / storage / Production.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  LAX_HASH_PATHS,
  parseZipSize,
  validateSealedZipContract,
  type SealedZipValidation,
} from "./sealed-zip.ts";
import { SUPPORTED_GOTH_BATCH_SCHEMA_VERSIONS } from "./contract-versions.ts";

export {
  BATCH_CONTRACT_V1,
  GOTH_BATCH_MANIFEST_SCHEMA_V1,
  SUPPORTED_GOTH_BATCH_SCHEMA_VERSIONS,
  SUPPORTED_GOTH_EXPORT_CONTRACT_VERSIONS,
} from "./contract-versions.ts";

export const ALLOWED_BATCH_STATUSES = [
  "READY_FOR_STAGING_REVIEW",
  "CONDITIONAL_READY",
] as const;

export const DRY_RUN_ACTION_VOCABULARY = [
  "WOULD_CREATE",
  "WOULD_UPDATE",
  "WOULD_REVIEW",
  "WOULD_REJECT",
  "WOULD_QUARANTINE",
  "WOULD_SKIP_DUPLICATE",
] as const;

export type DryRunAction = (typeof DRY_RUN_ACTION_VOCABULARY)[number];

export const FORBIDDEN_DRY_RUN_ACTIONS = [
  "CREATED",
  "UPDATED",
  "PUBLISHED",
  "APPROVED",
] as const;

/** Site review states Windows01 may map into (never publish states). */
export const ALLOWED_MAPPED_REVIEW_STATES = [
  "RECEIVED",
  "VALIDATED",
  "REVIEW_REQUIRED",
  "CONFLICT",
  "REJECTED",
  "DUPLICATE_CANDIDATE",
  "QUARANTINED",
] as const;

export type MappedReviewState = (typeof ALLOWED_MAPPED_REVIEW_STATES)[number];

export type GothBatchManifest = {
  schema_version: string;
  batch_id: string;
  job_id: string;
  created_at?: string;
  generated_at?: string;
  status: string;
  counts?: Record<string, number>;
  linkage_pass_rate?: number;
  validation_ok?: boolean;
  file_count?: number;
  zip_path?: string;
  zip_sha256?: string;
  zip_size?: string | number;
};

export type HashValidationResult = {
  status: "PASS" | "HASH_VALIDATION_FAILED";
  payloadFilesOk: number;
  payloadFilesFailed: number;
  metaFilesLaxOk: string[];
  metaFilesFailed: string[];
  missingFiles: string[];
  unlistedFiles: string[];
  inventoryMembershipOk: boolean;
  sumsMembershipOk: boolean;
  mismatches: Array<{
    path: string;
    expected: string;
    actual: string;
    source: string;
  }>;
  /** Observational only — never contract authority. */
  raw_zip_sha256?: string;
  sealed_zip_sha256?: string | null;
  zipSha256Sidecar?: string | null;
  zipSha256Manifest?: string | null;
  sealedValidation?: SealedZipValidation;
};

export type FieldCompatStatus =
  | "DIRECT_MATCH"
  | "RENAMED"
  | "TRANSFORM_REQUIRED"
  | "OPTIONAL"
  | "MISSING"
  | "UNSUPPORTED"
  | "REJECTED";

export type FieldCompatRow = {
  field: string;
  status: FieldCompatStatus;
  windows01?: string;
  siteContract?: string;
  notes?: string;
};

export function sha256File(filePath: string): string {
  const h = createHash("sha256");
  h.update(fs.readFileSync(filePath));
  return h.digest("hex");
}

export function parseSha256Sums(text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const m = /^([a-fA-F0-9]{64})\s+(.+)$/.exec(trimmed);
    if (!m) continue;
    map.set(m[2]!.replace(/^\.\//, ""), m[1]!.toLowerCase());
  }
  return map;
}

export function listFilesRecursive(root: string): string[] {
  const out: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        out.push(path.relative(root, full).split(path.sep).join("/"));
      }
    }
  }
  if (fs.existsSync(root)) walk(root);
  return out.sort();
}

export function loadGothBatchManifest(batchDir: string): GothBatchManifest {
  const p = path.join(batchDir, "manifests", "batch_manifest.json");
  if (!fs.existsSync(p)) {
    throw new Error(`MISSING_MANIFEST: ${p}`);
  }
  return JSON.parse(fs.readFileSync(p, "utf8")) as GothBatchManifest;
}

/**
 * Validate SHA256SUMS + file_inventory against on-disk files (BATCH_CONTRACT_V1).
 *
 * - Payload files: strict sha256 + bytes
 * - Meta self-reference paths (LAX_HASH_PATHS): membership + bytes only
 * - ZIP authority: sealed digest (never raw sha256sum)
 */
export function validateGothBatchHashes(
  batchDir: string,
  options?: {
    zipPath?: string;
    zipSidecarPath?: string;
    externalManifestPath?: string;
  },
): HashValidationResult {
  const sumsPath = path.join(batchDir, "manifests", "SHA256SUMS.txt");
  const invPath = path.join(batchDir, "manifests", "file_inventory.json");
  const mismatches: HashValidationResult["mismatches"] = [];
  const missingFiles: string[] = [];
  const metaFilesLaxOk: string[] = [];
  const metaFilesFailed: string[] = [];

  if (!fs.existsSync(sumsPath)) {
    return {
      status: "HASH_VALIDATION_FAILED",
      payloadFilesOk: 0,
      payloadFilesFailed: 0,
      metaFilesLaxOk: [],
      metaFilesFailed: ["manifests/SHA256SUMS.txt"],
      missingFiles: ["manifests/SHA256SUMS.txt"],
      unlistedFiles: [],
      inventoryMembershipOk: false,
      sumsMembershipOk: false,
      mismatches: [
        {
          path: "manifests/SHA256SUMS.txt",
          expected: "(present)",
          actual: "(missing)",
          source: "existence",
        },
      ],
    };
  }

  const sums = parseSha256Sums(fs.readFileSync(sumsPath, "utf8"));
  const inventory: Array<{ path: string; bytes: number; sha256: string }> =
    fs.existsSync(invPath)
      ? (JSON.parse(fs.readFileSync(invPath, "utf8")) as Array<{
          path: string;
          bytes: number;
          sha256: string;
        }>)
      : [];
  const invMap = new Map(inventory.map((i) => [i.path, i]));
  const actualFiles = listFilesRecursive(batchDir);
  const actualSet = new Set(actualFiles);
  const invPaths = new Set(invMap.keys());
  const sumPaths = new Set(sums.keys());

  const inventoryMembershipOk =
    invPaths.size === actualSet.size &&
    [...actualSet].every((p) => invPaths.has(p));
  const sumsMembershipOk =
    sumPaths.size === actualSet.size &&
    [...actualSet].every((p) => sumPaths.has(p));

  if (!inventoryMembershipOk) {
    for (const p of actualSet) {
      if (!invPaths.has(p)) {
        mismatches.push({
          path: p,
          expected: "(in inventory)",
          actual: "(missing from inventory)",
          source: "inventory_membership",
        });
      }
    }
    for (const p of invPaths) {
      if (!actualSet.has(p)) {
        missingFiles.push(p);
        mismatches.push({
          path: p,
          expected: "(on disk)",
          actual: "(missing)",
          source: "inventory_membership",
        });
      }
    }
  }
  if (!sumsMembershipOk) {
    for (const p of actualSet) {
      if (!sumPaths.has(p)) {
        mismatches.push({
          path: p,
          expected: "(in SHA256SUMS)",
          actual: "(missing from SHA256SUMS)",
          source: "sums_membership",
        });
      }
    }
  }

  let payloadFilesOk = 0;
  let payloadFilesFailed = 0;

  for (const [rel, expected] of sums) {
    const full = path.join(batchDir, rel);
    if (!fs.existsSync(full)) {
      if (!missingFiles.includes(rel)) missingFiles.push(rel);
      mismatches.push({
        path: rel,
        expected,
        actual: "(missing)",
        source: "SHA256SUMS",
      });
      continue;
    }
    const actualBytes = fs.statSync(full).size;
    const inv = invMap.get(rel);
    if (inv && inv.bytes !== actualBytes) {
      mismatches.push({
        path: rel,
        expected: String(inv.bytes),
        actual: String(actualBytes),
        source: "file_inventory.bytes",
      });
      if (LAX_HASH_PATHS.has(rel)) metaFilesFailed.push(rel);
      else payloadFilesFailed += 1;
      continue;
    }

    if (LAX_HASH_PATHS.has(rel)) {
      // BATCH_CONTRACT_V1: membership + bytes only for meta self-reference.
      metaFilesLaxOk.push(rel);
      continue;
    }

    const actual = sha256File(full);
    if (actual !== expected.toLowerCase()) {
      mismatches.push({
        path: rel,
        expected: expected.toLowerCase(),
        actual,
        source: "SHA256SUMS",
      });
      payloadFilesFailed += 1;
      continue;
    }
    if (inv && inv.sha256.toLowerCase() !== actual) {
      mismatches.push({
        path: rel,
        expected: inv.sha256.toLowerCase(),
        actual,
        source: "file_inventory",
      });
      payloadFilesFailed += 1;
      continue;
    }
    payloadFilesOk += 1;
  }

  const unlistedFiles = actualFiles.filter(
    (f) => !sumPaths.has(f) || !invPaths.has(f),
  );

  let sealedValidation: SealedZipValidation | undefined;
  let raw_zip_sha256: string | undefined;
  let sealed_zip_sha256: string | null | undefined;
  let zipSha256Sidecar: string | null = null;
  let zipSha256Manifest: string | null = null;

  let manifest: GothBatchManifest | null = null;
  try {
    manifest = loadGothBatchManifest(batchDir);
    zipSha256Manifest = manifest.zip_sha256?.toLowerCase() ?? null;
  } catch {
    // handled by caller
  }

  if (options?.zipPath && fs.existsSync(options.zipPath)) {
    sealedValidation = validateSealedZipContract({
      zipPath: options.zipPath,
      sidecarPath: options.zipSidecarPath,
      externalManifestPath: options.externalManifestPath,
      internalManifest: manifest,
    });
    raw_zip_sha256 = sealedValidation.raw_zip_sha256;
    sealed_zip_sha256 = sealedValidation.sealed_zip_sha256;
    zipSha256Sidecar = sealedValidation.sidecar_sha256;
    if (sealedValidation.status !== "PASS") {
      for (const reason of sealedValidation.reasons) {
        mismatches.push({
          path: "(zip)",
          expected: sealed_zip_sha256 ?? "(sealed)",
          actual: reason,
          source: "sealed_zip_contract",
        });
      }
    }
    if (
      manifest?.zip_size != null &&
      parseZipSize(manifest.zip_size) !== sealedValidation.zip_size
    ) {
      mismatches.push({
        path: "(zip)",
        expected: String(parseZipSize(manifest.zip_size)),
        actual: String(sealedValidation.zip_size),
        source: "batch_manifest.zip_size",
      });
    }
  }

  const failed =
    payloadFilesFailed > 0 ||
    missingFiles.length > 0 ||
    unlistedFiles.length > 0 ||
    !inventoryMembershipOk ||
    !sumsMembershipOk ||
    metaFilesFailed.length > 0 ||
    (sealedValidation != null && sealedValidation.status !== "PASS");

  return {
    status: failed ? "HASH_VALIDATION_FAILED" : "PASS",
    payloadFilesOk,
    payloadFilesFailed,
    metaFilesLaxOk: [...new Set(metaFilesLaxOk)],
    metaFilesFailed: [...new Set(metaFilesFailed)],
    missingFiles,
    unlistedFiles,
    inventoryMembershipOk,
    sumsMembershipOk,
    mismatches,
    raw_zip_sha256,
    sealed_zip_sha256,
    zipSha256Sidecar,
    zipSha256Manifest,
    sealedValidation,
  };
}

export function isSupportedGothSchema(version: string): boolean {
  return (SUPPORTED_GOTH_BATCH_SCHEMA_VERSIONS as readonly string[]).includes(
    version,
  );
}

export function buildContractCompatibility(
  manifest: GothBatchManifest,
  sampleRecordKeys: string[],
): FieldCompatRow[] {
  const rows: FieldCompatRow[] = [
    {
      field: "schema_version",
      status: isSupportedGothSchema(manifest.schema_version)
        ? "TRANSFORM_REQUIRED"
        : "UNSUPPORTED",
      windows01: manifest.schema_version,
      siteContract: "windows01.manifest.v0 / windows01.results.v0",
      notes:
        "Goth batch uses goth_batch_manifest.v1; site adapter v0 expects different package shape",
    },
    {
      field: "batch_id",
      status: "RENAMED",
      windows01: "batch_id",
      siteContract: "batchId",
    },
    {
      field: "job_id",
      status: "OPTIONAL",
      windows01: "job_id",
      siteContract: "(not in v0 manifest; preserve as unsupported/extension)",
    },
    {
      field: "record_id",
      status: sampleRecordKeys.includes("project_id")
        ? "TRANSFORM_REQUIRED"
        : "MISSING",
      windows01: "project_id / image_id / …",
      siteContract: "recordId",
    },
    {
      field: "source_url",
      status: "DIRECT_MATCH",
      windows01: "source_url",
      siteContract: "sourceUrl",
    },
    {
      field: "source_domain",
      status: "OPTIONAL",
      windows01: "source_domain",
      siteContract: "(entityHints / payload)",
    },
    {
      field: "captured_at / discovered_at",
      status: "RENAMED",
      windows01: "captured_at | discovered_at | retrieved_at",
      siteContract: "timestamp",
    },
    {
      field: "content_hash",
      status: "TRANSFORM_REQUIRED",
      windows01: "sha256 / evidence.sha256",
      siteContract: "contentHash",
    },
    {
      field: "evidence",
      status: "TRANSFORM_REQUIRED",
      windows01: "evidence object / local_path",
      siteContract: "evidenceRefs[] + evidencePaths",
    },
    {
      field: "review_status",
      status: "TRANSFORM_REQUIRED",
      windows01: "reason / province_resolution.status",
      siteContract: "Windows01ReviewState / EvidenceReviewStatus",
    },
    {
      field: "developer_id",
      status: "TRANSFORM_REQUIRED",
      windows01: "developer_resolution.developer_id",
      siteContract: "entityHints.developer",
      notes: "Batch emits developer_id=dev-unknown for all rows",
    },
    {
      field: "project_id",
      status: "DIRECT_MATCH",
      windows01: "project_id",
      siteContract: "entityHints.project / payload",
    },
    {
      field: "province",
      status: "DIRECT_MATCH",
      windows01: "province / province_resolution",
      siteContract: "entityHints.province",
    },
    {
      field: "location_confidence",
      status: "RENAMED",
      windows01: "province_resolution.confidence",
      siteContract: "(payload)",
    },
    {
      field: "linkage_status",
      status: "OPTIONAL",
      windows01: "linkage_status",
      siteContract: "(not in v0; preserve)",
    },
    {
      field: "local_path",
      status: "TRANSFORM_REQUIRED",
      windows01: "local_path / file",
      siteContract: "evidencePaths relative refs",
    },
    {
      field: "sha256",
      status: "RENAMED",
      windows01: "sha256",
      siteContract: "contentHash / evidence.imageHash|pdfHash",
    },
    {
      field: "media_type",
      status: "TRANSFORM_REQUIRED",
      windows01: "format / doc_type",
      siteContract: "(payload)",
    },
    {
      field: "failure classification",
      status: "OPTIONAL",
      windows01: "failures[].classification",
      siteContract: "(quarantine reason mapping)",
    },
  ];
  return rows;
}

export function mapWindows01ReviewReason(
  reason: string | undefined,
): {
  mapped_state: MappedReviewState;
  severity: "low" | "medium" | "high";
  reviewer_action: string;
  blocking: boolean;
} {
  const r = (reason ?? "UNKNOWN").toUpperCase();
  if (r.includes("DUPLICATE")) {
    return {
      mapped_state: "DUPLICATE_CANDIDATE",
      severity: "medium",
      reviewer_action: "COMPARE_AND_DECIDE",
      blocking: false,
    };
  }
  if (r.includes("CONFLICT") || r.includes("NAME_CONFLICT")) {
    return {
      mapped_state: "CONFLICT",
      severity: "high",
      reviewer_action: "RESOLVE_CONFLICT",
      blocking: true,
    };
  }
  if (
    r.includes("REJECT") ||
    r.includes("MALICIOUS") ||
    r.includes("FORBIDDEN")
  ) {
    return {
      mapped_state: "REJECTED",
      severity: "high",
      reviewer_action: "CONFIRM_REJECT",
      blocking: true,
    };
  }
  if (
    r.includes("LOW_CONFIDENCE") ||
    r.includes("REVIEW") ||
    r.includes("FAILED") ||
    r.includes("UNKNOWN")
  ) {
    return {
      mapped_state: "REVIEW_REQUIRED",
      severity: "medium",
      reviewer_action: "HUMAN_REVIEW",
      blocking: true,
    };
  }
  if (r.includes("QUARANTINE") || r.includes("SAFETY")) {
    return {
      mapped_state: "QUARANTINED",
      severity: "high",
      reviewer_action: "TRIAGE_QUARANTINE",
      blocking: true,
    };
  }
  return {
    mapped_state: "RECEIVED",
    severity: "low",
    reviewer_action: "VALIDATE",
    blocking: false,
  };
}

export function assertDryRunActionAllowed(action: string): asserts action is DryRunAction {
  if (
    (FORBIDDEN_DRY_RUN_ACTIONS as readonly string[]).includes(action) ||
    !(DRY_RUN_ACTION_VOCABULARY as readonly string[]).includes(action)
  ) {
    throw new Error(`Forbidden or unknown dry-run action: ${action}`);
  }
}

export function isPdfMagic(buf: Buffer): boolean {
  return buf.length >= 4 && buf.subarray(0, 4).toString("utf8") === "%PDF";
}

export function sniffImageMime(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buf.length >= 6 &&
    buf.subarray(0, 6).toString("ascii") === "GIF87a"
  ) {
    return "image/gif";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function projectIdFromSourcePage(sourcePage: string | null | undefined): string | null {
  if (!sourcePage) return null;
  const m = /\/projects\/show\/(\d+)/i.exec(sourcePage);
  return m?.[1] ?? null;
}

export function normalizeName(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugCandidate(value: string): string {
  return normalizeName(value)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0e00-\u0e7f-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
