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
  ReviewVersionConflictError,
  StagingNotProvisionedError,
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
  DECISION_FAMILIES,
  DECISION_ACTIONS_BY_FAMILY,
  DECISION_STATUSES,
  DECISION_RISK_LEVELS,
  DECISION_TARGET_TYPES,
  DECISION_EVIDENCE_KINDS,
  REVIEW_DECISION_ROLES,
  REVIEW_DECISION_DB_ROLES,
} from "./decision-types.ts";
export type {
  DecisionFamily,
  DecisionAction,
  DecisionStatus,
  DecisionRiskLevel,
  DecisionTargetType,
  DecisionEvidenceKind,
  ReviewDecisionRole,
  StagingReviewDecision,
  StagingReviewDecisionEvidence,
  StagingReviewDecisionChange,
  StagingReviewDecisionAudit,
  CreateDecisionDraftInput,
  ListDecisionsFilter,
} from "./decision-types.ts";

export type { DecisionRepository } from "./decision-repository.ts";
export { MockDecisionRepository } from "./mock-decision-repository.ts";
export {
  validateCreateDecisionDraft,
  isDecisionFamily,
  isDecisionStatus,
  isDecisionRiskLevel,
  isDecisionTargetType,
  isDecisionEvidenceKind,
  isActionAllowedForFamily,
} from "./decision-validation.ts";
export { buildDecisionIdempotencyKey } from "./decision-idempotency.ts";
export type { DecisionIdempotencyKeyParts } from "./decision-idempotency.ts";

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
  PHASE2_COMMIT_CONTRACT_VERSION,
  PHASE2_ARTIFACT_GENERATOR_VERSION,
  EXPECTED_SOURCE_SEALED_DIGEST,
  EXPECTED_PHASE2_COUNTS,
  BATCH001_FROZEN_GENERATED_AT,
  auditV1CommitPayload,
  locateBatch001Inputs,
  buildPhase2ImportSessionEnvelope,
  buildPhase2CommitArtifact,
  verifyPhase2CommitArtifact,
  validatePhase2RpcCompatibility,
  validateReferenceIntegrity,
} from "./phase2-commit-artifact.ts";
export type {
  GateStatus,
  SourceInputRow,
  Phase2RpcPayload,
} from "./phase2-commit-artifact.ts";

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

export {
  REVIEW_PERSISTENCE_ALLOWED_STATES,
  actionToState,
  assertReviewMutationAllowed,
  applyReviewMutationLocal,
  REVIEW_API_CONTRACT,
  ReviewAuthRequiredError,
} from "./review-persistence.ts";
export type {
  ReviewMutationAction,
  ReviewMutationRequest,
  ReviewMutationResult,
} from "./review-persistence.ts";

/** Supabase adapters: import from `@/lib/staging-db/supabase` in server/CLI only. */
