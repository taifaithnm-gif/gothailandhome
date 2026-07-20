# 05 — CMS Architecture

**Document ID:** `05_CMS_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the **Data Ops CMS** architecture: human control surfaces over packages, review, import, quality, and publish — not a marketing page builder and not public UI redesign.

## 2. Components

| Surface | Function |
| --- | --- |
| Package Browser | Inspect manifests, diffs, hashes |
| Review Console | Tasks, checklists, decisions |
| Import Console | Dry-run/apply/resume/rollback |
| Export Console | Artifact build & delivery |
| Quality Console | Completeness, freshness, drift |
| Source Registry UI | Approved sources & gates |
| Publish Console | Batch hash + Owner signoff |
| Knowledge Editor (governed) | Draft/flag AI assist; not freeform bypass |

## 3. Responsibilities

- Implement M1 Review/Publish/Import/Export contracts as UX flows.
- Pipeline-over-CMS for bulk inventory; CMS for governance.
- Show provenance/evidence; never hide soft-match uncertainty.

## 4. Data Flow

```text
Reviewer → CMS → Review API → packages + audit
Data Ops → CMS → Job API → import/export engines
Owner → Publish Console → publish event → authorize apply
```

## 5. Dependencies

- Admin Architecture (authz roles)
- API Architecture
- Metadata Engine (envelope display)
- M0 validation/quality; M1 workflows

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Stale package view | Re-fetch by content_hash; block decision on mismatch |
| Concurrent review | Lock task or optimistic version check |
| Apply failure mid-batch | Surface item errors; offer resume |
| Evidence unavailable | Block approve on required evidence |

## 7. Security Considerations

- Role-based access: reviewer ≠ import.apply ≠ owner.publish
- CSRF/session hardening on admin host
- No AI one-click publish control
- Audit every decision

## 8. Scalability

- Queue-oriented UI (capacity meters)
- Server-driven pagination for packages
- Read models for drift dashboards

## 9. Future Expansion

- Four-eyes review
- Multi-site package views
- Inline SEO linter and compliance scanners

## 10. Windows01 Integration

CMS runs on Control Plane; displays Windows01 job status and evidence via private links; does not require Windows01 for reviewing already-fetched packages.

## 11. Cross References

- Master Plan §4; M1 `17`/`18`/`06`
- `06_ADMIN_ARCHITECTURE.md`, `04_API_ARCHITECTURE.md`, `14_METADATA_ENGINE_ARCHITECTURE.md`
