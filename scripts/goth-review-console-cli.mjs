#!/usr/bin/env node
/**
 * Ensure Review Console JSON exists for a batch (dry-run / local only).
 *
 * npm run staging:goth:review-console -- --batch BATCH-GTH-20260724-001
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

const batch = argValue("--batch");
if (!batch || !/^BATCH-GTH-[A-Z0-9-]+$/.test(batch)) {
  console.error("Usage: --batch BATCH-GTH-...");
  process.exit(2);
}

const consoleDir = path.join(root, ".work/review-console", batch);
const summaryPath = path.join(consoleDir, "summary.json");

if (!fs.existsSync(summaryPath)) {
  console.error(
    `Review console data missing at ${consoleDir}. Run staging:goth:import first.`,
  );
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
console.log(
  JSON.stringify(
    {
      MODE: "goth-review-console",
      BATCH_ID: batch,
      DIR: consoleDir,
      PRODUCTION_SAFE: summary.productionSafe === true,
      DATABASE_WRITES: summary.databaseWrites,
      STORAGE_UPLOADS: summary.storageUploads,
      TOTAL_ENTITIES: summary.totalEntities,
      TOTAL_REVIEW_ITEMS: summary.totalReviewItems,
      ROUTE: `/internal/review/windows01/batches/${batch}`,
      NOTE: "Local read-only. Enable FEATURE_GOTH_REVIEW_CONSOLE=true and npm run dev.",
    },
    null,
    2,
  ),
);
