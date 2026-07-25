# Staging Import Schema V1 — Design Drafts

**Status:** DESIGN DRAFT ONLY
**DO NOT EXECUTE**
**NO PRODUCTION MIGRATION**

These SQL files are architectural drafts for `STAGING_DB_COMMIT_DESIGN_V1`.

## Rules

1. Do **not** copy these files into `supabase/migrations/`.
2. Do **not** run via `npm run db:apply` / `db:migrate:*`.
3. Do **not** apply to Production or live Staging until a future implementation milestone with human review.
4. Every file begins with `DESIGN DRAFT ONLY` / `DO NOT EXECUTE` / `NO PRODUCTION MIGRATION`.

## Files

| File | Purpose |
| --- | --- |
| `001_staging_import_sessions.sql` | Import session ledger |
| `002_staging_entities.sql` | Developers, projects, assets, pdfs, news, duplicates, conflicts |
| `003_staging_review_items.sql` | Review queue (no APPROVED/PUBLISHED) |
| `004_staging_audit_events.sql` | Append-only audit |
| `005_staging_indexes.sql` | Indexes (no unbounded FTS / no pg_trgm) |
| `006_staging_rls_policies.sql` | RLS role matrix (sketch) |
| `007_staging_constraints.sql` | Extra CHECKs |
| `008_staging_rollback_helpers.sql` | Soft-delete rollback helper (commented) |

## Forbidden tables

Do not alter Production tables from this draft:

- `public.developers`
- `public.property_projects`
- `public.properties`
- `public.property_media`
- `public.import_batches` (factory production path)
