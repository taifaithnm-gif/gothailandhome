# DAILY_CONTENT_REPORT

**Milestone:** Phase 12 — Daily Content Factory  
**Day:** 2026-07-16  
**Policy:** Official sources only · evidence + provenance + verification timestamp  
**Script:** `scripts/phase12-daily-content-2026-07-16.mjs`  
**Snapshot:** `pipelines/factory/daily-content/2026-07-16_snapshot.json`

## Quota completion

| Slot | Target | Result |
|------|--------|--------|
| 1 Developer | Frasers Property Thailand | **Done** — contact page, SET establish year 1990, HQ + social refreshed |
| 2 Projects | Samyan Mitrtown · One Bangkok | **Done** — Samyan 0% → **40%**; One Bangkok 40% → **50%** |
| 1 District | Dusit | **Done** — BMA + SSRU + Vajira official; wiki-only POIs removed |
| 1 Knowledge article | `bts-skytrain-overview` | **Done** — from bts.co.th homepage only |

## Developer — `frasers-property-thailand`

| Field | Class | Source |
|-------|-------|--------|
| headquarters | OFFICIAL | https://www.frasersproperty.co.th/en/contact-us (+ SET confirm) |
| established_year | OFFICIAL | https://www.set.or.th/en/market/product/stock/quote/FPT/factsheet → **1990** |
| official_contact_page | OFFICIAL | https://www.frasersproperty.co.th/en/contact-us |
| company_profile / overview | OFFICIAL | home + SET + contact |
| official_social_links | OFFICIAL | contact-page JSON-LD sameAs + Thailand Facebook |
| listed_company_code | OFFICIAL | SET:FPT |

Official `field_evidence` count: **8 → 10**

## Projects

### `samyan-mitrtown` (0% → 40%)

- Official site recovered: **https://www.samyan-mitrtown.com/en/** (prior non-hyphen domain failed in Wave 2).
- OFFICIAL: project page, address (`944 Rama IV Rd, Wang Mai, Pathum Wan, Bangkok 10330, Thailand`), gallery CDN still, facilities (Office Tower / Townhall / B1–5 directory), operating status.
- UNVERIFIED (documented): brochure PDF, unit floor plans, building_count, floor_count, total_units, completion_year.

### `one-bangkok` (40% → 50%)

- Re-verified https://www.onebangkok.com/en/.
- Upgraded **official_gallery** via `en.thumb.800.480.png` on official domain; address contact block re-stamped.

## District — `dusit`

- Sources limited to **BMA**, **SSRU** (`https://ssru.ac.th/`), **Vajira** (`https://www.vajira.ac.th/`).
- Removed Wikipedia-only shopping/parks/veterinary entries.
- Transit left empty (no official Dusit station list in today’s BTS homepage capture).

## Knowledge — `bts-skytrain-overview`

- Path: `content/knowledge/articles/bts-skytrain-overview.json`
- OFFICIAL phones: 0 2617 6000, 0 2617 7341
- OFFICIAL network labels observed on homepage: Sukhumvit, Silom, Gold, Yellow, Pink, BRT Sathorn
- No invented fares, station counts, or ridership.

## Skips (documented)

- **capitaland-thailand / ascott-embassy-sathorn:** capitaland.com/th/* soft-lands to 404; Ascott brand URLs 403/404 — deferred.
- **land-and-houses THE ROOM project detail metrics:** lh.co.th project URLs return thin SPA shells (title/OG = LH generic; localhost OG image) without publishable unit/floor facts.
- **dusit transit stations / parks:** No official station or park-authority list captured this day; emptied wiki-only POIs rather than fabricate.

## Stop condition

Daily quota filled. No UI / feature / deploy changes. Waiting for next daily run.
