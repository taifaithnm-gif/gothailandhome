# Staging Rollback Runbook

```bash
npm run staging:db:rollback -- \
  --import-session <id> \
  --confirm-staging \
  --rollback-token <token>
```

Soft-deletes staging entities by import_session_id. Preserves audit events. Production blocked.
