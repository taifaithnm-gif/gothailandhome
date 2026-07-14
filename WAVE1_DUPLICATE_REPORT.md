# WAVE1_DUPLICATE_REPORT

**Evidence:** `pipelines/factory/wave1-hardening/wave1-duplicates.json`  
**Policy:** Uncertain matches are **never** auto-merged.

## Hard identity (must be unique within source)

| Key | Duplicate groups |
|-----|-----------------:|
| `source` + `source_listing_id` | 0 |
| Raw `listing_url` | 0 |
| `normalized_source_url` | 0 |
| Identity fingerprint `sha256(id\|source\|source_listing_id)` | 0 |

## Soft-match candidates (cross-listing typology)

| Metric | Value |
|--------|------:|
| Soft fingerprint groups with ≥2 distinct listings | 34 |
| Candidate pairs inserted to `listing_duplicate_candidates` | 67 |
| Candidate status | `open` |
| Confidence assigned | 0.55 |
| Auto-merged | 0 |

Soft fingerprint inputs: `project_slug`, `listing_type`, `bedrooms`, `area_sqm` (1 decimal), `floor_label` — **excludes title and price**.

## Rules enforced

1. Primary identity = `(source, source_listing_id)` / identity fingerprint.  
2. Soft matches → `listing_duplicate_candidates` only.  
3. Ops must set status to `confirmed_duplicate` / `rejected` / `merged` before any merge work.  
4. No Wave1 records deleted during hardening.
