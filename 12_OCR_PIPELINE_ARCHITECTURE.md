# 12 — OCR Pipeline Architecture

**Document ID:** `12_OCR_PIPELINE_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define a **conditional OCR pipeline** for extracting text from PDFs/images in evidence — default-off until Owner enables — feeding candidate facts without auto-publish.

## 2. Components

| Component | Role |
| --- | --- |
| Document intake | Evidence blob refs from MinIO |
| OCR worker | Local/offline-capable engine preference |
| Text normalizer | Page/span anchors for citations |
| Confidence scorer | Per-span quality |
| Fact candidate emitter | Support_level ≤ paraphrase/draft |
| Human verify gate | Required before knowledge approval |

## 3. Responsibilities

- Improve evidence usability for brochures/floor plans when enabled.
- Preserve page coordinates / bounding metadata for audit.
- Never treat OCR output as approved fact.

## 4. Data Flow

```text
Evidence blob → OCR job → span text + confidence
  → attach to evidence object → optional fact candidates
  → Review Console → human accept/reject
```

## 5. Dependencies

- Storage (evidence); Windows01 workers
- Knowledge + Review contracts
- Embedding optional downstream on approved text only

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Low confidence | Mark `ocr_unreliable`; no auto-fact |
| Engine crash | DLQ; retain original blob |
| Language misdetect | Route to human; keep raw |

## 7. Security Considerations

- Process on Windows01; avoid sending sensitive docs to unapproved cloud OCR without redaction policy
- Access evidence via private network only
- Retention aligned to evidence policy

## 8. Scalability

- Queue-based; concurrency capped by CPU/GPU
- Prioritize Owner-selected document classes
- Skip OCR when HTML text layer exists

## 9. Future Expansion

- Layout-aware extraction; table structure
- Multilingual OCR tuned for TH/ZH/EN

## 10. Windows01 Integration

Primary home for OCR workers (conditional). Control Plane only receives spans/candidates via packages/evidence refs.

## 11. Cross References

- Master Plan / CF V1 boundary (OCR conditional)
- `15_WINDOWS01_RUNTIME_ARCHITECTURE.md`, `03_STORAGE_ARCHITECTURE.md`, `13_EMBEDDING_ARCHITECTURE.md`
- M1 `13_KNOWLEDGE_CONTRACT.md`, `17_REVIEW_WORKFLOW_CONTRACT.md`
