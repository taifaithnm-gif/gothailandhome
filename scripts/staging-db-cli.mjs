#!/usr/bin/env node
/**
 * Staging DB Design CLI — simulation only.
 * Commands: plan | simulate | rollback-plan | validate | commit(blocked)
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const DEFAULT_BATCH = "BATCH-GTH-20260724-001";

async function loadApi() {
  const url = pathToFileURL(path.join(root, "src/lib/staging-db/index.ts")).href;
  return import(`${url}?t=${Date.now()}`);
}

function usage() {
  console.log(`Usage:
  npm run staging:db:plan [-- --batch <id>]
  npm run staging:db:simulate [-- --batch <id>]
  npm run staging:db:rollback-plan [-- --batch <id>]
  npm run staging:db:validate [-- --batch <id>]
  npm run staging:db:commit   # ALWAYS fails with STAGING_COMMIT_DISABLED

All commands are simulation-only. DATABASE_WRITES=0 STORAGE_UPLOADS=0.
`);
}

function resolveDirs(batchId) {
  return {
    reviewConsole: path.join(root, ".work/review-console", batchId),
    outDir: path.join(root, ".work/staging-db", batchId),
  };
}

async function runSimulate(batchId, writeOutputs) {
  const api = await loadApi();
  const { reviewConsole, outDir } = resolveDirs(batchId);
  if (!fs.existsSync(reviewConsole)) {
    throw new Error(`Review console data not found: ${reviewConsole}`);
  }
  const input = api.loadBatchCommitInputFromReviewConsole(reviewConsole, {
    batchId,
    sourceFileName: `${batchId}.zip`,
  });
  const bundle = await api.simulateCommit(input);
  if (writeOutputs) {
    api.writeSimulationOutputs(outDir, bundle);
  }
  return { bundle, outDir };
}

function parseArgs(argv) {
  const args = { command: argv[2] || "help", batch: DEFAULT_BATCH };
  for (let i = 3; i < argv.length; i += 1) {
    if (argv[i] === "--batch" && argv[i + 1]) {
      args.batch = argv[++i];
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.command || args.command === "help" || args.command === "--help") {
    usage();
    process.exit(0);
  }

  if (args.command === "commit") {
    console.error("STAGING_COMMIT_DISABLED");
    console.error(
      "Real staging DB commit is blocked in Design V1. Use simulate instead.",
    );
    process.exit(2);
  }

  if (args.command === "validate") {
    const { bundle, outDir } = await runSimulate(args.batch, true);
    const ok =
      bundle.database_writes === 0 &&
      bundle.storage_uploads === 0 &&
      bundle.status === "SIMULATED_ONLY" &&
      bundle.simulationResult.simulated_transaction_status === "SIMULATED_OK";
    console.log(
      JSON.stringify(
        {
          ok,
          status: bundle.status,
          batchId: args.batch,
          entityCounts: bundle.commitPlan.entityCounts,
          blockers: bundle.commitPlan.blockers.length,
          warnings: bundle.commitPlan.warnings.length,
          database_writes: 0,
          storage_uploads: 0,
          outDir,
        },
        null,
        2,
      ),
    );
    process.exit(ok ? 0 : 1);
  }

  if (
    args.command === "plan" ||
    args.command === "simulate" ||
    args.command === "rollback-plan"
  ) {
    const { bundle, outDir } = await runSimulate(args.batch, true);
    if (args.command === "plan") {
      console.log(
        JSON.stringify(
          {
            status: "SIMULATED_ONLY",
            outDir,
            commitPlan: path.join(outDir, "plan/commit-plan.json"),
            wouldInsert: bundle.commitPlan.wouldInsert,
            wouldReview: bundle.commitPlan.wouldReview,
            blockers: bundle.commitPlan.blockers,
            productionSafe: bundle.commitPlan.productionSafe,
            database_writes: 0,
            storage_uploads: 0,
          },
          null,
          2,
        ),
      );
    } else if (args.command === "rollback-plan") {
      console.log(
        JSON.stringify(
          {
            status: "SIMULATED_ONLY",
            outDir,
            rollbackPlan: path.join(outDir, "rollback/rollback-plan.json"),
            executed: false,
            database_writes: 0,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(
        JSON.stringify(
          {
            status: "SIMULATED_ONLY",
            outDir,
            simulation: bundle.simulationResult,
            database_writes: 0,
            storage_uploads: 0,
          },
          null,
          2,
        ),
      );
    }
    process.exit(0);
  }

  usage();
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
