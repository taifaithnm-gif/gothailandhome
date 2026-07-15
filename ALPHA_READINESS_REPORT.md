# Alpha Readiness Report

**Date:** 2026-07-15  
**Baseline commit:** `8cd3595`  
**Tag:** `platform-alpha-data-freeze-v1`

## Verdict

**NOT READY for public Platform Alpha** until P0 blockers below are resolved.

Data foundation is **ready to freeze**. Product experience is **not yet alpha-safe**.

## Ready

- Source listing baseline locked at **1,315** records.
- Developer content master **20**, project folders **50**.
- Contact architecture separates Apple from listing ownership.
- Marketplace intake flows exist and write private leads.
- Build / typecheck / integrity tests pass at freeze HEAD.
- Homepage metadata, hreflang, canonical present.
- Mobile header collapses to hamburger; Find My Home form usable.

## Not ready (summary)

| Area | Severity | Evidence |
|------|----------|----------|
| Project detail reliability | **P0** | **33/50** content project slugs return HTTP **500** (`Cannot read properties of undefined (reading 'en')` on POI map) |
| Listing inventory HTML weight | **P0** | `/en/properties` and `/en/search` render ~4.7MB HTML; Lighthouse performance **58**, LCP **~9s** |
| Listing imagery | **P0** | Representative listing detail shows gradient placeholder; **0 `<img>`** on sampled detail HTML |
| Listing contact coverage | **P1** | Only **12/1331** properties have `agent_id`; most pages show “No listing contact…” |
| IA gaps | **P1** | No Knowledge hub; Buy/Rent are filters only; nav overcrowded |
| SEO schema | **P1** | **0 JSON-LD** across scanned pages |
| Sitemap coverage | **P1** | Marketplace routes missing from sitemap static paths |
| Admin exposure | **P1** | `robots.txt` Allow:/ does not disallow `/admin` |
| Empty/error UX | **P1** | No `error.tsx` / `loading.tsx` under locale app routes |
| Copy hygiene | **P2** | Widespread “omitted until separately sourced” project blurbs |

## Alpha readiness scorecard

| Dimension | Score (1–5) | Note |
|-----------|------------:|------|
| Data integrity | 5 | Source packages + freeze tag solid |
| Contact safety | 4 | Role separation correct; coverage thin |
| Core journeys | 2 | Project 500s break discovery funnel |
| Performance | 2 | Inventory pages not alpha-viable |
| SEO completeness | 3 | Meta OK; schema/images/sitemap incomplete |
| Mobile UX | 3 | Basics work; dense nav + heavy pages |
| Trust / marketplace | 3 | Intake ready; media/contact trust weak |

**Overall:** **2.5 / 5 — freeze data; fix P0 before public alpha.**

## Recommended next phase (do not start in this task)

1. Fix project POI i18n crash (stabilize project pages).
2. Paginate / virtualize properties+search payloads.
3. Wire media or honest empty-image states at scale.
4. Then begin Alpha UI/UX redesign with nav IA trim.
