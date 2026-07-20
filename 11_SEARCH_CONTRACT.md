# 11 — Search Business Contract

**Document ID:** `11_SEARCH_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Search**: what queries the platform accepts, what corpus is searchable, and what results are allowed — including future AI Search — without defining engine implementation.

## 2. Business Responsibility

- Expose discovery over **approved/published** Catalog and Knowledge objects.
- Apply hard filters (geo, listing_type, price, property_type, locale).
- Support keyword and (future) vector retrieval with citations and abstain behavior.

Does **not** own: entity truth, publish approval, or unreviewed raw harvest text as searchable truth.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Search product behavior | Platform / Intelligence plane (logical) |
| Searchable corpus membership | Driven by Catalog/Knowledge publish state |
| Index build jobs | Ops / Windows01 (future) under Owner gates |
| Query UX | Website consumer |

## 4. Inputs

- Query string + locale
- Filters: city/district, sale/rent, price band, property_type, bedrooms, verification
- Customer context (optional, consented)
- Corpus version pins (package/content hashes when AI Search)

## 5. Outputs

- Ranked hits with entity type + business keys
- Citations for knowledge answers (when generative/AI layer used)
- Abstain / navigate-to-hubs response when confidence low
- Audit/metric events (privacy-safe)

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `query_id` | Per request (logical) |
| `locale` | en/zh/th |
| `filters` | Structured |
| `corpus_policy` | `published_only` default |

## 7. Relationships

- Search reads Listing, Project, Developer, District, Knowledge
- Search may use Graph edges for expansion (`NEAR`, `DEVELOPS`)
- Search ≠ Recommendation (Recommendation is proactive ranking; Search is query-driven)
- Import/Publish workflows determine corpus eligibility

## 8. Business Rules

1. Default corpus: `published` and not `archived`; listings not `delisted`; prefer non-`stale` for “current” claims.
2. Unreviewed raw Windows01 captures are not searchable truth.
3. AI answers must cite approved versioned nodes or abstain.
4. Forbidden claim policies apply to generated snippets.
5. Paid placement, if ever added, must be explicitly labeled — out of organic rank by default.

## 9. Validation Rules

- Unknown filter enums rejected.
- Price filters must be coherent (min ≤ max).
- Empty query with no filters may return hubs policy (product) — not fabricated listings.

## 10. Approval Rules

- No per-query human approval.
- Index/corpus rebuilds that change AI answers require Owner policy when embeddings enabled.
- Catalog publish remains upstream gate.

## 11. Lifecycle

Query: ephemeral.  
Corpus index: `build → active → superseded` (future).

## 12. Future Compatibility

- Hybrid keyword + vector without changing this contract’s ownership.
- Multi-site corpora keyed by `site_id`.

## 13. Cross References

- M0: master plan §11.3; `08_KNOWLEDGE_DATA_STANDARD.md`, `18_DATA_LIFECYCLE_STANDARD.md`
- M1: `05_LISTING_CONTRACT.md`, `12_RECOMMENDATION_CONTRACT.md`, `13_KNOWLEDGE_CONTRACT.md`, `20_WINDOWS01_RUNTIME_CONTRACT.md`
