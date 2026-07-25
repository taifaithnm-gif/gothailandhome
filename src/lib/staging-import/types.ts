/**
 * Staging Import Framework V1 — shared types.
 * Dry-run / staging-only. Never writes Production DB or Storage.
 */

export const STAGING_IMPORT_FRAMEWORK_VERSION = "1.0.0" as const;

/** Review state machine (framework-level). Cap this round: READY_FOR_APPROVAL. */
export const REVIEW_STATES = [
  "RECEIVED",
  "VALIDATED",
  "REVIEW_REQUIRED",
  "CONFLICT",
  "DUPLICATE",
  "READY_FOR_APPROVAL",
  "REJECTED",
  "QUARANTINED",
  "APPROVED",
  "READY_FOR_PRODUCTION",
  "PUBLISHED",
] as const;

export type ReviewState = (typeof REVIEW_STATES)[number];

/** Highest state automation may reach in V1 (no human approval yet). */
export const MAX_AUTOMATION_REVIEW_STATE: ReviewState = "READY_FOR_APPROVAL";

export const FORBIDDEN_AUTOMATION_STATES = [
  "APPROVED",
  "READY_FOR_PRODUCTION",
  "PUBLISHED",
] as const;

export type ForbiddenAutomationState =
  (typeof FORBIDDEN_AUTOMATION_STATES)[number];

/** Future human-only states — present for design awareness; no active edges. */
export const FUTURE_MANUAL_STATES = FORBIDDEN_AUTOMATION_STATES;

