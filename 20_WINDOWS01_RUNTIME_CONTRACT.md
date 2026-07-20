# 20 — Windows01 Runtime Business Contract

**Document ID:** `20_WINDOWS01_RUNTIME_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for the **Windows01 Execution Plane**: what work it may perform for the Data Factory, what it must not own, and how it hands off to the Control Plane.

## 2. Business Responsibility

- Execute heavy collection, parsing, validation staging, evidence storage, queues, and (when Owner-approved) embeddings.
- Produce candidate packages and evidence references for Mac mini review.
- Remain a removable pilot node that can be wiped without destroying Control Plane or Serving Catalog authority.

Does **not** own: website hosting, production Serving Catalog authority (pilot), Owner publish approval, or Core Development UI work.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Runtime jobs, raw items, evidence blobs, work DB | Windows01 Execution Plane (when deployed) |
| Standards, review, authorized apply | Control Plane (Mac mini) |
| Public catalog truth | Serving Catalog via Control Plane import |
| Intelligence indexes (pilot) | Windows01 first; promote only when approved |

## 4. Inputs

- Approved source registrations & job manifests from Control Plane
- Rate limits / backpressure settings
- Rule pack versions (validator/quality)
- Owner gates (especially G-WIN01)

## 5. Outputs

- Raw captures + hashes
- Candidate packages / soft-match suggestions
- Evidence object references
- Job status + audit events
- Optional embedding artifacts on approved corpus only (future)

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `job_id`, `wave_id` / purpose | |
| `source_id` (approved) | |
| `started_at` / `status` | |
| Artifact pointers + hashes | |
| Plane tag | `execution` |

## 7. Relationships

- Feeds Review Workflow via packages
- Emits Audit Log events
- Does not bypass Import/Publish contracts
- Supports Search/Recommend only after approved corpus promotion rules
- Uses Media vs Evidence distinction (`06_MEDIA_CONTRACT`)

## 8. Business Rules

1. No deploy before G-WIN01 + V2 P0 closure.
2. Pilot: no direct production Supabase writes.
3. No unregistered sources.
4. Secrets never in git/packages.
5. Tailscale-only admin ingress (architecture policy).
6. Intake throttled by review capacity.
7. Wipe procedure must preserve Control Plane authority.

## 9. Validation Rules

- Jobs reference approved `source_id`.
- Outputs must include content hashes for captured bytes.
- Failed/poison jobs go to DLQ visibility (logical requirement).
- Embedding jobs refuse unapproved package versions.

## 10. Approval Rules

- Owner opens G-WIN01 before runtime use.
- Embedding enablement is a separate Owner decision.
- Package approval remains human on Control Plane.
- AI workers cannot self-approve publish.

## 11. Lifecycle

Node: `planned → validated → pilot_active → suspended → wiped`.  
Job: `queued → running → succeeded|failed|poison → archived`.

## 12. Future Compatibility

- Authorized apply from Windows01 only via explicit governance change to POL-06.
- Second site collection reuses same runtime contract with `site_id` on jobs.
- OCR remains conditional/default-off until Owner enables.

## 13. Cross References

- M0: `20_DATA_FACTORY_EXECUTION_STANDARD.md`, `19_DATA_GOVERNANCE_STANDARD.md`
- M1: `15_IMPORT_JOB_CONTRACT.md`, `16_EXPORT_JOB_CONTRACT.md`, `17_REVIEW_WORKFLOW_CONTRACT.md`, `19_AUDIT_LOG_CONTRACT.md`, `11_SEARCH_CONTRACT.md`
- Runtime docs: `WINDOWS01_*`, `RUNTIME_*`, `V2_DECISION_REGISTER.md`
- Master: `DATA_FACTORY_MASTER_PLAN.md` §12
