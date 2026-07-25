-- DESIGN DRAFT ONLY
-- DO NOT EXECUTE
-- NO PRODUCTION MIGRATION

-- Soft-delete rollback helpers (functions are drafts only).

-- Rollback by import_session_id:
-- 1) refuse if any linked production publication exists (future gate)
-- 2) soft-delete staging entities
-- 3) set session status = ROLLED_BACK
-- 4) append audit event
-- 5) preserve audit history (no DELETE from staging_audit_events)

/*
CREATE OR REPLACE FUNCTION staging_rollback_import_session(p_session_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- DESIGN DRAFT ONLY — DO NOT EXECUTE
  UPDATE staging_developers SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_session_id AND deleted_at IS NULL;
  UPDATE staging_projects SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_session_id AND deleted_at IS NULL;
  UPDATE staging_assets SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_session_id AND deleted_at IS NULL;
  UPDATE staging_pdfs SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_session_id AND deleted_at IS NULL;
  UPDATE staging_news SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_session_id AND deleted_at IS NULL;
  UPDATE staging_duplicate_candidates SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_session_id AND deleted_at IS NULL;
  UPDATE staging_conflict_candidates SET deleted_at = now(), updated_at = now()
    WHERE import_session_id = p_session_id AND deleted_at IS NULL;
  UPDATE staging_import_sessions
    SET status = 'ROLLED_BACK', updated_at = now()
    WHERE import_session_id = p_session_id;
  INSERT INTO staging_audit_events (
    import_session_id, event_type, actor_type, actor_id, next_state, payload_hash, metadata_json
  ) VALUES (
    p_session_id, 'ROLLBACK_SOFT_DELETE', 'ADMIN', current_user, 'ROLLED_BACK',
    encode(sha256(convert_to(p_session_id, 'UTF8')), 'hex'),
    jsonb_build_object('dry_run', false)
  );
END;
$$;
*/

-- Intentionally left commented. DO NOT EXECUTE.
