# CROSS_SOURCE_MATCH_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M7 FazWaz Wave 1  
**Rule:** Detect candidates only · **never auto-merge** · keep sources independent

## Inputs

| Source | Listings |
|--------|--------:|
| FazWaz (packages / DB) | **190** |
| PropertyHub | 617 |
| LivingInsider | 316 |
| DotProperty | 192 |
| DDproperty / Hipflat | 0 (BLOCKED) |

## Method

Soft-match fingerprint:

`project_slug + listing_type + bedrooms + area_sqm(1dp) + floor_label`

Against PropertyHub, LivingInsider, and DotProperty.  
Match reason: `cross_source_soft_match_fazwaz_<other>` · confidence `0.55` · status `open`

## Results

| Metric | Count |
|--------|------:|
| Candidate pairs | **70** |
| Inserted into `listing_duplicate_candidates` | **70** |
| Auto-merged | **0** |

Evidence: `pipelines/factory/fazwaz/_runs/cross-source-soft-matches.json`

## Policy

Ops must confirm/reject candidates. No merges this milestone.
