# ADR: Storage Decoupling

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Uploads must not couple to DB commit simulation.

## Decision

Storage plan uses WOULD_* only; STORAGE_UPLOADS=0 in V1.

## Consequences

Path sanitization required.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
