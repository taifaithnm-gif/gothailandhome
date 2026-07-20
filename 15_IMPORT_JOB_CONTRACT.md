# 15 — Import Job Business Contract

**Document ID:** `15_IMPORT_JOB_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Import Jobs**: bringing approved packages into the Serving Catalog (and related projections) with validate → dry-run → apply → resume/rollback semantics.

## 2. Business Responsibility

- Move versioned packages into Serving Catalog idempotently.
- Preserve provenance and emit batch audit.
- Enforce dry-run before production apply.

Does **not** own: entity business truth authoring, Windows01 capture, or website rendering.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Import job / batch | Data Factory — Ops Domain |
| Package content | Catalog/Knowledge entity owners |
| Apply authority (pilot) | Control Plane (Mac mini) |
| Serving Catalog writes | Via authorized import only |

**Business key:** `batch_id` / `job_id`

## 4. Inputs

- Validated packages (`package_version`, `content_hash`)
- Wave/source context
- Actor identity
- Mode: validate | dry-run | apply | resume | rollback

## 5. Outputs

- Batch record + item statuses
- Dry-run diff summary
- Applied Serving Catalog upserts / history appends
- Audit events; post-apply drift signals

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `batch_id`, `mode`, `created_at`, `actor` | |
| `items[]` with idempotency keys | |
| `batch_hash` | |

## 7. Relationships

- Import Job * → * Packages (Project, Developer, District, Listing, Media, Knowledge as allowed)
- Import Job → Audit Log
- Import Job precedes/pairs with Publish Workflow when Owner gate requires
- Distinct from Export Job (`16`)

## 8. Business Rules

1. DQ-06: dry-run before production apply.
2. Idempotent upserts; no double inventory.
3. Failed items ≠ silent success.
4. Pilot: Windows01 does not apply to production Supabase.
5. Stop-the-line on critical drift.

## 9. Validation Rules

- Items must pass validator pack before apply.
- Referential integrity within batch or existing catalog.
- Rollback requires prior event refs.

## 10. Approval Rules

- Data Ops may run dry-run freely.
- Apply to production catalog requires authorization; Owner when G-PUBLISH applies.
- AI cannot approve apply.

## 11. Lifecycle

`created → validating → dry_run → awaiting_approval → applying → completed|completed_with_errors|aborted|rolled_back`

## 12. Future Compatibility

- Same contract for future authorized Windows01 apply after Owner policy change.
- Multi-site targets via `site_id`.

## 13. Cross References

- M0: `16_IMPORT_EXPORT_STANDARD.md`, `12_DATA_VALIDATION_STANDARD.md`, `20_DATA_FACTORY_EXECUTION_STANDARD.md`
- M1: `16_EXPORT_JOB_CONTRACT.md`, `18_PUBLISH_WORKFLOW_CONTRACT.md`, `19_AUDIT_LOG_CONTRACT.md`, `20_WINDOWS01_RUNTIME_CONTRACT.md`
