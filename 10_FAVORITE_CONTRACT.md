# 10 — Favorite Business Contract

**Document ID:** `10_FAVORITE_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Favorite**: a customer’s saved reference to a Listing (and optionally Project) used for shortlists and recommendation feedback.

## 2. Business Responsibility

- Persist customer shortlist intent.
- Emit privacy-safe feedback signals (`favorite` / `unfavorite`).
- Remain a reference layer over Catalog — never a copy of listing facts.

Does **not** own: listing inventory, pricing, or publish state.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Favorite records | Platform / Website serving |
| Target keys | Catalog business keys / technical ids |
| Recommendation use | Intelligence plane consumes events |

**Business key:** (`customer_id`, `target_entity_type`, `target_business_key`) or surrogate `favorite_id`

## 4. Inputs

- Customer identity/session
- Target listing/project key
- Add/remove actions

## 5. Outputs

- Favorite rows / state
- Feedback events for Recommendations
- Compare/shortlist inputs (product)

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| Customer ref | |
| Target entity type + key | Listing primary; Project optional |
| `created_at` | |
| `status` | `active` \| `removed` |

## 7. Relationships

- Customer 1 → * Favorite
- Favorite → Listing/Project (non-owning)
- Favorite events → Recommendation feedback

## 8. Business Rules

1. Favoriting a stale/delisted listing allowed historically; UI may warn (product).
2. Removing favorite does not delete Catalog entity.
3. No fabrication of favorites by AI for a customer.
4. Factory packages do not store favorite PII graphs.

## 9. Validation Rules

- Target must resolve to a known business key when created (or reject).
- Duplicate active favorites for same target collapsed to one.
- Anonymized customer favorites deleted or detached per privacy policy.

## 10. Approval Rules

- No human Catalog approval for favorites.
- Not part of Publish Workflow.

## 11. Lifecycle

`active ↔ removed` (soft); hard delete per privacy.

## 12. Future Compatibility

- Cross-device sync via auth customer_id.
- Collections/folders additive later.

## 13. Cross References

- M1: `05_LISTING_CONTRACT.md`, `08_CUSTOMER_CONTRACT.md`, `12_RECOMMENDATION_CONTRACT.md`
- Master: Intelligence feedback signals
