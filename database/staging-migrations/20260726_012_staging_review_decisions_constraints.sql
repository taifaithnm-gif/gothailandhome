-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION
-- Immutability triggers for decision tables
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

-- Reject UPDATE that mutates immutable decision columns.
CREATE OR REPLACE FUNCTION staging_forbid_decision_immutable_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'GTH_DECISION_ID_IMMUTABLE';
    END IF;
    IF NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key THEN
      RAISE EXCEPTION 'GTH_DECISION_IDEMPOTENCY_KEY_IMMUTABLE';
    END IF;
    IF NEW.content_hash IS DISTINCT FROM OLD.content_hash THEN
      RAISE EXCEPTION 'GTH_DECISION_CONTENT_HASH_IMMUTABLE';
    END IF;
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'GTH_DECISION_CREATED_AT_IMMUTABLE';
    END IF;
    IF NEW.import_session_id IS DISTINCT FROM OLD.import_session_id THEN
      RAISE EXCEPTION 'GTH_DECISION_SESSION_IMMUTABLE';
    END IF;
    IF NEW.review_item_id IS DISTINCT FROM OLD.review_item_id THEN
      RAISE EXCEPTION 'GTH_DECISION_REVIEW_ITEM_IMMUTABLE';
    END IF;
    IF NEW.source_batch_id IS DISTINCT FROM OLD.source_batch_id THEN
      RAISE EXCEPTION 'GTH_DECISION_BATCH_IMMUTABLE';
    END IF;
    IF NEW.decision_family IS DISTINCT FROM OLD.decision_family THEN
      RAISE EXCEPTION 'GTH_DECISION_FAMILY_IMMUTABLE';
    END IF;
    IF NEW.actor_id IS DISTINCT FROM OLD.actor_id THEN
      RAISE EXCEPTION 'GTH_DECISION_ACTOR_IMMUTABLE';
    END IF;

    -- payload_before frozen after leave DRAFT
    IF OLD.status IS DISTINCT FROM 'DRAFT'
       AND NEW.payload_before IS DISTINCT FROM OLD.payload_before THEN
      RAISE EXCEPTION 'GTH_DECISION_PAYLOAD_BEFORE_IMMUTABLE';
    END IF;

    -- payload_after frozen after SUBMITTED+
    IF OLD.status IS DISTINCT FROM 'DRAFT'
       AND NEW.payload_after IS DISTINCT FROM OLD.payload_after THEN
      RAISE EXCEPTION 'GTH_DECISION_PAYLOAD_AFTER_IMMUTABLE';
    END IF;

    -- reverse_patch written once; never cleared/changed after set
    IF OLD.reverse_patch IS NOT NULL
       AND NEW.reverse_patch IS DISTINCT FROM OLD.reverse_patch THEN
      RAISE EXCEPTION 'GTH_DECISION_REVERSE_PATCH_IMMUTABLE';
    END IF;

    -- timestamps set once
    IF OLD.submitted_at IS NOT NULL
       AND NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'GTH_DECISION_SUBMITTED_AT_IMMUTABLE';
    END IF;
    IF OLD.applied_at IS NOT NULL
       AND NEW.applied_at IS DISTINCT FROM OLD.applied_at THEN
      RAISE EXCEPTION 'GTH_DECISION_APPLIED_AT_IMMUTABLE';
    END IF;
    IF OLD.rolled_back_at IS NOT NULL
       AND NEW.rolled_back_at IS DISTINCT FROM OLD.rolled_back_at THEN
      RAISE EXCEPTION 'GTH_DECISION_ROLLED_BACK_AT_IMMUTABLE';
    END IF;
    IF OLD.rejected_at IS NOT NULL
       AND NEW.rejected_at IS DISTINCT FROM OLD.rejected_at THEN
      RAISE EXCEPTION 'GTH_DECISION_REJECTED_AT_IMMUTABLE';
    END IF;

    -- Terminal statuses: no further mutation
    IF OLD.status IN ('REJECTED', 'ROLLED_BACK') THEN
      RAISE EXCEPTION 'GTH_DECISION_TERMINAL_IMMUTABLE';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_staging_review_decisions_immutable ON staging_review_decisions;
CREATE TRIGGER trg_staging_review_decisions_immutable
  BEFORE UPDATE ON staging_review_decisions
  FOR EACH ROW
  EXECUTE FUNCTION staging_forbid_decision_immutable_mutation();

REVOKE ALL ON FUNCTION staging_forbid_decision_immutable_mutation() FROM PUBLIC;

-- Evidence / changes / audit: append-only (no UPDATE, no DELETE)
CREATE OR REPLACE FUNCTION staging_forbid_decision_child_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'GTH_DECISION_CHILD_APPEND_ONLY';
END;
$$;

DROP TRIGGER IF EXISTS trg_staging_decision_evidence_no_update ON staging_review_decision_evidence;
CREATE TRIGGER trg_staging_decision_evidence_no_update
  BEFORE UPDATE ON staging_review_decision_evidence
  FOR EACH ROW
  EXECUTE FUNCTION staging_forbid_decision_child_mutation();

DROP TRIGGER IF EXISTS trg_staging_decision_evidence_no_delete ON staging_review_decision_evidence;
CREATE TRIGGER trg_staging_decision_evidence_no_delete
  BEFORE DELETE ON staging_review_decision_evidence
  FOR EACH ROW
  EXECUTE FUNCTION staging_forbid_decision_child_mutation();

DROP TRIGGER IF EXISTS trg_staging_decision_changes_no_update ON staging_review_decision_changes;
CREATE TRIGGER trg_staging_decision_changes_no_update
  BEFORE UPDATE ON staging_review_decision_changes
  FOR EACH ROW
  EXECUTE FUNCTION staging_forbid_decision_child_mutation();

DROP TRIGGER IF EXISTS trg_staging_decision_changes_no_delete ON staging_review_decision_changes;
CREATE TRIGGER trg_staging_decision_changes_no_delete
  BEFORE DELETE ON staging_review_decision_changes
  FOR EACH ROW
  EXECUTE FUNCTION staging_forbid_decision_child_mutation();

DROP TRIGGER IF EXISTS trg_staging_decision_audit_no_update ON staging_review_decision_audit;
CREATE TRIGGER trg_staging_decision_audit_no_update
  BEFORE UPDATE ON staging_review_decision_audit
  FOR EACH ROW
  EXECUTE FUNCTION staging_forbid_decision_child_mutation();

DROP TRIGGER IF EXISTS trg_staging_decision_audit_no_delete ON staging_review_decision_audit;
CREATE TRIGGER trg_staging_decision_audit_no_delete
  BEFORE DELETE ON staging_review_decision_audit
  FOR EACH ROW
  EXECUTE FUNCTION staging_forbid_decision_child_mutation();

REVOKE ALL ON FUNCTION staging_forbid_decision_child_mutation() FROM PUBLIC;
