# 04 — Project Data Standard

**Document ID:** `04_PROJECT_DATA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the canonical **Project** entity: a named real-estate development hub that links developer, geography, media, SEO, and listings.

## 2. Scope

Package path pattern: `content/projects/<slug>/manifest.json` (+ listing sidecars). Serving table concept: `property_projects`.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Project** | Marketed development (e.g., condo project) with stable `slug`. |
| **Project package** | Manifest + optional `listings-*.json` + media manifests. |
| **Transit tag** | Controlled token (e.g., `bts`, `mrt`) when sourced. |
| **Completeness grade** | A/B/C score for publish readiness (ops). |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Package dir | `content/projects/<slug>/` |
| Manifest | `manifest.json` |
| Listing sidecars | `listings.json`, `listings-<source>.json` |
| Slug | kebab-case, immutable after first publish |
| Nested blocks | `developer`, `location`, `project`, `seo` |

## 5. Required Fields

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | Business key |
| `developer.slug` | string | Must resolve |
| `location.city_slug` | string | e.g. `bangkok` |
| `location.district_slug` | string | Required for publish_ready |
| `project.name` | I18nString | EN required |
| `sources[]` | array | ≥ 1 |
| `publish_ready` | boolean | Ops flag; not a substitute for review_status |
| `schema_version` | string | When under M0 envelope |
| `package_version` | integer | Monotonic |
| Property attrs | per `03` | `property_type` / completion as applicable |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `project.description` | I18nString |
| `project.address` | I18nString; sourced |
| `project.postal_code` | string |
| `project.latitude` / `longitude` | Only with evidence |
| `project.google_maps_url` | Sourced |
| `project.official_website` / `facebook_url` | Sourced |
| `project.completion_year` | integer |
| `project.transit_tags[]` | Controlled tokens |
| `project.facilities` / `unit_types` / `faq` | Structured JSON; sourced or marked boilerplate |
| `seo` | Per `09` |
| `media` | Per `11` |
| `locale_status` | `complete` \| `partial` \| `blocked` |
| `verification_status` | Catalog verification |
| `nearby` | Schools/hospitals/malls when sourced |

## 7. Validation Rules

1. `slug` unique among projects.  
2. `developer.slug` must exist or be imported in same batch before apply.  
3. Coordinates require source evidence; no geocode invention in factory.  
4. `publish_ready = true` requires: developer link, city+district, EN name, ≥1 source, SEO titles not empty for EN, no P0 validation failures.  
5. FAQ boilerplate must be marked; cannot present as project-specific sourced fact.  
6. Listing sidecars must reference the same project slug.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| PRJ-Q1 | Completeness A: profile + SEO trinity + media cover + district + developer + ≥1 source |
| PRJ-Q2 | Completeness C (stub) not public-grade |
| PRJ-Q3 | Listing count ≠ project completeness |
| PRJ-Q4 | Portal marketing claims are not verified specs without corroboration |
| PRJ-Q5 | Prefer official developer source for core facts |

## 9. Lifecycle

Follows shared spine (`18`). Typical path:

`candidate package → validated → in_review → approved → publish_ready → imported/published → stale|archived`

Unpublishing hides from public serving filters; package retained.

## 10. Examples

```json
{
  "entity_type": "project",
  "slug": "ashton-asoke",
  "schema_version": "1.0.0",
  "package_version": 1,
  "publish_ready": true,
  "locale_status": "complete",
  "developer": { "slug": "ananda-development" },
  "location": {
    "city_slug": "bangkok",
    "district_slug": "watthana",
    "country_code": "TH"
  },
  "project": {
    "name": { "en": "Ashton Asoke", "zh": "Ashton Asoke", "th": "แอชตัน อโศก" },
    "property_type": "condo",
    "completion_status": "completed",
    "completion_year": 2017,
    "transit_tags": ["bts", "mrt"]
  },
  "sources": [
    { "type": "official_developer", "url": "https://example.invalid/ashton-asoke" }
  ]
}
```

## 11. Future Compatibility

- Multi-city projects reuse same package shape.  
- Additive JSONB blocks for specs without breaking slug identity.  
- Graph edge `DEVELOPS` / `LOCATED_IN` / `HAS_LISTING` derived from this entity.  
- Windows01 may attach `raw_item_id`s per source without changing `slug`.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Property attrs | `03_PROPERTY_DATA_STANDARD.md` |
| Developer | `05_DEVELOPER_DATA_STANDARD.md` |
| District | `06_DISTRICT_DATA_STANDARD.md` |
| Listing | `07_LISTING_DATA_STANDARD.md` |
| SEO / media | `09`, `11` |
| Relationships | `02_ENTITY_RELATIONSHIP_STANDARD.md` |
| Package schemas (existing) | `pipelines/factory/schemas/project.manifest.json` |
