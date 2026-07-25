/**
 * Staging DB Commit Design V1 — shared types.
 * SIMULATION ONLY. No real database or storage writes.
 */

export const STAGING_DB_DESIGN_VERSION = "1.0.0" as const;

export const SIMULATION_STATUS = "SIMULATED_ONLY" as const;

/** Import session status machine. Simulation ceiling: READY_FOR_COMMIT. */
export const IMPORT_SESSION_STATUSES = [
  "RECEIVED",
  "VERIFIED",
  "NORMALIZED",
  "VALIDATED",
  "REVIEW_MAPPED",
  "READY_FOR_COMMIT",
  "COMMITTING",
  "COMMITTED",
  "PARTIAL_FAILURE",
  "FAILED",
  "ROLLED_BACK",
  "CANCELLED",
] as const;

export type ImportSessionStatus = (typeof IMPORT_SESSION_STATUSES)[number];

/** Highest status automation/simulation may reach this milestone. */
export const MAX_SIMULATION_SESSION_STATUS: ImportSessionStatus =
  "READY_FOR_COMMIT";

export const FORBIDDEN_SIMULATION_SESSION_STATUSES = [
  "COMMITTING",
  "COMMITTED",
  "PARTIAL_FAILURE",
] as const;

export type StagingEntityKind =
  | "developer"
  | "project"
  | "asset"
  | "pdf"
  | "news"
  | "review_item"
  | "duplicate_candidate"
  | "conflict_candidate"
  | "import_session"
  | "audit_event";

export const ENTITY_STATUSES = [
  "RECEIVED",
  "STAGED",
  "REVIEW_REQUIRED",
  "READY_FOR_APPROVAL",
  "REJECTED",
  "QUARANTINED",
  "SOFT_DELETED",
] as const;

export type EntityStatus = (typeof ENTITY_STATUSES)[number];

/** Review states allowed in staging persistence / automation. */
export const STAGING_REVIEW_STATES = [
  "RECEIVED",
  "VALIDATED",
  "REVIEW_REQUIRED",
  "CONFLICT",
  "DUPLICATE",
  "READY_FOR_APPROVAL",
  "REJECTED",
  "QUARANTINED",
] as const;

export type StagingReviewState = (typeof STAGING_REVIEW_STATES)[number];

export const FORBIDDEN_COMMIT_REVIEW_STATES = [
  "APPROVED",
  "READY_FOR_PRODUCTION",
  "PUBLISHED",
] as const;

export type ForbiddenCommitReviewState =
  (typeof FORBIDDEN_COMMIT_REVIEW_STATES)[number];

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type DeveloperIdentityStatus =
  | "VERIFIED"
  | "RESOLVED"
  | "UNKNOWN"
  | "CONFLICT"
  | "DUPLICATE_CANDIDATE";

export type StorageStatus =
  | "NOT_PLANNED"
  | "PLANNED"
  | "UPLOAD_PENDING"
  | "UPLOADED"
  | "FAILED"
  | "QUARANTINED";

/** Allowed storage statuses during this design milestone. */
export const ALLOWED_SIMULATION_STORAGE_STATUSES: readonly StorageStatus[] = [
  "NOT_PLANNED",
  "PLANNED",
];

export type StorageAction =
  | "WOULD_UPLOAD"
  | "WOULD_SKIP_DUPLICATE"
  | "WOULD_QUARANTINE"
  | "WOULD_REVIEW";

export type CommitOperationType =
  | "WOULD_INSERT"
  | "WOULD_UPDATE"
  | "WOULD_SKIP"
  | "WOULD_LINK"
  | "WOULD_CREATE_REVIEW"
  | "WOULD_CREATE_AUDIT"
  | "WOULD_PLAN_STORAGE"
  | "WOULD_SOFT_DELETE_ON_ROLLBACK";

