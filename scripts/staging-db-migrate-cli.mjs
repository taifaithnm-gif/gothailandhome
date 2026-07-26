#!/usr/bin/env node
/**
 * Controlled Staging migration / schema-verify / rls-test CLI.
 * Uses SESSION_POOLER only. Keeps STAGING_COMMIT_ENABLED=false.
 * Never prints secrets or full URIs.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const BATCH_DIR = path.join(
  root,
  ".work/staging-db/BATCH-GTH-20260724-001/implementation",
);

function loadDotEnvStagingLocal() {
  const p = path.join(root, ".env.staging.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

async function loadMigrate() {
  return import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/migrate.ts")).href}?t=${Date.now()}`
  );
}

function parseArgs(argv) {
  const out = {
    command: argv[2] || "help",
    confirmStaging: false,
    expectedProjectRef: "",
    connectionMode: "",
  };
  for (let i = 3; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--confirm-staging") out.confirmStaging = true;
    else if (a === "--expected-project-ref") out.expectedProjectRef = argv[++i] || "";
    else if (a === "--connection-mode") out.connectionMode = argv[++i] || "";
  }
  return out;
}

async function cmdMigrate(args) {
  loadDotEnvStagingLocal();
  const migrate = await loadMigrate();
  const result = await migrate.applyStagingMigrations({
    migrationsDir: path.join(root, "database/staging-migrations"),
    gate: {
      confirmStaging: args.confirmStaging,
      expectedProjectRef: args.expectedProjectRef,
      connectionMode: args.connectionMode,
    },
  });
  fs.mkdirSync(BATCH_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(BATCH_DIR, "migration-apply.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "PASS" ? 0 : 1);
}

async function cmdSchemaVerify() {
  loadDotEnvStagingLocal();
  const verify = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/schema-verify.ts")).href}?t=${Date.now()}`
  );
  const result = await verify.verifyStagingSchema(process.env);
  fs.mkdirSync(BATCH_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(BATCH_DIR, "schema-verify.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "PASS" ? 0 : 1);
}

async function cmdRlsTest() {
  loadDotEnvStagingLocal();
  // Static first
  const rlsSql = fs.readFileSync(
    path.join(root, "database/staging-migrations/20260725_006_staging_rls.sql"),
    "utf8",
  );
  const staticChecks = [
    { name: "static_enable_rls", ok: /ENABLE ROW LEVEL SECURITY/i.test(rlsSql) },
    { name: "static_revoke_public", ok: /REVOKE ALL ON TABLE/i.test(rlsSql) },
    { name: "static_header", ok: rlsSql.includes("STAGING ONLY") },
  ];
  const liveMod = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/rls-live.ts")).href}?t=${Date.now()}`
  );
  const live = await liveMod.runStagingRlsLive(process.env);
  const result = {
    status:
      staticChecks.every((c) => c.ok) && live.status === "PASS"
        ? "PASS"
        : "FAIL",
    staticChecks,
    live,
  };
  fs.mkdirSync(BATCH_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(BATCH_DIR, "rls-live.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "PASS" ? 0 : 1);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.command === "migrate") return cmdMigrate(args);
  if (args.command === "schema-verify") return cmdSchemaVerify();
  if (args.command === "rls-test") return cmdRlsTest();
  console.log(`Usage:
  staging:db:migrate -- --confirm-staging --expected-project-ref <ref> --connection-mode session-pooler
  staging:db:schema-verify
  staging:db:rls-test
`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message.split("\n")[0] : String(e));
  process.exit(1);
});
