/**
 * PDF import — hash, mime, pages, category. Never uploads Storage.
 */

import {
  initialReviewState,
  transitionAutomation,
} from "./approval-state.ts";
import type { DuplicateEngine } from "./duplicate-check.ts";
import { StorageUploadBlockedError } from "./errors.ts";
import type {
  EntityPreviewRow,
  PdfCandidate,
  PdfCategory,
  PreviewAction,
  ReviewState,
  ValidationIssue,
} from "./types.ts";

export type PdfImportResult = {
  entityId: string;
  action: PreviewAction;
  reviewState: ReviewState;
  issues: ValidationIssue[];
  category: PdfCategory;
  approved: false;
};

const HASH_RE = /^[a-f0-9]{64}$/i;
const CATEGORIES: PdfCategory[] = [
  "brochure",
  "price_list",
  "floor_plan",
  "company_profile",
  "other",
  "unknown",
];

export function normalizePdfCategory(
  value: string | null | undefined,
): PdfCategory {
  if (!value) return "unknown";
  const v = value.toLowerCase().replace(/\s+/g, "_");
  if ((CATEGORIES as string[]).includes(v)) return v as PdfCategory;
  if (v.includes("brochure") || v.includes("catalog")) return "brochure";
  if (v.includes("price")) return "price_list";
  if (v.includes("floor") || v.includes("plan")) return "floor_plan";
  if (v.includes("company") || v.includes("corporate") || v.includes("profile")) {
    return "company_profile";
  }
  return "other";
}

export function importPdfPreview(
  candidate: PdfCandidate,
  options?: {
    knownProjectIds?: Set<string>;
    duplicateEngine?: DuplicateEngine;
  },
): PdfImportResult {
  const issues: ValidationIssue[] = [];
  let state: ReviewState = initialReviewState();
  const category = normalizePdfCategory(candidate.category);

  if (!candidate.id) {
    issues.push({
      code: "PDF_MISSING_ID",
      severity: "error",
      entityType: "pdf",
      message: "PDF id required",
    });
  }
  if (!candidate.hash || !HASH_RE.test(candidate.hash)) {
    issues.push({
      code: "PDF_HASH_INVALID",
      severity: "error",
      entityType: "pdf",
      entityId: candidate.id,
      message: "PDF hash must be 64-char hex sha256",
      field: "hash",
    });
  }
  if (candidate.mime && candidate.mime !== "application/pdf") {
    issues.push({
      code: "PDF_MIME_INVALID",
      severity: "error",
      entityType: "pdf",
      entityId: candidate.id,
      message: `Unexpected mime: ${candidate.mime}`,
      field: "mime",
    });
  }
  if (candidate.pages != null && candidate.pages < 1) {
    issues.push({
      code: "PDF_PAGES_INVALID",
      severity: "warning",
      entityType: "pdf",
      entityId: candidate.id,
      message: "PDF pages should be >= 1",
      field: "pages",
    });
  }
  if (
    candidate.projectId &&
    options?.knownProjectIds &&
    !options.knownProjectIds.has(candidate.projectId)
  ) {
    issues.push({
      code: "PDF_PROJECT_UNLINKED",
      severity: "warning",
      entityType: "pdf",
      entityId: candidate.id,
      message: `Project ${candidate.projectId} not known`,
      field: "projectId",
    });
  }
  if (category === "unknown") {
    issues.push({
      code: "PDF_CATEGORY_UNKNOWN",
      severity: "warning",
      entityType: "pdf",
      entityId: candidate.id,
      message: "PDF category unknown — review",
      field: "category",
    });
  }

  state = transitionAutomation(state, "VALIDATED");
  const dupHits = options?.duplicateEngine?.checkPdf(candidate) ?? [];
  const hasErrors = issues.some((i) => i.severity === "error");

  let action: PreviewAction;
  if (dupHits.length > 0) {
    state = transitionAutomation(state, "DUPLICATE");
    action = "WOULD_SKIP_DUPLICATE";
  } else if (hasErrors) {
    state = transitionAutomation(state, "REVIEW_REQUIRED");
    action = "WOULD_REJECT";
  } else if (issues.length > 0) {
    state = transitionAutomation(state, "REVIEW_REQUIRED");
    action = "WOULD_REVIEW";
  } else {
    state = transitionAutomation(state, "READY_FOR_APPROVAL");
    action = "WOULD_CREATE";
  }

  return {
    entityId: candidate.id,
    action,
    reviewState: state,
    issues,
    category,
    approved: false,
  };
}

export function toPdfPreviewRow(result: PdfImportResult): EntityPreviewRow {
  return {
    entityType: "pdf",
    entityId: result.entityId,
    action: result.action,
    reviewState: result.reviewState,
    reasons: result.issues.map((i) => i.code),
  };
}

export function uploadPdfToStorage(): never {
  throw new StorageUploadBlockedError();
}
