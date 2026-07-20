# 15 — Versioning Standard

**Document ID:** `15_VERSIONING_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define how packages, schemas, rule packs, publish events, and embeddings reference immutable versions for audit, rollback, and AI citation safety.

## 2. Scope

Versioning semantics across Control Plane packages, Serving Catalog projections, and future Windows01 work objects.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Package version** | Monotonic integer on an entity package. |
| **Schema version** | Semver of field contract. |
| **Content hash** | Hash of canonical payload. |
| **Publish event** | Immutable record of an applied approved set. |
| **Supersession** | New knowledge version retires prior without delete. |
| **Rule pack version** | Validator/quality/normalization rule set id. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| `schema_version` | Semver `MAJOR.MINOR.PATCH` |
| `package_version` | Integer starting at 1 |
| `content_hash` | `sha256:<hex>` |
| Publish ids | `pub_<utc>_<shorthash>` |
| Embedding corpus tag | `corpus:<entity>:<package_version>:<content_hash>` |

## 5. Required Fields

| Field | On |
| --- | --- |
| `schema_version` | Every package |
| `package_version` | Every package |
| `content_hash` | Every package at review boundary |
| `prior_package_version` | When version > 1 (recommended) |
| Publish event: `batch_hash`, `approved_by`, `applied_at` | Publish batches |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `adapter_version` | Harvester |
| `normalization_rule_version` | |
| `validator_version` | |
| `model_assist.prompt_id` | AI reproducibility |
| `embedding_model` / `embedding_version` | Future |
| `rollback_of` | Publish event pointer |

## 7. Validation Rules

1. Material field change → increment `package_version` and recompute `content_hash`.  
2. Hash mismatch vs declared → P0.  
3. Publish must reference exact `package_version` + `content_hash`.  
4. Rollback restores prior publish event; does not rewrite history.  
5. Schema MAJOR bump requires migration notes; MINOR additive only.  
6. Embeddings must cite `package_version`; rebuild on supersession.  
7. Serving row updates store last applied package hash when columns exist.

### Canonical hash input (logical)

- Include entity business fields + seo + media refs + sources.  
- Exclude volatile ops notes if marked `volatile: true`.  
- UTF-8 JSON with stable key ordering (implementation later).

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| VER-Q1 | No silent overwrite of approved versions |
| VER-Q2 | AI citations use versioned nodes only |
| VER-Q3 | Drift compares hashes, not only counts |
| VER-Q4 | Rule pack upgrades re-validate before publish |

## 9. Lifecycle

```text
edit → version++ → validate → review → approve(version=N)
  → publish_event(N) → apply
  → (optional) rollback → publish_event(N-1) marked active
```

Knowledge `SUPERSEDES` edge points prior version.

## 10. Examples

```json
{
  "slug": "ashton-asoke",
  "schema_version": "1.0.0",
  "package_version": 4,
  "prior_package_version": 3,
  "content_hash": "sha256:deadbeef…",
  "adapter_version": "propertyhub-harvest-wave1",
  "normalization_rule_version": "listing-norm-1.0.0"
}
```

Publish event:

```json
{
  "publish_event_id": "pub_20260720T120000Z_ab12",
  "entity_refs": [{ "entity_type": "project", "business_key": "ashton-asoke", "package_version": 4, "content_hash": "sha256:deadbeef…" }],
  "batch_hash": "sha256:…",
  "approved_by": "owner_ref_01",
  "applied_at": "2026-07-20T12:05:00Z"
}
```

## 11. Future Compatibility

- Git remains package history backup; publish events are operational history.  
- Windows01 may store versioned raw items independently.  
- Recommendation snapshots pin catalog versions used for scores.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Metadata envelope | `10_METADATA_STANDARD.md` |
| Audit | `17_DATA_AUDIT_STANDARD.md` |
| Import / rollback | `16_IMPORT_EXPORT_STANDARD.md` |
| Lifecycle | `18_DATA_LIFECYCLE_STANDARD.md` |
| Knowledge supersession | `08_KNOWLEDGE_DATA_STANDARD.md` |
