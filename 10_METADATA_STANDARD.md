# 10 — Metadata Standard

**Document ID:** `10_METADATA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the common **metadata envelope** carried by every Data Factory package and projection for traceability, AI assist logging, and cross-plane joins.

## 2. Scope

Cross-cutting metadata for all `entity_type` values. Does not redefine entity business fields (those live in `03`–`08`).

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Metadata envelope** | `meta` object or top-level standard fields listed here. |
| **Content hash** | Hash of canonical payload excluding volatile ops-only notes when specified. |
| **Model assist** | Record that AI touched the package. |
| **Quality flag** | Machine or human marker affecting readiness. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Envelope | Prefer top-level fields for compatibility with existing manifests; `meta.*` allowed as alias namespace |
| Flags | `snake_case` tokens (`orphan_listing`, `thin_seo`) |
| Hashes | `sha256:<hex>` |

## 5. Required Fields

| Field | Type | Notes |
| --- | --- | --- |
| `schema_version` | string | Semver of package schema |
| `entity_type` | enum | From `01` |
| `business_key` | string | Or composable fields that form it |
| `package_version` | integer ≥ 1 | |
| `content_hash` | string | Per `15` |
| `locale_status` | enum | `complete` \| `partial` \| `blocked` |
| `review_status` | enum | Per `18` |
| `updated_at` | datetime UTC | |
| `sources[]` | array | Except pure system objects |

## 6. Optional Fields

| Field | Type | Notes |
| --- | --- | --- |
| `evidence_ids[]` | array | |
| `verification_status` | enum | Catalog |
| `quality_flags[]` | array | |
| `created_at` | datetime | |
| `created_by` / `reviewed_by` | string refs | Human ids; never AI as approver |
| `model_assist` | object | `{ model, prompt_id, ts, actions[] }` |
| `graph_refs[]` | array | Node ids |
| `import_batch_id` | string | After apply |
| `publish_event_id` | string | After publish |
| `adapter_version` | string | Harvester/adapter |
| `normalization_rule_version` | string | |
| `site_id` | string | Future multi-site; default implied GTH |
| `raw_item_ids[]` | array | Windows01 captures |

## 7. Validation Rules

1. `package_version` increments on material change.  
2. `content_hash` must recompute on material change.  
3. `reviewed_by` must not be an AI agent id.  
4. If `model_assist` present, review still required for approval states.  
5. `locale_status = blocked` cannot be `publish_ready`.  
6. Unknown quality flags allowed as strings but should be registered over time.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| META-Q1 | Envelope present on every exchanged package |
| META-Q2 | Provenance fields survive import into serving projections where columns exist |
| META-Q3 | Do not strip `sources` on export |
| META-Q4 | AI metadata is additive; never replaces `sources` |

## 9. Lifecycle

Metadata fields update as the entity moves through lifecycle. Approval stamps (`reviewed_by`, decision ids) are append-only in audit (`17`); packages may store latest pointers.

## 10. Examples

```json
{
  "entity_type": "project",
  "business_key": "ashton-asoke",
  "schema_version": "1.0.0",
  "package_version": 3,
  "content_hash": "sha256:abc…",
  "locale_status": "complete",
  "review_status": "in_review",
  "quality_flags": ["media_incomplete"],
  "model_assist": {
    "model": "translate-draft-v1",
    "prompt_id": "zh-th-glossary-01",
    "ts": "2026-07-20T00:00:00Z",
    "actions": ["draft_zh_description"]
  },
  "updated_at": "2026-07-20T00:00:00Z",
  "sources": [{ "type": "official_developer", "url": "https://example.invalid/p" }]
}
```

## 11. Future Compatibility

- New optional envelope fields are minor-version additive.  
- Windows01 may require `raw_item_ids[]` without breaking Mac mini packages.  
- Intelligence plane joins on `business_key` + `package_version` + `content_hash`.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Model | `01_DATA_MODEL_STANDARD.md` |
| Versioning | `15_VERSIONING_STANDARD.md` |
| Audit | `17_DATA_AUDIT_STANDARD.md` |
| Governance | `19_DATA_GOVERNANCE_STANDARD.md` |
| Master plan §17 | `DATA_FACTORY_MASTER_PLAN.md` |
