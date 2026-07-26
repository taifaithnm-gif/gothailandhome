-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: STAGING_DB_COMMIT_IMPLEMENTATION_V1
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

ALTER TABLE staging_import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_duplicate_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_conflict_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_audit_events ENABLE ROW LEVEL SECURITY;

-- Staging role boundary (Owner creates roles in Staging project only).
-- staging_importer: session + entity + review insert; no approve/publish
-- staging_reviewer: read entities; notes + allowed review transitions; no source payload mutation; no publish
-- staging_admin: operational staging admin (still no Production access)
-- read_only_auditor: SELECT only; no writes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'staging_importer') THEN
    CREATE ROLE staging_importer NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'staging_reviewer') THEN
    CREATE ROLE staging_reviewer NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'staging_admin') THEN
    CREATE ROLE staging_admin NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'read_only_auditor') THEN
    CREATE ROLE read_only_auditor NOINHERIT;
  END IF;
END
$$;

REVOKE ALL ON TABLE staging_import_sessions FROM PUBLIC;
REVOKE ALL ON TABLE staging_developers FROM PUBLIC;
REVOKE ALL ON TABLE staging_projects FROM PUBLIC;
REVOKE ALL ON TABLE staging_assets FROM PUBLIC;
REVOKE ALL ON TABLE staging_pdfs FROM PUBLIC;
REVOKE ALL ON TABLE staging_news FROM PUBLIC;
REVOKE ALL ON TABLE staging_review_items FROM PUBLIC;
REVOKE ALL ON TABLE staging_duplicate_candidates FROM PUBLIC;
REVOKE ALL ON TABLE staging_conflict_candidates FROM PUBLIC;
REVOKE ALL ON TABLE staging_audit_events FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON TABLE staging_import_sessions TO staging_importer;
GRANT SELECT, INSERT, UPDATE ON TABLE staging_developers TO staging_importer;
GRANT SELECT, INSERT, UPDATE ON TABLE staging_projects TO staging_importer;
GRANT SELECT, INSERT, UPDATE ON TABLE staging_assets TO staging_importer;
GRANT SELECT, INSERT, UPDATE ON TABLE staging_pdfs TO staging_importer;
GRANT SELECT, INSERT, UPDATE ON TABLE staging_news TO staging_importer;
GRANT SELECT, INSERT, UPDATE ON TABLE staging_review_items TO staging_importer;
GRANT SELECT, INSERT ON TABLE staging_conflict_candidates TO staging_importer;
GRANT SELECT, INSERT ON TABLE staging_audit_events TO staging_importer;

GRANT SELECT ON TABLE staging_import_sessions TO staging_reviewer;
GRANT SELECT ON TABLE staging_developers TO staging_reviewer;
GRANT SELECT ON TABLE staging_projects TO staging_reviewer;
GRANT SELECT ON TABLE staging_assets TO staging_reviewer;
GRANT SELECT ON TABLE staging_pdfs TO staging_reviewer;
GRANT SELECT ON TABLE staging_news TO staging_reviewer;
GRANT SELECT, UPDATE ON TABLE staging_review_items TO staging_reviewer;
GRANT SELECT, INSERT ON TABLE staging_audit_events TO staging_reviewer;

GRANT SELECT ON TABLE staging_import_sessions TO staging_admin;
GRANT SELECT ON TABLE staging_developers TO staging_admin;
GRANT SELECT ON TABLE staging_projects TO staging_admin;
GRANT SELECT ON TABLE staging_review_items TO staging_admin;
GRANT SELECT ON TABLE staging_audit_events TO staging_admin;

GRANT SELECT ON TABLE staging_import_sessions TO read_only_auditor;
GRANT SELECT ON TABLE staging_developers TO read_only_auditor;
GRANT SELECT ON TABLE staging_projects TO read_only_auditor;
GRANT SELECT ON TABLE staging_assets TO read_only_auditor;
GRANT SELECT ON TABLE staging_pdfs TO read_only_auditor;
GRANT SELECT ON TABLE staging_news TO read_only_auditor;
GRANT SELECT ON TABLE staging_review_items TO read_only_auditor;
GRANT SELECT ON TABLE staging_audit_events TO read_only_auditor;

