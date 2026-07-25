/**
 * PDF adapter — local validation only. Never uploads Storage.
 */

import fs from "node:fs";
import path from "node:path";

import { normalizePdfCategory } from "../pdf-import.ts";
import type { PdfCandidate } from "../types.ts";
import {
  buildProvenance,
  estimatePdfPageCount,
  isPdfMagic,
  KNOWN_GOTH_PDF_FIELDS,
  looksLikeHtml,
  safeRelativePath,
  sha256File,
  unknownFields,
} from "./goth-helpers.ts";
import type {
  GothAdapterContext,
  GothAssetDecision,
  GothPdfRecord,
} from "./goth-types.ts";

export function adaptGothPdf(
  raw: Record<string, unknown>,
  ctx: GothAdapterContext,
  knownProjectIds: Set<string>,
  seenHashes: Map<string, string>,
): GothPdfRecord {
  const file = String(raw.file ?? "").trim();
  const localRel = safeRelativePath(
    ctx.batchDir,
    file.includes("/") ? file : file ? `pdfs/${file}` : null,
  );
  const full = localRel ? path.join(ctx.batchDir, localRel) : null;
  const fileExists = Boolean(full && fs.existsSync(full));
  const buf = fileExists && full ? fs.readFileSync(full) : Buffer.alloc(0);
  const pdfMagicOk = fileExists ? isPdfMagic(buf) : false;
  const htmlDisguised = fileExists && !pdfMagicOk && looksLikeHtml(buf);
  const actualSha = fileExists && full ? sha256File(full) : "";
  const declaredSha = String(raw.sha256 ?? "").toLowerCase();
  const declaredPages =
    raw.page_count != null ? Number(raw.page_count) : null;
  const estimatedPages = fileExists ? estimatePdfPageCount(buf) : null;
  const pages = declaredPages ?? estimatedPages;
  const category = normalizePdfCategory(
    raw.doc_type != null ? String(raw.doc_type) : null,
  );
  const mappedCategory: GothPdfRecord["category"] =
    category === "brochure" ||
    category === "floor_plan" ||
    category === "price_list" ||
    category === "company_profile"
      ? category
      : "unknown";

  const projectId =
    raw.project_id != null && String(raw.project_id).trim()
      ? String(raw.project_id)
      : null;

  const issues: string[] = [];
  if (!fileExists) issues.push("FILE_MISSING");
  if (htmlDisguised) issues.push("HTML_DISGUISED_PDF");
  if (!pdfMagicOk) issues.push("INVALID_PDF_MAGIC");
  if (actualSha && declaredSha && actualSha !== declaredSha) {
    issues.push("SHA256_MISMATCH");
  }
  if (mappedCategory === "unknown") issues.push("UNKNOWN_CATEGORY");
  if (projectId && !knownProjectIds.has(projectId)) {
    issues.push("PROJECT_UNLINKED");
  }

  let decision: GothAssetDecision = "ACCEPT_CANDIDATE";
  if (actualSha && seenHashes.has(actualSha)) {
    issues.push("DUPLICATE_HASH");
    decision = "DUPLICATE_CANDIDATE";
  } else if (actualSha) {
    seenHashes.set(actualSha, file || actualSha);
  }

  if (
    issues.includes("FILE_MISSING") ||
    issues.includes("HTML_DISGUISED_PDF") ||
    issues.includes("INVALID_PDF_MAGIC") ||
    issues.includes("SHA256_MISMATCH")
  ) {
    decision = "REJECTED";
  } else if (decision !== "DUPLICATE_CANDIDATE" && issues.length > 0) {
    decision = "REVIEW_REQUIRED";
  }

  const unsupported = unknownFields(raw, KNOWN_GOTH_PDF_FIELDS);
  const id = file.replace(/\.pdf$/i, "") || actualSha.slice(0, 20);
  const provenance = buildProvenance({
    sourceRecordId: id,
    batchId: ctx.batchId,
    jobId: ctx.jobId,
    schemaVersion: ctx.schemaVersion,
    sourceUrl: raw.source_url != null ? String(raw.source_url) : null,
    sourceDomain: null,
    capturedAt: raw.captured_at != null ? String(raw.captured_at) : null,
    rawPayload: raw,
    unsupportedFields: unsupported,
    reviewReason: issues.join(",") || null,
  });

  return {
    id,
    sourceId: id,
    hash: actualSha || declaredSha,
    mime: pdfMagicOk ? "application/pdf" : htmlDisguised ? "text/html" : null,
    pages,
    category: mappedCategory,
    projectId,
    relativePreviewPath: localRel,
    fileExists,
    pdfMagicOk,
    htmlDisguised,
    decision,
    issues,
    evidence: localRel
      ? [
          {
            kind: "pdf",
            path: localRel,
            hash: actualSha || declaredSha,
            mime: pdfMagicOk ? "application/pdf" : undefined,
          },
        ]
      : [],
    rawPayload: raw,
    unsupportedFields: unsupported,
    provenance,
  };
}

export function adaptGothPdfs(
  rows: Record<string, unknown>[],
  ctx: GothAdapterContext,
  knownProjectIds: Set<string>,
): GothPdfRecord[] {
  const seen = new Map<string, string>();
  return rows.map((row) => adaptGothPdf(row, ctx, knownProjectIds, seen));
}

export function toImportPdf(record: GothPdfRecord): PdfCandidate {
  return {
    id: record.id,
    hash: record.hash,
    mime: record.mime,
    pages: record.pages,
    category: record.category,
    projectId: record.projectId,
    path: record.relativePreviewPath,
    provenance: record.provenance,
  };
}