export const FORBIDDEN_COMMIT_OPERATION_TYPES = [
  "INSERTED",
  "UPDATED",
  "DELETED",
  "UPLOADED",
  "COMMITTED",
] as const;

export type AuditActorType = "SYSTEM" | "IMPORTER" | "REVIEWER" | "ADMIN";

/** Simulation may only use SYSTEM / IMPORTER. */
export const SIMULATION_ACTOR_TYPES: readonly AuditActorType[] = [
  "SYSTEM",
  "IMPORTER",
];

export type TransactionMode =
  | "batch_atomic_transaction"
  | "entity_group_transaction";

export type IdempotencyDecision =
  | "WOULD_INSERT"
  | "WOULD_SKIP_DUPLICATE"
  | "WOULD_UPDATE"
  | "CONFLICT"
  | "DUPLICATE_CANDIDATE";

export type StagingHardFlags = {
  dryRun: true;
  stagingOnly: true;
  productionWrite: false;
  databaseWrite: false;
  storageUpload: false;
  realCommitEnabled: false;
  simulationStatus: typeof SIMULATION_STATUS;
};

export const STAGING_DB_HARD_FLAGS: StagingHardFlags = {
  dryRun: true,
  stagingOnly: true,
  productionWrite: false,
  databaseWrite: false,
  storageUpload: false,
  realCommitEnabled: false,
  simulationStatus: SIMULATION_STATUS,
};

