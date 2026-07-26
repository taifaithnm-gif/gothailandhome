# Staging DB Implementation Architecture

**Milestone:** STAGING_DB_COMMIT_IMPLEMENTATION_V1  
**Freeze baseline:** `ca503d07c368d793c5864cb072afda18b52c4a42`

## Layers

1. **Environment guard** (`supabase/environment.ts`) — STAGING_* only; isolation vs Production; commit gates.
2. **Lazy client** (`supabase/client.ts`) — no connect until explicit; refuses when not provisioned.
3. **Repositories** (`supabase/*-repository.ts`) — table adapters; forbidden as multi-insert “transactions”.
4. **Transaction adapter** — Postgres RPC `commit_staging_import_v1` / `rollback_staging_import_v1`.
5. **SQL** — `database/staging-migrations/` (STAGING ONLY; not Production train).
6. **Review persistence** — contract + optimistic `version`; no anonymous write API.
7. **CLI** — env-check / probe / prepare-payload / commit / rollback.

## Defaults

- `STAGING_COMMIT_ENABLED=false`
- `STAGING_STORAGE_UPLOAD_ENABLED=false` → `storage_status=PLANNED` only
- Real network paths skip with `SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED` when Staging missing
