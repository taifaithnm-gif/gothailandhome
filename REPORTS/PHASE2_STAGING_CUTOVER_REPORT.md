# Phase 2 Staging Cutover Report

**Date:** 2026-07-21
**Status refresh:** 2026-07-22
**RC:** `v2.0.0-rc1` @ `0eca210a72a559a1ce0291f16d72120e401d91a3`
**Decision:** **STAGING BLOCKED** · **FREEZE CURRENT PRODUCTION — NO CUTOVER**

---

## 1. Staging deployment

| Field | Value |
| --- | --- |
| Attempted | Yes — Vercel **Preview** only (`npx vercel deploy --yes`, **no `--prod`**) |
| Status | **READY** (Preview) |
| Deployment ID | `dpl_CjyfMVhgxVzwYrtPvwg3xVvFXPjh` |
| Preview URL | https://gothailandhome-lh5toy2v2-tai-faith-agri-platform-s-projects.vercel.app |
| Inspector | https://vercel.com/tai-faith-agri-platform-s-projects/gothailandhome/CjyfMVhgxVzwYrtPvwg3xVvFXPjh |
| Target | Preview (`target: null`) — **not Production** |
| Git / tag | `0eca210` / `v2.0.0-rc1` |
| Manual Production deploy from this cutover | **NOT performed** |
| Production actual state (verified) | Running RC1 `0eca210` via **Vercel automatic Git deployment** (`dpl_F7Bb9TGQ94ZVtU1mLYq7UtQ9nji7`) — see `PHASE2_PRODUCTION_DRIFT_VERIFICATION.md` |
| Production URL health | `https://www.gothailandhome.com/en` → HTTP 200 (Phase 1–equivalent behavior; flags off) |

### Deployment blocker for full cutover

Preview URL is behind **Vercel Login / SSO**. Unauthenticated HTTP smoke receives Vercel login HTML, not the app. No Owner-approved staging hostname or Deployment Protection bypass was available.

## 2. Database migrations

| Field | Value |
| --- | --- |
| Staging DB provisioned | **NO** |
| `.env.staging` / staging-named config | **Absent** |
| Local `.env.local` Postgres | Present, **not labeled staging** (treated as production-linked) |
| Migrations applied | **NONE** |
| Production DB modified | **NO** |

### Why blocked

Applying `20260721100000_phase2a_customer_ops.sql` / `20260721120000_phase2b_acquisition_partners.sql` via `scripts/apply-migration.mjs` would use the only available `POSTGRES_URL` and risk **production**. Task forbids production DB changes.

## 3. Feature flag train

| Field | Value |
| --- | --- |
| T1–T10 executed | **NO** |
| Production / Preview env vars changed | **NO** |
| Flags remain | **OFF** (defaults) |

Cannot enable trains without an isolated staging environment + unprotected (or Owner-authenticated) staging URL.

## 4. Smoke / rollback

- Full staging smoke: **NOT COMPLETED** (SSO + no staging DB)
- Rollback documentation: reviewed; executable as flag-OFF + leave tables (see enablement report)
- Destructive rollback: **NOT performed**

## 5. Remaining issues (cutover)

| Sev | Issue |
| --- | --- |
| **P0** | No dedicated staging database / env isolation |
| **P0** | Preview Deployment Protection blocks public smoke |
| P2 | Carry-forward product residuals (sparse map pins, partner invite UI, etc.) |

## 6. Required Owner actions to unblock

1. Provision **staging Supabase** (separate from production).
2. Create Vercel **Preview/Staging** env vars pointing at staging DB; set all `FEATURE_P2_*` default false.
3. Disable or provide bypass for Deployment Protection on staging/preview for smoke agents, **or** provide Owner-authenticated staging smoke.
4. Re-run this cutover: migrate staging → T1–T10 trains → smoke → sign-off.

## 7. Decision

# **STAGING BLOCKED**

# **FREEZE CURRENT PRODUCTION — NO CUTOVER**

Preview RC1 artifact exists. Manual cutover did not promote Preview to Production; however Production already serves RC1 via automatic Git deploy of `main`. `FEATURE_P2_*` remain **OFF**; **no** Phase 2 migrations have been applied. Full staging cutover (migrate + flags + smoke) and intentional Phase 2 launch remain **BLOCKED** until staging isolation is provided.
