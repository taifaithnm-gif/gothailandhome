-- DESIGN DRAFT ONLY
-- DO NOT EXECUTE
-- NO PRODUCTION MIGRATION

-- Indexes for staging import tables. Avoid unbounded full-text indexes.

CREATE INDEX IF NOT EXISTS idx_staging_sessions_batch
  ON staging_import_sessions (source_batch_id);
CREATE INDEX IF NOT EXISTS idx_staging_sessions_job
  ON staging_import_sessions (source_job_id);
CREATE INDEX IF NOT EXISTS idx_staging_sessions_status
  ON staging_import_sessions (status);
CREATE INDEX IF NOT EXISTS idx_staging_sessions_created
  ON staging_import_sessions (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_developers_idemp
  ON staging_developers (idempotency_key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staging_developers_session
  ON staging_developers (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_developers_batch
  ON staging_developers (source_batch_id);
CREATE INDEX IF NOT EXISTS idx_staging_developers_job
  ON staging_developers (source_job_id);
CREATE INDEX IF NOT EXISTS idx_staging_developers_source_record
  ON staging_developers (source_record_id);
CREATE INDEX IF NOT EXISTS idx_staging_developers_content_hash
  ON staging_developers (content_hash);
CREATE INDEX IF NOT EXISTS idx_staging_developers_review_state
  ON staging_developers (review_state);
CREATE INDEX IF NOT EXISTS idx_staging_developers_entity_status
  ON staging_developers (entity_status);
CREATE INDEX IF NOT EXISTS idx_staging_developers_normalized_name
  ON staging_developers (normalized_name);
CREATE INDEX IF NOT EXISTS idx_staging_developers_dup_group
  ON staging_developers (duplicate_group_id);
CREATE INDEX IF NOT EXISTS idx_staging_developers_created
  ON staging_developers (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_projects_idemp
  ON staging_projects (idempotency_key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staging_projects_session ON staging_projects (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_projects_batch ON staging_projects (source_batch_id);
CREATE INDEX IF NOT EXISTS idx_staging_projects_job ON staging_projects (source_job_id);
CREATE INDEX IF NOT EXISTS idx_staging_projects_source_record ON staging_projects (source_record_id);
CREATE INDEX IF NOT EXISTS idx_staging_projects_content_hash ON staging_projects (content_hash);
CREATE INDEX IF NOT EXISTS idx_staging_projects_review_state ON staging_projects (review_state);
CREATE INDEX IF NOT EXISTS idx_staging_projects_entity_status ON staging_projects (entity_status);
CREATE INDEX IF NOT EXISTS idx_staging_projects_normalized_name ON staging_projects (normalized_name);
CREATE INDEX IF NOT EXISTS idx_staging_projects_dup_group ON staging_projects (duplicate_group_id);
CREATE INDEX IF NOT EXISTS idx_staging_projects_created ON staging_projects (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_assets_idemp
  ON staging_assets (idempotency_key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staging_assets_session ON staging_assets (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_assets_batch ON staging_assets (source_batch_id);
CREATE INDEX IF NOT EXISTS idx_staging_assets_job ON staging_assets (source_job_id);
CREATE INDEX IF NOT EXISTS idx_staging_assets_source_record ON staging_assets (source_record_id);
CREATE INDEX IF NOT EXISTS idx_staging_assets_content_hash ON staging_assets (content_hash);
CREATE INDEX IF NOT EXISTS idx_staging_assets_sha256 ON staging_assets (sha256);
CREATE INDEX IF NOT EXISTS idx_staging_assets_source_url ON staging_assets (source_url);
CREATE INDEX IF NOT EXISTS idx_staging_assets_review_state ON staging_assets (review_state);
CREATE INDEX IF NOT EXISTS idx_staging_assets_entity_status ON staging_assets (entity_status);
CREATE INDEX IF NOT EXISTS idx_staging_assets_dup_group ON staging_assets (duplicate_group_id);
CREATE INDEX IF NOT EXISTS idx_staging_assets_created ON staging_assets (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_pdfs_idemp
  ON staging_pdfs (idempotency_key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_session ON staging_pdfs (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_batch ON staging_pdfs (source_batch_id);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_job ON staging_pdfs (source_job_id);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_source_record ON staging_pdfs (source_record_id);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_content_hash ON staging_pdfs (content_hash);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_sha256 ON staging_pdfs (sha256);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_source_url ON staging_pdfs (source_url);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_review_state ON staging_pdfs (review_state);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_entity_status ON staging_pdfs (entity_status);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_dup_group ON staging_pdfs (duplicate_group_id);
CREATE INDEX IF NOT EXISTS idx_staging_pdfs_created ON staging_pdfs (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_news_idemp
  ON staging_news (idempotency_key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staging_news_session ON staging_news (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_news_batch ON staging_news (source_batch_id);
CREATE INDEX IF NOT EXISTS idx_staging_news_job ON staging_news (source_job_id);
CREATE INDEX IF NOT EXISTS idx_staging_news_source_record ON staging_news (source_record_id);
CREATE INDEX IF NOT EXISTS idx_staging_news_content_hash ON staging_news (content_hash);
CREATE INDEX IF NOT EXISTS idx_staging_news_source_url ON staging_news (source_url);
CREATE INDEX IF NOT EXISTS idx_staging_news_review_state ON staging_news (review_state);
CREATE INDEX IF NOT EXISTS idx_staging_news_entity_status ON staging_news (entity_status);
CREATE INDEX IF NOT EXISTS idx_staging_news_dup_group ON staging_news (duplicate_group_id);
CREATE INDEX IF NOT EXISTS idx_staging_news_created ON staging_news (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_review_idemp
  ON staging_review_items (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_staging_review_session ON staging_review_items (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_review_batch ON staging_review_items (source_batch_id);
CREATE INDEX IF NOT EXISTS idx_staging_review_job ON staging_review_items (source_job_id);
CREATE INDEX IF NOT EXISTS idx_staging_review_state ON staging_review_items (review_state);
CREATE INDEX IF NOT EXISTS idx_staging_review_created ON staging_review_items (created_at);

CREATE INDEX IF NOT EXISTS idx_staging_audit_session ON staging_audit_events (import_session_id);
CREATE INDEX IF NOT EXISTS idx_staging_audit_created ON staging_audit_events (created_at);
CREATE INDEX IF NOT EXISTS idx_staging_audit_event_type ON staging_audit_events (event_type);

-- Fuzzy name matching: application-layer / future trigram extension — NOT enabled here.
-- Do NOT enable database extensions such as pg_trgm in this design draft.
