# 07 — Search Architecture

**Document ID:** `07_SEARCH_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define how **Search** (keyword + future AI/vector) retrieves approved Catalog and Knowledge entities with filters, ranking, citations, and abstain behavior.

## 2. Components

| Component | Role |
| --- | --- |
| Query service | Parse locale, filters, intent |
| Keyword index | Slugs/titles/facets from Serving Catalog |
| Vector index | Chunks of approved packages (Owner-gated) |
| Hybrid ranker | Merge + business re-rank |
| Citation layer | Map hits to versioned nodes |
| Abstain policy | Low confidence → hub navigation |

## 3. Responsibilities

- Enforce M1 Search Contract corpus policy (`published_only`, non-delisted, freshness preferences).
- Never index unreviewed Windows01 raw text as truth.
- Provide explainable filters for sale/rent, geo, price, property_type.

## 4. Data Flow

```text
Query → filter eligible IDs (Serving)
  → keyword retrieve
  → (optional) vector retrieve on approved chunks
  → re-rank (verification, completeness, freshness)
  → response {hits, citations?, abstain?}
```

## 5. Dependencies

- Embedding Architecture (`13`); Knowledge Graph optional expansion (`09`)
- Supabase catalog; Metadata Engine version pins
- M1 `11_SEARCH_CONTRACT.md`

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Vector store down | Keyword-only degrade |
| Empty eligible set | Empty/abstain — no fabrication |
| Embedding stale vs publish | Block vector path until rebuild |
| Latency spike | Timeout vector; return keyword |

## 7. Security Considerations

- No draft/PII in indexes
- Rate limit; abuse detection
- Generated snippets pass forbidden-claim filters

## 8. Scalability

- Async index updates on publish events
- Shard by entity_type
- Cache popular filter combinations

## 9. Future Expansion

- Multi-lingual query expansion via glossary (not free invent)
- Personalized re-rank with consent (Recommend crossover careful)

## 10. Windows01 Integration

Embedding workers and vector DB preferred on Windows01 initially; Search API may proxy private retrieve or sync approved vectors later.

## 11. Cross References

- M1 `11_SEARCH_CONTRACT.md`; Master Plan §11.3
- `08_RECOMMENDATION_ARCHITECTURE.md`, `13_EMBEDDING_ARCHITECTURE.md`, `09_KNOWLEDGE_GRAPH_ARCHITECTURE.md`
