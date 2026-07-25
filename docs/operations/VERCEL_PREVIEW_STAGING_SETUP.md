# Vercel Preview → Staging Supabase Setup

**Status:** Documentation / Owner console checklist. No Vercel settings are changed by writing this file.
**Release posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**RC baseline:** `0eca210` / `v2.0.0-rc1`

Companion docs: [`SUPABASE_STAGING_CREATION_CHECKLIST.md`](SUPABASE_STAGING_CREATION_CHECKLIST.md), [`OWNER_STAGING_SETUP_ACTIONS.md`](OWNER_STAGING_SETUP_ACTIONS.md), [`STAGING_POLICY.md`](STAGING_POLICY.md).

---

## 1. Target mapping

| Vercel environment | Supabase target | `APP_DEPLOY_ENV` |
| --- | --- | --- |
| **Preview** | Staging project | `preview` |
| **Development** (local / `vercel env pull` for dev) | Staging project | `development` |
| **Production** | Production project | `production` |

Never point Preview or Development at Production Supabase. Never point Production at Staging.

---

## 2. Remove Preview inheritance of Production DB vars

In Vercel → Project → **Settings** → **Environment Variables**:

1. For each of the following, ensure **Preview** (and Development if used) values are **staging**, not Production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` (if set in Vercel at all — prefer local Owner machine for migrations)
   - `SUPABASE_STAGING_PROJECT_REF`
   - `SUPABASE_PRODUCTION_PROJECT_REF` (marker for guards — Production ref as block list on Preview)
   - `NEXT_PUBLIC_SITE_URL` (Preview/staging URL)
   - `APP_DEPLOY_ENV=preview` on Preview
2. If a variable was created for “All Environments,” **split** it: Production keeps Production values; Preview gets Staging values.
3. After changes, **redeploy** a Preview build so baked `NEXT_PUBLIC_*` values refresh.

**What NOT to put in Preview:** any Production anon key, service role, Postgres URL, or Production project URL.

---

## 3. Keep Deployment Protection

- Leave Vercel **Deployment Protection** (SSO / authentication) enabled on Preview.
- Do **not** publicize Preview URLs in marketing, robots, or public docs as a stable public site.
- For smoke access: Owner-authenticated session, team seat, or a narrowly scoped Protection Bypass for a dedicated staging hostname only ([`STAGING_POLICY.md`](STAGING_POLICY.md) §2).
- “Blocked by SSO so we assume PASS” is **not** a pass ([`STAGING_POLICY.md`](STAGING_POLICY.md) §9).

---

## 4. Safe smoke access rules

- Use Preview for staging smoke only after staging Supabase is wired.
- Prefer a stable Preview/branch alias for checklists; still treat it as non-public.
- Do **not** change **Production Alias** (`www` / apex) in this round.
- Do **not** change **Production Branch** in this round (even if a future `release` branch is planned).

---

## 5. Build-time / runtime isolation guards

Preview builds that accidentally use the Production project ref should **fail**:

- `next.config.ts` — refuses Preview/Development targeting Production Supabase ref; refuses Production targeting Staging ref.
- Instrumentation / `src/lib/env/supabase-guard.ts` — same isolation rules at runtime.

If Preview still inherits Production vars, expect build or boot failure. That is correct behavior — fix env mapping; do not disable guards.

Required markers (Owner-filled, non-secret refs):

- `SUPABASE_PRODUCTION_PROJECT_REF`
- `SUPABASE_STAGING_PROJECT_REF`
- `APP_DEPLOY_ENV`

---

## 6. Feature flags on Preview only

When the T1–T10 train runs ([`PHASE2_T1_T10_STAGING_SMOKE_PLAN.md`](PHASE2_T1_T10_STAGING_SMOKE_PLAN.md)):

- Toggle `FEATURE_P2_*` / `NEXT_PUBLIC_FEATURE_P2_*` in **Preview** (and local Development) only.
- Leave Production flags **OFF**.
- Redeploy Preview after changing `NEXT_PUBLIC_*`.

---

## 7. Verification

- [ ] Preview deployment env shows staging Supabase URL (ref matches `SUPABASE_STAGING_PROJECT_REF`).
- [ ] Production env unchanged and still Production-backed.
- [ ] Preview build succeeds with staging vars.
- [ ] Deliberate misconfig (Preview + Production URL) fails guard in a throwaway check — then restore correct staging vars.
- [ ] Deployment Protection still on.
- [ ] Production Alias / Production Branch untouched.

**Stop on failure:** If Preview cannot be isolated from Production DB, do not enable any Phase 2 flags and do not claim staging cutover progress.

---

## 8. Out of scope this round

- Repointing Vercel Production Branch to `release`
- Promoting Preview to Production
- Enabling Phase 2 flags in Production
- Applying Phase 2 migrations to Production
