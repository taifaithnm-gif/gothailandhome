# ADR: Sealed ZIP Digest

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Raw ZIP bytes vary across tools; contract needs stable digest.

## Decision

Use sealed digest over ordered members + inventory + SHA256SUMS rules.

## Consequences

Sidecar/manifest/digest must agree; raw zip sha is observational only.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
