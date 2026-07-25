import fs from "node:fs";
import path from "node:path";

import { createWindows01ImportAdapter } from "./adapter.ts";
import {
  discoverBatchPackages,
  ensureImportWorkspace,
  loadBatchPackage,
  resolveImportWorkspace,
  type DiscoveryBatchPackage,
  type ImportWorkspacePaths,
} from "./pipeline.ts";
import { buildPreviewReviewPackage } from "./preview.ts";
import type {
  ImportAdapterResult,
  Windows01BatchV0,
  Windows01ManifestV0,
  Windows01RecordV0,
} from "./types.ts";

export type DryRunPipelineResult = {
  workspace: ImportWorkspacePaths;
  packages: DiscoveryBatchPackage[];
  usedSource: "ai_share" | "mock" | "none";
  results: Array<{
    pkg: DiscoveryBatchPackage;
    adapter: ImportAdapterResult;
    outputPaths: {
      reviewJson: string;
      previewJson: string;
      stagingSummaryJson: string;
      quarantineJson: string | null;
      logFile: string;
    };
  }>;
};

/**
 * Full dry-run pipeline:
 * AI_SHARE/RESULTS (or mock) → Manifest → Schema → Review cards → Staging workspace
 * Never writes to any database.
 */
export function runWindows01DryRunPipeline(
  root = process.cwd(),
): DryRunPipelineResult {
  const workspace = resolveImportWorkspace(root);
  ensureImportWorkspace(workspace);

  const packages = discoverBatchPackages(workspace);
  const adapter = createWindows01ImportAdapter();
  const results: DryRunPipelineResult["results"] = [];

  for (const pkg of packages) {
    const loaded = loadBatchPackage(pkg);
    const batch: Windows01BatchV0 = {
      manifest: loaded.manifest as Windows01ManifestV0,
      records: loaded.records as Windows01RecordV0[],
    };

    // Force non-production for local dry-run safety.
    const prevDeploy = process.env.APP_DEPLOY_ENV;
    if (!prevDeploy) process.env.APP_DEPLOY_ENV = "development";

    const adapterResult = adapter.runImport(batch, "dry-run");

    if (prevDeploy === undefined) delete process.env.APP_DEPLOY_ENV;
    else process.env.APP_DEPLOY_ENV = prevDeploy;

    const batchId =
      typeof (loaded.manifest as { batchId?: string })?.batchId === "string"
        ? (loaded.manifest as { batchId: string }).batchId
        : path.basename(pkg.batchDir);

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reviewJson = path.join(
      workspace.documentsReview,
      `${batchId}.review.json`,
    );
    const previewJson = path.join(
      workspace.documentsReview,
      `${batchId}.preview.json`,
    );
    const stagingSummaryJson = path.join(
      workspace.stagingImport,
      `${batchId}.dry-run-summary.json`,
    );
    const logFile = path.join(
      workspace.logsImport,
      `${stamp}-${batchId}.log.json`,
    );

    let quarantineJson: string | null = null;
    if (adapterResult.quarantined.length > 0) {
      quarantineJson = path.join(
        workspace.stagingQuarantine,
        `${batchId}.quarantine.json`,
      );
      fs.writeFileSync(
        quarantineJson,
        JSON.stringify(
          {
            batchId,
            at: new Date().toISOString(),
            items: adapterResult.quarantined,
            duplicates: adapterResult.duplicates ?? [],
          },
          null,
          2,
        ),
      );
    }

    fs.writeFileSync(
      reviewJson,
      JSON.stringify(
        {
          batchId,
          autoApproved: false,
          cards: adapterResult.reviewCards ?? [],
        },
        null,
        2,
      ),
    );

    const preview = buildPreviewReviewPackage(batchId, adapterResult);
    fs.writeFileSync(previewJson, JSON.stringify(preview, null, 2));

    fs.writeFileSync(
      stagingSummaryJson,
      JSON.stringify(
        {
          note: "DRY RUN ONLY — no database writes",
          databaseWrites: 0,
          productionChanged: false,
          summary: adapterResult.dryRunSummary,
          accepted: adapterResult.accepted,
          mode: adapterResult.mode,
        },
        null,
        2,
      ),
    );

    fs.writeFileSync(
      logFile,
      JSON.stringify(
        {
          source: pkg.source,
          batchDir: pkg.batchDir,
          adapterResult: {
            mode: adapterResult.mode,
            accepted: adapterResult.accepted,
            quarantined: adapterResult.quarantined,
            duplicates: adapterResult.duplicates,
            dryRunSummary: adapterResult.dryRunSummary,
            audit: adapterResult.audit,
          },
        },
        null,
        2,
      ),
    );

    results.push({
      pkg,
      adapter: adapterResult,
      outputPaths: {
        reviewJson,
        previewJson,
        stagingSummaryJson,
        quarantineJson,
        logFile,
      },
    });
  }

  return {
    workspace,
    packages,
    usedSource: packages[0]?.source ?? "none",
    results,
  };
}
