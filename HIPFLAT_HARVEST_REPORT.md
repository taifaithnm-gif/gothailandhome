# HIPFLAT_HARVEST_REPORT

**Date:** 2026-07-14  
**Source:** `hipflat`  
**Scope:** Bangkok Wave-1 projects only (33)  
**Constraints:** PropertyHub / LivingInsider / DDproperty untouched · no schema migration · no fabricated listings · no Cloudflare bypass · no auto-merge

## Status

# BLOCKED

Cloudflare challenge (`HTTP 403`, title `Just a moment...`) on all Hipflat search pages (`www.hipflat.co.th`). Zero priced Bangkok listings could be validated. Adapter + harvest CLI shipped; no listing data invented; no bypass attempted.

DDproperty remains **BLOCKED** (unchanged).

## Adapter

| Module | Role |
|--------|------|
| `pipelines/factory/hipflat/adapter.mjs` | Fetch with CF detection, `/ads/{id}` parse stubs, normalize DTO |
| `pipelines/factory/hipflat/project-map.wave1.json` | 33 Wave-1 project search URL map |
| `pipelines/factory/harvest-hipflat-wave1.mjs` | Harvest CLI (`--per-project`, `--limit-projects`, `--only`) |
| `pipelines/factory/hipflat/import-hf-only.mjs` | Hipflat-only Supabase upsert (never updates PH/LI/DD rows) |
| `pipelines/factory/match-hipflat-sources.mjs` | Soft-match vs PH + LI · candidates only |

Identity: additive `hipflat` branches in `pipelines/factory/lib/listing-identity.mjs`. Validator allow-list: additive `hipflat` in `SOURCE_ALLOW` (not a DB schema change). Fingerprint / provenance helpers reused.

## Harvest totals

| Metric | Count |
|--------|------:|
| Projects mapped | 33 |
| Search pages attempted | 66 |
| Search pages OK | **0** |
| Search pages Cloudflare-blocked | **66** |
| Detail IDs seen | 0 |
| Listings packaged / validated | **0** |

Evidence: `pipelines/factory/hipflat/_runs/latest-harvest.json`

Blocker sample:

- URL: `https://www.hipflat.co.th/en/search/sale/bangkok/condo?q=Ashton%20Asoke`
- Status: `403`
- Title: `Just a moment...`

`robots.txt` is publicly readable (Allow `/`); HTML listing pages are not (Cloudflare challenge).

## Per-project package file

`content/projects/<slug>/listings-hipflat.json` (empty `listings: []` for each of 33 Wave-1 projects — documents harvest attempt, not invented inventory).

## Notes

- Stop condition triggered: Hipflat access protected by Cloudflare.
- PropertyHub `listings.json`, LivingInsider `listings-livinginsider.json`, and DDproperty adapter/packages were not modified.
- Re-harvest when a CF-passing egress is available; importer accepts validated packages only.
