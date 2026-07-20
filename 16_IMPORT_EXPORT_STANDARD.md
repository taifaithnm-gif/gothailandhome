# 16 — Import / Export Standard

**Document ID:** `16_IMPORT_EXPORT_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the package import/export contract between Control Plane, Windows01, and Serving Catalog: batching, dry-run, apply, resume, rollback, and export shapes.

## 2. Scope

Logical Import Pipeline V2 behavior. No CLI implementation in M0. Compatible with existing `pipelines/factory` concepts (`import_batches`, dry-run/apply).

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Import batch** | Unit of apply with hash and item list. |
| **Dry-run** | Read-only diff vs Serving Catalog. |
| **Apply** | Idempotent upsert into Serving Catalog. |
| **Resume** | Continue incomplete batch without duplicating success items. |
| **Export package** | Serializable snapshot for review/transfer/site ingest. |
| **Handoff** | Windows01 → Mac mini package transfer without direct prod write (pilot). |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Batch id | `batch_<utc>_<source_or_wave>` |
| Modes | `validate` \| `dry-run` \| `apply` \| `resume` \| `rollback` |
| Item status | `pending` \| `applied` \| `skipped` \| `failed` \| `rolled_back` |

## 5. Required Fields

### Import batch

| Field | Notes |
| --- | --- |
| `batch_id` | |
| `mode` | |
| `created_at` | |
| `actor` | Human/ops ref |
| `items[]` | Entity refs + content hashes |
| `batch_hash` | Hash of item set |

### Import item

| Field | Notes |
| --- | --- |
| `entity_type` | |
| `business_key` | |
| `package_version` | |
| `content_hash` | |
| `idempotency_key` | Per `14` |
| `status` | |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `wave_id` | |
| `source` | Portal/wave |
| `dry_run_diff` | Summary counts + samples |
| `error` | Failure detail |
| `rollback_of` | Prior batch |
| `windows01_job_id` | Execution plane ref |

## 7. Validation Rules

1. Order: validate → dry-run → Owner/ops gate → apply.  
2. DQ-06: dry-run required before production catalog apply.  
3. Apply is idempotent on idempotency keys.  
4. Failed items do not mark whole batch success.  
5. Resume skips `applied` items.  
6. Rollback uses publish/import event inverse; requires prior snapshot refs.  
7. Pilot: Windows01 must not apply to production Supabase directly.  
8. Export for knowledge site ingest must be `approved`/`publish_ready` only.  
9. Partial locale exports allowed only when `locale_status` permits.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| IE-Q1 | Never double inventory on re-apply |
| IE-Q2 | Preserve provenance columns on upsert |
| IE-Q3 | Price changes append history where supported |
| IE-Q4 | Drift check after apply (counts + sample hashes) |
| IE-Q5 | Export omits secrets and raw credentials |

## 9. Lifecycle

```text
packages ready → create batch → validate items → dry-run
  → approve → apply → reconcile → (optional) rollback
```

Batch terminal states: `completed`, `completed_with_errors`, `rolled_back`, `aborted`.

## 10. Examples

```json
{
  "batch_id": "batch_20260720T150000Z_wave1",
  "mode": "dry-run",
  "created_at": "2026-07-20T15:00:00Z",
  "actor": "ops_ref_01",
  "batch_hash": "sha256:…",
  "items": [
    {
      "entity_type": "listing",
      "business_key": "propertyhub:ph-12345",
      "package_version": 2,
      "content_hash": "sha256:…",
      "idempotency_key": "propertyhub:ph-12345",
      "status": "pending"
    }
  ],
  "dry_run_diff": { "create": 10, "update": 3, "noop": 50, "conflict": 1 }
}
```

## 11. Future Compatibility

- Same batch contract for Mac mini CLI and Windows01 workers.  
- Future authorized service-role apply from Windows01 requires Owner gate + audit.  
- Multi-site export adds `site_id` without changing item identity.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Versioning / publish events | `15_VERSIONING_STANDARD.md` |
| Validation | `12_DATA_VALIDATION_STANDARD.md` |
| Audit | `17_DATA_AUDIT_STANDARD.md` |
| Execution | `20_DATA_FACTORY_EXECUTION_STANDARD.md` |
| Identifiers | `14_IDENTIFIER_STANDARD.md` |
| Master plan pipelines | `DATA_FACTORY_MASTER_PLAN.md` |
