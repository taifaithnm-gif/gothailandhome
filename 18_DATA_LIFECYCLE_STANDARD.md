# 18 — Data Lifecycle Standard

**Document ID:** `18_DATA_LIFECYCLE_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define canonical entity and publication lifecycle states, legal transitions, and side effects for Catalog and Knowledge entities.

## 2. Scope

State machines only. Unifies prior review vocabularies into one spine per master plan.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Review status** | Workflow state on an entity package. |
| **Serving status** | Public visibility (`draft`/`published` etc.). |
| **Terminal state** | Requires explicit reopen to edit toward publish. |
| **Stale** | Time-expired trust for current claims. |

## 4. Naming Convention

Shared `review_status` enum (all entities):

| State | Meaning |
| --- | --- |
| `candidate` | Newly created / harvested |
| `validated` | Passed schema+business validation |
| `in_review` | Human review active |
| `approved` | Human approved exact version |
| `publish_ready` | Approved + publish gates cleared |
| `published` | Applied to serving / site ingest done |
| `stale` | Published but freshness expired |
| `archived` | Intentionally retired |
| `rejected` | Not accepted |

Publication batch states: `draft_batch` → `hashed` → `owner_approved` → `applied` → `rolled_back`.

## 5. Required Fields

| Field | Notes |
| --- | --- |
| `review_status` | Current |
| `status_updated_at` | UTC |
| `package_version` | State applies to this version |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `serving_status` | When distinct from review_status |
| `verification_status` | Listings/projects |
| `status_reason` | |
| `reopen_of` | Prior rejected/archived ref |

## 7. Validation Rules

### Allowed transitions

```text
candidate → validated | rejected
validated → in_review | rejected | candidate
in_review → approved | rejected | validated
approved → publish_ready | in_review
publish_ready → published | in_review
published → stale | archived | published (re-verify)
stale → published | archived | in_review
rejected → candidate (reopen)
archived → candidate (reopen; Owner)
```

Illegal transitions are P0 (`VAL-LIFE-001`).

### Side effects

| Transition | Side effect |
| --- | --- |
| → `validated` | Validation artifact required |
| → `approved` | Human audit event; AI cannot |
| → `publish_ready` | SEO/media/DQ gates |
| → `published` | Import/export apply + publish event |
| → `stale` | Public “current price” claims suppressed |
| → `archived` | Non-indexable; FKs retained |
| batch `rolled_back` | Serving restored per event |

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| LIFE-Q1 | One vocabulary across Catalog and Knowledge |
| LIFE-Q2 | `publish_ready` ≠ marketing checkbox alone |
| LIFE-Q3 | Stale listings cannot be recommended as fresh |
| LIFE-Q4 | Knowledge high-risk types need compliance flags cleared before `approved` |
| LIFE-Q5 | Serving `published` requires factory `published` or explicit admin exception logged |

## 9. Lifecycle

This document **is** the lifecycle. Automation may propose `stale` but humans/ops confirm archival policies for hubs.

## 10. Examples

```json
{
  "business_key": "propertyhub:ph-12345",
  "package_version": 2,
  "review_status": "published",
  "verification_status": "verified",
  "status_updated_at": "2026-07-20T12:00:00Z"
}
```

Stale transition proposal:

```json
{
  "business_key": "propertyhub:ph-12345",
  "from": "published",
  "to": "stale",
  "status_reason": "freshness_band_expired",
  "assessed_at": "2026-10-20T00:00:00Z"
}
```

## 11. Future Compatibility

- Sub-checklists (fact/language/compliance) are flags on `in_review`, not separate top-level enums.  
- Marketplace approval can map into the same spine via adapters.  
- AI search filters: default `published` and not `stale`/`archived`.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Audit | `17_DATA_AUDIT_STANDARD.md` |
| Quality freshness | `13_DATA_QUALITY_STANDARD.md` |
| Import | `16_IMPORT_EXPORT_STANDARD.md` |
| Governance | `19_DATA_GOVERNANCE_STANDARD.md` |
| Legacy review | `REVIEW_WORKFLOW_V1.md` |
| Master plan | `DATA_FACTORY_MASTER_PLAN.md` §10.3 |
