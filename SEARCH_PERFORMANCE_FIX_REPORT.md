# SEARCH_PERFORMANCE_FIX_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8 P0 — Milestone 2

## Problem

`/properties` and `/search` called unbounded `listPublishedProperties`, serializing the full verified catalog into HTML (~**4.7 MB** documented; Lighthouse performance ~**58**; LCP ~**9 s**).

## Fix

- `listPublishedPropertiesPaged` with URL `?page=` and default **page size 24** (cap 48)
- Server-side filters where possible (city/district/developer/price/beds/type/sort/query)
- Lighter list select (no features payload for grids)
- `ListingPagination` preserves filter querystring
- Similar-listings on detail pages use a bounded page (4) instead of full catalog load
- Lazy images on non-priority cards; first three cards may use eager load

## Measured before / after

| Metric | Before (documented) | After (measured) |
|--------|---------------------|------------------|
| `/en/properties` HTML | ~4.7 MB | **0.209 MB** (218,642 bytes) |
| `/en/search` HTML | ~4.7 MB | **0.190 MB** (199,111 bytes) |
| Initial cards | full catalog | **24** unique listing links |
| Lighthouse performance (`/en/properties`, mobile) | ~58 | **88** (score 0.88) |
| LCP | ~9 s | **3.8 s** |
| FCP | — | 1.8 s |
| Speed Index | — | 1.8 s |

Evidence:

- `pipelines/factory/overnight/_runs/payload-measure.json`
- `pipelines/factory/overnight/_runs/lighthouse-properties-summary.json`

## Semantics

- Deterministic sort retained (`newest`, `price_asc`, `price_desc`, `featured`)
- Total count shown via pagination summary; page windows do not alter prices
- No full-dataset serialization on first response

## Tests

`npm run test:pagination` — page size, ranges, URL `page` params, no full-catalog first page.
