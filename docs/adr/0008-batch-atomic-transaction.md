# ADR: Batch Atomic Transaction

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Partial batch commits create inconsistent review sets.

## Decision

Default batch_atomic_transaction; any failure rolls back.

## Consequences

entity_group_transaction deferred.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
