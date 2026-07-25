#!/usr/bin/env node
/**
 * Staging DB Commit Design V1 — test suite (≥80 cases).
 * Simulation only. DATABASE_WRITES=0 STORAGE_UPLOADS=0.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const BATCH = "BATCH-GTH-20260724-001";
const reviewDir = path.join(root, ".work/review-console", BATCH);
const draftDir = path.join(root, "database-design/staging-import-v1");
const migrationsDir = path.join(root, "supabase/migrations");

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    const ret = fn();
    if (ret && typeof ret.then === "function") {
      throw new Error(`Async test must use testAsync: ${name}`);
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

async function load() {
  const url = pathToFileURL(path.join(root, "src/lib/staging-db/index.ts")).href;
  return import(`${url}?t=${Date.now()}-${Math.random()}`);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function main() {
  const api = await load();

  // —— Environment Guard ——
  test("env: production NODE_ENV blocked", () => {
    const c = api.checkProductionWriteBlock({ NODE_ENV: "production" });
    assert.equal(c.blocked, true);
  });
  test("env: VERCEL_ENV production blocked", () => {
    const c = api.checkProductionWriteBlock({ VERCEL_ENV: "production" });
    assert.equal(c.blocked, true);
  });
  test("env: Production URL blocked", () => {
    assert.throws(
      () =>
        api.assertProductionWriteBlocked(
          {
            NODE_ENV: "development",
            PRODUCTION_DATABASE_URL: "postgresql://db.prod.example/postgres",
          },
          { databaseUrl: "postgresql://db.prod.example/postgres" },
        ),
      (e) => e.code === "PRODUCTION_WRITE_BLOCKED",
    );
  });
  test("env: hostname production blocked", () => {
    const c = api.checkProductionWriteBlock(
      { NODE_ENV: "development" },
      { hostname: "api-production.internal" },
    );
    assert.equal(c.blocked, true);
  });
  test("env: NEXT_PUBLIC production marker blocked", () => {
    const c = api.checkProductionWriteBlock({
      NODE_ENV: "development",
      NEXT_PUBLIC_APP_ENV: "production",
    });
    assert.equal(c.blocked, true);
  });
  test("env: missing staging confirmation blocked for real write", () => {
    assert.throws(
      () =>
        api.assertStagingWriteAllowed(
          {
            simulation: false,
            confirmStaging: false,
            batchStatus: "READY_FOR_STAGING_REVIEW",
            sealedZipValidated: true,
            commitPlanValidated: true,
            reviewerGateConfigured: true,
          },
          {
            NODE_ENV: "development",
            STAGING_IMPORT_ENABLED: "true",
            STAGING_DATABASE_URL: "postgresql://staging.local/db",
          },
        ),
      (e) => e.code === "STAGING_ENVIRONMENT_BLOCKED",
    );
  });
  test("env: missing STAGING_DATABASE_URL blocked for real write", () => {
    assert.throws(
      () =>
        api.assertStagingWriteAllowed(
          {
            simulation: false,
            confirmStaging: true,
            batchStatus: "READY_FOR_STAGING_REVIEW",
            sealedZipValidated: true,
            commitPlanValidated: true,
            reviewerGateConfigured: true,
          },
          {
            NODE_ENV: "development",
            STAGING_IMPORT_ENABLED: "true",
          },
        ),
      (e) => e.code === "STAGING_ENVIRONMENT_BLOCKED",
    );
  });
  test("env: PRODUCTION_DATABASE_URL must not equal staging", () => {
    assert.throws(
      () =>
        api.assertStagingWriteAllowed(
          {
            simulation: false,
            confirmStaging: true,
            batchStatus: "READY_FOR_STAGING_REVIEW",
            sealedZipValidated: true,
            commitPlanValidated: true,
            reviewerGateConfigured: true,
          },
          {
            NODE_ENV: "development",
            STAGING_IMPORT_ENABLED: "true",
            STAGING_DATABASE_URL: "postgresql://same/db",
            PRODUCTION_DATABASE_URL: "postgresql://same/db",
          },
        ),
      (e) =>
        e.code === "STAGING_ENVIRONMENT_BLOCKED" ||
        e.code === "PRODUCTION_WRITE_BLOCKED",
    );
  });
  test("env: simulation allowed without STAGING_DATABASE_URL", () => {
    api.assertStagingWriteAllowed({ simulation: true }, { NODE_ENV: "development" });
  });
  test("env: real commit disabled", () => {
    assert.throws(() => api.assertRealCommitEnabled(), (e) => e.code === "STAGING_COMMIT_DISABLED");
  });
  test("env: attemptRealCommit disabled", () => {
    assert.throws(() => api.attemptRealCommit(), (e) => e.code === "STAGING_COMMIT_DISABLED");
  });
  test("env: realCommit throws STAGING_COMMIT_DISABLED", () => {
    assert.throws(() => api.realCommit(), (e) =>
      String(e.message).includes("STAGING_COMMIT_DISABLED"),
    );
  });

  // —— Schema / types ——
  test("schema: import session statuses include READY_FOR_COMMIT", () => {
    assert.ok(api.IMPORT_SESSION_STATUSES.includes("READY_FOR_COMMIT"));
  });
  test("schema: simulation ceiling is READY_FOR_COMMIT", () => {
    assert.equal(api.MAX_SIMULATION_SESSION_STATUS, "READY_FOR_COMMIT");
  });
  test("schema: forbidden simulation statuses include COMMITTED", () => {
    assert.ok(api.FORBIDDEN_SIMULATION_SESSION_STATUSES.includes("COMMITTED"));
  });
  test("schema: review states exclude APPROVED", () => {
    assert.ok(!api.STAGING_REVIEW_STATES.includes("APPROVED"));
  });
  test("schema: forbidden commit review states include PUBLISHED", () => {
    assert.ok(api.FORBIDDEN_COMMIT_REVIEW_STATES.includes("PUBLISHED"));
  });
  test("schema: invalid review state rejected", () => {
    assert.throws(() => api.assertAllowedStagingReviewState("APPROVED"));
  });
  test("schema: PUBLISHED review state rejected", () => {
    assert.throws(() => api.assertAllowedStagingReviewState("PUBLISHED"));
  });
  test("schema: READY_FOR_APPROVAL allowed", () => {
    assert.equal(api.assertAllowedStagingReviewState("READY_FOR_APPROVAL"), "READY_FOR_APPROVAL");
  });
  test("schema: session simulation ceiling rejects COMMITTED", () => {
    assert.throws(() => api.assertSessionSimulationCeiling("COMMITTED"));
  });
  test("schema: hard flags databaseWrite false", () => {
    assert.equal(api.STAGING_DB_HARD_FLAGS.databaseWrite, false);
  });
  test("schema: hard flags storageUpload false", () => {
    assert.equal(api.STAGING_DB_HARD_FLAGS.storageUpload, false);
  });
  test("schema: hard flags realCommitEnabled false", () => {
    assert.equal(api.STAGING_DB_HARD_FLAGS.realCommitEnabled, false);
  });
  test("schema: audit append-only actor simulation SYSTEM ok", () => {
    api.assertSimulationActor("SYSTEM");
  });
  test("schema: audit REVIEWER blocked in simulation", () => {
    assert.throws(() => api.assertSimulationActor("REVIEWER"));
  });
  test("schema: storage UPLOADED blocked in simulation", () => {
    assert.throws(() => api.assertSimulationStorageStatus("UPLOADED"));
  });
  test("schema: storage PLANNED allowed", () => {
    api.assertSimulationStorageStatus("PLANNED");
  });

  // —— Idempotency ——
  test("idemp: stable key same inputs", () => {
    const a = api.buildIdempotencyKey({
      sourceBatchId: "B1",
      entityType: "developer",
      sourceRecordId: "r1",
      contentHash: "Aa".repeat(32),
    });
    const b = api.buildIdempotencyKey({
      sourceBatchId: "B1",
      entityType: "developer",
      sourceRecordId: "r1",
      contentHash: "aa".repeat(32),
    });
    assert.equal(a, b);
  });
  test("idemp: key does not use timestamp", () => {
    const k = api.buildIdempotencyKey({
      sourceBatchId: "B1",
      entityType: "project",
      sourceRecordId: "p1",
      contentHash: "bb".repeat(32),
    });
    assert.equal(k.length, 64);
    assert.ok(!k.includes("2026"));
  });
  test("idemp: same batch same record same hash → SKIP", () => {
    const hash = api.computeContentHash({ x: 1 });
    const r = api.evaluateIdempotency({
      sourceBatchId: "B1",
      entityType: "asset",
      sourceRecordId: "a1",
      contentHash: hash,
      existingSameBatch: {
        sourceBatchId: "B1",
        entityType: "asset",
        sourceRecordId: "a1",
        contentHash: hash,
        idempotencyKey: "x",
      },
    });
    assert.equal(r.decision, "WOULD_SKIP_DUPLICATE");
  });
  test("idemp: same batch same record changed hash → UPDATE", () => {
    const r = api.evaluateIdempotency({
      sourceBatchId: "B1",
      entityType: "asset",
      sourceRecordId: "a1",
      contentHash: api.computeContentHash({ x: 2 }),
      existingSameBatch: {
        sourceBatchId: "B1",
        entityType: "asset",
        sourceRecordId: "a1",
        contentHash: api.computeContentHash({ x: 1 }),
        idempotencyKey: "x",
      },
    });
    assert.equal(r.decision, "WOULD_UPDATE");
  });
  test("idemp: different batch same hash → DUPLICATE_CANDIDATE", () => {
    const r = api.evaluateIdempotency({
      sourceBatchId: "B2",
      entityType: "asset",
      sourceRecordId: "a9",
      contentHash: "cc".repeat(32),
      crossBatchSameUrlHash: true,
    });
    assert.equal(r.decision, "DUPLICATE_CANDIDATE");
  });
  test("idemp: different batch same source record → CONFLICT", () => {
    const r = api.evaluateIdempotency({
      sourceBatchId: "B2",
      entityType: "project",
      sourceRecordId: "36945",
      contentHash: "dd".repeat(32),
      crossBatchSameSourceRecordId: true,
    });
    assert.equal(r.decision, "CONFLICT");
  });
  test("idemp: summarize counts", () => {
    const s = api.summarizeIdempotency([
      { idempotency_key: "1", decision: "WOULD_INSERT", reason: "" },
      { idempotency_key: "2", decision: "WOULD_SKIP_DUPLICATE", reason: "" },
    ]);
    assert.equal(s.wouldInsert, 1);
    assert.equal(s.wouldSkip, 1);
  });
  test("idemp: content hash lowercase hex", () => {
    const h = api.normalizeHexHash("AABB");
    assert.equal(h, "aabb");
  });

  // —— Path / storage ——
  test("path: absolute path blocked", () => {
    assert.throws(() => api.assertRelativeSafePath("/etc/passwd"));
  });
  test("path: traversal blocked", () => {
    assert.throws(() => api.assertRelativeSafePath("images/../../secret"));
  });
  test("path: sanitize filename", () => {
    const name = api.sanitizeFilename("My File!!.PDF");
    assert.ok(name.endsWith(".pdf"));
    assert.ok(!name.includes("!"));
    assert.ok(!name.includes(" "));
  });
  test("path: storage object path uses batch/entity", () => {
    const p = api.buildStorageObjectPath({
      batchId: BATCH,
      entityType: "asset",
      entityId: "img1",
      originalFilename: "photo.jpg",
    });
    assert.ok(p.includes(BATCH));
    assert.ok(p.includes("img1"));
    assert.ok(!p.startsWith("/"));
  });
  test("storage: WOULD_UPLOAD vocabulary", () => {
    const item = api.planStorageItem({
      batchId: BATCH,
      entityType: "asset",
      entityId: "a1",
      localRelativePath: "images/a1.jpg",
      sha256: "ee".repeat(32),
      mimeType: "image/jpeg",
      fileSize: 10,
      originalFilename: "a1.jpg",
    });
    assert.equal(item.storage_action, "WOULD_UPLOAD");
  });
  test("storage: duplicate skip", () => {
    const item = api.planStorageItem({
      batchId: BATCH,
      entityType: "pdf",
      entityId: "p1",
      localRelativePath: "pdfs/p1.pdf",
      sha256: "ff".repeat(32),
      mimeType: "application/pdf",
      fileSize: 10,
      originalFilename: "p1.pdf",
      knownDuplicateSha256: true,
    });
    assert.equal(item.storage_action, "WOULD_SKIP_DUPLICATE");
  });
  test("storage: quarantine", () => {
    const item = api.planStorageItem({
      batchId: BATCH,
      entityType: "pdf",
      entityId: "p2",
      localRelativePath: "pdfs/p2.pdf",
      sha256: "11".repeat(32),
      mimeType: "application/pdf",
      fileSize: 10,
      originalFilename: "p2.pdf",
      quarantine: true,
    });
    assert.equal(item.storage_action, "WOULD_QUARANTINE");
  });
  test("storage: plan document uploads zero", () => {
    const doc = api.buildStoragePlanDocument(BATCH, []);
    assert.equal(doc.storage_uploads, 0);
    assert.equal(doc.status, "SIMULATED_ONLY");
  });

  // —— Review ——
  test("review: reviewer MARK_READY_FOR_APPROVAL", () => {
    assert.equal(api.reviewerActionToState("MARK_READY_FOR_APPROVAL"), "READY_FOR_APPROVAL");
  });
  test("review: approver APPROVE blocked", () => {
    assert.throws(() => api.assertApproverActionBlocked("APPROVE"));
  });
  test("review: automation cannot publish", () => {
    assert.throws(() => api.assertAutomationCannotApproveOrPublish("PUBLISHED"));
  });
  test("review: reviewer actions list includes QUARANTINE", () => {
    assert.ok(api.REVIEWER_ACTIONS.includes("QUARANTINE"));
  });

  // —— Transaction ——
  test("tx: default mode batch_atomic", () => {
    const plan = api.buildTransactionPlan();
    assert.equal(plan.defaultMode, "batch_atomic_transaction");
    assert.equal(plan.allowPartialCommit, false);
  });
  test("tx: phase order starts BEGIN ends COMMIT", () => {
    const phases = api.DEFAULT_TRANSACTION_PHASE_ORDER;
    assert.equal(phases[0], "BEGIN");
    assert.equal(phases[phases.length - 1], "COMMIT");
  });

  await testAsync("tx: rollback on developer failure", async () => {
    const repo = new api.MockStagingRepository();
    const result = await api.runSimulatedBatchTransaction(
      repo,
      [
        {
          phase: "insert_import_session",
          run: async () => {},
        },
        {
          phase: "insert_developers",
          run: async () => {},
        },
      ],
      { failAtPhase: "insert_developers" },
    );
    assert.equal(result.status, "SIMULATED_ROLLED_BACK");
    assert.equal(result.partialCommit, false);
    assert.equal(result.databaseWrites, 0);
  });

  await testAsync("tx: rollback on project failure", async () => {
    const repo = new api.MockStagingRepository();
    const result = await api.runSimulatedBatchTransaction(
      repo,
      [
        { phase: "insert_developers", run: async () => {} },
        { phase: "insert_projects", run: async () => {} },
      ],
      { failAtPhase: "insert_projects" },
    );
    assert.equal(result.failedPhase, "insert_projects");
  });

  await testAsync("tx: rollback on asset failure", async () => {
    const repo = new api.MockStagingRepository();
    const result = await api.runSimulatedBatchTransaction(
      repo,
      [
        { phase: "insert_assets", run: async () => {} },
      ],
      { failAtPhase: "insert_assets" },
    );
    assert.equal(result.status, "SIMULATED_ROLLED_BACK");
  });

  await testAsync("tx: rollback on review failure", async () => {
    const repo = new api.MockStagingRepository();
    const result = await api.runSimulatedBatchTransaction(
      repo,
      [{ phase: "insert_review_items", run: async () => {} }],
      { failAtPhase: "insert_review_items" },
    );
    assert.equal(result.status, "SIMULATED_ROLLED_BACK");
  });

  await testAsync("tx: success still committed=false", async () => {
    const repo = new api.MockStagingRepository();
    const result = await api.runSimulatedBatchTransaction(repo, [
      { phase: "insert_import_session", run: async () => {} },
    ]);
    assert.equal(result.status, "SIMULATED_OK");
    assert.equal(result.committed, false);
  });

  await testAsync("tx: soft delete preserves audit", async () => {
    const repo = new api.MockStagingRepository();
    await repo.audit.append(
      api.buildAuditEvent({
        id: "a1",
        importSessionId: "s1",
        eventType: "X",
        actorType: "SYSTEM",
        actorId: "t",
        createdAt: "2026-07-25T00:00:00.000Z",
      }),
    );
    const before = (await repo.audit.listBySession("s1")).length;
    await repo.softDeleteSessionKeepingAudit("s1", "2026-07-25T01:00:00.000Z");
    const after = (await repo.audit.listBySession("s1")).length;
    assert.equal(before, after);
  });

  // —— Commit plan vocabulary ——
  test("commit: forbidden op INSERTED rejected", () => {
    assert.throws(() => api.assertCommitOpVocabulary("INSERTED"));
  });
  test("commit: WOULD_INSERT allowed", () => {
    api.assertCommitOpVocabulary("WOULD_INSERT");
  });
  test("commit: rollback plan dry_run", () => {
    const rp = api.buildRollbackPlan({
      importSessionId: "s1",
      sourceBatchId: BATCH,
    });
    assert.equal(rp.executed, false);
    assert.equal(rp.database_writes, 0);
    assert.equal(rp.preserve_audit_events, true);
  });

  // —— SQL drafts ——
  test("sql: draft directory exists", () => {
    assert.ok(fs.existsSync(draftDir));
  });
  for (const f of [
    "001_staging_import_sessions.sql",
    "002_staging_entities.sql",
    "003_staging_review_items.sql",
    "004_staging_audit_events.sql",
    "005_staging_indexes.sql",
    "006_staging_rls_policies.sql",
    "007_staging_constraints.sql",
    "008_staging_rollback_helpers.sql",
    "README.md",
  ]) {
    test(`sql: file exists ${f}`, () => {
      assert.ok(fs.existsSync(path.join(draftDir, f)));
    });
  }
  test("sql: design-only headers present", () => {
    const sql = fs.readFileSync(path.join(draftDir, "001_staging_import_sessions.sql"), "utf8");
    assert.ok(sql.includes("DESIGN DRAFT ONLY"));
    assert.ok(sql.includes("DO NOT EXECUTE"));
    assert.ok(sql.includes("NO PRODUCTION MIGRATION"));
  });
  test("sql: not registered in supabase/migrations", () => {
    const files = fs.readdirSync(migrationsDir);
    assert.ok(!files.some((f) => f.includes("staging_import_sessions")));
    assert.ok(!files.some((f) => f.includes("staging-import-v1")));
  });
  test("sql: no Production developers table mutation in drafts", () => {
    const body = fs.readFileSync(path.join(draftDir, "002_staging_entities.sql"), "utf8");
    assert.ok(!body.includes("ALTER TABLE public.developers"));
    assert.ok(!body.includes("INSERT INTO public.developers"));
  });
  test("sql: indexes file includes idempotency unique", () => {
    const body = fs.readFileSync(path.join(draftDir, "005_staging_indexes.sql"), "utf8");
    assert.ok(body.includes("idempotency_key"));
    assert.ok(!body.includes("CREATE EXTENSION"));
  });
  test("sql: RLS file mentions staging_importer", () => {
    const body = fs.readFileSync(path.join(draftDir, "006_staging_rls_policies.sql"), "utf8");
    assert.ok(body.includes("staging_importer"));
    assert.ok(body.includes("staging_reviewer"));
    assert.ok(body.includes("read_only_auditor"));
  });

  // —— Batch001 simulation ——
  assert.ok(fs.existsSync(reviewDir), "review console data required");

  await testAsync("sim: Batch001 loads and simulates", async () => {
    const input = api.loadBatchCommitInputFromReviewConsole(reviewDir, {
      batchId: BATCH,
      sourceFileName: `${BATCH}.zip`,
    });
    const bundle = await api.simulateCommit(input);
    assert.equal(bundle.status, "SIMULATED_ONLY");
    assert.equal(bundle.database_writes, 0);
    assert.equal(bundle.storage_uploads, 0);
    assert.equal(bundle.commitPlan.entityCounts.developers, 5);
    assert.equal(bundle.commitPlan.entityCounts.projects, 10);
    assert.equal(bundle.commitPlan.entityCounts.images, 9);
    assert.equal(bundle.commitPlan.entityCounts.pdfs, 5);
    assert.equal(bundle.commitPlan.entityCounts.news, 10);
    assert.equal(bundle.commitPlan.entityCounts.review_items, 63);
    assert.equal(bundle.commitPlan.entityCounts.conflicts, 1);
    assert.equal(bundle.simulationResult.simulated_transaction_status, "SIMULATED_OK");
    assert.ok(bundle.auditEvents.length > 0);
    assert.equal(bundle.storagePlan.items.length, 14);
    assert.equal(bundle.commitPlan.importSession.status, "READY_FOR_COMMIT");
    assert.ok(
      !bundle.commitPlan.orderedOperations.some((o) =>
        ["INSERTED", "UPDATED", "DELETED", "UPLOADED", "COMMITTED"].includes(o.op),
      ),
    );
    // unknown developer candidate ids unique and not unified
    const ids = new Set(
      bundle.simulatedTables.developers.map((d) => d.candidate_id),
    );
    assert.equal(ids.size, 5);
    assert.ok([...ids].every((id) => id !== "dev-unknown"));
    assert.ok(
      bundle.simulatedTables.developers.every((d) => d.identity_status === "UNKNOWN"),
    );
    // projects with unknown developer still staged
    assert.equal(bundle.simulatedTables.projects.length, 10);
    // no published news state
    assert.ok(
      bundle.simulatedTables.news.every((n) => n.review_state !== "PUBLISHED"),
    );
    // assets storage not UPLOADED
    assert.ok(
      bundle.simulatedTables.assets.every(
        (a) => a.storage_status === "PLANNED" || a.storage_status === "NOT_PLANNED",
      ),
    );
  });

  await testAsync("sim: repeated simulation deterministic", async () => {
    const input = api.loadBatchCommitInputFromReviewConsole(reviewDir, {
      batchId: BATCH,
    });
    const a = await api.simulateCommit(input);
    const b = await api.simulateCommit(input);
    assert.equal(
      api.stableStringify(a.simulationResult),
      api.stableStringify(b.simulationResult),
    );
    assert.equal(
      api.stableStringify(a.commitPlan.entityCounts),
      api.stableStringify(b.commitPlan.entityCounts),
    );
    assert.equal(
      a.commitPlan.importSession.idempotency_key,
      b.commitPlan.importSession.idempotency_key,
    );
  });

  await testAsync("sim: write outputs", async () => {
    const input = api.loadBatchCommitInputFromReviewConsole(reviewDir, {
      batchId: BATCH,
      sourceFileName: `${BATCH}.zip`,
    });
    const bundle = await api.simulateCommit(input);
    const outDir = path.join(root, ".work/staging-db", BATCH);
    api.writeSimulationOutputs(outDir, bundle);
    for (const rel of [
      "plan/commit-plan.json",
      "plan/schema-plan.json",
      "plan/transaction-plan.json",
      "plan/idempotency-plan.json",
      "simulation/simulation-result.json",
      "simulation/simulated-tables.json",
      "simulation/simulated-audit-events.jsonl",
      "rollback/rollback-plan.json",
      "storage/storage-plan.json",
      "audit/design-audit-log.jsonl",
      "reports/staging-db-design-summary.json",
    ]) {
      assert.ok(fs.existsSync(path.join(outDir, rel)), rel);
    }
    const plan = readJson(path.join(outDir, "plan/commit-plan.json"));
    assert.equal(plan.database_writes, 0);
    assert.equal(plan.storage_uploads, 0);
    assert.equal(plan.status, "SIMULATED_ONLY");
  });

  await testAsync("sim: same-batch re-run with fingerprints skips", async () => {
    const input = api.loadBatchCommitInputFromReviewConsole(reviewDir, {
      batchId: BATCH,
    });
    const first = await api.simulateCommit(input);
    const map = new Map();
    for (const d of first.simulatedTables.developers) {
      map.set(`developer:${d.source_record_id}`, {
        contentHash: d.content_hash,
      });
    }
    const second = await api.simulateCommit(input, {
      existingSameBatchFingerprints: map,
    });
    assert.ok(second.commitPlan.wouldSkip >= 5);
  });

  // Developer / project / news edge cases
  test("developer: candidate id pattern", () => {
    const devs = readJson(path.join(reviewDir, "developers.json"));
    for (const d of devs) {
      assert.ok(String(d.id).startsWith("candidate-dev-"));
    }
  });
  test("project: unknown developer still present", () => {
    const projects = readJson(path.join(reviewDir, "projects.json"));
    assert.ok(projects.some((p) => p.developerIdentityStatus === "UNKNOWN"));
  });
  test("news: no published flag in ready set misuse", () => {
    const news = readJson(path.join(reviewDir, "news.json"));
    assert.ok(news.every((n) => n.reviewState !== "PUBLISHED"));
  });
  test("conflict: one conflict candidate", () => {
    const c = readJson(path.join(reviewDir, "conflict-candidates.json"));
    assert.equal(c.length, 1);
  });
  test("ready: 14 ready for approval", () => {
    const r = readJson(path.join(reviewDir, "ready-for-approval.json"));
    assert.equal(r.length, 14);
  });

  // CLI
  test("cli: commit command blocked", () => {
    const r = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--no-warnings", "scripts/staging-db-cli.mjs", "commit"],
      { cwd: root, encoding: "utf8" },
    );
    assert.notEqual(r.status, 0);
    assert.ok(String(r.stderr + r.stdout).includes("STAGING_COMMIT_DISABLED"));
  });

  // Production block audit event
  test("prod block audit event created", () => {
    const ev = api.createProductionBlockAuditEvent(
      "sess1",
      ["NODE_ENV=production"],
      "2026-07-25T00:00:00.000Z",
    );
    assert.equal(ev.event_type, "PRODUCTION_WRITE_BLOCKED");
    assert.equal(ev.actor_type, "SYSTEM");
  });

  // Mock repo duplicate idempotency
  await testAsync("mock: duplicate idempotency throws", async () => {
    const repo = new api.MockStagingRepository();
    const row = {
      id: "1",
      import_session_id: "s",
      source_batch_id: "b",
      source_job_id: "j",
      source_record_id: "r",
      source_schema: "v1",
      entity_status: "STAGED",
      review_state: "REVIEW_REQUIRED",
      confidence: "HIGH",
      evidence_json: [],
      raw_payload_json: {},
      normalized_payload_json: {},
      content_hash: "aa".repeat(32),
      idempotency_key: "same",
      created_at: "2026-07-25T00:00:00.000Z",
      updated_at: "2026-07-25T00:00:00.000Z",
      deleted_at: null,
      candidate_id: "c1",
      name: "N",
      normalized_name: "n",
      aliases_json: [],
      official_website: null,
      official_website_verified: false,
      identity_status: "UNKNOWN",
      resolution_method: null,
      dns_status: null,
      duplicate_group_id: null,
      canonical_developer_id: null,
      reviewer_notes: null,
    };
    await repo.developers.insert(row);
    await assert.rejects(() => repo.developers.insert(row));
  });

  // MIME / invalid pdf path already covered via blockers in sim — extra unit
  test("commit plan: productionSafe false when blockers", () => {
    // Batch001 has conflict → productionSafe should be false
    const summaryPath = path.join(
      root,
      ".work/staging-db",
      BATCH,
      "reports/staging-db-design-summary.json",
    );
    if (fs.existsSync(summaryPath)) {
      const s = readJson(summaryPath);
      assert.equal(s.conflicts, 1);
      assert.equal(s.productionSafe, false);
    }
  });

  // Extra coverage for countOps / buildCommitPlanDocument
  test("commit: countOps tallies", () => {
    const counts = api.countOps([
      { op: "WOULD_INSERT", table: "t", entity_type: "developer", entity_id: "1" },
      { op: "WOULD_CREATE_AUDIT", table: "t", entity_type: "audit_event", entity_id: "2" },
    ]);
    assert.equal(counts.WOULD_INSERT, 1);
    assert.equal(counts.WOULD_CREATE_AUDIT, 1);
  });

  test("errors: StagingCommitDisabledError code", () => {
    const e = new api.StagingCommitDisabledError();
    assert.equal(e.code, "STAGING_COMMIT_DISABLED");
  });
  test("errors: ProductionWriteBlockedError code", () => {
    const e = new api.ProductionWriteBlockedError("x");
    assert.equal(e.code, "PRODUCTION_WRITE_BLOCKED");
  });
  test("errors: PathTraversalBlockedError code", () => {
    const e = new api.PathTraversalBlockedError("../x");
    assert.equal(e.code, "PATH_TRAVERSAL_BLOCKED");
  });

  // Force staging write full gate pass path
  test("env: full staging gate passes when all set", () => {
    api.assertStagingWriteAllowed(
      {
        simulation: false,
        confirmStaging: true,
        batchStatus: "READY_FOR_STAGING_REVIEW",
        sealedZipValidated: true,
        commitPlanValidated: true,
        reviewerGateConfigured: true,
      },
      {
        NODE_ENV: "development",
        STAGING_IMPORT_ENABLED: "true",
        STAGING_DATABASE_URL: "postgresql://staging-lab.example/db",
        PRODUCTION_DATABASE_URL: "postgresql://prod-primary.example/db",
      },
    );
  });

  test("env: wrong batch status blocked", () => {
    assert.throws(
      () =>
        api.assertStagingWriteAllowed(
          {
            simulation: false,
            confirmStaging: true,
            batchStatus: "DRAFT",
            sealedZipValidated: true,
            commitPlanValidated: true,
            reviewerGateConfigured: true,
          },
          {
            NODE_ENV: "development",
            STAGING_IMPORT_ENABLED: "true",
            STAGING_DATABASE_URL: "postgresql://staging.example/db",
          },
        ),
      (e) => e.code === "STAGING_ENVIRONMENT_BLOCKED",
    );
  });

  console.log(`\nStaging DB Design tests: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    for (const f of failures) console.error(`FAIL: ${f.name}\n  ${f.error}`);
    process.exit(1);
  }
  if (passed < 80) {
    console.error(`Expected ≥80 tests, got ${passed}`);
    process.exit(1);
  }
  console.log(`TOTAL: ${passed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
