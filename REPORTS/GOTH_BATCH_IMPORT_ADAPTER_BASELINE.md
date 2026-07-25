# GOTH_BATCH_IMPORT_ADAPTER_BASELINE

**Date:** 2026-07-25
**Milestone:** GOTH_BATCH_IMPORT_ADAPTER_V1
**Status:** FREEZE CURRENT PRODUCTION — NO CUTOVER
**Mode:** DRY RUN ONLY

## Git baseline

| Check | Value |
| --- | --- |
| cwd | `/Users/jun/AI-Workspace/Projects/GoThailandHome` |
| branch | `main` |
| HEAD | `0eca210a72a559a1ce0291f16d72120e401d91a3` |
| origin/main | `0eca210a72a559a1ce0291f16d72120e401d91a3` |
| Working tree | Dirty (prior Phase2 / Windows01 / staging-import uncommitted work present) |

**Policy:** Do not overwrite or discard existing uncommitted work. Adapter work is additive.

## Input artifacts

| Artifact | Path | Present |
| --- | --- | --- |
| ZIP | `/Volumes/AI_SHARE/GOTHAILANDHOME/EXPORTS/BATCH-GTH-20260724-001.zip` | YES (34,407,985 bytes) |
| Sidecar | `/Volumes/AI_SHARE/GOTHAILANDHOME/EXPORTS/BATCH-GTH-20260724-001.sha256` | YES |

Expected identity:

- `batch_id`: `BATCH-GTH-20260724-001`
- `job_id`: `JOB-GTH-DISCOVERY-20260724-001`
- `schema_version`: `goth_batch_manifest.v1`

## Existing modules (pre-adapter)

| Path | Role |
| --- | --- |
| `src/lib/integrations/windows01/` | Sealed ZIP, Goth dry-run, Windows01 contract |
| `src/lib/staging-import/` | ImportSession, validators, duplicate, preview |
| `scripts/staging-import-cli.mjs` | Framework CLI |
| `scripts/windows01-dry-run-import.mjs` | Windows01 / Goth dry-run CLI |
| `scripts/test-staging-import-framework.mjs` | Framework tests |

## Baseline verification commands

| Command | Result |
| --- | --- |
| `npm run test:staging-import` | PASS — 111 / 111 |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |

## Hard constraints for this milestone

- No Supabase writes / service role usage
- No Production / Staging DB connection for import
- No Storage upload
- No auto-approve / auto-publish
- No Vercel / Production deploy
- No Feature Flag enablement of production features
- No Migration
- No git commit / push / tag

## Gap this milestone closes

Windows01 Goth Batch dry-run exists under `integrations/windows01`, but staging-import core still lacks a dedicated **boundary adapter** that:

1. Validates sealed ZIP + identity gates
2. Maps Goth schema → site `ImportBatch` without leaking Windows01 fields into core
3. Runs real `ImportSession` (LOAD→…→BLOCKED_COMMIT)
4. Emits Human Review Console data + local read-only UI

## Baseline verdict

**PASS** — safe to add Goth Batch Import Adapter V1 on top of existing uncommitted work.
