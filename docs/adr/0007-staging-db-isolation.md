# ADR: Staging DB Isolation

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Production catalog must not receive import writes.

## Decision

Design staging_* tables + simulation; real commit disabled.

## Consequences

SQL drafts outside supabase/migrations.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
