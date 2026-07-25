/**
 * Goth Batch → ImportSession dry-run pipeline + Review Console data writer.
 * Never commits. Never writes DB/Storage. Never approves/publishes.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { CommitNotImplementedError } from "../errors.ts";
import { ImportSession } from "../staging-session.ts";
import type { PreviewAction } from "../types.ts";
import {
  adaptGothBatchFromDir,
  type GothBatchAdapterOptions,
  type GothPerformanceMetrics,
  type GothPreviewActionRow,
  type GothReviewCandidate,
} from "./index.ts";
import { assertNoAbsolutePathLeak } from "./goth-helpers.ts";

export type GothImportPipelineOptions = GothBatchAdapterOptions & {
  repoRoot: string;
  outputDir?: string;
  reviewConsoleDir?: string;
  extractDir?: string;
  /** If zip provided and extractDir missing contents, extract first. */
  autoExtract?: boolean;
};

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const body = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, body);
}

function appendJsonl(filePath: string, events: Record<string, unknown>[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    events.map((e) => JSON.stringify(e)).join("\n") + (events.length ? "\n" : ""),
  );
}

function memMb(): number {
  return Math.round(process.memoryUsage().heapUsed / (1024 * 1024));
}

function ensureExtracted(options: GothImportPipelineOptions): {
  batchDir: string;
  extractionMs: number;
} {
  const t0 = Date.now();
  if (options.batchDir && fs.existsSync(path.join(options.batchDir, "manifests/batch_manifest.json"))) {
    return { batchDir: path.resolve(options.batchDir), extractionMs: 0 };
  }
  if (!options.zipPath) {
    throw new Error("Either batchDir (extracted) or zipPath is required");
  }
  const extractDir =
    options.extractDir ??
    path.join(
      options.repoRoot,
      ".work/imports",
      path.basename(options.zipPath, ".zip"),
      "extracted",
    );
  fs.mkdirSync(extractDir, { recursive: true });
  if (!fs.existsSync(path.join(extractDir, "manifests/batch_manifest.json"))) {
    execFileSync("unzip", ["-qo", options.zipPath, "-d", extractDir], {
      stdio: "pipe",
    });
  }
  return { batchDir: extractDir, extractionMs: Date.now() - t0 };
}

function toPreviewActionRows(
  sessionRows: Array<{
    entityType: string;
    entityId: string;
    action: PreviewAction;
    reasons: string[];
  }>,
  sourceRecordIds: Map<string, string>,
): GothPreviewActionRow[] {
  return sessionRows.map((row) => ({
    action: row.action,
    entityType: row.entityType as GothPreviewActionRow["entityType"],
    entityId: row.entityId,
    reason: row.reasons.join(",") || row.action,
    confidence: "UNKNOWN",
    evidence: [],
    blocking: ["WOULD_REJECT", "WOULD_QUARANTINE", "WOULD_REVIEW"].includes(
      row.action,
    ),
    sourceRecordId:
      sourceRecordIds.get(`${row.entityType}:${row.entityId}`) ?? row.entityId,
  }));
}

function countActions(
  rows: GothPreviewActionRow[],
): Record<PreviewAction, number> {
  const out: Record<PreviewAction, number> = {
    WOULD_CREATE: 0,
    WOULD_UPDATE: 0,
    WOULD_REVIEW: 0,
    WOULD_REJECT: 0,
    WOULD_DUPLICATE: 0,
    WOULD_QUARANTINE: 0,
    WOULD_SKIP_DUPLICATE: 0,
  };
  for (const row of rows) out[row.action] += 1;
  return out;
}

