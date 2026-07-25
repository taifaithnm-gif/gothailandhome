# ADR: Adapter Boundary

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Core import must not depend on Windows01 field names.

## Decision

Place Goth schema conversion in staging-import/adapters only.

## Consequences

Preserves Layer 2 isolation; unsupported fields retained.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
