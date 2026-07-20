# Phase 1 Release Closure Report

**Date:** 2026-07-20  
**Product:** GoThailandHome  
**Official version:** `v1.0.0`  
**Final decision:** **PHASE 1 RELEASED**

---

## 1. Official version

| Field | Value |
| --- | --- |
| Tag | `v1.0.0` (annotated) |
| Message | GoThailandHome Phase 1 production release |
| Release date | 2026-07-20 |

## 2. Release commit SHA

| Field | Value |
| --- | --- |
| Commit | `fd232cf60bc37e1b9a6aec2b35f6a1b126fdad4e` |
| Subject | `release: GoThailandHome Phase 1 v1.0.0` |
| Branch at commit | `cursor/data-factory-master-plan` → fast-forwarded to `main` |

## 3. Main branch synchronization result

| Step | Result |
| --- | --- |
| `git switch main` | OK |
| `git pull --ff-only origin main` | Already up to date at `ba638a0` |
| `git merge --ff-only cursor/data-factory-master-plan` | **SUCCESS** — fast-forward `ba638a0` → `fd232cf` |
| Local `main` vs `origin/main` after push | Synchronized |

Included in the fast-forward (already on release branch before finalization): Data Factory planning docs (M0–M2) — documentation only; **Phase 2 not started**.

## 4. Tag verification result

| Check | Result |
| --- | --- |
| `git rev-parse main` | `fd232cf60bc37e1b9a6aec2b35f6a1b126fdad4e` |
| `git rev-parse v1.0.0^{commit}` | `fd232cf60bc37e1b9a6aec2b35f6a1b126fdad4e` |
| SHAs match | **YES** |
| Pre-existing `v1.0.0` | None — created fresh; not moved |

## 5. Push result

| Push | Result |
| --- | --- |
| `git push origin main` | **SUCCESS** (`ba638a0..fd232cf`) |
| `git push origin v1.0.0` | **SUCCESS** (new tag) |
| Force flags | Not used |
| Branch protection | Did not block |

## 6. Vercel deployment alignment

| Item | Detail |
| --- | --- |
| Pre-git production acceptance deploy | `dpl_DfkmRL3SVzf1vwRedJhF1wVFqxg5` — PRODUCTION GO (working-tree deploy) |
| Post-push production deploy | `dpl_EwCWKPSM3w5QwVrw1GHmoJK8G8dq` — **Ready** |
| Trigger | Push of `main` / GitHub Production deployment for SHA `fd232cf…` |
| Production aliases | https://www.gothailandhome.com (and apex / vercel.app aliases) point at the new Ready deployment |
| Source alignment | GitHub Production deployment SHA = `fd232cf60bc37e1b9a6aec2b35f6a1b126fdad4e` = `v1.0.0` |
| Live content check | `robots.txt` includes `Disallow: /leads` (RC polish from release commit) |

**Note:** Production was first accepted on `dpl_DfkmRL3SVzf1vwRedJhF1wVFqxg5` before Git finalization. Pushing `main` then created a git-linked production deployment from the official `v1.0.0` commit; both carry the production-approved Phase 1 website content. No Vercel project settings or environment variables were changed.

## 7. Production smoke-test result

**PASS** (post-push, against https://www.gothailandhome.com)

| Surface | Result |
| --- | --- |
| Homepage EN / ZH / TH | PASS (200) |
| robots.txt | PASS (200; `/leads` disallowed) |
| sitemap.xml | PASS (200) |
| Listings | PASS (200) |
| Property detail | PASS (200) |
| Knowledge / investment guide | PASS (200) |

Local gates on `main` after fast-forward: `typecheck` · `lint` · `test` · `build` — **PASS**.

## 8. Remaining P2 issues

| ID | Issue |
| --- | --- |
| PERF-1 / RH-3 / NX-1 | Turbopack NFT filesystem-trace warning (non-fatal) |
| PERF-2 | Sparse listing media / LCP opportunity |
| SEO-1 | Favorites sitemap-indexed as feature landing while body is device-state |

## 9. Remaining P3 issues

| ID | Issue |
| --- | --- |
| I18N-1 | `LoadingState` English default fallback |
| I18N-2 / A11Y-1 / NX-2 | Breadcrumb landmark English `aria-label` |
| I18N-3 | Admin UI English-only |
| BR-1 / BR-2 | No fresh screenshot lab batch in RC folder |
| PERF-3 | No separate absolute CI bundle-size budget file |

*(Prior P3 “git tag / main sync pending” is **resolved** by this finalization.)*

## 10. Rollback reference

- Website / Vercel: promote prior Ready production deployment via Vercel dashboard / CLI alias (e.g. previous Ready `dpl_DfkmRL3SVzf1vwRedJhF1wVFqxg5` or earlier `main` SHA deploy). Do not force-push git history.
- Policy docs: `G_RELEASE_ROLLBACK_PLAN.md`, `ROLLBACK_WORKFLOW_V1.md`
- Git pin: annotated tag `v1.0.0` → `fd232cf60bc37e1b9a6aec2b35f6a1b126fdad4e`

## 11. Final decision

# **PHASE 1 RELEASED**

Phase 2 not started.
