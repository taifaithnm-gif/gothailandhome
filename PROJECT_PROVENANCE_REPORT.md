# PROJECT_PROVENANCE_REPORT

**Milestone:** Phase 10 Sprint 3
**Date:** 2026-07-16
**Rule:** Every credibility field carries `provenance`, `verified_at`, and `evidence_class` in `manifest.field_evidence`.

## Evidence classes

| Class | Meaning |
|-------|---------|
| OFFICIAL | Confirmed on developer/project official site or official PDF |
| VERIFIED_PORTAL | Present via verified marketplace/portal package evidence |
| UNVERIFIED | Not confirmed from official sources this sprint |

## Provenance patterns

| Field | Typical provenance when OFFICIAL |
|-------|----------------------------------|
| official_project_page | `official_developer_website` → project path on developer domain |
| official_address | Official project page / brochure legal location text |
| official_gallery | Prior master matrix OFFICIAL only (no new harvest) |
| official_brochure | Official PDF on developer CDN (e.g. AP Thai) |
| official_floor_plan | Prior master matrix OFFICIAL only |
| official_facilities | Facility names listed on official project page |

## Notable OFFICIAL upgrades (S3)

| Project | Fields upgraded | Source URL |
|---------|-----------------|------------|
| noble-around-ari | address, facilities | https://www.noblehome.com/en/condominium/around-ari |
| rhythm-ekkamai | URL, address, facilities, brochure | https://www.apthai.com/en/condominium/rhythm-ekkamai-estate (+ brochure PDF) |
| xt-phayathai | URL, address | https://www.sansiri.com/hotdeal/project/xt-phayathai |
| supalai-oriental-sukhumvit-39 | URL, facilities | https://www.supalai.com/en/project/condo/supalai-oriental-sukhumvit-39 |
| life-asoke-rama-9 / life-ladprao / ideo-* / ashton-asoke | project-specific URL retained/confirmed | Ananda / AP Thai project paths |

## Verification timestamp

All Sprint 3 `field_evidence.verified_at` values: **2026-07-16**.

## Artifact

`pipelines/factory/project-master/sprint3_field_snapshot.json`
