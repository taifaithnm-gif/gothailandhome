# PROJECT_EVIDENCE_PRESENTATION_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.5 — Project Detail Alpha

## Source of truth

`pipelines/factory/project-master/completeness_matrix.json` (50 projects). **Not rewritten** in this milestone.

## User-facing labels

| Matrix class | UI label | Badge level |
|--------------|----------|-------------|
| OFFICIAL | Official source confirmed | official |
| VERIFIED_PORTAL | Verified from property source | verified_portal |
| DERIVED | Calculated from verified data | derived |
| UNVERIFIED | Information unavailable | unverified |

Internal jargon (`C_*` field keys, matrix enum strings) is not shown in primary UI copy.

## Presentation rules

- Facts with `UNVERIFIED` classification are not presented as official values.
- Map coordinates render as verified only when **both** latitude and longitude are OFFICIAL or VERIFIED_PORTAL.
- Hero media uses real official gallery paths only when `C_official_gallery_source === OFFICIAL` and a hero path exists; otherwise neutral no-image.
- Facilities: official package facilities shown under Official when class is OFFICIAL; portal-sourced DB facilities shown separately under Portal-verified.
- Price summary uses DERIVED labeling and never claims developer official pricing.

## Validation

`npm run test:project-evidence` — PASS (matrix size 50, label keys, coordinate gate dense/sparse, enum integrity).

## Overall

# PASS — Evidence presentation without classification changes
