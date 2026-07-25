-- DESIGN DRAFT ONLY
-- DO NOT EXECUTE
-- NO PRODUCTION MIGRATION

-- Roles (design): staging_importer, staging_reviewer, staging_admin, read_only_auditor
-- No anonymous public access.

-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- Policies below are design sketches.

-- staging_importer: insert sessions + entities; no approve/publish
-- CREATE POLICY staging_importer_insert_sessions ON staging_import_sessions
--   FOR INSERT TO staging_importer WITH CHECK (staging_only = TRUE AND production_allowed = FALSE);

-- CREATE POLICY staging_importer_insert_entities ON staging_developers
--   FOR INSERT TO staging_importer WITH CHECK (true);

-- staging_reviewer: read + update reviewer notes / allowed review_state transitions
-- CREATE POLICY staging_reviewer_select ON staging_developers
--   FOR SELECT TO staging_reviewer USING (true);
-- CREATE POLICY staging_reviewer_update_notes ON staging_developers
--   FOR UPDATE TO staging_reviewer
--   USING (true)
--   WITH CHECK (review_state IN (
--     'RECEIVED','VALIDATED','REVIEW_REQUIRED','CONFLICT','DUPLICATE',
--     'READY_FOR_APPROVAL','REJECTED','QUARANTINED'
--   ));

-- staging_admin: manage staging only (no production table grants by default)

-- read_only_auditor: SELECT on staging_audit_events + reports views; no write

-- Explicit denies:
-- - No GRANT to anon / authenticated for staging_* tables
-- - No policy allowing APPROVED / PUBLISHED transitions from importer
-- - No policy granting access to public.developers / public.property_projects

COMMENT ON SCHEMA public IS
  'DESIGN DRAFT ONLY — Staging RLS policies must be reviewed before any apply.';
