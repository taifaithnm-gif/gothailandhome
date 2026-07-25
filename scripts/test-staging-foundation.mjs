#!/usr/bin/env node
/**
 * Environment isolation + Windows01 import contract tests.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

function clearIsolationEnv() {
  for (const k of [
    "APP_DEPLOY_ENV",
    "VERCEL_ENV",
    "VERCEL",
    "FORCE_PRODUCTION_ENV",
    "SUPABASE_ENV_GUARD",
    "SUPABASE_PRODUCTION_PROJECT_REF",
    "SUPABASE_STAGING_PROJECT_REF",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    delete process.env[k];
  }
}

async function load(modPath) {
  const url = pathToFileURL(path.join(root, modPath)).href;
  return import(`${url}?t=${Date.now()}-${Math.random()}`);
}

// --- Environment detection ---
{
  clearIsolationEnv();
  process.env.APP_DEPLOY_ENV = "preview";
  const { resolveDeployEnv } = await load("src/lib/env/deploy-env.ts");
  assert.equal(resolveDeployEnv(process.env), "preview");
}

{
  clearIsolationEnv();
  process.env.VERCEL_ENV = "production";
  const { resolveDeployEnv } = await load("src/lib/env/deploy-env.ts");
  assert.equal(resolveDeployEnv(process.env), "production");
}

{
  clearIsolationEnv();
  const { resolveDeployEnv } = await load("src/lib/env/deploy-env.ts");
  assert.equal(resolveDeployEnv(process.env), "development");
}

// --- Preview cannot use Production Supabase ---
{
  clearIsolationEnv();
  process.env.APP_DEPLOY_ENV = "preview";
  process.env.SUPABASE_PRODUCTION_PROJECT_REF = "prodprojectref001";
  const { assertSupabaseEnvironmentIsolation, EnvironmentIsolationError } =
    await load("src/lib/env/supabase-guard.ts");
  assert.throws(
    () =>
      assertSupabaseEnvironmentIsolation({
        supabaseUrl: "https://prodprojectref001.supabase.co",
      }),
    (err) =>
      err instanceof EnvironmentIsolationError &&
      err.code === "NON_PROD_USES_PRODUCTION_SUPABASE",
  );
}

// --- Development cannot use Production Supabase ---
{
  clearIsolationEnv();
  process.env.APP_DEPLOY_ENV = "development";
  process.env.SUPABASE_PRODUCTION_PROJECT_REF = "prodprojectref001";
  const { assertSupabaseEnvironmentIsolation, EnvironmentIsolationError } =
    await load("src/lib/env/supabase-guard.ts");
  assert.throws(
    () =>
      assertSupabaseEnvironmentIsolation({
        supabaseUrl: "https://prodprojectref001.supabase.co",
      }),
    (err) =>
      err instanceof EnvironmentIsolationError &&
      err.code === "NON_PROD_USES_PRODUCTION_SUPABASE",
  );
}

// --- Production cannot use Staging Supabase ---
{
  clearIsolationEnv();
  process.env.APP_DEPLOY_ENV = "production";
  process.env.SUPABASE_STAGING_PROJECT_REF = "stagingprojectref1";
  const { assertSupabaseEnvironmentIsolation, EnvironmentIsolationError } =
    await load("src/lib/env/supabase-guard.ts");
  assert.throws(
    () =>
      assertSupabaseEnvironmentIsolation({
        supabaseUrl: "https://stagingprojectref1.supabase.co",
      }),
    (err) =>
      err instanceof EnvironmentIsolationError &&
      err.code === "PRODUCTION_USES_STAGING_SUPABASE",
  );
}

// --- Missing env fails closed ---
{
  clearIsolationEnv();
  process.env.APP_DEPLOY_ENV = "preview";
  const { assertSupabaseEnvironmentIsolation, EnvironmentIsolationError } =
    await load("src/lib/env/supabase-guard.ts");
  assert.throws(
    () => assertSupabaseEnvironmentIsolation({ supabaseUrl: "", requireUrl: true }),
    (err) =>
      err instanceof EnvironmentIsolationError && err.code === "MISSING_SUPABASE_URL",
  );
}

// --- Service role public exposure blocked ---
{
  clearIsolationEnv();
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = "should-never-exist";
  const { assertServiceRoleNotPublic, EnvironmentIsolationError } = await load(
    "src/lib/env/supabase-guard.ts",
  );
  assert.throws(
    () => assertServiceRoleNotPublic(process.env),
    (err) =>
      err instanceof EnvironmentIsolationError && err.code === "SERVICE_ROLE_PUBLIC",
  );
  delete process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
}

// --- Happy path staging preview ---
{
  clearIsolationEnv();
  process.env.APP_DEPLOY_ENV = "preview";
  process.env.SUPABASE_PRODUCTION_PROJECT_REF = "prodprojectref001";
  process.env.SUPABASE_STAGING_PROJECT_REF = "stagingprojectref1";
  const { assertSupabaseEnvironmentIsolation } = await load(
    "src/lib/env/supabase-guard.ts",
  );
  const result = assertSupabaseEnvironmentIsolation({
    supabaseUrl: "https://stagingprojectref1.supabase.co",
  });
  assert.equal(result.ok, true);
  assert.equal(result.projectRef, "stagingprojectref1");
}

// --- Feature flags default false (regression touch) ---
{
  for (const k of Object.keys(process.env).filter((k) => k.includes("FEATURE_P2"))) {
    delete process.env[k];
  }
  const { getPhase2FeatureFlags } = await load("src/lib/feature-flags/index.ts");
  const flags = getPhase2FeatureFlags();
  for (const [name, value] of Object.entries(flags)) {
    assert.equal(value, false, `flag ${name} must default false`);
  }
}

// --- Migration ordering ---
{
  const migDir = path.join(root, "supabase/migrations");
  const files = fs
    .readdirSync(migDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  assert.deepEqual(files, [...files].sort());
  const stamps = files.map((f) => f.slice(0, 14));
  assert.deepEqual(stamps, [...stamps].sort());
  assert.ok(files.includes("20260721100000_phase2a_customer_ops.sql"));
  assert.ok(files.includes("20260721120000_phase2b_acquisition_partners.sql"));
  // Phase 2 policies must be re-run guarded
  for (const f of [
    "20260721100000_phase2a_customer_ops.sql",
    "20260721120000_phase2b_acquisition_partners.sql",
  ]) {
    const sql = fs.readFileSync(path.join(migDir, f), "utf8");
    assert.match(sql, /drop policy if exists/i);
  }
}

// --- Migration lint: no DROP TABLE in Phase 2 ---
{
  for (const f of [
    "20260721100000_phase2a_customer_ops.sql",
    "20260721120000_phase2b_acquisition_partners.sql",
  ]) {
    const sql = fs.readFileSync(path.join(root, "supabase/migrations", f), "utf8");
    assert.doesNotMatch(sql, /drop\s+table/i);
  }
}

// --- Windows01 import framework ---
{
  clearIsolationEnv();
  process.env.APP_DEPLOY_ENV = "development";
  const {
    createWindows01ImportAdapter,
    validateManifest,
    validateRecord,
    assertSafeHttpUrl,
    assertNoPathTraversal,
    canTransition,
    WINDOWS01_CONTRACT_STATUS,
    Windows01ValidationError,
  } = await load("src/lib/integrations/windows01/index.ts");

  assert.equal(WINDOWS01_CONTRACT_STATUS, "WAITING_FOR_WINDOWS01_CONTRACT");

  assert.throws(
    () => validateManifest({ schemaVersion: "nope" }),
    (e) => e instanceof Windows01ValidationError && e.code === "UNSUPPORTED_SCHEMA",
  );

  assert.throws(
    () => assertNoPathTraversal("../etc/passwd"),
    (e) => e instanceof Windows01ValidationError && e.code === "PATH_TRAVERSAL",
  );

  assert.throws(
    () => assertSafeHttpUrl("http://127.0.0.1/secret"),
    (e) => e instanceof Windows01ValidationError && e.code === "MALICIOUS_URL",
  );

  assert.throws(
    () =>
      validateRecord({
        schemaVersion: "windows01.results.v0",
        recordId: "r1",
        contentHash: "0123456789abcdef",
        timestamp: new Date().toISOString(),
        evidenceRefs: [],
        payload: {},
      }),
    (e) => e instanceof Windows01ValidationError && e.code === "MISSING_EVIDENCE",
  );

  assert.equal(canTransition("RECEIVED", "MANIFEST_VALIDATED"), true);
  assert.equal(canTransition("RECEIVED", "PRODUCTION_PUBLISHED"), false);
  assert.equal(canTransition("AWAITING_HUMAN_REVIEW", "APPROVED_FOR_PUBLISH"), true);

  const adapter = createWindows01ImportAdapter();
  const manifest = {
    schemaVersion: "windows01.manifest.v0",
    batchId: "batch-1",
    producedAt: new Date().toISOString(),
    sourceMachine: "windows01",
    workerVersion: "windows01-worker.0.1.0",
    recordCount: 2,
    contentHash: "batchhash0123456789",
    evidencePaths: ["evidence/a.json", "evidence/b.json"],
  };
  const goodRecord = (id, hash, evidence, extras = {}) => ({
    schemaVersion: "windows01.results.v0",
    recordId: id,
    contentHash: hash,
    timestamp: new Date().toISOString(),
    sourceUrl: extras.sourceUrl ?? `https://example.com/listing/${id}`,
    evidenceRefs: [evidence],
    workerState: "EXTRACTED",
    payload: {
      title: "demo",
      developer: extras.developer ?? `dev-${id}`,
      project_name: extras.project ?? `project-${id}`,
      province: "Bangkok",
    },
    evidence: extras.evidence,
  });

  // Dry-run
  const dry = adapter.runImport(
    {
      manifest,
      records: [
        goodRecord("r1", "contenthash00000001", "evidence/a.json"),
        goodRecord("r2", "contenthash00000002", "evidence/b.json"),
      ],
    },
    "dry-run",
  );
  assert.equal(dry.mode, "dry-run");
  assert.equal(dry.accepted, 2);
  assert.equal(dry.quarantined.length, 0);
  assert.ok(dry.audit.length >= 1);

  // Duplicate record
  const dupId = adapter.runImport(
    {
      manifest: { ...manifest, recordCount: 2 },
      records: [
        goodRecord("r1", "contenthash00000001", "evidence/a.json"),
        goodRecord("r1", "contenthash00000003", "evidence/b.json"),
      ],
    },
    "dry-run",
  );
  assert.ok(dupId.quarantined.some((q) => q.reason === "DUPLICATE_RECORD"));

  // Duplicate hash
  const dupHash = adapter.runImport(
    {
      manifest: { ...manifest, recordCount: 2 },
      records: [
        goodRecord("r1", "contenthash00000001", "evidence/a.json"),
        goodRecord("r2", "contenthash00000001", "evidence/b.json"),
      ],
    },
    "dry-run",
  );
  assert.ok(dupHash.quarantined.some((q) => q.reason === "DUPLICATE_HASH"));

  // Missing evidence integrity
  const missingEv = adapter.runImport(
    {
      manifest: { ...manifest, recordCount: 1 },
      records: [
        {
          ...goodRecord("r1", "contenthash00000001", "evidence/missing.json"),
        },
      ],
    },
    "dry-run",
  );
  assert.ok(missingEv.quarantined.some((q) => q.reason === "MISSING_EVIDENCE"));

  // Forbidden worker state
  assert.throws(
    () =>
      validateRecord({
        ...goodRecord("r1", "contenthash00000001", "evidence/a.json"),
        workerState: "PUBLISHED",
      }),
    (e) =>
      e instanceof Windows01ValidationError && e.code === "FORBIDDEN_WORKER_STATE",
  );

  // Oversized payload
  assert.throws(
    () =>
      validateRecord({
        ...goodRecord("r1", "contenthash00000001", "evidence/a.json"),
        payload: { blob: "x".repeat(600_000) },
      }),
    (e) => e instanceof Windows01ValidationError && e.code === "OVERSIZED_PAYLOAD",
  );

  // Staging import
  const staging = adapter.runImport(
    {
      manifest: { ...manifest, recordCount: 1 },
      records: [goodRecord("r9", "contenthash00000009", "evidence/a.json")],
    },
    "staging",
  );
  assert.equal(staging.accepted, 1);
  assert.equal(staging.nextStates[0].state, "STAGING_IMPORTED");

  // Production hard block
  process.env.APP_DEPLOY_ENV = "production";
  const blocked = adapter.runImport(
    {
      manifest: { ...manifest, recordCount: 1 },
      records: [goodRecord("r9", "contenthash00000009", "evidence/a.json")],
    },
    "staging",
  );
  assert.equal(blocked.mode, "blocked-production");
  assert.equal(blocked.accepted, 0);
  assert.ok(
    blocked.quarantined.some((q) => q.reason === "PRODUCTION_HARD_BLOCK"),
  );
}

// --- Service role must not appear in client module graph ---
{
  const envSrc = fs.readFileSync(path.join(root, "src/lib/supabase/env.ts"), "utf8");
  const clientSrc = fs.readFileSync(
    path.join(root, "src/lib/supabase/client.ts"),
    "utf8",
  );
  assert.doesNotMatch(envSrc, /getSupabaseServiceRoleKey/);
  assert.doesNotMatch(clientSrc, /service-env|SERVICE_ROLE/);
  assert.match(
    fs.readFileSync(path.join(root, "src/lib/supabase/service-env.ts"), "utf8"),
    /server-only/,
  );
}

// --- Phase 2 routes remain flag-gated (spot check) ---
{
  const mapPage = fs.readFileSync(
    path.join(root, "src/app/[lang]/map/page.tsx"),
    "utf8",
  );
  assert.match(mapPage, /isPhase2MapEnabled/);
  const toolsPage = fs.readFileSync(
    path.join(root, "src/app/[lang]/tools/page.tsx"),
    "utf8",
  );
  assert.match(toolsPage, /isPhase2ToolsEnabled/);
}

console.log("PASS: staging foundation env isolation + windows01 import tests");
