# PROJECT_ROUTE_500_FIX_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8 P0 — Milestone 1  
**Freeze tag:** `platform-alpha-data-freeze-v1`

## Baseline verification

| Check | Result |
|-------|--------|
| Repository root | `/Users/jun/AI-Workspace/Projects/GoThailandHome` |
| Branch | `main` |
| Pre-fix HEAD | `62b7dc764bf736693fffb465c9dc10667113158b` |
| Tag local | `platform-alpha-data-freeze-v1` → `8cd3595f98407ed49c566846e8f4ff02c4289bea` |
| Tag remote | `refs/tags/platform-alpha-data-freeze-v1` present on origin |

## Root cause

Project detail pages crashed on **facilities rendering**, not solely on nearby POI `name.en`.

Harvested facilities are flat `{ key, name, source }`, while the page expected zoned `{ zone, items[] }` and accessed `zone.zone.en` unguarded. That matches the historical **33/50 HTTP 500** pattern (projects with non-empty flat facilities).

Nearby POI access (`item.name.en`) was also unguarded and was hardened for all observed incomplete shapes. No place names were fabricated; invalid entries are omitted.

## Fix

- Added `src/lib/projects/normalize-project-content.ts` (view-layer only; no DB/manifest rewrite)
- Applied normalization in `mapProject` for facilities, POIs, unit types, FAQ
- Hardened `src/app/[lang]/projects/[slug]/page.tsx` rendering
- Regression tests: `npm run test:project-content`
- Route checker: `npm run test:project-routes` → `scripts/check-project-routes.mjs`

## Route check result

| Metric | Value |
|--------|------:|
| Project packages | 50 |
| HTTP non-500 | **50 / 50** |
| Failures | **0** |

Evidence: `pipelines/factory/overnight/_runs/project-route-check.json`

## Data constraints

| Constraint | Honored |
|------------|---------|
| No harvest | Yes |
| No verified listing business-data rewrite | Yes |
| No project fact silent rewrite in packages/DB | Yes (view normalize only) |
| No schema change | Yes |
