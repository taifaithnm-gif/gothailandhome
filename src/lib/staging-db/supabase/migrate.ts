/**
 * Controlled Staging migration apply (Session pooler only).
 * Separated from Batch Commit gates — STAGING_COMMIT_ENABLED must stay false.
 * Never logs passwords or full URIs.
 */

import { createHash } from "node:crypto";
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
  resolveStagingMigrationConnection,
  describeMigrationConnection,
} from "./migration-connection.ts";

export const EXPECTED_STAGING_MIGRATIONS = [
  "20260725_001_staging_import_sessions.sql",
  "20260725_002_staging_entities.sql",
  "20260725_003_staging_review_items.sql",
  "20260725_004_staging_audit_events.sql",
  "20260725_005_staging_indexes.sql",
  "20260725_006_staging_rls.sql",
  "20260725_007_staging_constraints.sql",
  "20260725_008_staging_commit_rpc.sql",
  "20260725_009_staging_rollback_rpc.sql",
  "20260726_010_staging_review_decisions.sql",
  "20260726_011_staging_review_decisions_rls.sql",
  "20260726_012_staging_review_decisions_constraints.sql",
] as const;

/** Original freeze set (001–009). Phase A appends decision migrations after this. */
export const FROZEN_STAGING_MIGRATIONS_V1 = [
  "20260725_001_staging_import_sessions.sql",
  "20260725_002_staging_entities.sql",
  "20260725_003_staging_review_items.sql",
  "20260725_004_staging_audit_events.sql",
  "20260725_005_staging_indexes.sql",
  "20260725_006_staging_rls.sql",
  "20260725_007_staging_constraints.sql",
  "20260725_008_staging_commit_rpc.sql",
  "20260725_009_staging_rollback_rpc.sql",
] as const;

export const EXPECTED_STAGING_TABLES = [
  "staging_import_sessions",
  "staging_developers",
  "staging_projects",
  "staging_assets",
  "staging_pdfs",
  "staging_news",
  "staging_duplicate_candidates",
  "staging_conflict_candidates",
  "staging_review_items",
  "staging_audit_events",
  "staging_review_decisions",
  "staging_review_decision_evidence",
  "staging_review_decision_changes",
  "staging_review_decision_audit",
] as const;

export const PHASE_A_DECISION_TABLES = [
  "staging_review_decisions",
  "staging_review_decision_evidence",
  "staging_review_decision_changes",
  "staging_review_decision_audit",
] as const;

export const PHASE_A_ROLLBACK_SQL_REL =
  "database/staging-rollback/20260726_review_decisions_rollback.sql" as const;

const HISTORY_DDL = `
CREATE TABLE IF NOT EXISTS staging_schema_migrations (
  filename TEXT PRIMARY KEY,
  checksum_sha256 TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_by TEXT NOT NULL,
  project_ref TEXT NOT NULL,
  connection_mode TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT TRUE
);
`;

export type MigrateGateInput = {
  confirmStaging: boolean;
  expectedProjectRef: string;
  connectionMode: string;
};

export function assertMigrateGates(
  input: MigrateGateInput,
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
  if (input.connectionMode !== "session-pooler") {
    throw new StagingEnvironmentBlockedError(
      "--connection-mode must be session-pooler",
    );
  }
  if (!input.expectedProjectRef.trim()) {
    throw new StagingEnvironmentBlockedError("--expected-project-ref required");
  }
  if (!snap.projectRef || snap.projectRef !== input.expectedProjectRef.trim()) {
    throw new StagingEnvironmentBlockedError(
      "STAGING_PROJECT_REF does not match --expected-project-ref",
    );
  }
  if (snap.stagingCommitEnabled) {
    throw new StagingEnvironmentBlockedError(
      "STAGING_COMMIT_ENABLED must be false during migration apply (permission separation)",
    );
  }
  if (snap.databaseConnectionMode !== "SESSION_POOLER") {
    throw new StagingEnvironmentBlockedError(
      "DATABASE_CONNECTION_MODE must be SESSION_POOLER",
    );
  }
  if (!snap.isolationOk) {
    throw new StagingEnvironmentBlockedError(
      snap.isolationFailures.join("; ") || "isolation failed",
    );
  }
}

