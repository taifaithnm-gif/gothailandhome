/**
 * Windows01 → GoThailandHome data import contract (versioned).
 * WAITING_FOR_WINDOWS01_CONTRACT: final DATA_CONTRACT_V1 fields are not frozen.
 * This module defines adapter interfaces + validation gates only.
 * Production DB writes are never performed by this package.
 */

export const WINDOWS01_CONTRACT_STATUS = "WAITING_FOR_WINDOWS01_CONTRACT" as const;

/** Schema versions the site adapter understands. Extend when Windows01 ships. */
export const SUPPORTED_WINDOWS01_SCHEMA_VERSIONS = [
  "windows01.manifest.v0",
  "windows01.results.v0",
] as const;

export type Windows01SchemaVersion =
  (typeof SUPPORTED_WINDOWS01_SCHEMA_VERSIONS)[number];

/**
 * Worker output must NEVER claim these states.
 * Only human review / site publish pipeline may set them.
 */
export const FORBIDDEN_WORKER_STATES = [
  "APPROVED",
  "VERIFIED_FACT",
  "PUBLISHED",
  "PRODUCTION_READY",
] as const;

export type ForbiddenWorkerState = (typeof FORBIDDEN_WORKER_STATES)[number];

/**
 * Internal pipeline review states (adapter / safety path).
 * Distinct from human EvidenceReviewStatus below.
 */
export type Windows01ReviewState =
  | "RECEIVED"
  | "MANIFEST_VALIDATED"
  | "SCHEMA_VALIDATED"
  | "SAFETY_CHECKED"
  | "DEDUPED"
  | "ENTITY_MATCHED"
  | "CONFLICT_DETECTED"
  | "QUARANTINED"
  | "AWAITING_HUMAN_REVIEW"
  | "REJECTED"
  | "STAGING_IMPORTED"
  | "APPROVED_FOR_PUBLISH"
  | "PRODUCTION_PUBLISHED";

/**
 * Human evidence review status (directive Part 5).
 * Never auto-set to APPROVED by the adapter.
 */
export const EVIDENCE_REVIEW_STATUSES = [
  "NEW",
  "REVIEWING",
  "APPROVED",
  "REJECTED",
  "IMPORT_READY",
  "IMPORTED",
] as const;

export type EvidenceReviewStatus = (typeof EVIDENCE_REVIEW_STATUSES)[number];

export type Windows01ManifestV0 = {
  schemaVersion: "windows01.manifest.v0";
  batchId: string;
  producedAt: string;
  sourceMachine: "windows01";
  /** Windows01 worker version that produced this batch. */
  workerVersion: string;
  recordCount: number;
  /** Batch-level content / package hash. */
  contentHash: string;
  /** Relative paths inside the batch package — never absolute host paths. */
  evidencePaths: string[];
};

export type Windows01EvidenceRefs = {
  image?: string;
  pdf?: string;
  news?: string;
  imageHash?: string;
  pdfHash?: string;
  newsUrl?: string;
};

export type Windows01RecordV0 = {
  schemaVersion: "windows01.results.v0";
  recordId: string;
  sourceUrl?: string;
  contentHash: string;
  /** Record discovery / extraction timestamp (ISO). */
  timestamp: string;
  entityHints?: Record<string, unknown>;
  evidenceRefs: string[];
  evidence?: Windows01EvidenceRefs;
  /** Worker-proposed state — must not be a forbidden publish state. */
  workerState?: string;
  payload: Record<string, unknown>;
};

export type Windows01BatchV0 = {
  manifest: Windows01ManifestV0;
  records: Windows01RecordV0[];
};

export type ImportAuditEvent = {
  id: string;
  at: string;
  actor: "system" | "human" | "ci";
  action: string;
  batchId: string;
  recordId?: string;
  detail: Record<string, unknown>;
  /** Immutable append-only; consumers must not mutate prior events. */
  prevHash?: string;
  eventHash: string;
};

export type QuarantineReason =
  | "INVALID_MANIFEST"
  | "UNSUPPORTED_SCHEMA"
  | "MISSING_EVIDENCE"
  | "DUPLICATE_RECORD"
  | "DUPLICATE_HASH"
  | "DUPLICATE_SOURCE_URL"
  | "DUPLICATE_PROJECT"
  | "DUPLICATE_DEVELOPER_PROJECT"
  | "DUPLICATE_IMAGE_HASH"
  | "DUPLICATE_PDF_HASH"
  | "DUPLICATE_NEWS_URL"
  | "MALICIOUS_URL"
  | "PATH_TRAVERSAL"
  | "OVERSIZED_PAYLOAD"
  | "FORBIDDEN_WORKER_STATE"
  | "PRODUCTION_HARD_BLOCK"
  | "CONFLICT"
  | "SAFETY_FAIL"
  | "VERSION_MISMATCH";

export type QuarantineItem = {
  batchId: string;
  recordId?: string;
  reason: QuarantineReason;
  message: string;
  at: string;
};

export type ImportMode = "dry-run" | "staging" | "blocked-production";

export type DuplicateMatchKey =
  | "record_id"
  | "content_hash"
  | "source_url"
  | "project_name"
  | "developer"
  | "image_hash"
  | "pdf_hash"
  | "news_url";

export type DuplicateHit = {
  key: DuplicateMatchKey;
  value: string;
  recordId: string;
  priorRecordId: string;
};

/** Fields shown on the evidence review surface — never auto-approved. */
export type EvidenceReviewCard = {
  recordId: string;
  developer: string | null;
  project: string | null;
  province: string | null;
  sourceUrl: string | null;
  evidence: string[];
  image: string | null;
  pdf: string | null;
  news: string | null;
  hash: string;
  imageHash: string | null;
  pdfHash: string | null;
  newsUrl: string | null;
  reviewStatus: EvidenceReviewStatus;
  pipelineState: Windows01ReviewState;
  timestamp: string;
};

export type DryRunImportSummary = {
  mode: "dry-run";
  batchId: string;
  ranAt: string;
  databaseWrites: 0;
  productionChanged: false;
  autoApproved: false;
  totalRecords: number;
  schemaValid: number;
  schemaInvalid: number;
  duplicateSkipped: number;
  quarantined: number;
  reviewCardsPrepared: number;
  simulatedImportReady: number;
  simulatedImported: number;
  coveragePercent: number;
  nextStates: Array<{ recordId: string; state: Windows01ReviewState }>;
  reviewStatuses: Array<{ recordId: string; status: EvidenceReviewStatus }>;
};

export type ImportAdapterResult = {
  mode: ImportMode;
  accepted: number;
  quarantined: QuarantineItem[];
  audit: ImportAuditEvent[];
  nextStates: Array<{ recordId: string; state: Windows01ReviewState }>;
  duplicates?: DuplicateHit[];
  reviewCards?: EvidenceReviewCard[];
  dryRunSummary?: DryRunImportSummary;
};

/**
 * Adapter interface — implementations must remain staging-guarded.
 */
export interface Windows01ImportAdapter {
  readonly supportedSchemas: readonly Windows01SchemaVersion[];
  validateManifest(manifest: unknown): Windows01ManifestV0;
  validateRecord(record: unknown): Windows01RecordV0;
  runImport(batch: Windows01BatchV0, mode: ImportMode): ImportAdapterResult;
}
