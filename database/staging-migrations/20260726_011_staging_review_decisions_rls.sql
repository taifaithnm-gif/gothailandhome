-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION
-- Roles: REVIEW_VIEWER / REVIEWER / SENIOR_REVIEWER / REVIEW_ADMIN / SYSTEM_AUDITOR
-- No business-approval / publish / production-catalog grants
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

ALTER TABLE staging_review_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_review_decision_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_review_decision_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_review_decision_audit ENABLE ROW LEVEL SECURITY;

-- Dedicated decision roles (map to app roles in permission matrix).
-- staging_review_viewer  → REVIEW_VIEWER
-- staging_reviewer       → REVIEWER (existing)
-- staging_senior_reviewer → SENIOR_REVIEWER
-- staging_admin          → REVIEW_ADMIN (existing)
-- read_only_auditor      → SYSTEM_AUDITOR (existing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'staging_review_viewer') THEN
    CREATE ROLE staging_review_viewer NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'staging_reviewer') THEN
    CREATE ROLE staging_reviewer NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'staging_senior_reviewer') THEN
    CREATE ROLE staging_senior_reviewer NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'staging_admin') THEN
    CREATE ROLE staging_admin NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'read_only_auditor') THEN
    CREATE ROLE read_only_auditor NOINHERIT;
  END IF;
END
$$;

REVOKE ALL ON TABLE staging_review_decisions FROM PUBLIC;
REVOKE ALL ON TABLE staging_review_decision_evidence FROM PUBLIC;
REVOKE ALL ON TABLE staging_review_decision_changes FROM PUBLIC;
REVOKE ALL ON TABLE staging_review_decision_audit FROM PUBLIC;

-- REVIEW_VIEWER / SYSTEM_AUDITOR: SELECT only
GRANT SELECT ON TABLE staging_review_decisions TO staging_review_viewer;
GRANT SELECT ON TABLE staging_review_decision_evidence TO staging_review_viewer;
GRANT SELECT ON TABLE staging_review_decision_changes TO staging_review_viewer;
GRANT SELECT ON TABLE staging_review_decision_audit TO staging_review_viewer;

GRANT SELECT ON TABLE staging_review_decisions TO read_only_auditor;
GRANT SELECT ON TABLE staging_review_decision_evidence TO read_only_auditor;
GRANT SELECT ON TABLE staging_review_decision_changes TO read_only_auditor;
GRANT SELECT ON TABLE staging_review_decision_audit TO read_only_auditor;

-- REVIEWER: create draft + read; draft-only update; evidence insert; audit insert
GRANT SELECT, INSERT, UPDATE ON TABLE staging_review_decisions TO staging_reviewer;
GRANT SELECT, INSERT ON TABLE staging_review_decision_evidence TO staging_reviewer;
GRANT SELECT ON TABLE staging_review_decision_changes TO staging_reviewer;
GRANT SELECT, INSERT ON TABLE staging_review_decision_audit TO staging_reviewer;

-- SENIOR_REVIEWER: same table grants as reviewer (broader WITH CHECK below)
GRANT SELECT, INSERT, UPDATE ON TABLE staging_review_decisions TO staging_senior_reviewer;
GRANT SELECT, INSERT ON TABLE staging_review_decision_evidence TO staging_senior_reviewer;
GRANT SELECT ON TABLE staging_review_decision_changes TO staging_senior_reviewer;
GRANT SELECT, INSERT ON TABLE staging_review_decision_audit TO staging_senior_reviewer;

-- REVIEW_ADMIN: operational decision admin (still no production-catalog / publish)
GRANT SELECT, INSERT, UPDATE ON TABLE staging_review_decisions TO staging_admin;
GRANT SELECT, INSERT ON TABLE staging_review_decision_evidence TO staging_admin;
GRANT SELECT, INSERT ON TABLE staging_review_decision_changes TO staging_admin;
GRANT SELECT, INSERT ON TABLE staging_review_decision_audit TO staging_admin;

-- Never grant delete privilege on evidence / changes / audit
-- Never grant to anon / authenticated / public

-- ========== SELECT policies ==========
CREATE POLICY decision_select_viewer ON staging_review_decisions
  FOR SELECT TO staging_review_viewer USING (true);

CREATE POLICY decision_select_auditor ON staging_review_decisions
  FOR SELECT TO read_only_auditor USING (true);

CREATE POLICY decision_select_reviewer ON staging_review_decisions
  FOR SELECT TO staging_reviewer USING (true);

CREATE POLICY decision_select_senior ON staging_review_decisions
  FOR SELECT TO staging_senior_reviewer USING (true);

CREATE POLICY decision_select_admin ON staging_review_decisions
  FOR SELECT TO staging_admin USING (true);

-- ========== INSERT (draft only for reviewer roles) ==========
CREATE POLICY decision_insert_reviewer ON staging_review_decisions
  FOR INSERT TO staging_reviewer
  WITH CHECK (status = 'DRAFT');

