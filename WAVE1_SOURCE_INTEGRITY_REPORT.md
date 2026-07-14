# WAVE1_SOURCE_INTEGRITY_REPORT

## Provenance chain

| Layer | Status |
|-------|--------|
| Package `source=propertyhub` | 617 / 617 |
| Package `listing_url` | 617 / 617 |
| Package `external_ref=propertyhub-{id}` | 617 / 617 |
| Package `verification_status=verified` | 617 / 617 |
| Package capture dates | Present (`collected_at` / `source_captured_at`) |
| DB price == package price | 617 / 617 |
| DB identity backfill | 617 / 617 |
| `property_listing_sources` rows | 617 |
| `listing_price_history` seed rows | 617 |
| `listing_verification_events` (`identity_backfill`) | 617 |

## Pre-hardening defect (fixed without re-harvest)

Importer (`pipelines/condo-import/import.mjs`) previously wrote `is_verified_listing=true` only.  
`verification_status` stayed `unverified` for most rows; fingerprints / captured timestamps were null.

**Fix:** importer now writes full identity + verification fields; Wave1 backfill reconstructed missing columns from packages. Prices untouched.

## Overwrite risk assessment

| Risk | Finding |
|------|---------|
| Price overwrite without evidence | **None** — 0 mismatches |
| Lost listings | **None** — 617 matched |
| Batch table empty historically | Local file batches used; DB `import_batches` was unused by v1 importer |
| Second-source collision | Mitigated via `property_listing_sources` + source priority |

## Extra DB rows

3 PropertyHub-linked rows exist in DB outside current Wave1 packages (`propertyhub-5813509`, `5329310`, `5886141`). Left intact; not deleted.
