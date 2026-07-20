# 08 — Customer Business Contract

**Document ID:** `08_CUSTOMER_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Customer**: the demand-side person or account that searches, favorites, inquires, and receives recommendations — without owning Catalog entities.

## 2. Business Responsibility

- Represent the customer identity used for personalization, favorites, and inquiry attribution.
- Hold consent/preference signals relevant to recommendations and communications.
- Remain PII-minimized in Data Factory packages (customer data is not factory package-of-record).

Does **not** own: Listings, Projects, Knowledge content, or publish workflows.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Customer profile / auth user | Platform / Website serving plane |
| Favorites & inquiry linkage | Platform objects referencing Catalog keys |
| Recommendation profiles | Intelligence plane (logical), fed by consented signals |
| Catalog facts | Data Factory |

**Business key:** `customer_id` / auth user id (logical)

## 4. Inputs

- Account or anonymous session identifiers (product-defined)
- Consent flags for analytics/recommendations
- Behavioral signals (favorite, enquire, dismiss) as feedback events

## 5. Outputs

- Customer profile (logical)
- Inputs to Favorite, Inquiry, Search context, Recommendation feedback
- Privacy-safe aggregates for ranking (not raw PII in factory packages)

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `customer_id` | Stable within serving auth model |
| `status` | `active` \| `deleted` \| `anonymized` |
| Consent markers | As required by analytics/privacy policy |

## 7. Relationships

- Customer 1 → * Favorite
- Customer 1 → * Inquiry
- Customer 1 → * Recommendation feedback events
- Customer → Search sessions (contextual)
- No ownership edge to Listing/Project masters

## 8. Business Rules

1. Customer deletion/anonymization must not delete Catalog entities.
2. Factory harvest packages must not embed customer PII.
3. Recommendations respect consent and hard filters.
4. AI cannot create publishable catalog facts from customer chat alone.

## 9. Validation Rules

- Unique customer_id within serving identity system.
- Consent required flags enforced before personalized recommend (policy).
- Soft-deleted customers cannot create new inquiries.

## 10. Approval Rules

- No Catalog publish approval role.
- Privacy policy / Owner govern retention — not Data Factory reviewers.

## 11. Lifecycle

`anonymous|registered → active → anonymized|deleted`

## 12. Future Compatibility

- CRM export is a future interface; not factory ownership.
- Multi-site customers may scope by `site_id` later.

## 13. Cross References

- M1: `09_INQUIRY_CONTRACT.md`, `10_FAVORITE_CONTRACT.md`, `11_SEARCH_CONTRACT.md`, `12_RECOMMENDATION_CONTRACT.md`
- Governance: `G_ANALYTICS_*` privacy/consent inputs
- Master: Intelligence plane consumer of Catalog
