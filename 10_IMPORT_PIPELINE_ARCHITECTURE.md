# 10 — Import Pipeline Architecture

**Document ID:** `10_IMPORT_PIPELINE_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the **Import Pipeline** architecture that realizes M1 Import Job Contract: validate → dry-run → apply → resume/rollback against Serving Catalog.

## 2. Components

| Component | Role |
| --- | --- |
| Package loader | Read FS packages / export artifacts |
| Schema validator | AJV/rule pack |
| Business validator | Referential, DQ, lifecycle |
| Diff engine | Dry-run against Supabase |
| Apply engine | Idempotent upserts + history |
| Batch ledger | `import_batches` / items |
| Rollback planner | Inverse from publish/import events |

## 3. Responsibilities

- Align existing `pipelines/factory` CLI concepts to contracts (future hardening — not coded in M2).
- Enforce DQ-06 dry-run before prod apply.
- Preserve provenance columns and multi-source observations.

## 4. Data Flow

```text
Packages → validate → dry-run diff → (Owner/ops gate) → apply
  → batch ledger → drift reconcile → audit
```

## 5. Dependencies

- Supabase Architecture; Metadata Engine
- Publish Workflow authorization
- Validation/Quality standards (M0)
- Harvest adapters upstream (separate from apply)

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Item P0 | Mark failed; continue or abort per policy |
| Mid-apply crash | Resume skips applied idempotency keys |
| Diff conflict | Require human resolve |
| Critical drift post-apply | Stop-the-line |

## 7. Security Considerations

- Service role only on Control Plane
- Actor identity on every batch
- No apply from Windows01 pilot

## 8. Scalability

- Chunk large waves
- Parallelism capped to DB pool + review capacity
- Per-source import lanes

## 9. Future Expansion

- Streaming CDC-style updates still version-pinned
- Authorized remote apply worker (post policy change)

## 10. Windows01 Integration

Windows01 produces candidate packages only; Import Pipeline executes on Control Plane after review/publish gates.

## 11. Cross References

- M0 `16_IMPORT_EXPORT_STANDARD.md`; M1 `15_IMPORT_JOB_CONTRACT.md`, `18_PUBLISH_WORKFLOW_CONTRACT.md`
- `11_EXPORT_PIPELINE_ARCHITECTURE.md`, `02_SUPABASE_ARCHITECTURE.md`, `16_AUTOMATION_ARCHITECTURE.md`
