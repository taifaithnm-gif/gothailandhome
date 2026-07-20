# 17 — Review Workflow Business Contract

**Document ID:** `17_REVIEW_WORKFLOW_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Review Workflow**: human-governed evaluation of Catalog and Knowledge packages before publish readiness.

## 2. Business Responsibility

- Move entities through the shared review spine with checklists and decisions.
- Ensure AI remains assist-only.
- Produce audit-ready decisions bound to exact `package_version` + `content_hash`.

Does **not** own: applying Serving Catalog writes (Import), Owner production publish batch signoff (Publish Workflow), or capturing sources (Windows01).

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Review tasks & decisions | Data Factory — Ops / Reviewers |
| Package content | Entity owners under Catalog/Knowledge |
| Final production publish batch | Owner via Publish Workflow |

## 4. Inputs

- Validated packages
- Quality assessments & linter results
- Evidence references
- Compliance checklist results (knowledge high-risk)
- Soft-match queues

## 5. Outputs

- Decision: approve | reject | request_changes
- Updated `review_status`
- Audit events
- Optional publish_ready recommendation (still needs Publish Workflow for gated batches)

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `review_task_id` | |
| Entity business key + package_version + content_hash | |
| `reviewer_id` (human) | |
| `decision` + timestamp | |
| Checklist id/version | When required |

## 7. Relationships

- Review → any Catalog/Knowledge package
- Review → Audit Log
- Review precedes Publish Workflow
- Distinct from Platform inquiry/agent approval

## 8. Business Rules

1. One lifecycle vocabulary (M0 `18`).
2. AI cannot approve.
3. Decisions bind to exact version hash.
4. Intake throttled by reviewer capacity.
5. Soft-match confirmations are review decisions.

## 9. Validation Rules

- Illegal transitions rejected.
- High-risk knowledge requires compliance checklist completion.
- P0 validation failures cannot be approved.

## 10. Approval Rules

- Reviewer may approve package to `approved` / recommend `publish_ready` per policy.
- Owner exceptions documented via governance grants.
- Marketplace lead review is out of this contract.

## 11. Lifecycle

Task: `open → in_progress → decided → closed`.  
Entity states per shared spine.

## 12. Future Compatibility

- CMS Review Console implements this contract later (M3) without changing ownership.
- Multi-reviewer four-eyes optional later.

## 13. Cross References

- M0: `18_DATA_LIFECYCLE_STANDARD.md`, `17_DATA_AUDIT_STANDARD.md`, `19_DATA_GOVERNANCE_STANDARD.md`
- M1: `18_PUBLISH_WORKFLOW_CONTRACT.md`, `19_AUDIT_LOG_CONTRACT.md`, entity contracts `02`–`05`, `13`
- Legacy: `REVIEW_WORKFLOW_V1.md`