CREATE POLICY decision_insert_senior ON staging_review_decisions
  FOR INSERT TO staging_senior_reviewer
  WITH CHECK (status = 'DRAFT');

CREATE POLICY decision_insert_admin ON staging_review_decisions
  FOR INSERT TO staging_admin
  WITH CHECK (status = 'DRAFT');

-- ========== UPDATE ==========
-- Phase A: reviewer may mutate DRAFT rows (payload/reason); status may stay DRAFT
-- or move to SUBMITTED only via future Decision Service. Decision statuses never
-- include business-approval or publish states.
CREATE POLICY decision_update_reviewer_draft ON staging_review_decisions
  FOR UPDATE TO staging_reviewer
  USING (status = 'DRAFT')
  WITH CHECK (status IN ('DRAFT', 'SUBMITTED'));

CREATE POLICY decision_update_senior ON staging_review_decisions
  FOR UPDATE TO staging_senior_reviewer
  USING (status IN ('DRAFT', 'SUBMITTED'))
  WITH CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPLIED', 'REJECTED'));

CREATE POLICY decision_update_admin ON staging_review_decisions
  FOR UPDATE TO staging_admin
  USING (true)
  WITH CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPLIED', 'REJECTED', 'ROLLED_BACK'));

-- ========== Evidence ==========
CREATE POLICY evidence_select_viewer ON staging_review_decision_evidence
  FOR SELECT TO staging_review_viewer USING (true);

CREATE POLICY evidence_select_auditor ON staging_review_decision_evidence
  FOR SELECT TO read_only_auditor USING (true);

CREATE POLICY evidence_select_reviewer ON staging_review_decision_evidence
  FOR SELECT TO staging_reviewer USING (true);

CREATE POLICY evidence_select_senior ON staging_review_decision_evidence
  FOR SELECT TO staging_senior_reviewer USING (true);

CREATE POLICY evidence_select_admin ON staging_review_decision_evidence
  FOR SELECT TO staging_admin USING (true);

CREATE POLICY evidence_insert_reviewer ON staging_review_decision_evidence
  FOR INSERT TO staging_reviewer WITH CHECK (true);

CREATE POLICY evidence_insert_senior ON staging_review_decision_evidence
  FOR INSERT TO staging_senior_reviewer WITH CHECK (true);

CREATE POLICY evidence_insert_admin ON staging_review_decision_evidence
  FOR INSERT TO staging_admin WITH CHECK (true);

-- ========== Changes (insert on apply — admin / senior only; Phase A service not mounted) ==========
CREATE POLICY changes_select_viewer ON staging_review_decision_changes
  FOR SELECT TO staging_review_viewer USING (true);

CREATE POLICY changes_select_auditor ON staging_review_decision_changes
  FOR SELECT TO read_only_auditor USING (true);

CREATE POLICY changes_select_reviewer ON staging_review_decision_changes
  FOR SELECT TO staging_reviewer USING (true);

CREATE POLICY changes_select_senior ON staging_review_decision_changes
  FOR SELECT TO staging_senior_reviewer USING (true);

CREATE POLICY changes_select_admin ON staging_review_decision_changes
  FOR SELECT TO staging_admin USING (true);

CREATE POLICY changes_insert_senior ON staging_review_decision_changes
  FOR INSERT TO staging_senior_reviewer WITH CHECK (true);

CREATE POLICY changes_insert_admin ON staging_review_decision_changes
  FOR INSERT TO staging_admin WITH CHECK (true);

-- ========== Decision audit (append-only) ==========
CREATE POLICY decision_audit_select_viewer ON staging_review_decision_audit
  FOR SELECT TO staging_review_viewer USING (true);

CREATE POLICY decision_audit_select_auditor ON staging_review_decision_audit
  FOR SELECT TO read_only_auditor USING (true);

CREATE POLICY decision_audit_select_reviewer ON staging_review_decision_audit
  FOR SELECT TO staging_reviewer USING (true);

CREATE POLICY decision_audit_select_senior ON staging_review_decision_audit
  FOR SELECT TO staging_senior_reviewer USING (true);

CREATE POLICY decision_audit_select_admin ON staging_review_decision_audit
  FOR SELECT TO staging_admin USING (true);

CREATE POLICY decision_audit_insert_reviewer ON staging_review_decision_audit
  FOR INSERT TO staging_reviewer WITH CHECK (true);

CREATE POLICY decision_audit_insert_senior ON staging_review_decision_audit
  FOR INSERT TO staging_senior_reviewer WITH CHECK (true);

CREATE POLICY decision_audit_insert_admin ON staging_review_decision_audit
  FOR INSERT TO staging_admin WITH CHECK (true);

-- Anonymous / public: no policies → deny by default with RLS enabled
-- No policies granting business-approval or publish writes
