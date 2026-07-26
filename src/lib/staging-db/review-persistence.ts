/**
 * Review persistence contract — Staging only.
 * No unauthenticated write endpoints. Optimistic concurrency required.
 */

import {
  StagingDbError,
  InvalidReviewStateError,
  ReviewVersionConflictError,
} from "./errors.ts";
import {
  STAGING_REVIEW_STATES,
  FORBIDDEN_COMMIT_REVIEW_STATES,
  type StagingReviewState,
} from "./types.ts";

export { ReviewVersionConflictError };

export const REVIEW_PERSISTENCE_ALLOWED_STATES = STAGING_REVIEW_STATES;

export type ReviewMutationAction =
  | "ADD_NOTE"
  | "SET_REVIEW_REQUIRED"
  | "SET_CONFLICT"
  | "SET_DUPLICATE"
  | "SET_REJECTED"
  | "SET_QUARANTINED"
  | "SET_READY_FOR_APPROVAL";

export type ReviewMutationRequest = {
  candidateId: string;
  action: ReviewMutationAction;
  reviewerId: string;
  reviewerNotes?: string;
  expectedVersion: number;
  expectedUpdatedAt?: string;
};

export type ReviewMutationResult = {
  candidateId: string;
  previousState: StagingReviewState;
  nextState: StagingReviewState;
  version: number;
  updatedAt: string;
  auditEventId: string;
};

export class ReviewAuthRequiredError extends StagingDbError {
  constructor() {
    super(
      "GTH_REVIEW_AUTH_REQUIRED",
      "Review persistence requires authenticated reviewer — no anonymous write API",
    );
    this.name = "ReviewAuthRequiredError";
  }
}

export function actionToState(
  action: ReviewMutationAction,
  current: StagingReviewState,
): StagingReviewState {
  switch (action) {
    case "ADD_NOTE":
      return current;
    case "SET_REVIEW_REQUIRED":
      return "REVIEW_REQUIRED";
    case "SET_CONFLICT":
      return "CONFLICT";
    case "SET_DUPLICATE":
      return "DUPLICATE";
    case "SET_REJECTED":
      return "REJECTED";
    case "SET_QUARANTINED":
      return "QUARANTINED";
    case "SET_READY_FOR_APPROVAL":
      return "READY_FOR_APPROVAL";
    default: {
      const _e: never = action;
      void _e;
      throw new InvalidReviewStateError(String(action));
    }
  }
}

export function assertReviewMutationAllowed(state: string): StagingReviewState {
  if (
    (FORBIDDEN_COMMIT_REVIEW_STATES as readonly string[]).includes(state)
  ) {
    throw new InvalidReviewStateError(state);
  }
  if (!(STAGING_REVIEW_STATES as readonly string[]).includes(state)) {
    throw new InvalidReviewStateError(state);
  }
  return state as StagingReviewState;
}

/**
 * In-memory optimistic concurrency helper for unit tests / local simulation.
 */
export function applyReviewMutationLocal(input: {
  row: {
    id: string;
    review_state: StagingReviewState;
    version: number;
    updated_at: string;
    reviewer_notes: string | null;
  };
  request: ReviewMutationRequest;
  nowIso: string;
  auditEventId: string;
}): ReviewMutationResult {
  if (!input.request.reviewerId.trim()) {
    throw new ReviewAuthRequiredError();
  }
  if (input.row.version !== input.request.expectedVersion) {
    throw new ReviewVersionConflictError(
      input.request.candidateId,
      input.request.expectedVersion,
      input.row.version,
    );
  }
  const previousState = input.row.review_state;
  const next = assertReviewMutationAllowed(
    actionToState(input.request.action, previousState),
  );
  input.row.review_state = next;
  input.row.version += 1;
  input.row.updated_at = input.nowIso;
  if (input.request.reviewerNotes != null) {
    input.row.reviewer_notes = input.request.reviewerNotes;
  }
  return {
    candidateId: input.request.candidateId,
    previousState,
    nextState: next,
    version: input.row.version,
    updatedAt: input.nowIso,
    auditEventId: input.auditEventId,
  };
}

/** API route contract — must not be mounted without auth. */
export const REVIEW_API_CONTRACT = {
  pathTemplate: "/api/internal/staging/review/[candidateId]",
  methods: ["PATCH"] as const,
  authRequired: true,
  roleRequired: "staging_reviewer",
  productionDisabled: true,
  featureFlagDefault: false,
  forbiddenStates: FORBIDDEN_COMMIT_REVIEW_STATES,
  note: "Do not implement anonymous write endpoints in this milestone",
} as const;
