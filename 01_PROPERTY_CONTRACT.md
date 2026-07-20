# 01 — Property Business Contract

**Document ID:** `01_PROPERTY_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Property** as the shared real-estate typology and physical-attribute responsibility used by Projects and Listings. This contract states *what* the platform manages, not *how* it is stored or rendered.

## 2. Business Responsibility

- Own the controlled vocabulary for `property_type` and shared physical attributes (area, bedrooms, bathrooms, parking, completion).
- Ensure unknown ≠ zero and null-over-fabricate for physical facts.
- Provide a consistent facet language for Search and Recommendations.

Does **not** own: market offers (Listing), development hubs (Project), or SEO copy.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Typology & attribute rules | Data Factory — Catalog Domain |
| Package field presence on Project/Listing | Respective entity owners |
| Public display of attributes | Website (consumer only) |

## 4. Inputs

- Sourced original attribute text from approved sources
- Normalization rule version references
- Evidence ids when attributes are machine-collected

## 5. Outputs

- Normalized property attributes on Project and Listing packages
- Controlled enums for filters (`property_type`, completion bands)
- Conflict flags when sources disagree

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `property_type` | Controlled enum (`condo`, `house`, `townhouse`, `land`, `commercial`, `other`) |
| Status pattern for asserted categories | `provided` \| `not_provided` \| `conflicted` where used |
| `country_code` | `TH` for current scope |

## 7. Relationships

- **Used by** Project (`02_PROJECT_CONTRACT`)
- **Used by** Listing (`05_LISTING_CONTRACT`)
- **Faceted by** Search (`11_SEARCH_CONTRACT`) and Recommendation (`12_RECOMMENDATION_CONTRACT`)
- **Graph:** attributes inform node properties; not a standalone graph node type in M1

## 8. Business Rules

1. Property does not carry price; Listing does.
2. Marketing adjectives are not completion states.
3. `other` requires original sourced type label.
4. AI may draft normalized values; cannot invent measurements.

## 9. Validation Rules

- `conflicted` blocks approval of parent entity.
- Normalized area requires explicit conversion rule when converted.
- Zero never substitutes for unknown.

## 10. Approval Rules

- Attribute approval is inherited from parent Project/Listing review.
- No separate Property publish object.

## 11. Lifecycle

Follows parent entity lifecycle (`17_REVIEW_WORKFLOW_CONTRACT`, M0 `18_DATA_LIFECYCLE_STANDARD`).

## 12. Future Compatibility

- New property types require Owner approval.
- Unit-level child records may attach later without changing this contract’s ownership.

## 13. Cross References

- M0: `03_PROPERTY_DATA_STANDARD.md`, `01_DATA_MODEL_STANDARD.md`
- M1: `02_PROJECT_CONTRACT.md`, `05_LISTING_CONTRACT.md`, `11_SEARCH_CONTRACT.md`
- Master: `DATA_FACTORY_MASTER_PLAN.md`
