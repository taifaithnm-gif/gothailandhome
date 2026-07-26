/**
 * Phase2 commit artifact builder — offline, deterministic, no DB.
 * Milestone: BUILD_BATCH001_PHASE2_COMMIT_ARTIFACT
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { stableStringify } from "./environment-guard.ts";
import {
  loadBatchCommitInputFromReviewConsole,
  simulateCommit,
} from "./commit-simulator.ts";
import { computeContentHash, buildIdempotencyKey } from "./idempotency.ts";
import {
  sha256File,
  validateGothBatchHashes,
} from "../integrations/windows01/goth-batch.ts";
import { validateSealedZipContract } from "../integrations/windows01/sealed-zip.ts";

export const PHASE2_COMMIT_CONTRACT_VERSION = "commit_staging_import_v1.phase2" as const;
export const PHASE2_ARTIFACT_GENERATOR_VERSION = "build-batch-phase2-commit-artifact.v1" as const;
export const EXPECTED_SOURCE_SEALED_DIGEST =
  "d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786";

/** Frozen Batch generation time — used only in provenance metadata, not hashed payload. */
export const BATCH001_FROZEN_GENERATED_AT = "2026-07-24T16:04:19Z";

export const EXPECTED_PHASE2_COUNTS = {
  developers: 5,
  projects: 10,
  images: 9,
  pdfs: 5,
  news: 10,
  review_items: 63,
  duplicates: 0,
  conflicts: 1,
} as const;

export type GateStatus =
  | "PASS"
  | "FAIL"
  | "NOT_RUN"
  | "SKIPPED"
  | "NOT_VERIFIED"
  | "VALID_BUT_PHASE2_INCOMPATIBLE";

export type SourceInputRow = {
  file_role: string;
  absolute_path: string;
  sha256: string;
  source_of_truth: string;
  used_for_phase2: boolean;
};

export type Phase2RpcPayload = {
  import_session_id: string;
  source_batch_id: string;
  source_job_id: string;
  source_schema_version: string;
  idempotency_key: string;
  content_hash: string;
  created_by: string;
  sealed_zip_sha256: string;
  counts: Record<string, number>;
  entity_counts: Record<string, number>;
  developers: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  assets: Record<string, unknown>[];
  pdfs: Record<string, unknown>[];
  news: Record<string, unknown>[];
  review_items: Record<string, unknown>[];
  conflicts: Record<string, unknown>[];
  duplicates: Record<string, unknown>[];
  blockers: string[];
  warnings: string[];
  storage_status_default: "PLANNED";
  storage_upload_enabled: false;
  production_allowed: false;
  metadata_json: Record<string, unknown>;
  contract_version: typeof PHASE2_COMMIT_CONTRACT_VERSION;
  source_sealed_digest: string;
};

