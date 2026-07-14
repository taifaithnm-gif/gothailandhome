#!/usr/bin/env node
/**
 * Import all project packages that have listings.json into Supabase (v1 importer).
 * Usage: node pipelines/factory/import-all-listings.mjs [--dry-run] [--limit=N]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dryRun = process.argv.includes("--dry-run");
const limit = Number(
  (process.argv.find((a) => a.startsWith("--limit=")) || "--limit=999").split(
    "=",
  )[1],
);

const projects = readdirSync(join(ROOT, "content/projects"))
  .filter((d) =>
    existsSync(join(ROOT, "content/projects", d, "listings.json")),
  )
  .filter((d) => {
    const L = JSON.parse(
      readFileSync(join(ROOT, "content/projects", d, "listings.json"), "utf8"),
    );
    return (L.listings || []).length > 0;
  })
  .slice(0, limit);

const results = [];
for (const slug of projects) {
  const args = [
    join(ROOT, "pipelines/condo-import/import.mjs"),
    join("content/projects", slug),
  ];
  if (dryRun) args.push("--dry-run");
  process.stderr.write(`Import ${slug}...\n`);
  const r = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
  });
  const ok = r.status === 0;
  results.push({
    slug,
    ok,
    status: r.status,
    stdout: (r.stdout || "").trim().slice(-500),
    stderr: (r.stderr || "").trim().slice(-300),
  });
  process.stderr.write(`  → ${ok ? "ok" : "FAIL"}\n`);
}

console.log(
  JSON.stringify(
    {
      dry_run: dryRun,
      attempted: results.length,
      ok: results.filter((x) => x.ok).length,
      failed: results.filter((x) => !x.ok).map((x) => x.slug),
      results,
    },
    null,
    2,
  ),
);
process.exit(results.every((x) => x.ok) ? 0 : 1);
