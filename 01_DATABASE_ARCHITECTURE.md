# 01 — Database Architecture

**Document ID:** `01_DATABASE_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the logical multi-store database architecture for the GoThailandHome Data Factory: Serving Catalog, Package FS, Factory Work Store, and Intelligence indexes — without SQL DDL.

## 2. Components

| Store | Role | Plane |
| --- | --- | --- |
| **Serving Catalog DB** | Public catalog projections (Supabase Postgres) | Serving |
| **Package FS** | Git-backed package-of-record | Control |
| **Factory Work DB** | Sources, raw items, review tasks, jobs (`cf_*` logical) | Execution (Windows01) |
| **Object / Blob Store** | Media mirrors + evidence blobs | Serving + Execution |
| **Vector Index** | Embeddings for approved corpus | Execution first; optional later promote |
| **Audit Store** | Append-only events (table or log stream) | Control + Execution |

## 3. Responsibilities

- Preserve additive evolution of existing Supabase catalog tables.
- Keep Serving Catalog ≠ Work Store (unification rule: no parallel property master in CF DB).
- Support version pins (`package_version`, `content_hash`) across stores.
- Enable Knowledge Graph edges as relational edge tables first.

## 4. Data Flow

```text
Sources → Work DB raw_items → packages (FS)
  → Review (work/control) → Publish event
  → Import → Serving Catalog
  → (optional) chunk/embed → Vector Index
  → Search / Recommend read Serving + Vector
```

## 5. Dependencies

- M0 data model & identifiers; M1 entity/workflow contracts
- Supabase Architecture (`02`); Storage (`03`); Windows01 Runtime (`15`)

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Work DB down | Pause collection; Control Plane review of existing packages continues |
| Serving DB down | Website degrade; no apply; queue import batches |
| Hash mismatch | Reject apply; stop-the-line on wave |
| Split-brain package vs DB | Drift job; freeze publish |

## 7. Security Considerations

- Least-privilege DB roles: read public, service-role import only on Control Plane (pilot)
- No prod write creds on Windows01 pilot
- PII minimized in Work DB; never in public packages

## 8. Scalability

- Vertical for pilot; shard-by-wave for harvest
- Edge/embedding tables grow independently of catalog FKs
- Backpressure on raw_item intake vs review capacity

## 9. Future Expansion

- K2 knowledge tables in Serving or dedicated schema
- Multi-site `site_id` on knowledge/export — not on every catalog row day-one
- Optional promote vector index to managed Postgres

## 10. Windows01 Integration

Hosts Factory Work DB + local vector + evidence metadata; exports packages/hashes to Control Plane; never owns Serving Catalog authority in pilot.

## 11. Cross References

- Master Plan §3; M0 `01`/`02`/`14`/`15`; M1 `15`–`20`
- `02_SUPABASE_ARCHITECTURE.md`, `03_STORAGE_ARCHITECTURE.md`, `15_WINDOWS01_RUNTIME_ARCHITECTURE.md`
