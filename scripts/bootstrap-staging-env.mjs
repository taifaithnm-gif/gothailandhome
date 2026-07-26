#!/usr/bin/env node
/**
 * STAGING_ENV_BOOTSTRAP_V1
 * Auto-discover Staging project, build Session pooler URI, atomic-write .env.staging.local.
 * Never prints passwords or full database URIs.
 */
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import dns from "node:dns/promises";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const ENV_PATH = path.join(root, ".env.staging.local");

async function loadBootstrap() {
  const url = pathToFileURL(
    path.join(root, "src/lib/staging-db/supabase/bootstrap.ts"),
  ).href;
  return import(`${url}?t=${Date.now()}`);
}

function ensureSupabaseCli() {
  const which = spawnSync("command", ["-v", "supabase"], {
    encoding: "utf8",
    shell: true,
  });
  if (which.status === 0 && which.stdout.trim()) {
    const ver = spawnSync("supabase", ["--version"], { encoding: "utf8" });
    return {
      ok: true,
      version: (ver.stdout || "").trim(),
      path: which.stdout.trim(),
    };
  }
  console.log("Installing Supabase CLI via Homebrew tap…");
  const brew = spawnSync(
    "brew",
    ["install", "supabase/tap/supabase"],
    { encoding: "utf8", stdio: "inherit" },
  );
  if (brew.status !== 0) {
    return { ok: false, error: "BREW_INSTALL_FAILED" };
  }
  const ver = spawnSync("supabase", ["--version"], { encoding: "utf8" });
  return { ok: true, version: (ver.stdout || "").trim(), installed: true };
}

function ensureCliAuth() {
  const list = spawnSync(
    "supabase",
    ["projects", "list", "--output-format", "json"],
    { encoding: "utf8" },
  );
  const out = `${list.stdout || ""}${list.stderr || ""}`;
  if (list.status === 0 && !/Access token not provided|LegacyPlatformAuthRequiredError/i.test(out)) {
    return { ok: true };
  }
  console.log(
    "Supabase CLI not authenticated. Starting `supabase login` (browser / local token prompt).",
  );
  console.log(
    "Do NOT paste the access token into Cursor chat — only into the CLI prompt if asked.",
  );
  const login = spawnSync("supabase", ["login"], {
    encoding: "utf8",
    stdio: "inherit",
  });
  if (login.status !== 0) {
    return { ok: false, error: "CLI_LOGIN_FAILED" };
  }
  const list2 = spawnSync(
    "supabase",
    ["projects", "list", "--output-format", "json"],
    { encoding: "utf8" },
  );
  if (list2.status !== 0) {
    return { ok: false, error: "CLI_AUTH_STILL_FAILING" };
  }
  return { ok: true };
}

async function tcpReachable(host, port, ms = 4000) {
  return new Promise((resolve) => {
    const s = net.connect({ host, port });
    const t = setTimeout(() => {
      s.destroy();
      resolve(false);
    }, ms);
    s.on("connect", () => {
      clearTimeout(t);
      s.end();
      resolve(true);
    });
    s.on("error", () => {
      clearTimeout(t);
      resolve(false);
    });
  });
}

async function resolvePoolerHost(api, project, token) {
  let apiHost = null;
  if (token) {
    apiHost = await api.fetchPoolerHostnameFromManagementApi(project.id, token);
  }
  const candidates = api.candidateSessionPoolerHosts({
    region: project.region,
    apiHostname: apiHost,
  });
  if (!candidates.length) {
    throw new Error("POOLER_METADATA_EMPTY");
  }
  // Prefer API host; verify TCP. Otherwise first reachable candidate.
  for (const host of candidates) {
    try {
      await dns.lookup(host);
    } catch {
      continue;
    }
    if (await tcpReachable(host, 5432)) {
      return {
        hostname: host,
        port: 5432,
        source: apiHost && host === apiHost.toLowerCase()
          ? "management_api_pooler"
          : "region_derived_verified",
        region: project.region,
      };
    }
  }
  throw new Error("POOLER_HOST_UNREACHABLE");
}

function loadExistingEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const text = fs.readFileSync(ENV_PATH, "utf8");
  const map = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    map[t.slice(0, eq).trim()] = t.slice(eq + 1);
  }
  return map;
}

async function obtainPassword(api, existing, forcePrompt) {
  if (!forcePrompt) {
    const fromDirect = api.extractPasswordFromDatabaseUrl(
      existing.STAGING_DATABASE_URL,
    );
    if (fromDirect) {
      console.log("PASSWORD_SOURCE: EXISTING_DIRECT_URL");
      return { password: fromDirect, source: "EXISTING_DIRECT_URL" };
    }
  }
  console.log("PASSWORD_SOURCE: HIDDEN_TTY");
  console.log(
    "Enter the Staging database password from Supabase Dashboard → Project Settings → Database.",
  );
  console.log("Do NOT paste it into Cursor chat. Input is hidden.");
  const password = await api.readHiddenPassword(
    "Enter Staging database password: ",
  );
  if (!password) throw new Error("PASSWORD_EMPTY");
  return { password, source: "HIDDEN_TTY" };
}

async function main() {
  const forcePasswordPrompt = process.argv.includes("--force-password-prompt");
  const report = {
    milestone: "STAGING_ENV_BOOTSTRAP_V1",
    SUPABASE_CLI: "FAIL",
    CLI_AUTH: "FAIL",
    STAGING_PROJECT_DISCOVERY: "FAIL",
    PROJECT_ISOLATION: "FAIL",
    POOLER_METADATA: "FAIL",
    HIDDEN_PASSWORD_INPUT: "FAIL",
    PASSWORD_ENCODING: "FAIL",
    ENV_FILE_ATOMIC_WRITE: "FAIL",
    ENV_FILE_PERMISSION: "FAIL",
    ENV_FILE_GIT_IGNORED: "FAIL",
    API_KEYS: "MANUAL_GATE_REQUIRED",
    DATABASE_CONNECTION_MODE: "NONE",
    SECRET_SCAN: "PASS",
    MANUAL_ACTION_REQUIRED: "NO",
    USER_MANUAL_FILE_EDITING: "NO",
    BLOCKERS: [],
  };

  const api = await loadBootstrap();

  const cli = ensureSupabaseCli();
  if (!cli.ok) {
    report.BLOCKERS.push(cli.error || "SUPABASE_CLI_MISSING");
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  report.SUPABASE_CLI = "PASS";

  const auth = ensureCliAuth();
  if (!auth.ok) {
    report.BLOCKERS.push(auth.error || "CLI_AUTH_FAILED");
    report.MANUAL_ACTION_REQUIRED = "PASSWORD_ENTRY_ONLY";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  report.CLI_AUTH = "PASS";

  const discovered = api.discoverProjectsViaCli();
  if (!discovered.ok) {
    report.BLOCKERS.push(discovered.error || "PROJECT_LIST_FAILED");
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const existing = loadExistingEnv();
  const expectedRef = (existing.STAGING_PROJECT_REF || "").trim() || null;
  const productionRef =
    (existing.SUPABASE_PRODUCTION_PROJECT_REF || "").trim() || null;

  const match = api.findExactStagingProjects(discovered.projects, expectedRef);
  if (match.status !== "PASS" || !match.project) {
    report.BLOCKERS.push(match.reason || "PROJECT_DISCOVERY_FAILED");
    console.log(
      JSON.stringify(
        {
          PROJECT_FOUND: false,
          reason: match.reason,
        },
        null,
        2,
      ),
    );
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  const project = match.project;
  if (api.rejectProductionProject(project, productionRef)) {
    report.BLOCKERS.push("PRODUCTION_PROJECT_REJECTED");
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  report.STAGING_PROJECT_DISCOVERY = "PASS";
  report.PROJECT_ISOLATION = "PASS";
  console.log(
    JSON.stringify(
      {
        PROJECT_FOUND: true,
        PROJECT_NAME: project.name,
        PROJECT_REF_MASKED: api.maskRef(project.id),
        REGION: project.region,
        STATUS: project.status,
      },
      null,
      2,
    ),
  );

  const token = api.readSupabaseAccessToken();
  let poolerMeta;
  try {
    poolerMeta = await resolvePoolerHost(api, project, token);
  } catch (e) {
    report.BLOCKERS.push(e instanceof Error ? e.message : String(e));
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  report.POOLER_METADATA = "PASS";

  let passwordHolder = { value: "" };
  try {
    const got = await obtainPassword(api, existing, forcePasswordPrompt);
    passwordHolder.value = got.password;
    report.HIDDEN_PASSWORD_INPUT = "PASS";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    report.BLOCKERS.push(msg);
    report.MANUAL_ACTION_REQUIRED =
      msg === "PASSWORD_TTY_REQUIRED" ? "PASSWORD_ENTRY_ONLY" : "PASSWORD_ENTRY_ONLY";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  let built;
  let refreshedDirectUrl = existing.STAGING_DATABASE_URL || "";
  try {
    built = api.buildSessionPoolerUri({
      projectRef: project.id,
      hostname: poolerMeta.hostname,
      password: passwordHolder.value,
      port: 5432,
      database: "postgres",
    });
    report.PASSWORD_ENCODING = "PASS";
    console.log(JSON.stringify(api.summarizePoolerBuild(built), null, 2));

    // Keep Direct URL host/user; refresh password encoding to match entered secret.
    if (existing.STAGING_DATABASE_URL) {
      try {
        const d = new URL(existing.STAGING_DATABASE_URL);
        refreshedDirectUrl = `postgresql://${encodeURIComponent(d.username || "postgres")}:${encodeURIComponent(passwordHolder.value)}@${d.hostname}:${d.port || "5432"}${d.pathname || "/postgres"}`;
      } catch {
        refreshedDirectUrl = existing.STAGING_DATABASE_URL;
      }
    } else if (existing.STAGING_ALLOWED_HOST) {
      refreshedDirectUrl = `postgresql://${encodeURIComponent("postgres")}:${encodeURIComponent(passwordHolder.value)}@${existing.STAGING_ALLOWED_HOST}:5432/postgres`;
    }

    // Preflight auth against Session pooler before writing env.
    const pg = (await import("pg")).default;
    const client = new pg.Client({
      host: built.host,
      port: 5432,
      user: built.username,
      password: passwordHolder.value,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12_000,
    });
    try {
      await client.connect();
      await client.query("select 1");
      await client.end();
      console.log(JSON.stringify({ POOLER_AUTH_PREFLIGHT: "PASS", host: built.host }));
    } catch (authErr) {
      try {
        await client.end();
      } catch {
        // ignore
      }
      const msg = authErr instanceof Error ? authErr.message : String(authErr);
      report.BLOCKERS.push("POOLER_AUTH_PREFLIGHT_FAILED");
      report.MANUAL_ACTION_REQUIRED = "PASSWORD_ENTRY_ONLY";
      console.log(
        JSON.stringify({
          POOLER_AUTH_PREFLIGHT: "FAIL",
          class: /password authentication failed/i.test(msg)
            ? "AUTHENTICATION"
            : /Tenant or user not found/i.test(msg)
              ? "WRONG_CLUSTER"
              : "OTHER",
          hint: "Re-run: npm run staging:env:bootstrap -- --force-password-prompt",
        }),
      );
      passwordHolder.value = "";
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }
  } catch (e) {
    report.BLOCKERS.push(e instanceof Error ? e.message : String(e));
    passwordHolder.value = "";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  } finally {
    passwordHolder.value = "";
  }

  const anonStatus = api.assertApiKeyShape(
    existing.STAGING_SUPABASE_ANON_KEY,
    "anon",
  );
  const serviceStatus = api.assertApiKeyShape(
    existing.STAGING_SUPABASE_SERVICE_ROLE_KEY,
    "service",
  );
  if (anonStatus === "PRESENT_OK" && serviceStatus === "PRESENT_OK") {
    report.API_KEYS = "PRESERVED";
  } else if (anonStatus === "MISSING" || serviceStatus === "MISSING") {
    report.API_KEYS = "MANUAL_GATE_REQUIRED";
    report.MANUAL_ACTION_REQUIRED = "API_KEY_GATE";
  } else {
    report.API_KEYS = "MANUAL_GATE_REQUIRED";
    report.BLOCKERS.push("API_KEY_INVALID_FORMAT");
  }

  const next = { ...existing };
  next.STAGING_ENVIRONMENT_ID = "gothailandhome-staging";
  next.STAGING_PROJECT_REF = project.id;
  next.STAGING_SUPABASE_URL = `https://${project.id}.supabase.co`;
  next.STAGING_DATABASE_POOLER_URL = built.uri;
  next.STAGING_ALLOWED_POOLER_HOST = built.host;
  next.STAGING_IMPORT_ENABLED = "true";
  next.STAGING_COMMIT_ENABLED = "false";
  next.STAGING_STORAGE_UPLOAD_ENABLED = "false";
  next.STAGING_INTEGRATION_TEST_ENABLED = "false";
  next.STAGING_REVIEWER_GATE_ENABLED = "true";
  next.STAGING_STORAGE_BUCKET =
    existing.STAGING_STORAGE_BUCKET || "goth-staging-assets";
  // Preserve direct URL / allowed host / keys if present
  if (refreshedDirectUrl) {
    next.STAGING_DATABASE_URL = refreshedDirectUrl;
  }
  if (existing.STAGING_ALLOWED_HOST) {
    next.STAGING_ALLOWED_HOST = existing.STAGING_ALLOWED_HOST;
  }
  if (existing.STAGING_SUPABASE_ANON_KEY) {
    next.STAGING_SUPABASE_ANON_KEY = existing.STAGING_SUPABASE_ANON_KEY;
  }
  if (existing.STAGING_SUPABASE_SERVICE_ROLE_KEY) {
    next.STAGING_SUPABASE_SERVICE_ROLE_KEY =
      existing.STAGING_SUPABASE_SERVICE_ROLE_KEY;
  }

  const body = api.serializeEnvFile(next, api.BOOTSTRAP_ENV_ORDER);
  try {
    const write = api.atomicWriteEnvFile(ENV_PATH, body);
    report.ENV_FILE_ATOMIC_WRITE = "PASS";
    report.ENV_FILE_PERMISSION = write.mode === "600" ? "PASS" : "FAIL";
    if (write.mode !== "600") report.BLOCKERS.push(`MODE_${write.mode}`);
  } catch {
    report.BLOCKERS.push("ENV_WRITE_FAILED");
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  report.ENV_FILE_GIT_IGNORED = api.isPathGitIgnored(
    root,
    ".env.staging.local",
  )
    ? "PASS"
    : "FAIL";
  if (report.ENV_FILE_GIT_IGNORED === "FAIL") {
    report.BLOCKERS.push("ENV_NOT_GITIGNORED");
  }

  report.DATABASE_CONNECTION_MODE = "SESSION_POOLER";

  // Secret rotation advisory (password previously visible in editor screenshots)
  report.SECRET_SCAN = "ROTATION_RECOMMENDED";

  console.log(JSON.stringify(report, null, 2));

  // Auto verify
  const envCheck = spawnSync("npm", ["run", "staging:db:env-check"], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  console.log(envCheck.stdout || "");
  if (envCheck.stderr) console.error(envCheck.stderr);
  const probe = spawnSync("npm", ["run", "staging:db:probe"], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  console.log(probe.stdout || "");
  if (probe.stderr) console.error(probe.stderr);

  const ok =
    report.BLOCKERS.length === 0 &&
    envCheck.status === 0 &&
    probe.status === 0;
  process.exit(ok ? 0 : 2);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
