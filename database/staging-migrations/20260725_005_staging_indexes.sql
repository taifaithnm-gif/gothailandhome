-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: STAGING_DB_COMMIT_IMPLEMENTATION_V1
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_developers_idemp
  ON staging_developers (idempotency_key) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_projects_idemp
  ON staging_projects (idempotency_key) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_assets_idemp
  ON staging_assets (idempotency_key) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_pdfs_idemp
  ON staging_pdfs (idempotency_key) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_news_idemp
  ON staging_news (idempotency_key) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_review_idemp
  ON staging_review_items (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_staging_developers_session ON staging_developers (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_projects_session ON staging_projects (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_assets_session ON staging_assets (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_review_session ON staging_review_items (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_audit_session ON staging_audit_events (import_session_id);
