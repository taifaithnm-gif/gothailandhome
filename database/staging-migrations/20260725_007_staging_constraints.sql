-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: STAGING_DB_COMMIT_IMPLEMENTATION_V1
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

-- Idempotency uniqueness already via partial unique indexes.
-- Block reviewer mutation of immutable source payload columns.
CREATE OR REPLACE FUNCTION staging_forbid_source_payload_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.source_payload IS DISTINCT FROM OLD.source_payload THEN
      RAISE EXCEPTION 'GTH_REVIEW_SOURCE_PAYLOAD_IMMUTABLE';
    END IF;
    IF NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key THEN
      RAISE EXCEPTION 'GTH_IDEMPOTENCY_KEY_IMMUTABLE';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_staging_review_items_payload_immutable ON staging_review_items;
CREATE TRIGGER trg_staging_review_items_payload_immutable
  BEFORE UPDATE ON staging_review_items
  FOR EACH ROW
  EXECUTE FUNCTION staging_forbid_source_payload_mutation();

REVOKE ALL ON FUNCTION staging_forbid_source_payload_mutation() FROM PUBLIC;
