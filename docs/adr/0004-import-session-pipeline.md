# ADR: Import Session Pipeline

**Status:** Accepted
**Milestone:** ARCHITECTURE_FREEZE_V1

## Context

Need a dry-run pipeline with clear phases and hard commit block.

## Decision

Phases: LOAD→VERIFY→NORMALIZE→VALIDATE→DUPLICATE_CHECK→REVIEW_MAPPING→PREVIEW→BLOCKED_COMMIT.

## Consequences

ImportPhase vs ImportSessionStatus remain distinct types.

## Alternatives considered

- Continue without freeze (rejected: drift risk)
- Start STAGING_DB_COMMIT_IMPLEMENTATION immediately (rejected: missing isolation)

## Security impact

Preserves DATABASE_WRITES=0, STORAGE_UPLOADS=0, PRODUCTION_CONNECTION=NO for this freeze.

## Revisit conditions

Only after isolated Staging Supabase exists and human review of SQL drafts / RLS.
