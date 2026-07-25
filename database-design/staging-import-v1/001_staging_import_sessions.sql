-- DESIGN DRAFT ONLY
-- DO NOT EXECUTE
-- NO PRODUCTION MIGRATION
-- Milestone: STAGING_DB_COMMIT_DESIGN_V1
-- This file must NOT be registered under supabase/migrations/

-- staging_import_sessions
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
  dry_run BOOLEAN NOT NULL DEFAULT TRUE,
  staging_only BOOLEAN NOT NULL DEFAULT TRUE,
  production_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  database_write_allowed BOOLEAN NOT NULL DEFAULT FALSE,
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

COMMENT ON TABLE staging_import_sessions IS
  'DESIGN DRAFT ONLY — Staging import session ledger. Do not execute against Production.';
