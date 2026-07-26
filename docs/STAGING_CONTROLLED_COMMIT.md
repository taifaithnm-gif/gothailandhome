# Controlled Staging Commit

Gates required:

- STAGING_IMPORT_ENABLED=true
- STAGING_COMMIT_ENABLED=true
- --confirm-staging
- --batch
- --expected-sealed-digest
- migration audit PASS
- env isolation PASS
- payload hash verified

Default: `STAGING_COMMIT_DISABLED`.
