# DISTRICT_PROVENANCE_REPORT

**Milestone:** Phase 10 Sprint 5 (5b deepen) · **Date:** 2026-07-16

## Evidence classes

| Class | Meaning |
|-------|---------|
| OFFICIAL | Named fact with public source URL |
| OFFICIAL_ABSENCE | BTS/MRT verified absent from line maps |
| UNVERIFIED | No named sourced fact yet |

## Field provenance rules

| Field | Source rule |
|-------|-------------|
| overview | Wikipedia REST summary extract (S5a) |
| map | Package centroid → Google Maps URL |
| bts / mrt | Sprint 4 transit seed + line maps |
| schools / hospitals / shopping / parks | Named Wikipedia links (and named bullets) from district Places/Education sections; botanical false positives removed |
| lifestyle | Curated note **or** first sentence of Wikipedia extract |
| office_areas | Curated named corridors only (no invention for outer districts) |

## Harvest hygiene

- Rejected botanical false positives (e.g. lotus → Nelumbo nucifera)
- Rejected generic one-word labels (market, park, school)
- Rate-limit skips from first harvest pass were re-fetched to reach 50/50 district coverage

## Timestamp

All Sprint 5 field_evidence.verified_at values: **2026-07-16**.
