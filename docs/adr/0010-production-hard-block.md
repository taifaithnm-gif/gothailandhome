# ADR: Production Hard Block

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Accidental production writes are unacceptable.

## Decision

Hard-code ProductionWriteBlockedError / StagingCommitDisabledError checks.

## Consequences

Not documentation-only; covered by red-team tests.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
