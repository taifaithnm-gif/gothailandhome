#!/usr/bin/env node
/**
 * Goth Batch Import Adapter CLI — dry-run only.
 *
 * npm run staging:goth:import -- \
 *   --zip "..." --sidecar "..." --dry-run
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

if (!process.env.APP_DEPLOY_ENV) {
  process.env.APP_DEPLOY_ENV = "development";
}

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

if (!hasFlag("--dry-run")) {
  console.error("Refusing to run without --dry-run (safety gate).");
  process.exit(2);
}

if (
  process.env.APP_DEPLOY_ENV === "production" ||
  process.env.FORCE_PRODUCTION_IMPORT === "1"
) {
  console.error("Production import blocked.");
  process.exit(2);
}

const zip = argValue("--zip");
const sidecar = argValue("--sidecar");
const batchDir = argValue("--batch-dir");
const output = argValue("--output");
const reviewConsole = argValue("--review-console");

const { runGothImportPipeline } = await import(
  "../src/lib/staging-import/adapters/goth-import-pipeline.ts"
);

const result = runGothImportPipeline({
  repoRoot: root,
  zipPath: zip ? path.resolve(zip) : undefined,
  sidecarPath: sidecar ? path.resolve(sidecar) : undefined,
  batchDir: batchDir
    ? path.resolve(batchDir)
    : path.join(root, ".work/imports/BATCH-GTH-20260724-001/extracted"),
  outputDir: output ? path.resolve(output) : undefined,
  reviewConsoleDir: reviewConsole ? path.resolve(reviewConsole) : undefined,
  autoExtract: true,
  enforceIdentity: true,
});

console.log(
  JSON.stringify(
    {
      MODE: "goth-batch-adapter-v1",
      DRY_RUN: true,
      OK: result.ok,
      BATCH_ID: result.batchId,
      JOB_ID: result.jobId,
      SESSION_ID: result.sessionId,
      COMMIT_BLOCKED: result.commitBlocked,
      COMMIT_ERROR: result.commitErrorCode,
      DATABASE_WRITES: result.databaseWrites,
      STORAGE_UPLOADS: result.storageUploads,
      PRODUCTION_CONNECTION: result.productionConnection,
      APPROVALS: result.approvals,
      PUBLISHED: result.published,
      COUNTS: result.counts,
      ACTION_COUNTS: result.actionCounts,
      UNKNOWN_DEVELOPERS: result.unknownDevelopers,
      LOW_CONFIDENCE_PROVINCES: result.lowConfidenceProvinces,
      PROVINCE_CONFLICTS: result.provinceConflicts,
      PERFORMANCE: result.performance,
      OUTPUT: result.outputDir,
      REVIEW_CONSOLE: result.reviewConsoleDir,
      BLOCKERS: result.blockers,
    },
    null,
    2,
  ),
);

if (!result.ok) process.exitCode = 1;
