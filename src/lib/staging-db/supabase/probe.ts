/**
 * Read-only Staging empty-DB probe.
 * Prefers STAGING_DATABASE_POOLER_URL (Session pooler); falls back to Direct only if unset.
 * Never commits. Never touches Production. Never logs passwords/URIs.
 */

import pg from "pg";

import {
  StagingEnvironmentBlockedError,
  ProductionWriteBlockedError,
} from "../errors.ts";
import { assertStagingClientMayConnect } from "./environment.ts";
import {
  describeStagingPgConnection,
  resolveStagingPgConnection,
} from "./connection.ts";

export type StagingProbeResult = {
  status: "STAGING_PROBE_PASS" | "STAGING_PROBE_FAIL";
  current_database: string | null;
  current_user: string | null;
  environment_id: string;
  project_ref: string;
  connection_target_host: string | null;
  DATABASE_CONNECTION_MODE: string;
  staging_tables_present: Record<string, boolean>;
  staging_tables_rls: Record<string, boolean | null>;
  production_table_access: "DENIED_OR_ABSENT" | "UNEXPECTED_ACCESS" | "ERROR";
  test_transaction: "ROLLED_BACK" | "FAIL";
  persistent_writes: 0;
  commit_enabled: boolean;
  notes: string[];
  errors: string[];
};

const EXPECTED_TABLES = [
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

/**
 * Live read-only probe. Leaves zero persistent rows.
 * Missing staging_* tables before migration apply is expected and not a failure.
 */
export async function runStagingEmptyDbProbe(
  env: NodeJS.ProcessEnv = process.env,
): Promise<StagingProbeResult> {
  const snap = assertStagingClientMayConnect(env);
  if (snap.productionDetected) {
    throw new ProductionWriteBlockedError(
      snap.productionBlockReasons.join("; ") || "production detected",
    );
  }

  const errors: string[] = [];
  const notes: string[] = [];
  const staging_tables_present: Record<string, boolean> = {};
  const staging_tables_rls: Record<string, boolean | null> = {};

  let current_database: string | null = null;
  let current_user: string | null = null;
  let connection_target_host: string | null = null;
  let connectionMode = snap.databaseConnectionMode;
  let production_table_access: StagingProbeResult["production_table_access"] =
    "DENIED_OR_ABSENT";
  let test_transaction: StagingProbeResult["test_transaction"] = "FAIL";

  let client: pg.Client | null = null;

  try {
    // Prefer pooler for live Probe / Migration / RLS on this Mac mini.
    if (!snap.databasePoolerUrlPresent) {
      throw new StagingEnvironmentBlockedError(
        "STAGING_DATABASE_POOLER_URL required for live probe on this host (Direct db.* is IPv6-only / not preferred)",
      );
    }
    const conn = resolveStagingPgConnection(env);
    if (conn.mode !== "SESSION_POOLER") {
      throw new StagingEnvironmentBlockedError(
        "Live probe requires SESSION_POOLER connection mode",
      );
    }
    connection_target_host = conn.host;
    connectionMode = conn.mode;
    notes.push(
      JSON.stringify(describeStagingPgConnection(conn)),
    );
    notes.push(
      `environment_marker=${snap.environmentId}; project_ref=${snap.projectRef}`,
    );

    client = new pg.Client({
      host: conn.host,
      port: conn.port,
      user: conn.username,
      password: conn.password,
      database: conn.database,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12_000,
    });
    await client.connect();
    // Drop password reference ASAP
    (conn as { password: string }).password = "";

    const idRow = await client.query(
      "SELECT current_database() AS db, current_user AS usr",
    );
    current_database = String(idRow.rows[0]?.db ?? "");
    current_user = String(idRow.rows[0]?.usr ?? "");

    for (const table of EXPECTED_TABLES) {
      const exists = await client.query(
        `SELECT EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = $1
         ) AS ok`,
        [table],
      );
      staging_tables_present[table] = Boolean(exists.rows[0]?.ok);

      if (staging_tables_present[table]) {
        const rls = await client.query(
          `SELECT c.relrowsecurity AS rls
             FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = $1`,
          [table],
        );
        staging_tables_rls[table] =
          rls.rows[0] == null ? null : Boolean(rls.rows[0].rls);
      } else {
        staging_tables_rls[table] = null;
      }
    }

    const presentCount = Object.values(staging_tables_present).filter(Boolean)
      .length;
    if (presentCount === 0) {
      notes.push(
        "staging_* tables absent — expected before APPLY_STAGING_MIGRATIONS",
      );
    }

    try {
      await client.query("SELECT 1 FROM public.developers LIMIT 1");
      production_table_access = "UNEXPECTED_ACCESS";
      errors.push(
        "public.developers is readable — refuse to treat as empty Staging probe PASS",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/does not exist|permission denied|row-level security/i.test(msg)) {
        production_table_access = "DENIED_OR_ABSENT";
        notes.push(`production_table_probe: ${msg.split("\n")[0]}`);
      } else {
        production_table_access = "ERROR";
        errors.push(`production_table_probe: ${msg}`);
      }
    }

    await client.query("BEGIN");
    await client.query("SELECT 1 AS probe_ok");
    await client.query("ROLLBACK");
    test_transaction = "ROLLED_BACK";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg.split("\n")[0] ?? msg);
  } finally {
    if (client) {
      try {
        await client.end();
      } catch {
        // ignore
      }
    }
  }

  const pass =
    Boolean(current_database) &&
    Boolean(current_user) &&
    test_transaction === "ROLLED_BACK" &&
    production_table_access === "DENIED_OR_ABSENT" &&
    connectionMode === "SESSION_POOLER" &&
    errors.length === 0;

  return {
    status: pass ? "STAGING_PROBE_PASS" : "STAGING_PROBE_FAIL",
    current_database,
    current_user,
    environment_id: snap.environmentId!,
    project_ref: snap.projectRef!,
    connection_target_host,
    DATABASE_CONNECTION_MODE: connectionMode,
    staging_tables_present,
    staging_tables_rls,
    production_table_access,
    test_transaction,
    persistent_writes: 0,
    commit_enabled: snap.stagingCommitEnabled,
    notes,
    errors,
  };
}
