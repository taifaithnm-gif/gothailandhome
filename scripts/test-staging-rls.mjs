#!/usr/bin/env node
/**
 * Staging RLS test suite.
 * Without provisioned Staging: SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED
 * Always runs static RLS SQL audit.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
let passed = 0;

function test(name, fn) {
  fn();
  passed += 1;
  console.log(`PASS ${name}`);
}

async function main() {
  const rls = fs.readFileSync(
    path.join(root, "database/staging-migrations/20260725_006_staging_rls.sql"),
    "utf8",
  );
  const decisionRls = fs.readFileSync(
    path.join(
      root,
      "database/staging-migrations/20260726_011_staging_review_decisions_rls.sql",
    ),
    "utf8",
  );
  test("static: RLS enabled on staging tables", () => {
    assert.ok(/ENABLE ROW LEVEL SECURITY/i.test(rls));
  });
  test("static: public revoked", () => {
    assert.ok(/REVOKE ALL ON TABLE/i.test(rls));
  });
  test("static: staging only header", () => {
    assert.ok(rls.includes("STAGING ONLY"));
  });
  test("static: Phase A decision RLS enabled", () => {
    assert.ok(/ENABLE ROW LEVEL SECURITY/i.test(decisionRls));
    assert.ok(decisionRls.includes("staging_review_viewer"));
    assert.ok(decisionRls.includes("staging_senior_reviewer"));
    const bodyNoHeader = decisionRls
      .split("\n")
      .filter((l) => !l.trimStart().startsWith("--"))
      .join("\n");
    assert.ok(!/APPROVED|PUBLISHED/i.test(bodyNoHeader));
  });

  const api = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/index.ts")).href}?t=${Date.now()}`
  );
  const avail = api.describeStagingClientAvailability(process.env);
  if (!avail.allowed) {
    console.log(
      JSON.stringify(
        {
          status: "SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED",
          staticPassed: passed,
          live: "NOT_TESTED",
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  // Live RLS prefers Session pooler when integration enabled.
  const snap = api.readStagingEnv(process.env);
  if (!snap.databasePoolerUrlPresent || snap.databaseConnectionMode !== "SESSION_POOLER") {
    console.log(
      JSON.stringify(
        {
          status: "SKIPPED_POOLER_NOT_CONFIGURED",
          staticPassed: passed,
          live: "NOT_TESTED",
          DATABASE_CONNECTION_MODE: snap.databaseConnectionMode,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  const conn = api.resolveStagingPgConnection(process.env);
  console.log(
    JSON.stringify(
      {
        status: "LIVE_RLS_NOT_IMPLEMENTED_IN_DEFAULT_RUNNER",
        staticPassed: passed,
        DATABASE_CONNECTION_MODE: conn.mode,
        host: conn.host,
        note: "Live role matrix reserved; connection resolver prefers pooler",
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
