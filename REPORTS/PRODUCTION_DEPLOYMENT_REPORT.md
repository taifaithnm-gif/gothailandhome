# Production Deployment Report

**Date:** 2026-07-20  
**Product:** GoThailandHome Phase 1  
**Official version:** `v1.0.0`  
**Prior RC train:** `v1.0.0-rc1` (promoted after PRODUCTION GO)  
**Operator:** Engineering agent via existing Vercel linked project workflow  
**Command:** `npx vercel --prod --yes` (no Vercel config / env / build / routing changes)

---

## Deployment result

| Field | Value |
| --- | --- |
| Status | **SUCCESS** — Ready |
| Environment | Production |
| Production URL | https://www.gothailandhome.com |
| Alias URLs | https://gothailandhome.com · https://gothailandhome.vercel.app |
| Deployment URL | https://gothailandhome-2goy7zk8b-tai-faith-agri-platform-s-projects.vercel.app |
| Build / Deployment ID | `dpl_DfkmRL3SVzf1vwRedJhF1wVFqxg5` |
| Inspector | https://vercel.com/tai-faith-agri-platform-s-projects/gothailandhome/DfkmRL3SVzf1vwRedJhF1wVFqxg5 |
| Created | 2026-07-20 23:24:23 GMT+7 |
| Build | Next.js 16.2.10 — compiled successfully; 87 static pages generated |
| Pre-deploy gates | `typecheck` · `lint` · `test` · `build` — **PASS** |

---

## Smoke test summary

Base: `https://www.gothailandhome.com`

| Surface | Result |
| --- | --- |
| Homepage EN / ZH / TH | PASS (200) |
| Listings | PASS (200) |
| Property detail | PASS (200) |
| Project detail | PASS (200) |
| Developer detail | PASS (200) |
| District detail | PASS (200) |
| Knowledge | PASS (200) |
| Knowledge article | PASS (200) |
| Blog index | PASS (200) |
| Investment guide | PASS (200) |
| Legal guide | PASS (200) |
| FAQ | PASS (200) |
| Favorites | PASS (200) |
| Compare | PASS (200) + `noindex, follow` |
| Contact | PASS (200) |
| Inquiry (Find My Home) | PASS (200) |
| 404 | PASS (404) |
| robots.txt | PASS — disallow `/admin`, `/leads`; sitemap host OK |
| sitemap.xml | PASS (200; properties/projects/developers/districts/articles present) |
| Canonical | PASS (`/en` → absolute canonical) |
| hreflang | PASS (`en`, `zh-CN`, `th`, `x-default`) |
| Open Graph | PASS |
| JSON-LD | PASS (home, article, FAQ/FAQPage) |
| `<html lang>` | PASS (`en` / `zh-CN` / `th`) |

---

## Quality verification (production)

| Check | Result |
| --- | --- |
| Desktop UA | PASS |
| Mobile UA | PASS (200) |
| Language switching roots | PASS |
| SEO signals | PASS |
| Accessibility smoke (skip + main) | PASS |
| Performance (TTFB homepage ~0.8s sample) | ACCEPTABLE for RC |
| Turbopack NFT warning at build | Known P2 residual (non-fatal) |

---

## Known issues

| ID | Severity | Issue |
| --- | --- | --- |
| DEP-1 | P2 | Turbopack NFT filesystem-trace warning during production build |
| DEP-2 | P3 | No individual blog post URLs observed in sitemap sample (blog index live; inventory may be empty/approved-none) |
| DEP-3 | P3 | Resolved at finalization: committed + tagged `v1.0.0` on `main` |
| DEP-4 | Info | Production deployed from approved working tree before git finalization; `main` + tag aligned afterward |

Historical note: `G_RELEASE_DEPLOYMENT_POLICY.md` stated Phase 1 does not authorize deploy; this production cutover was executed under an **explicit Owner deploy task** after RC approval.

---

## Recommendation

1. **PRODUCTION GO** recorded — see `REPORTS/PHASE1_PRODUCTION_ACCEPTANCE_REPORT.md`.  
2. Official release tag **`v1.0.0`** on synchronized `main`.  
3. Do **not** start Phase 2 from this deploy.
