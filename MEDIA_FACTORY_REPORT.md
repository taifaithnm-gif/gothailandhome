# MEDIA_FACTORY_REPORT

**Milestone:** Phase 11 — Media Factory · Wave 1  
**Date:** 2026-07-16  
**Baseline:** post Project Factory Wave 2 (`afe65eb`)  
**Policy:** Official assets only · no screenshots · no portal watermarks · no fabrication  
**Script:** `scripts/phase11-media-factory-wave1.mjs`  
**Snapshot:** `pipelines/factory/media-library/wave1_media_factory_snapshot.json`

## Objective

Increase official media coverage across developer logos, project heroes, galleries, brochures, and floor plans — with source URL, copyright, checksum, verification date, and license note on every mirrored asset.

## Results

| Priority | Obtainable collected | Skipped (documented) |
|----------|---------------------:|---------------------:|
| 1. Developer logos | **20/20** mirrored (4 upgraded) | 0 failures |
| 2. Project hero images | **13** binaries | 37 (no direct official image URL) |
| 3. Official galleries | **13** projects (subset ≤8 imgs) | 37 |
| 4. Official brochures | **11** PDFs mirrored | 39 (no PDF URL) |
| 5. Official floor plans | **1** project (Modiz · 8 plans) | 49 (section/page only) |

## Logo upgrades (favicon → brand mark)

| Developer | New official source |
|-----------|---------------------|
| AP Thailand | `apthai.com/images/production/AP_Logo.png` |
| LPN | `lpn.co.th/images/layout/logo-2.svg` |
| Noble | `noblehome.com/images/logo.svg` |
| Supalai | `supalai.com/apple-touch-icon.png` |

Retained favicon-class marks (best obtainable): **Ananda** (Incapsula/SPA), **Major** (empty logo endpoints).

## Project binaries collected

Heroes + gallery subsets for:

knightbridge-collage-ramkhamhaeng · knightsbridge-prime-sathorn · life-asoke-rama-9 · life-ladprao · life-one-wireless · rhythm-ekkamai · supalai-oriental-sukhumvit-39 · the-forestias · the-line-sukhumvit-101 · whizdom-essence · xt-huai-khwang · xt-phayathai · **modiz-rhyme-ramkhamhaeng** (supplemental)

Brochure PDFs: rhythm-ekkamai (prior) + 10 newly mirrored (Origin ×2, AP LIFE ×3, Modiz, Supalai Oriental, Sansiri LINE/XT ×3).

Floor plans: **modiz-rhyme-ramkhamhaeng** only (direct CDN plan images).

## Storage layout

- Library: `content/media/library/{developers,projects}/…`
- Public delivery: `public/developers/…`, `public/projects/…`
- Each mirrored file: `checksum_sha256` + `downloaded_date` + `license_note`

## Stop condition

All **obtainable** official media with direct URLs registered in the catalog has been processed. Remaining gaps are missing direct asset URLs or soft-land pages — not inventable. **Waiting for review.**
