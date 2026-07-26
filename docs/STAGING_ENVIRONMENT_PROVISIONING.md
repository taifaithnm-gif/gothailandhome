# Staging Environment Provisioning

## MANUAL ACTION (Owner)

**Device:** Mac mini  
**Software:** Chrome or Safari  
**Website:** Supabase Dashboard

### Steps

1. Create a **new independent** Project (not a schema inside Production).
2. Suggested name: `gothailandhome-staging`
3. Choose region same/adjacent to Production, but **separate Project**.
4. Save locally (never to chat/git):
   - Project Ref
   - Project URL
   - Database connection string
   - anon key
   - service_role key
5. Create `/Users/jun/AI-Workspace/Projects/GoThailandHome/.env.staging.local` from `.env.staging.example`
6. Fill **STAGING_*** variables only.
7. Do **not** copy into `.env.production` or Vercel Production.
8. Do **not** commit `.env.staging.local`.

### After completion

Return to Cursor and run:

```bash
npm run staging:db:env-check
```
