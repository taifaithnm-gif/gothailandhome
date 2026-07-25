#!/usr/bin/env node
/**
 * Architecture Freeze V1 — boundary, naming, state, vocabulary, determinism, security.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const BATCH = "BATCH-GTH-20260724-001";
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    const r = fn();
    if (r && typeof r.then === "function") {
      throw new Error(`Use testAsync for ${name}`);
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
  const url = pathToFileURL(path.join(root, rel)).href;
  return import(`${url}?t=${Date.now()}-${Math.random()}`);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function main() {
  const importApi = await load("src/lib/staging-import/index.ts");
  const dbApi = await load("src/lib/staging-db/index.ts");
  const w01 = await load("src/lib/integrations/windows01/index.ts");
  const review = await load("src/lib/review-console/index.ts");
  const contract = await load(
    "src/lib/integrations/windows01/contract-versions.ts",
  );

  // —— Boundaries ——
  test("boundary: windows01 does not import staging-import", () => {
    const files = fs
      .readdirSync(path.join(root, "src/lib/integrations/windows01"))
      .filter((f) => f.endsWith(".ts"));
    for (const f of files) {
      const body = fs.readFileSync(
        path.join(root, "src/lib/integrations/windows01", f),
        "utf8",
      );
      assert.ok(!body.includes("staging-import"));
      assert.ok(!body.includes("staging-db"));
      assert.ok(!body.includes("review-console"));
    }
  });

  test("boundary: staging-import core does not import review-console", () => {
    const core = fs
      .readdirSync(path.join(root, "src/lib/staging-import"))
      .filter((f) => f.endsWith(".ts"));
    for (const f of core) {
      const body = fs.readFileSync(
        path.join(root, "src/lib/staging-import", f),
        "utf8",
      );
      assert.ok(!body.includes("review-console"));
      assert.ok(!body.includes("staging-db"));
    }
  });

  test("boundary: staging-db has no supabase/pg driver imports", () => {
    const files = fs
      .readdirSync(path.join(root, "src/lib/staging-db"))
      .filter((f) => f.endsWith(".ts"));
    for (const f of files) {
      const body = fs.readFileSync(
        path.join(root, "src/lib/staging-db", f),
        "utf8",
      );
      assert.ok(!/from ["']@supabase|from ["']pg["']|createClient\(/.test(body));
    }
  });

  test("boundary: review-console has no supabase client", () => {
    const body = fs.readFileSync(
      path.join(root, "src/lib/review-console/load.ts"),
      "utf8",
    );
    assert.ok(!body.includes("supabase"));
    assert.ok(!body.includes("createClient"));
  });

  test("boundary: contract version centralized", () => {
    assert.equal(contract.BATCH_CONTRACT_V1, "BATCH_CONTRACT_V1");
    assert.equal(contract.GOTH_BATCH_MANIFEST_SCHEMA_V1, "goth_batch_manifest.v1");
    assert.equal(
      w01.GOTH_BATCH_MANIFEST_SCHEMA_V1,
      contract.GOTH_BATCH_MANIFEST_SCHEMA_V1,
    );
    assert.ok(
      importApi.SUPPORTED_BATCH_SCHEMA_VERSIONS.includes(
        contract.GOTH_BATCH_MANIFEST_SCHEMA_V1,
      ),
    );
  });

  // —— State machine ——
  test("state: READY_FOR_APPROVAL cannot go to APPROVED", () => {
    assert.equal(
      importApi.canTransition("READY_FOR_APPROVAL", "APPROVED"),
      false,
    );
  });
  test("state: APPROVED has no outbound edges", () => {
    assert.deepEqual(importApi.REVIEW_TRANSITIONS.APPROVED, []);
  });
  test("state: automation ceiling READY_FOR_APPROVAL", () => {
    assert.equal(importApi.MAX_AUTOMATION_REVIEW_STATE, "READY_FOR_APPROVAL");
  });
  test("state: future manual states marked", () => {
    assert.ok(importApi.FUTURE_MANUAL_STATES.includes("PUBLISHED"));
  });
  test("state: InvalidReviewStateTransitionError thrown", () => {
    assert.throws(
      () => importApi.assertTransition("READY_FOR_APPROVAL", "APPROVED"),
      (e) => e.name === "InvalidReviewStateTransitionError",
    );
  });

  // —— Action vocabulary ——
  test("vocab: preview has WOULD_CREATE not WOULD_INSERT", () => {
    assert.ok(importApi.PREVIEW_ACTIONS.includes("WOULD_CREATE"));
    assert.ok(!importApi.PREVIEW_ACTIONS.includes("WOULD_INSERT"));
  });
  test("vocab: commit ops have WOULD_INSERT not WOULD_CREATE", () => {
    assert.throws(() => dbApi.assertCommitOpVocabulary("WOULD_CREATE"));
    dbApi.assertCommitOpVocabulary("WOULD_INSERT");
  });
  test("vocab: storage actions distinct", () => {
    const item = dbApi.planStorageItem({
      batchId: BATCH,
      entityType: "asset",
      entityId: "x",
      localRelativePath: "images/x.jpg",
      sha256: "ab".repeat(32),
      mimeType: "image/jpeg",
      fileSize: 1,
      originalFilename: "x.jpg",
    });
    assert.equal(item.storage_action, "WOULD_UPLOAD");
  });
  test("vocab: forbidden completed tenses", () => {
    for (const bad of ["INSERTED", "UPDATED", "DELETED", "UPLOADED", "COMMITTED"]) {
      assert.throws(() => dbApi.assertCommitOpVocabulary(bad));
    }
  });

  // —— Production hard block red team ——
  const redCases = [
    { NODE_ENV: "production" },
    { VERCEL_ENV: "production" },
    { NEXT_PUBLIC_APP_ENV: "production" },
    {
      NODE_ENV: "development",
      STAGING_DATABASE_URL: "postgresql://api-production.internal/db",
    },
  ];
  for (const [i, env] of redCases.entries()) {
    test(`redteam[${i}]: production signals blocked`, () => {
      const c = dbApi.checkProductionWriteBlock(env);
      assert.equal(c.blocked, true);
    });
  }
  test("redteam: simulation still allowed", () => {
    dbApi.assertStagingWriteAllowed(
      { simulation: true },
      { NODE_ENV: "development" },
    );
  });
  test("redteam: commit disabled", () => {
    assert.throws(() => dbApi.attemptRealCommit(), (e) =>
      String(e.code).includes("STAGING_COMMIT_DISABLED"),
    );
  });
  test("redteam: missing confirm staging blocked", () => {
    assert.throws(
      () =>
        dbApi.assertStagingWriteAllowed(
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
            STAGING_DATABASE_URL: "postgresql://staging-lab.example/db",
          },
        ),
      (e) => e.code === "STAGING_ENVIRONMENT_BLOCKED",
    );
  });

  // —— Review console ——
  test("review console: default flag false", () => {
    const prev = process.env.FEATURE_GOTH_REVIEW_CONSOLE;
    delete process.env.FEATURE_GOTH_REVIEW_CONSOLE;
    assert.equal(review.isGothReviewConsoleEnabled(), false);
    if (prev != null) process.env.FEATURE_GOTH_REVIEW_CONSOLE = prev;
  });
  test("review console: invalid batch id blocked", () => {
    assert.throws(() => review.assertSafeBatchId("../etc"));
  });
  test("review console: valid batch id", () => {
    assert.equal(review.assertSafeBatchId(BATCH), BATCH);
  });

  // —— CLI ——
  test("cli: staging:db:commit blocked", () => {
    const r = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--no-warnings", "scripts/staging-db-cli.mjs", "commit"],
      { cwd: root, encoding: "utf8" },
    );
    assert.notEqual(r.status, 0);
    assert.ok(String(r.stderr + r.stdout).includes("STAGING_COMMIT_DISABLED"));
  });

  // —— SQL drafts ——
  test("sql drafts not in supabase/migrations", () => {
    const mig = fs.readdirSync(path.join(root, "supabase/migrations"));
    assert.ok(!mig.some((f) => f.includes("staging_import")));
  });
  test("sql drafts have design headers", () => {
    const sql = fs.readFileSync(
      path.join(
        root,
        "database-design/staging-import-v1/001_staging_import_sessions.sql",
      ),
      "utf8",
    );
    assert.ok(sql.includes("DESIGN DRAFT ONLY"));
    assert.ok(sql.includes("DO NOT EXECUTE"));
  });

  // —— Determinism ——
  const reviewDir = path.join(root, ".work/review-console", BATCH);
  await testAsync("determinism: commit simulation stable", async () => {
    assert.ok(fs.existsSync(reviewDir), "Batch001 review console required");
    const input = dbApi.loadBatchCommitInputFromReviewConsole(reviewDir, {
      batchId: BATCH,
    });
    const a = await dbApi.simulateCommit(input);
    const b = await dbApi.simulateCommit(input);
    assert.equal(
      dbApi.stableStringify(a.simulationResult),
      dbApi.stableStringify(b.simulationResult),
    );
    assert.equal(
      a.commitPlan.importSession.idempotency_key,
      b.commitPlan.importSession.idempotency_key,
    );
    assert.equal(a.database_writes, 0);
    assert.equal(a.storage_uploads, 0);
    assert.equal(a.commitPlan.entityCounts.developers, 5);
    assert.equal(a.commitPlan.entityCounts.projects, 10);
    assert.equal(a.commitPlan.entityCounts.images, 9);
    assert.equal(a.commitPlan.entityCounts.pdfs, 5);
    assert.equal(a.commitPlan.entityCounts.news, 10);
    assert.equal(a.commitPlan.entityCounts.review_items, 63);
    assert.equal(a.commitPlan.entityCounts.conflicts, 1);
  });

  await testAsync("batch001: conflict 36936 remains", async () => {
    const conflicts = readJson(
      path.join(reviewDir, "conflict-candidates.json"),
    );
    assert.equal(conflicts.length, 1);
    assert.equal(String(conflicts[0].entityId), "36936");
    assert.ok(
      String(conflicts[0].sourceReason).includes("PROVINCE") ||
        String(conflicts[0].mappedReason) === "CONFLICT",
    );
  });

  await testAsync("batch001: ready for approval 14", async () => {
    const ready = readJson(path.join(reviewDir, "ready-for-approval.json"));
    assert.equal(ready.length, 14);
  });

  // —— Docs / ADR presence ——
  test("docs: STAGING_ARCHITECTURE_V1 exists", () => {
    assert.ok(fs.existsSync(path.join(root, "docs/STAGING_ARCHITECTURE_V1.md")));
  });
  test("docs: ACTION_VOCABULARY exists", () => {
    assert.ok(fs.existsSync(path.join(root, "docs/ACTION_VOCABULARY.md")));
  });
  test("adr: at least 12 ADRs", () => {
    const adrs = fs
      .readdirSync(path.join(root, "docs/adr"))
      .filter((f) => f.endsWith(".md"));
    assert.ok(adrs.length >= 12, `got ${adrs.length}`);
  });
  test("freeze manifest exists", () => {
    assert.ok(
      fs.existsSync(
        path.join(
          root,
          "docs/architecture-freeze/ARCHITECTURE_FREEZE_MANIFEST.json",
        ),
      ),
    );
  });

  // —— Naming: no absolute path in review outputs ——
  test("naming: review summary has no absolute paths", () => {
    const summary = fs.readFileSync(
      path.join(reviewDir, "summary.json"),
      "utf8",
    );
    assert.ok(!/\/Users\//.test(summary));
    assert.ok(!/\/Volumes\//.test(summary));
  });

  console.log(
    `\nArchitecture Freeze tests: ${passed} passed, ${failed} failed`,
  );
  if (failures.length) {
    for (const f of failures) console.error(`FAIL: ${f.name}\n  ${f.error}`);
    process.exit(1);
  }
  console.log(`TOTAL: ${passed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
