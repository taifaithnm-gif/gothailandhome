/**
 * In-memory commit simulator for Batch001 (and compatible review-console outputs).
 * SIMULATED_ONLY — never writes DB or Storage.
 */

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { MockStagingRepository } from "./mock-repository.ts";
import {
  buildIdempotencyKey,
  computeContentHash,
  evaluateIdempotency,
  summarizeIdempotency,
  type IdempotencyEvaluateResult,
} from "./idempotency.ts";
import { buildAuditEvent } from "./audit-repository.ts";
import {
  assertAllowedStagingReviewState,
  assertAutomationCannotApproveOrPublish,
} from "./review-repository.ts";
import { planStorageItem, buildStoragePlanDocument } from "./storage-plan.ts";
import { buildRollbackPlan } from "./rollback-plan.ts";
import {
  buildTransactionPlan,
  runSimulatedBatchTransaction,
  realCommit,
} from "./transaction.ts";
import {
  buildCommitPlanDocument,
  simulationResultFromPlan,
  type CommitPlanDocument,
} from "./commit-plan.ts";
import { assertStagingWriteAllowed } from "./environment-guard.ts";
import { assertSessionSimulationCeiling } from "./import-session-repository.ts";
import { normalizeHexHash } from "./idempotency.ts";
import { stableStringify } from "./environment-guard.ts";
import type {
  CommitOperation,
  StagingAsset,
  StagingAuditEvent,
  StagingConflictCandidate,
  StagingDeveloper,
  StagingDuplicateCandidate,
  StagingImportSession,
  StagingNews,
  StagingPdf,
  StagingProject,
  StagingReviewItem,
  StagingReviewState,
  ConfidenceLevel,
  DeveloperIdentityStatus,
  SimulationResult,
} from "./types.ts";
import { STAGING_DB_HARD_FLAGS } from "./types.ts";

const FIXED_AT = "2026-07-25T03:00:00.000Z";

type JsonRecord = Record<string, unknown>;

export type BatchCommitInput = {
  batchId: string;
  jobId: string;
  schemaVersion: string;
  sealedZipSha256?: string | null;
  rawZipSha256?: string | null;
  sourceFileName?: string | null;
  sourceFileSize?: number | null;
  developers: JsonRecord[];
  projects: JsonRecord[];
  images: JsonRecord[];
  pdfs: JsonRecord[];
  news: JsonRecord[];
  reviewItems: JsonRecord[];
  duplicates: JsonRecord[];
  conflicts: JsonRecord[];
  readyForApproval: JsonRecord[];
};

export type CommitSimulationBundle = {
  status: "SIMULATED_ONLY";
  commitPlan: CommitPlanDocument;
  simulationResult: SimulationResult;
  simulatedTables: ReturnType<MockStagingRepository["snapshot"]>;
  auditEvents: StagingAuditEvent[];
  storagePlan: ReturnType<typeof buildStoragePlanDocument>;
  rollbackPlan: ReturnType<typeof buildRollbackPlan>;
  transactionPlan: ReturnType<typeof buildTransactionPlan>;
  idempotencyPlan: ReturnType<typeof summarizeIdempotency> & {
    results: IdempotencyEvaluateResult[];
  };
  schemaPlan: Record<string, unknown>;
  flags: typeof STAGING_DB_HARD_FLAGS;
  database_writes: 0;
  storage_uploads: 0;
};

function asString(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

function asConfidence(v: unknown): ConfidenceLevel {
  const s = asString(v, "UNKNOWN").toUpperCase();
  if (s === "HIGH" || s === "MEDIUM" || s === "LOW" || s === "UNKNOWN") {
    return s;
  }
  return "UNKNOWN";
}

function mapIdentity(v: unknown): DeveloperIdentityStatus {
  const s = asString(v, "UNKNOWN").toUpperCase();
  if (
    s === "VERIFIED" ||
    s === "RESOLVED" ||
    s === "UNKNOWN" ||
    s === "CONFLICT" ||
    s === "DUPLICATE_CANDIDATE"
  ) {
    return s;
  }
  if (s === "KNOWN") return "RESOLVED";
  if (s === "CANDIDATE") return "UNKNOWN";
  return "UNKNOWN";
}

function mapReviewState(v: unknown): StagingReviewState {
  const s = asString(v, "REVIEW_REQUIRED");
  if (s === "APPROVED" || s === "READY_FOR_PRODUCTION" || s === "PUBLISHED") {
    assertAutomationCannotApproveOrPublish(s);
  }
  return assertAllowedStagingReviewState(
    s === "ACCEPT_CANDIDATE" ? "READY_FOR_APPROVAL" : s,
  );
}

function internalId(prefix: string, material: string): string {
  const h = createHash("sha256").update(material).digest("hex").slice(0, 24);
  return `${prefix}_${h}`;
}

function stripAbsolutePaths(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(value)) {
      return path.basename(value.replace(/\\/g, "/"));
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(stripAbsolutePaths);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stripAbsolutePaths(v);
    }
    return out;
  }
  return value;
}

