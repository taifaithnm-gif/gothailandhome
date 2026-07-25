/**
 * Staging Import Framework V1 — public API.
 * Dry-run only. No Production writes. No Storage uploads. No commit.
 */

export {
  STAGING_IMPORT_FRAMEWORK_VERSION,
  STAGING_IMPORT_HARD_FLAGS,
  REVIEW_STATES,
  MAX_AUTOMATION_REVIEW_STATE,
  FORBIDDEN_AUTOMATION_STATES,
  FUTURE_MANUAL_STATES,
  ENTITY_TYPES,
  PREVIEW_ACTIONS,
  FORBIDDEN_COMMIT_ACTIONS,
} from "./types.ts";
export type {
  ReviewState,
  EntityType,
  PreviewAction,
  ConfidenceLevel,
  EvidenceRef,
  SourceProvenance,
  DeveloperCandidate,
  ProjectCandidate,
  ImageCandidate,
  PdfCandidate,
  PdfCategory,
  NewsCandidate,
  BatchManifest,
  ImportBatch,
  ValidationIssue,
  DuplicateHit,
  ApprovalCandidate,
  EntityPreviewRow,
  PreviewStats,
  EntityPreviewStats,
  ImportSessionPhase,
  AuditEvent,
  StagingImportHardFlags,
  ForbiddenAutomationState,
} from "./types.ts";

export {
  StagingImportError,
  ContractValidationError,
  BatchLoadError,
  IllegalStateTransitionError,
  InvalidReviewStateTransitionError,
  ForbiddenAutomationStateError,
  CommitNotImplementedError,
  ApprovalBlockedError,
  StorageUploadBlockedError,
} from "./errors.ts";

export {
  initialReviewState,
  canTransition,
  assertTransition,
  isForbiddenAutomationState,
  assertAutomationAllowed,
  transitionAutomation,
  reviewStateRank,
  isAtOrBeyondCeiling,
  maxAutomationState,
  REVIEW_TRANSITIONS,
} from "./approval-state.ts";

export { AuditLog, createAuditEvent } from "./audit.ts";
export { StagingTransaction } from "./transaction.ts";
export type { TransactionOp, DryRunTransactionResult } from "./transaction.ts";

export {
  listProvinces,
  validateProvince,
  isKnownProvince,
} from "./province-validator.ts";
export type { ProvinceValidationResult } from "./province-validator.ts";

export {
  validateDeveloper,
  expandDeveloperAliases,
} from "./developer-validator.ts";
export type { DeveloperValidationResult } from "./developer-validator.ts";

export {
  SUPPORTED_BATCH_SCHEMA_VERSIONS,
  validateBatchManifest,
  validateImportBatch,
  assertContractOk,
} from "./contract-validator.ts";
export type { ContractValidationResult } from "./contract-validator.ts";

export {
  emptyBatch,
  createBatchFromParts,
  loadBatchFromJsonFile,
  buildPerformanceMockBatch,
} from "./batch-loader.ts";

export { DuplicateEngine, runDuplicateCheck } from "./duplicate-check.ts";

export {
  importDeveloperPreview,
  toDeveloperPreviewRow,
  uploadDeveloperAsset,
} from "./developer-import.ts";
export type { DeveloperImportResult } from "./developer-import.ts";

export {
  importProjectPreview,
  toProjectPreviewRow,
} from "./project-import.ts";
export type { ProjectImportResult } from "./project-import.ts";

export {
  importImagePreview,
  toImagePreviewRow,
  uploadImageToStorage,
} from "./asset-import.ts";
export type { ImageImportResult } from "./asset-import.ts";

export {
  normalizePdfCategory,
  importPdfPreview,
  toPdfPreviewRow,
  uploadPdfToStorage,
} from "./pdf-import.ts";
export type { PdfImportResult } from "./pdf-import.ts";

export { importNewsPreview, toNewsPreviewRow } from "./news-import.ts";
export type { NewsImportResult } from "./news-import.ts";

export {
  mapToReviewQueue,
  summarizeReviewQueue,
} from "./review-mapper.ts";
export type { ReviewQueueItem } from "./review-mapper.ts";

export {
  validateEvidence,
  validateHashes,
  validateSchemaFields,
  runValidationEngine,
} from "./validation-engine.ts";
export type { ValidationEngineResult } from "./validation-engine.ts";

export {
  buildApprovalCandidates,
  buildApprovalCandidatesFromQueue,
  approveCandidate,
  summarizeApprovalCandidates,
} from "./approval-engine.ts";

export {
  emptyEntityPreviewStats,
  accumulatePreviewStats,
  buildPreviewDashboard,
  formatPreviewDashboardText,
} from "./report.ts";
export type { PreviewDashboard } from "./report.ts";

export { ImportSession, runImportSession } from "./staging-session.ts";
export type {
  ImportSessionOptions,
  ImportSessionResult,
} from "./staging-session.ts";

export * from "./adapters/index.ts";
export { runGothImportPipeline } from "./adapters/goth-import-pipeline.ts";
export type {
  GothImportPipelineOptions,
  GothImportPipelineResult,
} from "./adapters/goth-import-pipeline.ts";
