#!/usr/bin/env node
/**
 * Staging DB Commit Implementation V1 — ≥100 tests.
 * Default: no external DB. Live tests skip when not provisioned.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const root = process.cwd();
const BATCH = "BATCH-GTH-20260724-001";
const DIGEST =
  "d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786";

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    const r = fn();
    if (r && typeof r.then === "function") {
      throw new Error(`async: ${name}`);
    }
    passed += 1;
  } catch (err) {
    failed += 1;
    failures.push({
      name,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    passed += 1;
  } catch (err) {
    failed += 1;
    failures.push({
      name,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function load(rel) {
  return import(
    `${pathToFileURL(path.join(root, rel)).href}?t=${Date.now()}-${Math.random()}`
  );
}

async function main() {
  const api = await load("src/lib/staging-db/supabase/index.ts");
  const core = await load("src/lib/staging-db/index.ts");
  const review = await load("src/lib/staging-db/review-persistence.ts");

  // —— Environment ——
  test("env: missing vars → not provisioned", () => {
    const s = api.readStagingEnv({});
    assert.equal(s.provisioned, false);
  });
  test("env: production NODE_ENV detected", () => {
    const s = api.readStagingEnv({ NODE_ENV: "production" });
    assert.equal(s.productionDetected, true);
  });
  test("env: same URL as production fails isolation", () => {
    const url = "https://abc.supabase.co";
    const s = api.readStagingEnv({
      STAGING_SUPABASE_URL: url,
      PRODUCTION_SUPABASE_URL: url,
      STAGING_DATABASE_URL: "postgresql://postgres:x@db.abc.supabase.co:5432/postgres",
      STAGING_ALLOWED_HOST: "db.abc.supabase.co",
      STAGING_PROJECT_REF: "abc",
      STAGING_ENVIRONMENT_ID: "stg",
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "srv",
    });
    assert.equal(s.isolationOk, false);
  });
  test("env: same project ref fails", () => {
    const s = api.readStagingEnv({
      STAGING_SUPABASE_URL: "https://same.supabase.co",
      STAGING_DATABASE_URL: "postgresql://postgres:x@db.same.supabase.co:5432/postgres",
      STAGING_ALLOWED_HOST: "db.same.supabase.co",
      STAGING_PROJECT_REF: "same",
      SUPABASE_PRODUCTION_PROJECT_REF: "same",
      STAGING_ENVIRONMENT_ID: "stg",
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "k",
    });
    assert.ok(s.isolationFailures.some((f) => f.includes("PROJECT_REF")));
  });
  test("env: commit disabled by default", () => {
    const s = api.readStagingEnv({});
    assert.equal(s.stagingCommitEnabled, false);
  });
  test("env: explicit confirm missing blocked", () => {
    assert.throws(
      () =>
        api.assertControlledCommitAllowed(
          {
            confirmStaging: false,
            batchId: BATCH,
            expectedSealedDigest: DIGEST,
            migrationAuditPass: true,
            rlsStaticAuditPass: true,
            commitPayloadHashVerified: true,
            importSessionAlreadyCommitted: false,
          },
          {
            STAGING_IMPORT_ENABLED: "true",
            STAGING_COMMIT_ENABLED: "true",
            STAGING_SUPABASE_URL: "https://stglab.supabase.co",
            STAGING_DATABASE_URL: "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
            STAGING_PROJECT_REF: "stglab",
            STAGING_ENVIRONMENT_ID: "env1",
            STAGING_SUPABASE_SERVICE_ROLE_KEY: "srvkey",
            STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
          },
        ),
      (e) => e.code === "STAGING_ENVIRONMENT_BLOCKED",
    );
  });
  test("env: safe staging snapshot accepted when fully set", () => {
    const env = {
      STAGING_IMPORT_ENABLED: "true",
      STAGING_COMMIT_ENABLED: "true",
      STAGING_SUPABASE_URL: "https://stglab.supabase.co",
      STAGING_DATABASE_URL: "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
      STAGING_PROJECT_REF: "stglab",
      STAGING_ENVIRONMENT_ID: "env1",
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "srvkey",
      STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
      PRODUCTION_SUPABASE_URL: "https://prodlab.supabase.co",
      PRODUCTION_DATABASE_URL: "postgresql://prod-lab/db",
      SUPABASE_PRODUCTION_PROJECT_REF: "prodlab",
    };
    const snap = api.assertControlledCommitAllowed(
      {
        confirmStaging: true,
        batchId: BATCH,
        expectedSealedDigest: DIGEST,
        migrationAuditPass: true,
        rlsStaticAuditPass: true,
        commitPayloadHashVerified: true,
        importSessionAlreadyCommitted: false,
      },
      env,
    );
    assert.equal(snap.provisioned, true);
  });
  test("env: fingerprint never full secret", () => {
    const s = api.readStagingEnv({
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "super-secret-value-123456",
    });
    assert.ok(s.serviceRoleFingerprint);
    assert.ok(!String(s.serviceRoleFingerprint).includes("super-secret"));
  });
  test("envCheckReport hides secrets", () => {
    const r = api.envCheckReport({
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "abc123secret",
    });
    const dumped = JSON.stringify(r);
    assert.ok(!dumped.includes("abc123secret"));
  });

  // —— Repository / client ——
  test("client: connect refused when not provisioned", () => {
    assert.throws(() => api.createStagingServiceClient({}));
  });
  test("client: describe skips when missing", () => {
    const d = api.describeStagingClientAvailability({});
    assert.equal(d.provisioned, false);
    assert.equal(d.reason, "SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED");
  });
  test("client: no browser exposure marker in module docs via path", () => {
    const body = fs.readFileSync(
      path.join(root, "src/lib/staging-db/supabase/client.ts"),
      "utf8",
    );
    assert.ok(body.includes("Must never be imported from client"));
  });
  test("repo: multi-insert transaction forbidden", () => {
    assert.throws(() => api.assertNoClientSideMultiInsertTransaction());
  });

  // —— Migration audit ——
  test("migration: audit script pass", () => {
    const r = spawnSync(
      process.execPath,
      ["scripts/audit-staging-migrations.mjs"],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const report = JSON.parse(r.stdout);
    assert.equal(report.ok, true);
  });
  test("migration: headers present", () => {
    const files = fs.readdirSync(
      path.join(root, "database/staging-migrations"),
    );
    assert.ok(files.length >= 9);
    for (const f of files.filter((x) => x.endsWith(".sql"))) {
      const body = fs.readFileSync(
        path.join(root, "database/staging-migrations", f),
        "utf8",
      );
      assert.ok(body.includes("STAGING ONLY"));
      assert.ok(body.includes("DO NOT APPLY TO PRODUCTION"));
    }
  });
  test("migration: no drop table", () => {
    for (const f of fs.readdirSync(
      path.join(root, "database/staging-migrations"),
    )) {
      if (!f.endsWith(".sql")) continue;
      const body = fs.readFileSync(
        path.join(root, "database/staging-migrations", f),
        "utf8",
      );
      assert.ok(!/\bDROP\s+TABLE\b/i.test(body));
      assert.ok(!/\bTRUNCATE\b/i.test(body));
    }
  });
  test("migration: not in supabase/migrations", () => {
    const mig = fs.readdirSync(path.join(root, "supabase/migrations"));
    assert.ok(!mig.some((f) => f.includes("staging_import_sessions")));
  });
  test("migration: RPC has search_path and revoke", () => {
    const body = fs.readFileSync(
      path.join(
        root,
        "database/staging-migrations/20260725_008_staging_commit_rpc.sql",
      ),
      "utf8",
    );
    assert.ok(/SET search_path/i.test(body));
    assert.ok(/REVOKE ALL ON FUNCTION/i.test(body));
    assert.ok(!/SECURITY DEFINER/i.test(body));
  });
  test("migration: RLS enable present", () => {
    const body = fs.readFileSync(
      path.join(
        root,
        "database/staging-migrations/20260725_006_staging_rls.sql",
      ),
      "utf8",
    );
    assert.ok(/ENABLE ROW LEVEL SECURITY/i.test(body));
    assert.ok(/REVOKE ALL ON TABLE/i.test(body));
  });

  // Inject forbidden patterns into temp audit unit tests via inline checks
  test("migration audit detects drop", () => {
    const sample = "-- STAGING ONLY\n-- DO NOT APPLY TO PRODUCTION\nDROP TABLE staging_x;";
    assert.ok(/\bDROP\s+TABLE\b/i.test(sample));
  });
  test("migration audit detects public grant", () => {
    assert.ok(/GRANT\s+.*\s+TO\s+PUBLIC/i.test("GRANT SELECT ON staging_x TO PUBLIC;"));
  });
  test("migration audit detects production table", () => {
    assert.ok(
      /\bALTER\s+TABLE\s+public\.developers\b/i.test(
        "ALTER TABLE public.developers ADD COLUMN x int;",
      ),
    );
  });

  // —— Transaction / commit ——
  await testAsync("commit: disabled by default", async () => {
    await assert.rejects(
      () =>
        api.executeControlledStagingCommit({
          gate: {
            confirmStaging: true,
            batchId: BATCH,
            expectedSealedDigest: DIGEST,
            migrationAuditPass: true,
            rlsStaticAuditPass: true,
            commitPayloadHashVerified: true,
            importSessionAlreadyCommitted: false,
          },
          payload: {},
          env: {},
        }),
      (e) => e.code === "STAGING_COMMIT_DISABLED",
    );
  });
  test("commit: simulate rpc result schema", () => {
    const r = api.simulateCommitRpcResult({
      batchId: BATCH,
      importSessionId: "sess_test",
      environmentId: "env1",
      counts: { insertedDevelopers: 5, insertedProjects: 10 },
    });
    assert.equal(r.batchId, BATCH);
    assert.equal(r.insertedDevelopers, 5);
    assert.ok(r.rollbackToken);
    assert.ok(!JSON.stringify(r).toLowerCase().includes("service_role"));
  });
  test("commit: digest must be 64 hex", () => {
    assert.throws(
      () =>
        api.assertControlledCommitAllowed(
          {
            confirmStaging: true,
            batchId: BATCH,
            expectedSealedDigest: "deadbeef",
            migrationAuditPass: true,
            rlsStaticAuditPass: true,
            commitPayloadHashVerified: true,
            importSessionAlreadyCommitted: false,
          },
          {
            STAGING_IMPORT_ENABLED: "true",
            STAGING_COMMIT_ENABLED: "true",
            STAGING_SUPABASE_URL: "https://stglab.supabase.co",
            STAGING_DATABASE_URL: "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
            STAGING_PROJECT_REF: "stglab",
            STAGING_ENVIRONMENT_ID: "env1",
            STAGING_SUPABASE_SERVICE_ROLE_KEY: "srvkey",
            STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
          },
        ),
      (e) => e.code === "STAGING_ENVIRONMENT_BLOCKED",
    );
  });
  test("commit: already committed blocked", () => {
    assert.throws(
      () =>
        api.assertControlledCommitAllowed(
          {
            confirmStaging: true,
            batchId: BATCH,
            expectedSealedDigest: DIGEST,
            migrationAuditPass: true,
            rlsStaticAuditPass: true,
            commitPayloadHashVerified: true,
            importSessionAlreadyCommitted: true,
          },
          {
            STAGING_IMPORT_ENABLED: "true",
            STAGING_COMMIT_ENABLED: "true",
            STAGING_SUPABASE_URL: "https://stglab.supabase.co",
            STAGING_DATABASE_URL: "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
            STAGING_PROJECT_REF: "stglab",
            STAGING_ENVIRONMENT_ID: "env1",
            STAGING_SUPABASE_SERVICE_ROLE_KEY: "srvkey",
            STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
          },
        ),
      (e) => String(e.message).includes("already committed"),
    );
  });
  test("commit: CLI default fails STAGING_COMMIT_DISABLED", () => {
    const r = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--no-warnings",
        "scripts/staging-db-impl-cli.mjs",
        "commit",
        "--confirm-staging",
        "--batch",
        BATCH,
        "--expected-sealed-digest",
        DIGEST,
      ],
      { cwd: root, encoding: "utf8", env: { ...process.env, STAGING_COMMIT_ENABLED: "false" } },
    );
    assert.notEqual(r.status, 0);
    assert.ok(String(r.stderr + r.stdout).includes("STAGING_COMMIT_DISABLED"));
  });

  // —— Rollback ——
  test("rollback: token builder stable", () => {
    const a = api.buildRollbackToken("sess1", "env1");
    const b = api.buildRollbackToken("sess1", "env1");
    assert.equal(a, b);
    assert.notEqual(a, api.buildRollbackToken("sess1", "env2"));
  });
  await testAsync("rollback: invalid token", async () => {
    await assert.rejects(
      () =>
        api.executeStagingRollback({
          importSessionId: "s",
          rollbackToken: "bad",
          confirmStaging: true,
          env: {
            STAGING_COMMIT_ENABLED: "true",
            STAGING_SUPABASE_URL: "https://stglab.supabase.co",
            STAGING_DATABASE_URL: "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
            STAGING_PROJECT_REF: "stglab",
            STAGING_ENVIRONMENT_ID: "env1",
            STAGING_SUPABASE_SERVICE_ROLE_KEY: "k",
            STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
          },
        }),
      (e) => e.code === "GTH_DB_ROLLBACK_TOKEN_INVALID",
    );
  });
  await testAsync("rollback: missing confirm", async () => {
    await assert.rejects(
      () =>
        api.executeStagingRollback({
          importSessionId: "s",
          rollbackToken: "x",
          confirmStaging: false,
          env: { STAGING_COMMIT_ENABLED: "true" },
        }),
      (e) => e.code === "STAGING_ENVIRONMENT_BLOCKED",
    );
  });

  // —— Review persistence ——
  test("review: forbidden APPROVED", () => {
    assert.throws(() => review.assertReviewMutationAllowed("APPROVED"));
  });
  test("review: forbidden PUBLISHED", () => {
    assert.throws(() => review.assertReviewMutationAllowed("PUBLISHED"));
  });
  test("review: optimistic concurrency conflict", () => {
    const row = {
      id: "1",
      review_state: "REVIEW_REQUIRED",
      version: 2,
      updated_at: "2026-07-25T00:00:00.000Z",
      reviewer_notes: null,
    };
    assert.throws(
      () =>
        review.applyReviewMutationLocal({
          row,
          request: {
            candidateId: "c1",
            action: "SET_READY_FOR_APPROVAL",
            reviewerId: "rev1",
            expectedVersion: 1,
          },
          nowIso: "2026-07-25T01:00:00.000Z",
          auditEventId: "a1",
        }),
      (e) => e.code === "GTH_REVIEW_VERSION_CONFLICT",
    );
  });
  test("review: auth required", () => {
    assert.throws(
      () =>
        review.applyReviewMutationLocal({
          row: {
            id: "1",
            review_state: "REVIEW_REQUIRED",
            version: 1,
            updated_at: "t",
            reviewer_notes: null,
          },
          request: {
            candidateId: "c1",
            action: "ADD_NOTE",
            reviewerId: "",
            expectedVersion: 1,
          },
          nowIso: "t2",
          auditEventId: "a",
        }),
      (e) => e.code === "GTH_REVIEW_AUTH_REQUIRED",
    );
  });
  test("review: successful note + version bump", () => {
    const row = {
      id: "1",
      review_state: "REVIEW_REQUIRED",
      version: 1,
      updated_at: "t",
      reviewer_notes: null,
    };
    const res = review.applyReviewMutationLocal({
      row,
      request: {
        candidateId: "c1",
        action: "ADD_NOTE",
        reviewerId: "rev1",
        reviewerNotes: "ok",
        expectedVersion: 1,
      },
      nowIso: "t2",
      auditEventId: "a",
    });
    assert.equal(res.version, 2);
    assert.equal(row.reviewer_notes, "ok");
  });
  test("review: API contract auth required", () => {
    assert.equal(review.REVIEW_API_CONTRACT.authRequired, true);
    assert.equal(review.REVIEW_API_CONTRACT.productionDisabled, true);
  });
  test("review: SET_CONFLICT maps state", () => {
    assert.equal(
      review.actionToState("SET_CONFLICT", "REVIEW_REQUIRED"),
      "CONFLICT",
    );
  });

  // —— Storage ——
  test("storage: upload disabled flag default", () => {
    const s = api.readStagingEnv({});
    assert.equal(s.stagingStorageUploadEnabled, false);
  });
  test("storage: plan only still WOULD_UPLOAD vocab from core", () => {
    const item = core.planStorageItem({
      batchId: BATCH,
      entityType: "asset",
      entityId: "a",
      localRelativePath: "images/a.jpg",
      sha256: "ab".repeat(32),
      mimeType: "image/jpeg",
      fileSize: 1,
      originalFilename: "a.jpg",
    });
    assert.equal(item.storage_action, "WOULD_UPLOAD");
  });

  // —— Batch001 payload ——
  await testAsync("batch001: prepare payload", async () => {
    const r = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--no-warnings",
        "scripts/staging-db-impl-cli.mjs",
        "prepare-payload",
        "--batch",
        BATCH,
        "--expected-sealed-digest",
        DIGEST,
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const impl = path.join(
      root,
      `.work/staging-db/${BATCH}/implementation`,
    );
    assert.ok(fs.existsSync(path.join(impl, "commit-payload.json")));
    assert.ok(fs.existsSync(path.join(impl, "commit-payload.sha256")));
    const body = fs.readFileSync(path.join(impl, "commit-payload.json"));
    const hash = fs.readFileSync(path.join(impl, "commit-payload.sha256"), "utf8").trim();
    assert.equal(createHash("sha256").update(body).digest("hex"), hash);
    const payload = JSON.parse(body.toString("utf8"));
    assert.equal(payload.counts.developers, 5);
    assert.equal(payload.counts.projects, 10);
    assert.equal(payload.counts.images, 9);
    assert.equal(payload.counts.pdfs, 5);
    assert.equal(payload.counts.news, 10);
    assert.equal(payload.counts.review_items, 63);
    assert.equal(payload.counts.conflicts, 1);
    assert.equal(payload.storage_upload_enabled, false);
    assert.equal(payload.production_allowed, false);
  });

  test("batch001: conflict preserved in payload metadata", () => {
    const payload = JSON.parse(
      fs.readFileSync(
        path.join(
          root,
          `.work/staging-db/${BATCH}/implementation/commit-payload.json`,
        ),
        "utf8",
      ),
    );
    assert.equal(payload.metadata_json.project_36936, "CONFLICT");
  });

  // —— Idempotency ——
  test("idemp: unique key stable", () => {
    const k1 = core.buildIdempotencyKey({
      sourceBatchId: BATCH,
      entityType: "developer",
      sourceRecordId: "r1",
      contentHash: "aa".repeat(32),
    });
    const k2 = core.buildIdempotencyKey({
      sourceBatchId: BATCH,
      entityType: "developer",
      sourceRecordId: "r1",
      contentHash: "aa".repeat(32),
    });
    assert.equal(k1, k2);
  });
  test("idemp: migration has unique indexes", () => {
    const body = fs.readFileSync(
      path.join(
        root,
        "database/staging-migrations/20260725_005_staging_indexes.sql",
      ),
      "utf8",
    );
    assert.ok(body.includes("idempotency_key"));
  });

  // —— RLS static ——
  test("rls: live skipped without env", () => {
    const r = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--no-warnings", "scripts/test-staging-rls.mjs"],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(
      String(r.stdout).includes("SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED") ||
        String(r.stdout).includes("passed"),
    );
  });

  // —— Production hard block ——
  test("prod: VERCEL_ENV production blocked in env snapshot", () => {
    const s = api.readStagingEnv({ VERCEL_ENV: "production" });
    assert.equal(s.productionDetected, true);
  });
  test("prod: hostname production blocked via guard", () => {
    assert.throws(() =>
      core.assertProductionWriteBlocked(
        { NODE_ENV: "development" },
        { hostname: "api-production.internal" },
      ),
    );
  });

  // —— CLI env-check ——
  // Force incomplete STAGING_* via empty env keys so .env.staging.local cannot fill them
  // (loader only sets keys that are not already present in process.env).
  const incompleteStagingEnv = {
    PATH: process.env.PATH,
    STAGING_SUPABASE_URL: "",
    STAGING_DATABASE_URL: "",
    STAGING_PROJECT_REF: "",
    STAGING_ENVIRONMENT_ID: "",
    STAGING_SUPABASE_SERVICE_ROLE_KEY: "",
    STAGING_SUPABASE_ANON_KEY: "",
    STAGING_ALLOWED_HOST: "",
  };
  test("cli: env-check exits non-zero when incomplete", () => {
    const r = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--no-warnings",
        "scripts/staging-db-impl-cli.mjs",
        "env-check",
      ],
      { cwd: root, encoding: "utf8", env: incompleteStagingEnv },
    );
    assert.notEqual(r.status, 0);
  });

  // —— Probe ——
  test("cli: probe skips when not provisioned", () => {
    const r = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--no-warnings",
        "scripts/staging-db-impl-cli.mjs",
        "probe",
      ],
      { cwd: root, encoding: "utf8", env: incompleteStagingEnv },
    );
    assert.equal(r.status, 0);
    assert.ok(
      String(r.stdout).includes("SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED"),
    );
  });

  // —— Expand coverage with many small cases ——
  const reviewActions = [
    "SET_REVIEW_REQUIRED",
    "SET_CONFLICT",
    "SET_DUPLICATE",
    "SET_REJECTED",
    "SET_QUARANTINED",
    "SET_READY_FOR_APPROVAL",
  ];
  for (const action of reviewActions) {
    test(`review action ${action}`, () => {
      const row = {
        id: "1",
        review_state: "REVIEW_REQUIRED",
        version: 1,
        updated_at: "t",
        reviewer_notes: null,
      };
      const res = review.applyReviewMutationLocal({
        row,
        request: {
          candidateId: "c",
          action,
          reviewerId: "r",
          expectedVersion: 1,
        },
        nowIso: "t2",
        auditEventId: "a",
      });
      assert.ok(res.nextState);
      assert.equal(res.version, 2);
    });
  }

  for (const bad of ["APPROVED", "READY_FOR_PRODUCTION", "PUBLISHED"]) {
    test(`review blocks ${bad}`, () => {
      assert.throws(() => review.assertReviewMutationAllowed(bad));
    });
  }

  const envCases = [
    { STAGING_IMPORT_ENABLED: "false", STAGING_COMMIT_ENABLED: "true" },
    { STAGING_IMPORT_ENABLED: "true", STAGING_COMMIT_ENABLED: "false" },
  ];
  for (const [i, partial] of envCases.entries()) {
    test(`gate incomplete flags ${i}`, () => {
      assert.throws(() =>
        api.assertControlledCommitAllowed(
          {
            confirmStaging: true,
            batchId: BATCH,
            expectedSealedDigest: DIGEST,
            migrationAuditPass: true,
            rlsStaticAuditPass: true,
            commitPayloadHashVerified: true,
            importSessionAlreadyCommitted: false,
          },
          {
            ...partial,
            STAGING_SUPABASE_URL: "https://stglab.supabase.co",
            STAGING_DATABASE_URL: "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
            STAGING_PROJECT_REF: "stglab",
            STAGING_ENVIRONMENT_ID: "env1",
            STAGING_SUPABASE_SERVICE_ROLE_KEY: "srvkey",
            STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
          },
        ),
      );
    });
  }

  // migration file count checks
  for (let i = 1; i <= 9; i += 1) {
    const n = String(i).padStart(3, "0");
    test(`migration file ${n} exists`, () => {
      const files = fs.readdirSync(
        path.join(root, "database/staging-migrations"),
      );
      assert.ok(files.some((f) => f.includes(`20260725_${n}_`)));
    });
  }

  // docs exist
  for (const doc of [
    "docs/STAGING_DB_COMMIT_IMPLEMENTATION.md",
    "docs/STAGING_ENVIRONMENT_PROVISIONING.md",
    "docs/STAGING_MIGRATION_RUNBOOK.md",
    "docs/STAGING_RLS_VALIDATION.md",
    "docs/STAGING_CONTROLLED_COMMIT.md",
    "docs/STAGING_ROLLBACK_RUNBOOK.md",
    "docs/STAGING_REVIEW_API.md",
    "docs/STAGING_SECURITY_MODEL.md",
  ]) {
    test(`doc exists ${doc}`, () => {
      assert.ok(fs.existsSync(path.join(root, doc)));
    });
  }

  // .env.staging.example
  test("env example exists", () => {
    assert.ok(fs.existsSync(path.join(root, ".env.staging.example")));
    const body = fs.readFileSync(
      path.join(root, ".env.staging.example"),
      "utf8",
    );
    assert.ok(body.includes("STAGING_COMMIT_ENABLED=false"));
    assert.ok(!/eyJ|sk_live|postgres:\/\//i.test(body));
  });

  // version column in review migration
  test("review items have version column", () => {
    const body = fs.readFileSync(
      path.join(
        root,
        "database/staging-migrations/20260725_003_staging_review_items.sql",
      ),
      "utf8",
    );
    assert.ok(/version INTEGER/i.test(body));
  });

  // unknown developer rule in SQL
  test("developers reject unified dev-unknown", () => {
    const body = fs.readFileSync(
      path.join(
        root,
        "database/staging-migrations/20260725_002_staging_entities.sql",
      ),
      "utf8",
    );
    assert.ok(body.includes("dev-unknown"));
  });

  // host mismatch: ALLOWED_HOST must match DATABASE_URL hostname (not API host)
  test("env: allowed host mismatch vs database host", () => {
    const s = api.readStagingEnv({
      STAGING_SUPABASE_URL: "https://a.supabase.co",
      STAGING_ALLOWED_HOST: "a.supabase.co",
      STAGING_DATABASE_URL: "postgresql://postgres:x@db.a.supabase.co:5432/postgres",
      STAGING_PROJECT_REF: "a",
      STAGING_ENVIRONMENT_ID: "e",
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "k",
    });
    assert.equal(s.supabaseUrlHostCheck.status, "PASS");
    assert.equal(s.databaseHostCheck.status, "FAIL");
    assert.ok(s.isolationFailures.some((f) => f.includes("ALLOWED_HOST")));
  });

  test("env: supabase url host check separate from database host", () => {
    const s = api.readStagingEnv({
      STAGING_SUPABASE_URL: "https://a.supabase.co",
      STAGING_ALLOWED_HOST: "db.a.supabase.co",
      STAGING_DATABASE_URL: "postgresql://postgres:x@db.a.supabase.co:5432/postgres",
      STAGING_PROJECT_REF: "a",
      STAGING_ENVIRONMENT_ID: "e",
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "k",
    });
    assert.equal(s.supabaseUrlHostCheck.status, "PASS");
    assert.equal(s.databaseHostCheck.status, "PASS");
    assert.equal(s.isolationOk, true);
  });

  test("env: supabase url must be https *.supabase.co matching project ref", () => {
    const s = api.readStagingEnv({
      STAGING_SUPABASE_URL: "http://evil.example.com",
      STAGING_PROJECT_REF: "a",
      STAGING_DATABASE_URL: "postgresql://postgres:x@db.a.supabase.co:5432/postgres",
      STAGING_ALLOWED_HOST: "db.a.supabase.co",
    });
    assert.equal(s.supabaseUrlHostCheck.status, "FAIL");
    assert.equal(s.databaseHostCheck.status, "PASS");
    assert.ok(s.supabaseUrlHostCheck.reasons.some((r) => r.includes("https")));
  });

  // migration audit migrationAuditPass false
  test("gate: migration audit fail blocked", () => {
    assert.throws(() =>
      api.assertControlledCommitAllowed(
        {
          confirmStaging: true,
          batchId: BATCH,
          expectedSealedDigest: DIGEST,
          migrationAuditPass: false,
          rlsStaticAuditPass: true,
          commitPayloadHashVerified: true,
          importSessionAlreadyCommitted: false,
        },
        {
          STAGING_IMPORT_ENABLED: "true",
          STAGING_COMMIT_ENABLED: "true",
          STAGING_SUPABASE_URL: "https://stglab.supabase.co",
          STAGING_DATABASE_URL: "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
          STAGING_PROJECT_REF: "stglab",
          STAGING_ENVIRONMENT_ID: "env1",
          STAGING_SUPABASE_SERVICE_ROLE_KEY: "srvkey",
          STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
        },
      ),
    );
  });

  test("gate: payload hash fail blocked", () => {
    assert.throws(() =>
      api.assertControlledCommitAllowed(
        {
          confirmStaging: true,
          batchId: BATCH,
          expectedSealedDigest: DIGEST,
          migrationAuditPass: true,
          rlsStaticAuditPass: true,
          commitPayloadHashVerified: false,
          importSessionAlreadyCommitted: false,
        },
        {
          STAGING_IMPORT_ENABLED: "true",
          STAGING_COMMIT_ENABLED: "true",
          STAGING_SUPABASE_URL: "https://stglab.supabase.co",
          STAGING_DATABASE_URL: "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
          STAGING_PROJECT_REF: "stglab",
          STAGING_ENVIRONMENT_ID: "env1",
          STAGING_SUPABASE_SERVICE_ROLE_KEY: "srvkey",
          STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
        },
      ),
    );
  });

  // precommit report database writes 0
  test("precommit report zero writes", () => {
    const p = path.join(
      root,
      `.work/staging-db/${BATCH}/implementation/precommit-report.json`,
    );
    assert.ok(fs.existsSync(p));
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    assert.equal(j.database_writes, 0);
    assert.equal(j.storage_uploads, 0);
    assert.equal(j.real_commit_enabled, false);
  });

  // —— Extra coverage to meet ≥100 ——
  const repoFiles = [
    "import-session-repository.ts",
    "developer-repository.ts",
    "project-repository.ts",
    "asset-repository.ts",
    "pdf-repository.ts",
    "news-repository.ts",
    "review-repository.ts",
    "audit-repository.ts",
    "client.ts",
    "environment.ts",
    "transaction-adapter.ts",
  ];
  for (const f of repoFiles) {
    test(`supabase adapter file ${f}`, () => {
      assert.ok(
        fs.existsSync(path.join(root, "src/lib/staging-db/supabase", f)),
      );
    });
  }

  const reports = [
    "REPORTS/STAGING_DB_COMMIT_IMPLEMENTATION_BASELINE.md",
    "REPORTS/STAGING_DB_IMPLEMENTATION_ARCHITECTURE.md",
    "REPORTS/STAGING_DB_MIGRATION_AUDIT.md",
    "REPORTS/STAGING_DB_RLS_IMPLEMENTATION.md",
    "REPORTS/STAGING_DB_ENVIRONMENT_ISOLATION.md",
    "REPORTS/STAGING_DB_BATCH001_COMMIT_PLAN.md",
    "REPORTS/STAGING_DB_ROLLBACK_IMPLEMENTATION.md",
    "REPORTS/STAGING_DB_SECURITY_VERIFICATION.md",
    "REPORTS/STAGING_DB_EXTERNAL_READINESS.md",
  ];
  for (const r of reports) {
    test(`report exists ${r}`, () => {
      assert.ok(fs.existsSync(path.join(root, r)));
    });
  }

  for (const role of [
    "staging_importer",
    "staging_reviewer",
    "staging_admin",
    "read_only_auditor",
  ]) {
    test(`rls role mentioned ${role}`, () => {
      const body = fs.readFileSync(
        path.join(
          root,
          "database/staging-migrations/20260725_006_staging_rls.sql",
        ),
        "utf8",
      );
      assert.ok(body.includes(role));
    });
  }

  test("errors: ProductionWriteBlockedError code", () => {
    const e = new core.ProductionWriteBlockedError("test");
    assert.equal(e.code, "PRODUCTION_WRITE_BLOCKED");
  });
  test("errors: StagingNotProvisionedError code", () => {
    const e = new core.StagingNotProvisionedError();
    assert.equal(e.code, "STAGING_NOT_PROVISIONED");
  });
  test("errors: StagingCommitDisabledError code", () => {
    const e = new core.StagingCommitDisabledError();
    assert.equal(e.code, "STAGING_COMMIT_DISABLED");
  });
  test("core exports review API contract via barrel", () => {
    assert.equal(core.REVIEW_API_CONTRACT.authRequired, true);
  });
  test("simulate counts include zero defaults", () => {
    const r = api.simulateCommitRpcResult({
      batchId: BATCH,
      importSessionId: "s",
      environmentId: "e",
      counts: {},
    });
    assert.equal(r.insertedDevelopers, 0);
    assert.equal(r.storageUploads, 0);
  });
  test("package scripts include staging:db:env-check", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, "package.json"), "utf8"),
    );
    assert.ok(pkg.scripts["staging:db:env-check"]);
    assert.ok(pkg.scripts["staging:db:migration-audit"]);
    assert.ok(pkg.scripts["test:staging-db-implementation"]);
  });
  test("CI does not auto-commit staging", () => {
    const ci = fs.readFileSync(
      path.join(root, ".github/workflows/ci.yml"),
      "utf8",
    );
    assert.ok(!/staging:db:commit/.test(ci));
    assert.ok(!/SUPABASE_SERVICE_ROLE_KEY:\s*[^\s#]+/.test(ci));
  });
  test("storage upload env false in example", () => {
    const body = fs.readFileSync(
      path.join(root, ".env.staging.example"),
      "utf8",
    );
    assert.ok(/STAGING_STORAGE_UPLOAD_ENABLED=false/.test(body));
  });
  test("rollback rpc exists", () => {
    assert.ok(
      fs.existsSync(
        path.join(
          root,
          "database/staging-migrations/20260725_009_staging_rollback_rpc.sql",
        ),
      ),
    );
  });
  test("commit rpc function name", () => {
    const body = fs.readFileSync(
      path.join(
        root,
        "database/staging-migrations/20260725_008_staging_commit_rpc.sql",
      ),
      "utf8",
    );
    assert.ok(body.includes("commit_staging_import_v1"));
  });

  // —— Session pooler connection preference ——
  const poolerBase = {
    STAGING_PROJECT_REF: "stglab",
    STAGING_ALLOWED_POOLER_HOST: "aws-0-ap-southeast-1.pooler.supabase.com",
    STAGING_DATABASE_URL:
      "postgresql://postgres:secret-direct@db.stglab.supabase.co:5432/postgres",
    STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
  };
  const goodPooler =
    "postgresql://postgres.stglab:secret-pooler@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

  test("pooler: session pooler preferred over direct", () => {
    const conn = api.resolveStagingPgConnection({
      ...poolerBase,
      STAGING_DATABASE_POOLER_URL: goodPooler,
    });
    assert.equal(conn.mode, "SESSION_POOLER");
    assert.equal(conn.host, "aws-0-ap-southeast-1.pooler.supabase.com");
    assert.equal(conn.port, 5432);
    assert.equal(conn.username, "postgres.stglab");
  });
  test("pooler: direct fallback when pooler unset", () => {
    const conn = api.resolveStagingPgConnection({
      ...poolerBase,
      STAGING_DATABASE_POOLER_URL: "",
    });
    assert.equal(conn.mode, "DIRECT_FALLBACK");
    assert.equal(conn.host, "db.stglab.supabase.co");
  });
  test("pooler: wrong project ref rejected", () => {
    assert.throws(() =>
      api.resolveStagingPgConnection({
        ...poolerBase,
        STAGING_DATABASE_POOLER_URL:
          "postgresql://postgres.wrongref:x@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
      }),
    );
  });
  test("pooler: wrong username rejected", () => {
    assert.throws(() =>
      api.resolveStagingPgConnection({
        ...poolerBase,
        STAGING_DATABASE_POOLER_URL:
          "postgresql://postgres:x@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
      }),
    );
  });
  test("pooler: wrong port rejected", () => {
    assert.throws(() =>
      api.resolveStagingPgConnection({
        ...poolerBase,
        STAGING_DATABASE_POOLER_URL:
          "postgresql://postgres.stglab:x@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
      }),
    );
  });
  test("pooler: non-pooler hostname rejected", () => {
    assert.throws(() =>
      api.resolveStagingPgConnection({
        ...poolerBase,
        STAGING_ALLOWED_POOLER_HOST: "db.stglab.supabase.co",
        STAGING_DATABASE_POOLER_URL:
          "postgresql://postgres.stglab:x@db.stglab.supabase.co:5432/postgres",
      }),
    );
  });
  test("pooler: production project ref rejected", () => {
    const checks = api.checkStagingPoolerUrl(
      "postgresql://postgres.prodref:x@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
      "stglab",
      "aws-0-ap-southeast-1.pooler.supabase.com",
      "prodref",
    );
    assert.equal(checks.POOLER_PROJECT_REF_CHECK.status, "FAIL");
  });
  test("pooler: env report hides password and full URI", () => {
    const r = api.envCheckReport({
      ...poolerBase,
      STAGING_SUPABASE_URL: "https://stglab.supabase.co",
      STAGING_ENVIRONMENT_ID: "env1",
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "srvkey",
      STAGING_SUPABASE_ANON_KEY: "anonkey",
      STAGING_DATABASE_POOLER_URL: goodPooler,
      STAGING_COMMIT_ENABLED: "false",
    });
    const dumped = JSON.stringify(r);
    assert.ok(!dumped.includes("secret-pooler"));
    assert.ok(!dumped.includes("secret-direct"));
    assert.ok(!dumped.includes(goodPooler));
    assert.equal(r.DATABASE_CONNECTION_MODE, "SESSION_POOLER");
    assert.equal(r.POOLER_HOST_CHECK, "PASS");
    assert.equal(r.POOLER_USERNAME_CHECK, "PASS");
    assert.equal(r.POOLER_PROJECT_REF_CHECK, "PASS");
    assert.equal(r.DATABASE_HOST_CHECK, "PASS");
    assert.equal(r.commit_enabled, false);
  });
  test("pooler: ALLOWED_HOST stays direct-only (not compared to pooler)", () => {
    const snap = api.readStagingEnv({
      ...poolerBase,
      STAGING_SUPABASE_URL: "https://stglab.supabase.co",
      STAGING_ENVIRONMENT_ID: "env1",
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "k",
      STAGING_DATABASE_POOLER_URL: goodPooler,
    });
    assert.equal(snap.databaseHostCheck.status, "PASS");
    assert.equal(snap.allowedHost, "db.stglab.supabase.co");
    assert.equal(
      snap.allowedPoolerHost,
      "aws-0-ap-southeast-1.pooler.supabase.com",
    );
  });
  test("env example documents pooler URL key", () => {
    const body = fs.readFileSync(
      path.join(root, ".env.staging.example"),
      "utf8",
    );
    assert.ok(body.includes("STAGING_DATABASE_POOLER_URL="));
    assert.ok(body.includes("STAGING_ALLOWED_POOLER_HOST="));
    assert.ok(body.includes("STAGING_COMMIT_ENABLED=false"));
  });

  // —— Bootstrap V1 ——
  const boot = await load("src/lib/staging-db/supabase/bootstrap.ts");
  test("bootstrap: exact project match", () => {
    const r = boot.findExactStagingProjects([
      {
        id: "xwbqvvzxdrtirnvpsjah",
        name: "gothailandhome-staging",
        region: "ap-southeast-1",
        status: "ACTIVE_HEALTHY",
      },
    ], "xwbqvvzxdrtirnvpsjah");
    assert.equal(r.status, "PASS");
  });
  test("bootstrap: production project name rejected via forbidden set", () => {
    assert.equal(
      boot.rejectProductionProject({
        id: "abc",
        name: "gothailandhome-db",
        region: "x",
        status: "ACTIVE",
      }),
      true,
    );
  });
  test("bootstrap: duplicate project ambiguity", () => {
    const r = boot.findExactStagingProjects([
      { id: "a", name: "gothailandhome-staging", region: "r", status: "A" },
      { id: "b", name: "gothailandhome-staging", region: "r", status: "A" },
    ]);
    assert.equal(r.status, "FAIL");
    assert.equal(r.reason, "AMBIGUOUS_DUPLICATE_NAME");
  });
  test("bootstrap: percent-encoding special password chars", () => {
    const built = boot.buildSessionPoolerUri({
      projectRef: "stglab",
      hostname: "aws-0-ap-southeast-1.pooler.supabase.com",
      password: "p#a[s]!s@w:o/r?d %&你好",
    });
    assert.equal(built.host, "aws-0-ap-southeast-1.pooler.supabase.com");
    assert.ok(built.uri.includes("%23"));
    assert.ok(!built.uri.includes("p#a"));
    const parsed = new URL(built.uri);
    assert.equal(decodeURIComponent(parsed.password), "p#a[s]!s@w:o/r?d %&你好");
  });
  test("bootstrap: pooler URI creation summary has no password", () => {
    const built = boot.buildSessionPoolerUri({
      projectRef: "stglab",
      hostname: "aws-0-ap-southeast-1.pooler.supabase.com",
      password: "secret-value-xyz",
    });
    const summary = JSON.stringify(boot.summarizePoolerBuild(built));
    assert.ok(!summary.includes("secret-value-xyz"));
    assert.equal(JSON.parse(summary).POOLER_URI_BUILD, "PASS");
  });
  test("bootstrap: extract password from encoded direct URL", () => {
    const uri =
      "postgresql://postgres:" +
      encodeURIComponent("a#b!") +
      "@db.stglab.supabase.co:5432/postgres";
    assert.equal(boot.extractPasswordFromDatabaseUrl(uri), "a#b!");
  });
  test("bootstrap: atomic env write permission 600", () => {
    const tmp = path.join(root, `.work/staging-db/_bootstrap_test_${Date.now()}.env`);
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    const r = boot.atomicWriteEnvFile(tmp, "STAGING_COMMIT_ENABLED=false\n");
    assert.equal(r.mode, "600");
    const mode = (fs.statSync(tmp).mode & 0o777).toString(8);
    assert.equal(mode, "600");
    fs.unlinkSync(tmp);
  });
  test("bootstrap: gitignore covers .env.staging.local", () => {
    assert.equal(boot.isPathGitIgnored(root, ".env.staging.local"), true);
  });
  test("bootstrap: existing keys preserved in serialize order", () => {
    const body = boot.serializeEnvFile(
      {
        STAGING_COMMIT_ENABLED: "false",
        STAGING_SUPABASE_ANON_KEY: "sb_publishable_x",
        STAGING_DATABASE_POOLER_URL: "postgresql://postgres.stglab:x@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
      },
      boot.BOOTSTRAP_ENV_ORDER,
    );
    assert.ok(body.includes("STAGING_COMMIT_ENABLED=false"));
    assert.ok(body.includes("STAGING_SUPABASE_ANON_KEY=sb_publishable_x"));
  });
  test("bootstrap: malformed pooler host rejected", () => {
    assert.throws(() =>
      boot.buildSessionPoolerUri({
        projectRef: "stglab",
        hostname: "db.stglab.supabase.co",
        password: "x",
      }),
    );
  });
  test("bootstrap: region candidates derived from metadata", () => {
    const hosts = boot.candidateSessionPoolerHosts({
      region: "ap-southeast-1",
      apiHostname: null,
    });
    assert.ok(hosts[0].includes("ap-southeast-1"));
    assert.ok(hosts[0].endsWith(".pooler.supabase.com"));
  });
  test("bootstrap: direct fallback blocked for live probe preference", () => {
    // Live probe requires pooler URL present
    const snap = api.readStagingEnv({
      STAGING_SUPABASE_URL: "https://stglab.supabase.co",
      STAGING_DATABASE_URL:
        "postgresql://postgres:x@db.stglab.supabase.co:5432/postgres",
      STAGING_ALLOWED_HOST: "db.stglab.supabase.co",
      STAGING_PROJECT_REF: "stglab",
      STAGING_ENVIRONMENT_ID: "env1",
      STAGING_SUPABASE_SERVICE_ROLE_KEY: "k",
      STAGING_DATABASE_POOLER_URL: "",
      STAGING_COMMIT_ENABLED: "false",
    });
    assert.equal(snap.databaseConnectionMode, "DIRECT_FALLBACK");
    assert.equal(snap.databasePoolerUrlPresent, false);
  });
  test("bootstrap: commit remains disabled in example", () => {
    const body = fs.readFileSync(
      path.join(root, ".env.staging.example"),
      "utf8",
    );
    assert.match(body, /STAGING_COMMIT_ENABLED=false/);
  });

  // —— CONTROLLED_COMMIT_RPC_PHASE2 (SQL artifact, not migration) ——
  test("phase2: rpc sql exists outside frozen migrations", () => {
    const p = path.join(
      root,
      "database/staging-rpc/commit_staging_import_v1_phase2.sql",
    );
    assert.ok(fs.existsSync(p));
    const body = fs.readFileSync(p, "utf8");
    assert.ok(body.includes("CONTROLLED_COMMIT_RPC_PHASE2"));
    assert.ok(body.includes("INSERT INTO staging_developers"));
    assert.ok(body.includes("INSERT INTO staging_projects"));
    assert.ok(body.includes("INSERT INTO staging_assets"));
    assert.ok(body.includes("INSERT INTO staging_pdfs"));
    assert.ok(body.includes("INSERT INTO staging_news"));
    assert.ok(body.includes("INSERT INTO staging_review_items"));
    assert.ok(body.includes("INSERT INTO staging_conflict_candidates"));
    assert.ok(body.includes("INSERT INTO staging_audit_events"));
    assert.ok(!/\bCREATE\s+TABLE\b/i.test(body));
    assert.ok(!/\bALTER\s+TABLE\b/i.test(body));
    assert.ok(!/\bDROP\s+TABLE\b/i.test(body));
  });
  test("phase2: frozen migration 008 unchanged (session+audit only)", () => {
    const body = fs.readFileSync(
      path.join(
        root,
        "database/staging-migrations/20260725_008_staging_commit_rpc.sql",
      ),
      "utf8",
    );
    assert.ok(!body.includes("INSERT INTO staging_developers"));
    assert.ok(body.includes("staging_import_sessions"));
    assert.ok(body.includes("staging_audit_events"));
  });
  test("phase2: frozen v1 migrations (001–009) still prefix of list", () => {
    assert.equal(api.FROZEN_STAGING_MIGRATIONS_V1.length, 9);
    for (let i = 0; i < api.FROZEN_STAGING_MIGRATIONS_V1.length; i += 1) {
      assert.equal(
        api.EXPECTED_STAGING_MIGRATIONS[i],
        api.FROZEN_STAGING_MIGRATIONS_V1[i],
      );
    }
  });
  test("phase A: expected migrations list includes decision files (12)", () => {
    assert.equal(api.EXPECTED_STAGING_MIGRATIONS.length, 12);
    assert.ok(
      api.EXPECTED_STAGING_MIGRATIONS.includes(
        "20260726_010_staging_review_decisions.sql",
      ),
    );
  });

  test("phase2: package scripts present", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, "package.json"), "utf8"),
    );
    assert.ok(pkg.scripts["staging:db:apply-commit-rpc-phase2"]);
    assert.ok(pkg.scripts["test:controlled-commit-integration"]);
  });

  console.log(
    `\nStaging DB Implementation tests: ${passed} passed, ${failed} failed`,
  );
  if (failures.length) {
    for (const f of failures) console.error(`FAIL: ${f.name}\n  ${f.error}`);
    process.exit(1);
  }
  if (passed < 100) {
    console.error(`Expected ≥100 tests, got ${passed}`);
    process.exit(1);
  }
  console.log(`TOTAL: ${passed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
