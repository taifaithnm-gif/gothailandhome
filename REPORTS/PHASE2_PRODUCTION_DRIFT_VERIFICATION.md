# Phase 2 Production Drift Verification

**Date:** 2026-07-21
**RC (frozen):** `v2.0.0-rc1` @ `0eca210a72a559a1ce0291f16d72120e401d91a3`
**Release verdict (given):** NO-GO
**Current release decision:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**Doc hygiene (2026-07-22):** Staging/release status documents updated to replace stale “Production not deployed” claims with this verified Production state. No infrastructure, deployment, alias, env var, migration, flag, or application source changes were made by either this verification or the status-doc refresh.

---

## 1. Current Production deployment

| Field | Value |
| --- | --- |
| Deployment ID | `dpl_F7Bb9TGQ94ZVtU1mLYq7UtQ9nji7` |
| Target | `production` |
| Status | `READY` |
| Deployed commit (`gitSource.sha`) | `0eca210a72a559a1ce0291f16d72120e401d91a3` |
| Commit message | `release(gothailandhome): phase 2 release candidate` |
| Commit ref | `main` |

**Finding:** the commit deployed to Production is **exactly** the frozen RC1 commit — not a divergent or newer commit. There is no unknown code on Production; the drift is that RC1 reached Production at all, not that Production is running something else.

## 2. Deployment creation time / alias history

| Field | Value |
| --- | --- |
| RC1 commit authored | 2026-07-21 12:58:15 +0700 |
| `dpl_F7Bb9…` created | 2026-07-21 12:58:39 +0700 (05:58:39.841Z) — **24s after the commit** |
| Current aliases → `dpl_F7Bb9…` | `www.gothailandhome.com`, `gothailandhome.com`, `gothailandhome.vercel.app`, `gothailandhome-git-main-…vercel.app` (all `aliasAssigned: true`) |
| Immediately prior Production deployment | `dpl_EaZ65FrS4o35zHWTdaDDSeQGRQKU` @ `fb2dd22` ("docs: add Phase 1 v1.0.0 release closure report"), created 2026-07-20 17:19:04 UTC, still `READY` |

The 24-second gap between commit and deployment, plus the deployment's own `branchAlias` metadata pointing at the `main` branch alias, indicate this was the immediate, automatic build/deploy of the push — not a later or manual action.

## 3. Promotion source

| Field | Value |
| --- | --- |
| `source` | `git` |
| `gitSource.type` | `github` |
| `gitSource.ref` | `main` |
| `gitSource.prId` | `null` |
| Creator on record | `taifaithnm-9006` (project owner/integration identity, not an interactive "promote" click) |

**Finding: automatic, not manually promoted.** This deployment was built and pushed straight to Production because `main` is this project's configured Production Branch and pushing `0eca210` to `main` (to publish the RC tag) triggered Vercel's standard Git-integration auto-deploy-to-Production. It was **not** built as a Preview and later promoted, and it was **not** a PR-triggered Preview (`prId: null`).

This is the root cause of the drift. A **separate**, later, explicitly-Preview deployment (`dpl_CjyfMVhgxVzwYrtPvwg3xVvFXPjh`, `target: null`, created ~4 minutes after `dpl_F7Bb9…`) was manually created via `npx vercel deploy --yes` (no `--prod`) for the staging cutover attempt, and is correctly documented in [`PHASE2_STAGING_CUTOVER_REPORT.md`](PHASE2_STAGING_CUTOVER_REPORT.md), [`PHASE2_STAGING_BLOCKER_STATUS.md`](PHASE2_STAGING_BLOCKER_STATUS.md), [`PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md`](PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md), and [`PHASE2_SMOKE_TEST_REPORT.md`](PHASE2_SMOKE_TEST_REPORT.md) as "Preview only, Production NOT performed." Those statements are true of the actions each report's author took — but by the time those manual Preview steps ran, **Production had already auto-deployed RC1 four minutes earlier** via the git push itself. The staging evidence package's premise ("Production: NOT DEPLOYED") is therefore stale/incomplete, not fabricated — none of those reports claim to have checked Production's actual deployed commit against Git history.

## 4. Production environment variables (Phase 2 flags)

`vercel env ls production` (names only, no values pulled/changed):

Only Supabase/Postgres connection variables exist in Production (`SUPABASE_*`, `POSTGRES_*`, `NEXT_PUBLIC_SUPABASE_*`). **No `FEATURE_P2_*` or `NEXT_PUBLIC_FEATURE_P2_*` variable exists in any environment** (Production, Preview, or Development).

`src/lib/feature-flags/index.ts` (`envFlag`) treats an unset/empty env var as `false`:

