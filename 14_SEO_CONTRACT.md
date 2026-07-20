# 14 — SEO Business Contract

**Document ID:** `14_SEO_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **SEO as a data product**: titles, descriptions, indexability, canonical identity, and structured-data eligibility for Catalog and Knowledge entities.

## 2. Business Responsibility

- Ensure every indexable entity has honest, unique, locale-aware SEO fields.
- Gate thin content from indexability.
- Constrain JSON-LD payloads to approved fields only.

Does **not** own: entity facts, URL routing implementation, or Search Console operations runbooks (ops may consume outputs).

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| SEO field values | Parent entity owner (Project, Developer, District, Listing, Knowledge) |
| SEO rules & linter policy | Data Factory — SEO Domain |
| Indexability decision | Derived from parent publish + SEO gates |
| Rendering meta tags | Website consumer |

## 4. Inputs

- Parent entity approved fields
- SEO drafts (human or machine_draft)
- Uniqueness/linter results
- Redirect intents on slug change

## 5. Outputs

- SEO blocks on packages / serving columns
- `indexable` eligibility
- Sitemap membership set (logical)
- Structured-data payload descriptors

## 6. Required Attributes

For indexable entities:

| Attribute | Notes |
| --- | --- |
| `seo.title.en`, `seo.description.en` | |
| Canonical slug | Parent |
| Indexability flag or derived rule | |

## 7. Relationships

- SEO 1 → 1 parent entity
- OG/hero may reference Media
- Sitemap reads published ∩ indexable
- Search Console feedback is ops annotation, not entity fabrication

## 8. Business Rules

1. No fabricated inventory counts or prices in SEO text.
2. No forbidden legal/investment outcome claims.
3. Locale titles describe the same entity.
4. Thin districts not indexable.
5. Slug change requires redirect record.

## 9. Validation Rules

- Length bands & uniqueness per M0 SEO standard.
- Machine drafts cannot be `publish_ready` until accepted.
- Structured data excludes null/unapproved fields.

## 10. Approval Rules

- High-traffic hubs: human SEO review recommended/required per policy.
- Follows parent Review/Publish workflows; no standalone SEO publish.

## 11. Lifecycle

Versions with parent; `noindex` on archive/stale per policy.

## 12. Future Compatibility

- hreflang metadata additive.
- AI draft SEO remains `machine_draft` only.

## 13. Cross References

- M0: `09_SEO_DATA_STANDARD.md`
- M1: `02`–`05`, `13_KNOWLEDGE_CONTRACT.md`, `06_MEDIA_CONTRACT.md`, `18_PUBLISH_WORKFLOW_CONTRACT.md`
