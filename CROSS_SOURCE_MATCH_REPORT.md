# CROSS_SOURCE_MATCH_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M6 DotProperty Wave 1  
**Rule:** Detect candidates only · **never auto-merge** · keep sources independent

## Inputs

| Source | Listings |
|--------|--------:|
| DotProperty (packages / DB) | **192** |
| PropertyHub (packages) | 617 |
| LivingInsider (packages) | 316 |
| DDproperty | 0 (BLOCKED) |
| Hipflat | 0 (BLOCKED) |

## Method

Soft-match fingerprint (shared identity helper):

`project_slug + listing_type + bedrooms + area_sqm(1dp) + floor_label`

Excludes title and price.  
Against PropertyHub and LivingInsider.  
Match reason: `cross_source_soft_match_dotproperty_<other>` · confidence `0.55` · status `open`

## Results

| Metric | Count |
|--------|------:|
| Candidate pairs (package scan) | **26** |
| Inserted into `listing_duplicate_candidates` | 24 (first pass) + later skip/dedupe |
| Open candidates after final pass | present · **0 auto-merged** |
| Auto-merged | **0** |

Evidence: `pipelines/factory/dotproperty/_runs/cross-source-soft-matches.json`

## Policy

- Soft matches are typology collisions until ops confirm.
- Each source retains its own `source_listing_id`, URL, price, timestamps, and verification status.
- No merges executed this milestone.