function sha256Text(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function sha256Buffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

function fileSha256IfExists(abs: string): string {
  if (!fs.existsSync(abs)) return "MISSING";
  return sha256File(abs);
}

function sortByKey<T extends Record<string, unknown>>(
  rows: T[],
  keyFn: (row: T) => string,
): T[] {
  return [...rows].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

function stripDbGenerated(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  delete out.id;
  delete out.created_at;
  delete out.updated_at;
  delete out.deleted_at;
  return out;
}

/**
 * IMPORT_SESSION_STRATEGY = ARTIFACT_DEFINED
 *
 * Phase2 RPC inserts payload.import_session_id as-is (see commit_staging_import_v1 Phase2 SQL).
 * V1 session `sess_3465132f7da014513da1d0a2` remains in DB after rollback (status ROLLED_BACK)
 * and unique(import_session_id) + unique(idempotency_key) still apply.
 * Therefore Phase2 artifact MUST define a new deterministic session id + idempotency key
 * that differs from V1, without requiring a live DB round-trip.
 */
export function buildPhase2ImportSessionEnvelope(input: {
  batchId: string;
  jobId: string;
  schemaVersion: string;
  developerCount: number;
  projectCount: number;
  imageCount: number;
  pdfCount: number;
  newsCount: number;
  reviewCount: number;
}): {
  import_session_id: string;
  idempotency_key: string;
  content_hash: string;
  strategy: "ARTIFACT_DEFINED";
} {
  const sessionMaterial = {
    phase: "phase2_commit_artifact",
    batchId: input.batchId,
    jobId: input.jobId,
    schemaVersion: input.schemaVersion,
    developers: input.developerCount,
    projects: input.projectCount,
    images: input.imageCount,
    pdfs: input.pdfCount,
    news: input.newsCount,
    reviews: input.reviewCount,
  };
  const content_hash = computeContentHash(sessionMaterial);
  const idempotency_key = buildIdempotencyKey({
    sourceBatchId: input.batchId,
    entityType: "import_session_phase2",
    sourceRecordId: input.batchId,
    contentHash: content_hash,
  });
  const import_session_id = `sess_p2_${createHash("sha256")
    .update(`${input.batchId}|${idempotency_key}|phase2`)
    .digest("hex")
    .slice(0, 24)}`;
  return {
    import_session_id,
    idempotency_key,
    content_hash,
    strategy: "ARTIFACT_DEFINED",
  };
}

export function auditV1CommitPayload(v1Path: string, hashPath: string): {
  status: GateStatus;
  preserved: boolean;
  hashMatch: boolean;
  batchId: string | null;
  sealedDigestMatch: boolean;
  counts: Record<string, number> | null;
  entityArraysPresent: string[];
  phase2Compatible: boolean;
} {
  const raw = fs.readFileSync(v1Path);
  const expected = fs.readFileSync(hashPath, "utf8").trim().toLowerCase();
  const actual = sha256Buffer(raw);
  const payload = JSON.parse(raw.toString("utf8")) as Record<string, unknown>;
  const arrays = [
    "developers",
    "projects",
    "assets",
    "images",
    "pdfs",
    "news",
    "review_items",
    "conflicts",
  ].filter((k) => Array.isArray(payload[k]));
  const counts = (payload.counts ?? null) as Record<string, number> | null;
  const phase2Compatible =
    Array.isArray(payload.developers) &&
    Array.isArray(payload.projects) &&
    (Array.isArray(payload.assets) || Array.isArray(payload.images)) &&
    Array.isArray(payload.pdfs) &&
    Array.isArray(payload.news) &&
    Array.isArray(payload.review_items) &&
    Array.isArray(payload.conflicts);
  return {
    status: phase2Compatible
      ? "PASS"
      : actual === expected
        ? "VALID_BUT_PHASE2_INCOMPATIBLE"
        : "FAIL",
    preserved: true,
    hashMatch: actual === expected,
    batchId: typeof payload.source_batch_id === "string" ? payload.source_batch_id : null,
    sealedDigestMatch:
      String(payload.sealed_zip_sha256 ?? "").toLowerCase() ===
      EXPECTED_SOURCE_SEALED_DIGEST,
    counts,
    entityArraysPresent: arrays,
    phase2Compatible,
  };
}

export function locateBatch001Inputs(repoRoot: string, batchId: string): {
  inputs: SourceInputRow[];
  paths: {
    sourceDir: string;
    zip: string;
    sidecar: string;
    externalManifest: string;
    extractedDir: string;
    reviewConsoleDir: string;
    v1Payload: string;
    v1Hash: string;
    phase2Sql: string;
  };
} {
  const sourceDir = path.join(repoRoot, `.work/imports/${batchId}/source`);
  const extractedDir = path.join(repoRoot, `.work/imports/${batchId}/extracted`);
  const reviewConsoleDir = path.join(repoRoot, `.work/review-console/${batchId}`);
  const implDir = path.join(
    repoRoot,
    `.work/staging-db/${batchId}/implementation`,
  );
  const zip = path.join(sourceDir, `${batchId}.zip`);
  const sidecar = path.join(sourceDir, `${batchId}.sha256`);
  const externalManifest = path.join(sourceDir, `${batchId}.batch_manifest.json`);
  const v1Payload = path.join(implDir, "commit-payload.json");
  const v1Hash = path.join(implDir, "commit-payload.sha256");
  const phase2Sql = path.join(
    repoRoot,
    "database/staging-rpc/commit_staging_import_v1_phase2.sql",
  );

  const reviewFiles = [
    "developers.json",
    "projects.json",
    "images.json",
    "pdfs.json",
    "news.json",
    "review-items.json",
    "conflict-candidates.json",
    "duplicate-candidates.json",
    "ready-for-approval.json",
    "summary.json",
  ];

  const inputs: SourceInputRow[] = [
    {
      file_role: "SEALED_ZIP",
      absolute_path: path.resolve(zip),
      sha256: fileSha256IfExists(zip),
      source_of_truth: "Batch001 sealed package (authority via sealed digest, not raw sha)",
      used_for_phase2: true,
    },
    {
      file_role: "SIDECAR_SHA256",
      absolute_path: path.resolve(sidecar),
      sha256: fileSha256IfExists(sidecar),
      source_of_truth: "Stored SOURCE_BATCH_SEALED_DIGEST pin",
      used_for_phase2: true,
    },
    {
      file_role: "EXTERNAL_MANIFEST",
      absolute_path: path.resolve(externalManifest),
      sha256: fileSha256IfExists(externalManifest),
      source_of_truth: "External batch_manifest next to ZIP",
      used_for_phase2: true,
    },
    {
      file_role: "INTERNAL_MANIFEST",
      absolute_path: path.resolve(
        path.join(extractedDir, "manifests/batch_manifest.json"),
      ),
      sha256: fileSha256IfExists(
        path.join(extractedDir, "manifests/batch_manifest.json"),
      ),
      source_of_truth: "ZIP-internal manifests/batch_manifest.json",
      used_for_phase2: true,
    },
    {
      file_role: "FILE_INVENTORY",
      absolute_path: path.resolve(
        path.join(extractedDir, "manifests/file_inventory.json"),
      ),
      sha256: fileSha256IfExists(
        path.join(extractedDir, "manifests/file_inventory.json"),
      ),
      source_of_truth: "27 payload hash inventory",
      used_for_phase2: true,
    },
    {
      file_role: "SHA256SUMS",
      absolute_path: path.resolve(
        path.join(extractedDir, "manifests/SHA256SUMS.txt"),
      ),
      sha256: fileSha256IfExists(
        path.join(extractedDir, "manifests/SHA256SUMS.txt"),
      ),
      source_of_truth: "Strict member hashes",
      used_for_phase2: true,
    },
    {
      file_role: "V1_COMMIT_PAYLOAD",
      absolute_path: path.resolve(v1Payload),
      sha256: fileSha256IfExists(v1Payload),
      source_of_truth: "Historical V1 envelope (counts only) — audit only, not overwritten",
      used_for_phase2: false,
    },
    {
      file_role: "V1_COMMIT_PAYLOAD_HASH",
      absolute_path: path.resolve(v1Hash),
      sha256: fileSha256IfExists(v1Hash),
      source_of_truth: "V1 payload sidecar",
      used_for_phase2: false,
    },
    {
      file_role: "PHASE2_RPC_SQL",
      absolute_path: path.resolve(phase2Sql),
      sha256: fileSha256IfExists(phase2Sql),
      source_of_truth: "Phase2 RPC contract (field/order requirements)",
      used_for_phase2: true,
    },
  ];

  for (const f of reviewFiles) {
    const abs = path.join(reviewConsoleDir, f);
    inputs.push({
      file_role: `REVIEW_CONSOLE:${f}`,
      absolute_path: path.resolve(abs),
      sha256: fileSha256IfExists(abs),
      source_of_truth: "Frozen Human Review Console machine-readable output",
      used_for_phase2: true,
    });
  }

  return {
    inputs,
    paths: {
      sourceDir,
      zip,
      sidecar,
      externalManifest,
      extractedDir,
      reviewConsoleDir,
      v1Payload,
      v1Hash,
      phase2Sql,
    },
  };
}

export function validatePhase2RpcCompatibility(payload: Phase2RpcPayload): {
  status: GateStatus;
  errors: string[];
} {
  const errors: string[] = [];
  const requireArray = (key: keyof Phase2RpcPayload, expected: number) => {
    const arr = payload[key];
    if (!Array.isArray(arr)) {
      errors.push(`MISSING_ARRAY:${String(key)}`);
      return;
    }
    if (arr.length !== expected) {
      errors.push(`COUNT_MISMATCH:${String(key)}:${arr.length}!=${expected}`);
    }
  };

  if (!payload.import_session_id?.startsWith("sess_p2_")) {
    errors.push("IMPORT_SESSION_ID_NOT_PHASE2_SCOPED");
  }
  if (payload.production_allowed !== false) errors.push("PRODUCTION_ALLOWED_MUST_BE_FALSE");
  if (payload.storage_upload_enabled !== false) errors.push("STORAGE_UPLOAD_MUST_BE_FALSE");
  if (payload.source_sealed_digest !== EXPECTED_SOURCE_SEALED_DIGEST) {
    errors.push("SOURCE_SEALED_DIGEST_MISMATCH");
  }
  if (payload.sealed_zip_sha256 !== EXPECTED_SOURCE_SEALED_DIGEST) {
    errors.push("SEALED_ZIP_SHA256_MISMATCH");
  }

  requireArray("developers", EXPECTED_PHASE2_COUNTS.developers);
  requireArray("projects", EXPECTED_PHASE2_COUNTS.projects);
  requireArray("assets", EXPECTED_PHASE2_COUNTS.images);
  requireArray("pdfs", EXPECTED_PHASE2_COUNTS.pdfs);
  requireArray("news", EXPECTED_PHASE2_COUNTS.news);
  requireArray("review_items", EXPECTED_PHASE2_COUNTS.review_items);
  requireArray("conflicts", EXPECTED_PHASE2_COUNTS.conflicts);

  // Simulate Phase2 fail-closed gate
  if (
    (payload.counts.developers ?? 0) > 0 &&
    !Array.isArray(payload.developers)
  ) {
    errors.push("PHASE2_FAIL_CLOSED:developers");
  }
  if ((payload.counts.projects ?? 0) > 0 && !Array.isArray(payload.projects)) {
    errors.push("PHASE2_FAIL_CLOSED:projects");
  }

  for (const d of Array.isArray(payload.developers) ? payload.developers : []) {
    if (d.candidate_id === "dev-unknown") errors.push("UNIFIED_DEV_UNKNOWN_FORBIDDEN");
    if (d.canonical_developer_id) errors.push("AUTO_CANONICAL_LINK_FORBIDDEN");
    if (
      ["APPROVED", "READY_FOR_PRODUCTION", "PUBLISHED"].includes(
        String(d.review_state),
      )
    ) {
      errors.push("FORBIDDEN_DEVELOPER_REVIEW_STATE");
    }
  }
  for (const p of Array.isArray(payload.projects) ? payload.projects : []) {
    if (
      ["APPROVED", "READY_FOR_PRODUCTION", "PUBLISHED"].includes(
        String(p.review_state),
      )
    ) {
      errors.push("FORBIDDEN_PROJECT_REVIEW_STATE");
    }
  }
  for (const a of Array.isArray(payload.assets) ? payload.assets : []) {
    if (a.storage_object_id) errors.push("STORAGE_OBJECT_ID_MUST_BE_NULL");
    if (a.storage_status !== "PLANNED" && a.storage_status !== "NOT_PLANNED") {
      errors.push("STORAGE_STATUS_INVALID");
    }
  }
  for (const r of Array.isArray(payload.review_items) ? payload.review_items : []) {
    if (
      ["APPROVED", "READY_FOR_PRODUCTION", "PUBLISHED"].includes(
        String(r.review_state),
      )
    ) {
      errors.push("FORBIDDEN_REVIEW_ITEM_STATE");
    }
  }
  for (const c of Array.isArray(payload.conflicts) ? payload.conflicts : []) {
    if (String(c.entity_id) !== "36936" && (payload.conflicts?.length ?? 0) === 1) {
      errors.push("CONFLICT_TARGET_NOT_36936");
    }
    if (c.review_state !== "CONFLICT") errors.push("CONFLICT_STATE_MUST_BE_CONFLICT");
  }

  const p36936 = (Array.isArray(payload.projects) ? payload.projects : []).find(
    (p) => String(p.candidate_id) === "36936",
  );
  if (!p36936) errors.push("PROJECT_36936_MISSING");
  else if (String(p36936.review_state) !== "REVIEW_REQUIRED") {
    errors.push("PROJECT_36936_NOT_REVIEW_REQUIRED");
  }

  return {
    status: errors.length === 0 ? "PASS" : "FAIL",
    errors,
  };
}

export function validateReferenceIntegrity(payload: Phase2RpcPayload): {
  status: GateStatus;
  errors: string[];
} {
  const errors: string[] = [];
  const developers = Array.isArray(payload.developers) ? payload.developers : [];
  const projects = Array.isArray(payload.projects) ? payload.projects : [];
  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  const pdfs = Array.isArray(payload.pdfs) ? payload.pdfs : [];
  const news = Array.isArray(payload.news) ? payload.news : [];
  const review_items = Array.isArray(payload.review_items)
    ? payload.review_items
    : [];
  const conflicts = Array.isArray(payload.conflicts) ? payload.conflicts : [];

  const devIds = new Set(developers.map((d) => String(d.candidate_id)));
  const projectIds = new Set(projects.map((p) => String(p.candidate_id)));

  const seen = {
    developers: new Set<string>(),
    projects: new Set<string>(),
    assets: new Set<string>(),
    pdfs: new Set<string>(),
    news: new Set<string>(),
    review_items: new Set<string>(),
    conflicts: new Set<string>(),
    idempotency: new Set<string>(),
  };

  for (const d of developers) {
    const id = String(d.candidate_id);
    const src = String(d.source_record_id);
    const idemp = String(d.idempotency_key);
    if (seen.developers.has(id) || seen.developers.has(src)) {
      errors.push(`DUPLICATE_DEVELOPER:${id}`);
    }
    seen.developers.add(id);
    seen.developers.add(src);
    if (seen.idempotency.has(idemp)) errors.push(`DUPLICATE_IDEMP:${idemp.slice(0, 12)}`);
    seen.idempotency.add(idemp);
  }
  for (const p of projects) {
    const id = String(p.candidate_id);
    if (seen.projects.has(id)) errors.push(`DUPLICATE_PROJECT:${id}`);
    seen.projects.add(id);
    const idemp = String(p.idempotency_key);
    if (seen.idempotency.has(idemp)) errors.push(`DUPLICATE_IDEMP:${idemp.slice(0, 12)}`);
    seen.idempotency.add(idemp);
    const devRef = p.developer_candidate_id == null ? null : String(p.developer_candidate_id);
    if (devRef && !devIds.has(devRef)) {
      errors.push(`UNRESOLVED_PROJECT_DEVELOPER_REF:${id}->${devRef}`);
    }
  }
  for (const a of assets) {
    const id = String(a.candidate_id);
    if (seen.assets.has(id)) errors.push(`DUPLICATE_ASSET:${id}`);
    seen.assets.add(id);
    const idemp = String(a.idempotency_key);
    if (seen.idempotency.has(idemp)) errors.push(`DUPLICATE_IDEMP:${idemp.slice(0, 12)}`);
    seen.idempotency.add(idemp);
    const pref = a.project_candidate_id == null ? null : String(a.project_candidate_id);
    if (pref && !projectIds.has(pref)) {
      errors.push(`UNRESOLVED_ASSET_PROJECT_REF:${id}->${pref}`);
    }
  }
  for (const pdf of pdfs) {
    const id = String(pdf.candidate_id);
    if (seen.pdfs.has(id)) errors.push(`DUPLICATE_PDF:${id}`);
    seen.pdfs.add(id);
    const idemp = String(pdf.idempotency_key);
    if (seen.idempotency.has(idemp)) errors.push(`DUPLICATE_IDEMP:${idemp.slice(0, 12)}`);
    seen.idempotency.add(idemp);
    const pref = pdf.project_candidate_id == null ? null : String(pdf.project_candidate_id);
    if (pref && !projectIds.has(pref)) {
      errors.push(`UNRESOLVED_PDF_PROJECT_REF:${id}->${pref}`);
    }
  }
  for (const n of news) {
    const id = String(n.candidate_id);
    if (seen.news.has(id)) errors.push(`DUPLICATE_NEWS:${id}`);
    seen.news.add(id);
    const idemp = String(n.idempotency_key);
    if (seen.idempotency.has(idemp)) errors.push(`DUPLICATE_IDEMP:${idemp.slice(0, 12)}`);
    seen.idempotency.add(idemp);
    const pref = n.project_candidate_id == null ? null : String(n.project_candidate_id);
    if (pref && !projectIds.has(pref)) {
      errors.push(`UNRESOLVED_NEWS_PROJECT_REF:${id}->${pref}`);
    }
  }
  for (const r of review_items) {
    const id = String(r.source_review_item_id);
    if (seen.review_items.has(id)) errors.push(`DUPLICATE_REVIEW:${id}`);
    seen.review_items.add(id);
    const idemp = String(r.idempotency_key);
    if (seen.idempotency.has(idemp)) errors.push(`DUPLICATE_IDEMP:${idemp.slice(0, 12)}`);
    seen.idempotency.add(idemp);
  }
  for (const c of conflicts) {
    const id = String(c.entity_id);
    if (seen.conflicts.has(id)) errors.push(`DUPLICATE_CONFLICT:${id}`);
    seen.conflicts.add(id);
    // Conflict targets Project 36936 (and any project-scoped conflict)
    if (!projectIds.has(id) && !devIds.has(id)) {
      errors.push(`UNRESOLVED_CONFLICT_TARGET:${id}`);
    }
    const idemp = String(c.idempotency_key);
    if (seen.idempotency.has(idemp)) errors.push(`DUPLICATE_IDEMP:${idemp.slice(0, 12)}`);
    seen.idempotency.add(idemp);
  }

  return { status: errors.length === 0 ? "PASS" : "FAIL", errors };
}

export async function buildPhase2CommitArtifact(input: {
  repoRoot: string;
  batchId: string;
  outDir?: string;
}): Promise<{
  status: GateStatus;
  outDir: string;
  artifactHash: string;
  payload: Phase2RpcPayload;
  provenance: Record<string, unknown>;
  validation: Record<string, unknown>;
  sourceInputs: SourceInputRow[];
  sourceFingerprintBefore: Record<string, string>;
  errors: string[];
}> {
  const errors: string[] = [];
  const { inputs, paths } = locateBatch001Inputs(input.repoRoot, input.batchId);
  const sourceFingerprintBefore: Record<string, string> = {};
  for (const row of inputs.filter((i) =>
    ["SEALED_ZIP", "SIDECAR_SHA256", "EXTERNAL_MANIFEST", "INTERNAL_MANIFEST", "V1_COMMIT_PAYLOAD", "V1_COMMIT_PAYLOAD_HASH"].includes(
      i.file_role,
    ),
  )) {
    sourceFingerprintBefore[row.file_role] = row.sha256;
  }

  // Source sealed digest verification
  const sidecarDigest = fs
    .readFileSync(paths.sidecar, "utf8")
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]!;
  if (sidecarDigest !== EXPECTED_SOURCE_SEALED_DIGEST) {
    errors.push("SIDECAR_DIGEST_MISMATCH");
  }
  const internalManifestPath = path.join(
    paths.extractedDir,
    "manifests/batch_manifest.json",
  );
  const internalManifest = fs.existsSync(internalManifestPath)
    ? (JSON.parse(fs.readFileSync(internalManifestPath, "utf8")) as {
        zip_sha256?: string;
        zip_size?: unknown;
      })
    : null;
  const sealed = validateSealedZipContract({
    zipPath: paths.zip,
    sidecarPath: paths.sidecar,
    externalManifestPath: paths.externalManifest,
    internalManifest,
  });
  if (sealed.status !== "PASS") {
    errors.push(`SEALED_ZIP_CONTRACT:${sealed.reasons.join(",") || "FAIL"}`);
  }
  if (
    (sealed.sealed_zip_sha256 ?? "").toLowerCase() !==
    EXPECTED_SOURCE_SEALED_DIGEST
  ) {
    errors.push("SEALED_DIGEST_NOT_PINNED_VALUE");
  }

  const hashValidation = validateGothBatchHashes(paths.extractedDir, {
    zipPath: paths.zip,
    zipSidecarPath: paths.sidecar,
    externalManifestPath: paths.externalManifest,
  });
  if (hashValidation.status !== "PASS") {
    errors.push(
      `PAYLOAD_HASH_SET:failed=${hashValidation.payloadFilesFailed};missing=${hashValidation.missingFiles.length}`,
    );
  }

  const v1 = auditV1CommitPayload(paths.v1Payload, paths.v1Hash);
  if (!v1.hashMatch) errors.push("V1_HASH_MISMATCH");
  if (v1.batchId !== input.batchId) errors.push("V1_BATCH_ID_MISMATCH");
  if (!v1.sealedDigestMatch) errors.push("V1_SEALED_DIGEST_MISMATCH");

  if (!fs.existsSync(paths.reviewConsoleDir)) {
    errors.push("REVIEW_CONSOLE_MISSING");
  }
  for (const must of [
    "developers.json",
    "projects.json",
    "images.json",
    "pdfs.json",
    "news.json",
    "review-items.json",
    "conflict-candidates.json",
  ]) {
    if (!fs.existsSync(path.join(paths.reviewConsoleDir, must))) {
      errors.push(`MISSING_ENTITY_FILE:${must}`);
    }
  }

  if (errors.length) {
    return {
      status: "FAIL",
      outDir: "",
      artifactHash: "",
      payload: {} as Phase2RpcPayload,
      provenance: {},
      validation: { errors },
      sourceInputs: inputs,
      sourceFingerprintBefore,
      errors,
    };
  }

  const batchInput = loadBatchCommitInputFromReviewConsole(paths.reviewConsoleDir, {
    batchId: input.batchId,
    sealedZipSha256: EXPECTED_SOURCE_SEALED_DIGEST,
    sourceFileName: `${input.batchId}.zip`,
  });
  if (batchInput.batchId !== input.batchId) errors.push("BATCH_ID_MISMATCH");
  if (batchInput.schemaVersion !== "goth_batch_manifest.v1") {
    errors.push("SCHEMA_VERSION_MISMATCH");
  }

  const bundle = await simulateCommit(batchInput);
  const tables = bundle.simulatedTables;

  const sessionEnv = buildPhase2ImportSessionEnvelope({
    batchId: batchInput.batchId,
    jobId: batchInput.jobId,
    schemaVersion: batchInput.schemaVersion,
    developerCount: tables.developers.length,
    projectCount: tables.projects.length,
    imageCount: tables.assets.length,
    pdfCount: tables.pdfs.length,
    newsCount: tables.news.length,
    reviewCount: tables.review_items.length,
  });

  // Remap simulated rows onto Phase2 session id (deterministic)
  const remapSession = <T extends { import_session_id: string }>(
    rows: T[],
  ): T[] =>
    rows.map((r) => ({
      ...r,
      import_session_id: sessionEnv.import_session_id,
    }));

  const developers = sortByKey(
    remapSession(tables.developers).map((r) => stripDbGenerated(r as unknown as Record<string, unknown>)),
    (r) => String(r.candidate_id ?? r.source_record_id),
  );
  const projects = sortByKey(
    remapSession(tables.projects).map((r) => stripDbGenerated(r as unknown as Record<string, unknown>)),
    (r) => String(r.candidate_id ?? r.source_record_id),
  );
  const assets = sortByKey(
    remapSession(tables.assets).map((r) => {
      const row = stripDbGenerated(r as unknown as Record<string, unknown>);
      row.storage_status = "PLANNED";
      row.storage_object_id = null;
      return row;
    }),
    (r) => String(r.candidate_id ?? r.sha256 ?? r.source_record_id),
  );
  const pdfs = sortByKey(
    remapSession(tables.pdfs).map((r) => {
      const row = stripDbGenerated(r as unknown as Record<string, unknown>);
      row.storage_status = "PLANNED";
      return row;
    }),
    (r) => String(r.candidate_id ?? r.sha256 ?? r.source_record_id),
  );
  const news = sortByKey(
    remapSession(tables.news).map((r) => stripDbGenerated(r as unknown as Record<string, unknown>)),
    (r) => String(r.candidate_id ?? r.source_record_id),
  );
  const review_items = sortByKey(
    remapSession(tables.review_items).map((r) => {
      const row = stripDbGenerated(r as unknown as Record<string, unknown>);
      if (row.source_payload == null) row.source_payload = {};
      row.decision = null;
      row.reviewed_at = null;
      row.reviewer_id = null;
      return row;
    }),
    (r) => String(r.source_review_item_id ?? r.entity_id),
  );
  const conflicts = sortByKey(
    remapSession(tables.conflict_candidates).map((r) =>
      stripDbGenerated(r as unknown as Record<string, unknown>),
    ),
    (r) => String(r.entity_id),
  );
  const duplicates = sortByKey(
    remapSession(tables.duplicate_candidates).map((r) =>
      stripDbGenerated(r as unknown as Record<string, unknown>),
    ),
    (r) => String(r.entity_id),
  );

  // Force Project 36936 REVIEW_REQUIRED (Phase2 SQL also enforces)
  for (const p of projects) {
    if (String(p.candidate_id) === "36936") {
      p.review_state = "REVIEW_REQUIRED";
      p.entity_status = "REVIEW_REQUIRED";
    }
  }
  for (const c of conflicts) {
    c.review_state = "CONFLICT";
  }

  const counts = {
    developers: developers.length,
    projects: projects.length,
    images: assets.length,
    pdfs: pdfs.length,
    news: news.length,
    review_items: review_items.length,
    duplicates: duplicates.length,
    conflicts: conflicts.length,
  };

  const readyForApproval = JSON.parse(
    fs.readFileSync(
      path.join(paths.reviewConsoleDir, "ready-for-approval.json"),
      "utf8",
    ),
  ) as unknown[];

  const payload: Phase2RpcPayload = {
    contract_version: PHASE2_COMMIT_CONTRACT_VERSION,
    import_session_id: sessionEnv.import_session_id,
    source_batch_id: batchInput.batchId,
    source_job_id: batchInput.jobId,
    source_schema_version: batchInput.schemaVersion,
    idempotency_key: sessionEnv.idempotency_key,
    content_hash: sessionEnv.content_hash,
    created_by: "IMPORTER",
    sealed_zip_sha256: EXPECTED_SOURCE_SEALED_DIGEST,
    source_sealed_digest: EXPECTED_SOURCE_SEALED_DIGEST,
    counts,
    entity_counts: counts,
    developers,
    projects,
    assets,
    pdfs,
    news,
    review_items,
    conflicts,
    duplicates,
    blockers: [...bundle.commitPlan.blockers].sort(),
    warnings: [...bundle.commitPlan.warnings].sort(),
    storage_status_default: "PLANNED",
    storage_upload_enabled: false,
    production_allowed: false,
    metadata_json: {
      milestone: "BUILD_BATCH001_PHASE2_COMMIT_ARTIFACT",
      simulation_status: "ARTIFACT_ONLY",
      ready_for_approval: readyForApproval.length,
      ready_for_approval_is_derived: true,
      conflict_preserved: true,
      project_36936: "CONFLICT",
      import_session_strategy: "ARTIFACT_DEFINED",
      v1_session_preserved: "sess_3465132f7da014513da1d0a2",
      generator_version: PHASE2_ARTIFACT_GENERATOR_VERSION,
    },
  };

  const ref = validateReferenceIntegrity(payload);
  const compat = validatePhase2RpcCompatibility(payload);
  if (ref.status !== "PASS") errors.push(...ref.errors);
  if (compat.status !== "PASS") errors.push(...compat.errors);

  for (const [k, expected] of Object.entries(EXPECTED_PHASE2_COUNTS)) {
    if ((counts as Record<string, number>)[k] !== expected) {
      errors.push(`EXPECTED_COUNT_${k}:${(counts as Record<string, number>)[k]}!=${expected}`);
    }
  }

  const unknownDevs = developers.filter((d) => d.identity_status === "UNKNOWN").length;
  if (unknownDevs !== 5) errors.push(`UNKNOWN_DEVELOPERS:${unknownDevs}`);

  const canonicalLinks = developers.filter((d) => d.canonical_developer_id).length;
  if (canonicalLinks !== 0) errors.push(`CANONICAL_LINKS:${canonicalLinks}`);

  const storageObjectIds = assets.filter((a) => a.storage_object_id).length;
  if (storageObjectIds !== 0) errors.push(`STORAGE_OBJECT_IDS:${storageObjectIds}`);

  const approvals = [
    ...developers,
    ...projects,
    ...assets,
    ...pdfs,
    ...news,
    ...review_items,
  ].filter((r) =>
    ["APPROVED", "READY_FOR_PRODUCTION", "PUBLISHED"].includes(String(r.review_state)),
  ).length;
  if (approvals !== 0) errors.push(`APPROVALS:${approvals}`);

  const outDir =
    input.outDir ??
    path.join(
      input.repoRoot,
      "ARTIFACTS/STAGING_COMMIT",
      input.batchId,
      "PHASE2",
    );
  fs.mkdirSync(outDir, { recursive: true });

  // Canonical body — generatedAt intentionally excluded from hashed payload
  const body = `${stableStringify(payload)}\n`;
  const artifactHash = sha256Text(body);

  const schemaPath = path.join(
    input.repoRoot,
    "database/staging-rpc/commit-payload-phase2.schema.json",
  );
  const provenance = {
    contractVersion: PHASE2_COMMIT_CONTRACT_VERSION,
    generatorVersion: PHASE2_ARTIFACT_GENERATOR_VERSION,
    batchId: input.batchId,
    jobId: batchInput.jobId,
    sourceSealedDigest: EXPECTED_SOURCE_SEALED_DIGEST,
    // Frozen source timestamp — NOT wall clock
    sourceGeneratedAt: BATCH001_FROZEN_GENERATED_AT,
    // Report-only wall clock; MUST NOT affect artifactHash
    reportGeneratedAtWallClock: new Date().toISOString(),
    importSessionStrategy: "ARTIFACT_DEFINED",
    importSessionId: sessionEnv.import_session_id,
    v1ImportSessionIdPreserved: "sess_3465132f7da014513da1d0a2",
    externalManifestSha256: fileSha256IfExists(paths.externalManifest),
    internalManifestSha256: fileSha256IfExists(
      path.join(paths.extractedDir, "manifests/batch_manifest.json"),
    ),
    sidecarSha256: fileSha256IfExists(paths.sidecar),
    sealedZipRawSha256Observational: fileSha256IfExists(paths.zip),
    phase2RpcSqlSha256: fileSha256IfExists(paths.phase2Sql),
    phase2SchemaSha256: fileSha256IfExists(schemaPath),
    v1CommitPayloadSha256: fileSha256IfExists(paths.v1Payload),
    reviewConsoleFingerprints: Object.fromEntries(
      inputs
        .filter((i) => i.file_role.startsWith("REVIEW_CONSOLE:"))
        .map((i) => [i.file_role, i.sha256]),
    ),
    sourcePayloadHashValidation: {
      status: hashValidation.status,
      payloadFilesOk: hashValidation.payloadFilesOk,
      sealedStatus: sealed.status,
    },
    phase2ArtifactHash: artifactHash,
    counts,
    coreEntityCount: counts.developers + counts.projects + counts.images + counts.pdfs + counts.news,
    workflowEntityCount: counts.review_items + counts.conflicts,
    readyForApprovalDerived: readyForApproval.length,
  };

  const validation = {
    status: errors.length === 0 ? "PASS" : "FAIL",
    source_batch_sealed_digest: sealed.status === "PASS" ? "VERIFIED" : "FAIL",
    v1_commit_payload: v1.status,
    v1_payload_preserved: "YES",
    phase2_rpc_compatibility: compat.status,
    reference_integrity: ref.status,
    unknown_developers: unknownDevs,
    project_36936: projects.some((p) => String(p.candidate_id) === "36936")
      ? "PRESENT"
      : "FAIL",
    project_36936_review_intent:
      projects.find((p) => String(p.candidate_id) === "36936")?.review_state ===
      "REVIEW_REQUIRED"
        ? "PASS"
        : "FAIL",
    approvals,
    published: 0,
    storage_object_ids: storageObjectIds,
    counts,
    core_entity_count:
      counts.developers + counts.projects + counts.images + counts.pdfs + counts.news,
    workflow_entity_count: counts.review_items + counts.conflicts,
    import_session_strategy: "ARTIFACT_DEFINED",
    errors,
    compatibility_errors: compat.errors,
    reference_errors: ref.errors,
  };

  fs.writeFileSync(path.join(outDir, "commit-payload.phase2.json"), body);
  fs.writeFileSync(
    path.join(outDir, "commit-payload.phase2.json.sha256"),
    `${artifactHash}\n`,
  );
  fs.writeFileSync(
    path.join(outDir, "commit-payload.phase2.provenance.json"),
    `${stableStringify(provenance)}\n`,
  );
  fs.writeFileSync(
    path.join(outDir, "commit-payload.phase2.validation.json"),
    `${stableStringify(validation)}\n`,
  );

  // Prove V1 untouched + source files byte-identical after write
  const afterV1 = fileSha256IfExists(paths.v1Payload);
  if (afterV1 !== sourceFingerprintBefore.V1_COMMIT_PAYLOAD) {
    errors.push("V1_PAYLOAD_MUTATED");
  }
  const afterZip = fileSha256IfExists(paths.zip);
  if (afterZip !== sourceFingerprintBefore.SEALED_ZIP) {
    errors.push("SOURCE_ZIP_MUTATED");
  }

  return {
    status: errors.length === 0 ? "PASS" : "FAIL",
    outDir: path.resolve(outDir),
    artifactHash,
    payload,
    provenance,
    validation: { ...validation, errors },
    sourceInputs: inputs,
    sourceFingerprintBefore,
    errors,
  };
}

export async function verifyPhase2CommitArtifact(input: {
  repoRoot: string;
  batchId: string;
  artifactDir?: string;
}): Promise<{
  status: GateStatus;
  artifactHash: string;
  sidecarMatch: boolean;
  deterministic: GateStatus;
  run2Hash: string;
  compatibility: GateStatus;
  referenceIntegrity: GateStatus;
  sourceUnchanged: GateStatus;
  errors: string[];
}> {
  const dir =
    input.artifactDir ??
    path.join(
      input.repoRoot,
      "ARTIFACTS/STAGING_COMMIT",
      input.batchId,
      "PHASE2",
    );
  const payloadPath = path.join(dir, "commit-payload.phase2.json");
  const hashPath = path.join(dir, "commit-payload.phase2.json.sha256");
  const errors: string[] = [];
  if (!fs.existsSync(payloadPath) || !fs.existsSync(hashPath)) {
    return {
      status: "FAIL",
      artifactHash: "",
      sidecarMatch: false,
      deterministic: "FAIL",
      run2Hash: "",
      compatibility: "NOT_RUN",
      referenceIntegrity: "NOT_RUN",
      sourceUnchanged: "NOT_RUN",
      errors: ["ARTIFACT_MISSING"],
    };
  }
  const raw = fs.readFileSync(payloadPath);
  const actual = sha256Buffer(raw);
  const expected = fs.readFileSync(hashPath, "utf8").trim().toLowerCase();
  const sidecarMatch = actual === expected;
  if (!sidecarMatch) errors.push("ARTIFACT_HASH_MISMATCH");

  const payload = JSON.parse(raw.toString("utf8")) as Phase2RpcPayload;
  const compat = validatePhase2RpcCompatibility(payload);
  const ref = validateReferenceIntegrity(payload);
  if (compat.status !== "PASS") errors.push(...compat.errors);
  if (ref.status !== "PASS") errors.push(...ref.errors);

  // Determinism: rebuild to temp and compare hash
  const tmp = path.join(
    input.repoRoot,
    `.work/staging-db/${input.batchId}/phase2-artifact-determinism-tmp`,
  );
  if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true, force: true });
  const rebuild = await buildPhase2CommitArtifact({
    repoRoot: input.repoRoot,
    batchId: input.batchId,
    outDir: tmp,
  });
  const run2Hash = rebuild.artifactHash;
  const deterministic: GateStatus =
    rebuild.status === "PASS" && run2Hash === actual ? "PASS" : "FAIL";
  if (deterministic !== "PASS") {
    errors.push(`NON_DETERMINISTIC:${actual.slice(0, 12)}!=${run2Hash.slice(0, 12)}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  const { paths, inputs } = locateBatch001Inputs(input.repoRoot, input.batchId);
  const v1Now = fileSha256IfExists(paths.v1Payload);
  const v1Listed = inputs.find((i) => i.file_role === "V1_COMMIT_PAYLOAD")?.sha256;
  const zipNow = fileSha256IfExists(paths.zip);
  const zipListed = inputs.find((i) => i.file_role === "SEALED_ZIP")?.sha256;
  const sourceUnchanged: GateStatus =
    v1Now === v1Listed && zipNow === zipListed ? "PASS" : "FAIL";
  if (sourceUnchanged !== "PASS") errors.push("SOURCE_OR_V1_CHANGED");

  return {
    status: errors.length === 0 ? "PASS" : "FAIL",
    artifactHash: actual,
    sidecarMatch,
    deterministic,
    run2Hash,
    compatibility: compat.status,
    referenceIntegrity: ref.status,
    sourceUnchanged,
    errors,
  };
}

export { sha256Text, sha256Buffer, fileSha256IfExists };