export function loadBatchCommitInputFromReviewConsole(
  reviewConsoleDir: string,
  options: {
    batchId?: string;
    jobId?: string;
    schemaVersion?: string;
    sealedZipSha256?: string | null;
    rawZipSha256?: string | null;
    sourceFileName?: string | null;
    sourceFileSize?: number | null;
  } = {},
): BatchCommitInput {
  const read = (name: string): unknown => {
    const p = path.join(reviewConsoleDir, name);
    return JSON.parse(fs.readFileSync(p, "utf8")) as unknown;
  };
  const summary = read("summary.json") as JsonRecord;
  return {
    batchId:
      options.batchId ??
      asString(summary.batchId, "BATCH-GTH-20260724-001"),
    jobId:
      options.jobId ?? asString(summary.jobId, "JOB-GTH-DISCOVERY-20260724-001"),
    schemaVersion: options.schemaVersion ?? "goth_batch_manifest.v1",
    sealedZipSha256: options.sealedZipSha256 ?? null,
    rawZipSha256: options.rawZipSha256 ?? null,
    sourceFileName: options.sourceFileName ?? null,
    sourceFileSize: options.sourceFileSize ?? null,
    developers: read("developers.json") as JsonRecord[],
    projects: read("projects.json") as JsonRecord[],
    images: read("images.json") as JsonRecord[],
    pdfs: read("pdfs.json") as JsonRecord[],
    news: read("news.json") as JsonRecord[],
    reviewItems: read("review-items.json") as JsonRecord[],
    duplicates: read("duplicate-candidates.json") as JsonRecord[],
    conflicts: read("conflict-candidates.json") as JsonRecord[],
    readyForApproval: read("ready-for-approval.json") as JsonRecord[],
  };
}

