/**
 * Decision draft validation — structural checks only.
 * No Apply / Reject / Submit / Rollback / dual-control business logic.
 * Project does not use zod; plain TypeScript validators mirror CHECK constraints.
 */

import { SchemaValidationError } from "./errors.ts";
import {
  DECISION_ACTIONS_BY_FAMILY,
  DECISION_EVIDENCE_KINDS,
  DECISION_FAMILIES,
  DECISION_RISK_LEVELS,
  DECISION_STATUSES,
  DECISION_TARGET_TYPES,
  type CreateDecisionDraftInput,
  type DecisionEvidenceKind,
  type DecisionFamily,
  type DecisionRiskLevel,
  type DecisionStatus,
  type DecisionTargetType,
} from "./decision-types.ts";

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new SchemaValidationError(`Invalid ${field}: non-empty string required`);
  }
  return value.trim();
}

function assertIn<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  const s = assertString(value, field);
  if (!(allowed as readonly string[]).includes(s)) {
    throw new SchemaValidationError(
      `Invalid ${field}: ${s}`,
      { field, value: s, allowed: [...allowed] },
    );
  }
  return s as T;
}

export function isDecisionFamily(value: unknown): value is DecisionFamily {
  return (
    typeof value === "string" &&
    (DECISION_FAMILIES as readonly string[]).includes(value)
  );
}

export function isDecisionStatus(value: unknown): value is DecisionStatus {
  return (
    typeof value === "string" &&
    (DECISION_STATUSES as readonly string[]).includes(value)
  );
}

export function isDecisionRiskLevel(value: unknown): value is DecisionRiskLevel {
  return (
    typeof value === "string" &&
    (DECISION_RISK_LEVELS as readonly string[]).includes(value)
  );
}

export function isDecisionTargetType(value: unknown): value is DecisionTargetType {
  return (
    typeof value === "string" &&
    (DECISION_TARGET_TYPES as readonly string[]).includes(value)
  );
}

export function isDecisionEvidenceKind(
  value: unknown,
): value is DecisionEvidenceKind {
  return (
    typeof value === "string" &&
    (DECISION_EVIDENCE_KINDS as readonly string[]).includes(value)
  );
}

export function isActionAllowedForFamily(
  family: DecisionFamily,
  action: string,
): boolean {
  const allowed = DECISION_ACTIONS_BY_FAMILY[family] as readonly string[];
  return allowed.includes(action);
}

/**
 * Validate Create Draft payload shape against design CHECKs / allow-lists.
 * Always forces status=DRAFT conceptually (caller must not pass other statuses).
 */
export function validateCreateDecisionDraft(
  input: CreateDecisionDraftInput,
): CreateDecisionDraftInput {
  const import_session_id = assertString(
    input.import_session_id,
    "import_session_id",
  );
  const source_batch_id = assertString(input.source_batch_id, "source_batch_id");
  const review_item_id = assertString(input.review_item_id, "review_item_id");
  const decision_family = assertIn(
    input.decision_family,
    DECISION_FAMILIES,
    "decision_family",
  );
  const decision_action = assertString(input.decision_action, "decision_action");
  if (!isActionAllowedForFamily(decision_family, decision_action)) {
    throw new SchemaValidationError(
      `decision_action ${decision_action} not allowed for ${decision_family}`,
      { decision_family, decision_action },
    );
  }
  const target_type = assertIn(
    input.target_type,
    DECISION_TARGET_TYPES,
    "target_type",
  );
  const target_id = assertString(input.target_id, "target_id");
  const risk_level = assertIn(input.risk_level, DECISION_RISK_LEVELS, "risk_level");
  const actor_id = assertString(input.actor_id, "actor_id");
  const actor_role = assertString(input.actor_role, "actor_role");
  const idempotency_key = assertString(input.idempotency_key, "idempotency_key");
  const content_hash = assertString(input.content_hash, "content_hash");

  if (
    input.payload_before !== undefined &&
    (typeof input.payload_before !== "object" || input.payload_before === null)
  ) {
    throw new SchemaValidationError("payload_before must be an object");
  }
  if (
    input.payload_after !== undefined &&
    (typeof input.payload_after !== "object" || input.payload_after === null)
  ) {
    throw new SchemaValidationError("payload_after must be an object");
  }

  return {
    import_session_id,
    source_batch_id,
    review_item_id,
    conflict_id: input.conflict_id ?? null,
    decision_family,
    decision_action,
    target_type,
    target_id,
    risk_level,
    payload_before: input.payload_before ?? {},
    payload_after: input.payload_after ?? {},
    reason: input.reason ?? null,
    actor_id,
    actor_role,
    proposer_id: input.proposer_id ?? input.actor_id,
    idempotency_key,
    content_hash,
  };
}
