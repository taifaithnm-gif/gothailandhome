/**
 * Staging schema verification after migrations.
 * Read-only against SESSION_POOLER. Never logs secrets.
 */

import pg from "pg";

import { StagingEnvironmentBlockedError } from "../errors.ts";
import { readStagingEnv } from "./environment.ts";
import { resolveStagingMigrationConnection } from "./migration-connection.ts";
import {
  EXPECTED_STAGING_MIGRATIONS,
  EXPECTED_STAGING_TABLES,
} from "./migrate.ts";

export type SchemaVerifyResult = {
  status: "PASS" | "FAIL";
  tables: Record<string, { exists: boolean; rls: boolean | null }>;
  migrationsHistory: { filename: string; present: boolean }[];
  rpc: {
    commit_staging_import_v1: boolean;
    rollback_staging_import_v1: boolean;
    search_path_fixed: boolean;
    public_execute_revoked: boolean;
  };
  constraints: {
    published_blocked_on_review: boolean;
    audit_no_updated_at: boolean;
    decision_audit_no_updated_at: boolean;
    decision_idempotency_unique: boolean;
    decision_active_unique: boolean;
  };
  errors: string[];
};

export async function verifyStagingSchema(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SchemaVerifyResult> {
  const snap = readStagingEnv(env);
  if (snap.databaseConnectionMode !== "SESSION_POOLER") {
    throw new StagingEnvironmentBlockedError("schema-verify requires SESSION_POOLER");
  }
  const conn = resolveStagingMigrationConnection(env);
  const client = new pg.Client({
    host: conn.host,
    port: conn.port,
    user: conn.username,
    password: conn.password,
    database: conn.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15_000,
  });

  const errors: string[] = [];
  const tables: SchemaVerifyResult["tables"] = {};
  const migrationsHistory: SchemaVerifyResult["migrationsHistory"] = [];

  try {
    await client.connect();
    (conn as { password: string }).password = "";

    for (const table of EXPECTED_STAGING_TABLES) {
      const exists = await client.query(
        `SELECT EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name=$1
         ) AS ok`,
        [table],
      );
      const present = Boolean(exists.rows[0]?.ok);
      let rls: boolean | null = null;
      if (present) {
        const r = await client.query(
          `SELECT c.relrowsecurity AS rls
             FROM pg_class c
             JOIN pg_namespace n ON n.oid=c.relnamespace
            WHERE n.nspname='public' AND c.relname=$1`,
          [table],
        );
        rls = Boolean(r.rows[0]?.rls);
        if (!rls) errors.push(`RLS_DISABLED:${table}`);
      } else {
        errors.push(`TABLE_MISSING:${table}`);
      }
      tables[table] = { exists: present, rls };
    }

    for (const filename of EXPECTED_STAGING_MIGRATIONS) {
      const r = await client.query(
        `SELECT 1 FROM staging_schema_migrations WHERE filename=$1`,
        [filename],
      );
      const present = (r.rowCount ?? 0) > 0;
      migrationsHistory.push({ filename, present });
      if (!present) errors.push(`HISTORY_MISSING:${filename}`);
    }

    const funcs = await client.query(
      `SELECT p.proname,
              pg_get_function_identity_arguments(p.oid) AS args,
              p.proconfig,
              has_function_privilege('public', p.oid, 'EXECUTE') AS public_exec
         FROM pg_proc p
         JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public'
          AND p.proname IN ('commit_staging_import_v1','rollback_staging_import_v1')`,
    );
    const byName = Object.fromEntries(
      funcs.rows.map((r) => [r.proname, r]),
    );
    const commit = byName.commit_staging_import_v1;
    const rollback = byName.rollback_staging_import_v1;
    const searchPathFixed = [commit, rollback].every(
      (f) =>
        Array.isArray(f?.proconfig) &&
        f.proconfig.some((c: string) => /search_path/i.test(c)),
    );
    const publicRevoked =
      commit &&
      rollback &&
      commit.public_exec === false &&
      rollback.public_exec === false;
    if (!commit) errors.push("RPC_MISSING:commit_staging_import_v1");
    if (!rollback) errors.push("RPC_MISSING:rollback_staging_import_v1");
    if (!searchPathFixed) errors.push("RPC_SEARCH_PATH_NOT_FIXED");
    if (!publicRevoked) errors.push("RPC_PUBLIC_EXECUTE_NOT_REVOKED");

    const reviewCheck = await client.query(
      `SELECT pg_get_constraintdef(oid) AS def
         FROM pg_constraint
        WHERE conrelid = 'public.staging_review_items'::regclass
          AND contype = 'c'`,
    );
    const allowsPublished = reviewCheck.rows.some((r) =>
      /'PUBLISHED'|'APPROVED'|'READY_FOR_PRODUCTION'/i.test(r.def),
    );
    const hasReviewStateCheck = reviewCheck.rows.some((r) =>
      /review_state/i.test(r.def),
    );
    const publishedBlocked = hasReviewStateCheck && !allowsPublished;
    if (allowsPublished) errors.push("REVIEW_ALLOWS_FORBIDDEN_STATES");
    if (!hasReviewStateCheck) errors.push("REVIEW_STATE_CHECK_MISSING");

    const auditCols = await client.query(
      `SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name='staging_audit_events'`,
    );
    const colNames = auditCols.rows.map((r) => r.column_name);
    const auditNoUpdated = !colNames.includes("updated_at") && !colNames.includes("deleted_at");
    if (!auditNoUpdated) errors.push("AUDIT_NOT_APPEND_ONLY_SHAPE");

    const decisionAuditCols = await client.query(
      `SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name='staging_review_decision_audit'`,
    );
    const decisionAuditNames = decisionAuditCols.rows.map((r) => r.column_name);
    const decisionAuditNoUpdated =
      decisionAuditNames.length === 0 ||
      (!decisionAuditNames.includes("updated_at") &&
        !decisionAuditNames.includes("deleted_at"));
    if (decisionAuditNames.length > 0 && !decisionAuditNoUpdated) {
      errors.push("DECISION_AUDIT_NOT_APPEND_ONLY_SHAPE");
    }

    const decisionIndexes = await client.query(
      `SELECT indexname FROM pg_indexes
        WHERE schemaname='public'
          AND tablename='staging_review_decisions'`,
    );
    const indexNames = decisionIndexes.rows.map((r) => r.indexname as string);
    const decisionIdempotencyUnique = indexNames.includes(
      "uq_staging_decision_idempotency",
    );
    const decisionActiveUnique = indexNames.includes(
      "uq_staging_decision_active_item",
    );
    if (tables.staging_review_decisions?.exists) {
      if (!decisionIdempotencyUnique) {
        errors.push("DECISION_IDEMPOTENCY_UNIQUE_MISSING");
      }
      if (!decisionActiveUnique) {
        errors.push("DECISION_ACTIVE_UNIQUE_MISSING");
      }
    }

    return {
      status: errors.length === 0 ? "PASS" : "FAIL",
      tables,
      migrationsHistory,
      rpc: {
        commit_staging_import_v1: Boolean(commit),
        rollback_staging_import_v1: Boolean(rollback),
        search_path_fixed: searchPathFixed,
        public_execute_revoked: Boolean(publicRevoked),
      },
      constraints: {
        published_blocked_on_review: publishedBlocked,
        audit_no_updated_at: auditNoUpdated,
        decision_audit_no_updated_at: decisionAuditNoUpdated,
        decision_idempotency_unique: decisionIdempotencyUnique,
        decision_active_unique: decisionActiveUnique,
      },
      errors,
    };
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
}
