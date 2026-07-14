# CROSS_SOURCE_MATCH_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M5 Hipflat Wave 1  
**Rule:** Detect candidates only · **never auto-merge** · keep sources independent

## Inputs

| Source | Listings |
|--------|--------:|
| Hipflat (packages) | **0** |
| PropertyHub (packages) | 617 |
| LivingInsider (packages) | 316 |
| DDproperty (packages) | 0 (still BLOCKED) |

## Method

Soft-match fingerprint (shared identity helper):

`project_slug + listing_type + bedrooms + area_sqm(1dp) + floor_label`

Excludes title and price.  
Against PropertyHub and LivingInsider when Hipflat listings exist.  
Match reason: `cross_source_soft_match_hipflat_<other>` · confidence `0.55` · status `open`

## Results

| Metric | Count |
|--------|------:|
| Candidate pairs (package scan) | **0** |
| Inserted into `listing_duplicate_candidates` | **0** |
| Auto-merged | **0** |

Evidence: `pipelines/factory/hipflat/_runs/cross-source-soft-matches.json`

## Policy

- No Hipflat inventory → no new duplicate candidates this milestone.
- Existing LI↔PH open candidates from M3 unchanged by this run.
- Ops must explicitly confirm/reject any future Hipflat candidates before merge work.
