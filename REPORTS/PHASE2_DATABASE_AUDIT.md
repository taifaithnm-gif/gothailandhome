# Phase 2 Database Audit

**Date:** 2026-07-21
**Migrations audited (not executed):**
- `supabase/migrations/20260721100000_phase2a_customer_ops.sql`
- `supabase/migrations/20260721120000_phase2b_acquisition_partners.sql`
**Result:** **PASS** (additive, production-safe if applied in order)

---

## Order

| # | File | Depends on |
| --- | --- | --- |
| 1 | Phase 1 chain through `20260715120000_marketplace_foundation_m1.sql` | existing prod |
| 2 | `20260721100000_phase2a_customer_ops.sql` | `marketplace_leads`, `auth.users`, `is_admin()` |
| 3 | `20260721120000_phase2b_acquisition_partners.sql` | `marketplace_leads`, `auth.users`, `is_admin()` |

## Additive-only verification

- Uses `create table if not exists`, `create index if not exists`, `add column if not exists`.
- **No** `DROP TABLE` / destructive column drops found.
- Does not rewrite Phase 1 catalog tables beyond nullable additive columns on `marketplace_leads`.

## Foreign keys & indexes

- Customer tables FK → `auth.users` with cascade/set null as appropriate.
- Lead events / CRM deliveries FK → `marketplace_leads`.
- Acquisition evidence/events FK → `acquisition_cases`.
- Partner memberships/invites/stewardships/handoffs FK → `partner_orgs` / users.
- Status/inbox indexes present (`status + created_at`, email rate-limit support index).

## RLS

- Customer data: own-row policies.
- Ops/CRM/acquisition admin: `public.is_admin()`.
- Acquisition insert: anon/authenticated insert allowed (intake); reads admin-scoped.
- Partner org/membership policies scoped to active members.

## Rollback strategy

1. **Preferred:** leave tables; keep all feature flags OFF (app ignores new tables).
2. **Schema rollback (manual, Owner-only):** drop Phase 2 tables/policies in reverse dependency order; remove additive columns from `marketplace_leads` only if unused.
3. No automated down migration shipped (document as operational runbook).

## Data compatibility

- Existing Phase 1 leads remain valid; new columns nullable.
- Empty partner/acquisition tables safe until seeded.

## Production safety

- Do **not** enable acquisition/partner/account flags before migration apply.
- Rate-limit helper fails open if count query errors (P2 note) — still safe for staging with monitoring.

## Decision

**PASS** — migrations approved for staging apply (Owner executes; this audit did not run them).