export type GothImportPipelineResult = {
  ok: boolean;
  batchId: string;
  jobId: string;
  sessionId: string | null;
  commitBlocked: true;
  commitErrorCode: "COMMIT_NOT_IMPLEMENTED" | null;
  databaseWrites: 0;
  storageUploads: 0;
  productionConnection: "NO";
  approvals: 0;
  published: 0;
  productionSafe: true;
  counts: {
    developers: number;
    projects: number;
    images: number;
    pdfs: number;
    news: number;
    sourceReviewItems: number;
    generatedReviewCandidates: number;
    duplicateCandidates: number;
    conflictCandidates: number;
    readyForApproval: number;
  };
  actionCounts: Record<PreviewAction, number>;
  unknownDevelopers: number;
  lowConfidenceProvinces: number;
  provinceConflicts: number;
  performance: GothPerformanceMetrics;
  outputDir: string;
  reviewConsoleDir: string;
  blockers: string[];
};

export function runGothImportPipeline(
  options: GothImportPipelineOptions,
): GothImportPipelineResult {
  const totalStart = Date.now();
  let peak = memMb();
  const bump = () => {
    peak = Math.max(peak, memMb());
  };

  const tExtract = Date.now();
  const { batchDir, extractionMs } = ensureExtracted(options);
  bump();

  const adapterOptions: GothBatchAdapterOptions = {
    ...options,
    batchDir,
  };

  const tAdapter = Date.now();
  // Sealed ZIP + hash verify happen inside adaptGothBatchFromDir when zip/sidecar set.
  const adapted = adaptGothBatchFromDir(adapterOptions);
  const adapterMs = Date.now() - tAdapter;
  const zipVerifyMs = adapterMs; // sealed+hash gate is the dominant adapter prelude
  void tExtract;
  bump();

  const batchId = adapted.context.batchId;
  const jobId = adapted.context.jobId;
  const outputDir =
    options.outputDir ??
    path.join(options.repoRoot, ".work/imports", batchId, "adapter-output");
  const reviewConsoleDir =
    options.reviewConsoleDir ??
    path.join(options.repoRoot, ".work/review-console", batchId);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(reviewConsoleDir, { recursive: true });

  const audit: Record<string, unknown>[] = [
    {
      at: new Date().toISOString(),
      event: "pipeline_start",
      batchId,
      jobId,
      dryRun: true,
      databaseWrites: 0,
      storageUploads: 0,
    },
  ];

  if (!adapted.ok) {
    writeJson(path.join(outputDir, "import-batch.json"), adapted.importBatch);
    writeJson(path.join(outputDir, "import-session.json"), {
      ok: false,
      blockers: adapted.blockers,
      phase: "blocked_before_session",
    });
    appendJsonl(path.join(outputDir, "adapter-audit-log.jsonl"), [
      ...audit,
      {
        at: new Date().toISOString(),
        event: "adapter_blocked",
        blockers: adapted.blockers,
      },
    ]);
    writeJson(path.join(outputDir, "performance.json"), {
      zipVerifyMs,
      extractionMs,
      adapterMs,
      validationMs: 0,
      duplicateMs: 0,
      previewMs: 0,
      totalMs: Date.now() - totalStart,
      peakMemoryMbEstimate: peak,
    });
    return {
      ok: false,
      batchId,
      jobId,
      sessionId: null,
      commitBlocked: true,
      commitErrorCode: null,
      databaseWrites: 0,
      storageUploads: 0,
      productionConnection: "NO",
      approvals: 0,
      published: 0,
      productionSafe: true,
      counts: {
        developers: 0,
        projects: 0,
        images: 0,
        pdfs: 0,
        news: 0,
        sourceReviewItems: 0,
        generatedReviewCandidates: 0,
        duplicateCandidates: 0,
        conflictCandidates: 0,
        readyForApproval: 0,
      },
      actionCounts: countActions([]),
      unknownDevelopers: 0,
      lowConfidenceProvinces: 0,
      provinceConflicts: 0,
      performance: {
        zipVerifyMs,
        extractionMs,
        adapterMs,
        validationMs: 0,
        duplicateMs: 0,
        previewMs: 0,
        totalMs: Date.now() - totalStart,
        peakMemoryMbEstimate: peak,
      },
      outputDir,
      reviewConsoleDir,
      blockers: adapted.blockers,
    };
  }

  const tValidate = Date.now();
  const session = new ImportSession();
  session.loadBatch(adapted.importBatch);
  const sessionResult = session.run({ actor: "cli" });
  const validationMs = Date.now() - tValidate;
  bump();

  const tDup = Date.now();
  const duplicates = sessionResult.duplicates;
  const duplicateMs = Date.now() - tDup;

  const tPreview = Date.now();
  const sourceRecordIds = new Map<string, string>();
  for (const d of adapted.developers) {
    sourceRecordIds.set(`developer:${d.id}`, d.provenance.sourceRecordId);
  }
  for (const p of adapted.projects) {
    sourceRecordIds.set(`project:${p.id}`, p.provenance.sourceRecordId);
  }
  for (const i of adapted.images) {
    sourceRecordIds.set(`image:${i.id}`, i.provenance.sourceRecordId);
  }
  for (const p of adapted.pdfs) {
    sourceRecordIds.set(`pdf:${p.id}`, p.provenance.sourceRecordId);
  }
  for (const n of adapted.news) {
    sourceRecordIds.set(`news:${n.id}`, n.provenance.sourceRecordId);
  }

  const previewActions = toPreviewActionRows(
    sessionResult.rows,
    sourceRecordIds,
  );
  // Forbidden real actions must not appear
  for (const row of previewActions) {
    if (
      ["CREATE", "UPDATE", "APPROVE", "PUBLISH", "INSERT", "UPSERT", "DELETE"].includes(
        row.action,
      )
    ) {
      throw new Error(`FORBIDDEN_PREVIEW_ACTION: ${row.action}`);
    }
  }

  let commitErrorCode: "COMMIT_NOT_IMPLEMENTED" | null = null;
  try {
    session.commit();
  } catch (err) {
    if (err instanceof CommitNotImplementedError) {
      commitErrorCode = "COMMIT_NOT_IMPLEMENTED";
    } else {
      throw err;
    }
  }
  const previewMs = Date.now() - tPreview;
  bump();

  const reviewCandidates = adapted.reviewCandidates;
  const duplicateCandidates = reviewCandidates.filter(
    (c) => c.reviewState === "DUPLICATE",
  );
  const conflictCandidates = [
    ...reviewCandidates.filter((c) => c.reviewState === "CONFLICT"),
    ...adapted.projects
      .filter((p) => p.provinceConflict)
      .map(
        (p): GothReviewCandidate => ({
          candidateId: `conflict-province-${p.id}`,
          entityType: "project",
          entityId: p.id,
          sourceReason: "PROVINCE_NAME_CONFLICT",
          mappedReason: "CONFLICT",
          severity: "high",
          evidence: p.evidence,
          suggestedAction: "RESOLVE_CONFLICT",
          blocking: true,
          reviewerNotes: "",
          createdAt: adapted.context.generatedAt,
          reviewState: "CONFLICT",
          approved: false,
          published: false,
        }),
      ),
  ];
  // de-dupe conflicts by entityId
  const conflictDedup = new Map<string, GothReviewCandidate>();
  for (const c of conflictCandidates) {
    conflictDedup.set(`${c.entityType}:${c.entityId}`, c);
  }
  const conflicts = [...conflictDedup.values()];

  const readyForApproval = [
    ...adapted.developers.filter((d) => d.reviewState === "READY_FOR_APPROVAL"),
    ...adapted.projects.filter((p) => p.reviewState === "READY_FOR_APPROVAL"),
    ...adapted.images.filter((i) => i.decision === "ACCEPT_CANDIDATE"),
    ...adapted.pdfs.filter((p) => p.decision === "ACCEPT_CANDIDATE"),
    ...adapted.news.filter((n) => n.reviewState === "READY_FOR_APPROVAL"),
  ];

  const rejected = reviewCandidates.filter((c) => c.reviewState === "REJECTED");
  const quarantined = reviewCandidates.filter(
    (c) => c.reviewState === "QUARANTINED",
  );

  const actionCounts = countActions(previewActions);
  const unknownDevelopers = adapted.developers.filter(
    (d) => d.identityStatus === "UNKNOWN",
  ).length;
  const lowConfidenceProvinces = adapted.projects.filter(
    (p) => p.provinceConfidence === "LOW",
  ).length;
  const provinceConflicts = adapted.projects.filter(
    (p) => p.provinceConflict,
  ).length;

  const performance: GothPerformanceMetrics = {
    zipVerifyMs,
    extractionMs,
    adapterMs,
    validationMs,
    duplicateMs,
    previewMs,
    totalMs: Date.now() - totalStart,
    peakMemoryMbEstimate: peak,
  };

  // --- adapter-output ---
  writeJson(path.join(outputDir, "import-batch.json"), adapted.importBatch);
  writeJson(path.join(outputDir, "import-session.json"), {
    sessionId: sessionResult.sessionId,
    batchId: sessionResult.batchId,
    phase: sessionResult.phase,
    flags: sessionResult.flags,
    validationOk: sessionResult.validationOk,
    validationIssues: sessionResult.validationIssues,
    auditCount: sessionResult.auditCount,
    databaseWrites: 0,
    storageUploads: 0,
    productionChanged: false,
    committed: false,
    commitErrorCode,
    previewTotals: sessionResult.preview.totals,
  });
  writeJson(path.join(outputDir, "normalized-entities.json"), {
    developers: adapted.developers,
    projects: adapted.projects,
    images: adapted.images,
    pdfs: adapted.pdfs,
    news: adapted.news,
  });
  writeJson(path.join(outputDir, "preview-actions.json"), previewActions);
  writeJson(path.join(outputDir, "review-candidates.json"), reviewCandidates);
  writeJson(path.join(outputDir, "duplicate-candidates.json"), [
    ...duplicates,
    ...duplicateCandidates,
  ]);
  writeJson(path.join(outputDir, "conflict-candidates.json"), conflicts);
  writeJson(path.join(outputDir, "ready-for-approval.json"), readyForApproval);
  writeJson(path.join(outputDir, "unsupported-fields.json"), {
    rows: adapted.unsupportedFields,
    note: "Unsupported / unknown Goth fields preserved in rawPayload",
  });
  writeJson(path.join(outputDir, "performance.json"), performance);
  appendJsonl(path.join(outputDir, "adapter-audit-log.jsonl"), [
    ...audit,
    {
      at: new Date().toISOString(),
      event: "session_complete",
      sessionId: sessionResult.sessionId,
      phase: sessionResult.phase,
      commitErrorCode,
    },
    ...session.audit.list().map((e) => ({
      at: e.at,
      event: e.action,
      detail: e.detail,
    })),
  ]);

  // --- review console data ---
  const sourceReviewItems = reviewCandidates.filter(
    (c) => c.entityType === "review_item",
  );
  const byEntityType: Record<string, number> = {
    developer: adapted.developers.length,
    project: adapted.projects.length,
    image: adapted.images.length,
    pdf: adapted.pdfs.length,
    news: adapted.news.length,
    review_item: sourceReviewItems.length,
  };
  const byReviewState: Record<string, number> = {};
  for (const c of reviewCandidates) {
    byReviewState[c.reviewState] = (byReviewState[c.reviewState] ?? 0) + 1;
  }
  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0 };
  for (const c of reviewCandidates) bySeverity[c.severity] += 1;

  const summary = {
    batchId,
    jobId,
    generatedAt: adapted.context.generatedAt,
    totalEntities:
      adapted.developers.length +
      adapted.projects.length +
      adapted.images.length +
      adapted.pdfs.length +
      adapted.news.length,
    totalReviewItems: sourceReviewItems.length,
    byEntityType,
    byReviewState,
    bySeverity,
    byAction: actionCounts,
    blockers: [],
    productionSafe: true as const,
    databaseWrites: 0 as const,
    storageUploads: 0 as const,
    approvals: 0,
    published: 0,
    performance,
  };

  // Strip absolute paths from console payloads
  const scrub = <T,>(value: T): T => {
    const text = JSON.stringify(value);
    const cleaned = text
      .replaceAll(batchDir, ".")
      .replaceAll(options.repoRoot, ".")
      .replace(/\/Users\/[^"]+/g, "[redacted]")
      .replace(/\/Volumes\/[^"]+/g, "[redacted]");
    return JSON.parse(cleaned) as T;
  };

  const consoleDevelopers = scrub(adapted.developers);
  const consoleProjects = scrub(adapted.projects);
  const consoleImages = scrub(
    adapted.images.map((img) => ({
      ...img,
      // relative only — no absolute paths, no remote image URLs for rendering
      remoteUrlBlocked: true,
      previewKind: img.relativePreviewPath ? "local-relative" : "placeholder",
    })),
  );
  const consolePdfs = scrub(adapted.pdfs);
  const consoleNews = scrub(adapted.news);
  const consoleReview = scrub(reviewCandidates);
  const consoleDupes = scrub([...duplicates, ...duplicateCandidates]);
  const consoleConflicts = scrub(conflicts);
  const consoleReady = scrub(readyForApproval);
  const consoleRejected = scrub(rejected);
  const consoleQuarantined = scrub(quarantined);

  assertNoAbsolutePathLeak(summary);
  assertNoAbsolutePathLeak(consoleDevelopers);
  assertNoAbsolutePathLeak(consoleProjects);
  assertNoAbsolutePathLeak(consoleImages);

  writeJson(path.join(reviewConsoleDir, "summary.json"), summary);
  writeJson(path.join(reviewConsoleDir, "developers.json"), consoleDevelopers);
  writeJson(path.join(reviewConsoleDir, "projects.json"), consoleProjects);
  writeJson(path.join(reviewConsoleDir, "images.json"), consoleImages);
  writeJson(path.join(reviewConsoleDir, "pdfs.json"), consolePdfs);
  writeJson(path.join(reviewConsoleDir, "news.json"), consoleNews);
  writeJson(path.join(reviewConsoleDir, "review-items.json"), consoleReview);
  writeJson(
    path.join(reviewConsoleDir, "duplicate-candidates.json"),
    consoleDupes,
  );
  writeJson(
    path.join(reviewConsoleDir, "conflict-candidates.json"),
    consoleConflicts,
  );
  writeJson(
    path.join(reviewConsoleDir, "ready-for-approval.json"),
    consoleReady,
  );
  writeJson(path.join(reviewConsoleDir, "rejected.json"), consoleRejected);
  writeJson(
    path.join(reviewConsoleDir, "quarantined.json"),
    consoleQuarantined,
  );
  appendJsonl(path.join(reviewConsoleDir, "audit-log.jsonl"), [
    {
      at: new Date().toISOString(),
      event: "review_console_generated",
      batchId,
      productionSafe: true,
      databaseWrites: 0,
      storageUploads: 0,
    },
  ]);

  return {
    ok: true,
    batchId,
    jobId,
    sessionId: sessionResult.sessionId,
    commitBlocked: true,
    commitErrorCode,
    databaseWrites: 0,
    storageUploads: 0,
    productionConnection: "NO",
    approvals: 0,
    published: 0,
    productionSafe: true,
    counts: {
      developers: adapted.developers.length,
      projects: adapted.projects.length,
      images: adapted.images.length,
      pdfs: adapted.pdfs.length,
      news: adapted.news.length,
      sourceReviewItems: sourceReviewItems.length,
      generatedReviewCandidates: reviewCandidates.length,
      duplicateCandidates: duplicates.length + duplicateCandidates.length,
      conflictCandidates: conflicts.length,
      readyForApproval: readyForApproval.length,
    },
    actionCounts,
    unknownDevelopers,
    lowConfidenceProvinces,
    provinceConflicts,
    performance,
    outputDir,
    reviewConsoleDir,
    blockers: [],
  };
}
