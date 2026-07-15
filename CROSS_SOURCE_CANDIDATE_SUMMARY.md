# CROSS_SOURCE_CANDIDATE_SUMMARY

**Date:** 2026-07-15  
**Milestone:** Phase 6 M8  
**Rule:** Consolidate for visibility only · **never auto-merge**

## Totals

| Metric | Count |
|--------|------:|
| Candidate rows (all statuses) | **191** |
| Open candidates | **191** |
| Auto-merged | **0** |

## Open candidates by match reason

| Match reason | Count |
|--------------|------:|
| `soft_match_fingerprint` | 67 |
| `cross_source_soft_match` | 28 |
| `cross_source_soft_match_fazwaz_propertyhub` | 57 |
| `cross_source_soft_match_dotproperty_propertyhub` | 23 |
| `cross_source_soft_match_fazwaz_dotproperty` | 8 |
| `cross_source_soft_match_fazwaz_livinginsider` | 5 |
| `cross_source_soft_match_dotproperty_livinginsider` | 3 |

## Method reminder

Soft fingerprint: `project_slug + listing_type + bedrooms + area_sqm(1dp) + floor_label`  
Excludes title and price. Confidence typically `0.55`. Status must remain `open` until ops confirm/reject.

## Policy

- Sources remain independent inventory.
- No merge UI automation or SQL merge was run in M8.
- Recommended ops queue: review FazWaz↔PropertyHub (57) and DotProperty↔PropertyHub (23) first.

Evidence: Supabase `listing_duplicate_candidates` · snapshot in overnight audit JSON.
