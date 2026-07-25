# STAGING_DB_IDEMPOTENCY_AUDIT

- Key = batch + entity_type + source_record_id + content_hash (sha256)
- Deterministic across repeated Batch001 simulations
- Skip / update / conflict / duplicate-candidate rules implemented
- No timestamp material in keys

**Verdict: PASS**
