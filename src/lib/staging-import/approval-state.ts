/**
 * Review state machine for Staging Import Framework V1 (Architecture Freeze).
 *
 * Active automation graph ends at READY_FOR_APPROVAL.
 * APPROVED / READY_FOR_PRODUCTION / PUBLISHED are FUTURE_MANUAL_STATE only —
 * no edges into or between them in the active transition table.
 */

import {
  ForbiddenAutomationStateError,
  InvalidReviewStateTransitionError,
} from "./errors.ts";
import {
  FORBIDDEN_AUTOMATION_STATES,
  FUTURE_MANUAL_STATES,
  MAX_AUTOMATION_REVIEW_STATE,
  type ReviewState,
} from "./types.ts";

const TRANSITIONS: Record<ReviewState, readonly ReviewState[]> = {
  RECEIVED: [
    "VALIDATED",
    "REVIEW_REQUIRED",
    "CONFLICT",
    "DUPLICATE",
    "REJECTED",
    "QUARANTINED",
  ],
  VALIDATED: [
    "REVIEW_REQUIRED",
    "CONFLICT",
    "DUPLICATE",
    "READY_FOR_APPROVAL",
    "REJECTED",
    "QUARANTINED",
  ],
  REVIEW_REQUIRED: [
    "CONFLICT",
    "DUPLICATE",
    "READY_FOR_APPROVAL",
    "VALIDATED",
    "REJECTED",
    "QUARANTINED",
  ],
  CONFLICT: ["REVIEW_REQUIRED", "DUPLICATE", "READY_FOR_APPROVAL", "REJECTED"],
  DUPLICATE: ["REVIEW_REQUIRED", "READY_FOR_APPROVAL", "CONFLICT", "REJECTED"],
  /** Freeze: no READY_FOR_APPROVAL → APPROVED edge. */
  READY_FOR_APPROVAL: ["REVIEW_REQUIRED", "CONFLICT", "REJECTED"],
  REJECTED: ["REVIEW_REQUIRED", "QUARANTINED"],
  QUARANTINED: ["REVIEW_REQUIRED", "REJECTED"],
  /** FUTURE_MANUAL_STATE — no automatic outbound edges. */
  APPROVED: [],
  READY_FOR_PRODUCTION: [],
  PUBLISHED: [],
};

export { FUTURE_MANUAL_STATES };

export function initialReviewState(): ReviewState {
  return "RECEIVED";
}

export function canTransition(from: ReviewState, to: ReviewState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: ReviewState, to: ReviewState): void {
  if (!canTransition(from, to)) {
    throw new InvalidReviewStateTransitionError(from, to);
  }
}

export function isForbiddenAutomationState(state: ReviewState): boolean {
  return (FORBIDDEN_AUTOMATION_STATES as readonly string[]).includes(state);
}

export function assertAutomationAllowed(state: ReviewState): void {
  if (isForbiddenAutomationState(state)) {
    throw new ForbiddenAutomationStateError(state);
  }
}

/**
 * Advance state under automation constraints.
 * Refuses any transition into APPROVED+.
 */
export function transitionAutomation(
  from: ReviewState,
  to: ReviewState,
): ReviewState {
  assertTransition(from, to);
  assertAutomationAllowed(to);
  return to;
}

/** Rank for comparisons (higher = further along). */
const RANK: Record<ReviewState, number> = {
  RECEIVED: 0,
  VALIDATED: 1,
  REVIEW_REQUIRED: 2,
  CONFLICT: 3,
  DUPLICATE: 4,
  REJECTED: 4,
  QUARANTINED: 4,
  READY_FOR_APPROVAL: 5,
  APPROVED: 6,
  READY_FOR_PRODUCTION: 7,
  PUBLISHED: 8,
};

export function reviewStateRank(state: ReviewState): number {
  return RANK[state];
}

export function isAtOrBeyondCeiling(state: ReviewState): boolean {
  return reviewStateRank(state) >= reviewStateRank(MAX_AUTOMATION_REVIEW_STATE);
}

export function maxAutomationState(): ReviewState {
  return MAX_AUTOMATION_REVIEW_STATE;
}

export { TRANSITIONS as REVIEW_TRANSITIONS };
