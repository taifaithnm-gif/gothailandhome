#!/usr/bin/env node
/**
 * Staging secret rotation gate.
 * Hosted Supabase: DB password + sb_secret_* rotation require Dashboard.
 * After Dashboard actions, use --apply-after-dashboard for hidden local update.
 * Never prints passwords, URIs, or secret keys.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import crypto from "node:crypto";

const root = process.cwd();
const ENV_PATH = path.join(root, ".env.staging.local");
const REPORT = path.join(root, "REPORTS/STAGING_SECRET_ROTATION.md");

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const map = {};
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    map[t.slice(0, eq).trim()] = t.slice(eq + 1);
    if (!(t.slice(0, eq).trim() in process.env)) {
      process.env[t.slice(0, eq).trim()] = t.slice(eq + 1);
    }
  }
  return map;
}

async function loadBoot() {
  return import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/bootstrap.ts")).href}?t=${Date.now()}`
  );
}

function cliCanResetDatabasePassword() {
  // Hosted platform: no supabase CLI subcommand resets project DB password.
  const help = spawnSync("supabase", ["--help"], { encoding: "utf8" });
  const text = `${help.stdout || ""}\n${help.stderr || ""}`;
  return /reset.*password|password.*reset|update-password/i.test(text);
}

function writeManualReport(existing) {
  const ref = existing.STAGING_PROJECT_REF || "<STAGING_PROJECT_REF>";
  const body = `# Staging Secret Rotation

**Status:** MANUAL_ACTION_REQUIRED  
**Project:** gothailandhome-staging  
**Reason:** Hosted Supabase CLI cannot reset database password or create/revoke \`sb_secret_*\` keys.

## Manual Dashboard steps (Mac mini / Chrome)

### A. Database password

1. Open: https://supabase.com/dashboard/project/${ref}/settings/database
2. Project must show name: **gothailandhome-staging** (not gothailandhome-db)
3. Section: **Database password**
4. Action: **Reset database password** (or Generate new password)
5. Copy the new password **only into the Terminal hidden prompt** in the next step — never into Cursor chat

### B. Secret / service role key

1. Open: https://supabase.com/dashboard/project/${ref}/settings/api-keys
2. Tab: **Publishable and secret API keys** (or **API Keys**)
3. Action: **Create new secret key** (name e.g. \`staging-rotated-20260725\`)
4. Copy the new \`sb_secret_…\` value **only into the Terminal hidden prompt**
5. After local verify succeeds: **Delete** the old compromised secret key
6. Do **not** touch Production project keys

### C. Apply on this Mac mini (no .env file editing)

\`\`\`bash
cd /Users/jun/AI-Workspace/Projects/GoThailandHome
npm run staging:secrets:rotate -- --apply-after-dashboard
\`\`\`

You will be prompted twice (hidden input):
1. Enter new Staging database password
2. Enter new Staging secret key (sb_secret_…)

Then the script rebuilds pooler/direct URLs, updates \`.env.staging.local\` atomically (mode 600), and runs env-check / probe / rls-test / schema-verify.

## Gates after apply

- STAGING_COMMIT_ENABLED remains false
- No Batch001 commit in this script
- No Production connection
`;
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, body);
}

async function applyAfterDashboard(boot, existing) {
  const discovered = boot.discoverProjectsViaCli();
  if (!discovered.ok) throw new Error(discovered.error || "CLI_PROJECT_LIST_FAILED");
  const match = boot.findExactStagingProjects(
    discovered.projects,
    existing.STAGING_PROJECT_REF,
  );
  if (match.status !== "PASS" || !match.project) {
    throw new Error(match.reason || "STAGING_PROJECT_MISMATCH");
  }
  if (boot.rejectProductionProject(match.project, existing.SUPABASE_PRODUCTION_PROJECT_REF)) {
    throw new Error("PRODUCTION_PROJECT_REJECTED");
  }

  console.log(
    JSON.stringify({
      PROJECT_FOUND: true,
      PROJECT_NAME: match.project.name,
      PROJECT_REF_MASKED: boot.maskRef(match.project.id),
      REGION: match.project.region,
    }),
  );

  if (!process.stdin.isTTY) {
    throw new Error("PASSWORD_TTY_REQUIRED");
  }

  const password = await boot.readHiddenPassword(
    "Enter NEW Staging database password: ",
  );
  if (!password || password.length < 12) throw new Error("PASSWORD_TOO_WEAK");

  const secretKey = await boot.readHiddenPassword(
    "Enter NEW Staging secret key (sb_secret_…): ",
  );
  if (!secretKey.startsWith("sb_secret_") && !secretKey.startsWith("eyJ")) {
    throw new Error("SECRET_KEY_FORMAT_INVALID");
  }

  // Resolve pooler host from existing allowed host or region candidates
  let poolerHost = (existing.STAGING_ALLOWED_POOLER_HOST || "").trim();
  if (!poolerHost) {
    const candidates = boot.candidateSessionPoolerHosts({
      region: match.project.region,
      apiHostname: null,
    });
    poolerHost = candidates[0];
  }

  const built = boot.buildSessionPoolerUri({
    projectRef: match.project.id,
    hostname: poolerHost,
    password,
  });
  console.log(JSON.stringify(boot.summarizePoolerBuild(built)));

  const directHost =
    (existing.STAGING_ALLOWED_HOST || "").trim() ||
    `db.${match.project.id}.supabase.co`;
  const directUrl = `postgresql://${encodeURIComponent("postgres")}:${encodeURIComponent(password)}@${directHost}:5432/postgres`;

  // Preflight pooler auth
  const pg = (await import("pg")).default;
  const client = new pg.Client({
    host: built.host,
    port: 5432,
    user: built.username,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    await client.connect();
    await client.query("select 1");
    await client.end();
    console.log(JSON.stringify({ POOLER_AUTH_PREFLIGHT: "PASS", host: built.host }));
  } catch (e) {
    try {
      await client.end();
    } catch {
      // ignore
    }
    throw new Error("POOLER_AUTH_PREFLIGHT_FAILED");
  }

  const next = { ...existing };
  next.STAGING_ENVIRONMENT_ID = "gothailandhome-staging";
  next.STAGING_PROJECT_REF = match.project.id;
  next.STAGING_SUPABASE_URL = `https://${match.project.id}.supabase.co`;
  next.STAGING_DATABASE_POOLER_URL = built.uri;
  next.STAGING_ALLOWED_POOLER_HOST = built.host;
  next.STAGING_DATABASE_URL = directUrl;
  next.STAGING_ALLOWED_HOST = directHost;
  next.STAGING_SUPABASE_SERVICE_ROLE_KEY = secretKey;
  next.STAGING_COMMIT_ENABLED = "false";
  next.STAGING_STORAGE_UPLOAD_ENABLED = "false";
  next.STAGING_IMPORT_ENABLED = existing.STAGING_IMPORT_ENABLED || "true";
  next.STAGING_REVIEWER_GATE_ENABLED = "true";
  next.STAGING_STORAGE_BUCKET =
    existing.STAGING_STORAGE_BUCKET || "goth-staging-assets";
  // Preserve anon/publishable if present
  if (existing.STAGING_SUPABASE_ANON_KEY) {
    next.STAGING_SUPABASE_ANON_KEY = existing.STAGING_SUPABASE_ANON_KEY;
  }

  const body = boot.serializeEnvFile(next, boot.BOOTSTRAP_ENV_ORDER);
  const write = boot.atomicWriteEnvFile(ENV_PATH, body);
  console.log(
    JSON.stringify({
      ENV_FILE_ATOMIC_WRITE: "PASS",
      ENV_FILE_PERMISSION: write.mode === "600" ? "PASS" : "FAIL",
      DATABASE_PASSWORD_ROTATED: "YES",
      SERVICE_KEY_ROTATED: "YES",
      STAGING_COMMIT_ENABLED: false,
    }),
  );

  // Clear secrets from memory best-effort
  // (JS strings are immutable; avoid logging)

  const checks = [
    ["staging:db:env-check", ["run", "staging:db:env-check"]],
    ["staging:db:probe", ["run", "staging:db:probe"]],
    ["staging:db:rls-test", ["run", "staging:db:rls-test"]],
    ["staging:db:schema-verify", ["run", "staging:db:schema-verify"]],
  ];
  const results = {};
  for (const [name, args] of checks) {
    const r = spawnSync("npm", args, { cwd: root, encoding: "utf8" });
    results[name] = r.status === 0 ? "PASS" : "FAIL";
    if (r.status !== 0) {
      console.log(r.stdout?.slice(-500) || "");
      console.error(r.stderr?.slice(-500) || "");
    }
  }
  console.log(JSON.stringify({ ROTATION_VERIFIED: results }));
  const ok = Object.values(results).every((v) => v === "PASS");
  fs.writeFileSync(
    REPORT,
    `# Staging Secret Rotation\n\n**Status:** ${ok ? "PASS" : "FAIL"}\n\nDatabase password rotated: YES  \nService key rotated: YES  \nVerified gates: ${JSON.stringify(results)}\n\nSTAGING_COMMIT_ENABLED remains false. Batch001 not executed.\n`,
  );
  process.exit(ok ? 0 : 1);
}

async function secretScan() {
  const patterns = [
    { name: "OLD_SERVICE_KEY_REFERENCE", re: /sb_secret_[A-Za-z0-9_]+/g },
    { name: "JWT_SERVICE_PATTERN", re: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
    { name: "DB_URI_PATTERN", re: /postgresql:\/\/[^:\s]+:[^@\s]+@/g },
  ];
  const roots = ["REPORTS", "docs", "scripts", "src", "database"];
  const hits = {
    OLD_DATABASE_PASSWORD_REFERENCE: "NOT_FOUND",
    OLD_SERVICE_KEY_REFERENCE: "NOT_FOUND",
    GIT_SECRET_SCAN: "PASS",
  };
  // Compare against current env secrets without printing: if tracked file contains current secret → FAIL
  const env = loadEnv();
  const secrets = [
    env.STAGING_SUPABASE_SERVICE_ROLE_KEY,
    env.STAGING_DATABASE_POOLER_URL,
    env.STAGING_DATABASE_URL,
  ].filter(Boolean);

  const tracked = spawnSync(
    "git",
    ["ls-files", "REPORTS", "docs", "scripts", "src", "database", "*.md", "*.mjs", "*.ts"],
    { cwd: root, encoding: "utf8" },
  );
  const files = (tracked.stdout || "").split("\n").filter(Boolean);
  for (const f of files) {
    let text;
    try {
      text = fs.readFileSync(path.join(root, f), "utf8");
    } catch {
      continue;
    }
    for (const s of secrets) {
      if (s && s.length >= 12 && text.includes(s)) {
        hits.GIT_SECRET_SCAN = "FAIL";
      }
    }
    if (/sb_secret_[A-Za-z0-9_]+/.test(text) && !f.includes("example") && !f.includes(".md")) {
      // docs mentioning the format are ok; raw keys in scripts/src are not
      if (f.startsWith("src/") || f.startsWith("scripts/")) {
        // only fail if looks like a real key length
        const m = text.match(/sb_secret_[A-Za-z0-9_]{20,}/);
        if (m) hits.OLD_SERVICE_KEY_REFERENCE = "FOUND";
      }
    }
  }
  // Shell history — best effort, do not print matches
  try {
    const hist = path.join(process.env.HOME || "", ".zsh_history");
    if (fs.existsSync(hist)) {
      const h = fs.readFileSync(hist, "utf8");
      for (const s of secrets) {
        if (s && s.length >= 12 && h.includes(s)) {
          hits.OLD_DATABASE_PASSWORD_REFERENCE = "FOUND";
          hits.GIT_SECRET_SCAN = "FAIL";
        }
      }
    } else {
      hits.OLD_DATABASE_PASSWORD_REFERENCE = "NOT_SCANNABLE";
    }
  } catch {
    hits.OLD_DATABASE_PASSWORD_REFERENCE = "NOT_SCANNABLE";
  }
  console.log(JSON.stringify(hits, null, 2));
  return hits;
}

async function main() {
  const apply = process.argv.includes("--apply-after-dashboard");
  const existing = loadEnv();
  const boot = await loadBoot();

  const canCliPw = cliCanResetDatabasePassword();
  console.log(
    JSON.stringify({
      CLI_DATABASE_PASSWORD_RESET: canCliPw ? "SUPPORTED" : "UNSUPPORTED",
      CLI_SECRET_KEY_CREATE: "UNSUPPORTED_HOSTED_DASHBOARD_REQUIRED",
      PROJECT: "gothailandhome-staging",
      PROJECT_REF_MASKED: boot.maskRef(existing.STAGING_PROJECT_REF || "unknown"),
    }),
  );

  if (!apply) {
    writeManualReport(existing);
    await secretScan();
    console.log(
      JSON.stringify({
        STAGING_SECRET_ROTATION: "MANUAL_ACTION_REQUIRED",
        CONTROLLED_COMMIT: "NOT_EXECUTED",
        REPORT,
      }),
    );
    process.exit(2);
  }

  await applyAfterDashboard(boot, existing);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message.split("\n")[0] : String(e));
  process.exit(1);
});
