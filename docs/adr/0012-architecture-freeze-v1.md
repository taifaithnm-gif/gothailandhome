# ADR: Architecture Freeze V1

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Need a clear Design/Simulation vs Implementation boundary.

## Decision

Freeze layers, APIs, states, vocabularies, errors; local tag staging-architecture-v1.

## Consequences

Next milestone may implement staging commit only after isolated Staging Supabase.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
