/**
 * Manual Review Decision types — Phase A infrastructure only.
 * No Decision Service / API / Apply / Reject / Rollback / Submit logic.
 */

import type { AuditActorType } from "./types.ts";

export const DECISION_FAMILIES = [
  "DEVELOPER_CANONICAL_LINK",
  "PROJECT_PROVINCE",
  "IMAGE_FAILURE",
  "PDF_LINKAGE",
  "NEWS_METADATA",
] as const;

export type DecisionFamily = (typeof DECISION_FAMILIES)[number];

export const DECISION_ACTIONS_BY_FAMILY = {
  DEVELOPER_CANONICAL_LINK: [
    "LINK_EXISTING_CANONICAL",
    "CREATE_NEW_CANONICAL_CANDIDATE",
    "KEEP_UNKNOWN",
    "REJECT_SOURCE_IDENTITY",
    "DEFER",
  ],
  PROJECT_PROVINCE: [
    "ACCEPT_SOURCE_PROVINCE",
    "OVERRIDE_PROVINCE",
    "MARK_UNRESOLVED",
    "REQUEST_MORE_EVIDENCE",
    "DEFER",
  ],
  IMAGE_FAILURE: [
    "RETRY_FETCH",
    "MANUAL_UPLOAD_REQUIRED",
    "ACCEPT_NO_IMAGE",
    "REJECT_ASSET",
    "DEFER",
  ],
  PDF_LINKAGE: [
    "LINK_TO_EXISTING_PROJECT",
    "KEEP_UNLINKED",
    "REJECT_PDF",
    "MOVE_TO_OTHER_BATCH",
    "REQUEST_REVIEW",
    "DEFER",
  ],
  NEWS_METADATA: [
    "SET_PUBLISHED_DATE",
    "LINK_PROJECT",
    "LINK_DEVELOPER",
    "KEEP_UNLINKED",
    "REJECT_NEWS",
    "REQUEST_MORE_EVIDENCE",
    "DEFER",
  ],
} as const satisfies Record<DecisionFamily, readonly string[]>;

export type DecisionActionForFamily<F extends DecisionFamily> =
  (typeof DECISION_ACTIONS_BY_FAMILY)[F][number];

export type DecisionAction =
  (typeof DECISION_ACTIONS_BY_FAMILY)[DecisionFamily][number];

export const DECISION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPLIED",
  "REJECTED",
  "ROLLED_BACK",
] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const DECISION_RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type DecisionRiskLevel = (typeof DECISION_RISK_LEVELS)[number];

export const DECISION_TARGET_TYPES = [
  "DEVELOPER",
  "PROJECT",
  "ASSET",
  "PDF",
  "NEWS",
  "CONFLICT",
  "REVIEW_ITEM",
] as const;

export type DecisionTargetType = (typeof DECISION_TARGET_TYPES)[number];

export const DECISION_EVIDENCE_KINDS = [
  "URL",
  "NOTE",
  "HASH",
  "SCREENSHOT_REF",
  "SOURCE_PAYLOAD_PATH",
  "DNS_CHECK",
  "OFFICIAL_SITE",
  "MANUAL_UPLOAD_REF",
  "OTHER",
] as const;

export type DecisionEvidenceKind = (typeof DECISION_EVIDENCE_KINDS)[number];

/** App roles from permission matrix (Phase A — no Approval/Publish). */
export const REVIEW_DECISION_ROLES = [
  "REVIEW_VIEWER",
  "REVIEWER",
  "SENIOR_REVIEWER",
  "REVIEW_ADMIN",
  "SYSTEM_AUDITOR",
] as const;

export type ReviewDecisionRole = (typeof REVIEW_DECISION_ROLES)[number];

/** DB role mapping for RLS. */
export const REVIEW_DECISION_DB_ROLES = {
  REVIEW_VIEWER: "staging_review_viewer",
  REVIEWER: "staging_reviewer",
  SENIOR_REVIEWER: "staging_senior_reviewer",
  REVIEW_ADMIN: "staging_admin",
  SYSTEM_AUDITOR: "read_only_auditor",
} as const satisfies Record<ReviewDecisionRole, string>;

export type StagingReviewDecision = {
  id: string;
  import_session_id: string;
  source_batch_id: string;
  review_item_id: string;
  conflict_id: string | null;
  decision_family: DecisionFamily;
  decision_action: string;
  target_type: DecisionTargetType;
  target_id: string;
  status: DecisionStatus;
  risk_level: DecisionRiskLevel;
  payload_before: Record<string, unknown>;
  payload_after: Record<string, unknown>;
  reason: string | null;
  reject_reason: string | null;
  actor_id: string;
  actor_role: string;
  submitted_by: string | null;
  submitted_role: string | null;
  applied_by: string | null;
  applied_role: string | null;
  rolled_back_by: string | null;
  rolled_back_role: string | null;
  proposer_id: string | null;
  approver_id: string | null;
  version: number;
  review_item_version_at_apply: number | null;
  idempotency_key: string;
  content_hash: string;
  reverse_patch: Record<string, unknown> | null;
  rollback_of_decision_id: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  applied_at: string | null;
  rolled_back_at: string | null;
  rejected_at: string | null;
};

export type StagingReviewDecisionEvidence = {
  id: string;
  decision_id: string;
  evidence_kind: DecisionEvidenceKind;
  evidence_ref: string;
  evidence_json: Record<string, unknown>;
  actor_id: string;
  actor_role: string;
  created_at: string;
};

export type StagingReviewDecisionChange = {
  id: string;
  decision_id: string;
  change_seq: number;
  entity_table: string;
  entity_pk: string;
  field_name: string;
  value_before: unknown;
  value_after: unknown;
  created_at: string;
};

export type StagingReviewDecisionAudit = {
  id: string;
  decision_id: string;
  review_item_id: string;
  import_session_id: string;
  event_type: string;
  actor_type: AuditActorType;
  actor_id: string;
  actor_role: string;
  previous_status: string | null;
  next_status: string | null;
  reason: string | null;
  payload_hash: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

/** Input for Create Draft (repository skeleton — Phase A only). */
export type CreateDecisionDraftInput = {
  import_session_id: string;
  source_batch_id: string;
  review_item_id: string;
  conflict_id?: string | null;
  decision_family: DecisionFamily;
  decision_action: string;
  target_type: DecisionTargetType;
  target_id: string;
  risk_level: DecisionRiskLevel;
  payload_before?: Record<string, unknown>;
  payload_after?: Record<string, unknown>;
  reason?: string | null;
  actor_id: string;
  actor_role: string;
  proposer_id?: string | null;
  idempotency_key: string;
  content_hash: string;
};

export type ListDecisionsFilter = {
  import_session_id?: string;
  source_batch_id?: string;
  review_item_id?: string;
  status?: DecisionStatus | DecisionStatus[];
  decision_family?: DecisionFamily;
  limit?: number;
  offset?: number;
};
