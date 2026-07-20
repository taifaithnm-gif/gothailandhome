# 14 — Metadata Engine Architecture

**Document ID:** `14_METADATA_ENGINE_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the **Metadata Engine**: computation and enforcement of envelopes — schema_version, package_version, content_hash, locale_status, quality flags, model_assist — across packages and jobs.

## 2. Components

| Component | Role |
| --- | --- |
| Canonical serializer | Stable key order hashing input |
| Hash service | sha256 content_hash |
| Version bumper | Material change detection |
| Locale status calculator | Trinity completeness |
| Flag aggregator | DQ/validation flags |
| Envelope lint | Required meta presence |

## 3. Responsibilities

- Realize M0 Metadata + Versioning standards operationally (design).
- Ensure Review/Publish/Import pin the same hashes.
- Record model_assist without granting approval power.

## 4. Data Flow

```text
Package edit → serialize → hash → version++ if material
  → validate envelope → attach to review/import items
  → publish event stores pins → search corpus uses pins
```

## 5. Dependencies

- M0 `10`/`15`; all pipelines and CMS
- Audit logging of version transitions

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Hash mismatch | P0 reject |
| Missing schema_version | Reject exchange |
| Clock skew on timestamps | Prefer content_hash over clock for identity |

## 7. Security Considerations

- Exclude secrets from hash canonical form
- Volatile ops notes marked excluded
- Tamper-evident publish pins

## 8. Scalability

- Incremental hashing per entity
- Cache last hash on FS sidecar if needed
- Parallel lint in CI later (implementation phase)

## 9. Future Expansion

- Envelope `site_id`, `raw_item_ids[]` for Windows01
- Hash chaining with audit events

## 10. Windows01 Integration

Workers must use the same serializer/rule pack versions as Control Plane; corpus and package hashes interoperable.

## 11. Cross References

- M0 `10_METADATA_STANDARD.md`, `15_VERSIONING_STANDARD.md`
- `10_IMPORT_PIPELINE_ARCHITECTURE.md`, `18_PUBLISH` via M1, `19_AUDIT` via M1
- `05_CMS_ARCHITECTURE.md`
