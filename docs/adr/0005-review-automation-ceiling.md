# ADR: Review Automation Ceiling

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Automation must never approve or publish.

## Decision

Ceiling READY_FOR_APPROVAL; APPROVED+ are FUTURE_MANUAL_STATE with no active edges.

## Consequences

Separates Reviewer from Approver roles.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
