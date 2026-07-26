#!/usr/bin/env node
/**
 * staging:env:verify — safe verification of Staging env bootstrap state.
 * Never prints secrets or full URIs.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const ENV_PATH = path.join(root, ".env.staging.local");

async function main() {
  const api = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/bootstrap.ts")).href}?t=${Date.now()}`
  );
  const envApi = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/index.ts")).href}?t=${Date.now()}`
  );

  if (!fs.existsSync(ENV_PATH)) {
    console.log(JSON.stringify({ status: "FAIL", reason: "ENV_MISSING" }));
    process.exit(1);
  }
  const mode = (fs.statSync(ENV_PATH).mode & 0o777).toString(8);
  const ignored = api.isPathGitIgnored(root, ".env.staging.local");
  const text = fs.readFileSync(ENV_PATH, "utf8");
  const map = api.parseEnvFile(text);
  // Load into process for env-check
  for (const [k, v] of Object.entries(map)) {
    if (!(k in process.env)) process.env[k] = v;
  }
  const report = envApi.envCheckReport(process.env);
  console.log(
    JSON.stringify(
      {
        ENV_FILE_PERMISSION: mode === "600" ? "PASS" : "FAIL",
        mode,
        ENV_FILE_GIT_IGNORED: ignored ? "PASS" : "FAIL",
        DATABASE_CONNECTION_MODE: report.DATABASE_CONNECTION_MODE,
        POOLER_HOST_CHECK: report.POOLER_HOST_CHECK,
        POOLER_USERNAME_CHECK: report.POOLER_USERNAME_CHECK,
        commit_enabled: report.commit_enabled,
        pooler_url_present: report.pooler_url_present,
        anon: api.assertApiKeyShape(map.STAGING_SUPABASE_ANON_KEY, "anon"),
        service: api.assertApiKeyShape(
          map.STAGING_SUPABASE_SERVICE_ROLE_KEY,
          "service",
        ),
      },
      null,
      2,
    ),
  );
  const envCheck = spawnSync("npm", ["run", "staging:db:env-check"], {
    cwd: root,
    encoding: "utf8",
  });
  process.exit(envCheck.status === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