/** Common provenance + staging columns for entity tables. */
export type StagingEntityBase = {
  id: string;
  import_session_id: string;
  source_batch_id: string;
  source_job_id: string;
  source_record_id: string;
  source_schema: string;
  entity_status: EntityStatus;
  review_state: StagingReviewState;
  confidence: ConfidenceLevel;
  evidence_json: unknown;
  raw_payload_json: unknown;
  normalized_payload_json: unknown;
  content_hash: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type StagingImportSession = {
  id: string;
  import_session_id: string;
  source_batch_id: string;
  source_job_id: string;
  source_schema_version: string;
  sealed_zip_sha256: string | null;
  raw_zip_sha256: string | null;
  source_file_name: string | null;
  source_file_size: number | null;
  status: ImportSessionStatus;
  phase: string;
  dry_run: true;
  staging_only: true;
  production_allowed: false;
  database_write_allowed: false;
  storage_write_allowed: false;
  started_at: string;
  completed_at: string | null;
  failed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  idempotency_key: string;
  content_hash: string;
  error_code: string | null;
  error_message: string | null;
  metadata_json: Record<string, unknown>;
};

export type StagingDeveloper = StagingEntityBase & {
  candidate_id: string;
  name: string;
  normalized_name: string;
  aliases_json: string[];
  official_website: string | null;
  official_website_verified: boolean;
  identity_status: DeveloperIdentityStatus;
  resolution_method: string | null;
  dns_status: string | null;
  duplicate_group_id: string | null;
  canonical_developer_id: string | null;
  reviewer_notes: string | null;
};

export type StagingProject = StagingEntityBase & {
  candidate_id: string;
  name: string;
  normalized_name: string;
  slug_candidate: string | null;
  developer_candidate_id: string | null;
  canonical_developer_id: string | null;
  province: string | null;
  province_confidence: ConfidenceLevel;
  province_conflict: boolean;
  location_json: unknown;
  project_status: string;
  duplicate_group_id: string | null;
  canonical_project_id: string | null;
  reviewer_notes: string | null;
};

export type StagingAsset = StagingEntityBase & {
  candidate_id: string;
  project_candidate_id: string | null;
  asset_type: string;
  original_filename: string | null;
  source_url: string | null;
  source_page: string | null;
  local_relative_path: string | null;
  sha256: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  linkage_status: string | null;
  duplicate_group_id: string | null;
  storage_status: StorageStatus;
  storage_target_path: string | null;
  storage_object_id: string | null;
  reviewer_notes: string | null;
};

export type StagingPdf = StagingEntityBase & {
  candidate_id: string;
  project_candidate_id: string | null;
  category_candidate: string | null;
  original_filename: string | null;
  source_url: string | null;
  source_page: string | null;
  local_relative_path: string | null;
  sha256: string;
  mime_type: string | null;
  page_count: number | null;
  file_size: number | null;
  duplicate_group_id: string | null;
  storage_status: StorageStatus;
  storage_target_path: string | null;
  reviewer_notes: string | null;
};

export type StagingNews = StagingEntityBase & {
  candidate_id: string;
  title: string | null;
  normalized_title: string | null;
  source_url: string;
  source_domain: string | null;
  published_at: string | null;
  captured_at: string | null;
  freshness_status: string | null;
  developer_candidate_id: string | null;
  project_candidate_id: string | null;
  duplicate_group_id: string | null;
  reviewer_notes: string | null;
};

export type StagingReviewItem = {
  id: string;
  import_session_id: string;
  entity_type: string;
  entity_id: string;
  source_review_item_id: string;
  source_reason: string;
  mapped_reason: string;
  severity: "low" | "medium" | "high";
  review_state: StagingReviewState;
  suggested_action: string;
  blocking: boolean;
  evidence_json: unknown;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  decision: string | null;
  created_at: string;
  updated_at: string;
  idempotency_key: string;
  content_hash: string;
  source_batch_id: string;
  source_job_id: string;
};

export type StagingDuplicateCandidate = {
  id: string;
  import_session_id: string;
  source_batch_id: string;
  source_job_id: string;
  entity_type: string;
  entity_id: string;
  matched_entity_id: string;
  match_kind: string;
  match_value: string;
  score: number | null;
  duplicate_group_id: string;
  review_state: StagingReviewState;
  evidence_json: unknown;
  content_hash: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type StagingConflictCandidate = {
  id: string;
  import_session_id: string;
  source_batch_id: string;
  source_job_id: string;
  entity_type: string;
  entity_id: string;
  conflict_reason: string;
  severity: "low" | "medium" | "high";
  review_state: "CONFLICT";
  evidence_json: unknown;
  content_hash: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type StagingAuditEvent = {
  id: string;
  import_session_id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  actor_type: AuditActorType;
  actor_id: string;
  previous_state: string | null;
  next_state: string | null;
  reason: string | null;
  payload_hash: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

export type CommitOperation = {
  op: CommitOperationType;
  table: string;
  entity_type: StagingEntityKind | string;
  entity_id: string;
  idempotency_key?: string;
  reason?: string;
  payload_summary?: Record<string, unknown>;
};

export type StoragePlanItem = {
  entity_type: "asset" | "pdf";
  entity_id: string;
  source_local_path: string;
  source_sha256: string;
  mime_type: string | null;
  file_size: number | null;
  target_bucket_candidate: string;
  target_object_path_candidate: string;
  duplicate_object_candidate: string | null;
  upload_required: boolean;
  review_required: boolean;
  storage_action: StorageAction;
};

export type SimulationResult = {
  status: typeof SIMULATION_STATUS;
  batchId: string;
  importSessionId: string;
  simulated_insert_count: number;
  simulated_update_count: number;
  simulated_skip_count: number;
  simulated_review_count: number;
  simulated_conflict_count: number;
  simulated_audit_event_count: number;
  simulated_storage_plan_count: number;
  simulated_transaction_status: "SIMULATED_OK" | "SIMULATED_ROLLED_BACK";
  simulated_rollback_status: "SIMULATED_READY" | "SIMULATED_NOT_NEEDED";
  entity_counts: {
    developers: number;
    projects: number;
    images: number;
    pdfs: number;
    news: number;
    review_items: number;
    duplicates: number;
    conflicts: number;
  };
  database_writes: 0;
  storage_uploads: 0;
  production_connection: false;
  real_commit: false;
};
