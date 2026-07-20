# 08 — Recommendation Architecture

**Document ID:** `08_RECOMMENDATION_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define architecture for **Recommendations**: hard-filter eligibility, scoring, immutable snapshots, and feedback loops — interface-first, model-second.

## 2. Components

| Component | Role |
| --- | --- |
| Profile builder | Context features (consented) |
| Eligibility gate | Published/non-delisted/DQ/freshness |
| Scorer | Rules + optional ML |
| Snapshot store | Immutable candidate sets |
| Feedback collector | favorite/enquire/click/dismiss |
| Explainer | Rule reasons for ops/debug |

## 3. Responsibilities

- Implement M1 Recommendation Contract.
- Keep ranking from mutating Catalog truth.
- Pin `ruleset_version` and corpus policy on snapshots.

## 4. Data Flow

```text
Context → hard filters on Serving Catalog
  → score → snapshot
  → UI consume
  → feedback events → future profile/rules tuning
```

## 5. Dependencies

- Search (shared eligibility ideas; different trigger)
- Knowledge Graph relatedness signals
- Customer/Favorite/Inquiry contracts (Platform)
- Future additive tables (profiles/snapshots/feedback)

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| No eligible candidates | Empty snapshot |
| Feedback storm | Cap/dedupe |
| Ruleset bug | Rollback ruleset_version; keep snapshots historical |

## 7. Security Considerations

- Consent for personalization
- No PII in exported snapshots used for training without policy
- Prevent ranking manipulation via fake feedback (basic rate limits)

## 8. Scalability

- Precompute popular segments
- Online re-rank top-N only
- Snapshot retention window

## 9. Future Expansion

- Bandits/LTR models behind same snapshot interface
- Labeled paid inventory channel (explicit, separate)

## 10. Windows01 Integration

Optional offline training/feature jobs on Windows01; online serve from Control/Serving. No Windows01 write to prod catalog.

## 11. Cross References

- M1 `12_RECOMMENDATION_CONTRACT.md`; Platform Architecture V2 (interfaces)
- `07_SEARCH_ARCHITECTURE.md`, `09_KNOWLEDGE_GRAPH_ARCHITECTURE.md`
