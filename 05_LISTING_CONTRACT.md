# 05 — Listing Business Contract

**Document ID:** `05_LISTING_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Listing**: a market offer (sale/rent) with provenance, price, identity, verification, and multi-source observations.

## 2. Business Responsibility

- Represent real offers with source URL, identity, and THB price provenance.
- Support multi-source observations and deterministic identity resolution.
- Feed Search, Recommendations, Compare/Favorites targets, and Inquiry handoff targets.

Does **not** own: Project master data, Developer brand, Customer accounts, or Inquiry messaging content.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Listing packages & Serving Catalog listings | Data Factory — Catalog Domain |
| Source observations / price history | Catalog Domain |
| Soft-match confirmation | Reviewer |
| Public card/detail UI | Website consumer |

**Business key:** `source` + `external_ref` (or URL hash)

## 4. Inputs

- Harvested portal/developer offer records from approved sources
- Project/district link suggestions
- Media refs; verification/review decisions
- Freshness assessments

## 5. Outputs

- Versioned listing records / sidecars
- Serving Catalog listing projections
- Observations + price history events
- Graph `HAS_LISTING`, optional `SAME_AS`
- Search/recommend candidate inventory

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `source`, `listing_url` | Provenance |
| `listing_type` | `sale` \| `rent` |
| `property_type` | Property contract |
| `price_thb` | For publish-grade offers |
| Identity | external_ref and/or URL hash |
| `title` EN | For publish |
| `source_updated_at` or capture fallback | Explicit |
| Envelope / verification / review statuses | |

## 7. Relationships

- Listing * → 1 Project (preferred; orphans flagged)
- Listing → District/City
- Listing → Media
- Listing → * Source observations
- Inquiry / Favorite / Search / Recommendation **reference** Listing; they do not own it

## 8. Business Rules

1. Provenance always (DQ-02).
2. Soft-match never auto-publishes merges.
3. Stale listings are not “current” offers.
4. Delisted → non-public.
5. AI match suggestions remain soft until human confirm.

## 9. Validation Rules

- Absolute listing URL; THB price rules; identity present.
- Freshness bands drive `stale`.
- P0 identity collisions among published listings blocked.

## 10. Approval Rules

- Human gate for publish-grade verification where policy requires.
- Batch publish under `18_PUBLISH_WORKFLOW_CONTRACT`.
- AI cannot set published.

## 11. Lifecycle

Catalog spine + `verification_status` (`unverified` → `verified` → `stale`/`delisted`).

## 12. Future Compatibility

- Marketplace owner listings use same field contract with `source = gth_marketplace`.
- Additional portals add source keys only.

## 13. Cross References

- M0: `07_LISTING_DATA_STANDARD.md`, `14_IDENTIFIER_STANDARD.md`, `13_DATA_QUALITY_STANDARD.md`
- M1: `01_PROPERTY_CONTRACT.md`, `02_PROJECT_CONTRACT.md`, `09_INQUIRY_CONTRACT.md`, `10_FAVORITE_CONTRACT.md`, `11_SEARCH_CONTRACT.md`, `12_RECOMMENDATION_CONTRACT.md`, `15_IMPORT_JOB_CONTRACT.md`
