/**
 * News import — source URL, developer/project link, freshness, evidence, review.
 */

import {
  initialReviewState,
  transitionAutomation,
} from "./approval-state.ts";
import type { DuplicateEngine } from "./duplicate-check.ts";
import type {
  EntityPreviewRow,
  NewsCandidate,
  PreviewAction,
  ReviewState,
  ValidationIssue,
} from "./types.ts";

export type NewsImportResult = {
  entityId: string;
  action: PreviewAction;
  reviewState: ReviewState;
  issues: ValidationIssue[];
  freshness: "fresh" | "stale" | "unknown";
  approved: false;
};

function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function importNewsPreview(
  candidate: NewsCandidate,
  options?: {
    knownDeveloperIds?: Set<string>;
    knownProjectIds?: Set<string>;
    duplicateEngine?: DuplicateEngine;
    staleAfterDays?: number;
  },
): NewsImportResult {
  const issues: ValidationIssue[] = [];
  let state: ReviewState = initialReviewState();
  const staleAfter = options?.staleAfterDays ?? 365;

  if (!candidate.id) {
    issues.push({
      code: "NEWS_MISSING_ID",
      severity: "error",
      entityType: "news",
      message: "News id required",
    });
  }
  if (!candidate.sourceUrl || !isHttpUrl(candidate.sourceUrl)) {
    issues.push({
      code: "NEWS_URL_INVALID",
      severity: "error",
      entityType: "news",
      entityId: candidate.id,
      message: "sourceUrl must be http(s)",
      field: "sourceUrl",
    });
  }
  if (
    candidate.developerId &&
    options?.knownDeveloperIds &&
    !options.knownDeveloperIds.has(candidate.developerId)
  ) {
    issues.push({
      code: "NEWS_DEVELOPER_UNLINKED",
      severity: "warning",
      entityType: "news",
      entityId: candidate.id,
      message: `Developer ${candidate.developerId} not known`,
    });
  }
  if (
    candidate.projectId &&
    options?.knownProjectIds &&
    !options.knownProjectIds.has(candidate.projectId)
  ) {
    issues.push({
      code: "NEWS_PROJECT_UNLINKED",
      severity: "warning",
      entityType: "news",
      entityId: candidate.id,
      message: `Project ${candidate.projectId} not known`,
    });
  }

  let freshness: NewsImportResult["freshness"] = "unknown";
  if (typeof candidate.freshnessDays === "number") {
    freshness = candidate.freshnessDays > staleAfter ? "stale" : "fresh";
    if (freshness === "stale") {
      issues.push({
        code: "NEWS_STALE",
        severity: "warning",
        entityType: "news",
        entityId: candidate.id,
        message: `News older than ${staleAfter} days`,
      });
    }
  }

  if (!candidate.evidence || candidate.evidence.length === 0) {
    issues.push({
      code: "NEWS_MISSING_EVIDENCE",
      severity: "info",
      entityType: "news",
      entityId: candidate.id,
      message: "No evidence attached",
    });
  }

  state = transitionAutomation(state, "VALIDATED");
  const dupHits = options?.duplicateEngine?.checkNews(candidate) ?? [];
  const hasErrors = issues.some((i) => i.severity === "error");

  let action: PreviewAction;
  if (dupHits.length > 0) {
    state = transitionAutomation(state, "DUPLICATE");
    action = "WOULD_SKIP_DUPLICATE";
  } else if (hasErrors) {
    state = transitionAutomation(state, "REVIEW_REQUIRED");
    action = "WOULD_REJECT";
  } else if (issues.some((i) => i.severity === "warning")) {
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
    freshness,
    approved: false,
  };
}

export function toNewsPreviewRow(result: NewsImportResult): EntityPreviewRow {
  return {
    entityType: "news",
    entityId: result.entityId,
    action: result.action,
    reviewState: result.reviewState,
    reasons: result.issues.map((i) => i.code),
  };
}
