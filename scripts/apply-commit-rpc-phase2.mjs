#!/usr/bin/env node
/**
 * Apply CONTROLLED_COMMIT_RPC_PHASE2 (commit_staging_import_v1 entity persist).
 * Does not touch frozen migrations 001–009.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const OUT_DIR = path.join(
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

function parseArgs(argv) {
  const out = { confirmStaging: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--confirm-staging") out.confirmStaging = true;
  }
  return out;
}

async function main() {
  loadDotEnvStagingLocal();
  const args = parseArgs(process.argv);
  const mod = await import(
    `${pathToFileURL(path.join(root, "src/lib/staging-db/supabase/commit-rpc-phase2.ts")).href}?t=${Date.now()}`
  );
  const result = await mod.applyCommitRpcPhase2({
    repoRoot: root,
    confirmStaging: args.confirmStaging,
  });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "commit-rpc-phase2-apply.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "PASS" ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
