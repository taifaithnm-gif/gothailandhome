#!/usr/bin/env node
/**
 * Phase A — Manual Review Decision infrastructure tests.
 * Covers: schema, repository, RLS, migration, constraints, idempotency, audit, rollback.
 * Never mounts Decision API / UI / Apply / Reject / Submit / Publish / Production.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash, randomUUID } from "node:crypto";

const root = process.cwd();
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, error: err instanceof Error ? err.message : String(err) });
    console.error(`FAIL ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    failed += 1;
    failures.push({ name, error: err instanceof Error ? err.message : String(err) });
    console.error(`FAIL ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

function readMigration(name) {
  return fs.readFileSync(
    path.join(root, "database/staging-migrations", name),
    "utf8",
  );
}

async function main() {
  const schemaSql = readMigration("20260726_010_staging_review_decisions.sql");
  const rlsSql = readMigration("20260726_011_staging_review_decisions_rls.sql");
  const constraintsSql = readMigration(
    "20260726_012_staging_review_decisions_constraints.sql",
  );
  const rollbackSql = fs.readFileSync(
    path.join(
      root,
      "database/staging-rollback/20260726_review_decisions_rollback.sql",
    ),
    "utf8",
  );

  // ---------- SCHEMA ----------
  test("schema: staging-only headers on forward migrations", () => {
    for (const body of [schemaSql, rlsSql, constraintsSql]) {
      assert.ok(body.includes("STAGING ONLY"));
      assert.ok(body.includes("DO NOT APPLY TO PRODUCTION"));
    }
  });

  test("schema: four decision tables created", () => {
    for (const t of [
      "staging_review_decisions",
      "staging_review_decision_evidence",
      "staging_review_decision_changes",
      "staging_review_decision_audit",
    ]) {
      assert.ok(schemaSql.includes(`CREATE TABLE IF NOT EXISTS ${t}`));
    }
  });

  test("schema: PK / FK / UNIQUE / CHECK / INDEX present", () => {
    assert.ok(/PRIMARY KEY/i.test(schemaSql));
    assert.ok(/REFERENCES staging_review_items\(id\)/i.test(schemaSql));
    assert.ok(/REFERENCES staging_import_sessions\(import_session_id\)/i.test(schemaSql));
    assert.ok(/REFERENCES staging_conflict_candidates\(id\)/i.test(schemaSql));
    assert.ok(schemaSql.includes("uq_staging_decision_active_item"));
    assert.ok(schemaSql.includes("uq_staging_decision_idempotency"));
    assert.ok(/CHECK \(status IN/i.test(schemaSql));
    assert.ok(/CHECK \(decision_family IN/i.test(schemaSql));
    assert.ok(/CHECK \(risk_level IN/i.test(schemaSql));
    assert.ok(/idempotency_key TEXT NOT NULL/i.test(schemaSql));
    assert.ok(/created_at TIMESTAMPTZ NOT NULL/i.test(schemaSql));
    assert.ok(/submitted_at TIMESTAMPTZ/i.test(schemaSql));
    assert.ok(/applied_at TIMESTAMPTZ/i.test(schemaSql));
    assert.ok(/rolled_back_at TIMESTAMPTZ/i.test(schemaSql));
  });

  test("schema: audit/evidence/changes have no updated_at", () => {
    const evidenceBlock = schemaSql.slice(
      schemaSql.indexOf("staging_review_decision_evidence"),
      schemaSql.indexOf("staging_review_decision_changes"),
    );
    const changesBlock = schemaSql.slice(
      schemaSql.indexOf("staging_review_decision_changes"),
      schemaSql.indexOf("staging_review_decision_audit"),
    );
    const auditBlock = schemaSql.slice(
      schemaSql.indexOf("staging_review_decision_audit"),
    );
    assert.ok(!/updated_at/i.test(evidenceBlock));
    assert.ok(!/updated_at/i.test(changesBlock));
    assert.ok(!/updated_at/i.test(auditBlock));
  });

  test("schema: no Approval / Publish / Production columns", () => {
    const bodyNoHeader = schemaSql
      .split("\n")
      .filter((l) => !l.trimStart().startsWith("--"))
      .join("\n");
    assert.ok(!/APPROVED|PUBLISHED|READY_FOR_PRODUCTION/i.test(bodyNoHeader));
    assert.ok(!/\bproduction\b/i.test(bodyNoHeader));
  });

  // ---------- RLS ----------
  test("rls: enabled on decision tables", () => {
    for (const t of [
      "staging_review_decisions",
      "staging_review_decision_evidence",
      "staging_review_decision_changes",
      "staging_review_decision_audit",
    ]) {
      assert.ok(
        rlsSql.includes(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`),
      );
    }
  });

  test("rls: five workflow roles present", () => {
    assert.ok(rlsSql.includes("staging_review_viewer"));
    assert.ok(rlsSql.includes("staging_reviewer"));
    assert.ok(rlsSql.includes("staging_senior_reviewer"));
    assert.ok(rlsSql.includes("staging_admin"));
    assert.ok(rlsSql.includes("read_only_auditor"));
  });

  test("rls: PUBLIC revoked; no DELETE grants on children", () => {
    assert.ok(/REVOKE ALL ON TABLE staging_review_decisions FROM PUBLIC/i.test(rlsSql));
    assert.ok(!/^\s*GRANT\s+DELETE/im.test(rlsSql));
    assert.ok(!/GRANT\s+.*\s+TO\s+(PUBLIC|anon|authenticated)\b/i.test(rlsSql));
  });

  test("rls: draft insert only; no Approval/Publish policies", () => {
    assert.ok(/WITH CHECK \(status = 'DRAFT'\)/i.test(rlsSql));
    const bodyNoHeader = rlsSql
      .split("\n")
      .filter((l) => !l.trimStart().startsWith("--"))
      .join("\n");
    assert.ok(!/APPROVED|PUBLISHED|READY_FOR_PRODUCTION/i.test(bodyNoHeader));
  });

  // ---------- CONSTRAINTS / IMMUTABLE ----------
  test("constraints: immutability triggers defined", () => {
    assert.ok(
      constraintsSql.includes("staging_forbid_decision_immutable_mutation"),
    );
    assert.ok(
      constraintsSql.includes("staging_forbid_decision_child_mutation"),
    );
    assert.ok(constraintsSql.includes("GTH_DECISION_IDEMPOTENCY_KEY_IMMUTABLE"));
    assert.ok(constraintsSql.includes("GTH_DECISION_CHILD_APPEND_ONLY"));
    assert.ok(constraintsSql.includes("SET search_path = public"));
    assert.ok(/REVOKE ALL ON FUNCTION/i.test(constraintsSql));
  });

  // ---------- MIGRATION / ROLLBACK ----------
  test("migration: listed in EXPECTED_STAGING_MIGRATIONS", async () => {
    const api = await import(
      `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/index.ts")).href}?t=${Date.now()}`
    );
    assert.equal(api.EXPECTED_STAGING_MIGRATIONS.length, 12);
    assert.equal(api.FROZEN_STAGING_MIGRATIONS_V1.length, 9);
    assert.deepEqual(
      [...api.EXPECTED_STAGING_MIGRATIONS.slice(0, 9)],
      [...api.FROZEN_STAGING_MIGRATIONS_V1],
    );
    for (const t of api.PHASE_A_DECISION_TABLES) {
      assert.ok(api.EXPECTED_STAGING_TABLES.includes(t));
    }
  });

  test("migration: forward has no DROP TABLE / TRUNCATE / CASCADE", () => {
    for (const body of [schemaSql, rlsSql, constraintsSql]) {
      assert.ok(!/\bDROP\s+TABLE\b/i.test(body));
      assert.ok(!/\bTRUNCATE\b/i.test(body));
      assert.ok(!/\bCASCADE\b/i.test(body));
    }
  });

  test("rollback: drops Phase A decision objects only", () => {
    assert.ok(rollbackSql.includes("STAGING ONLY"));
    assert.ok(rollbackSql.includes("DROP TABLE IF EXISTS staging_review_decision_audit"));
    assert.ok(rollbackSql.includes("DROP TABLE IF EXISTS staging_review_decision_changes"));
    assert.ok(rollbackSql.includes("DROP TABLE IF EXISTS staging_review_decision_evidence"));
    assert.ok(rollbackSql.includes("DROP TABLE IF EXISTS staging_review_decisions"));
    assert.ok(!rollbackSql.includes("staging_review_items"));
    assert.ok(!rollbackSql.includes("staging_import_sessions"));
    assert.ok(!/\bdevelopers\b|\bproperty_projects\b/i.test(rollbackSql));
  });

  const stagingDb = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/index.ts")).href}?t=${Date.now()}`
  );

  // ---------- IDEMPOTENCY ----------
  test("idempotency: key is sha256 without timestamps", () => {
    const key = stagingDb.buildDecisionIdempotencyKey({
      sourceBatchId: "BATCH-1",
      reviewItemId: "item-1",
      decisionFamily: "PROJECT_PROVINCE",
      decisionAction: "OVERRIDE_PROVINCE",
      contentHash: "abc",
    });
    assert.equal(key.length, 64);
    assert.match(key, /^[a-f0-9]+$/);
    const key2 = stagingDb.buildDecisionIdempotencyKey({
      sourceBatchId: "BATCH-1",
      reviewItemId: "item-1",
      decisionFamily: "PROJECT_PROVINCE",
      decisionAction: "OVERRIDE_PROVINCE",
      contentHash: "ABC",
    });
    assert.equal(key, key2);
  });

  // ---------- REPOSITORY ----------
  await testAsync("repository: createDraft + read + list", async () => {
    const repo = new stagingDb.MockDecisionRepository();
    const contentHash = createHash("sha256").update("{}").digest("hex");
    const idempotencyKey = stagingDb.buildDecisionIdempotencyKey({
      sourceBatchId: "BATCH-GTH-TEST",
      reviewItemId: "11111111-1111-1111-1111-111111111111",
      decisionFamily: "PROJECT_PROVINCE",
      decisionAction: "DEFER",
      contentHash,
    });
    const created = await repo.createDraft({
      import_session_id: "sess_test",
      source_batch_id: "BATCH-GTH-TEST",
      review_item_id: "11111111-1111-1111-1111-111111111111",
      decision_family: "PROJECT_PROVINCE",
      decision_action: "DEFER",
      target_type: "PROJECT",
      target_id: "36936",
      risk_level: "LOW",
      actor_id: "reviewer-1",
      actor_role: "REVIEWER",
      idempotency_key: idempotencyKey,
      content_hash: contentHash,
      payload_after: { final_value: null },
    });
    assert.equal(created.status, "DRAFT");
    const found = await repo.findById(created.id);
    assert.ok(found);
    assert.equal(found.idempotency_key, idempotencyKey);
    const listed = await repo.list({ status: "DRAFT" });
    assert.equal(listed.length, 1);
    const audits = await repo.listAudit(created.id);
    assert.equal(audits.length, 1);
    assert.equal(audits[0].event_type, "DECISION_DRAFT_CREATED");
  });

  await testAsync("repository: idempotency conflict on duplicate key", async () => {
    const repo = new stagingDb.MockDecisionRepository();
    const contentHash = "aa".repeat(32);
    const key = stagingDb.buildDecisionIdempotencyKey({
      sourceBatchId: "B",
      reviewItemId: "22222222-2222-2222-2222-222222222222",
      decisionFamily: "NEWS_METADATA",
      decisionAction: "DEFER",
      contentHash,
    });
    const input = {
      import_session_id: "sess",
      source_batch_id: "B",
      review_item_id: "22222222-2222-2222-2222-222222222222",
      decision_family: "NEWS_METADATA",
      decision_action: "DEFER",
      target_type: "NEWS",
      target_id: "n1",
      risk_level: "LOW",
      actor_id: "r1",
      actor_role: "REVIEWER",
      idempotency_key: key,
      content_hash: contentHash,
    };
    await repo.createDraft(input);
    await assert.rejects(
      () => repo.createDraft(input),
      (err) => err instanceof stagingDb.IdempotencyConflictError,
    );
  });

  await testAsync("repository: unique active decision per review item", async () => {
    const repo = new stagingDb.MockDecisionRepository();
    const itemId = "33333333-3333-3333-3333-333333333333";
    const base = {
      import_session_id: "sess",
      source_batch_id: "B",
      review_item_id: itemId,
      decision_family: "IMAGE_FAILURE",
      decision_action: "DEFER",
      target_type: "ASSET",
      target_id: "a1",
      risk_level: "LOW",
      actor_id: "r1",
      actor_role: "REVIEWER",
    };
    await repo.createDraft({
      ...base,
      idempotency_key: "k1-" + randomUUID(),
      content_hash: "bb".repeat(32),
    });
    await assert.rejects(
      () =>
        repo.createDraft({
          ...base,
          idempotency_key: "k2-" + randomUUID(),
          content_hash: "cc".repeat(32),
        }),
      (err) =>
        err instanceof stagingDb.StagingDbError &&
        err.code === "GTH_DECISION_ACTIVE_EXISTS",
    );
  });

  test("validation: rejects invalid family/action pair", () => {
    assert.throws(
      () =>
        stagingDb.validateCreateDecisionDraft({
          import_session_id: "s",
          source_batch_id: "b",
          review_item_id: "i",
          decision_family: "PROJECT_PROVINCE",
          decision_action: "REJECT_PDF",
          target_type: "PROJECT",
          target_id: "1",
          risk_level: "LOW",
          actor_id: "a",
          actor_role: "REVIEWER",
          idempotency_key: "k",
          content_hash: "h",
        }),
      (err) => err instanceof stagingDb.SchemaValidationError,
    );
  });

  test("validation: role matrix constants exclude Approval/Publish", () => {
    assert.ok(!stagingDb.REVIEW_DECISION_ROLES.includes("APPROVER"));
    assert.ok(!stagingDb.REVIEW_DECISION_ROLES.includes("PUBLISHER"));
    assert.deepEqual(
      [...stagingDb.REVIEW_DECISION_ROLES],
      [
        "REVIEW_VIEWER",
        "REVIEWER",
        "SENIOR_REVIEWER",
        "REVIEW_ADMIN",
        "SYSTEM_AUDITOR",
      ],
    );
  });

  test("audit: decision status vocabulary includes DRAFT only for Phase A writes", () => {
    assert.ok(stagingDb.DECISION_STATUSES.includes("DRAFT"));
    assert.ok(stagingDb.DECISION_STATUSES.includes("APPLIED"));
    assert.ok(stagingDb.DECISION_STATUSES.includes("ROLLED_BACK"));
  });

  // ---------- STATIC AUDIT RUNNER ----------
  await testAsync("migration audit runner passes for staging-migrations", async () => {
    const { spawnSync } = await import("node:child_process");
    const r = spawnSync(
      process.execPath,
      ["scripts/audit-staging-migrations.mjs"],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const report = JSON.parse(r.stdout);
    assert.equal(report.ok, true);
    const phaseA = report.files.filter((f) =>
      f.file.startsWith("20260726_"),
    );
    assert.equal(phaseA.length, 3);
    for (const f of phaseA) assert.equal(f.ok, true);
  });

  // ---------- LIVE (optional) ----------
  const supabaseApi = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/index.ts")).href}?t=${Date.now() + 1}`
  );
  const avail = supabaseApi.describeStagingClientAvailability(process.env);
  if (!avail.allowed) {
    console.log(
      JSON.stringify(
        {
          live: "SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED",
          staticPassed: passed,
          staticFailed: failed,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(
      JSON.stringify(
        {
          live: "ENV_PRESENT_BUT_PHASE_A_LIVE_APPLY_NOT_AUTO_RUN",
          note: "Use npm run staging:db:migrate -- --confirm-staging to apply; tests remain static+mock",
        },
        null,
        2,
      ),
    );
  }

  console.log(
    `\nPhase A decision tests: ${passed} passed, ${failed} failed`,
  );
  if (failures.length) {
    for (const f of failures) console.error(`FAIL: ${f.name}\n  ${f.error}`);
    process.exit(1);
  }
  if (passed < 20) {
    console.error(`Expected ≥20 tests, got ${passed}`);
    process.exit(1);
  }
  console.log(`TOTAL: ${passed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
