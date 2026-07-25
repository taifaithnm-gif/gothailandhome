-- DESIGN DRAFT ONLY
-- DO NOT EXECUTE
-- NO PRODUCTION MIGRATION

-- Constraints beyond column CHECKs

-- Idempotency uniqueness is partial (active rows) — see 005_staging_indexes.sql

ALTER TABLE staging_developers
  ADD CONSTRAINT staging_developers_candidate_not_dev_unknown
  CHECK (candidate_id <> 'dev-unknown');

ALTER TABLE staging_news
  ADD CONSTRAINT staging_news_no_published_review_state
  CHECK (review_state <> 'PUBLISHED');

ALTER TABLE staging_assets
  ADD CONSTRAINT staging_assets_storage_path_relative
  CHECK (
    storage_target_path IS NULL
    OR (
      storage_target_path NOT LIKE '/%'
      AND storage_target_path NOT LIKE '%..%'
    )
  );

ALTER TABLE staging_pdfs
  ADD CONSTRAINT staging_pdfs_storage_path_relative
  CHECK (
    storage_target_path IS NULL
    OR (
      storage_target_path NOT LIKE '/%'
      AND storage_target_path NOT LIKE '%..%'
    )
  );

ALTER TABLE staging_import_sessions
  ADD CONSTRAINT staging_sessions_staging_only_true
  CHECK (staging_only = TRUE);

ALTER TABLE staging_import_sessions
  ADD CONSTRAINT staging_sessions_production_allowed_false_default
  CHECK (production_allowed = FALSE OR status IN ('COMMITTED','READY_FOR_COMMIT'));
-- Note: production_allowed must remain FALSE until a future explicit milestone.
