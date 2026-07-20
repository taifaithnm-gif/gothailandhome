# 09 — Knowledge Graph Architecture

**Document ID:** `09_KNOWLEDGE_GRAPH_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the **Knowledge Graph** as a relational edge layer over Catalog and Knowledge business keys — for relatedness, explanations, and retrieval expansion — not a replacement SQL catalog.

## 2. Components

| Component | Role |
| --- | --- |
| Node projection | Business keys → graph nodes |
| Edge store | Typed directed edges + evidence + link_status |
| Materializer | Derive edges from packages/FKs |
| Query helpers | Neighbors, paths (bounded) |
| Sync job | On publish/confirm-match |

## 3. Responsibilities

- Support M0 edge types: `DEVELOPS`, `LOCATED_IN`, `HAS_LISTING`, `NEAR`, `CITES`, `ABOUT`, `SAME_AS`, `SUPERSEDES`, `SERVES_TRANSIT`.
- Soft edges never equal confirmed for publish-grade merges.
- AI Search may expand via confirmed edges only by default.

## 4. Data Flow

```text
Publish/confirm → materialize edges from packages & FKs
  → edge store
  → Search/Recommend/CMS relatedness views
```

## 5. Dependencies

- M0 ER standard; M1 entity contracts
- Database Architecture (edge tables logical)
- Review Workflow for soft→confirmed

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Orphan edge | Quarantine; quality flag |
| Cycle on forbidden types | Reject materialize |
| Partial sync | Rebuild from publish_event pin |

## 7. Security Considerations

- No edges from unapproved knowledge as public graph
- SAME_AS merges audited
- Limit path-query depth to prevent abuse

## 8. Scalability

- Start with Postgres edge table; specialize DB only if measured need
- Partition by edge_type
- Incremental materialize per publish batch

## 9. Future Expansion

- Transit/amenity node enrichment waves
- Reasoning overlays still cite evidence
- Multi-site concept nodes shared; site binding on content edges

## 10. Windows01 Integration

May compute candidate soft edges during match; confirmation and serving materialize on Control/Serving after review.

## 11. Cross References

- M0 `02_ENTITY_RELATIONSHIP_STANDARD.md`; Master Plan §11.5
- `07_SEARCH_ARCHITECTURE.md`, `08_RECOMMENDATION_ARCHITECTURE.md`
