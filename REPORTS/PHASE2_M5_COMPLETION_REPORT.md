# Phase 2 — M5 Completion Report

**Date:** 2026-07-21
**Milestone:** M5 — Interactive maps
**Status:** COMPLETE
**Flag:** `FEATURE_P2_MAP` (default OFF)

---

## Completed task IDs

P2-050, P2-051, P2-052, P2-053, P2-054, P2-055, P2-056

## Functional summary

- OSM provider policy (no commercial tile API key)
- Perf budget: max 80 pins, max 0.35° bbox span, list-first UX
- Bbox/filter URL state with canonical strip of bbox
- Map MVP at `/{lang}/map` with keyboard list alternative
- District deep links `/{lang}/map/districts/{slug}`
- Honest unmapped count when project lat/lng missing
- Sitemap includes map routes only when flag ON

## Database / API

- No new migration (uses existing `property_projects.latitude/longitude`)
- Server search helper `searchMapListings` (not a public REST API)

## Tests

- `scripts/test-phase2-map.mjs`

## Quality gates

| Gate | Result |
| --- | --- |
| typecheck | PASS |
| lint | PASS |
| test | PASS |
| build | PASS |

## Risks

- Nested `districts.slug` filter depends on PostgREST relationship naming
- Pins sparse until projects have coordinates

## Readiness

M5 complete — proceed to M6.
