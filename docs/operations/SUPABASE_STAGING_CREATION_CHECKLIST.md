# Supabase Staging Creation Checklist

**Status:** Documentation only — Owner executes in Supabase console.
**Release posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**RC baseline:** `0eca210` / `v2.0.0-rc1`
**Goal:** Create an isolated staging Supabase project so Preview/Development never share Production credentials, users, or private data.

Companion docs: [`STAGING_POLICY.md`](STAGING_POLICY.md), [`OWNER_STAGING_SETUP_ACTIONS.md`](OWNER_STAGING_SETUP_ACTIONS.md), [`PHASE2_MIGRATION_RUNBOOK.md`](PHASE2_MIGRATION_RUNBOOK.md), [`VERCEL_PREVIEW_STAGING_SETUP.md`](VERCEL_PREVIEW_STAGING_SETUP.md).

---

## 0. Preconditions

- [ ] Owner has Supabase org access and can create a new project.
- [ ] Production project ref is known and will be recorded as `SUPABASE_PRODUCTION_PROJECT_REF` (marker only — not a secret).
- [ ] No Phase 2 cutover, production migration, or Production flag enablement is planned in this milestone.
- [ ] You will **not** dump or restore Production `auth.users`, customer tables, inquiries, sessions, or private Storage objects into staging.

---

## 1. Create the project

| Field | Suggested value |
| --- | --- |
| Project name | `gothailandhome-staging` |
| Region | **Southeast Asia (Singapore)** — or the region closest to Production |
| Compute / plan | Match team needs; start minimal if acceptable for smoke |
| Database password | Generate strong password; store only in Owner secret store (never commit) |

Record after create (Owner fills; do not paste secrets into git):

| Variable | Owner fill | Notes |
| --- | --- | --- |
| `SUPABASE_STAGING_PROJECT_REF` | `<staging-ref>` | Project Settings → General → Reference ID |
| `SUPABASE_PRODUCTION_PROJECT_REF` | `<production-ref>` | Marker used by `next.config` / `supabase-guard` to **block** Preview from Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<staging-ref>.supabase.co` | Staging URL only for Preview/Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<staging-anon>` | Preview/Development only |
| `SUPABASE_SERVICE_ROLE_KEY` | `<staging-service-role>` | Server-only; never `NEXT_PUBLIC_*`; never Production value in Preview |
| `POSTGRES_URL` | `<staging-pooled>` | Staging DB; scripts prefer non-pooling when available |
| `POSTGRES_URL_NON_POOLING` | `<staging-direct>` | Preferred by `scripts/apply-migration.mjs` |
| `NEXT_PUBLIC_SITE_URL` | Staging site URL (Preview alias or dedicated hostname) | Must match Auth Site URL / redirects |
| `APP_DEPLOY_ENV` | `preview` (Vercel Preview) or `development` (local) | Never set Preview to `production` |

---

## 2. Data policy (mandatory)

**Do copy / recreate via migrations + synthetic seed:**

- Schema from tracked SQL under `supabase/migrations/`
- Synthetic properties, geography, admin bootstrap users for smoke
- Empty or fake Storage objects under public `property-media` test paths only

**Do NOT copy from Production:**

- `auth.users` / sessions / refresh tokens
- Real customers, inquiries, marketplace leads with PII
- Private Storage objects or customer uploads
- Production service-role or anon keys into Preview/Development
- Production `POSTGRES_*` into any non-Production Vercel env

Staging may be wiped and reseeded at any time ([`STAGING_POLICY.md`](STAGING_POLICY.md) §6).

---

## 3. Auth configuration

In Supabase Dashboard → **Authentication** → **URL Configuration**:

| Setting | Staging value |
| --- | --- |
| Site URL | Same origin as `NEXT_PUBLIC_SITE_URL` for the smoke target (Preview alias or fixed staging host) |
| Redirect URLs | Include Preview deployment URL(s), local `http://localhost:3000/**`, and any stable staging hostname `https://…/**` |

Also verify:

- [ ] Email auth (or chosen providers) enabled for synthetic test accounts only.
- [ ] No Production Site URL left as the only allowed origin.
- [ ] Confirm magic-link / OAuth callbacks hit staging, not Production.

---

## 4. Production capability matrix (what staging must mirror)

Enumerate Production capabilities and the staging expectation. “None required” means no dedicated staging setup beyond schema defaults for this milestone.

| Capability | Production today | Staging requirement |
| --- | --- | --- |
| **Database** | Postgres with Phase 1 (+ not Phase 2 cutover) schema | Apply Phase 1 chain; then Phase 2A/2B only on staging when ready ([`PHASE2_MIGRATION_RUNBOOK.md`](PHASE2_MIGRATION_RUNBOOK.md)) |
| **Auth** | Supabase Auth | Separate Auth project; synthetic users only |
| **Storage** | `property-media` bucket (public read; admin write) | Create via init migration; synthetic media only |
| **Edge Functions** | None known required for Phase 2 site cutover | Skip unless a new dependency is documented |
| **RLS** | Enabled on app tables | Apply after tables exist; verify `relrowsecurity` |
| **Triggers** | Present in migrations as defined | Come from SQL migrations; do not hand-edit in Production |
| **Functions** | SQL helpers (e.g. `public.is_admin()`) from migrations | Same — via migrations |
| **Extensions** | `pgcrypto` (required by init / Phase 2 migrations) | Ensure `create extension if not exists pgcrypto` succeeds |
| **Cron** | None required for this milestone | Skip |
| **Realtime** | None required for this milestone | Skip |
| **Webhooks** | CRM optional (`CRM_WEBHOOK_*` when `FEATURE_P2_CRM_SYNC`) | Staging/sandbox endpoint only; never Production CRM secrets in Preview |

