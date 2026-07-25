# Production Hard Block Red Team

Exercised via `test:architecture-freeze` and `test:staging-db-design`:

- NODE_ENV=production → blocked
- VERCEL_ENV=production → blocked
- NEXT_PUBLIC_APP_ENV=production → blocked
- hostname/URL production markers → blocked
- missing --confirm-staging → blocked
- staging:db:commit → STAGING_COMMIT_DISABLED
- simulation mode → allowed

DATABASE_WRITES=0 STORAGE_UPLOADS=0 throughout.

**Verdict:** PASS
