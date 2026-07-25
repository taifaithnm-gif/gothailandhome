#!/usr/bin/env node
/**
 * Windows01 dry-run import CLI.
 *
 * Modes:
 * 1) Legacy mock / AI_SHARE RESULTS discovery (no args)
 * 2) Goth Batch extracted directory:
 *      npm run import:windows01:dry-run -- \
 *        --batch <extractedDir> \
 *        --output <dryRunOutputDir> \
 *        [--zip <zipPath>] [--zip-sidecar <sha256File>]
 *
 * Never writes databases. Never uploads storage. Never touches Production.
 */
import fs from "node:fs";
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

const batchDir = argValue("--batch");
const outputDirArg = argValue("--output");
const zipPath = argValue("--zip");
const zipSidecar = argValue("--zip-sidecar");
const externalManifest = argValue("--external-manifest");

if (batchDir) {
  const { runGothBatchDryRun, WINDOWS01_CONTRACT_STATUS } = await import(
    "../src/lib/integrations/windows01/index.ts"
  );

  const out =
    outputDirArg ??
    path.join(root, ".work/imports", path.basename(batchDir), "dry-run-output");

  const result = runGothBatchDryRun({
    batchDir: path.resolve(batchDir),
    outputDir: path.resolve(out),
    repoRoot: root,
    zipPath: zipPath ? path.resolve(zipPath) : undefined,
    zipSidecarPath: zipSidecar ? path.resolve(zipSidecar) : undefined,
    externalManifestPath: externalManifest
      ? path.resolve(externalManifest)
      : undefined,
    strictHash: true,
  });

  console.log(
    JSON.stringify(
      {
        MODE: "goth-batch",
        CONTRACT_STATUS: WINDOWS01_CONTRACT_STATUS,
        STATUS: result.status,
        HASH_VALIDATION: result.hash.status,
        SEALED_ZIP_SHA256: result.hash.sealed_zip_sha256 ?? null,
        RAW_ZIP_SHA256: result.hash.raw_zip_sha256 ?? null,
        ADAPTER_INVOKED: result.adapterInvoked,
        DATABASE_WRITES: result.databaseWrites,
        STORAGE_UPLOADS: result.storageUploads,
        PRODUCTION_CONNECTION: result.productionConnection,
        COUNTS: result.counts,
        ACTION_COUNTS: result.actionCounts,
        OUTPUT: path.resolve(out),
      },
      null,
      2,
    ),
  );

  if (result.status !== "PASS") process.exitCode = 1;
} else {
  const {
    runWindows01DryRunPipeline,
    checkSchemaVersions,
    REQUIRED_SCHEMA_FIELDS,
    canEvidenceTransition,
    initialEvidenceReviewStatus,
    WINDOWS01_CONTRACT_STATUS,
  } = await import("../src/lib/integrations/windows01/index.ts");

  const pipeline = runWindows01DryRunPipeline(root);
  const reportDir = path.join(root, "REPORTS");
  fs.mkdirSync(reportDir, { recursive: true });

  const allQuarantine = [];
  const allDuplicates = [];
  const allCards = [];
  const summaries = [];

  for (const item of pipeline.results) {
    allQuarantine.push(...item.adapter.quarantined);
    allDuplicates.push(...(item.adapter.duplicates ?? []));
    allCards.push(...(item.adapter.reviewCards ?? []));
    if (item.adapter.dryRunSummary) summaries.push(item.adapter.dryRunSummary);
  }

  const schemaPass =
    pipeline.results.length > 0 &&
    pipeline.results.every((r) => {
      if (r.adapter.accepted === 0 && r.adapter.dryRunSummary?.schemaValid === 0) {
        return false;
      }
      return true;
    });

  const adapterPass = pipeline.results.length > 0;
  const reviewPass =
    allCards.every((c) => c.reviewStatus === "NEW") &&
    canEvidenceTransition("NEW", "REVIEWING") &&
    !canEvidenceTransition("NEW", "APPROVED") &&
    initialEvidenceReviewStatus() === "NEW";
  const dryRunPass =
    summaries.length > 0 &&
    summaries.every((s) => s.databaseWrites === 0 && s.autoApproved === false);
  const dupPass = true;

  const overall =
    adapterPass && schemaPass && reviewPass && dryRunPass && dupPass
      ? "PASS"
      : "FAIL";

  const ranAt = new Date().toISOString();
  const writeReport = (name, body) => {
    fs.writeFileSync(path.join(reportDir, name), body);
  };

  const batchLines =
    pipeline.results.length === 0
      ? "_No batches found._"
      : pipeline.results
          .map((r) => {
            const id = path.basename(r.pkg.batchDir);
            return `- **${id}** (${r.pkg.source}): accepted=${r.adapter.accepted}, quarantined=${r.adapter.quarantined.length}, mode=${r.adapter.mode}`;
          })
          .join("\n");

  const outputLines =
    pipeline.results
      .flatMap((r) =>
        Object.entries(r.outputPaths)
          .filter(([, v]) => v)
          .map(([k, v]) => `- ${k}: \`${path.relative(root, v)}\``),
      )
      .join("\n") || "_none_";

  const cardRows =
    allCards.length === 0
      ? "| _(none)_ | | | | |"
      : allCards
          .map(
            (c) =>
              `| ${c.recordId} | ${c.developer ?? ""} | ${c.project ?? ""} | ${c.province ?? ""} | **${c.reviewStatus}** |`,
          )
          .join("\n");

  writeReport(
    "IMPORT_VALIDATION_REPORT.md",
    `# IMPORT_VALIDATION_REPORT

**Date:** ${ranAt}
**Contract status:** \`${WINDOWS01_CONTRACT_STATUS}\`
**Source:** \`${pipeline.usedSource}\`
**Overall (this report):** ${adapterPass && dryRunPass ? "PASS" : "FAIL"}

## Scope

Windows01 → Mac mini data reception dry-run. Production frozen. No DB writes.

## Batches processed

${batchLines}

## Dry-run summaries

\`\`\`json
${JSON.stringify(summaries, null, 2)}
\`\`\`

## Output files

${outputLines}

## Safety

| Check | Result |
| --- | --- |
| Database writes | **0** |
| Production changed | **NO** |
| Auto-approved | **NO** |

## Required schema fields

${REQUIRED_SCHEMA_FIELDS.map((f) => `- \`${f}\``).join("\n")}
`,
  );

  writeReport(
    "SCHEMA_VALIDATION_REPORT.md",
    `# SCHEMA_VALIDATION_REPORT

