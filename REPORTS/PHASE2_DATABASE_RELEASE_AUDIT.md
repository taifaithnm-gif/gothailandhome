# Phase 2 Database Release Audit

**Date:** 2026-07-21
**Migrations reviewed (not executed against production):**

1. `supabase/migrations/20260721100000_phase2a_customer_ops.sql`
2. `supabase/migrations/20260721120000_phase2b_acquisition_partners.sql`

**Result:** **PASS**

---

## Execution order

1. Confirm Phase 1 chain applied through `20260715120000_marketplace_foundation_m1.sql`
2. Apply `…100000_phase2a_customer_ops.sql`
3. Apply `…120000_phase2b_acquisition_partners.sql`

## Additive / rollback safety

- `create table if not exists`, `create index if not exists`, `add column if not exists` only.
- **No** destructive `DROP` statements.
- Rollback preference: disable flags; leave tables. Manual reverse drops Owner-only if required.

## Indexes

- Saved searches by user
- Notification outbox pending
- Lead events by lead
- CRM deliveries by status
- Acquisition by status + email/created (rate limit support)
- Acquisition events by case

## Constraints

- Check constraints on kinds, frequencies, statuses, roles.
- Unique partner membership `(org_id, user_id)` and invite `token_hash`.
- FKs to `auth.users` and `marketplace_leads` with cascade/set null.

## RLS & permissions

- Customer tables: own-row policies.
- Ops/CRM/acquisition admin: `public.is_admin()`.
- Acquisition insert allowed for anon/authenticated (intake).
- Partner org/membership/stewardship/handoff scoped to active members.

## Release notes

- Do not enable ACCOUNT/OPS/ACQUISITION/PARTNER flags before both migrations succeed.
- MAP/TOOLS/AI/ANALYTICS need no Phase 2 schema.

## Decision

**PASS** — safe for Owner staging apply; production apply remains Owner-gated.
