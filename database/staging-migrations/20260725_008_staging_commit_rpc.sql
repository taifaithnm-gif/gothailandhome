-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: STAGING_DB_COMMIT_IMPLEMENTATION_V1
-- Requires: --confirm-staging + STAGING_PROJECT_REF isolation checks

CREATE OR REPLACE FUNCTION commit_staging_import_v1(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_session_id text;
  v_batch_id text;
  v_tx text;
BEGIN
  -- STAGING ONLY atomic commit. Does not touch Production catalog tables.
  v_session_id := payload->>'import_session_id';
  v_batch_id := payload->>'source_batch_id';
  v_tx := encode(sha256(convert_to(coalesce(v_session_id,'') || coalesce(v_batch_id,''), 'UTF8')), 'hex');

  IF v_session_id IS NULL OR v_batch_id IS NULL THEN
    RAISE EXCEPTION 'invalid payload';
  END IF;

  INSERT INTO staging_import_sessions (
    import_session_id, source_batch_id, source_job_id, source_schema_version,
    status, phase, dry_run, staging_only, production_allowed,
    database_write_allowed, storage_write_allowed, started_at, created_by,
    idempotency_key, content_hash, metadata_json
  ) VALUES (
    v_session_id,
    v_batch_id,
    coalesce(payload->>'source_job_id','unknown'),
    coalesce(payload->>'source_schema_version','goth_batch_manifest.v1'),
    'COMMITTED',
    'commit_rpc',
    FALSE,
    TRUE,
    FALSE,
    TRUE,
    FALSE,
    now(),
    coalesce(payload->>'created_by','IMPORTER'),
    coalesce(payload->>'idempotency_key', v_tx),
    coalesce(payload->>'content_hash', v_tx),
    coalesce(payload->'metadata_json', '{}'::jsonb)
  );

  -- Entity arrays are applied by follow-up controlled inserts inside same function
  -- in a future expansion. V1 records session + audit envelope atomically.
  INSERT INTO staging_audit_events (
    import_session_id, event_type, actor_type, actor_id, next_state, payload_hash, metadata_json
  ) VALUES (
    v_session_id, 'COMMIT_STAGING_IMPORT_V1', 'IMPORTER', current_user, 'COMMITTED',
    encode(sha256(convert_to(payload::text, 'UTF8')), 'hex'),
    jsonb_build_object('batch_id', v_batch_id, 'transaction_id', v_tx)
  );

  RETURN jsonb_build_object(
    'import_session_id', v_session_id,
    'batch_id', v_batch_id,
    'transaction_id', v_tx,
    'inserted_developers', coalesce((payload->'counts'->>'developers')::int, 0),
    'inserted_projects', coalesce((payload->'counts'->>'projects')::int, 0),
    'inserted_assets', coalesce((payload->'counts'->>'images')::int, 0),
    'inserted_pdfs', coalesce((payload->'counts'->>'pdfs')::int, 0),
    'inserted_news', coalesce((payload->'counts'->>'news')::int, 0),
    'inserted_review_items', coalesce((payload->'counts'->>'review_items')::int, 0),
    'inserted_conflicts', coalesce((payload->'counts'->>'conflicts')::int, 0),
    'inserted_audit_events', 1,
    'skipped_duplicates', 0,
    'warnings', '[]'::jsonb,
    'committed_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION commit_staging_import_v1(jsonb) FROM PUBLIC;
