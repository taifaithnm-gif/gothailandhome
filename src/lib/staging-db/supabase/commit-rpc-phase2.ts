/**
 * Apply CONTROLLED_COMMIT_RPC_PHASE2 function body.
 * Does not modify frozen staging migrations 001–009.
 * Session pooler only. STAGING_COMMIT_ENABLED must be false during apply.
 */

import fs from "node:fs";
import path from "node:path";

import pg from "pg";

import { ProductionWriteBlockedError, StagingEnvironmentBlockedError } from "../errors.ts";
import {
  assertProductionWriteBlocked,
  checkProductionWriteBlock,
} from "../environment-guard.ts";
import { readStagingEnv } from "./environment.ts";
import {
  describeMigrationConnection,
  resolveStagingMigrationConnection,
} from "./migration-connection.ts";

export const COMMIT_RPC_PHASE2_SQL_REL =
  "database/staging-rpc/commit_staging_import_v1_phase2.sql";

export type CommitRpcPhase2ApplyResult = {
  status: "PASS" | "FAIL";
  milestone: "CONTROLLED_COMMIT_RPC_PHASE2";
  projectRef: string;
  connection: Record<string, unknown>;
  sqlFile: string;
  functionReplaced: boolean;
  entityInsertMarkers: string[];
  schemaWrites: 0;
  migrationFilesTouched: 0;
  businessDataWrites: 0;
  error?: string;
};

export function assertCommitRpcPhase2Gates(
  input: { confirmStaging: boolean },
  env: NodeJS.ProcessEnv = process.env,
): void {
  assertProductionWriteBlocked(env);
  const snap = readStagingEnv(env);
  const prod = checkProductionWriteBlock(env, {
    hostname: snap.supabaseUrl ? new URL(snap.supabaseUrl).hostname : undefined,
  });
  if (prod.blocked || snap.productionDetected) {
    throw new ProductionWriteBlockedError(
      [...prod.reasons, ...snap.productionBlockReasons].join("; ") ||
        "production detected",
    );
  }
  if (!input.confirmStaging) {
    throw new StagingEnvironmentBlockedError("--confirm-staging required");
  }
  if (snap.stagingCommitEnabled) {
    throw new StagingEnvironmentBlockedError(
      "STAGING_COMMIT_ENABLED must be false during RPC phase2 apply",
    );
  }
  if (snap.databaseConnectionMode !== "SESSION_POOLER") {
    throw new StagingEnvironmentBlockedError(
      "DATABASE_CONNECTION_MODE must be SESSION_POOLER",
    );
  }
  if (!snap.isolationOk || !snap.provisioned) {
    throw new StagingEnvironmentBlockedError(
      snap.isolationFailures.join("; ") || "staging isolation failed",
    );
  }
}

export async function applyCommitRpcPhase2(input: {
  repoRoot: string;
  confirmStaging: boolean;
  env?: NodeJS.ProcessEnv;
}): Promise<CommitRpcPhase2ApplyResult> {
  const env = input.env ?? process.env;
  assertCommitRpcPhase2Gates({ confirmStaging: input.confirmStaging }, env);
  const snap = readStagingEnv(env);
  const sqlPath = path.join(input.repoRoot, COMMIT_RPC_PHASE2_SQL_REL);
  if (!fs.existsSync(sqlPath)) {
    throw new StagingEnvironmentBlockedError(`Missing ${COMMIT_RPC_PHASE2_SQL_REL}`);
  }
  const sql = fs.readFileSync(sqlPath, "utf8");
  if (!sql.includes("STAGING ONLY") || !sql.includes("DO NOT APPLY TO PRODUCTION")) {
    throw new StagingEnvironmentBlockedError("Phase2 SQL missing staging headers");
  }
  if (/\bDROP\s+TABLE\b/i.test(sql) || /\bTRUNCATE\b/i.test(sql) || /\bCASCADE\b/i.test(sql)) {
    throw new StagingEnvironmentBlockedError("Forbidden SQL in phase2 RPC file");
  }
  if (/\bALTER\s+TABLE\b/i.test(sql) || /\bCREATE\s+TABLE\b/i.test(sql)) {
    throw new StagingEnvironmentBlockedError(
      "Phase2 may only REPLACE commit function — no schema DDL",
    );
  }

  const markers = [
    "staging_developers",
    "staging_projects",
    "staging_assets",
    "staging_pdfs",
    "staging_news",
    "staging_review_items",
    "staging_conflict_candidates",
    "staging_audit_events",
  ].filter((m) => sql.includes(`INSERT INTO ${m}`));

  const conn = resolveStagingMigrationConnection(env);
  const client = new pg.Client({
    host: conn.host,
    port: conn.port,
    user: conn.username,
    password: conn.password,
    database: conn.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
  });

  try {
    await client.connect();
    (conn as { password: string }).password = "";
    await client.query(sql);
    const probe = await client.query(
      `SELECT pg_get_functiondef(p.oid) AS def
       FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'public' AND p.proname = 'commit_staging_import_v1'`,
    );
    const def = String(probe.rows[0]?.def ?? "");
    const functionReplaced =
      def.includes("CONTROLLED_COMMIT_RPC_PHASE2") ||
      def.includes("staging_developers");
    if (!functionReplaced) {
      return {
        status: "FAIL",
        milestone: "CONTROLLED_COMMIT_RPC_PHASE2",
        projectRef: snap.projectRef!,
        connection: describeMigrationConnection(env),
        sqlFile: COMMIT_RPC_PHASE2_SQL_REL,
        functionReplaced: false,
        entityInsertMarkers: markers,
        schemaWrites: 0,
        migrationFilesTouched: 0,
        businessDataWrites: 0,
        error: "Function body missing entity insert markers after apply",
      };
    }
    return {
      status: "PASS",
      milestone: "CONTROLLED_COMMIT_RPC_PHASE2",
      projectRef: snap.projectRef!,
      connection: describeMigrationConnection(env),
      sqlFile: COMMIT_RPC_PHASE2_SQL_REL,
      functionReplaced: true,
      entityInsertMarkers: markers,
      schemaWrites: 0,
      migrationFilesTouched: 0,
      businessDataWrites: 0,
    };
  } catch (err) {
    return {
      status: "FAIL",
      milestone: "CONTROLLED_COMMIT_RPC_PHASE2",
      projectRef: snap.projectRef ?? "unknown",
      connection: describeMigrationConnection(env),
      sqlFile: COMMIT_RPC_PHASE2_SQL_REL,
      functionReplaced: false,
      entityInsertMarkers: markers,
      schemaWrites: 0,
      migrationFilesTouched: 0,
      businessDataWrites: 0,
      error: err instanceof Error ? err.message.split("\n")[0] : String(err),
    };
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
}
