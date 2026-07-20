# 18 — Publish Workflow Business Contract

**Document ID:** `18_PUBLISH_WORKFLOW_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Publish Workflow**: Owner-gated promotion of approved package versions into serving/public eligibility, including batch hashing and rollback.

## 2. Business Responsibility

- Authorize production-impacting publication of Catalog/Knowledge packages.
- Bind publish events to exact versions and batch hashes.
- Enable rollback to prior publish events.

Does **not** own: content authoring, routine validation, or Windows01 collection. Distinct from Review (human quality) though Review is a prerequisite.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Publish batch approval | Owner |
| Publish event records | Data Factory — Ops Domain |
| Apply mechanics | Import Job (Control Plane) |
| Public visibility flags | Serving Catalog / site ingest after apply |

## 4. Inputs

- Packages in `approved` or `publish_ready`
- Batch manifest + `batch_hash`
- Gate status (G-PUBLISH when required)
- Rollback references when reversing

## 5. Outputs

- Publish event (`publish_event_id`)
- Authorization for Import apply / Export site ingest
- Updated entity `published` states
- Rollback events when executed

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `publish_event_id` | |
| `batch_hash` | |
| `approved_by` (Owner) | |
| Entity version pins | business_key + package_version + content_hash |
| `applied_at` or `status` | |

## 7. Relationships

- Requires Review Workflow decisions upstream
- Triggers or authorizes Import Job apply / Export Job delivery
- Emits Audit Log events
- Controls Search/Recommend corpus eligibility indirectly

## 8. Business Rules

1. AI cannot approve publish batches.
2. No publish without version pins.
3. Publication remains NO-GO without G-PUBLISH when policy says so.
4. Rollback does not erase history.
5. Knowledge high-risk still needs compliance already passed in Review.

## 9. Validation Rules

- Batch hash matches item set.
- Every item review_status sufficient.
- Drift stop-the-line blocks new publish.

## 10. Approval Rules

- Owner signoff required for gated environments.
- Data Ops may prepare batches; cannot replace Owner when gate open.
- Exceptions via governance grants only.

## 11. Lifecycle

`draft_batch → hashed → owner_approved → applied → rolled_back?`

## 12. Future Compatibility

- Multi-site publish events add `site_id`.
- Can authorize Windows01 apply only after explicit policy change.

## 13. Cross References

- M0: `15_VERSIONING_STANDARD.md`, `16_IMPORT_EXPORT_STANDARD.md`, `PUBLICATION_APPROVAL_WORKFLOW_V1.md` (legacy input)
- M1: `15_IMPORT_JOB_CONTRACT.md`, `16_EXPORT_JOB_CONTRACT.md`, `17_REVIEW_WORKFLOW_CONTRACT.md`, `19_AUDIT_LOG_CONTRACT.md`
