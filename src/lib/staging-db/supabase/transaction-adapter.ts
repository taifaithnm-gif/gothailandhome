/**
 * Staging commit / rollback RPC adapter.
 * Real network calls only when staging is provisioned AND gates pass.
 * Default path throws StagingCommitDisabledError.
 */

import { createHash } from "node:crypto";

import {
  StagingCommitDisabledError,
  StagingEnvironmentBlockedError,
  StagingDbError,
} from "../errors.ts";
import {
  assertControlledCommitAllowed,
  type ControlledCommitGateInput,
  readStagingEnv,
} from "./environment.ts";
import { createStagingServiceClient } from "./client.ts";

export type StagingCommitRpcResult = {
  importSessionId: string;
  batchId: string;
  transactionId: string;
  insertedDevelopers: number;
  insertedProjects: number;
  insertedAssets: number;
  insertedPdfs: number;
  insertedNews: number;
  insertedReviewItems: number;
  insertedConflicts: number;
  insertedAuditEvents: number;
  skippedDuplicates: number;
  warnings: string[];
  committedAt: string;
  rollbackToken: string;
  databaseEnvironmentId: string;
  /** Always 0 in this milestone — storage upload is a separate milestone. */
  storageUploads: number;
};

export type StagingRollbackRpcResult = {
  importSessionId: string;
  softDeleted: number;
  status: "ROLLED_BACK";
  rolledBackAt: string;
  auditPreserved: true;
};

function buildRollbackToken(
  importSessionId: string,
  environmentId: string,
): string {
  return createHash("sha256")
    .update(`${importSessionId}|${environmentId}|staging-rollback-v1`)
    .digest("hex");
}

/**
 * Controlled commit via Postgres RPC `commit_staging_import_v1`.
 * Refuses when STAGING_COMMIT_ENABLED=false (default).
 */
export async function executeControlledStagingCommit(input: {
  gate: ControlledCommitGateInput;
  payload: Record<string, unknown>;
  env?: NodeJS.ProcessEnv;
}): Promise<StagingCommitRpcResult> {
  const env = input.env ?? process.env;
  const snap = readStagingEnv(env);
  if (!snap.stagingCommitEnabled) {
    throw new StagingCommitDisabledError("STAGING_COMMIT_DISABLED");
  }
  const verified = assertControlledCommitAllowed(input.gate, env);
  const clients = createStagingServiceClient(env);

  const { data, error } = await clients.service.rpc("commit_staging_import_v1", {
    payload: input.payload,
  });

  if (error) {
    throw new StagingDbError("GTH_DB_COMMIT_RPC_FAILED", error.message, {
      code: error.code,
    });
  }

  const row = (data ?? {}) as Record<string, unknown>;
  const importSessionId = String(row.import_session_id ?? row.importSessionId ?? "");
  if (!importSessionId) {
    throw new StagingDbError(
      "GTH_DB_COMMIT_RPC_INVALID_RESULT",
      "RPC returned no import_session_id",
    );
  }

  return {
    importSessionId,
    batchId: String(row.batch_id ?? row.batchId ?? input.gate.batchId),
    transactionId: String(row.transaction_id ?? row.transactionId ?? "unknown"),
    insertedDevelopers: Number(row.inserted_developers ?? 0),
    insertedProjects: Number(row.inserted_projects ?? 0),
    insertedAssets: Number(row.inserted_assets ?? 0),
    insertedPdfs: Number(row.inserted_pdfs ?? 0),
    insertedNews: Number(row.inserted_news ?? 0),
    insertedReviewItems: Number(row.inserted_review_items ?? 0),
    insertedConflicts: Number(row.inserted_conflicts ?? 0),
    insertedAuditEvents: Number(row.inserted_audit_events ?? 0),
    skippedDuplicates: Number(row.skipped_duplicates ?? 0),
    warnings: Array.isArray(row.warnings)
      ? (row.warnings as string[])
      : [],
    committedAt: String(row.committed_at ?? new Date().toISOString()),
    rollbackToken: buildRollbackToken(importSessionId, verified.environmentId!),
    databaseEnvironmentId: verified.environmentId!,
    storageUploads: 0,
  };
}

export async function executeStagingRollback(input: {
  importSessionId: string;
  rollbackToken: string;
  confirmStaging: boolean;
  env?: NodeJS.ProcessEnv;
}): Promise<StagingRollbackRpcResult> {
  const env = input.env ?? process.env;
  const snap = readStagingEnv(env);
  if (!input.confirmStaging) {
    throw new StagingEnvironmentBlockedError("explicit --confirm-staging required");
  }
  if (!snap.stagingCommitEnabled) {
    throw new StagingCommitDisabledError("STAGING_COMMIT_DISABLED");
  }
  if (!snap.provisioned || !snap.isolationOk) {
    throw new StagingEnvironmentBlockedError(
      "Staging not provisioned or isolation failed",
    );
  }
  const expected = buildRollbackToken(
    input.importSessionId,
    snap.environmentId!,
  );
  if (input.rollbackToken !== expected) {
    throw new StagingDbError(
      "GTH_DB_ROLLBACK_TOKEN_INVALID",
      "rollback token mismatch",
    );
  }

  const clients = createStagingServiceClient(env);
  const { data, error } = await clients.service.rpc("rollback_staging_import_v1", {
    p_import_session_id: input.importSessionId,
  });
  if (error) {
    throw new StagingDbError("GTH_DB_ROLLBACK_RPC_FAILED", error.message);
  }
  const row = (data ?? {}) as Record<string, unknown>;
  return {
    importSessionId: input.importSessionId,
    softDeleted: Number(row.soft_deleted ?? 0),
    status: "ROLLED_BACK",
    rolledBackAt: String(row.rolled_back_at ?? new Date().toISOString()),
    auditPreserved: true,
  };
}

/** Local mock of RPC success shape for unit tests (no network). */
export function simulateCommitRpcResult(input: {
  batchId: string;
  importSessionId: string;
  environmentId: string;
  counts: Partial<StagingCommitRpcResult>;
}): StagingCommitRpcResult {
  return {
    importSessionId: input.importSessionId,
    batchId: input.batchId,
    transactionId: `sim-tx-${input.importSessionId.slice(0, 8)}`,
    insertedDevelopers: input.counts.insertedDevelopers ?? 0,
    insertedProjects: input.counts.insertedProjects ?? 0,
    insertedAssets: input.counts.insertedAssets ?? 0,
    insertedPdfs: input.counts.insertedPdfs ?? 0,
    insertedNews: input.counts.insertedNews ?? 0,
    insertedReviewItems: input.counts.insertedReviewItems ?? 0,
    insertedConflicts: input.counts.insertedConflicts ?? 0,
    insertedAuditEvents: input.counts.insertedAuditEvents ?? 0,
    skippedDuplicates: input.counts.skippedDuplicates ?? 0,
    warnings: input.counts.warnings ?? [],
    committedAt: "2026-07-25T05:00:00.000Z",
    rollbackToken: buildRollbackToken(input.importSessionId, input.environmentId),
    databaseEnvironmentId: input.environmentId,
    storageUploads: 0,
  };
}

export { buildRollbackToken };
