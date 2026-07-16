# SANSIRI_COMPLETION_REPORT

**Milestone:** Phase 11 — Official Content Factory · Batch 2  
**Developer:** Sansiri (`sansiri`)  
**Date:** 2026-07-16  
**Baseline HEAD:** `d097bed` (post–Batch 1 AP Thailand)  
**Policy:** Official Sansiri website + SET factsheet only. No portal upgrades to OFFICIAL. No invented stats.

## Result

| Layer | Completeness |
|-------|-------------:|
| Developer (10 official identity fields) | **100%** |
| Projects (5 packages · 10-field mean) | **64%** |
| **Combined Sansiri score** | **82%** |

## Developer checklist

| Field | Status | Source |
|-------|--------|--------|
| Logo | OFFICIAL | Cached `official-logo.jpg` from assets.sansiri.com |
| Favicon | OFFICIAL | resource.sansiri.com favicon |
| Company profile | OFFICIAL | Annual Report 2024 + SET |
| Company history | OFFICIAL | AR 2024: Establishment Since 1984 |
| Headquarters | OFFICIAL | SET / Siri Campus, Phra Khanong Nuea, Watthana |
| Established year | OFFICIAL | 1984 |
| Official website | OFFICIAL | https://www.sansiri.com/ |
| SET code | OFFICIAL | SET:SIRI |
| Official contact page | OFFICIAL | https://www.sansiri.com/en/contact/ |
| Official social links | OFFICIAL | Facebook, Instagram, YouTube, X, TikTok, LINE (EN contact + homepage footer) |

## Project set (in-catalog)

condo-u-sukhumvit-62-1 · the-base-sukhumvit-77 · the-line-sukhumvit-101 · xt-huai-khwang · xt-phayathai

## Honest gaps

1. **CONDO U Sukhumvit 62-1** — no dedicated official Sansiri project page found (404 / absent from current condominium index). All ten project fields remain UNVERIFIED (**0%**).
2. **THE BASE Sukhumvit 77** mapped to official page **The Base Park East Sukhumvit77** — Project Details (address, units, floors, completion, brochure, gallery) are blank on the live page (sold-out legacy). Facilities + READY TO MOVE / SOLD OUT status only (**20%**).
3. Media binaries stay **hotlink / pending license** (brochure PDFs and gallery URLs registered, not mirrored).
4. Contact-page HQ text also mentions Siripinyo Bldg (Ayutthaya Rd); packaged HQ remains the SET Siri Campus address already classified OFFICIAL.

## JSON-LD

No schema code changes (forbidden this batch). Newly completed official address / unit / floor / building / completion fields are written into project manifests for the next import cycle so existing `ApartmentComplex` emitters can pick them up.

## Artifacts

- `scripts/phase11-batch2-sansiri.mjs`
- `pipelines/factory/content-factory/sansiri_batch2_extracted.json`
- `pipelines/factory/content-factory/sansiri_batch2_snapshot.json`
