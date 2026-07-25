import fs from "node:fs";
import path from "node:path";

/**
 * Local Mac mini import workspace paths.
 * Never points at Production databases.
 */
export type ImportWorkspacePaths = {
  root: string;
  documentsImports: string;
  documentsReview: string;
  stagingImport: string;
  stagingQuarantine: string;
  stagingArchive: string;
  logsImport: string;
  mockResults: string;
};

export const DEFAULT_AI_SHARE_CANDIDATES = [
  "/Volumes/AI_SHARE",
  path.join(
    process.env.HOME ?? "",
    "Library/Application Support/AI_SHARE",
  ),
] as const;

export function resolveImportWorkspace(root = process.cwd()): ImportWorkspacePaths {
  return {
    root,
    documentsImports: path.join(root, "documents", "imports"),
    documentsReview: path.join(root, "documents", "review"),
    stagingImport: path.join(root, "staging", "import"),
    stagingQuarantine: path.join(root, "staging", "quarantine"),
    stagingArchive: path.join(root, "staging", "archive"),
    logsImport: path.join(root, "logs", "import"),
    mockResults: path.join(root, "documents", "imports", "mock", "RESULTS"),
  };
}

export function ensureImportWorkspace(paths: ImportWorkspacePaths): void {
  for (const dir of [
    paths.documentsImports,
    paths.documentsReview,
    paths.stagingImport,
    paths.stagingQuarantine,
    paths.stagingArchive,
    paths.logsImport,
    paths.mockResults,
  ]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function resolveAiShareRoot(
  candidates: readonly string[] = DEFAULT_AI_SHARE_CANDIDATES,
): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        const results = path.join(candidate, "RESULTS");
        if (fs.existsSync(results) && fs.statSync(results).isDirectory()) {
          return candidate;
        }
      }
    } catch {
      // ignore inaccessible candidates
    }
  }
  return null;
}

export type DiscoveryBatchPackage = {
  source: "ai_share" | "mock";
  aiShareRoot: string | null;
  batchDir: string;
  manifestPath: string;
  resultsPath: string;
};

/**
 * Locate Discovery Results under AI_SHARE/RESULTS or mock RESULTS.
 * Expected layout:
 *   AI_SHARE/RESULTS/<batchId>/manifest.json
 *   AI_SHARE/RESULTS/<batchId>/results.json
 */
export function discoverBatchPackages(
  workspace: ImportWorkspacePaths,
): DiscoveryBatchPackage[] {
  const aiShare = resolveAiShareRoot();
  if (aiShare) {
    const found = listBatchPackages(path.join(aiShare, "RESULTS"), "ai_share", aiShare);
    if (found.length > 0) return found;
  }
  return listBatchPackages(workspace.mockResults, "mock", null);
}

function listBatchPackages(
  resultsRoot: string,
  source: "ai_share" | "mock",
  aiShareRoot: string | null,
): DiscoveryBatchPackage[] {
  if (!fs.existsSync(resultsRoot)) return [];
  const entries = fs.readdirSync(resultsRoot, { withFileTypes: true });
  const packages: DiscoveryBatchPackage[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const batchDir = path.join(resultsRoot, entry.name);
    const manifestPath = path.join(batchDir, "manifest.json");
    const resultsPath = path.join(batchDir, "results.json");
    if (fs.existsSync(manifestPath) && fs.existsSync(resultsPath)) {
      packages.push({
        source,
        aiShareRoot,
        batchDir,
        manifestPath,
        resultsPath,
      });
    }
  }
  return packages.sort((a, b) => a.batchDir.localeCompare(b.batchDir));
}

export function loadBatchPackage(pkg: DiscoveryBatchPackage): {
  manifest: unknown;
  records: unknown[];
} {
  const manifest = JSON.parse(fs.readFileSync(pkg.manifestPath, "utf8")) as unknown;
  const resultsRaw = JSON.parse(fs.readFileSync(pkg.resultsPath, "utf8")) as unknown;
  const records = Array.isArray(resultsRaw)
    ? resultsRaw
    : isPlainObject(resultsRaw) && Array.isArray(resultsRaw.records)
      ? resultsRaw.records
      : [];
  return { manifest, records };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
