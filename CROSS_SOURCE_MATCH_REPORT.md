# CROSS_SOURCE_MATCH_REPORT

**Date:** 2026-07-14  
**Rule:** Detect candidates only · **never auto-merge** · keep sources independent

## Inputs

| Source | Listings |
|--------|--------:|
| LivingInsider (packages) | 316 |
| PropertyHub (packages) | 617 |

## Method

Soft-match fingerprint (shared identity helper):

`project_slug + listing_type + bedrooms + area_sqm(1dp) + floor_label`

Excludes title and price.  
Match reason stored: `cross_source_soft_match` · confidence `0.55` · status `open`

## Results

| Metric | Count |
|--------|------:|
| Candidate pairs (package scan) | **19** |
| Inserted into `listing_duplicate_candidates` this run | 9 |
| Skipped (already present) | 10 |
| Auto-merged | **0** |

Evidence: `pipelines/factory/livinginsider/_runs/cross-source-soft-matches.json`

## Policy

- Each source retains its own `source_listing_id`, URL, price, timestamps, and verification status.
- Ops must explicitly confirm/reject candidates before any future merge work.
- Soft matches are typology collisions until proven otherwise (same beds/area/floor in a project).
