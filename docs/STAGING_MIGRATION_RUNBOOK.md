# Staging Migration Runbook

1. `npm run staging:db:migration-audit` must PASS
2. Confirm Staging project isolation via `staging:db:env-check`
3. Apply SQL from `database/staging-migrations/` **only** to Staging
4. Require `--confirm-staging` for any apply runner
5. Never apply to Production / `supabase/migrations` Production train
