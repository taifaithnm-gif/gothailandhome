# ADR: No Auto-Merge Duplicates

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Weak similarity must not silently merge entities.

## Decision

Duplicate engine emits candidates only; strong hash/id may WOULD_SKIP_DUPLICATE.

## Consequences

Human review required for weak signals.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
