# Staging Foundation — Implementation Report

**Date:** 2026-07-23
**RC HEAD:** `0eca210a72a559a1ce0291f16d72120e401d91a3` (`v2.0.0-rc1` annotated; `origin/main` aligned)
**Working tree:** MODIFIED (prior Phase 2 docs + this staging foundation) — **not committed**
**Production posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**This round:** No commit / push / deploy

---

## Executive summary

Staging foundation milestone delivers **code and documentation** to make an isolated Preview/staging path possible: env isolation, service-role split, CI verify workflow, Phase2A/2B policy re-run hardening, Windows01 import adapter framework, and honest status reports. It does **not** provision staging infrastructure, rewire Vercel, or cut over Production. Production remains on RC1 with flags off and Phase 2 migrations unapplied.

---

## Deliverables implemented in code (uncommitted)

| Area | What landed |
| --- | --- |
| Deploy env | `resolveDeployEnv` (`VERCEL_ENV` / `APP_DEPLOY_ENV`) |
| Site URL | `resolvePublicSiteUrl` for auth redirects |
| Supabase public vs service | `public-env.ts` + `service-env.ts`; service role removed from shared `env.ts` |
| Isolation guard | Project-ref markers + fail-closed checks |
| Instrumentation / config | Supporting `.env.example`, `instrumentation.ts`, related client/server edits |
| Migrations | Phase2A/2B `DROP POLICY IF EXISTS` (never applied anywhere; in-place edit documented) |
| CI | `.github/workflows/ci.yml` — npm ci, typecheck, lint, test, build; placeholder staging env; no prod deploy/migrate/service role |
| Windows01 | `src/lib/integrations/windows01/` adapter + validation + review-state + production hard block |
| Contract test scaffold | `scripts/test-staging-foundation.mjs` |

---

## Reports written this round

See companion files under `REPORTS/` listed at the end of the parent request (baseline, env audit, migration safety, CI, smoke matrix, Windows01 readiness, security audit, this implementation report).

---

## What Owner must do

1. Provision a **dedicated staging Supabase** project (independent credentials from Production).
2. Set Preview (and local) env to staging-only; populate `SUPABASE_PRODUCTION_PROJECT_REF` / `SUPABASE_STAGING_PROJECT_REF`.
3. Confirm Preview does **not** inherit Production write credentials (service role / Postgres).
4. Resolve Preview Deployment Protection so smoke can actually run (team auth or scoped bypass).
5. Plan Vercel **Production Branch** move off `main` (or equivalent manual-only prod builds) — **not done this round**.
6. Approve staging migration apply window only after isolation is proven.

---

## Blockers (honest)

| Blocker | Status |
| --- | --- |
| No staging Supabase yet | **Blocks** migrations, flag train, smoke |
| Vercel Preview may still inherit Production env | **Blocks** safe Preview testing |
| `main` → Production auto-deploy still true | **CRITICAL** — any push to `main` remains a live risk until Owner changes Vercel Git mapping |
| Smoke matrix T1–T10 | All **NOT_RUN** |
| Windows01 contract | `WAITING_FOR_WINDOWS01_CONTRACT` |

---

## Local verification (2026-07-23)

| Gate | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — **64/64** scripts |
| `npm run build` (CI staging placeholders) | PASS |
| Preview→Production Supabase isolation | PASS (fail-closed) |
| Production migration | NOT_EXECUTED |
| Production flags | UNCHANGED_OFF |
| Commit / push / deploy | NOT_EXECUTED |

---

## Suggested next milestone

**OWNER STAGING PROVISIONING & PREVIEW REWIRE** — not cutover.

Goal: isolated staging DB + Preview env + protection access + markers verified, then re-open smoke matrix. Do **not** promote to Production, do **not** enable Production flags, do **not** apply Phase 2 migrations to Production.

---

## Verdict

Staging foundation **code/docs milestone complete for local tree**. Infrastructure and Owner console steps remain open → overall release path stays **CONDITIONAL / BLOCKED for cutover**. Production freeze holds.
