# MULTISOURCE_READINESS_REPORT

**Migration:** `supabase/migrations/20260714220000_wave1_hardening_multisource.sql` (applied)  
**Second listing source:** **not harvested** (as required)

## Capability checklist

| Requirement | Implementation |
|-------------|----------------|
| Multiple source records per listing | `property_listing_sources` |
| Price history | `listing_price_history` (Wave1 seeded 617 rows) |
| Source-specific listing IDs | `source_listing_id` + unique `(source, source_listing_id)` |
| Cross-source duplicate candidates | `listing_duplicate_candidates` (67 soft pairs open) |
| Source priority | `listing_source_priority` (`official` 10, `propertyhub` 20, `manual` 30, `other` 90) |
| Conflict preservation | Per-source rows + append-only price history; no source B erase of source A |
| Source verification events | `listing_verification_events` |
| Inactive / delisted status | `verification_status` enum + `listing_lifecycle_status` |
| Incremental imports | Importer preserves `published_at`; updates `last_seen_at`; matches by external_ref / source id / URL |

## Importer changes

`pipelines/condo-import/import.mjs` now:

- Writes identity + verification columns
- Upserts `property_listing_sources`
- Appends price history only when price changes
- Avoids resetting `published_at` on update

## Identity helper

`pipelines/factory/lib/listing-identity.mjs` — normalize URL, source listing id, identity FP, soft FP (not title-only).

## Explicit non-goals this milestone

- No second-source harvest  
- No automatic soft-match merges  
- No destructive migrations
