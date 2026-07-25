/**
 * Commit plan builder — WOULD_* operations only. Never real SQL.
 */

import type {
  CommitOperation,
  CommitOperationType,
  SimulationResult,
  StoragePlanItem,
} from "./types.ts";
import { FORBIDDEN_COMMIT_OPERATION_TYPES } from "./types.ts";
import { StagingDbError } from "./errors.ts";
import type { IdempotencySummary } from "./idempotency.ts";
import type { TransactionPlan } from "./transaction.ts";
import type { RollbackPlan } from "./rollback-plan.ts";
import type { StagingAuditEvent, StagingImportSession } from "./types.ts";

export function assertCommitOpVocabulary(op: string): asserts op is CommitOperationType {
  if (
    (FORBIDDEN_COMMIT_OPERATION_TYPES as readonly string[]).includes(op)
  ) {
    throw new StagingDbError(
      "FORBIDDEN_COMMIT_OP",
      `Forbidden commit operation vocabulary: ${op}`,
      { op },
    );
  }
  const allowed: CommitOperationType[] = [
    "WOULD_INSERT",
    "WOULD_UPDATE",
    "WOULD_SKIP",
    "WOULD_LINK",
    "WOULD_CREATE_REVIEW",
    "WOULD_CREATE_AUDIT",
    "WOULD_PLAN_STORAGE",
    "WOULD_SOFT_DELETE_ON_ROLLBACK",
  ];
  if (!(allowed as string[]).includes(op)) {
    throw new StagingDbError(
      "UNKNOWN_COMMIT_OP",
      `Unknown commit operation: ${op}`,
      { op },
    );
  }
}

export type CommitPlanDocument = {
  status: "SIMULATED_ONLY";
  productionSafe: boolean;
  importSession: StagingImportSession;
  orderedOperations: CommitOperation[];
  entityCounts: {
    developers: number;
    projects: number;
    images: number;
    pdfs: number;
    news: number;
    review_items: number;
    duplicates: number;
    conflicts: number;
  };
  wouldInsert: number;
  wouldUpdate: number;
  wouldSkip: number;
  wouldReview: number;
  wouldReject: number;
  wouldQuarantine: number;
  transactionBoundary: TransactionPlan;
  rollbackStrategy: RollbackPlan;
  idempotencySummary: IdempotencySummary;
  auditEvents: StagingAuditEvent[];
  storagePlan: StoragePlanItem[];
  blockers: string[];
  warnings: string[];
  database_writes: 0;
  storage_uploads: 0;
  real_commit: false;
};

export function countOps(
  ops: CommitOperation[],
): Record<CommitOperationType, number> {
  const counts = {
    WOULD_INSERT: 0,
    WOULD_UPDATE: 0,
    WOULD_SKIP: 0,
    WOULD_LINK: 0,
    WOULD_CREATE_REVIEW: 0,
    WOULD_CREATE_AUDIT: 0,
    WOULD_PLAN_STORAGE: 0,
    WOULD_SOFT_DELETE_ON_ROLLBACK: 0,
  } satisfies Record<CommitOperationType, number>;
  for (const op of ops) {
    assertCommitOpVocabulary(op.op);
    counts[op.op] += 1;
  }
  return counts;
}

export function buildCommitPlanDocument(input: {
  importSession: StagingImportSession;
  orderedOperations: CommitOperation[];
  entityCounts: CommitPlanDocument["entityCounts"];
  wouldInsert: number;
  wouldUpdate: number;
  wouldSkip: number;
  wouldReview: number;
  wouldReject: number;
  wouldQuarantine: number;
  transactionBoundary: TransactionPlan;
  rollbackStrategy: RollbackPlan;
  idempotencySummary: IdempotencySummary;
  auditEvents: StagingAuditEvent[];
  storagePlan: StoragePlanItem[];
  blockers: string[];
  warnings: string[];
}): CommitPlanDocument {
  for (const op of input.orderedOperations) {
    assertCommitOpVocabulary(op.op);
  }
  return {
    status: "SIMULATED_ONLY",
    productionSafe: input.blockers.length === 0,
    importSession: input.importSession,
    orderedOperations: input.orderedOperations,
    entityCounts: input.entityCounts,
    wouldInsert: input.wouldInsert,
    wouldUpdate: input.wouldUpdate,
    wouldSkip: input.wouldSkip,
    wouldReview: input.wouldReview,
    wouldReject: input.wouldReject,
    wouldQuarantine: input.wouldQuarantine,
    transactionBoundary: input.transactionBoundary,
    rollbackStrategy: input.rollbackStrategy,
    idempotencySummary: input.idempotencySummary,
    auditEvents: input.auditEvents,
    storagePlan: input.storagePlan,
    blockers: input.blockers,
    warnings: input.warnings,
    database_writes: 0,
    storage_uploads: 0,
    real_commit: false,
  };
}

export function simulationResultFromPlan(
  plan: CommitPlanDocument,
  extras: {
    simulated_conflict_count: number;
    simulated_transaction_status: SimulationResult["simulated_transaction_status"];
    simulated_rollback_status: SimulationResult["simulated_rollback_status"];
  },
): SimulationResult {
  return {
    status: "SIMULATED_ONLY",
    batchId: plan.importSession.source_batch_id,
    importSessionId: plan.importSession.import_session_id,
    simulated_insert_count: plan.wouldInsert,
    simulated_update_count: plan.wouldUpdate,
    simulated_skip_count: plan.wouldSkip,
    simulated_review_count: plan.wouldReview,
    simulated_conflict_count: extras.simulated_conflict_count,
    simulated_audit_event_count: plan.auditEvents.length,
    simulated_storage_plan_count: plan.storagePlan.length,
    simulated_transaction_status: extras.simulated_transaction_status,
    simulated_rollback_status: extras.simulated_rollback_status,
    entity_counts: plan.entityCounts,
    database_writes: 0,
    storage_uploads: 0,
    production_connection: false,
    real_commit: false,
  };
}
