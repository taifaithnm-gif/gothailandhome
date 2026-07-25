# Environment Variable Audit

**Date:** 2026-07-23
**Scope:** Staging-foundation env isolation work (uncommitted on RC `0eca210`)
**Production posture:** FREEZE — NO CUTOVER
**This round:** No commit / push / deploy

---

## Findings

### Browser vs server vars

| Class | Examples | Exposure |
| --- | --- | --- |
| Browser / public | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_FEATURE_P2_*` | Safe for client bundles |
| Server-only | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `POSTGRES_URL*`, `DATABASE_URL`, CRM/notification secrets | Must never be `NEXT_PUBLIC_` |

### Write-capable vars (elevated risk)

- `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` — bypasses RLS
- `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` / `DATABASE_URL` — direct SQL (migrations via `apply-migration.mjs`)
- Any webhook/API keys that mutate external systems when Phase 2 flags are on

### Preview may inherit Production

Code can classify `VERCEL_ENV=preview` via `resolveDeployEnv`, but **Owner console wiring is not done**. Until Preview env vars point at a dedicated staging Supabase project (and markers are set), Preview deployments may still bind to Production credentials. This is an **Owner/console** gap, not closed by code alone.

### Service role split

- Service-role access moved to `src/lib/supabase/service-env.ts` (`server-only`)
- `getSupabaseServiceRoleKey` **removed** from shared `src/lib/supabase/env.ts` (compat re-exports public getters only) so browser modules cannot pull the service-role graph through that path
- Admin client imports service-env explicitly

### Hardcoded prod project ref

- **No hardcoded production Supabase project ref** in application source for connection targeting
- Isolation uses markers `SUPABASE_PRODUCTION_PROJECT_REF` / `SUPABASE_STAGING_PROJECT_REF` + URL parse (`src/lib/env/supabase-guard.ts`)

### Auth site URL

- Account auth redirects use `resolvePublicSiteUrl()` (`src/lib/env/site-url.ts`)
- Preview prefers `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`; production fallback domain only when deploy env is production; local defaults to localhost — avoids silent prod redirect from Preview when site URL is unset correctly

### Deploy env detection

- `resolveDeployEnv` honors `APP_DEPLOY_ENV`, then `VERCEL_ENV`, with careful local/`next build` handling
- CI workflow sets `APP_DEPLOY_ENV=preview` + staging-shaped placeholders only

### Markers

| Marker | Purpose |
| --- | --- |
| `SUPABASE_PRODUCTION_PROJECT_REF` | Block non-prod from using prod ref |
| `SUPABASE_STAGING_PROJECT_REF` | Require staging ref for development/preview once staging exists |

---

## Risk matrix

| Risk | Likelihood (today) | Impact | Mitigation status |
| --- | --- | --- | --- |
| Preview/dev write to Production DB via inherited env | High until Owner acts | Critical | Code guards when markers set; **markers/wiring Owner-owned** |
| Service role leaked to client bundle | Low after split | Critical | Mitigated in code (`service-env` + no re-export) |
| Local `.env.local` prod-linked | High historically | Critical | Policy: do not migrate; Owner must provide staging secrets |
| Auth redirect to wrong origin | Medium if site URL unset on Preview | High | Mitigated by `resolvePublicSiteUrl` |
| CI using real prod secrets | Low | Critical | CI uses placeholders; service role intentionally unset |
| `main` push auto-deploys Production | Certain if push occurs | Critical | **Unchanged** — freeze / no push this round |

---

## Verdict

**Code isolation implemented** (deploy-env resolution, public/service split, site URL resolver, project-ref markers + fail-closed guard).

**Owner console wiring still required** (dedicated staging Supabase, Preview-only credentials, markers populated, confirm Preview does not inherit prod write credentials).

→ **CONDITIONAL** until Owner completes staging provisioning and Preview rewire.
