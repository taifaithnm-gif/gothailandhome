# STAGING_DB_COMMIT_DESIGN_BASELINE

**Date:** 2026-07-25
**HEAD:** `0eca210a72a559a1ce0291f16d72120e401d91a3` (main / origin/main / v2.0.0-rc1)
**Status:** FREEZE CURRENT PRODUCTION — NO CUTOVER

## Current database architecture

- **Stack:** Supabase (Postgres) + `@supabase/supabase-js` / `@supabase/ssr`
- **Clients:** `src/lib/supabase/client.ts`, `server.ts`, `admin.ts` (service_role)
- **Types:** `src/lib/supabase/types.ts`
- **Migrations:** `supabase/migrations/` (Phase1–Phase2 applied history)
- **No** `src/lib/db/` package; no Prisma

## Current tables (production catalog / ops)

- Catalog: `developers`, `property_projects`, `properties`, `property_media`, …
- Factory: `import_batches`, `import_batch_items`, listing duplicate/verification tables
- Phase2: customer ops, acquisition, partners, `partner_audit_events`
- Soft-delete: present on some factory/ops patterns; staging tables not yet created
- RLS: enabled on many ops tables (admin-oriented)
- Audit: `partner_audit_events`, `listing_verification_events` — **no** staging import audit table yet

## Environment isolation

- `src/lib/env/supabase-guard.ts` — project-ref isolation (dev/preview vs production)
- `src/lib/env/deploy-env.ts` — deploy classification
- Staging import framework hard flags: dry-run / no DB / no storage
- **Gap before this milestone:** no staging-db-specific Production hard block for commit path

## Write entry points (risk)

| Entry | Risk |
| --- | --- |
| `createServiceClient()` | service_role — Production capable |
| Factory `factory:apply` | Production apply path |
| `db:apply` / migrations | Can mutate live DB |
| Staging import V1 | Commit intentionally missing |
| Staging DB Design V1 | Simulation only + hard blocks |

## service_role

Present in `src/lib/supabase/service-env.ts` / `admin.ts`.
Staging DB Design **must not** use it this milestone.

## Review / import session tables

- **Not in DB yet** — Review Console is filesystem JSON under `.work/review-console/`
- Import session is in-memory / JSON (`import-session.json`)

## Needs new tables

All `staging_*` tables listed in schema design.

## Reuse

- Canonical IDs later → Production `developers` / `property_projects` (read/link only after gates)
- Existing env guard patterns

## Forbid touching

- Production catalog tables
- Live Staging DB (none connected this round)
- `supabase/migrations` auto-apply of staging drafts
- Feature flags / Vercel / Production env vars

## Verdict

**BASELINE_AUDIT: PASS** — safe to design; not safe to implement real commit yet.