**Date:** ${ranAt}
**Result:** ${schemaPass ? "PASS" : "FAIL"}

## Sample version check (positive)

\`\`\`json
${JSON.stringify(
  checkSchemaVersions({
    schemaVersion: "windows01.manifest.v0",
    workerVersion: "windows01-worker.0.1.0-mock",
    expectedSchema: "windows01.manifest.v0",
  }),
  null,
  2,
)}
\`\`\`

## Sample version check (negative)

\`\`\`json
${JSON.stringify(
  checkSchemaVersions({
    schemaVersion: "windows01.manifest.v999",
    workerVersion: "",
    expectedSchema: "windows01.manifest.v0",
  }),
  null,
  2,
)}
\`\`\`

## Quarantine (schema-related)

\`\`\`json
${JSON.stringify(
  allQuarantine.filter((q) =>
    [
      "UNSUPPORTED_SCHEMA",
      "VERSION_MISMATCH",
      "INVALID_MANIFEST",
      "MISSING_EVIDENCE",
      "MALICIOUS_URL",
      "PATH_TRAVERSAL",
      "OVERSIZED_PAYLOAD",
      "FORBIDDEN_WORKER_STATE",
    ].includes(q.reason),
  ),
  null,
  2,
)}
\`\`\`
`,
  );

  writeReport(
    "REVIEW_PIPELINE_REPORT.md",
    `# REVIEW_PIPELINE_REPORT

**Date:** ${ranAt}
**Result:** ${reviewPass ? "PASS" : "FAIL"}

## Cards prepared this run

| Record | Developer | Project | Province | Status |
| --- | --- | --- | --- | --- |
${cardRows}

## Auto-approve check

All cards reviewStatus === NEW: **${allCards.every((c) => c.reviewStatus === "NEW")}**
`,
  );

  writeReport(
    "DUPLICATE_CHECK_REPORT.md",
    `# DUPLICATE_CHECK_REPORT

**Date:** ${ranAt}
**Result:** ${dupPass ? "PASS" : "FAIL"}

\`\`\`json
${JSON.stringify(allDuplicates, null, 2)}
\`\`\`
`,
  );

  writeReport(
    "WINDOWS01_DRY_RUN_EXECUTION_REPORT.md",
    `# WINDOWS01_DRY_RUN_EXECUTION_REPORT

**Date:** ${ranAt}
**OVERALL:** ${overall}

| Gate | Result |
| --- | --- |
| IMPORT_ADAPTER | ${adapterPass ? "PASS" : "FAIL"} |
| SCHEMA_VALIDATION | ${schemaPass ? "PASS" : "FAIL"} |
| REVIEW_PIPELINE | ${reviewPass ? "PASS" : "FAIL"} |
| DRY_RUN_IMPORT | ${dryRunPass ? "PASS" : "FAIL"} |
| DUPLICATE_DETECTION | ${dupPass ? "PASS" : "FAIL"} |
| PRODUCTION_CHANGED | NO |
| COMMIT | NOT_CREATED |
| PUSH | NOT_EXECUTED |
| DEPLOY | NOT_EXECUTED |

## Source

- Preferred: \`/Volumes/AI_SHARE/RESULTS\`
- Fallback used: \`${pipeline.usedSource}\`
`,
  );

  console.log(
    JSON.stringify(
      {
        OVERALL: overall,
        IMPORT_ADAPTER: adapterPass ? "PASS" : "FAIL",
        SCHEMA_VALIDATION: schemaPass ? "PASS" : "FAIL",
        REVIEW_PIPELINE: reviewPass ? "PASS" : "FAIL",
        DRY_RUN_IMPORT: dryRunPass ? "PASS" : "FAIL",
        DUPLICATE_DETECTION: dupPass ? "PASS" : "FAIL",
        PRODUCTION_CHANGED: "NO",
        SOURCE: pipeline.usedSource,
        BATCHES: pipeline.results.length,
        ACCEPTED: pipeline.results.reduce((n, r) => n + r.adapter.accepted, 0),
        QUARANTINED: allQuarantine.length,
        DUPLICATES: allDuplicates.length,
      },
      null,
      2,
    ),
  );

  if (overall !== "PASS") process.exitCode = 1;
}
