# DOTPROPERTY_HARVEST_REPORT

**Date:** 2026-07-14  
**Source:** `dotproperty`  
**Scope:** Bangkok Wave-1 projects only (33)  
**Constraints:** PropertyHub / LivingInsider / DDproperty / Hipflat untouched · no schema migration · no fabricated listings · no Cloudflare bypass · no auto-merge

## Status

# PASS

DotProperty (`www.dotproperty.co.th`) is publicly reachable (HTTP 200). Harvest used published project sitemap → `projectId` sale/rent search URLs → detail pages with `RealEstateListing` ld+json.

## Adapter

| Module | Role |
|--------|------|
| `pipelines/factory/dotproperty/adapter.mjs` | Fetch, CF detection, ad-id extract, ld+json normalize |
| `pipelines/factory/dotproperty/project-map.wave1.json` | 33 Wave-1 projects mapped to DotProperty `project_id` |
| `pipelines/factory/harvest-dotproperty-wave1.mjs` | Harvest CLI (balanced sale/rent per project) |
| `pipelines/factory/dotproperty/import-dp-only.mjs` | DotProperty-only Supabase upsert |
| `pipelines/factory/match-dotproperty-sources.mjs` | Soft-match vs PH + LI · candidates only |

Identity: additive `dotproperty` branches in `listing-identity.mjs`. Validator allow-list: additive `dotproperty` in `SOURCE_ALLOW` (not a DB schema change).

## Harvest totals

| Metric | Count |
|--------|------:|
| Projects mapped with `project_id` | **33** |
| Search pages OK | 64 |
| Search pages HTTP 404 | 2 (`ideo-mobi-sukhumvit-66` projectId `11949`) |
| Detail pages parsed | 192 |
| Listings validated & packaged | **192** |
| Sale / rent | **96 / 96** |
| Projects with inventory | **32** |
| Projects empty | 1 (`ideo-mobi-sukhumvit-66`) |
| Validator rejects | **0** |

Evidence: `pipelines/factory/dotproperty/_runs/latest-harvest.json`

## Per-project package file

`content/projects/<slug>/listings-dotproperty.json`

## Notes

- Intake capped at 6 listings/project (3 sale + 3 rent when both available).
- `ideo-mobi-sukhumvit-66`: sitemap mapped id `11949` returns `Page Not Found` on sale/rent search — package empty; not fabricated.
- robots.txt allows public search/ad paths used here; disallows dashboard/enquire only.
- DDproperty + Hipflat remain BLOCKED (adapters preserved, data unchanged).
