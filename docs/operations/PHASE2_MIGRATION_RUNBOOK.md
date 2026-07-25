# Phase 2 Migration Runbook (Staging Only)

**Status:** Documentation only.
**Release posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**RC baseline:** `0eca210` / `v2.0.0-rc1`
**Scope:** Apply Phase 2 SQL to an **isolated staging** database only. **Never production in this milestone.**

Companion docs: [`SUPABASE_STAGING_CREATION_CHECKLIST.md`](SUPABASE_STAGING_CREATION_CHECKLIST.md), [`PHASE2_MIGRATION_ROLLBACK_PLAN.md`](PHASE2_MIGRATION_ROLLBACK_PLAN.md), [`STAGING_POLICY.md`](STAGING_POLICY.md), [`DEPLOYMENT_WORKFLOW.md`](DEPLOYMENT_WORKFLOW.md).

---

## 1. Preconditions

All must be true before any `apply-migration` run:

- [ ] Staging Supabase project exists and is **not** Production (`SUPABASE_STAGING_PROJECT_REF` ≠ `SUPABASE_PRODUCTION_PROJECT_REF`).
- [ ] Shell env (or `.env.local`) points `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` at **staging only**.
- [ ] Confirmed connection target, e.g. host contains the staging project ref — not Production.
- [ ] Feature flags remain **OFF** until migrations verify clean ([`REPORTS/PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md`](../../REPORTS/PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md)).
- [ ] Owner acknowledges: no Production migration authorization this round.
- [ ] Snapshot/backup of staging is optional but recommended before Phase 2A/2B on a long-lived staging DB.

**Hard stop:** If `POSTGRES_*` resolves to Production, abort. Do not “try” Phase 2 SQL against Production “just to see.”

---

## 2. Tooling

Apply one file at a time:

```bash
node scripts/apply-migration.mjs <path-to.sql>
```

Behavior (from `scripts/apply-migration.mjs`):

- Loads missing keys from `.env.local` if present.
- Requires `POSTGRES_URL_NON_POOLING` **or** `POSTGRES_URL` **or** `DATABASE_URL`.
- Prefers **non-pooling** URL when both are set.
- Prints `{ "ok": true, "applied": "<file>" }` on success; non-zero exit on failure.

Do not invent alternate migration runners for this milestone. Do not use Production credentials in CI.

---

## 3. Staging-only apply order

### 3.A Greenfield staging (empty project)

Apply **Phase 1 chain first** (filename order), then Phase 2:

```bash
# Phase 1 foundation
node scripts/apply-migration.mjs supabase/migrations/20260714120000_init_property_foundation.sql
node scripts/apply-migration.mjs supabase/migrations/20260714183000_project_content_system.sql
node scripts/apply-migration.mjs supabase/migrations/20260714190000_platform_geography.sql
node scripts/apply-migration.mjs supabase/migrations/20260714200000_factory_m1_foundation.sql
node scripts/apply-migration.mjs supabase/migrations/20260714220000_wave1_hardening_multisource.sql
node scripts/apply-migration.mjs supabase/migrations/20260715120000_marketplace_foundation_m1.sql

# Phase 2A then Phase 2B
node scripts/apply-migration.mjs supabase/migrations/20260721100000_phase2a_customer_ops.sql
node scripts/apply-migration.mjs supabase/migrations/20260721120000_phase2b_acquisition_partners.sql
```

Then load synthetic seeds as needed (`supabase/seed.sql`, geography seed, Owner bootstrap scripts) — never Production dumps.

### 3.B Mirrored staging (Phase 1 already present)

If staging already matches Production’s Phase 1 schema (without Production PII):

```bash
node scripts/apply-migration.mjs supabase/migrations/20260721100000_phase2a_customer_ops.sql
node scripts/apply-migration.mjs supabase/migrations/20260721120000_phase2b_acquisition_partners.sql
```

Order is mandatory: **Phase2A → Phase2B**. Do not skip 2A.

---

## 4. Verification SQL ideas (table existence)

Run against staging after Phase2A:

```sql
select to_regclass('public.customer_profiles') as customer_profiles,
       to_regclass('public.customer_saved_items') as customer_saved_items,
       to_regclass('public.customer_saved_searches') as customer_saved_searches,
       to_regclass('public.customer_notification_prefs') as customer_notification_prefs,
       to_regclass('public.notification_outbox') as notification_outbox,
       to_regclass('public.marketplace_lead_events') as marketplace_lead_events,
       to_regclass('public.crm_sync_deliveries') as crm_sync_deliveries;
```

After Phase2B:

```sql
select to_regclass('public.acquisition_cases') as acquisition_cases,
       to_regclass('public.acquisition_evidence_items') as acquisition_evidence_items,
       to_regclass('public.acquisition_events') as acquisition_events,
       to_regclass('public.partner_orgs') as partner_orgs,
       to_regclass('public.partner_memberships') as partner_memberships;
```

RLS check (expect `relrowsecurity = true` for new public tables):

```sql
select c.relname, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'customer_profiles',
    'notification_outbox',
    'crm_sync_deliveries',
    'acquisition_cases',
    'partner_orgs',
    'partner_memberships'
  )
order by 1;
```

Extension:

```sql
select extname, extversion from pg_extension where extname = 'pgcrypto';
```

Record results in a `REPORTS/` entry (filename, timestamp, staging project ref, **staging-only**). Do not mark PASS without evidence.

---

## 5. Stop conditions

Stop immediately and do not continue the chain if:

| Condition | Action |
| --- | --- |
| Connection string / host is Production | Abort; revoke env mistake |
| Any `apply-migration` exits non-zero | Fix SQL/env; do not skip ahead |
| Expected `to_regclass(...)` is null | Treat as failed apply; investigate |
| RLS unexpectedly disabled on new tables | Do not enable flags; fix policies |
| Pressure to “just run on prod” | Refuse; cite freeze / no cutover |
| Flags already ON before migrate verify | Turn flags OFF; re-verify schema first |

---

## 6. After successful staging migrate

1. Keep all `FEATURE_P2_*` OFF until the T1–T10 smoke plan starts ([`PHASE2_T1_T10_STAGING_SMOKE_PLAN.md`](PHASE2_T1_T10_STAGING_SMOKE_PLAN.md)).
2. Do **not** apply the same files to Production in this milestone.
3. File a staging migration evidence note under `REPORTS/`.

---

## 7. Explicit non-goals

- Production apply of Phase2A/Phase2B
- Destructive down migrations
- Claiming migration PASS without SQL verification
- Enabling Production feature flags