```ts
function envFlag(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  ...
}
```

**Finding:** every Phase 2 flag resolves to `false` in Production. This is a fully-off state, not a partially-configured one.

## 5. Phase 2 migration state

- RC1 shipped two new migration files: `supabase/migrations/20260721100000_phase2a_customer_ops.sql` and `20260721120000_phase2b_acquisition_partners.sql`.
- `package.json` has no wired `db:migrate:*` script for either file (unlike all earlier phases, which each have one).
- The Vercel build command is `next build` only — no migration/DB step runs as part of build or deploy.
- Production DB was **not** queried directly by this verification (avoiding any write-path or credential risk against a production-linked connection, per task constraints and the same caution the prior staging reports applied to `POSTGRES_URL`).

**Finding:** no code path applied these migrations as part of the RC1 deploy, and prior staging reports independently confirm they were never run manually. No evidence of Phase 2 migration having been applied.

## 6. Public smoke result (Production, unauthenticated GET only)

| Route | Result |
| --- | --- |
| `/en` | HTTP 200 — `GoThailandHome \| Bangkok Property Marketplace` |
| `/zh` | HTTP 200 — `GoThailandHome \| 曼谷房产市场平台` |
| `/th` | HTTP 200 — `GoThailandHome \| ตลาดอสังหาริมทรัพย์กรุงเทพฯ` |
| `/en/account` | RSC flight payload resolves `NEXT_HTTP_ERROR_FALLBACK;404` ("Page not found") — gated by `isPhase2AccountEnabled()` → `notFound()` |
| `/en/map` | Same — gated by `isPhase2MapEnabled()` → `notFound()` |
| `/en/tools` | Same — gated by `isPhase2ToolsEnabled()` → `notFound()` |
| `/en/partners` | Hard HTTP 404 (route not rendered) |

(Initial HTTP status on the flag-gated routes reads `200` from a plain `curl -o /dev/null -w '%{http_code}'` because Next.js App Router streams a 200 shell before resolving the RSC error boundary — the actual resolved digest confirms 404/not-found. This is expected framework behavior, not a bypass.)

**Finding:** live site behavior is indistinguishable from Phase 1. No Phase 2 UI, forms, or database-dependent write paths are reachable. No destructive or write-path testing was performed against Production.

## 7. Risk assessment

- **Code-level drift:** real. Production is running a build that *contains* Phase 2 source (routes, flag plumbing, AI/tools/map/account/partner code, migration files) instead of the last intentional Phase 1 build.
- **Behavioral drift:** none observed. All Phase 2 surfaces are flag-gated and the flags are unset (default OFF) in Production; no migrations applied; EN/ZH/TH public routes serve correct Phase 1 content; no write paths exposed.
- **Process/evidence risk:** the staging evidence package (`PHASE2_RELEASE_EVIDENCE_REVIEW.md` "RELEASE EVIDENCE VERIFIED") and cutover docs asserted "Production: NOT DEPLOYED" based only on the team's own manual actions, without checking Production's actual deployed commit — that assumption was wrong. This is a process gap (no branch protection / deployment gating preventing `main` → auto-Production for release-tagged commits) rather than an active incident.
- **Rollback risk if performed:** would swap a verified-healthy, behaviorally-Phase-1 Production deployment for a 24h-old build, for zero user-facing benefit, and itself requires an Owner-approved write action this verification is not authorized to take.

## 8. Rollback recommendation

**Freeze-in-place is safer than rollback right now.** Production is healthy, serving correct Phase 1 behavior, with Phase 2 fully dormant (flags off, no migrations, no exposed routes). A rollback to `dpl_EaZ65FrS4o35zHWTdaDDSeQGRQKU` (`fb2dd22`) remains available and low-risk if the Owner later decides Production must not contain any Phase 2 source at all — but it is not required to protect users or data today.

What does need Owner attention (not performed here, requires explicit approval):
1. Correct the release record: the "Production NOT deployed" claim in the staging evidence package needs an addendum noting the automatic git-triggered Production deploy of RC1.
2. Add branch protection / Vercel deployment gating (e.g., require manual promotion, or move Production Branch off `main`, or use a release branch) so tagging/pushing a release candidate to `main` cannot silently auto-deploy to Production again.
3. Decide whether to roll back to `fb2dd22` for hygiene, or accept the frozen (flags-off) RC1 build as the new Production baseline and proceed through the (currently blocked) staging cutover process for an eventual, intentional Phase 2 launch.

## 9. Owner decision required

# **FREEZE CURRENT PRODUCTION — NO CUTOVER**
