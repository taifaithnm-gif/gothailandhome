# Staging Secret Rotation

**Status:** MANUAL_ACTION_REQUIRED  
**Project:** gothailandhome-staging  
**Reason:** Hosted Supabase CLI cannot reset database password or create/revoke `sb_secret_*` keys.

## Manual Dashboard steps (Mac mini / Chrome)

### A. Database password

1. Open: https://supabase.com/dashboard/project/xwbqvvzxdrtirnvpsjah/settings/database
2. Project must show name: **gothailandhome-staging** (not gothailandhome-db)
3. Section: **Database password**
4. Action: **Reset database password** (or Generate new password)
5. Copy the new password **only into the Terminal hidden prompt** in the next step — never into Cursor chat

### B. Secret / service role key

1. Open: https://supabase.com/dashboard/project/xwbqvvzxdrtirnvpsjah/settings/api-keys
2. Tab: **Publishable and secret API keys** (or **API Keys**)
3. Action: **Create new secret key** (name e.g. `staging-rotated-20260725`)
4. Copy the new `sb_secret_…` value **only into the Terminal hidden prompt**
5. After local verify succeeds: **Delete** the old compromised secret key
6. Do **not** touch Production project keys

### C. Apply on this Mac mini (no .env file editing)

```bash
cd /Users/jun/AI-Workspace/Projects/GoThailandHome
npm run staging:secrets:rotate -- --apply-after-dashboard
```

You will be prompted twice (hidden input):
1. Enter new Staging database password
2. Enter new Staging secret key (sb_secret_…)

Then the script rebuilds pooler/direct URLs, updates `.env.staging.local` atomically (mode 600), and runs env-check / probe / rls-test / schema-verify.

## Gates after apply

- STAGING_COMMIT_ENABLED remains false
- No Batch001 commit in this script
- No Production connection
