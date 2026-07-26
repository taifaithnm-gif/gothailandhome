-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: STAGING_DB_COMMIT_IMPLEMENTATION_V1
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

CREATE TABLE IF NOT EXISTS staging_review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_session_id TEXT NOT NULL REFERENCES staging_import_sessions(import_session_id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  source_review_item_id TEXT NOT NULL,
  source_reason TEXT NOT NULL,
  mapped_reason TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high')),
  review_state TEXT NOT NULL CHECK (review_state IN (
    'RECEIVED','VALIDATED','REVIEW_REQUIRED','CONFLICT','DUPLICATE',
    'READY_FOR_APPROVAL','REJECTED','QUARANTINED'
  )),
  suggested_action TEXT NOT NULL,
  blocking BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  reviewer_id TEXT,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  decision TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source_batch_id TEXT NOT NULL,
  source_job_id TEXT NOT NULL
);
