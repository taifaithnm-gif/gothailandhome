# 04 — District Business Contract

**Document ID:** `04_DISTRICT_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **District** (and parent **City**) geography hubs used for Catalog linking, SEO, Search filters, and Knowledge Graph location edges.

## 2. Business Responsibility

- Provide stable geographic identity for Bangkok-first (then multi-city) discovery.
- Own district/city names, summaries, SEO, and sourced enrichment (transport/landmarks).
- Prevent thin, fabricated geography pages from becoming indexable.

Does **not** own: project facts, listing prices, or customer search sessions.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| District/City packages & catalog | Data Factory — Catalog Domain |
| Administrative truth | Sourced public authorities / attributed references |
| Rendering | Website consumer |

**Business key:** `city_slug` + `slug` (district); `slug` (city)

## 4. Inputs

- Approved geography sources (e.g., BMA, attributed encyclopedic summaries)
- SEO/summary drafts
- Optional sourced transportation/amenity lists

## 5. Outputs

- District/city packages and Serving Catalog rows
- `LOCATED_IN` / `NEAR` / `SERVES_TRANSIT` graph edges when confirmed
- Indexable hubs only when not thin

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `city_slug`, `slug` | District |
| `name` EN | |
| `sources[]` | |
| Envelope + review/publish flags | |

For indexable public hubs: summary EN + SEO EN title/description.

## 7. Relationships

- City 1 → * District
- District 1 → * Project / Listing (via location)
- District ↔ Knowledge `ABOUT`
- Search filters by district/city (`11`)

## 8. Business Rules

1. Bangkok 50 districts are Phase 2A completeness set.
2. Thin districts are not indexable.
3. No invented neighbor lists or coordinates.
4. Slug changes require redirects.

## 9. Validation Rules

- Composite uniqueness.
- Projects referencing unknown districts fail import validation.
- Coordinates require evidence when present.

## 10. Approval Rules

- Human review for public SEO hubs.
- Owner publish gate for production geography waves.

## 11. Lifecycle

Shared spine; geography changes infrequently; archive rare.

## 12. Future Compatibility

- Secondary cities reuse identical contract under new `city_slug`.
- Subdistrict (khwaeng) may become child entities later.

## 13. Cross References

- M0: `06_DISTRICT_DATA_STANDARD.md`, `09_SEO_DATA_STANDARD.md`
- M1: `02_PROJECT_CONTRACT.md`, `05_LISTING_CONTRACT.md`, `11_SEARCH_CONTRACT.md`, `14_SEO_CONTRACT.md`
