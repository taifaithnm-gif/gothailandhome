# FAZWAZ_HARVEST_REPORT

**Date:** 2026-07-14  
**Source:** `fazwaz`  
**Scope:** Bangkok Wave-1 projects only (33)  
**Constraints:** Prior sources untouched · no schema migration · no fabricated listings · no Cloudflare bypass · no auto-merge

## Status

# PASS

Harvested via publicly reachable **`www.fazwaz.co.th`**.  
`www.fazwaz.com` returns Cloudflare `403` / `Just a moment...` and was **not** used (no bypass attempted).

## Adapter

| Module | Role |
|--------|------|
| `pipelines/factory/fazwaz/adapter.mjs` | Fetch, CF title detection, unit-id extract, dataLayer/title normalize |
| `pipelines/factory/fazwaz/project-map.wave1.json` | 33 Wave-1 projects → sale/rent `at-{slug}` search URLs |
| `pipelines/factory/harvest-fazwaz-wave1.mjs` | Harvest CLI (balanced sale/rent) |
| `pipelines/factory/fazwaz/import-fz-only.mjs` | FazWaz-only Supabase upsert |
| `pipelines/factory/match-fazwaz-sources.mjs` | Soft-match vs PH + LI + DotProperty · candidates only |

Identity: additive `fazwaz` branches in `listing-identity.mjs`. Validator allow-list already included `fazwaz`.

## Harvest totals

| Metric | Count |
|--------|------:|
| Projects mapped | **33** |
| Search pages OK | **66** |
| Search pages blocked | **0** |
| Detail pages seen | 192 |
| Validated & packaged | **190** |
| Sale / rent | **94 / 96** |
| Rejected (no beds & no area) | **2** |
| Projects with inventory | **32** |
| Projects empty | 1 (`kave-town-space` — Pathum Thani project; Bangkok `at-` page had no unit cards) |

Evidence: `pipelines/factory/fazwaz/_runs/latest-harvest.json`

## Rejection policy (enforced)

Listings without **published THB price**, **valid source URL**, **project_slug**, **listing type**, and **bedrooms or area** are rejected.

## Notes

- Unit IDs are numeric (`-u34828`); prices taken from public `dataLayer` `property_view` + title fallback.
- robots.txt allows public HTML; `/api/` and `/graphql` are disallowed and were not used.
- DDproperty + Hipflat remain BLOCKED adapters with 0 rows.
