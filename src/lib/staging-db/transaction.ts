/**
 * Transaction model for staging commit.
 * Default: batch_atomic_transaction. Optional: entity_group_transaction.
 * Real commit is disabled — simulation only.
 */

import {
  StagingCommitDisabledError,
  TransactionFailedError,
} from "./errors.ts";
import type { MockStagingRepository } from "./mock-repository.ts";
import type { TransactionMode } from "./types.ts";

export type TransactionPhase =
  | "BEGIN"
  | "insert_import_session"
  | "insert_developers"
  | "insert_projects"
  | "insert_assets"
  | "insert_pdfs"
  | "insert_news"
  | "insert_review_items"
  | "insert_duplicates"
  | "insert_conflicts"
  | "insert_audit_events"
  | "update_import_session_status"
  | "COMMIT"
  | "ROLLBACK";

export const DEFAULT_TRANSACTION_PHASE_ORDER: readonly TransactionPhase[] = [
  "BEGIN",
  "insert_import_session",
  "insert_developers",
  "insert_projects",
  "insert_assets",
  "insert_pdfs",
  "insert_news",
  "insert_review_items",
  "insert_duplicates",
  "insert_conflicts",
  "insert_audit_events",
  "update_import_session_status",
  "COMMIT",
] as const;

export type SimulatedTransactionResult = {
  mode: TransactionMode;
  status: "SIMULATED_OK" | "SIMULATED_ROLLED_BACK";
  phasesCompleted: TransactionPhase[];
  failedPhase: TransactionPhase | null;
  failureReason: string | null;
  committed: false;
  partialCommit: false;
  databaseWrites: 0;
};

export type TransactionPlan = {
  mode: TransactionMode;
  defaultMode: "batch_atomic_transaction";
  optionalMode: "entity_group_transaction";
  phaseOrder: TransactionPhase[];
  atomic: true;
  allowPartialCommit: false;
  notes: string[];
};

export function buildTransactionPlan(
  mode: TransactionMode = "batch_atomic_transaction",
): TransactionPlan {
  return {
    mode,
    defaultMode: "batch_atomic_transaction",
    optionalMode: "entity_group_transaction",
    phaseOrder: [...DEFAULT_TRANSACTION_PHASE_ORDER],
    atomic: true,
    allowPartialCommit: false,
    notes: [
      "Any failure triggers full ROLLBACK",
      "Audit preservation on soft-delete rollback is a post-commit concern",
      "Real COMMIT is disabled in Design V1",
    ],
  };
}

/**
 * Run an ordered list of phase handlers inside a simulated atomic boundary.
 */
export async function runSimulatedBatchTransaction(
  repo: MockStagingRepository,
  phases: Array<{
    phase: TransactionPhase;
    run: () => Promise<void>;
  }>,
  options: {
    failAtPhase?: TransactionPhase;
    mode?: TransactionMode;
  } = {},
): Promise<SimulatedTransactionResult> {
  const mode = options.mode ?? "batch_atomic_transaction";
  const completed: TransactionPhase[] = [];
  repo.beginCheckpoint();
  completed.push("BEGIN");

  try {
    for (const step of phases) {
      if (options.failAtPhase && step.phase === options.failAtPhase) {
        throw new TransactionFailedError(step.phase, "injected failure");
      }
      await step.run();
      completed.push(step.phase);
    }
    completed.push("COMMIT");
    // Simulated only — never a real commit
    return {
      mode,
      status: "SIMULATED_OK",
      phasesCompleted: completed,
      failedPhase: null,
      failureReason: null,
      committed: false,
      partialCommit: false,
      databaseWrites: 0,
    };
  } catch (err) {
    repo.rollbackCheckpoint();
    completed.push("ROLLBACK");
    const reason = err instanceof Error ? err.message : String(err);
    const failedPhase =
      err instanceof TransactionFailedError
        ? ((err.details?.phase as TransactionPhase) ?? null)
        : (phases.find((p) => !completed.includes(p.phase))?.phase ?? null);
    return {
      mode,
      status: "SIMULATED_ROLLED_BACK",
      phasesCompleted: completed,
      failedPhase,
      failureReason: reason,
      committed: false,
      partialCommit: false,
      databaseWrites: 0,
    };
  }
}

/** Real commit entry — always throws. */
export function realCommit(): never {
  throw new StagingCommitDisabledError(
    "STAGING_COMMIT_DISABLED — Design V1 simulation only",
  );
}
