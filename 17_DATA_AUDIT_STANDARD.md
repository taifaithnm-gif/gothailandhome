# 17 — Data Audit Standard

**Document ID:** `17_DATA_AUDIT_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define immutable audit records for review decisions, imports, publishes, rollbacks, source access, and AI-assist events.

## 2. Scope

Audit log shape and retention principles. Compatible with `REVIEW_AUDIT_LOG_STANDARD_V1.md` concepts; expanded for Data Factory planes.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Audit event** | Append-only record of an action. |
| **Actor** | Human user ref or system component name. |
| **Decision** | Review outcome with rationale codes. |
| **Tamper evidence** | Hash chaining or sealed batch hashes. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Event types | `review.decision`, `import.apply`, `publish.apply`, `publish.rollback`, `source.capture`, `ai.assist`, `quality.assess`, `identity.merge` |
| Event id | `aud_<utc>_<rand>` |
| Actor types | `human` \| `system` \| `ai` (ai never final approver) |

## 5. Required Fields

| Field | Notes |
| --- | --- |
| `event_id` | |
| `event_type` | Controlled |
| `occurred_at` | UTC |
| `actor_type` | |
| `actor_id` | |
| `entity_type` / `business_key` | When entity-scoped |
| `package_version` / `content_hash` | When applicable |
| `summary` | Short machine-readable + human text |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `decision` | `approve` \| `reject` \| `request_changes` |
| `reason_codes[]` | |
| `before_hash` / `after_hash` | |
| `batch_id` / `publish_event_id` | |
| `model_assist` | For AI events |
| `ip` / `session` | Ops only; minimize |
| `prev_event_hash` | Chain |

## 7. Validation Rules

1. Audit events are append-only; corrections are new events.  
2. `actor_type = ai` cannot emit `review.decision` with `approve` for publish.  
3. Publish/rollback events must include batch/publish hashes.  
4. Review approval events require human `actor_id`.  
5. Missing entity ref allowed only for system health events.  
6. Secrets must never appear in `summary` or payloads.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| AUD-Q1 | Every state transition to approved/published leaves an audit event |
| AUD-Q2 | Overnight reconciles emit quality/drift audit summaries |
| AUD-Q3 | Retention supports legal/compliance review windows |
| AUD-Q4 | Exportable for Owner incident postmortems |
| AUD-Q5 | Windows01 and Mac mini use the same event_type vocabulary |

## 9. Lifecycle

Events created at action time. Retention: operational hot storage → cold archive; no hard delete of publish/review history without Owner legal process.

## 10. Examples

```json
{
  "event_id": "aud_20260720T160000Z_01",
  "event_type": "review.decision",
  "occurred_at": "2026-07-20T16:00:00Z",
  "actor_type": "human",
  "actor_id": "reviewer_ref_01",
  "entity_type": "project",
  "business_key": "ashton-asoke",
  "package_version": 4,
  "content_hash": "sha256:…",
  "decision": "approve",
  "reason_codes": ["facts_verified", "seo_ok"],
  "summary": "Approved project package v4 for publish_ready"
}
```

## 11. Future Compatibility

- Hash chaining optional in M0; recommended before multi-operator scale.  
- SIEM export adapters may map event_type without renaming.  
- Knowledge compliance decisions use same envelope with policy reason codes.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Lifecycle | `18_DATA_LIFECYCLE_STANDARD.md` |
| Governance | `19_DATA_GOVERNANCE_STANDARD.md` |
| Import | `16_IMPORT_EXPORT_STANDARD.md` |
| Legacy | `REVIEW_AUDIT_LOG_STANDARD_V1.md` |
| Metadata | `10_METADATA_STANDARD.md` |
