# ADR: Idempotency Strategy

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Re-imports must be deterministic and safe.

## Decision

Key = batch|entity_type|source_record_id|content_hash (no timestamps).

## Consequences

Same content skips; changed content updates/conflicts.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
