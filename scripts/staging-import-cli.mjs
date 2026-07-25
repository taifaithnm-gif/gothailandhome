#!/usr/bin/env node
/**
 * Staging Import Framework V1 CLI — dry-run only.
 * Commands via npm:
 *   staging:import | staging:preview | staging:validate | staging:report
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const modUrl = pathToFileURL(
  path.join(root, "src/lib/staging-import/index.ts"),
).href;

async function load() {
  return import(`${modUrl}?t=${Date.now()}`);
}

function parseArgs(argv) {
  const args = {
    command: "import",
    batch: null,
    out: path.join(root, "staging", "import"),
    perf: false,
    projects: 1000,
    images: 5000,
    pdfs: 1000,
  };
  const rest = argv.slice(2);
  if (rest[0] && !rest[0].startsWith("-")) {
    args.command = rest.shift();
  }
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i];
    if (a === "--batch" && rest[i + 1]) args.batch = rest[++i];
    else if (a === "--out" && rest[i + 1]) args.out = rest[++i];
    else if (a === "--perf") args.perf = true;
    else if (a === "--projects" && rest[i + 1])
      args.projects = Number(rest[++i]);
    else if (a === "--images" && rest[i + 1]) args.images = Number(rest[++i]);
    else if (a === "--pdfs" && rest[i + 1]) args.pdfs = Number(rest[++i]);
  }
  return args;
}

function defaultMockBatch(api) {
  return api.createBatchFromParts(
    {
      batchId: "CLI-MOCK-BATCH",
      schemaVersion: "staging_import_batch.v1",
      status: "MOCK",
      source: "mock",
    },
    {
      developers: [
        {
          id: "dev-1",
          name: "Sansiri",
          aliases: ["แสนสิริ"],
          officialWebsite: "https://www.sansiri.com",
          confidence: "HIGH",
          evidence: [{ kind: "other", path: "evidence/dev1.txt" }],
        },
        {
          id: "dev-unknown",
          name: "UNKNOWN",
          unknown: true,
          confidence: "UNKNOWN",
        },
      ],
      projects: [
        {
          id: "proj-1",
          name: "The Base Height Phuket",
          developerId: "dev-1",
          province: "Phuket",
          slug: "the-base-height-phuket",
          evidence: [{ kind: "image", hash: "a".repeat(64) }],
        },
        {
          id: "proj-2",
          name: "Mystery Condo",
          developerId: "dev-unknown",
          province: "Pattaya",
          evidence: [],
        },
      ],
      images: [
        {
          id: "img-1",
          hash: "a".repeat(64),
          projectId: "proj-1",
          mime: "image/jpeg",
          width: 1200,
          height: 800,
        },
        {
          id: "img-2",
          hash: "a".repeat(64),
          projectId: "proj-1",
          mime: "image/jpeg",
        },
      ],
      pdfs: [
        {
          id: "pdf-1",
          hash: "b".repeat(64),
          mime: "application/pdf",
          pages: 12,
          category: "brochure",
          projectId: "proj-1",
        },
      ],
      news: [
        {
          id: "news-1",
          sourceUrl: "https://example.com/news/1",
          developerId: "dev-1",
          projectId: "proj-1",
          freshnessDays: 10,
          evidence: [{ kind: "news", url: "https://example.com/news/1" }],
        },
      ],
    },
  );
}

function loadBatch(api, args) {
  if (args.perf) {
    return api.buildPerformanceMockBatch({
      projects: args.projects,
      images: args.images,
      pdfs: args.pdfs,
    });
  }
  if (args.batch) {
    return api.loadBatchFromJsonFile(path.resolve(args.batch));
  }
  return defaultMockBatch(api);
}

function writeOutput(outDir, name, data) {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  return file;
}

async function main() {
  const args = parseArgs(process.argv);
  const api = await load();
  const batch = loadBatch(api, args);
  const started = Date.now();

  if (args.command === "validate") {
    const result = api.runValidationEngine(batch);
    const contract = api.validateImportBatch(batch);
    const payload = {
      mode: "dry-run",
      batchId: batch.manifest.batchId,
      contract,
      validation: {
        ok: result.ok,
        counts: result.counts,
        issueCount: result.issues.length,
        issues: result.issues.slice(0, 200),
      },
      databaseWrites: 0,
      productionChanged: false,
    };
    const file = writeOutput(
      args.out,
      `${batch.manifest.batchId}.validate.json`,
      payload,
    );
    console.log(
      JSON.stringify(
        {
          command: "validate",
          ok: result.ok && contract.ok,
          batchId: batch.manifest.batchId,
          errors: result.counts.errors,
          output: file,
        },
        null,
        2,
      ),
    );
    process.exit(result.ok && contract.ok ? 0 : 2);
  }

  const sessionResult = api.runImportSession(batch, { actor: "cli" });
  const elapsedMs = Date.now() - started;

  if (args.command === "preview") {
    const text = api.formatPreviewDashboardText(sessionResult.preview);
    const jsonFile = writeOutput(
      args.out,
      `${sessionResult.batchId}.preview.json`,
      sessionResult.preview,
    );
    const txtFile = path.join(args.out, `${sessionResult.batchId}.preview.txt`);
    fs.writeFileSync(txtFile, text + "\n");
    console.log(text);
    console.log(
      JSON.stringify(
        {
          command: "preview",
          outputJson: jsonFile,
          outputTxt: txtFile,
          elapsedMs,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (args.command === "report") {
    const report = {
      framework: api.STAGING_IMPORT_FRAMEWORK_VERSION,
      flags: sessionResult.flags,
      batchId: sessionResult.batchId,
      sessionId: sessionResult.sessionId,
      phase: sessionResult.phase,
      validationOk: sessionResult.validationOk,
      reviewSummary: sessionResult.reviewSummary,
      approvalSummary: sessionResult.approvalSummary,
      previewTotals: sessionResult.preview.totals,
      previewByEntity: sessionResult.preview.byEntity,
      duplicateHits: sessionResult.duplicates.length,
      auditCount: sessionResult.auditCount,
      databaseWrites: 0,
      storageUploads: 0,
      productionChanged: false,
      committed: false,
      elapsedMs,
    };
    const file = writeOutput(
      args.out,
      `${sessionResult.batchId}.report.json`,
      report,
    );
    console.log(JSON.stringify({ command: "report", output: file, ...report }, null, 2));
    return;
  }

  // default: import (dry-run session)
  const file = writeOutput(
    args.out,
    `${sessionResult.batchId}.import-session.json`,
    {
      ...sessionResult,
      rows: sessionResult.rows,
      elapsedMs,
      note: "DRY RUN — commit not implemented",
    },
  );
  console.log(
    JSON.stringify(
      {
        command: "import",
        batchId: sessionResult.batchId,
        sessionId: sessionResult.sessionId,
        phase: sessionResult.phase,
        validationOk: sessionResult.validationOk,
        previewTotals: sessionResult.preview.totals,
        reviewSummary: sessionResult.reviewSummary,
        databaseWrites: 0,
        storageUploads: 0,
        productionChanged: false,
        committed: false,
        output: file,
        elapsedMs,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
