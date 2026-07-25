# STAGING_DB_SCHEMA_AUDIT

## Draft tables

All required staging tables drafted in SQL + TypeScript models.

## PK policy

Internal UUID/hash ids — **not** `source_record_id` as PK.

## Soft delete

`deleted_at` on entity tables; audit append-only without delete.

## Review states

Allowed set excludes APPROVED / READY_FOR_PRODUCTION / PUBLISHED.

## SQL registration

Drafts **not** under `supabase/migrations/`.

## Verdict

**PASS** (design). Apply blocked until implementation milestone + human review.
