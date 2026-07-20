# 19 — Audit Log Business Contract

**Document ID:** `19_AUDIT_LOG_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Audit Log**: the append-only record of review, import, publish, identity, quality, source capture, and AI-assist actions across the Data Factory.

## 2. Business Responsibility

- Provide tamper-evident (or append-only) accountability for governed actions.
- Unify event vocabulary across Mac mini and Windows01.
- Support incident postmortems and compliance evidence.

Does **not** own: entity business content, or operational metrics dashboards (may consume events).

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Audit event stream | Data Factory — Ops Domain |
| Event emission duty | Every workflow that changes governed state |
| Retention policy | Owner / governance |

**Business key:** `event_id`

## 4. Inputs

- Actions from Review, Publish, Import, Export, identity merge, quality assess, source capture, AI assist
- Actor identity and timestamps
- Version pins when entity-scoped

## 5. Outputs

- Append-only audit events
- Queryable history by entity/batch/actor (logical)
- Exportable incident bundles

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `event_id`, `event_type`, `occurred_at` | |
| `actor_type`, `actor_id` | |
| Summary | |
| Entity pins when applicable | |

## 7. Relationships

- Cross-cuts all M1 workflows and entity contracts
- AI assist events allowed; AI approve publish events forbidden
- Windows01 capture events use same vocabulary

## 8. Business Rules

1. Append-only; corrections are new events.
2. AI cannot emit approving publish/review decisions.
3. No secrets in payloads.
4. Publish/rollback must include hashes.
5. Shared `event_type` vocabulary across planes.

## 9. Validation Rules

- Controlled event_type enum.
- Human actor required for approval decisions.
- Entity-scoped events need business keys when claiming entity action.

## 10. Approval Rules

- Audit itself is not “approved”; it records approvals.
- Retention/deletion only via Owner legal process.

## 11. Lifecycle

Event: created → retained → cold-archived. No edit. No hard delete without Owner process.

## 12. Future Compatibility

- Optional hash chaining.
- SIEM adapters map event_type without rename.

## 13. Cross References

- M0: `17_DATA_AUDIT_STANDARD.md`
- M1: `15`–`18`, `20_WINDOWS01_RUNTIME_CONTRACT.md`
- Legacy: `REVIEW_AUDIT_LOG_STANDARD_V1.md`
