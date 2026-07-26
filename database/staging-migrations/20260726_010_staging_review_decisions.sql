-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION
-- Additive schema only — no migration of existing Batch001 rows
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

CREATE TABLE IF NOT EXISTS staging_review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_session_id TEXT NOT NULL
    REFERENCES staging_import_sessions(import_session_id),
  source_batch_id TEXT NOT NULL,
  review_item_id UUID NOT NULL
    REFERENCES staging_review_items(id),
  conflict_id UUID NULL
    REFERENCES staging_conflict_candidates(id),

  decision_family TEXT NOT NULL CHECK (decision_family IN (
    'DEVELOPER_CANONICAL_LINK',
    'PROJECT_PROVINCE',
    'IMAGE_FAILURE',
    'PDF_LINKAGE',
    'NEWS_METADATA'
  )),
  decision_action TEXT NOT NULL,

  target_type TEXT NOT NULL CHECK (target_type IN (
    'DEVELOPER','PROJECT','ASSET','PDF','NEWS','CONFLICT','REVIEW_ITEM'
  )),
  target_id TEXT NOT NULL,

  status TEXT NOT NULL CHECK (status IN (
    'DRAFT','SUBMITTED','APPLIED','REJECTED','ROLLED_BACK'
  )),
  risk_level TEXT NOT NULL CHECK (risk_level IN (
    'LOW','MEDIUM','HIGH','CRITICAL'
  )),

  payload_before JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload_after JSONB NOT NULL DEFAULT '{}'::jsonb,

  reason TEXT,
  reject_reason TEXT,

  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  submitted_by TEXT,
  submitted_role TEXT,
  applied_by TEXT,
  applied_role TEXT,
  rolled_back_by TEXT,
  rolled_back_role TEXT,

  proposer_id TEXT,
  approver_id TEXT,

  version INTEGER NOT NULL DEFAULT 1,
  review_item_version_at_apply INTEGER,

  idempotency_key TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  reverse_patch JSONB,
  rollback_of_decision_id UUID REFERENCES staging_review_decisions(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- Single active decision per review item
CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_decision_active_item
  ON staging_review_decisions (review_item_id)
  WHERE status IN ('DRAFT','SUBMITTED');

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_decision_idempotency
  ON staging_review_decisions (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_staging_decisions_batch_status
  ON staging_review_decisions (source_batch_id, status);

CREATE INDEX IF NOT EXISTS idx_staging_decisions_target
  ON staging_review_decisions (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_staging_decisions_session
  ON staging_review_decisions (import_session_id);

CREATE INDEX IF NOT EXISTS idx_staging_decisions_review_item
  ON staging_review_decisions (review_item_id);


CREATE TABLE IF NOT EXISTS staging_review_decision_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL
    REFERENCES staging_review_decisions(id),
  evidence_kind TEXT NOT NULL CHECK (evidence_kind IN (
    'URL','NOTE','HASH','SCREENSHOT_REF','SOURCE_PAYLOAD_PATH',
    'DNS_CHECK','OFFICIAL_SITE','MANUAL_UPLOAD_REF','OTHER'
  )),
  evidence_ref TEXT NOT NULL,
  evidence_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (decision_id, evidence_kind, evidence_ref)
);

CREATE INDEX IF NOT EXISTS idx_staging_decision_evidence_decision
  ON staging_review_decision_evidence (decision_id);


CREATE TABLE IF NOT EXISTS staging_review_decision_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL
    REFERENCES staging_review_decisions(id),
  change_seq INTEGER NOT NULL,
  entity_table TEXT NOT NULL,
  entity_pk TEXT NOT NULL,
  field_name TEXT NOT NULL,
  value_before JSONB,
  value_after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (decision_id, change_seq),
  UNIQUE (decision_id, entity_table, entity_pk, field_name)
);

CREATE INDEX IF NOT EXISTS idx_staging_decision_changes_decision
  ON staging_review_decision_changes (decision_id, change_seq);


CREATE TABLE IF NOT EXISTS staging_review_decision_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL
    REFERENCES staging_review_decisions(id),
  review_item_id UUID NOT NULL,
  import_session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN (
    'SYSTEM','IMPORTER','REVIEWER','ADMIN'
  )),
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  previous_status TEXT,
  next_status TEXT,
  reason TEXT,
  payload_hash TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staging_decision_audit_decision
  ON staging_review_decision_audit (decision_id, created_at);
