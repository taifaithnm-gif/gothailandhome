# Staging DB Commit Implementation V1

**Status:** Local implementation complete. Real commit disabled until isolated Staging is provisioned.

## Components

- `src/lib/staging-db/supabase/` — STAGING_* client + RPC adapters
- `database/staging-migrations/` — staging-only SQL (not Production)
- Controlled commit CLI with multi-gate checks
- Review persistence contract + optimistic concurrency
- Migration static audit

## Defaults

- `STAGING_COMMIT_ENABLED=false`
- `STAGING_STORAGE_UPLOAD_ENABLED=false`
- No Production URL/credential fallback
