# SUPABASE_IMPORT_REPORT

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Import mode:** incremental upsert — do not overwrite existing verified data

## Live database counts (read-only, `count=exact`)

Queried this milestone against the live Supabase REST API:

| Table | Rows | Notes |
|-------|-----:|-------|
| `developers` | 23 | 20 from M2 packages + 3 earlier-phase seeds |
| `property_projects` | 52 | 50 from M2 packages + 2 earlier-phase seeds |
| `properties` | 633 | all listing rows |
| `properties` where `verification_status = verified` | 620 | matches `is_verified_listing = true` (620) |
| `cities` | 6 | |
| `districts` | 56 | 50 Bangkok khet + others |
| `locations` | 31 | |
| `property_media` | 1 | seed row |

Packaged vs. DB reconciles: packages hold 20 dev / 50 proj / 617 verified listings;
the DB surplus (+3 / +2 / +3) is prior-phase data preserved by incremental upsert.

## Import batches

| Batch | Wave | Status | Items | Result |
|-------|------|--------|------:|--------|
| `bangkok-w1-2026-07-14T12-14-52-242Z` | bangkok-w1 | completed | 120 | recorded in `content/_runs/` |
| `bangkok-w1-2026-07-14T14-00-01-004Z` | bangkok-w1 | completed | 120 | **120 ok / 0 error** |

Listing import ran separately via `pipelines/factory/import-all-listings.mjs`,
upserting all 33 listing packages. Batch records are stored as JSON under
`content/_runs/`. (The DB `import_batches` table is currently empty — batch
provenance lives in the `_runs` files this milestone.)

## Migrations applied (schema)

| Migration | Purpose |
|-----------|---------|
| `20260714120000_init_property_foundation.sql` | Core property tables |
| `20260714183000_project_content_system.sql` | Project content system |
| `20260714190000_platform_geography.sql` | Cities / districts / locations |
| `20260714200000_factory_m1_foundation.sql` | Factory M1 foundation |
| `20260714220000_wave1_hardening_multisource.sql` | Duplicate fingerprint, price history, source priority, verification events |

## Non-destructiveness controls

- Upsert on natural keys (slug / external_ref) — no truncation, no delete.
- Prior verified rows (developers, projects, listings from Phases 3–5) remain intact.
- No `apply` was re-run against already-imported packages this milestone; DB counts
  above were obtained read-only.

## Verification

| Check | Result |
|-------|--------|
| DB reachable | ✅ (REST count queries succeeded) |
| DB verified-listing count ≥ packaged | ✅ (620 ≥ 617) |
| Apply batch errors | 0 |
| Overwrite of prior verified data | none |
