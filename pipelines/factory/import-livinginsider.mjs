#!/usr/bin/env node
/**
 * Import validated LivingInsider packages only (never PropertyHub rows).
 */
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const r = spawnSync(
  process.execPath,
  [join(ROOT, "pipelines/factory/livinginsider/import-li-only.mjs"), ...args],
  { cwd: ROOT, encoding: "utf8", stdio: "inherit" },
);
process.exit(r.status ?? 1);
