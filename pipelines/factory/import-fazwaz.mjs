#!/usr/bin/env node
/** Wrapper: FazWaz-only import (never prior sources). */
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const r = spawnSync(
  process.execPath,
  [
    join(ROOT, "pipelines/factory/fazwaz/import-fz-only.mjs"),
    ...process.argv.slice(2),
  ],
  { cwd: ROOT, encoding: "utf8", stdio: "inherit" },
);
process.exit(r.status ?? 1);
