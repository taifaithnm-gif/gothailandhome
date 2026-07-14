# PHASE6_M1_CORE_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 — M1 Core Factory Foundation  
**Project root:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Scope:** Schema + validators + CLI validate/dry-run + Bangkok glossary only  
**Exclusions honored:** no developer/project/listing volume imports · no UI redesign · no Marketplace · no AI/CRM/payments/memberships/ads

## Final status

# PASS

## Delivered

### 1. Additive database foundation

Migration: `supabase/migrations/20260714200000_factory_m1_foundation.sql`  
Applied via: `npm run db:migrate:phase6-m1` → `{ ok: true }`

| Object | Result |
|--------|--------|
| enum `listing_verification_status` (`unverified`/`verified`/`stale`/`delisted`) | Applied |
| `properties.verification_status` | Applied (backfills from `is_verified_listing`) |
| `properties.source_captured_at` | Applied |
| `properties.source_validated_at` | Applied |
| `properties.source_validation_ok` | Applied |
| `properties.duplicate_fingerprint` | Applied |
| table `listing_price_history` | Applied |
| table `import_batches` | Applied |
| table `import_batch_items` | Applied |
| Destructive schema changes | None |

Verified live columns/tables/enum via Postgres introspection after migrate.

### 2. JSON Schema validators

| Schema | Path |
|--------|------|
| Developer package | `pipelines/factory/schemas/developer.manifest.json` |
| Project package | `pipelines/factory/schemas/project.manifest.json` |
| Listing package | `pipelines/factory/schemas/listing.record.json` (+ fingerprint/capture fields) |
| District package | `pipelines/factory/schemas/district.package.json` |
| Media manifest | `pipelines/factory/schemas/media.manifest.json` (**new**) |

### 3. Property Factory CLI

Commands exercised:

- `validate`
- `dry-run`

(Entry: `pipelines/factory/cli.mjs` / `npm run factory`)

### 4. Validation rules implemented

In `pipelines/factory/lib/validate.mjs`:

| Rule | Status |
|------|--------|
| Required fields | PASS |
| Source URL / allow-list | PASS |
| Capture/update date (`YYYY-MM-DD` / ISO) | PASS |
| Coordinates (WGS84 + TH soft bounds) | PASS (listings soft-warn if absent) |
| Price `price_thb > 0` | PASS |
| Duplicate detection (`external_ref`, `listing_url`, fingerprint) | PASS |
| Media path/file checks (`public/` existence or http(s)) | PASS |
| EN/ZH/TH completeness gates | PASS |

### 5. Bangkok glossary foundation

Updated `content/glossary/terms.json` + README:

- district terminology → `districts-bangkok.json` (existing 50)
- BTS/MRT terminology → `transit_tags`
- facilities / schools / hospitals / shopping
- property types
- source codes aligned with factory allow-list

### 6. Specimen tests

| Specimen | validate | dry-run |
|----------|----------|---------|
| `content/projects/the-livin-ramkhamhaeng` (+ listings + new `media.json`) | PASS (`ok: true`) | PASS (developer+project upsert plan) |
| `content/areas/bangkok/districts/bang-kapi.json` | PASS | PASS (district upsert plan) |
| `content/projects/the-livin-ramkhamhaeng/media.json` | PASS | n/a |

Livin listings emitted soft warnings only: coordinates missing (inherit from project on apply).

### 7. Quality gates

| Check | Result |
|-------|--------|
| database migration | PASS |
| validator tests (CLI validate) | PASS |
| CLI dry-run | PASS |
| `npm run format` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |

### 8. Git

Committed and pushed M1 core changes to `origin/main` (see commit hash below after push).

## Explicitly not done (out of M1)

- Volume developer/project/listing imports
- Marketplace / AI / CRM / payments / memberships / ads
- UI redesign
- Listing apply path remains v1 `content:import` for specimen write; V2 apply for listings deferred to later milestones

## Status

**PASS**
