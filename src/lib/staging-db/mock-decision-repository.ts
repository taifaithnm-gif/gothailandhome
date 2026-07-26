/**
 * In-memory Decision repository — Phase A tests / local skeleton.
 * Never connects to a database. No Apply/Reject/Submit/Rollback.
 */

import { randomUUID } from "node:crypto";

import type {
  CreateDecisionDraftInput,
  ListDecisionsFilter,
  StagingReviewDecision,
  StagingReviewDecisionAudit,
  StagingReviewDecisionEvidence,
} from "./decision-types.ts";
import type { DecisionRepository } from "./decision-repository.ts";
import { validateCreateDecisionDraft } from "./decision-validation.ts";
import { IdempotencyConflictError, StagingDbError } from "./errors.ts";

function clone<T>(v: T): T {
  return structuredClone(v);
}

export class MockDecisionRepository implements DecisionRepository {
  private decisions: StagingReviewDecision[] = [];
  private evidence: StagingReviewDecisionEvidence[] = [];
  private audit: StagingReviewDecisionAudit[] = [];

  async createDraft(
    input: CreateDecisionDraftInput,
  ): Promise<StagingReviewDecision> {
    const validated = validateCreateDecisionDraft(input);

    const existing = this.decisions.find(
      (d) => d.idempotency_key === validated.idempotency_key,
    );
    if (existing) {
      throw new IdempotencyConflictError(validated.idempotency_key, {
        existingId: existing.id,
      });
    }

    const active = this.decisions.find(
      (d) =>
        d.review_item_id === validated.review_item_id &&
        (d.status === "DRAFT" || d.status === "SUBMITTED"),
    );
    if (active) {
      throw new StagingDbError(
        "GTH_DECISION_ACTIVE_EXISTS",
        `Active decision already exists for review_item_id=${validated.review_item_id}`,
        { review_item_id: validated.review_item_id, activeId: active.id },
      );
    }

    const now = new Date().toISOString();
    const row: StagingReviewDecision = {
      id: randomUUID(),
      import_session_id: validated.import_session_id,
      source_batch_id: validated.source_batch_id,
      review_item_id: validated.review_item_id,
      conflict_id: validated.conflict_id ?? null,
      decision_family: validated.decision_family,
      decision_action: validated.decision_action,
      target_type: validated.target_type,
      target_id: validated.target_id,
      status: "DRAFT",
      risk_level: validated.risk_level,
      payload_before: validated.payload_before ?? {},
      payload_after: validated.payload_after ?? {},
      reason: validated.reason ?? null,
      reject_reason: null,
      actor_id: validated.actor_id,
      actor_role: validated.actor_role,
      submitted_by: null,
      submitted_role: null,
      applied_by: null,
      applied_role: null,
      rolled_back_by: null,
      rolled_back_role: null,
      proposer_id: validated.proposer_id ?? validated.actor_id,
      approver_id: null,
      version: 1,
      review_item_version_at_apply: null,
      idempotency_key: validated.idempotency_key,
      content_hash: validated.content_hash,
      reverse_patch: null,
      rollback_of_decision_id: null,
      created_at: now,
      updated_at: now,
      submitted_at: null,
      applied_at: null,
      rolled_back_at: null,
      rejected_at: null,
    };

    this.decisions.push(row);

    this.audit.push({
      id: randomUUID(),
      decision_id: row.id,
      review_item_id: row.review_item_id,
      import_session_id: row.import_session_id,
      event_type: "DECISION_DRAFT_CREATED",
      actor_type: "REVIEWER",
      actor_id: row.actor_id,
      actor_role: row.actor_role,
      previous_status: null,
      next_status: "DRAFT",
      reason: row.reason,
      payload_hash: row.content_hash,
      metadata_json: { phase: "A", skeleton: true },
      created_at: now,
    });

    return clone(row);
  }

  async findById(id: string): Promise<StagingReviewDecision | null> {
    return clone(this.decisions.find((d) => d.id === id) ?? null);
  }

  async findByIdempotencyKey(
    key: string,
  ): Promise<StagingReviewDecision | null> {
    return clone(
      this.decisions.find((d) => d.idempotency_key === key) ?? null,
    );
  }

  async list(filter: ListDecisionsFilter = {}): Promise<StagingReviewDecision[]> {
    let rows = [...this.decisions];
    if (filter.import_session_id) {
      rows = rows.filter(
        (d) => d.import_session_id === filter.import_session_id,
      );
    }
    if (filter.source_batch_id) {
      rows = rows.filter((d) => d.source_batch_id === filter.source_batch_id);
    }
    if (filter.review_item_id) {
      rows = rows.filter((d) => d.review_item_id === filter.review_item_id);
    }
    if (filter.decision_family) {
      rows = rows.filter((d) => d.decision_family === filter.decision_family);
    }
    if (filter.status) {
      const statuses = Array.isArray(filter.status)
        ? filter.status
        : [filter.status];
      rows = rows.filter((d) => statuses.includes(d.status));
    }
    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? 100;
    return rows.slice(offset, offset + limit).map(clone);
  }

  async listEvidence(
    decisionId: string,
  ): Promise<StagingReviewDecisionEvidence[]> {
    return this.evidence
      .filter((e) => e.decision_id === decisionId)
      .map(clone);
  }

  async listAudit(decisionId: string): Promise<StagingReviewDecisionAudit[]> {
    return this.audit
      .filter((a) => a.decision_id === decisionId)
      .map(clone);
  }
}
