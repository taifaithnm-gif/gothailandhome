# PLATFORM_ALPHA_RC1_ACCEPTANCE

**Product:** GoThailandHome  
**Milestone:** Platform Alpha RC1  
**Date:** 2026-07-16  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main`  
**Acceptance HEAD (pre-docs):** `a166bbc1658803cbd3a6a9ddffa493236ba86f7d`  
**Local server:** `http://127.0.0.1:3040` (`next start` after production build)  
**Tag (after docs commit):** `platform-alpha-rc1`

## Final status

**PASS** — Release Candidate for Platform Alpha (local production build acceptance).  
No feature development, harvest, schema change, or deployment was performed in this gate.

## Baseline inventory

| Entity | Count |
|--------|------:|
| Developers | 20 |
| Projects | 50 |
| Package source listings | **1,315** (PH 617 · LI 316 · DP 192 · FazWaz 190) |
| UI/DB published (known drift) | **1,318** (documented; not “fixed”) |

## Verification matrix

| Check | Result | Notes |
|-------|--------|-------|
| TypeScript (`npm run typecheck`) | **PASS** | Exit 0 |
| Lint (`npm run lint`) | **PASS** | 0 errors; 2 preexisting pipeline warnings |
| Tests (`npm test`) | **PASS** | Contact roles, integrity, POI, evidence, pagination, search, UI foundation |
| Production build | **PASS** | Exit 0 |
| Homepage `/en` `/zh` `/th` | **PASS** | 200; Platform CS present; Apple not sales |
| Search `/[lang]/search` | **PASS** | 307 → `/[lang]/properties?sort=newest_verified` |
| Listing results `/[lang]/properties` | **PASS** | 200; pagination present |
| Listing detail sample | **PASS** | 200; gallery + listing/platform contact split |
| Project routes | **PASS** | **50/50** non-500 |
| Developer routes | **PASS** | **20/20** non-500 |
| District / city sample | **PASS** | `/en/districts/watthana`, `/en/cities/bangkok` 200 |
| Navigation | **PASS** | Header primary nav, footer, locale switcher |
| Mobile chrome | **PASS** | Mobile menu control present in HTML foundation |
| Accessibility (Lighthouse) | **PASS** | Home 100 · Search 98 · Project 93 |
| Lighthouse performance | **MEASURED** | Home 76 · Search 84 · Project 75 (not SLA claims) |
| LCP / CLS | **MEASURED** | LCP ~4.2–5.3s · CLS 0 |
| Data integrity | **PASS** | Source packages match baseline 1,315 |
| Contact separation | **PASS** | Listing contact ≠ Platform CS; invariants green |
| Apple positioning | **PASS** | Platform Customer Success only |
| SEO basics | **PASS** | Titles, canonicals, OG on sampled pages; Lighthouse SEO 100 |
| Sitemap | **PASS*** | 200; www host; *incomplete listing URL set (see Known Issues)* |
| robots.txt | **PASS** | Allow `/`; Host + Sitemap → www |
| Metadata | **PASS** | No duplicate brand suffix on sampled titles; www canonicals |
| Broken links (sample) | **PASS** | 84 internal link checks · 0 failures |
| Broken images (sample) | **PASS** | 70 image checks · 0 failures |
| 404 unknown path | **PASS** | `/en/missing-xyz-rc1` → 404 · `noindex` |
| Root `/` | **PASS** | 307 → `/en` |
| Prettier `format:check` | **FAIL (non-blocking)** | ~360 files style drift — debt, not runtime gate |

## Lighthouse (lab)

| Page | Perf | A11y | SEO | LCP | CLS |
|------|-----:|-----:|----:|-----|-----|
| `/en` | 76 | 100 | 100 | 5.1s | 0 |
| `/en/properties` | 84 | 98 | 100 | 4.2s | 0 |
| `/en/projects/ashton-asoke` | 75 | 93 | — | 5.3s | 0 |

## Critical path conclusion

All **critical** acceptance checks passed. Non-blocking known limitations are listed in `KNOWN_LIMITATIONS.md` and `TECHNICAL_DEBT.md`.

## Out of scope (this gate)

- District Detail Alpha redesign  
- Marketplace form completion / funnel hardening  
- DB reconciliation of 1,318 vs 1,315  
- Performance cleanup program  
- Production deployment  

## Overall

# PASS — Platform Alpha RC1