---

## 5. Schema split: Phase 1 vs Phase 2

### 5.1 Base migrations (schema) — apply in filename order on greenfield staging

Phase 1 foundation (examples; use full directory listing as source of truth):

1. `supabase/migrations/20260714120000_init_property_foundation.sql` — core tables, RLS, **`property-media` bucket**
2. `supabase/migrations/20260714183000_project_content_system.sql`
3. `supabase/migrations/20260714190000_platform_geography.sql`
4. `supabase/migrations/20260714200000_factory_m1_foundation.sql`
5. `supabase/migrations/20260714220000_wave1_hardening_multisource.sql`
6. `supabase/migrations/20260715120000_marketplace_foundation_m1.sql`

Phase 2 additive (staging-only for this milestone):

7. `supabase/migrations/20260721100000_phase2a_customer_ops.sql` — customer/ops/notifications/CRM tables
8. `supabase/migrations/20260721120000_phase2b_acquisition_partners.sql` — acquisition + partner portal tables

### 5.2 Data migrations vs seeds

| Kind | Purpose | Staging policy |
| --- | --- | --- |
| **Base migrations** | DDL, RLS, buckets, functions | Required; tracked in git; apply via `scripts/apply-migration.mjs` |
| **Data migrations** | Controlled data transforms inside migration files (if any) | Prefer none that touch Production-like PII; review SQL before apply |
| **Seeds** | Synthetic fixtures (`supabase/seed.sql`, `supabase/seed_platform_geography.sql`, etc.) | Allowed and preferred for smoke; never a Production dump |

---

## 6. Storage bucket order

Per `20260714120000_init_property_foundation.sql`:

1. Apply init migration first so `storage.buckets` insert for **`property-media`** runs before later media-dependent workflows.
2. Confirm bucket exists and is public-read as defined by migration policies.
3. Do not invent extra private Production buckets for staging smoke unless a migration creates them.
4. Upload only synthetic test objects for smoke; delete freely.

---

## 7. RLS order after migrations

1. Apply migration SQL (policies are embedded in migrations).
2. Verify RLS enabled on new tables, e.g.:

```sql
select n.nspname, c.relname, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;
```

3. Spot-check deny: anon cannot read admin-only tables; authenticated non-admin cannot escalate.
4. Do not disable RLS “to make smoke pass.”

---

## 8. API keys placement (Vercel / local)

| Key / URL | Preview | Development (local) | Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Staging | Staging | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging | Staging | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging only | Staging only | Production only |
| `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` | Staging | Staging | Production (Owner-only ops) |
| `SUPABASE_STAGING_PROJECT_REF` | Staging ref | Staging ref | May be set as marker |
| `SUPABASE_PRODUCTION_PROJECT_REF` | Production ref (block list) | Production ref (block list) | Production ref (allow list) |
| `APP_DEPLOY_ENV` | `preview` | `development` | `production` |
| `NEXT_PUBLIC_SITE_URL` | Preview/staging URL | `http://localhost:3000` | Public site URL |

**Remove Preview inheritance of Production DB vars** — see [`VERCEL_PREVIEW_STAGING_SETUP.md`](VERCEL_PREVIEW_STAGING_SETUP.md). If Preview still points at Production, `next.config` + instrumentation guards should **fail the build** when project refs mismatch.

---

## 9. Service role boundaries

- Service role bypasses RLS — use only in trusted server scripts and Owner-run ops against **staging** during this milestone.
- Never expose service role to the browser or commit it.
- Never use Production service role to “fix” Preview.
- CI uses placeholders only (see `.github/workflows/ci.yml`); CI must not receive real service role keys.

---

## 10. Verification after creation

- [ ] Project name/region recorded; staging ref ≠ production ref.
- [ ] Auth Site URL + redirect URLs match intended smoke host.
- [ ] Phase 1 migrations applied (greenfield) OR schema confirmed mirrored without Production data copy.
- [ ] `property-media` bucket exists.
- [ ] RLS enabled on public app tables.
- [ ] `pgcrypto` extension present: `select * from pg_extension where extname = 'pgcrypto';`
- [ ] Synthetic seed loaded; can sign in as test admin/customer.
- [ ] Local or Preview build with staging env succeeds (`APP_DEPLOY_ENV=preview` or `development`).
- [ ] Intentionally wrong combo (Preview + Production URL) fails guard — do not proceed if guard is bypassed.
- [ ] No Production flag enablement; no Production migration in this milestone.

**Stop on failure:** If any verification step fails, do not wire Vercel Preview to the incomplete project and do not start the T1–T10 train.

---

## 11. Out of scope this round

- Production schema changes / Phase 2 migrations on Production
- Enabling any `FEATURE_P2_*` in Production
- Changing Vercel Production Branch or Production Alias
- Copying Production users or private media into staging
