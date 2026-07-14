#!/usr/bin/env node
/**
 * Property Factory V2 CLI
 * Commands: validate | dry-run | apply | resume | rollback | generate
 *
 * Usage:
 *   node pipelines/factory/cli.mjs validate <path>
 *   node pipelines/factory/cli.mjs dry-run <path|--wave bangkok-w1>
 *   node pipelines/factory/cli.mjs apply <path|--wave bangkok-w1>
 *   node pipelines/factory/cli.mjs resume <batch_id>
 *   node pipelines/factory/cli.mjs rollback <batch_id>
 *   node pipelines/factory/cli.mjs generate
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { validatePath, ROOT } from "./lib/validate.mjs";
import {
  planPath,
  applyPath,
  resumeBatch,
  rollbackBatch,
  planWave,
  applyWave,
} from "./lib/import-engine.mjs";

const [cmd, ...rest] = process.argv.slice(2);

function printHelp() {
  console.log(`Property Factory V2

Commands:
  validate <path>              Validate package against DATA_STANDARD
  dry-run <path|--wave NAME>   Plan inserts/updates without writing
  apply <path|--wave NAME>     Apply upserts to Supabase
  resume <batch_id>            Resume a failed batch
  rollback <batch_id>          Soft-rollback batch (unpublish / deactivate where safe)
  generate                     Regenerate districts/developers/projects packages
`);
}

async function main() {
  if (!cmd || cmd === "help" || cmd === "--help") {
    printHelp();
    process.exit(0);
  }

  if (cmd === "generate") {
    const r = spawnSync(
      process.execPath,
      [resolve(ROOT, "pipelines/factory/generate-packages.mjs")],
      { stdio: "inherit" },
    );
    process.exit(r.status ?? 1);
  }

  if (cmd === "validate") {
    const target = rest[0];
    if (!target) {
      console.error("validate requires a path");
      process.exit(1);
    }
    if (target === "--wave" || rest.includes("--all-districts")) {
      const { readdirSync } = await import("node:fs");
      const { join } = await import("node:path");
      const dir = join(ROOT, "content/areas/bangkok/districts");
      let failed = 0;
      let warnings = 0;
      for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
        const r = validatePath(join(dir, f));
        if (!r.ok) {
          failed++;
          console.error(`FAIL ${f}`, r.errors.slice(0, 5));
        }
        warnings += r.warnings.length;
      }
      console.log(
        JSON.stringify({ ok: failed === 0, failed, warnings }, null, 2),
      );
      process.exit(failed === 0 ? 0 : 1);
    }
    const r = validatePath(target);
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  }

  if (cmd === "dry-run") {
    if (rest[0] === "--wave") {
      const plan = await planWave(rest[1] || "bangkok-w1");
      console.log(JSON.stringify(plan, null, 2));
      process.exit(plan.ok ? 0 : 1);
    }
    const plan = await planPath(rest[0]);
    console.log(JSON.stringify(plan, null, 2));
    process.exit(plan.ok ? 0 : 1);
  }

  if (cmd === "apply") {
    if (rest[0] === "--wave") {
      const result = await applyWave(rest[1] || "bangkok-w1");
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.ok ? 0 : 1);
    }
    const result = await applyPath(rest[0]);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  if (cmd === "resume") {
    const result = await resumeBatch(rest[0]);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  if (cmd === "rollback") {
    const result = await rollbackBatch(rest[0]);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  printHelp();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
