/**
 * Decision repository interface — Phase A skeleton.
 * Supported: createDraft, findById, list.
 * Forbidden here: apply / reject / rollback / submit.
 */

import type {
  CreateDecisionDraftInput,
  ListDecisionsFilter,
  StagingReviewDecision,
  StagingReviewDecisionAudit,
  StagingReviewDecisionEvidence,
} from "./decision-types.ts";

export interface DecisionRepository {
  /** Insert a DRAFT decision only. */
  createDraft(input: CreateDecisionDraftInput): Promise<StagingReviewDecision>;

  findById(id: string): Promise<StagingReviewDecision | null>;

  findByIdempotencyKey(
    key: string,
  ): Promise<StagingReviewDecision | null>;

  list(filter?: ListDecisionsFilter): Promise<StagingReviewDecision[]>;

  listEvidence(decisionId: string): Promise<StagingReviewDecisionEvidence[]>;

  listAudit(decisionId: string): Promise<StagingReviewDecisionAudit[]>;
}