export function listMigrationFiles(migrationsDir: string): {
  filename: string;
  absPath: string;
  checksum: string;
  sql: string;
}[] {
  const out = [];
  for (const filename of EXPECTED_STAGING_MIGRATIONS) {
    const absPath = path.join(migrationsDir, filename);
    if (!fs.existsSync(absPath)) {
      throw new StagingEnvironmentBlockedError(`Missing migration: ${filename}`);
    }
    const sql = fs.readFileSync(absPath, "utf8");
    if (!sql.includes("STAGING ONLY") || !sql.includes("DO NOT APPLY TO PRODUCTION")) {
      throw new StagingEnvironmentBlockedError(`Missing staging header: ${filename}`);
    }
    if (/\bDROP\s+TABLE\b/i.test(sql) || /\bTRUNCATE\b/i.test(sql) || /\bCASCADE\b/i.test(sql)) {
      throw new StagingEnvironmentBlockedError(`Forbidden SQL in ${filename}`);
    }
    const checksum = createHash("sha256").update(sql).digest("hex");
    out.push({ filename, absPath, checksum, sql });
  }
  // Ensure no extra unexpected sql files are required — extras ignored
  return out;
}

export type MigrationApplyResult = {
  status: "PASS" | "FAIL";
  projectRef: string;
  connection: Record<string, unknown>;
  migrationsExpected: number;
  migrationsApplied: number;
  migrationsSkipped: number;
  applied: { filename: string; checksum: string; action: "APPLIED" | "SKIPPED_SAME_CHECKSUM" }[];
  schemaWrites: number;
  businessDataWrites: 0;
  stagingCommitEnabled: false;
  error?: string;
  failedMigration?: string;
};

export async function applyStagingMigrations(input: {
  migrationsDir: string;
  gate: MigrateGateInput;
  env?: NodeJS.ProcessEnv;
}): Promise<MigrationApplyResult> {
  const env = input.env ?? process.env;
  assertMigrateGates(input.gate, env);
  const files = listMigrationFiles(input.migrationsDir);
  const conn = resolveStagingMigrationConnection(env);
  if (conn.mode !== "SESSION_POOLER") {
    throw new StagingEnvironmentBlockedError("Migration requires SESSION_POOLER");
  }

  const client = new pg.Client({
    host: conn.host,
    port: conn.port,
    user: conn.username,
    password: conn.password,
    database: conn.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20_000,
  });

  const applied: MigrationApplyResult["applied"] = [];
  let migrationsApplied = 0;
  let migrationsSkipped = 0;
  let schemaWrites = 0;

  try {
    await client.connect();
    (conn as { password: string }).password = "";

    await client.query(HISTORY_DDL);
    schemaWrites += 1;

    for (const file of files) {
      const existing = await client.query(
        `SELECT checksum_sha256 FROM staging_schema_migrations WHERE filename = $1`,
        [file.filename],
      );
      if (existing.rows[0]) {
        if (existing.rows[0].checksum_sha256 === file.checksum) {
          applied.push({
            filename: file.filename,
            checksum: file.checksum,
            action: "SKIPPED_SAME_CHECKSUM",
          });
          migrationsSkipped += 1;
          continue;
        }
        throw new StagingEnvironmentBlockedError(
          `Checksum mismatch for already-applied ${file.filename}`,
        );
      }

      try {
        await client.query("BEGIN");
        await client.query(file.sql);
        await client.query(
          `INSERT INTO staging_schema_migrations
            (filename, checksum_sha256, applied_by, project_ref, connection_mode, success)
           VALUES ($1, $2, $3, $4, $5, TRUE)`,
          [
            file.filename,
            file.checksum,
            conn.username,
            input.gate.expectedProjectRef,
            "SESSION_POOLER",
          ],
        );
        await client.query("COMMIT");
        applied.push({
          filename: file.filename,
          checksum: file.checksum,
          action: "APPLIED",
        });
        migrationsApplied += 1;
        schemaWrites += 1;
      } catch (err) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // ignore
        }
        const message = err instanceof Error ? err.message : String(err);
        return {
          status: "FAIL",
          projectRef: input.gate.expectedProjectRef,
          connection: describeMigrationConnection(env),
          migrationsExpected: files.length,
          migrationsApplied,
          migrationsSkipped,
          applied,
          schemaWrites,
          businessDataWrites: 0,
          stagingCommitEnabled: false,
          error: message.split("\n")[0],
          failedMigration: file.filename,
        };
      }
    }

    return {
      status: "PASS",
      projectRef: input.gate.expectedProjectRef,
      connection: describeMigrationConnection(env),
      migrationsExpected: files.length,
      migrationsApplied,
      migrationsSkipped,
      applied,
      schemaWrites,
      businessDataWrites: 0,
      stagingCommitEnabled: false,
    };
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
}
