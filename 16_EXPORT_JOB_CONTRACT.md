# 16 — Export Job Business Contract

**Document ID:** `16_EXPORT_JOB_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Export Jobs**: producing versioned packages or extracts from approved data for site ingest, partner handoff, backup review, or second-site publish — without silent cross-DB writes.

## 2. Business Responsibility

- Emit immutable export artifacts from approved versions.
- Support Knowledge publish packages and Catalog snapshot exports.
- Omit secrets and unnecessary PII.

Does **not** own: changing Serving Catalog truth (that is Import), or capturing raw sources (Windows01 collect).

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Export job | Data Factory — Ops Domain |
| Exported content authority | Entity owners’ approved versions |
| Destination ingest | Target site/system (e.g., GTH FS loader) |

**Business key:** `export_job_id`

## 4. Inputs

- Selection: entity types, keys, wave, or query
- Version pin (`package_version` / publish_event)
- Destination profile (`gth_fs`, `partner`, `backup`, `site_2`)
- Actor + purpose

## 5. Outputs

- Export package set + manifest hash
- Delivery receipt (logical)
- Audit event
- Optional CRM/lead extracts (Platform-owned fields only)

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `export_job_id`, `created_at`, `actor` | |
| `selection`, `destination` | |
| `artifact_hash` | |
| `status` | |

## 7. Relationships

- Export reads approved Catalog/Knowledge versions
- Export may follow Publish Workflow approval
- Inverse concern of Import Job (out vs in)
- Windows01 may produce candidate packages; Control Plane exports for site ingest

## 8. Business Rules

1. Default: only `approved` / `publish_ready` / `published` versions.
2. No secrets in artifacts.
3. Handoff via packages — no silent prod DB write from Execution Plane in pilot.
4. Knowledge multi-site: bind `site_id` at export, not by forking truth.

## 9. Validation Rules

- Artifact hash must match included versions.
- Destination profile must be registered.
- Partial locale exports only when locale_status allows.

## 10. Approval Rules

- Owner/Data Ops approval when export leaves controlled environment.
- AI cannot authorize external partner export.

## 11. Lifecycle

`created → assembling → hashed → approved → delivered → expired|revoked`

## 12. Future Compatibility

- Second site (e.g., TAI FAITH) reuses export profiles.
- Streaming exports later without changing ownership.

## 13. Cross References

- M0: `16_IMPORT_EXPORT_STANDARD.md`, `15_VERSIONING_STANDARD.md`
- M1: `13_KNOWLEDGE_CONTRACT.md`, `15_IMPORT_JOB_CONTRACT.md`, `18_PUBLISH_WORKFLOW_CONTRACT.md`, `20_WINDOWS01_RUNTIME_CONTRACT.md`
