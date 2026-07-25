/**
 * Staging DB Commit Design V1 — public API.
 * Simulation only. Real commit disabled.
 */

export {
  STAGING_DB_DESIGN_VERSION,
  SIMULATION_STATUS,
  IMPORT_SESSION_STATUSES,
  MAX_SIMULATION_SESSION_STATUS,
  FORBIDDEN_SIMULATION_SESSION_STATUSES,
  ENTITY_STATUSES,
  STAGING_REVIEW_STATES,
  FORBIDDEN_COMMIT_REVIEW_STATES,
  ALLOWED_SIMULATION_STORAGE_STATUSES,
  FORBIDDEN_COMMIT_OPERATION_TYPES,
  SIMULATION_ACTOR_TYPES,
  STAGING_DB_HARD_FLAGS,
} from "./types.ts";
export type * from "./types.ts";

export {
  StagingDbError,
  ProductionWriteBlockedError,
  StagingCommitDisabledError,
  StagingEnvironmentBlockedError,
  InvalidReviewStateError,
  InvalidSessionStatusError,
  IdempotencyConflictError,
  PathTraversalBlockedError,
  TransactionFailedError,
  SchemaValidationError,
} from "./errors.ts";

export {
  checkProductionWriteBlock,
  assertProductionWriteBlocked,
  assertStagingWriteAllowed,
  assertRealCommitEnabled,
  createProductionBlockAuditEvent,
  stableStringify,
} from "./environment-guard.ts";

export {
  normalizeHexHash,
  computeContentHash,
  buildIdempotencyKey,
  evaluateIdempotency,
  summarizeIdempotency,
} from "./idempotency.ts";
export type {
  IdempotencyKeyParts,
  IdempotencyEvaluateInput,
  IdempotencyEvaluateResult,
  IdempotencySummary,
} from "./idempotency.ts";

export {
  assertRelativeSafePath,
  sanitizeFilename,
  buildStorageObjectPath,
} from "./path-safety.ts";

export { MockStagingRepository } from "./mock-repository.ts";
export type {
  StagingUnitOfWork,
  StagingTablesSnapshot,
  ImportSessionRepository,
  DeveloperRepository,
  ProjectRepository,
  AssetRepository,
  PdfRepository,
  NewsRepository,
  ReviewRepository,
  AuditRepository,
} from "./repository.ts";

export {
  DEFAULT_TRANSACTION_PHASE_ORDER,
  buildTransactionPlan,
  runSimulatedBatchTransaction,
  realCommit,
} from "./transaction.ts";
export type {
  TransactionPhase,
  SimulatedTransactionResult,
  TransactionPlan,
} from "./transaction.ts";

export {
  planStorageItem,
  buildStoragePlanDocument,
  assertSimulationStorageStatus,
} from "./storage-plan.ts";
export type { StoragePlanInput, StoragePlanDocument } from "./storage-plan.ts";

export { buildRollbackPlan } from "./rollback-plan.ts";
export type { RollbackPlan } from "./rollback-plan.ts";

export {
  assertCommitOpVocabulary,
  buildCommitPlanDocument,
  countOps,
  simulationResultFromPlan,
} from "./commit-plan.ts";
export type { CommitPlanDocument } from "./commit-plan.ts";

export {
  loadBatchCommitInputFromReviewConsole,
  simulateCommit,
  attemptRealCommit,
  writeSimulationOutputs,
} from "./commit-simulator.ts";
export type {
  BatchCommitInput,
  CommitSimulationBundle,
} from "./commit-simulator.ts";

export {
  isAllowedStagingReviewState,
  assertAllowedStagingReviewState,
  reviewerActionToState,
  assertApproverActionBlocked,
  assertAutomationCannotApproveOrPublish,
  REVIEWER_ACTIONS,
} from "./review-repository.ts";
export type { ReviewerAction, ApproverAction } from "./review-repository.ts";

export { buildAuditEvent, assertSimulationActor } from "./audit-repository.ts";
export { assertSessionSimulationCeiling } from "./import-session-repository.ts";
