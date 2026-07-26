-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: STAGING_DB_COMMIT_IMPLEMENTATION_V1
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

CREATE TABLE IF NOT EXISTS staging_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('SYSTEM','IMPORTER','REVIEWER','ADMIN')),
  actor_id TEXT NOT NULL,
  previous_state TEXT,
  next_state TEXT,
  reason TEXT,
  payload_hash TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- append-only: no updated_at / deleted_at
