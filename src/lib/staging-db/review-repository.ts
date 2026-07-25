/**
 * Review persistence design — reviewer / approver separation.
 * Automation ceiling: READY_FOR_APPROVAL. No APPROVED / PUBLISHED via automation.
 */

import { InvalidReviewStateError } from "./errors.ts";
import type { StagingReviewState } from "./types.ts";
import {
  FORBIDDEN_COMMIT_REVIEW_STATES,
  STAGING_REVIEW_STATES,
} from "./types.ts";
import type { ReviewRepository } from "./repository.ts";

export type { ReviewRepository };

export type ReviewerAction =
  | "ADD_NOTE"
  | "MARK_DUPLICATE"
  | "MARK_CONFLICT"
  | "REJECT"
  | "QUARANTINE"
  | "MARK_READY_FOR_APPROVAL";

export type ApproverAction = "APPROVE" | "READY_FOR_PRODUCTION";

export const REVIEWER_ACTIONS: readonly ReviewerAction[] = [
  "ADD_NOTE",
  "MARK_DUPLICATE",
  "MARK_CONFLICT",
  "REJECT",
  "QUARANTINE",
  "MARK_READY_FOR_APPROVAL",
] as const;

export function isAllowedStagingReviewState(
  state: string,
): state is StagingReviewState {
  return (STAGING_REVIEW_STATES as readonly string[]).includes(state);
}

export function assertAllowedStagingReviewState(state: string): StagingReviewState {
  if (!isAllowedStagingReviewState(state)) {
    throw new InvalidReviewStateError(state);
  }
  if (
    (FORBIDDEN_COMMIT_REVIEW_STATES as readonly string[]).includes(state)
  ) {
    throw new InvalidReviewStateError(state);
  }
  return state;
}

export function reviewerActionToState(
  action: ReviewerAction,
): StagingReviewState | null {
  switch (action) {
    case "ADD_NOTE":
      return null;
    case "MARK_DUPLICATE":
      return "DUPLICATE";
    case "MARK_CONFLICT":
      return "CONFLICT";
    case "REJECT":
      return "REJECTED";
    case "QUARANTINE":
      return "QUARANTINED";
    case "MARK_READY_FOR_APPROVAL":
      return "READY_FOR_APPROVAL";
    default: {
      const _e: never = action;
      void _e;
      return null;
    }
  }
}

/** Approver actions are intentionally separate and blocked in Design V1. */
export function assertApproverActionBlocked(action: ApproverAction): never {
  throw new InvalidReviewStateError(
    `Approver action ${action} is blocked in Design V1 — requires separate Approver gate`,
  );
}

export function assertAutomationCannotApproveOrPublish(
  state: string,
): void {
  if (
    (FORBIDDEN_COMMIT_REVIEW_STATES as readonly string[]).includes(state)
  ) {
    throw new InvalidReviewStateError(state);
  }
}