export async function simulateCommit(
  input: BatchCommitInput,
  options: {
    failAtPhase?: Parameters<typeof runSimulatedBatchTransaction>[2] extends (
      infer O
    )
      ? O extends { failAtPhase?: infer F }
        ? F
        : never
      : never;
    existingSameBatchFingerprints?: Map<string, { contentHash: string }>;
  } = {},
): Promise<CommitSimulationBundle> {
  assertStagingWriteAllowed({ simulation: true });

  const repo = new MockStagingRepository();
  const ops: CommitOperation[] = [];
  const idempotencyResults: IdempotencyEvaluateResult[] = [];
  const auditEvents: StagingAuditEvent[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  let auditSeq = 0;
  const nextAuditId = (label: string) => {
    auditSeq += 1;
    return `audit_${String(auditSeq).padStart(4, "0")}_${createHash("sha256").update(label).digest("hex").slice(0, 8)}`;
  };

  const sessionMaterial = {
    batchId: input.batchId,
    jobId: input.jobId,
    schemaVersion: input.schemaVersion,
    developers: input.developers.length,
    projects: input.projects.length,
    images: input.images.length,
    pdfs: input.pdfs.length,
    news: input.news.length,
    reviews: input.reviewItems.length,
  };
  const sessionContentHash = computeContentHash(sessionMaterial);
  const sessionIdempotency = buildIdempotencyKey({
    sourceBatchId: input.batchId,
    entityType: "import_session",
    sourceRecordId: input.batchId,
    contentHash: sessionContentHash,
  });
  const importSessionId = internalId("sess", `${input.batchId}|${sessionIdempotency}`);

  const importSession: StagingImportSession = {
    id: internalId("row", importSessionId),
    import_session_id: importSessionId,
    source_batch_id: input.batchId,
    source_job_id: input.jobId,
    source_schema_version: input.schemaVersion,
    sealed_zip_sha256: input.sealedZipSha256
      ? normalizeHexHash(input.sealedZipSha256)
      : null,
    raw_zip_sha256: input.rawZipSha256
      ? normalizeHexHash(input.rawZipSha256)
      : null,
    source_file_name: input.sourceFileName ?? null,
    source_file_size: input.sourceFileSize ?? null,
    status: "READY_FOR_COMMIT",
    phase: "commit_plan",
    dry_run: true,
    staging_only: true,
    production_allowed: false,
    database_write_allowed: false,
    storage_write_allowed: false,
    started_at: FIXED_AT,
    completed_at: null,
    failed_at: null,
    created_by: "IMPORTER",
    created_at: FIXED_AT,
    updated_at: FIXED_AT,
    idempotency_key: sessionIdempotency,
    content_hash: sessionContentHash,
    error_code: null,
    error_message: null,
    metadata_json: {
      simulation: true,
      ready_for_approval_count: input.readyForApproval.length,
    },
  };
  assertSessionSimulationCeiling(importSession.status);

  const developers: StagingDeveloper[] = [];
  const projects: StagingProject[] = [];
  const assets: StagingAsset[] = [];
  const pdfs: StagingPdf[] = [];
  const newsRows: StagingNews[] = [];
  const reviews: StagingReviewItem[] = [];
  const duplicates: StagingDuplicateCandidate[] = [];
  const conflicts: StagingConflictCandidate[] = [];

  // Developers
  for (const d of input.developers) {
    const candidateId = asString(d.id);
    const sourceRecordId = asString(
      (d.provenance as JsonRecord | undefined)?.sourceRecordId ??
        d.sourceId ??
        candidateId,
    );
    if (sourceRecordId === "dev-unknown" || candidateId === "dev-unknown") {
      warnings.push(
        `Developer ${candidateId} must keep stable candidate_id (not unified dev-unknown)`,
      );
    }
    const identity = mapIdentity(d.identityStatus);
    const payload = stripAbsolutePaths({
      candidateId,
      name: d.name,
      normalizedName: d.normalizedName,
      aliases: d.aliases,
      officialWebsite: d.officialWebsite,
      identityStatus: identity,
    });
    const contentHash = computeContentHash(payload);
    const existing = options.existingSameBatchFingerprints?.get(
      `developer:${sourceRecordId}`,
    );
    const idemp = evaluateIdempotency({
      sourceBatchId: input.batchId,
      entityType: "developer",
      sourceRecordId,
      contentHash,
      existingSameBatch: existing
        ? {
            sourceBatchId: input.batchId,
            entityType: "developer",
            sourceRecordId,
            contentHash: existing.contentHash,
            idempotencyKey: buildIdempotencyKey({
              sourceBatchId: input.batchId,
              entityType: "developer",
              sourceRecordId,
              contentHash: existing.contentHash,
            }),
          }
        : null,
    });
    idempotencyResults.push(idemp);

    const reviewState = mapReviewState(d.reviewState ?? "REVIEW_REQUIRED");
    const row: StagingDeveloper = {
      id: internalId("dev", `${input.batchId}|${candidateId}`),
      import_session_id: importSessionId,
      source_batch_id: input.batchId,
      source_job_id: input.jobId,
      source_record_id: sourceRecordId,
      source_schema: input.schemaVersion,
      entity_status: "REVIEW_REQUIRED",
      review_state: reviewState,
      confidence: asConfidence(d.confidence),
      evidence_json: stripAbsolutePaths(d.evidence ?? []),
      raw_payload_json: stripAbsolutePaths(d.rawPayload ?? d),
      normalized_payload_json: payload,
      content_hash: contentHash,
      idempotency_key: idemp.idempotency_key,
      created_at: FIXED_AT,
      updated_at: FIXED_AT,
      deleted_at: null,
      candidate_id: candidateId,
      name: asString(d.name),
      normalized_name: asString(d.normalizedName, asString(d.name)),
      aliases_json: Array.isArray(d.aliases)
        ? (d.aliases as string[])
        : [],
      official_website:
        d.officialWebsite == null ? null : asString(d.officialWebsite),
      official_website_verified: Boolean(d.officialWebsiteVerified),
      identity_status: identity,
      resolution_method:
        d.resolutionMethod == null ? null : asString(d.resolutionMethod),
      dns_status: d.dnsStatus == null ? null : asString(d.dnsStatus),
      duplicate_group_id: null,
      canonical_developer_id: null,
      reviewer_notes: null,
    };
    developers.push(row);
    if (idemp.decision === "WOULD_SKIP_DUPLICATE") {
      ops.push({
        op: "WOULD_SKIP",
        table: "staging_developers",
        entity_type: "developer",
        entity_id: row.id,
        idempotency_key: idemp.idempotency_key,
        reason: idemp.reason,
      });
    } else if (idemp.decision === "WOULD_UPDATE") {
      ops.push({
        op: "WOULD_UPDATE",
        table: "staging_developers",
        entity_type: "developer",
        entity_id: row.id,
        idempotency_key: idemp.idempotency_key,
        reason: idemp.reason,
      });
    } else {
      ops.push({
        op: "WOULD_INSERT",
        table: "staging_developers",
        entity_type: "developer",
        entity_id: row.id,
        idempotency_key: idemp.idempotency_key,
        reason: idemp.reason,
      });
    }
    if (identity === "UNKNOWN") {
      warnings.push(`Developer ${candidateId} identity_status=UNKNOWN — review required`);
    }
  }

  // Projects
  for (const p of input.projects) {
    const candidateId = asString(p.id);
    const sourceRecordId = asString(
      (p.provenance as JsonRecord | undefined)?.sourceRecordId ??
        p.sourceId ??
        candidateId,
    );
    const payload = stripAbsolutePaths({
      candidateId,
      name: p.name,
      developerCandidateId: p.developerCandidateId,
      province: p.province,
      provinceConfidence: p.provinceConfidence,
      provinceConflict: p.provinceConflict,
    });
    const contentHash = computeContentHash(payload);
    const idemp = evaluateIdempotency({
      sourceBatchId: input.batchId,
      entityType: "project",
      sourceRecordId,
      contentHash,
    });
    idempotencyResults.push(idemp);
    const reviewState = mapReviewState(p.reviewState ?? "REVIEW_REQUIRED");
    const row: StagingProject = {
      id: internalId("proj", `${input.batchId}|${candidateId}`),
      import_session_id: importSessionId,
      source_batch_id: input.batchId,
      source_job_id: input.jobId,
      source_record_id: sourceRecordId,
      source_schema: input.schemaVersion,
      entity_status: "REVIEW_REQUIRED",
      review_state: reviewState,
      confidence: asConfidence(p.provinceConfidence ?? "UNKNOWN"),
      evidence_json: stripAbsolutePaths(p.evidence ?? []),
      raw_payload_json: stripAbsolutePaths(p.rawPayload ?? p),
      normalized_payload_json: payload,
      content_hash: contentHash,
      idempotency_key: idemp.idempotency_key,
      created_at: FIXED_AT,
      updated_at: FIXED_AT,
      deleted_at: null,
      candidate_id: candidateId,
      name: asString(p.name),
      normalized_name: asString(p.normalizedName, asString(p.name)),
      slug_candidate:
        p.slugCandidate == null ? null : asString(p.slugCandidate),
      developer_candidate_id:
        p.developerCandidateId == null
          ? null
          : asString(p.developerCandidateId),
      canonical_developer_id: null,
      province: p.province == null ? null : asString(p.province),
      province_confidence: asConfidence(p.provinceConfidence),
      province_conflict: Boolean(p.provinceConflict),
      location_json: p.location ?? null,
      project_status: "STAGING_CANDIDATE",
      duplicate_group_id: null,
      canonical_project_id: null,
      reviewer_notes: null,
    };
    projects.push(row);
    ops.push({
      op: idemp.decision === "WOULD_SKIP_DUPLICATE" ? "WOULD_SKIP" : "WOULD_INSERT",
      table: "staging_projects",
      entity_type: "project",
      entity_id: row.id,
      idempotency_key: idemp.idempotency_key,
      reason: idemp.reason,
    });
    if (row.developer_candidate_id) {
      ops.push({
        op: "WOULD_LINK",
        table: "staging_projects",
        entity_type: "project",
        entity_id: row.id,
        reason: `link developer_candidate_id=${row.developer_candidate_id}`,
      });
    }
    if (row.province_conflict) {
      blockers.push(`Project ${candidateId} has province_conflict`);
    }
  }

  // Assets (images)
  const storageItems = [];
  for (const img of input.images) {
    const candidateId = asString(img.id);
    const sourceRecordId = asString(
      (img.provenance as JsonRecord | undefined)?.sourceRecordId ??
        img.sourceId ??
        candidateId,
    );
    const sha256 = normalizeHexHash(asString(img.hash));
    const localPath = asString(
      img.relativePreviewPath ??
        (img.rawPayload as JsonRecord | undefined)?.local_path ??
        "",
    );
    const payload = stripAbsolutePaths({
      candidateId,
      sha256,
      projectId: img.projectId,
      mime: img.mime,
    });
    const contentHash = computeContentHash(payload);
    const idemp = evaluateIdempotency({
      sourceBatchId: input.batchId,
      entityType: "asset",
      sourceRecordId,
      contentHash,
    });
    idempotencyResults.push(idemp);
    const storage = planStorageItem({
      batchId: input.batchId,
      entityType: "asset",
      entityId: candidateId,
      localRelativePath: localPath || null,
      sha256,
      mimeType: img.mime == null ? null : asString(img.mime),
      fileSize:
        typeof (img.rawPayload as JsonRecord | undefined)?.bytes === "number"
          ? ((img.rawPayload as JsonRecord).bytes as number)
          : null,
      originalFilename: localPath ? path.basename(localPath) : null,
      reviewRequired: asString(img.decision) !== "ACCEPT_CANDIDATE",
    });
    storageItems.push(storage);
    const row: StagingAsset = {
      id: internalId("asset", `${input.batchId}|${candidateId}`),
      import_session_id: importSessionId,
      source_batch_id: input.batchId,
      source_job_id: input.jobId,
      source_record_id: sourceRecordId,
      source_schema: input.schemaVersion,
      entity_status:
        asString(img.decision) === "ACCEPT_CANDIDATE"
          ? "READY_FOR_APPROVAL"
          : "REVIEW_REQUIRED",
      review_state:
        asString(img.decision) === "ACCEPT_CANDIDATE"
          ? "READY_FOR_APPROVAL"
          : "REVIEW_REQUIRED",
      confidence: "HIGH",
      evidence_json: stripAbsolutePaths(img.evidence ?? []),
      raw_payload_json: stripAbsolutePaths(img.rawPayload ?? img),
      normalized_payload_json: payload,
      content_hash: contentHash,
      idempotency_key: idemp.idempotency_key,
      created_at: FIXED_AT,
      updated_at: FIXED_AT,
      deleted_at: null,
      candidate_id: candidateId,
      project_candidate_id:
        img.projectId == null ? null : asString(img.projectId),
      asset_type: "image",
      original_filename: localPath ? path.basename(localPath) : null,
      source_url:
        (img.rawPayload as JsonRecord | undefined)?.source_url == null
          ? null
          : asString((img.rawPayload as JsonRecord).source_url),
      source_page:
        (img.rawPayload as JsonRecord | undefined)?.source_page == null
          ? null
          : asString((img.rawPayload as JsonRecord).source_page),
      local_relative_path: localPath || null,
      sha256,
      mime_type: img.mime == null ? null : asString(img.mime),
      width: typeof img.width === "number" ? img.width : null,
      height: typeof img.height === "number" ? img.height : null,
      file_size:
        typeof (img.rawPayload as JsonRecord | undefined)?.bytes === "number"
          ? ((img.rawPayload as JsonRecord).bytes as number)
          : null,
      linkage_status: asString(
        (img.rawPayload as JsonRecord | undefined)?.linkage_status ??
          (img.linkageOk ? "PASS" : "UNKNOWN"),
      ),
      duplicate_group_id: null,
      storage_status: "PLANNED",
      storage_target_path: storage.target_object_path_candidate || null,
      storage_object_id: null,
      reviewer_notes: null,
    };
    assets.push(row);
    ops.push({
      op: "WOULD_INSERT",
      table: "staging_assets",
      entity_type: "asset",
      entity_id: row.id,
      idempotency_key: idemp.idempotency_key,
    });
    ops.push({
      op: "WOULD_PLAN_STORAGE",
      table: "storage_plan",
      entity_type: "asset",
      entity_id: row.id,
      reason: storage.storage_action,
    });
    if (row.project_candidate_id) {
      ops.push({
        op: "WOULD_LINK",
        table: "staging_assets",
        entity_type: "asset",
        entity_id: row.id,
        reason: `link project_candidate_id=${row.project_candidate_id}`,
      });
    }
  }

  // PDFs
  for (const pdf of input.pdfs) {
    const candidateId = asString(pdf.id);
    const sourceRecordId = asString(
      (pdf.provenance as JsonRecord | undefined)?.sourceRecordId ??
        pdf.sourceId ??
        candidateId,
    );
    const sha256 = normalizeHexHash(asString(pdf.hash));
    const localPath = asString(
      pdf.relativePreviewPath ??
        (pdf.rawPayload as JsonRecord | undefined)?.file ??
        "",
    );
    if (pdf.htmlDisguised === true || pdf.pdfMagicOk === false) {
      blockers.push(`PDF ${candidateId} invalid/disguised — block write`);
    }
    const payload = stripAbsolutePaths({
      candidateId,
      sha256,
      category: pdf.category,
      projectId: pdf.projectId,
    });
    const contentHash = computeContentHash(payload);
    const idemp = evaluateIdempotency({
      sourceBatchId: input.batchId,
      entityType: "pdf",
      sourceRecordId,
      contentHash,
    });
    idempotencyResults.push(idemp);
    const storage = planStorageItem({
      batchId: input.batchId,
      entityType: "pdf",
      entityId: candidateId,
      localRelativePath: localPath ? (localPath.includes("/") ? localPath : `pdfs/${localPath}`) : null,
      sha256,
      mimeType: pdf.mime == null ? "application/pdf" : asString(pdf.mime),
      fileSize:
        typeof (pdf.rawPayload as JsonRecord | undefined)?.bytes === "number"
          ? ((pdf.rawPayload as JsonRecord).bytes as number)
          : null,
      originalFilename: localPath ? path.basename(localPath) : null,
      reviewRequired: asString(pdf.decision) !== "ACCEPT_CANDIDATE",
      quarantine: pdf.htmlDisguised === true,
    });
    storageItems.push(storage);
    const row: StagingPdf = {
      id: internalId("pdf", `${input.batchId}|${candidateId}`),
      import_session_id: importSessionId,
      source_batch_id: input.batchId,
      source_job_id: input.jobId,
      source_record_id: sourceRecordId,
      source_schema: input.schemaVersion,
      entity_status:
        asString(pdf.decision) === "ACCEPT_CANDIDATE"
          ? "READY_FOR_APPROVAL"
          : "REVIEW_REQUIRED",
      review_state:
        asString(pdf.decision) === "ACCEPT_CANDIDATE"
          ? "READY_FOR_APPROVAL"
          : "REVIEW_REQUIRED",
      confidence: "HIGH",
      evidence_json: stripAbsolutePaths(pdf.evidence ?? []),
      raw_payload_json: stripAbsolutePaths(pdf.rawPayload ?? pdf),
      normalized_payload_json: payload,
      content_hash: contentHash,
      idempotency_key: idemp.idempotency_key,
      created_at: FIXED_AT,
      updated_at: FIXED_AT,
      deleted_at: null,
      candidate_id: candidateId,
      project_candidate_id:
        pdf.projectId == null ? null : asString(pdf.projectId),
      category_candidate: pdf.category == null ? null : asString(pdf.category),
      original_filename: localPath ? path.basename(localPath) : null,
      source_url:
        (pdf.rawPayload as JsonRecord | undefined)?.source_url == null
          ? null
          : asString((pdf.rawPayload as JsonRecord).source_url),
      source_page:
        (pdf.rawPayload as JsonRecord | undefined)?.source_page == null
          ? null
          : asString((pdf.rawPayload as JsonRecord).source_page),
      local_relative_path: storage.source_local_path || null,
      sha256,
      mime_type: pdf.mime == null ? "application/pdf" : asString(pdf.mime),
      page_count: typeof pdf.pages === "number" ? pdf.pages : null,
      file_size:
        typeof (pdf.rawPayload as JsonRecord | undefined)?.bytes === "number"
          ? ((pdf.rawPayload as JsonRecord).bytes as number)
          : null,
      duplicate_group_id: null,
      storage_status: "PLANNED",
      storage_target_path: storage.target_object_path_candidate || null,
      reviewer_notes: null,
    };
    pdfs.push(row);
    ops.push({
      op: "WOULD_INSERT",
      table: "staging_pdfs",
      entity_type: "pdf",
      entity_id: row.id,
      idempotency_key: idemp.idempotency_key,
    });
    ops.push({
      op: "WOULD_PLAN_STORAGE",
      table: "storage_plan",
      entity_type: "pdf",
      entity_id: row.id,
      reason: storage.storage_action,
    });
  }

  // News
  for (const n of input.news) {
    const candidateId = asString(n.id);
    const sourceRecordId = asString(
      (n.provenance as JsonRecord | undefined)?.sourceRecordId ??
        n.sourceId ??
        candidateId,
    );
    const sourceUrl = asString(n.sourceUrl);
    const freshness = asString(n.freshness ?? n.freshnessDays ?? "unknown");
    if (freshness === "stale" || Number(n.freshnessDays) > 365) {
      warnings.push(`News ${candidateId} stale — review required`);
    }
    const payload = stripAbsolutePaths({
      candidateId,
      title: n.title,
      sourceUrl,
      freshness,
    });
    const contentHash = computeContentHash(payload);
    const idemp = evaluateIdempotency({
      sourceBatchId: input.batchId,
      entityType: "news",
      sourceRecordId,
      contentHash,
    });
    idempotencyResults.push(idemp);
    const reviewState = mapReviewState(n.reviewState ?? "REVIEW_REQUIRED");
    const row: StagingNews = {
      id: internalId("news", `${input.batchId}|${candidateId}`),
      import_session_id: importSessionId,
      source_batch_id: input.batchId,
      source_job_id: input.jobId,
      source_record_id: sourceRecordId,
      source_schema: input.schemaVersion,
      entity_status: "REVIEW_REQUIRED",
      review_state: reviewState,
      confidence: "MEDIUM",
      evidence_json: stripAbsolutePaths(n.evidence ?? []),
      raw_payload_json: stripAbsolutePaths(n.rawPayload ?? n),
      normalized_payload_json: payload,
      content_hash: contentHash,
      idempotency_key: idemp.idempotency_key,
      created_at: FIXED_AT,
      updated_at: FIXED_AT,
      deleted_at: null,
      candidate_id: candidateId,
      title: n.title == null ? null : asString(n.title),
      normalized_title:
        n.normalizedTitle == null ? null : asString(n.normalizedTitle),
      source_url: sourceUrl,
      source_domain: n.sourceDomain == null ? null : asString(n.sourceDomain),
      published_at: n.publishedAt == null ? null : asString(n.publishedAt),
      captured_at: n.capturedAt == null ? null : asString(n.capturedAt),
      freshness_status: freshness,
      developer_candidate_id:
        n.developerCandidateId == null
          ? null
          : asString(n.developerCandidateId),
      project_candidate_id:
        n.projectCandidateId == null ? null : asString(n.projectCandidateId),
      duplicate_group_id: null,
      reviewer_notes: null,
    };
    newsRows.push(row);
    ops.push({
      op: "WOULD_INSERT",
      table: "staging_news",
      entity_type: "news",
      entity_id: row.id,
      idempotency_key: idemp.idempotency_key,
    });
  }

  // Review items
  let wouldReject = 0;
  let wouldQuarantine = 0;
  let wouldReview = 0;
  for (const r of input.reviewItems) {
    const sourceReviewItemId = asString(r.candidateId ?? r.id);
    const reviewState = mapReviewState(r.reviewState ?? "REVIEW_REQUIRED");
    const payload = stripAbsolutePaths({
      sourceReviewItemId,
      entityId: r.entityId,
      sourceReason: r.sourceReason,
      reviewState,
    });
    const contentHash = computeContentHash(payload);
    const idemp = evaluateIdempotency({
      sourceBatchId: input.batchId,
      entityType: "review_item",
      sourceRecordId: sourceReviewItemId,
      contentHash,
    });
    idempotencyResults.push(idemp);
    const row: StagingReviewItem = {
      id: internalId("rev", `${input.batchId}|${sourceReviewItemId}`),
      import_session_id: importSessionId,
      entity_type: asString(r.entityType, "review_item"),
      entity_id: asString(r.entityId),
      source_review_item_id: sourceReviewItemId,
      source_reason: asString(r.sourceReason),
      mapped_reason: asString(r.mappedReason),
      severity: (["low", "medium", "high"].includes(asString(r.severity))
        ? asString(r.severity)
        : "medium") as "low" | "medium" | "high",
      review_state: reviewState,
      suggested_action: asString(r.suggestedAction, "HUMAN_REVIEW"),
      blocking: Boolean(r.blocking),
      evidence_json: stripAbsolutePaths(r.evidence ?? []),
      reviewer_id: null,
      reviewer_notes: r.reviewerNotes == null ? null : asString(r.reviewerNotes),
      reviewed_at: null,
      decision: null,
      created_at: FIXED_AT,
      updated_at: FIXED_AT,
      idempotency_key: idemp.idempotency_key,
      content_hash: contentHash,
      source_batch_id: input.batchId,
      source_job_id: input.jobId,
    };
    reviews.push(row);
    ops.push({
      op: "WOULD_CREATE_REVIEW",
      table: "staging_review_items",
      entity_type: "review_item",
      entity_id: row.id,
      idempotency_key: idemp.idempotency_key,
    });
    if (reviewState === "REJECTED") wouldReject += 1;
    else if (reviewState === "QUARANTINED") wouldQuarantine += 1;
    else wouldReview += 1;
  }

  // Duplicates
  for (const d of input.duplicates) {
    const entityId = asString(d.entityId ?? d.candidateId);
    const payload = stripAbsolutePaths(d);
    const contentHash = computeContentHash(payload);
    const idemp = evaluateIdempotency({
      sourceBatchId: input.batchId,
      entityType: "duplicate_candidate",
      sourceRecordId: entityId,
      contentHash,
    });
    idempotencyResults.push(idemp);
    duplicates.push({
      id: internalId("dup", `${input.batchId}|${entityId}|${contentHash}`),
      import_session_id: importSessionId,
      source_batch_id: input.batchId,
      source_job_id: input.jobId,
      entity_type: asString(d.entityType, "unknown"),
      entity_id: entityId,
      matched_entity_id: asString(d.matchedId ?? d.matched_entity_id ?? ""),
      match_kind: asString(d.kind ?? d.match_kind ?? "unknown"),
      match_value: asString(d.value ?? d.match_value ?? ""),
      score: typeof d.score === "number" ? d.score : null,
      duplicate_group_id: asString(
        d.duplicate_group_id ?? `dup-group-${entityId}`,
      ),
      review_state: "DUPLICATE",
      evidence_json: stripAbsolutePaths(d),
      content_hash: contentHash,
      idempotency_key: idemp.idempotency_key,
      created_at: FIXED_AT,
      updated_at: FIXED_AT,
      deleted_at: null,
    });
  }

  // Conflicts
  for (const c of input.conflicts) {
    const entityId = asString(c.entityId ?? c.candidateId);
    const payload = stripAbsolutePaths(c);
    const contentHash = computeContentHash(payload);
    const idemp = evaluateIdempotency({
      sourceBatchId: input.batchId,
      entityType: "conflict_candidate",
      sourceRecordId: entityId,
      contentHash,
    });
    idempotencyResults.push(idemp);
    conflicts.push({
      id: internalId("conf", `${input.batchId}|${entityId}`),
      import_session_id: importSessionId,
      source_batch_id: input.batchId,
      source_job_id: input.jobId,
      entity_type: asString(c.entityType, "project"),
      entity_id: entityId,
      conflict_reason: asString(c.sourceReason ?? c.mappedReason ?? "CONFLICT"),
      severity: (["low", "medium", "high"].includes(asString(c.severity))
        ? asString(c.severity)
        : "high") as "low" | "medium" | "high",
      review_state: "CONFLICT",
      evidence_json: stripAbsolutePaths(c.evidence ?? c),
      content_hash: contentHash,
      idempotency_key: idemp.idempotency_key,
      created_at: FIXED_AT,
      updated_at: FIXED_AT,
      deleted_at: null,
    });
    blockers.push(
      `Conflict candidate on ${entityId}: ${asString(c.sourceReason ?? "CONFLICT")}`,
    );
  }

  // Audit events (plan-level)
  const pushAudit = (
    eventType: string,
    entityType: string | null,
    entityId: string | null,
    nextState: string | null,
    metadata: Record<string, unknown>,
  ) => {
    const ev = buildAuditEvent({
      id: nextAuditId(`${eventType}|${entityId ?? ""}`),
      importSessionId,
      eventType,
      entityType,
      entityId,
      actorType: "SYSTEM",
      actorId: "commit-simulator",
      nextState,
      metadata,
      createdAt: FIXED_AT,
    });
    auditEvents.push(ev);
    ops.push({
      op: "WOULD_CREATE_AUDIT",
      table: "staging_audit_events",
      entity_type: "audit_event",
      entity_id: ev.id,
      reason: eventType,
    });
  };

  pushAudit(
    "COMMIT_PLAN_CREATED",
    "import_session",
    importSessionId,
    "READY_FOR_COMMIT",
    { batchId: input.batchId },
  );
  pushAudit(
    "SIMULATION_STARTED",
    "import_session",
    importSessionId,
    "READY_FOR_COMMIT",
    { flags: STAGING_DB_HARD_FLAGS },
  );
  for (const d of developers) {
    pushAudit("WOULD_INSERT_DEVELOPER", "developer", d.id, d.review_state, {
      candidate_id: d.candidate_id,
    });
  }
  for (const p of projects) {
    pushAudit("WOULD_INSERT_PROJECT", "project", p.id, p.review_state, {
      candidate_id: p.candidate_id,
    });
  }
  pushAudit(
    "SIMULATION_ENTITY_COUNTS",
    "import_session",
    importSessionId,
    "READY_FOR_COMMIT",
    {
      developers: developers.length,
      projects: projects.length,
      images: assets.length,
      pdfs: pdfs.length,
      news: newsRows.length,
      review_items: reviews.length,
      conflicts: conflicts.length,
      ready_for_approval: input.readyForApproval.length,
    },
  );

  ops.push({
    op: "WOULD_SOFT_DELETE_ON_ROLLBACK",
    table: "staging_*",
    entity_type: "import_session",
    entity_id: importSessionId,
    reason: "rollback plan soft-delete by import_session_id",
  });

  const txPlan = buildTransactionPlan("batch_atomic_transaction");
  const rollbackPlan = buildRollbackPlan({
    importSessionId,
    sourceBatchId: input.batchId,
  });

  const txResult = await runSimulatedBatchTransaction(
    repo,
    [
      {
        phase: "insert_import_session",
        run: async () => {
          await repo.importSessions.insert(importSession);
        },
      },
      {
        phase: "insert_developers",
        run: async () => {
          for (const row of developers) await repo.developers.insert(row);
        },
      },
      {
        phase: "insert_projects",
        run: async () => {
          for (const row of projects) await repo.projects.insert(row);
        },
      },
      {
        phase: "insert_assets",
        run: async () => {
          for (const row of assets) await repo.assets.insert(row);
        },
      },
      {
        phase: "insert_pdfs",
        run: async () => {
          for (const row of pdfs) await repo.pdfs.insert(row);
        },
      },
      {
        phase: "insert_news",
        run: async () => {
          for (const row of newsRows) await repo.news.insert(row);
        },
      },
      {
        phase: "insert_review_items",
        run: async () => {
          for (const row of reviews) await repo.reviews.insert(row);
        },
      },
      {
        phase: "insert_duplicates",
        run: async () => {
          for (const row of duplicates) await repo.insertDuplicate(row);
        },
      },
      {
        phase: "insert_conflicts",
        run: async () => {
          for (const row of conflicts) await repo.insertConflict(row);
        },
      },
      {
        phase: "insert_audit_events",
        run: async () => {
          for (const row of auditEvents) await repo.audit.append(row);
        },
      },
      {
        phase: "update_import_session_status",
        run: async () => {
          // Stay at READY_FOR_COMMIT — never COMMITTED in simulation
          await repo.importSessions.updateStatus(
            importSessionId,
            "READY_FOR_COMMIT",
          );
        },
      },
    ],
    { failAtPhase: options.failAtPhase },
  );

  if (txResult.status === "SIMULATED_OK") {
    pushAudit(
      "SIMULATION_TRANSACTION_OK",
      "import_session",
      importSessionId,
      "READY_FOR_COMMIT",
      { phases: txResult.phasesCompleted },
    );
    // Append final audit into mock after successful sim (still memory-only)
    const last = auditEvents[auditEvents.length - 1];
    if (last) await repo.audit.append(last);
  }

  const idempotencySummary = summarizeIdempotency(idempotencyResults);
  const wouldInsert = ops.filter((o) => o.op === "WOULD_INSERT").length;
  const wouldUpdate = ops.filter((o) => o.op === "WOULD_UPDATE").length;
  const wouldSkip = ops.filter((o) => o.op === "WOULD_SKIP").length;

  // Province UNKNOWN warnings for projects that need review but are still staged
  for (const p of projects) {
    if (p.province_confidence === "LOW" || p.province == null) {
      warnings.push(`Project ${p.candidate_id} low/unknown province — keep in review`);
    }
  }

  const commitPlan = buildCommitPlanDocument({
    importSession,
    orderedOperations: ops,
    entityCounts: {
      developers: developers.length,
      projects: projects.length,
      images: assets.length,
      pdfs: pdfs.length,
      news: newsRows.length,
      review_items: reviews.length,
      duplicates: duplicates.length,
      conflicts: conflicts.length,
    },
    wouldInsert,
    wouldUpdate,
    wouldSkip,
    wouldReview,
    wouldReject,
    wouldQuarantine,
    transactionBoundary: txPlan,
    rollbackStrategy: rollbackPlan,
    idempotencySummary,
    auditEvents,
    storagePlan: storageItems,
    blockers: [...new Set(blockers)].sort(),
    warnings: [...new Set(warnings)].sort(),
  });

  const simulationResult = simulationResultFromPlan(commitPlan, {
    simulated_conflict_count: conflicts.length,
    simulated_transaction_status: txResult.status,
    simulated_rollback_status: "SIMULATED_READY",
  });

  const storagePlan = buildStoragePlanDocument(input.batchId, storageItems);

  const schemaPlan = {
    status: "DESIGN_DRAFT_ONLY",
    tables: [
      "staging_import_sessions",
      "staging_developers",
      "staging_projects",
      "staging_assets",
      "staging_pdfs",
      "staging_news",
      "staging_review_items",
      "staging_duplicate_candidates",
      "staging_conflict_candidates",
      "staging_audit_events",
    ],
    do_not_execute: true,
    do_not_register_in_supabase_migrations: true,
  };

  return {
    status: "SIMULATED_ONLY",
    commitPlan,
    simulationResult,
    simulatedTables: repo.snapshot(),
    auditEvents,
    storagePlan,
    rollbackPlan,
    transactionPlan: txPlan,
    idempotencyPlan: { ...idempotencySummary, results: idempotencyResults },
    schemaPlan,
    flags: STAGING_DB_HARD_FLAGS,
    database_writes: 0,
    storage_uploads: 0,
  };
}

export function attemptRealCommit(): never {
  return realCommit();
}

export function writeSimulationOutputs(
  outDir: string,
  bundle: CommitSimulationBundle,
): void {
  const dirs = ["plan", "simulation", "rollback", "storage", "audit", "reports"];
  for (const d of dirs) {
    fs.mkdirSync(path.join(outDir, d), { recursive: true });
  }

  const writeJson = (rel: string, value: unknown) => {
    const p = path.join(outDir, rel);
    fs.writeFileSync(p, `${stableStringify(value)}\n`, "utf8");
  };

  writeJson("plan/commit-plan.json", bundle.commitPlan);
  writeJson("plan/schema-plan.json", bundle.schemaPlan);
  writeJson("plan/transaction-plan.json", bundle.transactionPlan);
  writeJson("plan/idempotency-plan.json", {
    summary: {
      wouldInsert: bundle.idempotencyPlan.wouldInsert,
      wouldSkip: bundle.idempotencyPlan.wouldSkip,
      wouldUpdate: bundle.idempotencyPlan.wouldUpdate,
      conflicts: bundle.idempotencyPlan.conflicts,
      duplicateCandidates: bundle.idempotencyPlan.duplicateCandidates,
      keys: bundle.idempotencyPlan.keys,
    },
    results: bundle.idempotencyPlan.results,
  });
  writeJson("simulation/simulation-result.json", bundle.simulationResult);
  writeJson("simulation/simulated-tables.json", bundle.simulatedTables);
  fs.writeFileSync(
    path.join(outDir, "simulation/simulated-audit-events.jsonl"),
    bundle.auditEvents.map((e) => stableStringify(e)).join("\n") + "\n",
    "utf8",
  );
  writeJson("rollback/rollback-plan.json", bundle.rollbackPlan);
  writeJson("storage/storage-plan.json", bundle.storagePlan);
  const designAudit = [
    {
      at: FIXED_AT,
      event: "STAGING_DB_COMMIT_DESIGN_V1",
      status: "SIMULATED_ONLY",
      database_writes: 0,
      storage_uploads: 0,
    },
    {
      at: FIXED_AT,
      event: "COMMIT_PLAN_WRITTEN",
      batchId: bundle.commitPlan.importSession.source_batch_id,
    },
  ];
  fs.writeFileSync(
    path.join(outDir, "audit/design-audit-log.jsonl"),
    designAudit.map((e) => stableStringify(e)).join("\n") + "\n",
    "utf8",
  );
  writeJson("reports/staging-db-design-summary.json", {
    status: "SIMULATED_ONLY",
    batchId: bundle.commitPlan.importSession.source_batch_id,
    entityCounts: bundle.commitPlan.entityCounts,
    wouldInsert: bundle.commitPlan.wouldInsert,
    wouldUpdate: bundle.commitPlan.wouldUpdate,
    wouldSkip: bundle.commitPlan.wouldSkip,
    wouldReview: bundle.commitPlan.wouldReview,
    conflicts: bundle.commitPlan.entityCounts.conflicts,
    auditEvents: bundle.auditEvents.length,
    storagePlans: bundle.storagePlan.items.length,
    blockers: bundle.commitPlan.blockers,
    warnings: bundle.commitPlan.warnings,
    productionSafe: bundle.commitPlan.productionSafe,
    database_writes: 0,
    storage_uploads: 0,
    transaction: bundle.simulationResult.simulated_transaction_status,
    rollback: bundle.simulationResult.simulated_rollback_status,
  });
}
