/**
 * Developer import — create / update / duplicate / alias / UNKNOWN / evidence.
 * Never auto-approves. Never commits.
 */

import { validateDeveloper } from "./developer-validator.ts";
import type { DuplicateEngine } from "./duplicate-check.ts";
import {
  initialReviewState,
  transitionAutomation,
} from "./approval-state.ts";
import type {
  DeveloperCandidate,
  EntityPreviewRow,
  PreviewAction,
  ReviewState,
  ValidationIssue,
} from "./types.ts";
import { StorageUploadBlockedError } from "./errors.ts";

export type DeveloperImportResult = {
  entityId: string;
  action: PreviewAction;
  reviewState: ReviewState;
  issues: ValidationIssue[];
  approved: false;
};

export function importDeveloperPreview(
  candidate: DeveloperCandidate,
  options?: {
    existingIds?: Set<string>;
    duplicateEngine?: DuplicateEngine;
  },
): DeveloperImportResult {
  const validation = validateDeveloper(candidate);
  const issues = [...validation.issues];
  let state: ReviewState = initialReviewState();
  state = transitionAutomation(state, "VALIDATED");

  const dupHits = options?.duplicateEngine?.checkDeveloper(candidate) ?? [];
  const exists = options?.existingIds?.has(candidate.id) ?? false;

  let action: PreviewAction;
  if (dupHits.length > 0) {
    state = transitionAutomation(state, "DUPLICATE");
    action = "WOULD_SKIP_DUPLICATE";
  } else if (!validation.ok) {
    state = transitionAutomation(state, "REVIEW_REQUIRED");
    action = "WOULD_REJECT";
  } else if (validation.needsReview) {
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
    approved: false,
  };
}

export function toDeveloperPreviewRow(
  result: DeveloperImportResult,
): EntityPreviewRow {
  return {
    entityType: "developer",
    entityId: result.entityId,
    action: result.action,
    reviewState: result.reviewState,
    reasons: result.issues.map((i) => i.code),
  };
}

/** Explicitly blocked — developers never upload assets in V1. */
export function uploadDeveloperAsset(): never {
  throw new StorageUploadBlockedError();
}