export const ENTITY_TYPES = [
  "developer",
  "project",
  "image",
  "pdf",
  "news",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const PREVIEW_ACTIONS = [
  "WOULD_CREATE",
  "WOULD_UPDATE",
  "WOULD_REVIEW",
  "WOULD_REJECT",
  "WOULD_DUPLICATE",
  "WOULD_QUARANTINE",
  "WOULD_SKIP_DUPLICATE",
] as const;

export type PreviewAction = (typeof PREVIEW_ACTIONS)[number];

export const FORBIDDEN_COMMIT_ACTIONS = [
  "CREATED",
  "UPDATED",
  "APPROVED",
  "PUBLISHED",
  "COMMITTED",
  "MERGED",
] as const;

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type EvidenceRef = {
  kind: "image" | "pdf" | "news" | "html" | "other";
  path?: string;
  url?: string;
  hash?: string;
  mime?: string;
};

/** Provenance retained from external packages (never silently dropped). */
export type SourceProvenance = {
  sourceRecordId?: string;
  sourceSchema?: string;
  sourceBatchId?: string;
  sourceJobId?: string;
  sourceUrl?: string | null;
  sourceDomain?: string | null;
  capturedAt?: string | null;
  rawPayload?: Record<string, unknown>;
  unsupportedFields?: string[];
  evidence?: EvidenceRef[];
  confidence?: ConfidenceLevel;
  reviewReason?: string | null;
};

export type DeveloperCandidate = {
  id: string;
  name: string;
  aliases?: string[];
  officialWebsite?: string | null;
  dnsFailure?: boolean;
  confidence?: ConfidenceLevel;
  evidence?: EvidenceRef[];
  unknown?: boolean;
  slug?: string;
  provenance?: SourceProvenance;
  identityStatus?: "KNOWN" | "UNKNOWN" | "CANDIDATE";
  reviewState?: ReviewState;
  officialWebsiteVerified?: boolean;
  resolutionMethod?: string | null;
  normalizedName?: string;
  sourceId?: string;
  sourceUrl?: string | null;
};

export type ProjectCandidate = {
  id: string;
  name: string;
  developerId?: string | null;
  developerName?: string | null;
  province?: string | null;
  location?: string | null;
  slug?: string | null;
  routeCandidate?: string | null;
  evidence?: EvidenceRef[];
  images?: string[];
  pdfs?: string[];
  news?: string[];
  confidence?: ConfidenceLevel;
  provenance?: SourceProvenance;
  developerIdentityStatus?: "KNOWN" | "UNKNOWN" | "CANDIDATE";
  provinceConfidence?: ConfidenceLevel;
  provinceConflict?: boolean;
  reviewState?: ReviewState;
  sourceId?: string;
  sourceUrl?: string | null;
  sourceDomain?: string | null;
  normalizedName?: string;
};

export type ImageCandidate = {
  id: string;
  hash: string;
  projectId?: string | null;
  storagePathMock?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string | null;
  path?: string | null;
  provenance?: SourceProvenance;
  decision?:
    | "ACCEPT_CANDIDATE"
    | "REVIEW_REQUIRED"
    | "DUPLICATE_CANDIDATE"
    | "REJECTED"
    | "QUARANTINED";
};

export type PdfCategory =
  | "brochure"
  | "price_list"
  | "floor_plan"
  | "company_profile"
  | "other"
  | "unknown";

export type PdfCandidate = {
  id: string;
  hash: string;
  mime?: string | null;
  pages?: number | null;
  category?: PdfCategory;
  projectId?: string | null;
  path?: string | null;
  provenance?: SourceProvenance;
};

export type NewsCandidate = {
  id: string;
  sourceUrl: string;
  developerId?: string | null;
  projectId?: string | null;
  title?: string | null;
  capturedAt?: string | null;
  freshnessDays?: number | null;
  evidence?: EvidenceRef[];
  provenance?: SourceProvenance;
};

export type BatchManifest = {
  batchId: string;
  schemaVersion?: string;
  jobId?: string;
  status?: string;
  generatedAt?: string;
  counts?: Partial<Record<EntityType | string, number>>;
  source?: "windows01" | "mock" | "manual";
};

export type ImportBatch = {
  manifest: BatchManifest;
  developers: DeveloperCandidate[];
  projects: ProjectCandidate[];
  images: ImageCandidate[];
  pdfs: PdfCandidate[];
  news: NewsCandidate[];
};

export type ValidationIssue = {
  code: string;
  severity: "error" | "warning" | "info";
  entityType?: EntityType;
  entityId?: string;
  message: string;
  field?: string;
};

export type DuplicateMatchKind =
  | "id"
  | "hash"
  | "slug"
  | "alias"
  | "url"
  | "name"
  | "similarity";

export type DuplicateHit = {
  kind: DuplicateMatchKind;
  entityType: EntityType;
  entityId: string;
  matchedId: string;
  value: string;
  score?: number;
  action: "WOULD_SKIP_DUPLICATE";
};

export type ApprovalCandidateKind =
  | "approval"
  | "review"
  | "reject"
  | "quarantine"
  | "duplicate";

export type ApprovalCandidate = {
  kind: ApprovalCandidateKind;
  entityType: EntityType;
  entityId: string;
  reviewState: ReviewState;
  reasons: string[];
  /** V1: always false — never truly approved. */
  approved: false;
};

export type EntityPreviewRow = {
  entityType: EntityType;
  entityId: string;
  action: PreviewAction;
  reviewState: ReviewState;
  reasons: string[];
};

export type PreviewStats = Record<PreviewAction, number>;

export type EntityPreviewStats = Record<EntityType, PreviewStats>;

export type ImportSessionPhase =
  | "created"
  | "batch_loaded"
  | "validated"
  | "normalized"
  | "review_mapped"
  | "duplicate_checked"
  | "preview_ready"
  | "blocked_commit";

export type AuditEvent = {
  id: string;
  at: string;
  sessionId: string;
  actor: "system" | "cli" | "test";
  action: string;
  detail: Record<string, unknown>;
};

export type StagingImportHardFlags = {
  dryRun: true;
  stagingOnly: true;
  productionWrite: false;
  databaseWrite: false;
  storageUpload: false;
  approval: false;
  publish: false;
  /** Commit path must not exist in V1. */
  commitEnabled: false;
};

export const STAGING_IMPORT_HARD_FLAGS: StagingImportHardFlags = {
  dryRun: true,
  stagingOnly: true,
  productionWrite: false,
  databaseWrite: false,
  storageUpload: false,
  approval: false,
  publish: false,
  commitEnabled: false,
};
