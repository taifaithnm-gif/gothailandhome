# Owner Staging Setup Actions

**Audience:** Owner only (Supabase / Vercel / GitHub consoles).
**Status:** Checklist — execute in order; stop on failure.
**Release posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**RC baseline:** `0eca210` / `v2.0.0-rc1`
**Secrets:** Never paste real keys into git, chat logs, or tickets. Variable **names** only below.

---

## Order of operations

1. Supabase staging project
2. Apply/verify migrations on staging (Owner machine with staging `POSTGRES_*`)
3. Vercel Preview/Development env → staging
4. GitHub branch protection on `main`
5. Smoke access path (SSO/bypass)
6. Only then: T1–T10 on Preview

Do **not** change Production Alias, Production Branch, Production flags, or Production migrations in this round.

---

## Step 1 — Supabase (create staging)

**Console:** [Supabase Dashboard](https://supabase.com/dashboard)

| # | Menu path | Action |
| --- | --- | --- |
| 1.1 | Organization → **New project** | Name: `gothailandhome-staging`; Region: Southeast Asia (Singapore) or closest to Production |
| 1.2 | **Project Settings → General** | Copy Reference ID → store as `SUPABASE_STAGING_PROJECT_REF` |
| 1.3 | **Project Settings → API** | Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`; anon → `NEXT_PUBLIC_SUPABASE_ANON_KEY`; service_role → `SUPABASE_SERVICE_ROLE_KEY` (password manager only) |
| 1.4 | **Project Settings → Database** | Copy connection strings → `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING` |
| 1.5 | **Authentication → URL Configuration** | Site URL = intended staging/Preview origin; Redirect URLs include Preview + `http://localhost:3000/**` |
| 1.6 | Data policy | **Do not** import Production users, inquiries, sessions, or private Storage |

**Also record (marker, not secret):** `SUPABASE_PRODUCTION_PROJECT_REF` from the Production project’s Reference ID.

**Verify:** Staging ref ≠ Production ref; Auth URLs are staging-oriented.
**Stop on failure:** If Production credentials were used by mistake, rotate/revoke and start over — do not continue to Vercel.

Detailed checklist: [`SUPABASE_STAGING_CREATION_CHECKLIST.md`](SUPABASE_STAGING_CREATION_CHECKLIST.md).

---

## Step 2 — Migrations (Owner workstation)

**Console:** Local terminal only (not Supabase SQL editor required, but allowed for verify).

1. Export/set **staging** `POSTGRES_URL_NON_POOLING` (or `POSTGRES_URL`) in the shell — confirm host contains staging ref.
2. Follow [`PHASE2_MIGRATION_RUNBOOK.md`](PHASE2_MIGRATION_RUNBOOK.md) (Phase 1 chain if greenfield; then Phase2A → Phase2B).
3. Run verification SQL (table existence + RLS).
4. Seed synthetic data only.

**What NOT to put:** Production `POSTGRES_*` in the shell for this step.
**Verify:** `apply-migration` JSON ok; expected tables present.
**Stop on failure:** Do not wire Vercel; do not enable flags. See [`PHASE2_MIGRATION_ROLLBACK_PLAN.md`](PHASE2_MIGRATION_ROLLBACK_PLAN.md) for staging reset.

---

## Step 3 — Vercel (Preview → Staging)

**Console:** Vercel → Project `gothailandhome` → **Settings → Environment Variables**

| Variable | Preview | Development | Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Staging | Staging | Production (unchanged) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging | Staging | Production (unchanged) |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging | Staging | Production (unchanged) |
| `SUPABASE_STAGING_PROJECT_REF` | Staging ref | Staging ref | Optional marker |
| `SUPABASE_PRODUCTION_PROJECT_REF` | Prod ref (block) | Prod ref (block) | Prod ref |
| `APP_DEPLOY_ENV` | `preview` | `development` | `production` |
| `NEXT_PUBLIC_SITE_URL` | Preview/staging URL | `http://localhost:3000` | Public site URL |
| `FEATURE_P2_*` / `NEXT_PUBLIC_FEATURE_P2_*` | Leave **false** until smoke train | false | **false** (do not enable) |

**Menu path notes:**

- Split any “All Environments” DB vars so Preview does not inherit Production.
- **Settings → Deployment Protection:** keep enabled.
- **Settings → Domains / Production Branch:** **do not change** this round.
- Redeploy Preview after env edits.

**What NOT to put:** Production anon/service/Postgres values in Preview or Development.
**Verify:** New Preview deployment builds; Supabase URL host matches staging ref; Production deployment env untouched.
**Stop on failure:** If build fails due to project-ref guard, fix Preview vars — do not disable `next.config` / instrumentation guards. Details: [`VERCEL_PREVIEW_STAGING_SETUP.md`](VERCEL_PREVIEW_STAGING_SETUP.md).

---

## Step 4 — GitHub (branch protection)

**Console:** GitHub repo → **Settings → Branches** (or **Rules → Rulesets**)

Protect **`main`** now:

- Require PR, approvals, conversation resolution
- Require status check: **`typecheck-lint-test-build`**
- Block force push; block deletion; restrict direct push
- Include administrators

Optional later: protect future `release` branch — **still do not** change Vercel Production Branch this round.

Fill [`.github/CODEOWNERS`](../../.github/CODEOWNERS) placeholders with real usernames (Owner only — do not invent).

**Verify:** A test PR shows the required check; force-push to `main` is rejected for admins too.
**Stop on failure:** If the check name does not appear, run CI on a PR first. Details: [`GITHUB_BRANCH_PROTECTION_CHECKLIST.md`](GITHUB_BRANCH_PROTECTION_CHECKLIST.md).

---

## Step 5 — Smoke access

**Consoles:** Vercel (Protection) + browser

- Ensure Owner/team can open Preview past SSO, **or** configure a scoped bypass for a dedicated staging host only.
- Do not publicize Preview URLs.
- Do not treat “Login – Vercel” as an application PASS.

**Stop on failure:** If smoke cannot authenticate to the app, do not start T1–T10.

---

## Step 6 — Staging flag train (only after 1–5)

**Console:** Vercel → Environment Variables (Preview) + redeploy

Follow [`PHASE2_T1_T10_STAGING_SMOKE_PLAN.md`](PHASE2_T1_T10_STAGING_SMOKE_PLAN.md) one train at a time.

**What NOT to do:** Enable any `FEATURE_P2_*` in Production; apply Phase 2 SQL to Production; change Production Alias/Branch.

**Stop on failure:** Turn Preview flags OFF; leave additive tables or reset staging per rollback plan; leave Production frozen.

---

## Final Owner attestation (template)

```
Date:
Staging project ref: (no secrets)
Preview deployment URL/id:
Migrations applied on staging: yes/no (list files)
Production env changed: NO
Production flags enabled: NO
Production migrations applied: NO
Branch protection on main: yes/no
Ready for T1–T10: yes/no
```
