/**
 * Import Session — Batch → Validation → Normalize → Review → Duplicate → Preview.
 * Commit intentionally absent.
 */

import { createHash, randomUUID } from "node:crypto";

import {
  buildApprovalCandidates,
  summarizeApprovalCandidates,
} from "./approval-engine.ts";
import { AuditLog } from "./audit.ts";
import {
  importImagePreview,
  toImagePreviewRow,
} from "./asset-import.ts";
import { validateImportBatch } from "./contract-validator.ts";
import {
  importDeveloperPreview,
  toDeveloperPreviewRow,
} from "./developer-import.ts";
import { DuplicateEngine } from "./duplicate-check.ts";
import { CommitNotImplementedError } from "./errors.ts";
import {
  importNewsPreview,
  toNewsPreviewRow,
} from "./news-import.ts";
import { importPdfPreview, toPdfPreviewRow } from "./pdf-import.ts";
import {
  importProjectPreview,
  toProjectPreviewRow,
} from "./project-import.ts";
import { buildPreviewDashboard, type PreviewDashboard } from "./report.ts";
import {
  mapToReviewQueue,
  summarizeReviewQueue,
  type ReviewQueueItem,
} from "./review-mapper.ts";
import { StagingTransaction } from "./transaction.ts";
import {
  STAGING_IMPORT_HARD_FLAGS,
  type ApprovalCandidate,
  type DuplicateHit,
  type EntityPreviewRow,
  type ImportBatch,
  type ImportSessionPhase,
  type ValidationIssue,
} from "./types.ts";
import { runValidationEngine } from "./validation-engine.ts";

export type ImportSessionOptions = {
  existingDeveloperIds?: string[];
  existingProjectIds?: string[];
  actor?: "system" | "cli" | "test";
};

export type ImportSessionResult = {
  sessionId: string;
  batchId: string;
  phase: ImportSessionPhase;
  flags: typeof STAGING_IMPORT_HARD_FLAGS;
  validationOk: boolean;
  validationIssues: ValidationIssue[];
  duplicates: DuplicateHit[];
  rows: EntityPreviewRow[];
  reviewQueue: ReviewQueueItem[];
  reviewSummary: ReturnType<typeof summarizeReviewQueue>;
  approvalCandidates: ApprovalCandidate[];
  approvalSummary: ReturnType<typeof summarizeApprovalCandidates>;
  preview: PreviewDashboard;
  auditCount: number;
  databaseWrites: 0;
  storageUploads: 0;
  productionChanged: false;
  committed: false;
};

function normalizeBatch(batch: ImportBatch): ImportBatch {
  return {
    ...batch,
    developers: batch.developers.map((d) => ({
      ...d,
      name: d.name.trim(),
      aliases: (d.aliases ?? []).map((a) => a.trim()).filter(Boolean),
    })),
    projects: batch.projects.map((p) => ({
      ...p,
      name: p.name.trim(),
      slug: p.slug?.trim() || undefined,
    })),
    images: batch.images.map((i) => ({
      ...i,
      hash: i.hash.toLowerCase(),
    })),
    pdfs: batch.pdfs.map((p) => ({
      ...p,
      hash: p.hash.toLowerCase(),
    })),
    news: batch.news.map((n) => ({
      ...n,
      sourceUrl: n.sourceUrl.trim(),
    })),
  };
}

export class ImportSession {
  readonly sessionId: string;
  readonly flags = STAGING_IMPORT_HARD_FLAGS;
  readonly audit: AuditLog;
  readonly tx: StagingTransaction;
  phase: ImportSessionPhase = "created";
  private batch: ImportBatch | null = null;
  private result: ImportSessionResult | null = null;

  constructor(sessionId = randomUUID()) {
    this.sessionId = sessionId;
    this.audit = new AuditLog(sessionId);
    this.tx = new StagingTransaction();
    this.audit.append("session.created", { flags: this.flags });
  }

  loadBatch(batch: ImportBatch): void {
    this.batch = batch;
    this.phase = "batch_loaded";
    this.audit.append("batch.loaded", {
      batchId: batch.manifest.batchId,
      counts: {
        developers: batch.developers.length,
        projects: batch.projects.length,
        images: batch.images.length,
        pdfs: batch.pdfs.length,
        news: batch.news.length,
      },
    });
  }

