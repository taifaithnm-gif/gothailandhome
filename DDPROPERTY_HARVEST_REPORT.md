# DDPROPERTY_HARVEST_REPORT

**Date:** 2026-07-14  
**Source:** `ddproperty`  
**Scope:** Bangkok Wave-1 projects only (33)  
**Constraints:** PropertyHub and LivingInsider untouched · no schema change · no fabricated listings · no auto-merge

## Status

# BLOCKED

Cloudflare challenge (`HTTP 403`, title `Just a moment...`) on all search pages. Zero priced Bangkok listings could be validated. Adapter + harvest CLI shipped; no listing data invented.

## Adapter

| Module | Role |
|--------|------|
| `pipelines/factory/ddproperty/adapter.mjs` | Fetch with CF detection, search/detail parse stubs, normalize DTO |
| `pipelines/factory/ddproperty/project-map.wave1.json` | 33 Wave-1 project search URL map |
| `pipelines/factory/harvest-ddproperty-wave1.mjs` | Harvest CLI (`--per-project`, `--limit-projects`, `--only`) |
| `pipelines/factory/ddproperty/import-dd-only.mjs` | DD-only Supabase upsert (never updates PH/LI rows) |
| `pipelines/factory/match-ddproperty-sources.mjs` | Soft-match vs PH + LI · candidates only |

Identity: additive `ddproperty` branches in `pipelines/factory/lib/listing-identity.mjs` (URL normalize + source id). Existing fingerprint / soft-match helpers reused.

## Harvest totals

| Metric | Count |
|--------|------:|
| Projects mapped | 33 |
| Search pages attempted | 66 |
| Search pages OK | **0** |
| Search pages Cloudflare-blocked | **66** |
| Detail IDs seen | 0 |
| Listings packaged / validated | **0** |

Evidence: `pipelines/factory/ddproperty/_runs/latest-harvest.json`

Blocker sample:

- URL: `https://www.ddproperty.com/en/property-for-sale?market=residential&freetext=Ashton%20Asoke`
- Status: `403`
- Title: `Just a moment...`

## Per-project package file

`content/projects/<slug>/listings-ddproperty.json` (empty `listings: []` for each of 33 Wave-1 projects — documents harvest attempt, not invented inventory).

## Notes

- Browser automation MCP unavailable in this environment; raw `fetch` and curl both receive Cloudflare HTML.
- PropertyHub `listings.json` and LivingInsider `listings-livinginsider.json` were not modified.
- Re-harvest when a CF-passing egress / cookie path is available; importer will accept validated packages only.
