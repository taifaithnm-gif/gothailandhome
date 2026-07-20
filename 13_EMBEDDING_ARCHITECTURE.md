# 13 — Embedding Architecture

**Document ID:** `13_EMBEDDING_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define how **embeddings** are produced, stored, versioned, and consumed for AI Search — Owner-gated; deferred until explicit decision resolves pilot defer vs CF V2 retain.

## 2. Components

| Component | Role |
| --- | --- |
| Chunker | Split approved package text into `cf_chunks` logical units |
| Embed worker | Model (e.g., bge-m3 class) on Windows01 |
| Vector store | pgvector on Work DB initially |
| Corpus registry | Pins model + package_version + content_hash |
| Reindex job | On publish/supersede |
| Retriever | Used by Search Architecture |

## 3. Responsibilities

- Embed **approved/published** text only.
- Pin embedding model/version on corpus builds.
- Invalidate vectors on supersession.
- Support abstain when corpus stale.

## 4. Data Flow

```text
Publish event → select approved texts → chunk → embed → upsert vectors
  → Search hybrid retrieve → citations back to chunk→entity version
```

## 5. Dependencies

- Owner embedding decision; G-WIN01 for runtime
- Knowledge/Catalog publish events
- Search Architecture; Metadata version pins
- Windows01 compute

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Embed worker down | Keyword-only search |
| Partial reindex | Mark corpus `degraded`; optional fail-closed for AI answers |
| Model change | Full rebuild; new corpus id |

## 7. Security Considerations

- No draft/PII chunks
- Local model preferred for data control
- Cloud embed only with redaction policy

## 8. Scalability

- Batch embed by publish wave
- Approximate nearest neighbor indexes
- Separate queues per entity_type

## 9. Future Expansion

- Multimodal embeddings later
- Promote vector store to managed serving if latency requires
- Cross-site shared concept embeddings with site filters

## 10. Windows01 Integration

Default execution home for chunk/embed workers and pgvector. Control Plane triggers rebuild jobs; does not store unapproved vectors as serving truth.

## 11. Cross References

- Master Plan §11; CF V2 CFD-08; M0 knowledge/versioning
- M1 `11_SEARCH_CONTRACT.md`, `20_WINDOWS01_RUNTIME_CONTRACT.md`
- `07_SEARCH_ARCHITECTURE.md`, `15_WINDOWS01_RUNTIME_ARCHITECTURE.md`
