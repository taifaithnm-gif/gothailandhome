# ADR: Windows01 Batch Contract

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Need a stable Mac-compatible contract for Goth sealed ZIP packages.

## Decision

Adopt BATCH_CONTRACT_V1 with sealed digest as authoritative hash.

## Consequences

Enables deterministic Mac verification; rejects naive raw sha256sum as sole gate.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
