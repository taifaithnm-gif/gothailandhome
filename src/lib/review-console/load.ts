/**
 * Local Human Review Console data loader.
 * No database clients. No production secrets. Path-safe only.
 */

import fs from "node:fs";
import path from "node:path";

import { isGothReviewConsoleEnabled as featureFlagEnabled } from "../feature-flags/index.ts";

const BATCH_ID_RE = /^BATCH-GTH-[A-Z0-9-]+$/;
const ALLOWED_FILES = new Set([
  "summary.json",
  "developers.json",
  "projects.json",
  "images.json",
  "pdfs.json",
  "news.json",
  "review-items.json",
  "duplicate-candidates.json",
  "conflict-candidates.json",
  "ready-for-approval.json",
  "rejected.json",
  "quarantined.json",
]);

const MAX_JSON_BYTES = 8 * 1024 * 1024;

export function isGothReviewConsoleEnabled(): boolean {
  return featureFlagEnabled();
}

export function assertSafeBatchId(batchId: string): string {
  if (!BATCH_ID_RE.test(batchId)) {
    throw new Error("INVALID_BATCH_ID");
  }
  if (batchId.includes("..") || batchId.includes("/") || batchId.includes("\\")) {
    throw new Error("PATH_TRAVERSAL_BLOCKED");
  }
  return batchId;
}

export function resolveReviewConsoleDir(
  repoRoot: string,
  batchId: string,
): string {
  const safe = assertSafeBatchId(batchId);
  const root = path.resolve(repoRoot, ".work/review-console");
  const dir = path.resolve(root, safe);
  if (!dir.startsWith(root + path.sep) && dir !== root) {
    throw new Error("PATH_TRAVERSAL_BLOCKED");
  }
  return dir;
}

export function readReviewConsoleJson<T = unknown>(
  repoRoot: string,
  batchId: string,
  fileName: string,
): T {
  if (!ALLOWED_FILES.has(fileName)) {
    throw new Error("FILE_NOT_ALLOWED");
  }
  const dir = resolveReviewConsoleDir(repoRoot, batchId);
  const full = path.resolve(dir, fileName);
  if (!full.startsWith(dir + path.sep)) {
    throw new Error("PATH_TRAVERSAL_BLOCKED");
  }
  if (!fs.existsSync(full)) {
    throw new Error(`MISSING_CONSOLE_FILE: ${fileName}`);
  }
  const stat = fs.statSync(full);
  if (stat.size > MAX_JSON_BYTES) {
    throw new Error("JSON_TOO_LARGE");
  }
  const text = fs.readFileSync(full, "utf8");
  if (/\/Users\/|\/Volumes\/|C:\\\\/i.test(text)) {
    throw new Error("ABSOLUTE_PATH_LEAK");
  }
  return JSON.parse(text) as T;
}

export function loadReviewConsoleBundle(repoRoot: string, batchId: string) {
  return {
    summary: readReviewConsoleJson(repoRoot, batchId, "summary.json"),
    developers: readReviewConsoleJson(repoRoot, batchId, "developers.json"),
    projects: readReviewConsoleJson(repoRoot, batchId, "projects.json"),
    images: readReviewConsoleJson(repoRoot, batchId, "images.json"),
    pdfs: readReviewConsoleJson(repoRoot, batchId, "pdfs.json"),
    news: readReviewConsoleJson(repoRoot, batchId, "news.json"),
    reviewItems: readReviewConsoleJson(repoRoot, batchId, "review-items.json"),
    duplicates: readReviewConsoleJson(
      repoRoot,
      batchId,
      "duplicate-candidates.json",
    ),
    conflicts: readReviewConsoleJson(
      repoRoot,
      batchId,
      "conflict-candidates.json",
    ),
    ready: readReviewConsoleJson(repoRoot, batchId, "ready-for-approval.json"),
    rejected: readReviewConsoleJson(repoRoot, batchId, "rejected.json"),
    quarantined: readReviewConsoleJson(repoRoot, batchId, "quarantined.json"),
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function filterReviewRows<T extends Record<string, unknown>>(
  rows: T[],
  options: {
    query?: string;
    entityType?: string;
    reviewState?: string;
    severity?: string;
    confidence?: string;
    page?: number;
    pageSize?: number;
  },
): { rows: T[]; total: number; page: number; pageSize: number } {
  const pageSize = Math.min(Math.max(options.pageSize ?? 25, 1), 100);
  const page = Math.max(options.page ?? 1, 1);
  const q = (options.query ?? "").trim().toLowerCase();

  let filtered = rows;
  if (options.entityType) {
    filtered = filtered.filter(
      (r) => String(r.entityType ?? "") === options.entityType,
    );
  }
  if (options.reviewState) {
    filtered = filtered.filter(
      (r) =>
        String(r.reviewState ?? r.decision ?? "") === options.reviewState,
    );
  }
  if (options.severity) {
    filtered = filtered.filter(
      (r) => String(r.severity ?? "") === options.severity,
    );
  }
  if (options.confidence) {
    filtered = filtered.filter(
      (r) =>
        String(r.confidence ?? r.provinceConfidence ?? "").toUpperCase() ===
        options.confidence!.toUpperCase(),
    );
  }
  if (q) {
    filtered = filtered.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(q),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return {
    rows: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  };
}
