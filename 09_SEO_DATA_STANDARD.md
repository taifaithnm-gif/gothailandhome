# 09 — SEO Data Standard

**Document ID:** `09_SEO_DATA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define SEO as a first-class data product: fields, uniqueness, indexability, canonical identity, and structured-data payload rules for Catalog and Knowledge entities.

## 2. Scope

SEO fields on developers, projects, districts/cities, listings, and knowledge items. Excludes frontend rendering implementation; includes logical JSON-LD payload constraints.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **SEO block** | `title` + `description` per locale (nested or flat). |
| **Indexable** | Eligible for sitemap/public robots index. |
| **Canonical slug** | Stable public path key. |
| **Thin content** | Insufficient unique summary/SEO — non-indexable. |
| **Structured data payload** | JSON-LD object derived only from approved fields. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Nested package | `seo.title.{en,zh,th}`, `seo.description.{en,zh,th}` |
| Flat serving | `seo_title_en`, `seo_description_en`, … |
| Brand suffix | Prefer consistent site brand token when used |
| Redirect sidecar | `redirects[]` `{ from_slug, to_slug, type }` |

## 5. Required Fields

For indexable entities:

| Field | Notes |
| --- | --- |
| `seo.title.en` | Non-empty; length band enforced |
| `seo.description.en` | Non-empty; length band enforced |
| Canonical `slug` | Stable |
| `indexable` flag or derived rule | Default false until gates pass |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `seo.title.zh` / `th` | Required for `locale_status = complete` |
| `seo.description.zh` / `th` | Same |
| OG/hero asset ref | Projects/developers |
| `canonical_path` | If differs from default pattern |
| `robots` directives | Logical: `index` \| `noindex` |
| `jsonld_types[]` | Declared schema.org types |

### Length bands (planning defaults)

| Field | Min | Max (soft) |
| --- | --- | --- |
| Title | 10 | 70 |
| Description | 50 | 160 |

Exact linter thresholds may tighten in M1 without changing field names.

## 7. Validation Rules

1. Uniqueness: `seo.title` unique within (`entity_type`, locale) for published set.  
2. No forbidden legal/investment outcome claims in SEO text (`08`, `19`).  
3. Titles/descriptions must not fabricate inventory counts or prices.  
4. Slug change requires redirect record before apply.  
5. Structured data may only include approved, non-null fields.  
6. Districts: thin pages cannot be `indexable`.  
7. Listings: SEO may fall back to title/summary; still no fabrication.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| SEO-Q1 | Locale titles describe the same entity, not different products |
| SEO-Q2 | Prefer human-reviewed SEO for top hubs (districts, flagship projects, developers) |
| SEO-Q3 | Keyword stuffing → quality flag |
| SEO-Q4 | Sitemap entity set = published ∩ indexable |
| SEO-Q5 | Freshness of entity influences revisit policy, not fake “updated” SEO dates |

## 9. Lifecycle

SEO fields version with parent package. Indexability flips only when parent reaches `published` and SEO gates pass. On `stale`/`archived`, set logical `noindex` as policy requires.

## 10. Examples

```json
{
  "seo": {
    "title": {
      "en": "Ashton Asoke Condo in Watthana, Bangkok | GoThailandHome",
      "zh": "曼谷瓦他那 Ashton Asoke 公寓 | GoThailandHome",
      "th": "คอนโด Ashton Asoke วัฒนา | GoThailandHome"
    },
    "description": {
      "en": "Explore Ashton Asoke in Watthana with sourced project facts and verified public listings as inventory is imported.",
      "zh": "了解位于瓦他那的 Ashton Asoke；项目事实来自来源，挂牌随真实导入上线。",
      "th": "ข้อมูลโครงการ Ashton Asoke เขตวัฒนา จากแหล่งที่ตรวจสอบได้"
    }
  },
  "indexable": true
}
```

## 11. Future Compatibility

- Additive hreflang metadata may appear without renaming SEO blocks.  
- AI may draft SEO text as `machine_draft` only.  
- Search Console feedback loops attach as ops annotations, not entity fact changes.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Entities using SEO | `04`, `05`, `06`, `07`, `08` |
| Governance / forbidden claims | `19`, `08` |
| Lifecycle | `18` |
| Master plan SEO Pipeline | `DATA_FACTORY_MASTER_PLAN.md` §9 |
