# DEVELOPER_PROVENANCE_REPORT

**Milestone:** Phase 10 Sprint 2
**Date:** 2026-07-16
**Rule:** Every enriched field carries `evidence_class`, `provenance`, `verified_at`.

## Provenance source types used

| source_type | Meaning |
|-------------|---------|
| `official_developer_website` | Asset or page on developer domain |
| `set_factsheet` | SET company factsheet (address / establish date / ticker) |
| `set_factsheet_and_official_website` | Dual confirmation |
| `unavailable` | Left UNVERIFIED — not invented |
| `not_listed_or_unconfirmed` | Listed-code N/A |

## Field evidence coverage

| Developer | Logo | Favicon | Profile | Year | HQ | Contact | Listed | Social | History | Overview |
|-----------|------|---------|---------|------|----|---------|--------|--------|---------|----------|
| ananda-development | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| ap-thailand | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| assetwise | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| capitaland-thailand | OFFICIAL | OFFICIAL | PRESENT | UNVERIFIED | PRESENT | UNVERIFIED | NOT_APPLICABLE | PRESENT | UNVERIFIED | PRESENT |
| frasers-property-thailand | OFFICIAL | OFFICIAL | OFFICIAL | UNVERIFIED | OFFICIAL | UNVERIFIED | OFFICIAL | OFFICIAL | UNVERIFIED | OFFICIAL |
| land-and-houses | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| lpn-development | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | UNVERIFIED | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| major-development | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| mqdc | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | NOT_APPLICABLE | OFFICIAL | OFFICIAL | OFFICIAL |
| noble-development | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| origin-property | OFFICIAL | OFFICIAL | OFFICIAL | SET_OR_CATALOG | OFFICIAL | UNVERIFIED | OFFICIAL | OFFICIAL | UNVERIFIED | OFFICIAL |
| pruksa-holding | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | UNVERIFIED | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| quality-houses | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | UNVERIFIED | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| raimon-land | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| risland-thailand | OFFICIAL | OFFICIAL | PRESENT | UNVERIFIED | UNVERIFIED | UNVERIFIED | NOT_APPLICABLE | OFFICIAL | UNVERIFIED | PRESENT |
| sansiri | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| sc-asset | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| sena-development | OFFICIAL | OFFICIAL | OFFICIAL | UNVERIFIED | OFFICIAL | UNVERIFIED | OFFICIAL | OFFICIAL | UNVERIFIED | OFFICIAL |
| singha-estate | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| supalai | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |

Machine snapshot: `pipelines/factory/developer-master/sprint2_field_snapshot.json`
