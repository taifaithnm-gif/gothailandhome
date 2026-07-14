# WAVE1_FIELD_COMPLETENESS_REPORT

**Scope:** 33 Wave1 projects with listings + listing identity fields after normalization.  
**Evidence:** `pipelines/factory/wave1-hardening/project-developer-completeness.json`

## Listing identity fields (all 617)

Added/normalized in packages and DB (not invented facts):

- `source` (canonical lowercase)
- `source_listing_id`
- `normalized_source_url`
- `source_url_hash`
- `duplicate_fingerprint` (identity)
- `soft_match_fingerprint`
- `listing_lifecycle_status=active`
- `last_seen_at` / `last_verified_at` from capture dates

## Project package gaps (do not invent)

| Field | Missing among 33 |
|-------|-----------------:|
| `total_units` | 32 |
| `building_count` | 32 |
| `total_floors` | 32 |
| Media (`hero`/`og`) | 32 |
| BTS/MRT transit tags | 3 |

Present on essentially all Wave1 projects: official name, Thai name, developer, district, address, GPS (from PropertyHub enrichment), construction status / completion year (where sourced), facilities (where sourced), official website / sources, verification timestamp (`collected_at`).

## Next fill rules

Only official developer / project pages or trusted maps. No estimation of units/floors/media.
