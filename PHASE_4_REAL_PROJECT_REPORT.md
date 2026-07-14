# Phase 4 — Real Project Content System Report

**Final status: PASS**

**Date:** 2026-07-14  
**Production project:** The Livin Ramkhamhaeng  
**Address:** Soi Ramkhamhaeng 97/2, Hua Mak, Bang Kapi, Bangkok 10240  
**Landing:** `/en/projects/the-livin-ramkhamhaeng` (also `/zh`, `/th`)  
**Pipeline:** `pipelines/condo-import/` + `content/projects/<slug>/`

## Delivered

| Requirement | Status |
| --- | --- |
| Developer profile (RISLAND Thailand) | PASS |
| Project profile + specs + unit types + facilities | PASS |
| Transportation / schools / hospitals / malls | PASS |
| Google Maps coordinates | PASS (`13.763`, `100.647`) |
| FAQ + SEO content EN / ZH / TH | PASS |
| Real sale listings (no fabricated prices) | PASS (2) |
| Real rent listings (no fabricated prices) | PASS (3) |
| Provenance fields: `source`, `listing_url`, `source_updated_at` | PASS |
| Reusable condo import pipeline | PASS |
| Ads prep (SEO landing, Meta title/description, OG placeholders, lead form, conversion placeholders) | PASS |
| Commit + push | PASS |

## Allowed sources used

| Source type | URL / note |
| --- | --- |
| Official website | https://www.livinram.com/en , https://www.livinram.com/th |
| Official Facebook | https://www.facebook.com/Rislandthailand ; project page cited as The Livin Ramkhamhaeng |
| Google Maps | https://g.co/kgs/q1r96u (place resolves ≈ 13.763, 100.647) |
| Public portals | https://propertyhub.in.th/en/projects/the-livin-ramkhamhaeng , https://zmyhome.com/project/V17585 |
| Public listings | PropertyHub sale/rent detail pages listed below |

## Normalized into Supabase

- Migration: `supabase/migrations/20260714183000_project_content_system.sql`
- Developer slug: `risland-thailand`
- Project slug: `the-livin-ramkhamhaeng` (published)
- Location slug: `hua-mak-bang-kapi-bangkok`
- Listings upserted: **5** (via `npm run content:import`)

### Sale listings imported

| Ref | Price (THB) | Specs | Source URL | Update / capture |
| --- | --- | --- | --- | --- |
| propertyhub-5640526 (MD-25085544) | 3,510,062 | 1BR · 32.94 sqm · fl.22 | https://propertyhub.in.th/en/listings/urgent-sale-the-livin-ramkhamhaeng-md-25085544---5640526 | Portal Last Update `-`; capture `2026-07-14` |
| propertyhub-5640540 (MD-25085543) | 2,860,962 | 1BR · 32.94 sqm · fl.15 | https://propertyhub.in.th/en/listings/urgent-sale-brand-new-condo-first-owner-special-price-the-livin-ramkhamhaeng-md-25085543---5640540 | Portal Last Update `-`; capture `2026-07-14` |

### Rent listings imported

| Ref | Rent (THB/mo) | Specs | Source URL | Update / capture |
| --- | --- | --- | --- | --- |
| propertyhub-5329310 | 14,000 | 1BR · 33 sqm · fl.29 · Bldg B | https://propertyhub.in.th/en/listings/for-rent-the-livin-ramkhamhaeng-fully-furnished-and-equipped-near-mrt-lam-sali---5329310 | Portal Last Update `-`; capture `2026-07-14` |
| propertyhub-5886141 | 18,000 | 2BR · 33 sqm · fl.29 | https://propertyhub.in.th/en/listings/tehs6g-the-livin-ramkhamhaeng-for-rent-18-000-thb-2-beds-33-sq-m-floor-29---5886141 | Portal Last Update `-`; capture `2026-07-14` |
| propertyhub-5813509 | 10,000 | Studio · 22.4 sqm · fl.8 | https://propertyhub.in.th/en/listings/condo-for-rent-the-livin-ramkhamhaeng-brand-new-unfurnished-thb-8-000-month---5813509 | Detail price 10,000 (URL slug says 8,000); capture `2026-07-14` |

## Reusable pipeline (future condos)

1. Create `content/projects/<slug>/manifest.json` + `listings.json`
2. Dry-run: `node pipelines/condo-import/import.mjs content/projects/<slug> --dry-run`
3. Import: `npm run content:import -- content/projects/<slug>`
4. Public pages: `/[lang]/projects` and `/[lang]/projects/<slug>`

Docs: `pipelines/condo-import/README.md`

## Ads / SEO readiness

| Item | Implementation |
| --- | --- |
| SEO landing structure | `/[lang]/projects/[slug]` with specs, facilities, POIs, FAQ, listings, lead rail |
| Meta title / description | Project `seo_*` fields → `generateMetadata` (EN/ZH/TH) |
| Open Graph image placeholders | `/og/projects/the-livin-ramkhamhaeng.svg`, `/og/projects/placeholder.svg` |
| Lead form | Sticky enquiry form; writes `inquiries` with `project_id` |
| Conversion tracking placeholders | `AdsTrackingPlaceholders` + lead events for Meta/`gtag`/`dataLayer`; env `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID` |
| Attribution fields | `utm_*`, `gclid`, `fbclid`, `conversion_event` on `inquiries` |

## Verification

| Check | Result |
| --- | --- |
| `npm run db:migrate:phase4` | PASS |
| `npm run content:import -- content/projects/the-livin-ramkhamhaeng` | PASS (5 listings) |
| `npm run build` | PASS |
| `npm run lint` | PASS |
| Format (project files) | PASS |

## Key project facts (sourced)

- Developer: RISLAND (Thailand) Co., Ltd. / RISLAND Thailand
- Official unit plans: 22 / 28 / 32 / 38 / 55 / 61.5 sq.m. (official site)
- Portal scale figures: 42 floors, 1,938 units, land 8-3-33 rai, ~755 parking, completion 2024 (PropertyHub / Zmyhome)
- Official transit distances: Brown (planned) 50 m · Orange Lam Sali 180 m · boat pier 200 m · Yellow Lam Sali 350 m
- Coordinates: **13.763, 100.647** (Google Maps place for The Livin Ramkhamhaeng)

## Content package paths

- `content/projects/the-livin-ramkhamhaeng/manifest.json`
- `content/projects/the-livin-ramkhamhaeng/listings.json`
- `src/app/[lang]/projects/[slug]/page.tsx`
- `pipelines/condo-import/import.mjs`
