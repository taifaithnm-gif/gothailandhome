-- STAGING ONLY
-- DO NOT APPLY TO PRODUCTION
-- Milestone: CONTROLLED_COMMIT_RPC_PHASE2
-- Replaces function body of commit_staging_import_v1 (entity persist).
-- Does NOT alter tables, indexes, RLS, or rollback_staging_import_v1.
-- Not part of EXPECTED_STAGING_MIGRATIONS freeze (001–009 unchanged).

CREATE OR REPLACE FUNCTION commit_staging_import_v1(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_session_id text;
  v_batch_id text;
  v_job_id text;
  v_schema text;
  v_tx text;
  v_n int;
  v_dev int := 0;
  v_proj int := 0;
  v_asset int := 0;
  v_pdf int := 0;
  v_news int := 0;
  v_rev int := 0;
  v_dup int := 0;
  v_conf int := 0;
  v_assets jsonb;
  v_elem jsonb;
  v_review_state text;
  v_candidate text;
BEGIN
  -- STAGING ONLY atomic commit. Does not touch Production catalog tables.
  v_session_id := payload->>'import_session_id';
  v_batch_id := payload->>'source_batch_id';
  v_job_id := coalesce(payload->>'source_job_id', 'unknown');
  v_schema := coalesce(payload->>'source_schema_version', 'goth_batch_manifest.v1');
  v_tx := encode(sha256(convert_to(coalesce(v_session_id,'') || coalesce(v_batch_id,''), 'UTF8')), 'hex');

  IF v_session_id IS NULL OR v_batch_id IS NULL THEN
    RAISE EXCEPTION 'invalid payload';
  END IF;

  IF coalesce(payload->>'production_allowed', 'false') IN ('true', 't', '1') THEN
    RAISE EXCEPTION 'GTH_PRODUCTION_HARD_BLOCK: production_allowed must be false';
  END IF;

  IF coalesce((payload->>'storage_upload_enabled')::boolean, false) THEN
    RAISE EXCEPTION 'GTH_STORAGE_UPLOAD_BLOCKED: storage upload not allowed in commit RPC';
  END IF;

  -- Require entity arrays when counts claim rows (Phase2).
  IF coalesce((payload->'counts'->>'developers')::int, 0) > 0
     AND jsonb_typeof(payload->'developers') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'payload.developers array required when counts.developers > 0';
  END IF;
  IF coalesce((payload->'counts'->>'projects')::int, 0) > 0
     AND jsonb_typeof(payload->'projects') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'payload.projects array required when counts.projects > 0';
  END IF;

  v_assets := CASE
    WHEN jsonb_typeof(payload->'assets') = 'array' THEN payload->'assets'
    WHEN jsonb_typeof(payload->'images') = 'array' THEN payload->'images'
    ELSE '[]'::jsonb
  END;

  -- 1) Session
  INSERT INTO staging_import_sessions (
    import_session_id, source_batch_id, source_job_id, source_schema_version,
    status, phase, dry_run, staging_only, production_allowed,
    database_write_allowed, storage_write_allowed, started_at, created_by,
    idempotency_key, content_hash, metadata_json
  ) VALUES (
    v_session_id,
    v_batch_id,
    v_job_id,
    v_schema,
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

  -- 2) Developers (preserve source/candidate ids + UNKNOWN; never auto-link)
  FOR v_elem IN
    SELECT value FROM jsonb_array_elements(coalesce(payload->'developers', '[]'::jsonb))
  LOOP
    v_candidate := coalesce(v_elem->>'candidate_id', v_elem->>'source_record_id');
    IF v_candidate IS NULL OR v_candidate = 'dev-unknown' THEN
      RAISE EXCEPTION 'GTH_DEVELOPER_CANDIDATE_INVALID: candidate_id must be stable (not unified dev-unknown)';
    END IF;
    v_review_state := coalesce(v_elem->>'review_state', 'REVIEW_REQUIRED');
    IF v_review_state IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED') THEN
      RAISE EXCEPTION 'GTH_REVIEWER_GATE: forbidden review_state=%', v_review_state;
    END IF;

    INSERT INTO staging_developers (
      import_session_id, source_batch_id, source_job_id, source_record_id, source_schema,
      entity_status, review_state, confidence, evidence_json, raw_payload_json,
      normalized_payload_json, content_hash, idempotency_key,
      candidate_id, name, normalized_name, aliases_json, official_website,
      official_website_verified, identity_status, resolution_method, dns_status,
      duplicate_group_id, canonical_developer_id, reviewer_notes
    ) VALUES (
      v_session_id,
      coalesce(v_elem->>'source_batch_id', v_batch_id),
      coalesce(v_elem->>'source_job_id', v_job_id),
      coalesce(v_elem->>'source_record_id', v_candidate),
      coalesce(v_elem->>'source_schema', v_schema),
      coalesce(v_elem->>'entity_status', 'REVIEW_REQUIRED'),
      v_review_state,
      coalesce(v_elem->>'confidence', 'UNKNOWN'),
      coalesce(v_elem->'evidence_json', '[]'::jsonb),
      coalesce(v_elem->'raw_payload_json', '{}'::jsonb),
      coalesce(v_elem->'normalized_payload_json', '{}'::jsonb),
      coalesce(v_elem->>'content_hash', encode(sha256(convert_to(v_elem::text, 'UTF8')), 'hex')),
      coalesce(v_elem->>'idempotency_key', encode(sha256(convert_to(v_session_id || '|developer|' || v_candidate, 'UTF8')), 'hex')),
      v_candidate,
      coalesce(v_elem->>'name', v_candidate),
      coalesce(v_elem->>'normalized_name', coalesce(v_elem->>'name', v_candidate)),
      coalesce(v_elem->'aliases_json', '[]'::jsonb),
      NULLIF(v_elem->>'official_website', ''),
      coalesce((v_elem->>'official_website_verified')::boolean, FALSE),
      coalesce(v_elem->>'identity_status', 'UNKNOWN'),
      NULLIF(v_elem->>'resolution_method', ''),
      NULLIF(v_elem->>'dns_status', ''),
      NULLIF(v_elem->>'duplicate_group_id', ''),
      -- Keep payload canonical id if present; never invent a link.
      NULLIF(v_elem->>'canonical_developer_id', ''),
      NULLIF(v_elem->>'reviewer_notes', '')
    );
    v_dev := v_dev + 1;
  END LOOP;

  -- 3) Projects (Project 36936 must stay REVIEW_REQUIRED; no auto-approve)
  FOR v_elem IN
    SELECT value FROM jsonb_array_elements(coalesce(payload->'projects', '[]'::jsonb))
  LOOP
    v_candidate := coalesce(v_elem->>'candidate_id', v_elem->>'source_record_id');
    IF v_candidate IS NULL THEN
      RAISE EXCEPTION 'GTH_PROJECT_CANDIDATE_INVALID';
    END IF;
    v_review_state := coalesce(v_elem->>'review_state', 'REVIEW_REQUIRED');
    IF v_candidate = '36936' THEN
      v_review_state := 'REVIEW_REQUIRED';
    END IF;
    IF v_review_state IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED') THEN
      RAISE EXCEPTION 'GTH_REVIEWER_GATE: forbidden project review_state=%', v_review_state;
    END IF;

    INSERT INTO staging_projects (
      import_session_id, source_batch_id, source_job_id, source_record_id, source_schema,
      entity_status, review_state, confidence, evidence_json, raw_payload_json,
      normalized_payload_json, content_hash, idempotency_key,
      candidate_id, name, normalized_name, slug_candidate, developer_candidate_id,
      canonical_developer_id, province, province_confidence, province_conflict,
      location_json, project_status, duplicate_group_id, canonical_project_id, reviewer_notes
    ) VALUES (
      v_session_id,
      coalesce(v_elem->>'source_batch_id', v_batch_id),
      coalesce(v_elem->>'source_job_id', v_job_id),
      coalesce(v_elem->>'source_record_id', v_candidate),
      coalesce(v_elem->>'source_schema', v_schema),
      coalesce(v_elem->>'entity_status', 'REVIEW_REQUIRED'),
      v_review_state,
      coalesce(v_elem->>'confidence', coalesce(v_elem->>'province_confidence', 'UNKNOWN')),
      coalesce(v_elem->'evidence_json', '[]'::jsonb),
      coalesce(v_elem->'raw_payload_json', '{}'::jsonb),
      coalesce(v_elem->'normalized_payload_json', '{}'::jsonb),
      coalesce(v_elem->>'content_hash', encode(sha256(convert_to(v_elem::text, 'UTF8')), 'hex')),
      coalesce(v_elem->>'idempotency_key', encode(sha256(convert_to(v_session_id || '|project|' || v_candidate, 'UTF8')), 'hex')),
      v_candidate,
      coalesce(v_elem->>'name', v_candidate),
      coalesce(v_elem->>'normalized_name', coalesce(v_elem->>'name', v_candidate)),
      NULLIF(v_elem->>'slug_candidate', ''),
      NULLIF(v_elem->>'developer_candidate_id', ''),
      NULLIF(v_elem->>'canonical_developer_id', ''),
      NULLIF(v_elem->>'province', ''),
      coalesce(v_elem->>'province_confidence', 'UNKNOWN'),
      coalesce((v_elem->>'province_conflict')::boolean, FALSE),
      v_elem->'location_json',
      coalesce(v_elem->>'project_status', 'STAGING_CANDIDATE'),
      NULLIF(v_elem->>'duplicate_group_id', ''),
      NULLIF(v_elem->>'canonical_project_id', ''),
      NULLIF(v_elem->>'reviewer_notes', '')
    );
    v_proj := v_proj + 1;
  END LOOP;

  -- 4) Assets (hash/mime/path/storage_status; no storage upload)
  FOR v_elem IN SELECT value FROM jsonb_array_elements(v_assets)
  LOOP
    v_candidate := coalesce(v_elem->>'candidate_id', v_elem->>'source_record_id');
    v_review_state := coalesce(v_elem->>'review_state', 'REVIEW_REQUIRED');
    IF v_review_state IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED') THEN
      RAISE EXCEPTION 'GTH_REVIEWER_GATE: forbidden asset review_state=%', v_review_state;
    END IF;
    IF coalesce(v_elem->>'sha256', '') = '' THEN
      RAISE EXCEPTION 'GTH_ASSET_HASH_REQUIRED';
    END IF;

    INSERT INTO staging_assets (
      import_session_id, source_batch_id, source_job_id, source_record_id, source_schema,
      entity_status, review_state, confidence, evidence_json, raw_payload_json,
      normalized_payload_json, content_hash, idempotency_key,
      candidate_id, project_candidate_id, asset_type, original_filename, source_url,
      source_page, local_relative_path, sha256, mime_type, width, height, file_size,
      linkage_status, duplicate_group_id, storage_status, storage_target_path,
      storage_object_id, reviewer_notes
    ) VALUES (
      v_session_id,
      coalesce(v_elem->>'source_batch_id', v_batch_id),
      coalesce(v_elem->>'source_job_id', v_job_id),
      coalesce(v_elem->>'source_record_id', v_candidate),
      coalesce(v_elem->>'source_schema', v_schema),
      coalesce(v_elem->>'entity_status', 'REVIEW_REQUIRED'),
      v_review_state,
      coalesce(v_elem->>'confidence', 'HIGH'),
      coalesce(v_elem->'evidence_json', '[]'::jsonb),
      coalesce(v_elem->'raw_payload_json', '{}'::jsonb),
      coalesce(v_elem->'normalized_payload_json', '{}'::jsonb),
      coalesce(v_elem->>'content_hash', encode(sha256(convert_to(v_elem::text, 'UTF8')), 'hex')),
      coalesce(v_elem->>'idempotency_key', encode(sha256(convert_to(v_session_id || '|asset|' || v_candidate, 'UTF8')), 'hex')),
      v_candidate,
      NULLIF(v_elem->>'project_candidate_id', ''),
      coalesce(v_elem->>'asset_type', 'image'),
      NULLIF(v_elem->>'original_filename', ''),
      NULLIF(v_elem->>'source_url', ''),
      NULLIF(v_elem->>'source_page', ''),
      NULLIF(v_elem->>'local_relative_path', ''),
      lower(v_elem->>'sha256'),
      NULLIF(v_elem->>'mime_type', ''),
      NULLIF(v_elem->>'width', '')::int,
      NULLIF(v_elem->>'height', '')::int,
      NULLIF(v_elem->>'file_size', '')::bigint,
      NULLIF(v_elem->>'linkage_status', ''),
      NULLIF(v_elem->>'duplicate_group_id', ''),
      'PLANNED',
      NULLIF(v_elem->>'storage_target_path', ''),
      NULL,
      NULLIF(v_elem->>'reviewer_notes', '')
    );
    v_asset := v_asset + 1;
  END LOOP;

  -- 5) PDFs
  FOR v_elem IN
    SELECT value FROM jsonb_array_elements(coalesce(payload->'pdfs', '[]'::jsonb))
  LOOP
    v_candidate := coalesce(v_elem->>'candidate_id', v_elem->>'source_record_id');
    v_review_state := coalesce(v_elem->>'review_state', 'REVIEW_REQUIRED');
    IF v_review_state IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED') THEN
      RAISE EXCEPTION 'GTH_REVIEWER_GATE: forbidden pdf review_state=%', v_review_state;
    END IF;
    IF coalesce(v_elem->>'sha256', '') = '' THEN
      RAISE EXCEPTION 'GTH_PDF_HASH_REQUIRED';
    END IF;

    INSERT INTO staging_pdfs (
      import_session_id, source_batch_id, source_job_id, source_record_id, source_schema,
      entity_status, review_state, confidence, evidence_json, raw_payload_json,
      normalized_payload_json, content_hash, idempotency_key,
      candidate_id, project_candidate_id, category_candidate, original_filename,
      source_url, source_page, local_relative_path, sha256, mime_type, page_count,
      file_size, duplicate_group_id, storage_status, storage_target_path, reviewer_notes
    ) VALUES (
      v_session_id,
      coalesce(v_elem->>'source_batch_id', v_batch_id),
      coalesce(v_elem->>'source_job_id', v_job_id),
      coalesce(v_elem->>'source_record_id', v_candidate),
      coalesce(v_elem->>'source_schema', v_schema),
      coalesce(v_elem->>'entity_status', 'REVIEW_REQUIRED'),
      v_review_state,
      coalesce(v_elem->>'confidence', 'HIGH'),
      coalesce(v_elem->'evidence_json', '[]'::jsonb),
      coalesce(v_elem->'raw_payload_json', '{}'::jsonb),
      coalesce(v_elem->'normalized_payload_json', '{}'::jsonb),
      coalesce(v_elem->>'content_hash', encode(sha256(convert_to(v_elem::text, 'UTF8')), 'hex')),
      coalesce(v_elem->>'idempotency_key', encode(sha256(convert_to(v_session_id || '|pdf|' || v_candidate, 'UTF8')), 'hex')),
      v_candidate,
      NULLIF(v_elem->>'project_candidate_id', ''),
      NULLIF(v_elem->>'category_candidate', ''),
      NULLIF(v_elem->>'original_filename', ''),
      NULLIF(v_elem->>'source_url', ''),
      NULLIF(v_elem->>'source_page', ''),
      NULLIF(v_elem->>'local_relative_path', ''),
      lower(v_elem->>'sha256'),
      coalesce(NULLIF(v_elem->>'mime_type', ''), 'application/pdf'),
      NULLIF(v_elem->>'page_count', '')::int,
      NULLIF(v_elem->>'file_size', '')::bigint,
      NULLIF(v_elem->>'duplicate_group_id', ''),
      'PLANNED',
      NULLIF(v_elem->>'storage_target_path', ''),
      NULLIF(v_elem->>'reviewer_notes', '')
    );
    v_pdf := v_pdf + 1;
  END LOOP;

  -- 6) News
  FOR v_elem IN
    SELECT value FROM jsonb_array_elements(coalesce(payload->'news', '[]'::jsonb))
  LOOP
    v_candidate := coalesce(v_elem->>'candidate_id', v_elem->>'source_record_id');
    v_review_state := coalesce(v_elem->>'review_state', 'REVIEW_REQUIRED');
    IF v_review_state IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED') THEN
      RAISE EXCEPTION 'GTH_REVIEWER_GATE: forbidden news review_state=%', v_review_state;
    END IF;
    IF coalesce(v_elem->>'source_url', '') = '' THEN
      RAISE EXCEPTION 'GTH_NEWS_SOURCE_URL_REQUIRED';
    END IF;

    INSERT INTO staging_news (
      import_session_id, source_batch_id, source_job_id, source_record_id, source_schema,
      entity_status, review_state, confidence, evidence_json, raw_payload_json,
      normalized_payload_json, content_hash, idempotency_key,
      candidate_id, title, normalized_title, source_url, source_domain,
      published_at, captured_at, freshness_status, developer_candidate_id,
      project_candidate_id, duplicate_group_id, reviewer_notes
    ) VALUES (
      v_session_id,
      coalesce(v_elem->>'source_batch_id', v_batch_id),
      coalesce(v_elem->>'source_job_id', v_job_id),
      coalesce(v_elem->>'source_record_id', v_candidate),
      coalesce(v_elem->>'source_schema', v_schema),
      coalesce(v_elem->>'entity_status', 'REVIEW_REQUIRED'),
      v_review_state,
      coalesce(v_elem->>'confidence', 'MEDIUM'),
      coalesce(v_elem->'evidence_json', '[]'::jsonb),
      coalesce(v_elem->'raw_payload_json', '{}'::jsonb),
      coalesce(v_elem->'normalized_payload_json', '{}'::jsonb),
      coalesce(v_elem->>'content_hash', encode(sha256(convert_to(v_elem::text, 'UTF8')), 'hex')),
      coalesce(v_elem->>'idempotency_key', encode(sha256(convert_to(v_session_id || '|news|' || v_candidate, 'UTF8')), 'hex')),
      v_candidate,
      NULLIF(v_elem->>'title', ''),
      NULLIF(v_elem->>'normalized_title', ''),
      v_elem->>'source_url',
      NULLIF(v_elem->>'source_domain', ''),
      NULLIF(v_elem->>'published_at', '')::timestamptz,
      NULLIF(v_elem->>'captured_at', '')::timestamptz,
      NULLIF(v_elem->>'freshness_status', ''),
      NULLIF(v_elem->>'developer_candidate_id', ''),
      NULLIF(v_elem->>'project_candidate_id', ''),
      NULLIF(v_elem->>'duplicate_group_id', ''),
      NULLIF(v_elem->>'reviewer_notes', '')
    );
    v_news := v_news + 1;
  END LOOP;

  -- 7) Review items (pending / review states only — never Approved)
  FOR v_elem IN
    SELECT value FROM jsonb_array_elements(coalesce(payload->'review_items', '[]'::jsonb))
  LOOP
    v_review_state := coalesce(v_elem->>'review_state', 'REVIEW_REQUIRED');
    IF v_review_state IN ('APPROVED', 'READY_FOR_PRODUCTION', 'PUBLISHED') THEN
      RAISE EXCEPTION 'GTH_REVIEWER_GATE: forbidden review_item review_state=%', v_review_state;
    END IF;

    INSERT INTO staging_review_items (
      import_session_id, entity_type, entity_id, source_review_item_id, source_reason,
      mapped_reason, severity, review_state, suggested_action, blocking, evidence_json,
      source_payload, reviewer_id, reviewer_notes, reviewed_at, decision, version,
      idempotency_key, content_hash, source_batch_id, source_job_id
    ) VALUES (
      v_session_id,
      coalesce(v_elem->>'entity_type', 'review_item'),
      coalesce(v_elem->>'entity_id', 'unknown'),
      coalesce(v_elem->>'source_review_item_id', v_elem->>'entity_id', 'unknown'),
      coalesce(v_elem->>'source_reason', 'REVIEW_REQUIRED'),
      coalesce(v_elem->>'mapped_reason', coalesce(v_elem->>'source_reason', 'REVIEW_REQUIRED')),
      coalesce(v_elem->>'severity', 'medium'),
      v_review_state,
      coalesce(v_elem->>'suggested_action', 'HUMAN_REVIEW'),
      coalesce((v_elem->>'blocking')::boolean, FALSE),
      coalesce(v_elem->'evidence_json', '[]'::jsonb),
      coalesce(v_elem->'source_payload', v_elem->'raw_payload_json', '{}'::jsonb),
      NULLIF(v_elem->>'reviewer_id', ''),
      NULLIF(v_elem->>'reviewer_notes', ''),
      NULL,
      NULL,
      coalesce(NULLIF(v_elem->>'version', '')::int, 1),
      coalesce(v_elem->>'idempotency_key', encode(sha256(convert_to(v_session_id || '|review|' || coalesce(v_elem->>'source_review_item_id', v_elem->>'entity_id', 'x'), 'UTF8')), 'hex')),
      coalesce(v_elem->>'content_hash', encode(sha256(convert_to(v_elem::text, 'UTF8')), 'hex')),
      coalesce(v_elem->>'source_batch_id', v_batch_id),
      coalesce(v_elem->>'source_job_id', v_job_id)
    );
    v_rev := v_rev + 1;
  END LOOP;

  -- 8) Duplicates (optional)
  FOR v_elem IN
    SELECT value FROM jsonb_array_elements(coalesce(payload->'duplicates', payload->'duplicate_candidates', '[]'::jsonb))
  LOOP
    INSERT INTO staging_duplicate_candidates (
      import_session_id, source_batch_id, source_job_id, entity_type, entity_id,
      matched_entity_id, match_kind, match_value, score, duplicate_group_id,
      review_state, evidence_json, content_hash, idempotency_key
    ) VALUES (
      v_session_id,
      coalesce(v_elem->>'source_batch_id', v_batch_id),
      coalesce(v_elem->>'source_job_id', v_job_id),
      coalesce(v_elem->>'entity_type', 'unknown'),
      coalesce(v_elem->>'entity_id', 'unknown'),
      coalesce(v_elem->>'matched_entity_id', ''),
      coalesce(v_elem->>'match_kind', 'unknown'),
      coalesce(v_elem->>'match_value', ''),
      NULLIF(v_elem->>'score', '')::numeric,
      coalesce(v_elem->>'duplicate_group_id', 'dup-group'),
      coalesce(v_elem->>'review_state', 'DUPLICATE'),
      coalesce(v_elem->'evidence_json', '{}'::jsonb),
      coalesce(v_elem->>'content_hash', encode(sha256(convert_to(v_elem::text, 'UTF8')), 'hex')),
      coalesce(v_elem->>'idempotency_key', encode(sha256(convert_to(v_session_id || '|dup|' || coalesce(v_elem->>'entity_id','x'), 'UTF8')), 'hex'))
    );
    v_dup := v_dup + 1;
  END LOOP;

  -- 9) Conflicts (Project 36936 conflict stays review-required path; row state=CONFLICT)
  FOR v_elem IN
    SELECT value FROM jsonb_array_elements(coalesce(payload->'conflicts', payload->'conflict_candidates', '[]'::jsonb))
  LOOP
    INSERT INTO staging_conflict_candidates (
      import_session_id, source_batch_id, source_job_id, entity_type, entity_id,
      conflict_reason, severity, review_state, evidence_json, content_hash, idempotency_key
    ) VALUES (
      v_session_id,
      coalesce(v_elem->>'source_batch_id', v_batch_id),
      coalesce(v_elem->>'source_job_id', v_job_id),
      coalesce(v_elem->>'entity_type', 'project'),
      coalesce(v_elem->>'entity_id', 'unknown'),
      coalesce(v_elem->>'conflict_reason', 'CONFLICT'),
      coalesce(v_elem->>'severity', 'high'),
      'CONFLICT',
      coalesce(v_elem->'evidence_json', '{}'::jsonb),
      coalesce(v_elem->>'content_hash', encode(sha256(convert_to(v_elem::text, 'UTF8')), 'hex')),
      coalesce(v_elem->>'idempotency_key', encode(sha256(convert_to(v_session_id || '|conflict|' || coalesce(v_elem->>'entity_id','x'), 'UTF8')), 'hex'))
    );
    v_conf := v_conf + 1;
  END LOOP;

  -- 10) Audit (append-only)
  INSERT INTO staging_audit_events (
    import_session_id, event_type, actor_type, actor_id, next_state, payload_hash, metadata_json
  ) VALUES (
    v_session_id, 'COMMIT_STAGING_IMPORT_V1', 'IMPORTER', current_user, 'COMMITTED',
    encode(sha256(convert_to(payload::text, 'UTF8')), 'hex'),
    jsonb_build_object(
      'batch_id', v_batch_id,
      'transaction_id', v_tx,
      'phase', 'CONTROLLED_COMMIT_RPC_PHASE2',
      'inserted_developers', v_dev,
      'inserted_projects', v_proj,
      'inserted_assets', v_asset,
      'inserted_pdfs', v_pdf,
      'inserted_news', v_news,
      'inserted_review_items', v_rev,
      'inserted_duplicates', v_dup,
      'inserted_conflicts', v_conf
    )
  );
  GET DIAGNOSTICS v_n = ROW_COUNT;

  RETURN jsonb_build_object(
    'import_session_id', v_session_id,
    'batch_id', v_batch_id,
    'transaction_id', v_tx,
    'inserted_developers', v_dev,
    'inserted_projects', v_proj,
    'inserted_assets', v_asset,
    'inserted_pdfs', v_pdf,
    'inserted_news', v_news,
    'inserted_review_items', v_rev,
    'inserted_duplicates', v_dup,
    'inserted_conflicts', v_conf,
    'inserted_audit_events', v_n,
    'skipped_duplicates', 0,
    'warnings', coalesce(payload->'warnings', '[]'::jsonb),
    'committed_at', now(),
    'milestone', 'CONTROLLED_COMMIT_RPC_PHASE2'
  );
END;
$$;

REVOKE ALL ON FUNCTION commit_staging_import_v1(jsonb) FROM PUBLIC;
