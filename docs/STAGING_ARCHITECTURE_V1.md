# Staging Architecture V1 (Frozen)

**Status:** Architecture Freeze V1 + Review Infrastructure V1 `FEATURE_FREEZE`  
**Baseline:** `STAGING_BASELINE_V1`  
**Product mode:** `CONTENT_FIRST` (no further Review Workflow development)  
**Production:** FREEZE CURRENT PRODUCTION — NO CUTOVER  
**Writes:** Staging schema verified through migration `012`; Production DATABASE_WRITES=0 · STORAGE_UPLOADS=0

## Scope

Windows01 sealed ZIP → Goth adapter → Staging Import Framework → Review Console → Staging DB (migrations `001`–`012`) → Reviewer Gate.

**Out of scope / DEFERRED:** Decision Service, Decision API, Decision UI, Approval, Publish, Production cutover.

## Architecture Layers

1. Windows01 Contract (`src/lib/integrations/windows01/`)
2. Batch Adapter (`src/lib/staging-import/adapters/`)
3. Staging Import Core (`src/lib/staging-import/`)
4. Review Console (`src/lib/review-console/`, `src/app/internal/`)
5. Staging DB Implementation (`src/lib/staging-db/`, `database/staging-migrations/`)

## Dependency Direction

L1 ← L2 ← L3; L4 reads freeze artifacts / Staging browse; L5 Staging-only commit with isolation gates. No cycles.

## Core Types

- Import: `ImportBatch`, `ReviewState`, `PreviewAction`, `ImportSessionPhase`
- DB: `ImportSessionStatus`, `CommitOperation`, `StagingReviewState`, `StorageAction`
- Phase A Decision: draft-only types in `decision-types.ts` (no service transitions)

## State Machines

Automation ceiling: **READY_FOR_APPROVAL**.  
FUTURE_MANUAL_STATE: APPROVED, READY_FOR_PRODUCTION, PUBLISHED (no active edges).

## Action Vocabulary

See `docs/ACTION_VOCABULARY.md` — Preview / Commit / Storage domains are separate.

## Error Model

See `docs/ERROR_CODE_CATALOG.md` — codes use `GTH_*` prefixes where frozen.

## Security Boundaries

Production hard block + staging commit default disabled + review console feature flag default OFF + Reviewer Gate.

## Batch Contract

`BATCH_CONTRACT_V1` + `goth_batch_manifest.v1` (centralized in `contract-versions.ts`).

## Current Limitations

- Decision Service / API / UI deferred
- Phase A decision tables empty (schema only)
- Batch001 project 36936 province conflict remains human review
- Storage upload disabled

## Next Milestone

`CONTENT_AND_SEO_DEVELOPMENT` — Review Workflow Phase B must not start from this freeze.

See: `REPORTS/REVIEW_INFRASTRUCTURE_V1_FREEZE.md`, `REVIEW_INFRASTRUCTURE_DEFERRED_BACKLOG.md`.

## Frozen Decisions

See `docs/adr/` ADRs 0001–0012.
