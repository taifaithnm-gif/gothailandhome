# BATCH001 Controlled Staging Commit

**Date:** 2026-07-26  
**Batch:** BATCH-GTH-20260724-001  
**Milestone:** RUN_BATCH001_CONTROLLED_STAGING_COMMIT  
**Environment:** gothailandhome-staging (`xwbq…`)  
**Connection:** SESSION_POOLER  

## Authorization

| Item | Value |
| --- | --- |
| Process `STAGING_COMMIT_ENABLED` | `true` (one-shot only) |
| `.env.staging.local` after run | `STAGING_COMMIT_ENABLED=false` |
| Secret Rotation | NOT_EXECUTED |
| Gate / guard code changes | NONE |

## Commit command (sanitized)

```bash
STAGING_COMMIT_ENABLED=true npm run staging:db:commit -- \
  --confirm-staging \
  --batch BATCH-GTH-20260724-001 \
  --expected-sealed-digest d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786
```

## RPC result

| Field | Value |
| --- | --- |
| RPC | `commit_staging_import_v1` |
| Exit | 0 |
| importSessionId | `sess_3465132f7da014513da1d0a2` |
| batchId | `BATCH-GTH-20260724-001` |
| transactionId | `5cf8b755f379…5647c92` |
| committedAt | `2026-07-26T05:28:12.923998+00:00` |
| databaseEnvironmentId | `gothailandhome-staging` |
| storageUploads | 0 |
| rollbackToken | PRESENT (masked — not printed) |

### RPC-reported counts (from payload echo)

| Metric | RPC returned |
| --- | --- |
| insertedDevelopers | 5 |
| insertedProjects | 10 |
| insertedAssets | 9 |
| insertedPdfs | 5 |
| insertedNews | 10 |
| insertedReviewItems | 63 |
| insertedConflicts | 1 |
| insertedAuditEvents | 1 |

## Actual database writes (authoritative)

`commit_staging_import_v1` V1 implementation inserts **session + audit envelope only**. Entity arrays are **not** applied (see migration comment: “Entity arrays are applied by follow-up controlled inserts… in a future expansion”).

| Table | Rows for batch |
| --- | --- |
| staging_import_sessions | **1** (status=`COMMITTED`) |
| staging_audit_events | **1** (`COMMIT_STAGING_IMPORT_V1`) |
| staging_developers | **0** |
| staging_projects | **0** |
| staging_assets | **0** |
| staging_pdfs | **0** |
| staging_news | **0** |
| staging_review_items | **0** |
| staging_conflict_candidates | **0** |
| staging_duplicate_candidates | **0** |

Session flags: `dry_run=false`, `staging_only=true`, `production_allowed=false`, `storage_write_allowed=false`.

## Safety

| Check | Result |
| --- | --- |
| Production connection | NO |
| Production changed | NO |
| Storage uploads | 0 |
| Auto-approve | NO |
| Auto-publish | NO |
| git commit / push / deploy | NOT_EXECUTED |

## Verdict

**CONDITIONAL_PASS** — controlled commit RPC succeeded and session is `COMMITTED`; entity business rows were **not** inserted by V1 RPC design. Next work: expand `commit_staging_import_v1` (or follow-on RPC) to apply entity arrays atomically.
