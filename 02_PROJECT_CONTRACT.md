# 02 — Project Business Contract

**Document ID:** `02_PROJECT_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Project**: the named development hub that connects Developer, District, Listings, Media, and SEO.

## 2. Business Responsibility

- Represent one real development as a stable catalog hub.
- Bind Developer and geography.
- Host project-level facts, media, and SEO.
- Provide the attachment point for Listings.

Does **not** own: individual sale/rent offers, developer brand master, district master, or inquiry handling.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Project package & catalog record | Data Factory — Catalog Domain |
| Publish to Serving Catalog | Data Ops under Publish Workflow |
| Page rendering | Website (consumer) |

**Business key:** `slug`

## 4. Inputs

- Official developer and portal sources (approved)
- Developer slug, city/district slugs
- Media assets, SEO drafts, listing sidecars
- Review decisions

## 5. Outputs

- Versioned project package
- Serving Catalog project projection
- Graph edges: `DEVELOPS` (from developer), `LOCATED_IN`, `HAS_LISTING`
- Indexable hub when publish gates pass

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `slug` | Immutable after first publish (except Owner rename + redirect) |
| `developer` reference | slug/id |
| `city_slug` + `district_slug` | For publish_ready |
| `name` (EN min) | Locale Trinity rules |
| `sources[]` | ≥ 1 |
| Property typology attrs | Per Property contract as applicable |
| Envelope | `schema_version`, `package_version`, `review_status` |

## 7. Relationships

- **Developer** 1 → * Project
- **District/City** 1 → * Project
- **Project** 1 → * Listing
- **Project** 1 → * Media
- **Project** 1 → 1 SEO block
- **Knowledge** may `ABOUT` Project

## 8. Business Rules

1. One slug = one project identity.
2. Completeness grade C is not public-grade.
3. Coordinates only when evidenced.
4. Listing count ≠ project completeness.
5. Prefer official sources for core facts.

## 9. Validation Rules

- Unknown developer/district references fail publish_ready.
- P0 validation failures block approval.
- FAQ boilerplate must be marked.

## 10. Approval Rules

- Human review required for `approved` / `publish_ready`.
- AI cannot approve.
- Owner gate applies to production publish batches containing projects.

## 11. Lifecycle

`candidate → validated → in_review → approved → publish_ready → published → stale|archived|rejected`

## 12. Future Compatibility

- Multi-city reuse of same contract.
- Marketplace developer accounts may link without changing `slug`.

## 13. Cross References

- M0: `04_PROJECT_DATA_STANDARD.md`, `02_ENTITY_RELATIONSHIP_STANDARD.md`
- M1: `01_PROPERTY_CONTRACT.md`, `03_DEVELOPER_CONTRACT.md`, `04_DISTRICT_CONTRACT.md`, `05_LISTING_CONTRACT.md`, `06_MEDIA_CONTRACT.md`, `14_SEO_CONTRACT.md`, `17_REVIEW_WORKFLOW_CONTRACT.md`, `18_PUBLISH_WORKFLOW_CONTRACT.md`
