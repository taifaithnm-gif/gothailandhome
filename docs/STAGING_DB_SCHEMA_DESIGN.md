# Staging DB Schema Design

**DESIGN DRAFT ONLY — DO NOT EXECUTE**

## New staging tables

| Table | Role |
| --- | --- |
| `staging_import_sessions` | Session ledger + flags |
| `staging_developers` | Developer candidates (stable `candidate_id`, never unified `dev-unknown`) |
| `staging_projects` | Projects (UNKNOWN developer allowed) |
| `staging_assets` | Images / media |
| `staging_pdfs` | PDF documents |
| `staging_news` | News (never PUBLISHED) |
| `staging_review_items` | Review queue |
| `staging_duplicate_candidates` | Cross/within batch duplicates |
| `staging_conflict_candidates` | Conflicts |
| `staging_audit_events` | Append-only audit |

## Reuse vs forbid

**Reuse (reference only, no writes this milestone):** Production catalog tables for future canonical linking (`canonical_developer_id`, etc.).

**Forbid touching from staging commit:**

- `public.developers`, `public.property_projects`, `public.properties`, `public.property_media`
- Factory `public.import_batches` production apply path
- Any Production Storage bucket

## SQL location

`database-design/staging-import-v1/` — **not** `supabase/migrations/`.
