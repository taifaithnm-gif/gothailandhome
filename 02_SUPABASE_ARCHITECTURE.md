# 02 — Supabase Architecture

**Document ID:** `02_SUPABASE_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define how **Supabase** serves as the Serving Plane for Catalog (and future optional Knowledge/platform tables): Auth, Postgres, RLS, Storage, and operational boundaries for Data Factory imports.

## 2. Components

| Component | Use |
| --- | --- |
| Postgres | `developers`, `property_projects`, `properties`, geography, media, import_batches, listing sources/history, inquiries/leads |
| Auth | End users + `admin_users` gate |
| RLS | Public read of published; admin/service write paths |
| Storage | Public/property media mirrors |
| Service role | Control Plane import only (pilot) |

## 3. Responsibilities

- Serve website read models with RLS.
- Accept idempotent upserts from Import Pipeline Architecture.
- Retain additive migrations only (no destructive rewrites of Phase 3–6 spine).
- Host import batch audit tables already introduced by Property Factory.

## 4. Data Flow

```text
Control Plane Import Job
  → validate/dry-run (offline vs API read)
  → service-role upsert
  → import_batches / items
  → website loaders read with anon/authenticated policies
```

## 5. Dependencies

- Existing migrations as baseline (logical)
- M0 listing/project/developer/district standards
- M1 Import/Publish contracts
- Storage Architecture for media paths

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| RLS deny | Fail closed; log audit |
| Partial batch | Item-level status; resume |
| Schema drift vs packages | Block apply; M2+ alignment |
| Rate limits | Backoff; wave throttle |

## 7. Security Considerations

- Never embed service-role keys in Windows01 pilot or git
- Admin routes gated by `admin_users` / `is_admin()`
- Published-only public selects; drafts invisible
- Storage policies separate from table RLS

## 8. Scalability

- Indexes on slugs, source+external_ref, district FKs, status
- Batch imports sized to review/apply capacity
- Read replicas later if needed — not pilot requirement

## 9. Future Expansion

- Additive: `publish_events`, `quality_scores`, recommendation interface tables, optional knowledge tables (K2)
- Marketplace role bridges without renaming catalog entities
- TypeScript `Database` type sync as ops hygiene (implementation phase)

## 10. Windows01 Integration

Windows01 reads nothing production-critical in pilot; may use anonymized/staging mirrors later. Handoff is packages → Control Plane → Supabase.

## 11. Cross References

- M1 `15_IMPORT_JOB_CONTRACT.md`, `18_PUBLISH_WORKFLOW_CONTRACT.md`
- `01_DATABASE_ARCHITECTURE.md`, `03_STORAGE_ARCHITECTURE.md`, `17_SECURITY_ARCHITECTURE.md`
- Master Plan Serving Plane
