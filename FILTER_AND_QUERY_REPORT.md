# FILTER_AND_QUERY_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.3 — Search Results Alpha

## Shared state model

`parseListingSearchParams` / `listingSearchToQueryRecord` / `buildListingSearchHref` in `src/lib/search/listing-search-state.ts`.

Preserved URL-based filters and pagination. Browser back restores querystring state.

## Filters (Alpha)

| Filter | Param | Data behavior |
|--------|-------|----------------|
| Buy / Rent | `listing_type` | `sale` / `rent` / all |
| District | `district` | slug → `district_id` |
| Project | `project` | slug → published `project_id` |
| Property type | `type` | `property_type` eq |
| Bedrooms | `bedrooms` | exact eq (0=studio) |
| Price min/max | `min_price` / `max_price` | `price_thb` gte/lte |
| Area min/max | `min_area` / `max_area` | `area_sqm` gte/lte |
| BTS / MRT | `transit` | normalized to `bts`/`mrt`; `transit_tags` contains |
| City | `city` | optional scope |
| Developer | `developer` | via project ids |
| Keyword | `q` | title/summary/slug ILIKE |
| Sort | `sort` | see below |
| Page | `page` | bounded window size 24 |

## Sort options

| Value | Order |
|-------|--------|
| `newest_verified` (default) | `last_verified_at` → `source_updated_at` → `published_at` |
| `newest` | `published_at` desc |
| `price_asc` / `price_desc` | `price_thb` |
| `area_desc` | `area_sqm` desc (nulls last) |

## Homepage handoff

- Transit options emit `bts`/`mrt` (normalized; uppercase legacy values still accepted).  
- Project select emits `project` slug (no false keyword injection).  
- Buy/Rent still sets `listing_type`; city fixed `bangkok`; budget still `max_price`.

## Tests

`npm run test:listing-search` — parse, normalize, round-trip, pagination URL rules.

## Semantics note

Filters never invent listing attributes. Empty scope (unknown district/project) returns zero results rather than inventing matches.
