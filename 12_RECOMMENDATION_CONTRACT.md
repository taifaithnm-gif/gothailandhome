# 12 — Recommendation Business Contract

**Document ID:** `12_RECOMMENDATION_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Recommendations**: ranked suggestions of Listings/Projects for a customer context, using hard filters, quality signals, graph relatedness, and feedback — without owning Catalog truth.

## 2. Business Responsibility

- Produce ranked candidate sets under explicit rules.
- Respect consent, hard filters, and publish/freshness constraints.
- Record snapshots and feedback for improvement.

Does **not** own: Listing/Project facts, Search query interpretation (see Search), or publish approval.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Recommendation profiles, snapshots, feedback (logical) | Intelligence plane |
| Candidate eligibility | Catalog publish + DQ/freshness |
| Model choice | Owner-gated later |
| UI placement | Website consumer |

## 4. Inputs

- Customer/session context + consent
- Hard filters (budget, geo, sale/rent, bedrooms)
- Catalog signals (verification, completeness, media, freshness)
- Feedback: click, favorite, enquire, dismiss
- Optional graph edges (`DEVELOPS`, `NEAR`, same district)

## 5. Outputs

- `recommendation_snapshot` (immutable scored set)
- Ranked business keys + scores + rule explanations (logical)
- Feedback records
- Abstain/empty set when no eligible candidates

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `snapshot_id` | |
| `created_at` | |
| `profile_ref` or context hash | |
| `candidates[]` | business keys + scores |
| `ruleset_version` | |
| `corpus_policy` | published/non-stale defaults |

## 7. Relationships

- Reads Listing/Project/Developer/District
- Consumes Favorite/Inquiry feedback
- May use Knowledge Graph relatedness
- Distinct from Search (no mandatory query string)

## 8. Business Rules

1. Never recommend `delisted` or `archived` as available inventory.
2. Do not treat `stale` as fresh pricing.
3. No dark patterns; no silent paid organic injection.
4. AI ranking cannot mark entities published.
5. Empty result preferred over fabricating listings.

## 9. Validation Rules

- Hard filters applied before soft ranking.
- Snapshot must pin `ruleset_version` and corpus policy.
- Candidate keys must exist in eligible corpus at snapshot time.

## 10. Approval Rules

- No human approval per snapshot in normal ops.
- Ruleset changes that alter eligibility semantics require Owner/Data Ops acceptance.
- Upstream Catalog publish remains authoritative.

## 11. Lifecycle

Profile: evolving.  
Snapshot: immutable.  
Feedback: append-only.

## 12. Future Compatibility

- Interface tables from Platform Architecture V2 remain additive.
- Multi-armed bandit/models swap behind `ruleset_version`.

## 13. Cross References

- M0: master plan §11.4; `02_ENTITY_RELATIONSHIP_STANDARD.md`
- M1: `05_LISTING_CONTRACT.md`, `08_CUSTOMER_CONTRACT.md`, `10_FAVORITE_CONTRACT.md`, `09_INQUIRY_CONTRACT.md`, `11_SEARCH_CONTRACT.md`
- Platform: `PLATFORM_ARCHITECTURE_V2.md` § recommendations (design input)
