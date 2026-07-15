# DEVELOPER_COMPLETENESS_MATRIX

**Phase:** 7 — Developer Master  
**Date:** 2026-07-15  
**Universe:** 20 verified developers (`content/developers/*/manifest.json`)  
**Rule:** Official developer websites only for OFFICIAL. Never invent.  
**Detail report:** `DEVELOPER_MASTER_REPORT.md`  
**JSON:** `pipelines/factory/developer-master/completeness_matrix.json`

## Legend

| Code | Meaning |
|------|---------|
| **OFFICIAL** | Confirmed from official developer website (or official developer-domain IR/sustainability asset) |
| **PRESENT** | Profile/HQ text present but not upgraded from official About this phase |
| **SET_OR_CATALOG** | Established year present from prior SET/catalog package — **not** official-website-confirmed |
| **CITY_ONLY** | Headquarters is city-level only (e.g. Bangkok, Thailand) |
| **FACTORY** | Completed/active list derived from factory project package status only |
| **MIXED** | Mix of official + factory classifications (none in current snap) |
| **PLACEHOLDER** | Logo slot is placeholder SVG; no official logo URL |
| **MISSING** | Empty; not inferred |

## Summary (20 developers)

| Field | OFFICIAL | PRESENT / OTHER | MISSING / PLACEHOLDER |
|-------|--------:|----------------:|----------------------:|
| Official name | 20 | 0 | 0 |
| Logo source | 0 | 0 | 20 PLACEHOLDER |
| Official website | 20 | 0 | 0 |
| Company profile | 3 | 17 PRESENT | 0 |
| Established year | 3 | 4 SET_OR_CATALOG | 13 |
| Headquarters | 2 | 1 PRESENT · 17 CITY_ONLY | 0 |
| Completed projects | 1 | 15 FACTORY | 4 |
| Active projects | 1 | 0 | 19 |

**Fully OFFICIAL on all 8 fields:** 0 / 20

## Matrix

| Developer slug | Name | Logo | Website | Profile | Year | HQ | Completed | Active |
|---|---|---|---|---|---|---|---|---|
| ananda-development | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | SET_OR_CATALOG | CITY_ONLY | FACTORY | MISSING |
| ap-thailand | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | SET_OR_CATALOG | PRESENT | FACTORY | MISSING |
| assetwise | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| capitaland-thailand | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | MISSING | MISSING |
| frasers-property-thailand | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | MISSING | MISSING |
| land-and-houses | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | SET_OR_CATALOG | CITY_ONLY | FACTORY | MISSING |
| lpn-development | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | MISSING | MISSING |
| major-development | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| mqdc | OFFICIAL | PLACEHOLDER | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL |
| noble-development | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| origin-property | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | SET_OR_CATALOG | CITY_ONLY | MISSING | MISSING |
| pruksa-holding | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| quality-houses | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| raimon-land | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| risland-thailand | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| sansiri | OFFICIAL | PLACEHOLDER | OFFICIAL | OFFICIAL | OFFICIAL | OFFICIAL | FACTORY | MISSING |
| sc-asset | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| sena-development | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | FACTORY | MISSING |
| singha-estate | OFFICIAL | PLACEHOLDER | OFFICIAL | PRESENT | MISSING | CITY_ONLY | MISSING | MISSING |
| supalai | OFFICIAL | PLACEHOLDER | OFFICIAL | OFFICIAL | OFFICIAL | CITY_ONLY | FACTORY | MISSING |

## Value snapshot (non-secret)

| Slug | Year | HQ (en) | Completed slugs | Active slugs |
|------|-----:|---------|-----------------|--------------|
| mqdc | 1994 | 695, Moo 12, Bang Kaeo, Bang Phli, Samut Prakan 10540 | whizdom-essence | the-forestias |
| sansiri | 1984 | 59 Soi Rim Khlong Phra Khanong, Phra Khanong Nuea, Watthana, Bangkok 10110 | (factory-linked) | — |
| supalai | 1989 | Bangkok, Thailand (city-level) | (factory-linked) | — |

### Coding notes

- **Logo PLACEHOLDER** means `logo_source.status=placeholder` and `official_logo_url=null`.  
- **Completed/Active FACTORY** means lists built from `project_slugs` × project `construction_status`, not an official portfolio scrape.  
- **Completed/Active MISSING** means no linked factory projects had a classifiable status (often identity-only packages).  
- **Year SET_OR_CATALOG** must not be advertised as official-website-verified.

---

**Status:** MATRIX COMPLETE — GAPS RETAINED HONESTLY