  /**
   * Full dry-run pipeline. Commit is never invoked.
   */
  run(options: ImportSessionOptions = {}): ImportSessionResult {
    if (!this.batch) {
      throw new Error("No batch loaded");
    }

    const actor = options.actor ?? "system";
    const contract = validateImportBatch(this.batch);
    this.phase = "validated";
    this.audit.append("batch.validated", { ok: contract.ok }, actor);

    const normalized = normalizeBatch(this.batch);
    this.phase = "normalized";
    this.audit.append("batch.normalized", {}, actor);

    const validation = runValidationEngine(normalized);

    const engine = new DuplicateEngine();
    // Fresh engine per entity pass during imports — scanBatch for report
    const dupScanEngine = new DuplicateEngine();
    const duplicates = dupScanEngine.scanBatch(normalized);
    this.phase = "duplicate_checked";
    this.audit.append(
      "duplicate.checked",
      { hits: duplicates.length },
      actor,
    );

    const knownDevelopers = new Set([
      ...normalized.developers.map((d) => d.id),
      ...(options.existingDeveloperIds ?? []),
    ]);
    const knownProjects = new Set([
      ...normalized.projects.map((p) => p.id),
      ...(options.existingProjectIds ?? []),
    ]);
    const existingDevelopers = new Set(options.existingDeveloperIds ?? []);
    const existingProjects = new Set(options.existingProjectIds ?? []);

    const rows: EntityPreviewRow[] = [];

    for (const d of normalized.developers) {
      const r = importDeveloperPreview(d, {
        existingIds: existingDevelopers,
        duplicateEngine: engine,
      });
      rows.push(toDeveloperPreviewRow(r));
      this.tx.stage({
        op: r.action === "WOULD_UPDATE" ? "update" : "insert",
        table: "developers",
        entityId: d.id,
        payload: { action: r.action },
      });
    }
    for (const p of normalized.projects) {
      const r = importProjectPreview(p, {
        existingIds: existingProjects,
        knownDeveloperIds: knownDevelopers,
        duplicateEngine: engine,
      });
      rows.push(toProjectPreviewRow(r));
      this.tx.stage({
        op: r.action === "WOULD_UPDATE" ? "update" : "insert",
        table: "projects",
        entityId: p.id,
        payload: { action: r.action },
      });
    }
    for (const img of normalized.images) {
      const r = importImagePreview(img, {
        knownProjectIds: knownProjects,
        duplicateEngine: engine,
      });
      rows.push(toImagePreviewRow(r));
      this.tx.stage({
        op: "insert",
        table: "images",
        entityId: img.id,
        payload: { action: r.action, storagePathMock: r.storagePathMock },
      });
    }
    for (const pdf of normalized.pdfs) {
      const r = importPdfPreview(pdf, {
        knownProjectIds: knownProjects,
        duplicateEngine: engine,
      });
      rows.push(toPdfPreviewRow(r));
      this.tx.stage({
        op: "insert",
        table: "pdfs",
        entityId: pdf.id,
        payload: { action: r.action, category: r.category },
      });
    }
    for (const n of normalized.news) {
      const r = importNewsPreview(n, {
        knownDeveloperIds: knownDevelopers,
        knownProjectIds: knownProjects,
        duplicateEngine: engine,
      });
      rows.push(toNewsPreviewRow(r));
      this.tx.stage({
        op: "insert",
        table: "news",
        entityId: n.id,
        payload: { action: r.action },
      });
    }

    this.phase = "review_mapped";
    const reviewQueue = mapToReviewQueue(rows);
    const reviewSummary = summarizeReviewQueue(reviewQueue);
    this.audit.append("review.mapped", { summary: reviewSummary }, actor);

    const approvalCandidates = buildApprovalCandidates(rows);
    const approvalSummary = summarizeApprovalCandidates(approvalCandidates);

    const preview = buildPreviewDashboard(rows);
    this.phase = "preview_ready";
    this.audit.append(
      "preview.ready",
      { totals: preview.totals, fingerprint: fingerprintRows(rows) },
      actor,
    );

    // Finalize dry-run tx — never commit
    this.tx.finalizeDryRun();
    this.phase = "blocked_commit";
    this.audit.append("commit.blocked", { reason: "V1_NO_COMMIT" }, actor);

    this.result = {
      sessionId: this.sessionId,
      batchId: normalized.manifest.batchId,
      phase: this.phase,
      flags: this.flags,
      validationOk: validation.ok && contract.ok,
      validationIssues: [...contract.issues, ...validation.issues],
      duplicates,
      rows,
      reviewQueue,
      reviewSummary,
      approvalCandidates,
      approvalSummary,
      preview,
      auditCount: this.audit.count(),
      databaseWrites: 0,
      storageUploads: 0,
      productionChanged: false,
      committed: false,
    };
    return this.result;
  }

  /** Commit must not exist — always throws. */
  commit(): never {
    this.audit.append("commit.attempt_blocked", {});
    throw new CommitNotImplementedError();
  }

  getResult(): ImportSessionResult | null {
    return this.result;
  }
}

function fingerprintRows(rows: EntityPreviewRow[]): string {
  const h = createHash("sha256");
  h.update(
    JSON.stringify(
      rows.map((r) => [r.entityType, r.entityId, r.action, r.reviewState]),
    ),
  );
  return h.digest("hex");
}

export function runImportSession(
  batch: ImportBatch,
  options?: ImportSessionOptions,
): ImportSessionResult {
  const session = new ImportSession();
  session.loadBatch(batch);
  return session.run(options);
}
