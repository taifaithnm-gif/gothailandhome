# MEDIA_PROVENANCE_REPORT

**Milestone:** Phase 10 Sprint 4 · **Date:** 2026-07-16

## Provenance model

| Field | Meaning |
|-------|---------|
| `official_url` | Source on developer/project official domain or CDN |
| `copyright_source` | Attribution string (developer/project owner) |
| `downloaded_date` | ISO date when binary was mirrored (null if hotlink-only) |
| `checksum_sha256` | SHA-256 of local bytes (null if not mirrored) |
| `local_storage_path` | Repo-relative path under `content/media/library/` |
| `rights_note` | `mirrored_to_storage` \| `hotlink` \| `unknown` |

## Mirrored binaries (sample)

| ID | Official URL | Checksum (12) | Local path |
|----|--------------|---------------|------------|
| developer:ananda-development:logo | https://www.ananda.co.th/favicon.ico | `ede8a89a2764…` | `content/media/library/developers/ananda-development/logo.ico` |
| developer:ananda-development:favicon | https://www.ananda.co.th/favicon.ico | `ede8a89a2764…` | `content/media/library/developers/ananda-development/favicon.ico` |
| developer:ap-thailand:logo | https://www.apthai.com/favicon.ico | `bd5e1351c080…` | `content/media/library/developers/ap-thailand/logo.ico` |
| developer:ap-thailand:favicon | https://www.apthai.com/favicon.ico | `bd5e1351c080…` | `content/media/library/developers/ap-thailand/favicon.ico` |
| developer:assetwise:logo | https://cdn.assetwise.co.th/wp-content/themes/seed-spring/img/asw-logo_horizontal.svg | `b2b86393aeec…` | `content/media/library/developers/assetwise/logo.svg` |
| developer:assetwise:favicon | https://cdn.assetwise.co.th/wp-content/uploads/2025/10/cropped-asw-black-logo-ract_512-32x32.jpg | `13b82dc70b20…` | `content/media/library/developers/assetwise/favicon.jpg` |
| developer:capitaland-thailand:logo | https://www.capitaland.com/etc.clientlibs/capitaland/clientlibs/clientlib-capitaland/resources/icon-192x192.png | `84da33caefc7…` | `content/media/library/developers/capitaland-thailand/logo.png` |
| developer:capitaland-thailand:favicon | https://www.capitaland.com/etc.clientlibs/capitaland/clientlibs/clientlib-capitaland/resources/icon-192x192.png | `84da33caefc7…` | `content/media/library/developers/capitaland-thailand/favicon.png` |
| developer:frasers-property-thailand:logo | https://www.frasersproperty.com/content/dam/frasersproperty/feature/project/frasers_logos/frasers-logo.png | `a4d21b22959c…` | `content/media/library/developers/frasers-property-thailand/logo.png` |
| developer:frasers-property-thailand:favicon | https://www.frasersproperty.co.th/favicon.ico | `5fe626aaef62…` | `content/media/library/developers/frasers-property-thailand/favicon.ico` |
| developer:land-and-houses:logo | https://www.lh.co.th/images/footer/LH-logo.webp | `3a20a8631c3c…` | `content/media/library/developers/land-and-houses/logo.webp` |
| developer:land-and-houses:favicon | https://www.lh.co.th/icon.ico?c09c4c2462d726db | `5f9986d54aa2…` | `content/media/library/developers/land-and-houses/favicon.ico` |
| developer:lpn-development:logo | https://www.lpn.co.th/favicon.ico?v=1 | `9c71c42504c2…` | `content/media/library/developers/lpn-development/logo.ico` |
| developer:lpn-development:favicon | https://www.lpn.co.th/favicon.ico?v=1 | `9c71c42504c2…` | `content/media/library/developers/lpn-development/favicon.ico` |
| developer:major-development:logo | https://www.major.co.th/favicon.ico | `f1945cd6c19e…` | `content/media/library/developers/major-development/logo.ico` |
| developer:major-development:favicon | https://www.major.co.th/favicon.ico | `f1945cd6c19e…` | `content/media/library/developers/major-development/favicon.ico` |
| developer:mqdc:logo | https://mqdc.com/images/mqdc.webp | `2555cf537dbf…` | `content/media/library/developers/mqdc/logo.webp` |
| developer:mqdc:favicon | https://mqdc.com/favicon/favicon.ico | `bdc9b3e51935…` | `content/media/library/developers/mqdc/favicon.ico` |
| developer:noble-development:logo | https://www.noblehome.com/favicon.ico | `b140fdee9f43…` | `content/media/library/developers/noble-development/logo.ico` |
| developer:noble-development:favicon | https://www.noblehome.com/favicon.ico | `b140fdee9f43…` | `content/media/library/developers/noble-development/favicon.ico` |
| developer:origin-property:logo | https://origin.co.th/wp-content/uploads/2022/01/cropped-new-logo-origin-icon-32x32.png | `d31a4ed35837…` | `content/media/library/developers/origin-property/logo.png` |
| developer:origin-property:favicon | https://origin.co.th/wp-content/uploads/2022/01/cropped-new-logo-origin-icon-32x32.png | `d31a4ed35837…` | `content/media/library/developers/origin-property/favicon.png` |
| developer:pruksa-holding:logo | https://static.pruksa.com/static/favicons/safari-pinned-tab.svg | `1530c0fb3b8a…` | `content/media/library/developers/pruksa-holding/logo.svg` |
| developer:pruksa-holding:favicon | https://static.pruksa.com/static/favicons/safari-pinned-tab.svg | `1530c0fb3b8a…` | `content/media/library/developers/pruksa-holding/favicon.svg` |
| developer:quality-houses:logo | https://www.qh.co.th/img/logo.svg | `d212493e21ad…` | `content/media/library/developers/quality-houses/logo.svg` |
| … | 16 more | | |

## Hotlink-only classes

Galleries, floor plans, and heroes point at official pages/sections. Binaries intentionally **not** scraped.
