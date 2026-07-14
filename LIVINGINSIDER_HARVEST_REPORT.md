# LIVINGINSIDER_HARVEST_REPORT

**Date:** 2026-07-14  
**Source:** `livinginsider`  
**Scope:** Bangkok Wave-1 projects only  
**Constraints:** PropertyHub packages and harvest logic not modified · no schema migration · no fabricated listings

## Status

# PASS

## Adapter

| Module | Role |
|--------|------|
| `pipelines/factory/livinginsider/adapter.mjs` | Crawl, parse ld+json + scoped type detection, normalize DTO |
| `pipelines/factory/livinginsider/project-map.wave1.json` | Curated LI project URL map (33 Wave-1 projects) |
| `pipelines/factory/harvest-livinginsider-wave1.mjs` | Harvest CLI (`--tabs`, `--merge`, retries on 429) |
| `pipelines/factory/livinginsider/import-li-only.mjs` | LI-only Supabase upsert (never updates PropertyHub rows) |

Identity helpers reused from `pipelines/factory/lib/listing-identity.mjs` (LivingInsider URL/id branch only).

## Harvest totals

| Metric | Count |
|--------|------:|
| Projects mapped | 33 |
| Projects with LI packages | 33 |
| Listings packaged | **316** |
| Sale | **200** |
| Rent | **116** |
| Source URL + `source_listing_id` present | 316 / 316 |
| Validator-failed before package write | 0 (post-normalize) |

Evidence: `pipelines/factory/livinginsider/_runs/wave1-harvest-summary.json`

## Notes

- Initial type bug (page-nav “เช่า” matching) mislabeled Buysell offers as rent; fixed in adapter to use **title/description + Offer price band** only; packages reclassified from sourced title/price evidence (no invented prices).
- Rate limits (HTTP 429) handled with exponential backoff + resume/merge passes.
- PropertyHub `content/projects/*/listings.json` untouched.

## Per-project package file

`content/projects/<slug>/listings-livinginsider.json`
