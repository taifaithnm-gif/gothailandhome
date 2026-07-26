/**
 * Staging Supabase Decision repository adapter — Phase A.
 * createDraft / read / list only. No Apply/Reject/Submit/Rollback.
 * Server/CLI only.
 */

import type {
  CreateDecisionDraftInput,
  ListDecisionsFilter,
  StagingReviewDecision,
  StagingReviewDecisionAudit,
  StagingReviewDecisionEvidence,
} from "../decision-types.ts";
import type { DecisionRepository } from "../decision-repository.ts";
import { validateCreateDecisionDraft } from "../decision-validation.ts";
import {
  IdempotencyConflictError,
  StagingDbError,
  StagingEnvironmentBlockedError,
} from "../errors.ts";
import {
  createStagingServiceClient,
  describeStagingClientAvailability,
} from "./client.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

function requireClient(env: NodeJS.ProcessEnv = process.env): SupabaseClient {
  const avail = describeStagingClientAvailability(env);
  if (!avail.allowed) {
    throw new StagingEnvironmentBlockedError(
      avail.reason ?? "Staging client unavailable",
    );
  }
  return createStagingServiceClient(env).service;
}

function mapDecisionRow(row: Record<string, unknown>): StagingReviewDecision {
  return {
    id: String(row.id),
    import_session_id: String(row.import_session_id),
    source_batch_id: String(row.source_batch_id),
    review_item_id: String(row.review_item_id),
    conflict_id: row.conflict_id == null ? null : String(row.conflict_id),
    decision_family: row.decision_family as StagingReviewDecision["decision_family"],
    decision_action: String(row.decision_action),
    target_type: row.target_type as StagingReviewDecision["target_type"],
    target_id: String(row.target_id),
    status: row.status as StagingReviewDecision["status"],
    risk_level: row.risk_level as StagingReviewDecision["risk_level"],
    payload_before: (row.payload_before as Record<string, unknown>) ?? {},
    payload_after: (row.payload_after as Record<string, unknown>) ?? {},
    reason: row.reason == null ? null : String(row.reason),
    reject_reason: row.reject_reason == null ? null : String(row.reject_reason),
    actor_id: String(row.actor_id),
    actor_role: String(row.actor_role),
    submitted_by: row.submitted_by == null ? null : String(row.submitted_by),
    submitted_role:
      row.submitted_role == null ? null : String(row.submitted_role),
    applied_by: row.applied_by == null ? null : String(row.applied_by),
    applied_role: row.applied_role == null ? null : String(row.applied_role),
    rolled_back_by:
      row.rolled_back_by == null ? null : String(row.rolled_back_by),
    rolled_back_role:
      row.rolled_back_role == null ? null : String(row.rolled_back_role),
    proposer_id: row.proposer_id == null ? null : String(row.proposer_id),
    approver_id: row.approver_id == null ? null : String(row.approver_id),
    version: Number(row.version ?? 1),
    review_item_version_at_apply:
      row.review_item_version_at_apply == null
        ? null
        : Number(row.review_item_version_at_apply),
    idempotency_key: String(row.idempotency_key),
    content_hash: String(row.content_hash),
    reverse_patch:
      row.reverse_patch == null
        ? null
        : (row.reverse_patch as Record<string, unknown>),
    rollback_of_decision_id:
      row.rollback_of_decision_id == null
        ? null
        : String(row.rollback_of_decision_id),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    submitted_at: row.submitted_at == null ? null : String(row.submitted_at),
    applied_at: row.applied_at == null ? null : String(row.applied_at),
    rolled_back_at:
      row.rolled_back_at == null ? null : String(row.rolled_back_at),
    rejected_at: row.rejected_at == null ? null : String(row.rejected_at),
  };
}

