# 05 — Developer Data Standard

**Document ID:** `05_DEVELOPER_DATA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the canonical **Developer** entity: brand/legal identity, multilingual profile, SEO, media, and governance flags for the Catalog Domain.

## 2. Scope

Package path: `content/developers/<slug>/manifest.json`. Serving table concept: `developers`.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Developer** | Real-estate developer organization with stable `slug`. |
| **Legal name** | Registered/company name; may differ from brand `name`. |
| **Official source** | Developer-controlled website or IR materials. |
| **Completeness grade** | A/B/C publish readiness. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Dir | `content/developers/<slug>/` |
| Slug | kebab-case brand slug (`sansiri`, `ananda-development`) |
| Nested i18n | `name`, `legal_name`, `description` as I18nString |
| Source `type` | `official_developer`, `facebook`, `other_public_portal`, etc. |

## 5. Required Fields

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | Business key |
| `name` | I18nString | EN required |
| `sources[]` | array | ≥ 1; prefer official |
| `publish_ready` | boolean | Ops flag |
| `schema_version` | string | M0 envelope |
| `package_version` | integer | Monotonic |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `legal_name` | I18nString |
| `description` | I18nString |
| `logo` / media refs | Per `11` |
| `official_website` | URL |
| `facebook_url` / social | Sourced URLs |
| `google_maps_url` | HQ/brand place when sourced |
| `established_year` | integer; evidence required |
| `seo` | Per `09` |
| `locale_status` | Trinity status |
| `verification_status` | Catalog verification |
| `contacts` | Public contacts only; minimize PII |

## 7. Validation Rules

1. `slug` unique among developers.  
2. EN `name` non-empty for any review beyond `candidate`.  
3. `publish_ready = true` requires: EN name, ≥1 official or corroborated source, SEO EN title/description present, no P0 failures.  
4. Logo requires rights/source note before public use.  
5. Social URLs must match declared `sources` or be listed as fields with provenance.  
6. Do not invent SET ticker, founding year, or award claims.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| DEV-Q1 | Grade A: name trinity + SEO trinity + logo + official link + ≥1 published project link |
| DEV-Q2 | Grade C name-only stubs are not public-grade |
| DEV-Q3 | Prefer official site over portals for profile narrative |
| DEV-Q4 | Press claims need corroboration for publish |
| DEV-Q5 | ZH/TH machine drafts flagged until human accept |

## 9. Lifecycle

Shared spine (`18`). Projects may reference a developer in `validated` state, but both must be `publish_ready`/`published` for public developer hub pages.

## 10. Examples

```json
{
  "entity_type": "developer",
  "slug": "sansiri",
  "schema_version": "1.0.0",
  "package_version": 1,
  "publish_ready": true,
  "locale_status": "complete",
  "name": { "en": "Sansiri", "zh": "尚思瑞", "th": "แสนสิริ" },
  "legal_name": {
    "en": "Sansiri Public Company Limited",
    "zh": "Sansiri Public Company Limited",
    "th": "บริษัท แสนสิริ จำกัด (มหาชน)"
  },
  "sources": [
    { "type": "official_developer", "name": "Sansiri official website", "url": "https://www.sansiri.com/" }
  ],
  "seo": {
    "title": {
      "en": "Sansiri Developer | GoThailandHome",
      "zh": "尚思瑞开发商 | GoThailandHome",
      "th": "แสนสิริ | GoThailandHome"
    }
  }
}
```

## 11. Future Compatibility

- `organizations` / marketplace accounts may link via `developer.slug` without renaming.  
- Multi-brand groups: use `SAME_AS` / parent edges later; do not overload slug.  
- Graph node type `Developer` uses this business key.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Projects | `04_PROJECT_DATA_STANDARD.md` |
| Relationships | `02_ENTITY_RELATIONSHIP_STANDARD.md` |
| SEO / media | `09`, `11` |
| Existing schema | `pipelines/factory/schemas/developer.manifest.json` |
| Model | `01_DATA_MODEL_STANDARD.md` |
