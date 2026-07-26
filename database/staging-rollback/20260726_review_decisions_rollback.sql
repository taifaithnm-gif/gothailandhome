-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION
-- Rollback for 20260726_010 / 011 / 012 (decision tables + RLS + triggers)
-- NOT part of EXPECTED_STAGING_MIGRATIONS forward train.
-- Apply only with --confirm-staging on Staging. Never Production.
-- Drops are intentional and scoped to Phase A decision objects only.

DROP TRIGGER IF EXISTS trg_staging_decision_audit_no_delete ON staging_review_decision_audit;
DROP TRIGGER IF EXISTS trg_staging_decision_audit_no_update ON staging_review_decision_audit;
DROP TRIGGER IF EXISTS trg_staging_decision_changes_no_delete ON staging_review_decision_changes;
DROP TRIGGER IF EXISTS trg_staging_decision_changes_no_update ON staging_review_decision_changes;
DROP TRIGGER IF EXISTS trg_staging_decision_evidence_no_delete ON staging_review_decision_evidence;
DROP TRIGGER IF EXISTS trg_staging_decision_evidence_no_update ON staging_review_decision_evidence;
DROP TRIGGER IF EXISTS trg_staging_review_decisions_immutable ON staging_review_decisions;

DROP FUNCTION IF EXISTS staging_forbid_decision_child_mutation();
DROP FUNCTION IF EXISTS staging_forbid_decision_immutable_mutation();

DROP TABLE IF EXISTS staging_review_decision_audit;
DROP TABLE IF EXISTS staging_review_decision_changes;
DROP TABLE IF EXISTS staging_review_decision_evidence;
DROP TABLE IF EXISTS staging_review_decisions;

-- Roles staging_review_viewer / staging_senior_reviewer may remain (shared);
-- revoke table grants are implicit after DROP TABLE.
-- Do NOT drop staging_reviewer / staging_admin / read_only_auditor (pre-existing).

DELETE FROM staging_schema_migrations
 WHERE filename IN (
   '20260726_010_staging_review_decisions.sql',
   '20260726_011_staging_review_decisions_rls.sql',
   '20260726_012_staging_review_decisions_constraints.sql'
 );
