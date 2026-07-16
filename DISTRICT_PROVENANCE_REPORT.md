# DISTRICT_PROVENANCE_REPORT

**Milestone:** Phase 10 Sprint 5 · **Date:** 2026-07-16

## Evidence classes

| Class | Meaning |
|-------|---------|
| OFFICIAL | Named fact with public source URL (Wikipedia / official institution / package centroid) |
| OFFICIAL_ABSENCE | BTS/MRT verified absent from line maps (Sprint 4, retained) |
| UNVERIFIED | No named sourced fact yet — field left empty |

## Field provenance rules

| Field | Source rule |
|-------|-------------|
| overview | English Wikipedia REST page summary extract; ZH/TH parallel statements cite that the overview follows the EN wiki abstract (not a literary translation claim) |
| map | `metadata.latitude/longitude` → `google_maps_url` + `map` object |
| bts / mrt | Sprint 4 transit seed + line maps (unchanged policy) |
| schools / hospitals / shopping / parks | Named POIs only; Sprint 5 gap merges from curated seed |
| lifestyle | Curated i18n note + `source_url` (Wikipedia district page) |
| office_areas | Named corridor/cluster + Wikipedia district URL |

## What was refused

- Estimated population, yields, inventory counts, or amenity density statistics
- Vague “district medical/retail notes” without a specific place name
- Portal screenshots or scraped copyrighted media

## Timestamp

All Sprint 5 `field_evidence.verified_at` values: **2026-07-16**.
