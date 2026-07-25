/**
 * Project import — developer link, province, evidence, slug, duplicate, route.
 * Never auto-approves. Never commits.
 */

import {
  initialReviewState,
  transitionAutomation,
} from "./approval-state.ts";
import type { DuplicateEngine } from "./duplicate-check.ts";
import { validateProvince } from "./province-validator.ts";
import type {
  EntityPreviewRow,
  PreviewAction,
  ProjectCandidate,
  ReviewState,
  ValidationIssue,
} from "./types.ts";

export type ProjectImportResult = {
  entityId: string;
  action: PreviewAction;
  reviewState: ReviewState;
  issues: ValidationIssue[];
  provinceCanonical: string | null;
  routeCandidate: string | null;
  approved: false;
};

function slugify(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function importProjectPreview(
  candidate: ProjectCandidate,
  options?: {
    existingIds?: Set<string>;
    knownDeveloperIds?: Set<string>;
    duplicateEngine?: DuplicateEngine;
  },
): ProjectImportResult {
  const issues: ValidationIssue[] = [];
  let state: ReviewState = initialReviewState();

  if (!candidate.id) {
    issues.push({
      code: "PROJECT_MISSING_ID",
      severity: "error",
      entityType: "project",
      message: "Project id required",
    });
  }
  if (!candidate.name?.trim()) {
    issues.push({
      code: "PROJECT_MISSING_NAME",
      severity: "error",
      entityType: "project",
      entityId: candidate.id,
      message: "Project name required",
      field: "name",
    });
  }

  const province = validateProvince(candidate.province);
  if (!province.ok) {
    issues.push({
      code: `PROJECT_PROVINCE_${province.code}`,
      // Unknown non-empty province → human review, not hard reject.
      severity: province.code === "UNKNOWN" ? "warning" : province.code === "EMPTY" ? "warning" : "error",
      entityType: "project",
      entityId: candidate.id,
      message: `Province validation: ${province.code}`,
      field: "province",
    });
  } else if (province.code === "LOW_CONFIDENCE_ALIAS") {
    issues.push({
      code: "PROJECT_PROVINCE_LOW_CONFIDENCE",
      severity: "warning",
      entityType: "project",
      entityId: candidate.id,
      message: `Province alias low confidence: ${candidate.province} → ${province.canonical}`,
      field: "province",
    });
  }

  if (candidate.provinceConflict) {
    issues.push({
      code: "PROJECT_PROVINCE_CONFLICT",
      severity: "error",
      entityType: "project",
      entityId: candidate.id,
      message: "Province conflict flagged by adapter",
      field: "province",
    });
  }
  if (candidate.provinceConfidence === "LOW") {
    issues.push({
      code: "PROJECT_PROVINCE_LOW_CONFIDENCE",
      severity: "warning",
      entityType: "project",
      entityId: candidate.id,
      message: "Province confidence LOW from source",
      field: "province",
    });
  }
  if (candidate.developerIdentityStatus === "UNKNOWN") {
    issues.push({
      code: "PROJECT_DEVELOPER_UNKNOWN",
      severity: "warning",
      entityType: "project",
      entityId: candidate.id,
      message: "Developer identity UNKNOWN — project retained for review",
      field: "developerId",
    });
  }

  if (
    candidate.developerId &&
    options?.knownDeveloperIds &&
    !options.knownDeveloperIds.has(candidate.developerId)
  ) {
    issues.push({
      code: "PROJECT_DEVELOPER_UNLINKED",
      severity: "warning",
      entityType: "project",
      entityId: candidate.id,
      message: `Developer ${candidate.developerId} not in batch/known set`,
      field: "developerId",
    });
  }

  if (!candidate.evidence || candidate.evidence.length === 0) {
    issues.push({
      code: "PROJECT_MISSING_EVIDENCE",
      severity: "warning",
      entityType: "project",
      entityId: candidate.id,
      message: "No evidence attached",
    });
  }

  const routeCandidate =
    candidate.routeCandidate ??
    candidate.slug ??
    (candidate.name ? slugify(candidate.name) : null);

  state = transitionAutomation(state, "VALIDATED");

  const dupHits = options?.duplicateEngine?.checkProject(candidate) ?? [];
  const exists = options?.existingIds?.has(candidate.id) ?? false;
  const hasErrors = issues.some((i) => i.severity === "error");
  const needsReview =
    hasErrors ||
    issues.some(
      (i) =>
        i.code.includes("LOW_CONFIDENCE") ||
        i.code.includes("UNLINKED") ||
        i.code.includes("UNKNOWN") ||
        i.code.includes("CONFLICT"),
    );

  let action: PreviewAction;
  if (dupHits.length > 0) {
    state = transitionAutomation(state, "DUPLICATE");
    action = "WOULD_SKIP_DUPLICATE";
  } else if (candidate.provinceConflict || issues.some((i) => i.code.includes("CONFLICT"))) {
    state = transitionAutomation(state, "CONFLICT");
    action = "WOULD_REVIEW";
  } else if (hasErrors) {
    state = transitionAutomation(state, "REVIEW_REQUIRED");
    action = "WOULD_REJECT";
  } else if (needsReview) {
    state = transitionAutomation(state, "REVIEW_REQUIRED");
    action = "WOULD_REVIEW";
  } else if (exists) {
    state = transitionAutomation(state, "READY_FOR_APPROVAL");
    action = "WOULD_UPDATE";
  } else {
    state = transitionAutomation(state, "READY_FOR_APPROVAL");
    action = "WOULD_CREATE";
  }

  return {
    entityId: candidate.id,
    action,
    reviewState: state,
    issues,
    provinceCanonical: province.canonical,
    routeCandidate,
    approved: false,
  };
}

export function toProjectPreviewRow(result: ProjectImportResult): EntityPreviewRow {
  return {
    entityType: "project",
    entityId: result.entityId,
    action: result.action,
    reviewState: result.reviewState,
    reasons: result.issues.map((i) => i.code),
  };
}
