# PRODUCT_QA_REPORT

**Milestone:** Phase 12 — Product Perfection · Wave 1  
**Date:** 2026-07-17  
**Mode:** Product polishing (no new features · no deploy · no Google ops)  
**Host audited:** `https://www.gothailandhome.com`  
**Snapshot:** `pipelines/factory/product-qa/wave1_snapshot.json`

## Verdict: **PASS WITH FIXES APPLIED**

All public Alpha surfaces were reviewed for spacing, hierarchy, responsiveness, links, empty/loading honesty, language switching, and a11y basics. Deterministic defects were fixed in-repo; remaining items are improvement backlog (not blockers).

## Surfaces audited

| Surface | Routes checked | HTTP | Notes |
|---------|----------------|------|-------|
| Homepage | `/en` `/zh` `/th` | 200 | Hero + search + sections |
| Properties | `/en/properties` `/en/buy` `/en/rent` | 200 | Filters + cards |
| Listing | sample listing via home cards | 200 | Empty media labeled |
| Project | `/en/projects` · `/en/projects/one-bangkok` | 200 | Center layout OK |
| Developer | `/en/developers` · Frasers detail | 200 | Logo present |
| District | `/en/districts/dusit` · `watthana` | 200 | Knowledge blocks OK |
| Knowledge | hub · glossary · bangkok-districts | 200 | Cards consistent |
| Marketplace | hub · find · list · partners ×2 | 200 | Forms + breadcrumbs |
| Forms | find-my-home · list · partners · contact | 200 | Field shell consistent |
| Navigation | header desktop + mobile menu | — | Fixed i18n section labels |
| Footer | all locales | — | Fixed Partners href |

## Cross-check matrix

| Check | Result |
|-------|--------|
| Broken internal links (home → unique `/en/*`) | **0** |
| Broken images (missing `alt`) on crawl sample | **0** |
| Language switching present (en/zh/th) | **PASS** |
| Empty media honesty (`Images unavailable`) | **PASS** (intentional) |
| Back / breadcrumb on marketplace forms | **PASS** |
| Search helper `/en/search` | Redirects to properties (by design) |

## Fixes shipped this wave

1. Footer **Partners** pointed at `/marketplace` → `/partners/developers`  
2. Shared `viewAll` copy said “View all listings” on projects/cities/developers → generic **View all**  
3. About page showed MVP **placeholder notice** → removed  
4. Mobile nav section titles hardcoded English → dictionary keys  
5. Language switcher `hrefLang` for Chinese → `zh-CN`  
6. Home hero `min-h-[78vh] + justify-end` clipped search on short mobile viewports → responsive min-height

## Residual risk (not fixed — see UX / BUG lists)

- Desktop primary nav is dense (horizontal scroll at `lg`)  
- Many listing cards still show empty media (data, not UI bug)  
- Search remains in primary nav though it is a noindex redirect helper  
- Knowledge article JSON from Daily Factory is not yet wired to a public route (content-only; out of scope for polish)

## Stop

Wave 1 public-page audit complete. Waiting for review.
