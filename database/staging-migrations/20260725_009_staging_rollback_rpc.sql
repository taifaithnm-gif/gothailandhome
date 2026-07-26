-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: STAGING_DB_COMMIT_IMPLEMENTATION_V1
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

CREATE OR REPLACE FUNCTION rollback_staging_import_v1(p_import_session_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
  n int;
BEGIN
  UPDATE staging_developers SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_import_session_id AND deleted_at IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; v_count := v_count + n;
  UPDATE staging_projects SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_import_session_id AND deleted_at IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; v_count := v_count + n;
  UPDATE staging_assets SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_import_session_id AND deleted_at IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; v_count := v_count + n;
  UPDATE staging_pdfs SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_import_session_id AND deleted_at IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; v_count := v_count + n;
  UPDATE staging_news SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_import_session_id AND deleted_at IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; v_count := v_count + n;

  UPDATE staging_import_sessions
    SET status = 'ROLLED_BACK', updated_at = now()
    WHERE import_session_id = p_import_session_id;

  INSERT INTO staging_audit_events (
    import_session_id, event_type, actor_type, actor_id, next_state, payload_hash, metadata_json
  ) VALUES (
    p_import_session_id, 'ROLLBACK_STAGING_IMPORT_V1', 'ADMIN', current_user, 'ROLLED_BACK',
    encode(sha256(convert_to(p_import_session_id, 'UTF8')), 'hex'),
    jsonb_build_object('soft_deleted', v_count)
  );

  RETURN jsonb_build_object(
    'import_session_id', p_import_session_id,
    'soft_deleted', v_count,
    'rolled_back_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION rollback_staging_import_v1(text) FROM PUBLIC;
