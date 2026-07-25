# Staging DB Security Guards

## Production hard block

Throws `ProductionWriteBlockedError` when any of:

- `NODE_ENV=production`
- `VERCEL_ENV=production`
- deploy env = production
- hostname contains production
- active URL equals Production Supabase/DB URL
- `NEXT_PUBLIC_*` marked production
- service_role under production env

## Staging write gate (future real commit)

Requires all of:

- `NODE_ENV != production`
- `STAGING_IMPORT_ENABLED=true`
- `STAGING_DATABASE_URL` present
- not equal to `PRODUCTION_DATABASE_URL`
- `--confirm-staging`
- batch `READY_FOR_STAGING_REVIEW`
- sealed ZIP validated
- commit plan validated
- reviewer gate configured

## Real commit

Always throws `StagingCommitDisabledError` / CLI prints `STAGING_COMMIT_DISABLED`.

Simulation does **not** require `STAGING_DATABASE_URL`.
