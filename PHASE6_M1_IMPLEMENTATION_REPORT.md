# PHASE 6 M1 — Property Factory Implementation Report

**Date:** 2026-07-14  
**Scope:** Property Factory foundation only (no Marketplace, AI, CRM, Payment, UI redesign)  
**Based on:** Platform Architecture V2 · Business Foundation V1 · Content Standard V1 · Property Factory Master Plan · Roadmap Phase 6

---

## Summary

Phase 6 M1 delivered DATA_STANDARD validators, Property Factory folder layout, Bangkok Area Factory (50 districts), Developer Factory wave 1 (20), Project Factory wave 1 (50), and Import Pipeline V2 CLI (`validate` / `dry-run` / `apply` / `resume` / `rollback`). Wave `bangkok-w1` was applied successfully to Supabase (120 upserts, 0 errors).

---

## Task results

### Task 1 — DATA_STANDARD validators

| Capability | Location |
| --- | --- |
| JSON Schema | `pipelines/factory/schemas/` (developer, district, project, listing, i18n, source) |
| Import validators | `pipelines/factory/lib/validate.mjs` |
| Required fields | `validateRequiredFields`, entity validators |
| Duplicate detection | `detectListingDuplicates` (`external_ref`, `listing_url`) |
| Source validation | allow-list (`propertyhub`, `official_developer`, `wikipedia`, `bma`, …) |
| Coordinate validation | WGS84 + Thailand soft bounds |
| Image validation | URL, rights_note, cover soft checks |

### Task 2 — Factory folders

Created under `content/`:

- `developers/` · `projects/` · `areas/` · `listings/` · `media/` · `taxonomy/` · `glossary/`
- Each includes `README.md` with validation rules
- Root `content/README.md` documents CLI usage

### Task 3 — Bangkok Area Factory

- **50/50** Bangkok districts (khet) as `content/areas/bangkok/districts/<slug>.json`
- Fields: metadata, SEO, transportation, schools, hospitals, shopping, investment_summary, nearby_projects
- Toponymy / coords / postal codes cited from Wikipedia list + BMA GIS portal
- POI arrays empty unless clearly sourced (e.g. Bang Kapi MRT Yellow / Chatuchak market)
- `investment_summary` explicitly states **no fabricated yields**
- Glossary: `content/glossary/districts-bangkok.json`

### Task 4 — Developer Factory V1

- **20** developer packages with **official website** primary sources
- Includes RISLAND, Sansiri, AP, LH, Pruksa, Origin, Ananda, Supalai, SC Asset, QH, LPN, Major, MQDC, AssetWise, Raimon Land, Noble, Frasers Thailand, Sena, CapitaLand Thailand, Singha Estate

### Task 5 — Project Factory V1

- **50** Bangkok project packages under `content/projects/<slug>/`
- Linked to developers + Bangkok districts
- Official developer/project URLs only; no invented prices or availability
- Preserved rich specimen `the-livin-ramkhamhaeng`

### Task 6 — Import Pipeline V2

CLI: `pipelines/factory/cli.mjs` / npm scripts:

| Command | Behavior |
| --- | --- |
| `validate` | Schema + business rules |
| `dry-run` / `--wave bangkok-w1` | Plan upserts |
| `apply` | Ordered upsert: districts → developers → projects |
| `resume` | Resume from `content/_runs/<batch_id>.json` |
| `rollback` | Soft: deactivate districts / unpublish developers (no hard deletes) |

Batch ledgers: `content/_runs/` (gitignored).  
v1 `npm run content:import` retained for listing specimens.

### Task 7 — Verification

| Check | Result |
| --- | --- |
| `factory:dry-run --wave bangkok-w1` | PASS — 50 districts, 20 developers, 50 projects, 0 validation errors |
| `factory:apply --wave bangkok-w1` | PASS — batch `bangkok-w1-2026-07-14T12-14-52-242Z`, 120 ok, 0 error |
| `npm run format` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |

---

## npm scripts added

```text
factory / factory:generate / factory:validate / factory:dry-run
factory:apply / factory:resume / factory:rollback
```

Dependencies: `ajv`, `ajv-formats`.

---

## Explicit exclusions (honored)

- No Marketplace implementation  
- No AI product features  
- No CRM  
- No Payment  
- No UI / route redesign  

---

## Follow-ups (later milestones)

- Listing Factory batches (M6) via PropertyHub adapter  
- Dual-run history tables (`listing_price_history`, `import_batches` in DB) if ops prefer DB over filesystem ledgers  
- Enrich district POIs only with sourced captures  
- Fill project geo/facilities when official specs are captured  

---

## Contained change set (high level)

- `pipelines/factory/**` — schemas, validators, CLI, generate, import engine  
- `content/**` — packages + READMEs + glossary/taxonomy  
- `package.json` — factory scripts + ajv deps  
- `.gitignore` — `_runs/`, `_raw/`