-- Importer may insert/update staging entities; cannot set forbidden review states.
CREATE POLICY staging_importer_session_write ON staging_import_sessions
  FOR ALL TO staging_importer
  USING (true)
  WITH CHECK (true);

CREATE POLICY staging_importer_developer_write ON staging_developers
  FOR ALL TO staging_importer
  USING (true)
  WITH CHECK (true);

CREATE POLICY staging_importer_project_write ON staging_projects
  FOR ALL TO staging_importer
  USING (true)
  WITH CHECK (true);

CREATE POLICY staging_importer_asset_write ON staging_assets
  FOR ALL TO staging_importer
  USING (true)
  WITH CHECK (true);

CREATE POLICY staging_importer_pdf_write ON staging_pdfs
  FOR ALL TO staging_importer
  USING (true)
  WITH CHECK (true);

CREATE POLICY staging_importer_news_write ON staging_news
  FOR ALL TO staging_importer
  USING (true)
  WITH CHECK (true);

CREATE POLICY staging_importer_review_write ON staging_review_items
  FOR ALL TO staging_importer
  USING (true)
  WITH CHECK (
    review_state NOT IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED')
  );

CREATE POLICY staging_importer_conflict_write ON staging_conflict_candidates
  FOR INSERT TO staging_importer
  WITH CHECK (true);

CREATE POLICY staging_importer_audit_append ON staging_audit_events
  FOR INSERT TO staging_importer
  WITH CHECK (true);

-- Reviewer: read + note/state updates within allowed states; no source payload mutation
-- (source_payload column updates blocked by trigger in constraints migration).
CREATE POLICY staging_reviewer_read_sessions ON staging_import_sessions
  FOR SELECT TO staging_reviewer
  USING (true);

CREATE POLICY staging_reviewer_read_developers ON staging_developers
  FOR SELECT TO staging_reviewer
  USING (true);

CREATE POLICY staging_reviewer_read_projects ON staging_projects
  FOR SELECT TO staging_reviewer
  USING (true);

CREATE POLICY staging_reviewer_review_update ON staging_review_items
  FOR UPDATE TO staging_reviewer
  USING (review_state NOT IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED', 'ROLLED_BACK'))
  WITH CHECK (
    review_state NOT IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED')
  );

CREATE POLICY staging_reviewer_review_select ON staging_review_items
  FOR SELECT TO staging_reviewer
  USING (true);

CREATE POLICY staging_reviewer_audit_append ON staging_audit_events
  FOR INSERT TO staging_reviewer
  WITH CHECK (true);

-- Auditor: SELECT only
CREATE POLICY staging_auditor_sessions ON staging_import_sessions
  FOR SELECT TO read_only_auditor
  USING (true);

CREATE POLICY staging_auditor_developers ON staging_developers
  FOR SELECT TO read_only_auditor
  USING (true);

CREATE POLICY staging_auditor_projects ON staging_projects
  FOR SELECT TO read_only_auditor
  USING (true);

CREATE POLICY staging_auditor_assets ON staging_assets
  FOR SELECT TO read_only_auditor
  USING (true);

CREATE POLICY staging_auditor_pdfs ON staging_pdfs
  FOR SELECT TO read_only_auditor
  USING (true);

CREATE POLICY staging_auditor_news ON staging_news
  FOR SELECT TO read_only_auditor
  USING (true);

CREATE POLICY staging_auditor_review ON staging_review_items
  FOR SELECT TO read_only_auditor
  USING (true);

CREATE POLICY staging_auditor_audit ON staging_audit_events
  FOR SELECT TO read_only_auditor
  USING (true);

-- Anonymous / PUBLIC: no policies → deny by default with RLS enabled
-- service_role: reserved for controlled CLI; not granted via PUBLIC
