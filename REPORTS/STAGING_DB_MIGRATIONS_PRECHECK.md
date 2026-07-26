# APPLY_STAGING_MIGRATIONS_PRECHECK

**Date:** 2026-07-25  
**Branch:** `feat/staging-db-commit-v1`  
**Status:** STOPPED — probe connectivity blocker; migrations **NOT** applied

## Results

| Gate | Result |
| --- | --- |
| Migration static audit (`npm run staging:db:migration-audit`) | **PASS** (9/9, 0 errors) |
| Production reference scan | **PASS** (no public production table mutations) |
| RLS static (ENABLE + REVOKE PUBLIC) | **PASS** |
| RPC security (`search_path` + REVOKE PUBLIC; no SECURITY DEFINER) | **PASS** |
| Empty DB probe (`npm run staging:db:probe`) | **FAIL** |
| Migration applied | **NO** |
| STAGING_COMMIT_ENABLED | **false** |
| DATABASE_WRITES / STORAGE_UPLOADS | **0 / 0** |
| Production connection | **NO** |

## Probe failure (honest)

- Target host: `db.<STAGING_PROJECT_REF>.supabase.co:5432`
- DNS returns **IPv6 only**; TCP from this Mac mini **times out**
- Env isolation / host checks still **PASS** (credentials present and isolated)
- Optional `STAGING_DATABASE_POOLER_URL` is **not** configured

## Manual action (no secrets in chat)

1. Open **Supabase Dashboard** → project `gothailandhome-staging`
2. **Project Settings → Database**
3. Copy **Session mode** pooler connection string (host `*.pooler.supabase.com`, user `postgres.<project_ref>`)
4. Add only on this Mac mini to `.env.staging.local`:

   `STAGING_DATABASE_POOLER_URL=...`

5. Keep `STAGING_COMMIT_ENABLED=false`
6. Re-run: `npm run staging:db:probe`
7. If probe PASS, return to Cursor and explicitly approve **APPLY_STAGING_MIGRATIONS**

## Human confirmation required before apply

Even after probe PASS, do **not** auto-apply. Owner must explicitly approve applying the 9 files under `database/staging-migrations/`.
