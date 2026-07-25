# Staging Architecture V1 (Frozen)

**Status:** Architecture Freeze V1
**Production:** FREEZE CURRENT PRODUCTION — NO CUTOVER
**Writes:** DATABASE_WRITES=0 · STORAGE_UPLOADS=0

## Scope

Windows01 sealed ZIP → Goth adapter → Staging Import Framework → Review Console → Staging DB Design/Simulation.

**Out of scope:** real Staging DB commit, Storage upload, Production publish.

## Architecture Layers

1. Windows01 Contract (`src/lib/integrations/windows01/`)
2. Batch Adapter (`src/lib/staging-import/adapters/`)
3. Staging Import Core (`src/lib/staging-import/`)
4. Review Console (`src/lib/review-console/`, `src/app/internal/`)
5. Staging DB Design (`src/lib/staging-db/`, `database-design/staging-import-v1/`)

## Dependency Direction

L1 ← L2 ← L3; L4 reads local JSON only; L5 simulates only. No cycles.

## Core Types

- Import: `ImportBatch`, `ReviewState`, `PreviewAction`, `ImportSessionPhase`
- DB Design: `ImportSessionStatus`, `CommitOperation`, `StagingReviewState`, `StorageAction`

## State Machines

Automation ceiling: **READY_FOR_APPROVAL**.
FUTURE_MANUAL_STATE: APPROVED, READY_FOR_PRODUCTION, PUBLISHED (no active edges).

## Action Vocabulary

See `docs/ACTION_VOCABULARY.md` — Preview / Commit / Storage domains are separate.

## Error Model

See `docs/ERROR_CODE_CATALOG.md` — codes use `GTH_*` prefixes where frozen.

## Security Boundaries

Production hard block + staging commit disabled + review console feature flag default OFF.

## Batch Contract

`BATCH_CONTRACT_V1` + `goth_batch_manifest.v1` (centralized in `contract-versions.ts`).

## Current Limitations

- No physical Staging Supabase
- RLS design only (CONDITIONAL)
- Batch001 project 36936 province conflict remains human review

## Next Milestone

`STAGING_DB_COMMIT_IMPLEMENTATION` — only after isolated staging DB + human SQL/RLS review.

## Frozen Decisions

See `docs/adr/` ADRs 0001–0012.
