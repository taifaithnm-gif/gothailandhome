# BATCH001 Post-Commit Verification

**Date:** 2026-07-26  
**Import session:** `sess_3465132f7da014513da1d0a2`  
**Batch:** BATCH-GTH-20260724-001

## Gates after commit

| Gate | Result |
| --- | --- |
| probe | **PASS** (`STAGING_PROBE_PASS`) |
| schema-verify | **PASS** |
| rls-test | **PASS** |
| env-check | **PASS** (`commit_enabled=false`) |
| Production hard block | **CLEAR** |
| `.env` STAGING_COMMIT_ENABLED | **false** |

## Data integrity

| Check | Result |
| --- | --- |
| Import session unique per batch | PASS (1 row) |
| Session status | COMMITTED |
| Audit event present | PASS (1 × COMMIT_STAGING_IMPORT_V1) |
| Entity row counts | 0 / 0 / 0 / 0 / 0 (devs/projects/assets/pdfs/news) |
| Review items | 0 |
| Conflicts table | 0 |
| APPROVED / READY_FOR_PRODUCTION / PUBLISHED | 0 |
| Storage object IDs | 0 non-null |
| Project 36936 entity row | ABSENT (entity insert not in V1 RPC) |
| UNKNOWN developers rows | ABSENT (entity insert not in V1 RPC) |

## Notes

Metadata on session preserves intent: `project_36936=CONFLICT`, `ready_for_approval=14`, `conflict_preserved=true`. Entity-level conflict/UNKNOWN preservation cannot be verified until entity inserts exist.
