/**
 * Transaction stub — V1 never commits.
 * Provides a dry-run transaction boundary for future staging DB writes.
 */

import { CommitNotImplementedError } from "./errors.ts";

export type TransactionOp = {
  op: "insert" | "update" | "noop";
  table: string;
  entityId: string;
  payload: Record<string, unknown>;
};

export type DryRunTransactionResult = {
  committed: false;
  applied: 0;
  stagedOps: TransactionOp[];
  message: string;
};

/**
 * Collect ops in memory. Commit always throws / returns not-committed.
 */
export class StagingTransaction {
  private readonly ops: TransactionOp[] = [];
  private sealed = false;

  stage(op: TransactionOp): void {
    if (this.sealed) {
      throw new CommitNotImplementedError();
    }
    this.ops.push(op);
  }

  list(): readonly TransactionOp[] {
    return this.ops;
  }

  /** Intentionally does not commit. */
  commit(): never {
    this.sealed = true;
    throw new CommitNotImplementedError();
  }

  /** Safe dry-run close — never writes. */
  finalizeDryRun(): DryRunTransactionResult {
    this.sealed = true;
    return {
      committed: false,
      applied: 0,
      stagedOps: [...this.ops],
      message: "Dry-run transaction finalized; no database writes",
    };
  }

  rollback(): void {
    this.ops.length = 0;
    this.sealed = false;
  }
}