export class SupabaseDecisionRepository implements DecisionRepository {
  private readonly env: NodeJS.ProcessEnv;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.env = env;
  }

  async createDraft(
    input: CreateDecisionDraftInput,
  ): Promise<StagingReviewDecision> {
    const validated = validateCreateDecisionDraft(input);
    const sb = requireClient(this.env);

    const existing = await this.findByIdempotencyKey(validated.idempotency_key);
    if (existing) {
      throw new IdempotencyConflictError(validated.idempotency_key, {
        existingId: existing.id,
      });
    }

    const insertRow = {
      import_session_id: validated.import_session_id,
      source_batch_id: validated.source_batch_id,
      review_item_id: validated.review_item_id,
      conflict_id: validated.conflict_id ?? null,
      decision_family: validated.decision_family,
      decision_action: validated.decision_action,
      target_type: validated.target_type,
      target_id: validated.target_id,
      status: "DRAFT" as const,
      risk_level: validated.risk_level,
      payload_before: validated.payload_before ?? {},
      payload_after: validated.payload_after ?? {},
      reason: validated.reason ?? null,
      actor_id: validated.actor_id,
      actor_role: validated.actor_role,
      proposer_id: validated.proposer_id ?? validated.actor_id,
      version: 1,
      idempotency_key: validated.idempotency_key,
      content_hash: validated.content_hash,
    };

    const { data, error } = await sb
      .from("staging_review_decisions")
      .insert(insertRow)
      .select("*")
      .single();

    if (error) {
      if (/uq_staging_decision_idempotency|duplicate key/i.test(error.message)) {
        throw new IdempotencyConflictError(validated.idempotency_key);
      }
      if (/uq_staging_decision_active_item/i.test(error.message)) {
        throw new StagingDbError(
          "GTH_DECISION_ACTIVE_EXISTS",
          error.message,
          { review_item_id: validated.review_item_id },
        );
      }
      throw new StagingEnvironmentBlockedError(error.message);
    }

    const decision = mapDecisionRow(data as Record<string, unknown>);

    // Append-only draft audit (infrastructure write; not a Decision Service transition)
    const { error: auditError } = await sb
      .from("staging_review_decision_audit")
      .insert({
        decision_id: decision.id,
        review_item_id: decision.review_item_id,
        import_session_id: decision.import_session_id,
        event_type: "DECISION_DRAFT_CREATED",
        actor_type: "REVIEWER",
        actor_id: decision.actor_id,
        actor_role: decision.actor_role,
        previous_status: null,
        next_status: "DRAFT",
        reason: decision.reason,
        payload_hash: decision.content_hash,
        metadata_json: { phase: "A", skeleton: true },
      });
    if (auditError) {
      throw new StagingEnvironmentBlockedError(auditError.message);
    }

    return decision;
  }

  async findById(id: string): Promise<StagingReviewDecision | null> {
    const sb = requireClient(this.env);
    const { data, error } = await sb
      .from("staging_review_decisions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new StagingEnvironmentBlockedError(error.message);
    if (!data) return null;
    return mapDecisionRow(data as Record<string, unknown>);
  }

  async findByIdempotencyKey(
    key: string,
  ): Promise<StagingReviewDecision | null> {
    const sb = requireClient(this.env);
    const { data, error } = await sb
      .from("staging_review_decisions")
      .select("*")
      .eq("idempotency_key", key)
      .maybeSingle();
    if (error) throw new StagingEnvironmentBlockedError(error.message);
    if (!data) return null;
    return mapDecisionRow(data as Record<string, unknown>);
  }

  async list(filter: ListDecisionsFilter = {}): Promise<StagingReviewDecision[]> {
    const sb = requireClient(this.env);
    let q = sb.from("staging_review_decisions").select("*");
    if (filter.import_session_id) {
      q = q.eq("import_session_id", filter.import_session_id);
    }
    if (filter.source_batch_id) {
      q = q.eq("source_batch_id", filter.source_batch_id);
    }
    if (filter.review_item_id) {
      q = q.eq("review_item_id", filter.review_item_id);
    }
    if (filter.decision_family) {
      q = q.eq("decision_family", filter.decision_family);
    }
    if (filter.status) {
      const statuses = Array.isArray(filter.status)
        ? filter.status
        : [filter.status];
      q = q.in("status", statuses);
    }
    const limit = filter.limit ?? 100;
    const offset = filter.offset ?? 0;
    q = q.range(offset, offset + limit - 1).order("created_at", {
      ascending: false,
    });

    const { data, error } = await q;
    if (error) throw new StagingEnvironmentBlockedError(error.message);
    return (data ?? []).map((r) => mapDecisionRow(r as Record<string, unknown>));
  }

  async listEvidence(
    decisionId: string,
  ): Promise<StagingReviewDecisionEvidence[]> {
    const sb = requireClient(this.env);
    const { data, error } = await sb
      .from("staging_review_decision_evidence")
      .select("*")
      .eq("decision_id", decisionId)
      .order("created_at", { ascending: true });
    if (error) throw new StagingEnvironmentBlockedError(error.message);
    return (data ?? []).map((row) => ({
      id: String(row.id),
      decision_id: String(row.decision_id),
      evidence_kind: row.evidence_kind,
      evidence_ref: String(row.evidence_ref),
      evidence_json: (row.evidence_json as Record<string, unknown>) ?? {},
      actor_id: String(row.actor_id),
      actor_role: String(row.actor_role),
      created_at: String(row.created_at),
    }));
  }

  async listAudit(
    decisionId: string,
  ): Promise<StagingReviewDecisionAudit[]> {
    const sb = requireClient(this.env);
    const { data, error } = await sb
      .from("staging_review_decision_audit")
      .select("*")
      .eq("decision_id", decisionId)
      .order("created_at", { ascending: true });
    if (error) throw new StagingEnvironmentBlockedError(error.message);
    return (data ?? []).map((row) => ({
      id: String(row.id),
      decision_id: String(row.decision_id),
      review_item_id: String(row.review_item_id),
      import_session_id: String(row.import_session_id),
      event_type: String(row.event_type),
      actor_type: row.actor_type,
      actor_id: String(row.actor_id),
      actor_role: String(row.actor_role),
      previous_status:
        row.previous_status == null ? null : String(row.previous_status),
      next_status: row.next_status == null ? null : String(row.next_status),
      reason: row.reason == null ? null : String(row.reason),
      payload_hash: String(row.payload_hash),
      metadata_json: (row.metadata_json as Record<string, unknown>) ?? {},
      created_at: String(row.created_at),
    }));
  }
}

export async function createDecisionDraft(
  input: CreateDecisionDraftInput,
  env?: NodeJS.ProcessEnv,
): Promise<StagingReviewDecision> {
  return new SupabaseDecisionRepository(env).createDraft(input);
}

export async function findDecisionById(
  id: string,
  env?: NodeJS.ProcessEnv,
): Promise<StagingReviewDecision | null> {
  return new SupabaseDecisionRepository(env).findById(id);
}

export async function listDecisions(
  filter?: ListDecisionsFilter,
  env?: NodeJS.ProcessEnv,
): Promise<StagingReviewDecision[]> {
  return new SupabaseDecisionRepository(env).list(filter);
}
