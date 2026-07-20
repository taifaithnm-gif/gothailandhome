# 06 — District Data Standard

**Document ID:** `06_DISTRICT_DATA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the canonical **District** (and parent **City**) geography entities that power Catalog linking and SEO hubs.

## 2. Scope

Package path: `content/areas/<city_slug>/districts/<slug>.json`. Serving concepts: `cities`, `districts`. M0 priority: Bangkok 50 districts.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **City** | Metro/province hub with `slug` (e.g., `bangkok`). |
| **District** | Administrative district / khet under a city. |
| **Thin page** | District with insufficient summary/SEO — not indexable. |
| **Landmark / transportation** | Sourced nearby nodes for enrichment. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| City slug | `bangkok`, future `pattaya`, `phuket` |
| District slug | kebab-case (`watthana`, `khlong-toei`) |
| Composite key | `city_slug` + `slug` |
| Package file | `<district-slug>.json` |

## 5. Required Fields

| Field | Type | Notes |
| --- | --- | --- |
| `city_slug` | string | Parent city |
| `slug` | string | District slug |
| `name` | I18nString | EN required |
| `sources[]` | array | ≥ 1 |
| `publish_ready` | boolean | Ops flag |
| `schema_version` | string | M0 envelope |
| `package_version` | integer | Monotonic |

City entity (logical):

| Field | Notes |
| --- | --- |
| `slug` | e.g. `bangkok` |
| `name` | I18nString |
| `country_code` | `TH` |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `summary` | I18nString; required for indexable public hubs |
| `seo` | Per `09` |
| `locale_status` | Trinity status |
| `metadata.district_code` | Official code when sourced |
| `metadata.postal_code` | Representative only; may be multi |
| `metadata.latitude` / `longitude` | Centroid only if sourced |
| `transportation[]` | Named nodes with i18n names |
| `amenities[]` / landmarks | Sourced |
| `is_active` | Serving visibility |

## 7. Validation Rules

1. Composite (`city_slug`,`slug`) unique.  
2. District `publish_ready` for public SEO requires: name EN, summary EN, SEO EN title+description, ≥1 source, not thin.  
3. Coordinates optional; if present must be evidenced.  
4. Do not invent neighboring-district lists.  
5. Wikipedia/BMA sources allowed when attributed; still no fabrication beyond source.  
6. Projects referencing unknown district slugs fail import validation.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| DIST-Q1 | Bangkok 50 districts are the Phase 2A completeness set |
| DIST-Q2 | Summary trinity preferred before `locale_status = complete` |
| DIST-Q3 | Thin districts remain `is_active = false` or non-indexable |
| DIST-Q4 | Transportation entries need name + source basis |
| DIST-Q5 | SEO uniqueness checked within district entity type + locale |

## 9. Lifecycle

Shared spine (`18`). Geography entities change rarely; slug changes require redirect records (`09`, `15`).

## 10. Examples

```json
{
  "entity_type": "district",
  "city_slug": "bangkok",
  "slug": "watthana",
  "schema_version": "1.0.0",
  "package_version": 1,
  "publish_ready": true,
  "locale_status": "complete",
  "name": { "en": "Watthana", "zh": "瓦他那", "th": "วัฒนา" },
  "summary": {
    "en": "Watthana is a Bangkok district (khet).",
    "zh": "瓦他那为曼谷行政区。",
    "th": "วัฒนาเป็นเขตของกรุงเทพมหานคร"
  },
  "seo": {
    "title": {
      "en": "Watthana Bangkok Property | GoThailandHome",
      "zh": "曼谷瓦他那房产 | GoThailandHome",
      "th": "อสังหาฯ วัฒนา กรุงเทพฯ | GoThailandHome"
    }
  },
  "sources": [
    { "type": "wikipedia", "url": "https://en.wikipedia.org/wiki/Watthana_district" }
  ]
}
```

## 11. Future Compatibility

- Secondary cities reuse identical package shape under `content/areas/<city>/districts/`.  
- Subdistrict (khwaeng) may appear as child entities later without changing district keys.  
- Graph: `LOCATED_IN`, `NEAR`, `SERVES_TRANSIT`.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Projects linking geography | `04_PROJECT_DATA_STANDARD.md` |
| SEO | `09_SEO_DATA_STANDARD.md` |
| Relationships | `02_ENTITY_RELATIONSHIP_STANDARD.md` |
| Existing schema | `pipelines/factory/schemas/district.package.json` |
| Model | `01_DATA_MODEL_STANDARD.md` |
