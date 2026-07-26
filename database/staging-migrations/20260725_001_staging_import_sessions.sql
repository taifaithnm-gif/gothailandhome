-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: STAGING_DB_COMMIT_IMPLEMENTATION_V1
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

CREATE TABLE IF NOT EXISTS staging_import_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_session_id TEXT NOT NULL UNIQUE,
  source_batch_id TEXT NOT NULL,
  source_job_id TEXT NOT NULL,
  source_schema_version TEXT NOT NULL,
  sealed_zip_sha256 TEXT,
  raw_zip_sha256 TEXT,
  source_file_name TEXT,
  source_file_size BIGINT,
  status TEXT NOT NULL CHECK (status IN (
    'RECEIVED','VERIFIED','NORMALIZED','VALIDATED','REVIEW_MAPPED',
    'READY_FOR_COMMIT','COMMITTING','COMMITTED','PARTIAL_FAILURE',
    'FAILED','ROLLED_BACK','CANCELLED'
  )),
  phase TEXT NOT NULL,
  dry_run BOOLEAN NOT NULL DEFAULT FALSE,
  staging_only BOOLEAN NOT NULL DEFAULT TRUE,
  production_allowed BOOLEAN NOT NULL DEFAULT FALSE CHECK (production_allowed = FALSE),
  database_write_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  storage_write_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  idempotency_key TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb
);
