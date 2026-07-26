# APPLY_STAGING_MIGRATIONS

**Date:** 2026-07-25  
**Branch:** `feat/staging-db-commit-v1`  
**Project:** `gothailandhome-staging` (ref masked)  
**Connection:** SESSION_POOLER  

## Result

| Gate | Result |
| --- | --- |
| ENV_CHECK | PASS |
| MIGRATION_AUDIT | PASS |
| EMPTY_DB_PROBE (pre) | PASS |
| Migrations expected | 9 |
| Migrations applied | 9 |
| Migration history | PASS |
| SCHEMA_VERIFY | PASS |
| RLS_LIVE_VALIDATION | PASS |
| RPC_SECURITY | PASS |
| EMPTY_DB_PROBE (post) | PASS |
| SCHEMA_WRITES | 10 (history table + 9 migration files) |
| BUSINESS_DATA_WRITES | 0 |
| BATCH001_COMMITTED | NO |
| STAGING_COMMIT_ENABLED | false |
| STORAGE_UPLOADS | 0 |
| PRODUCTION_CONNECTION | NO |
| STAGING_SECRET_ROTATION | RECOMMENDED |

## Applied files

1. `20260725_001_staging_import_sessions.sql`
2. `20260725_002_staging_entities.sql`
3. `20260725_003_staging_review_items.sql`
4. `20260725_004_staging_audit_events.sql`
5. `20260725_005_staging_indexes.sql`
6. `20260725_006_staging_rls.sql`
7. `20260725_007_staging_constraints.sql`
8. `20260725_008_staging_commit_rpc.sql`
9. `20260725_009_staging_rollback_rpc.sql`

## Evidence paths

- `.work/staging-db/BATCH-GTH-20260724-001/implementation/migration-apply.json`
- `.work/staging-db/BATCH-GTH-20260724-001/implementation/schema-verify.json`
- `.work/staging-db/BATCH-GTH-20260724-001/implementation/rls-live.json`

## Next

`RUN_BATCH001_CONTROLLED_STAGING_COMMIT` (not executed this milestone)
