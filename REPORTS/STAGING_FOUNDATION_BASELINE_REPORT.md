# Staging Foundation — Baseline Report

**Date:** 2026-07-23
**Milestone:** Staging foundation (code + docs + CI scaffold)
**Production posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**This round:** No commit, no push, no deploy

---

## Git alignment

| Check | Value | Result |
| --- | --- | --- |
| HEAD | `0eca210a72a559a1ce0291f16d72120e401d91a3` | — |
| `origin/main` | `0eca210a72a559a1ce0291f16d72120e401d91a3` | **PASS** — aligned with HEAD |
| Tag `v2.0.0-rc1` | annotated tag → same commit | **PASS** — RC tag alignment |
| Working tree | Modified + untracked | **NOT clean** |

Committed tree at HEAD matches RC / `origin/main`. There is **no code drift vs RC for the committed tree**. All staging-foundation work in this round exists as **uncommitted** local changes on top of RC.

---

## Working tree categories (uncommitted / untracked)

Honest inventory of what sits on top of clean RC HEAD:

### Prior Phase 2 reports / release docs (modified or untracked)

- Modified: `PHASE2_PREPARATION_REPORT.md`, `RELEASES/Phase2/*`, `REPORTS/PHASE2_RC_FINAL_REPORT.md`, `REPORTS/PHASE2_RELEASE_READINESS.md`, `docs/phase2/PHASE2_RELEASE_PLAN.md`
- Untracked prior staging/cutover evidence: `REPORTS/PHASE2_*` cutover/blocker/smoke/feature-flag/drift/evidence reports, `REPORTS/QUARANTINE/`

### Operations policy docs (untracked)

- `docs/operations/DEPLOYMENT_WORKFLOW.md`
- `docs/operations/PRODUCTION_RELEASE_POLICY.md`
- `docs/operations/STAGING_POLICY.md`

### New staging foundation (this round — uncommitted)

- Env isolation: `src/lib/env/*`, `src/lib/supabase/public-env.ts`, `src/lib/supabase/service-env.ts`, edits to `env.ts` / clients / `admin.ts` / account actions / `.env.example` / `next.config.ts` / `instrumentation.ts` / `package.json`
- Migrations (in-place Phase2A/2B policy hardening): `supabase/migrations/20260721100000_phase2a_customer_ops.sql`, `…phase2b_acquisition_partners.sql`
- Windows01 integration framework: `src/lib/integrations/windows01/`
- CI: `.github/workflows/ci.yml`
- Contract test: `scripts/test-staging-foundation.mjs`
- These `REPORTS/STAGING_FOUNDATION_*.md` / related reports

---

## Environment & deploy risk (unchanged this round)

| Risk | Status | Notes |
| --- | --- | --- |
| Local `.env.local` historically prod-linked | **OPEN** | Per `docs/operations/STAGING_POLICY.md` — only non-prod Postgres credential available locally has been production-linked; do not apply migrations against it |
| Vercel Git: `main` → Production | **CRITICAL** | Per `docs/operations/DEPLOYMENT_WORKFLOW.md` — every push to `main` auto-deploys Production. **Not changed this round.** Pushing foundation work to `main` would still risk live cutover |
| Dedicated staging Supabase | **MISSING** | No Owner-provisioned staging project yet |
| Preview env isolation | **UNPROVEN** | Preview may still inherit Production env vars until Owner rewires Vercel |

---

## Tooling baseline

| Item | Finding |
| --- | --- |
| Package manager | **npm** + `package-lock.json` present |
| Prior CI workflows | **None** before this round; `.github/workflows/ci.yml` is being added (uncommitted) |
| `.vercel/project.json` | **Exists** (`prj_pYDkz1oDZwjnmaP4iDixKvxo7TP4`, project `gothailandhome`) |
| `vercel.json` | **Absent** |
| Migrations | **8** files under `supabase/migrations/` (ordered timestamps) |
| Feature flags | `FEATURE_P2_*` / public mirrors **default false** in code |

---

## Verdict

**Baseline recorded. RC HEAD / tag / `origin/main` alignment PASS. Working tree NOT clean (expected for this foundation round). Production remains frozen. No commit / push / deploy performed.**
