# MEDIA_PROVENANCE_REPORT

**Milestone:** Phase 11 Media Factory Wave 1  
**Date:** 2026-07-16  
**Rule:** Every mirrored asset records `official_url`, `copyright_source`, `checksum_sha256`, `verified_at`, `license_note`.

## Provenance fields (required)

| Field | Purpose |
|-------|---------|
| `official_url` | Exact source on developer/project domain or official CDN |
| `copyright_source` | Rights-holder attribution string |
| `checksum_sha256` | Integrity of mirrored bytes |
| `downloaded_date` / `verified_at` | `2026-07-16` |
| `license_note` | Catalog vs commercial-use posture |
| `local_storage_path` | Path under `content/media/library/…` |

## Logo provenance (upgrades)

| Slug | Official URL | Checksum present |
|------|--------------|:----------------:|
| ap-thailand | https://www.apthai.com/images/production/AP_Logo.png | ✓ |
| lpn-development | https://www.lpn.co.th/images/layout/logo-2.svg | ✓ |
| noble-development | https://www.noblehome.com/images/logo.svg | ✓ |
| supalai | https://www.supalai.com/apple-touch-icon.png | ✓ |

Other 16 logos retain prior Sprint 4 mirror provenance; `license_note` stamped in Wave 1.

## Brochure provenance (PDF)

| Project | Official PDF host |
|---------|-------------------|
| rhythm-ekkamai | apthai.com |
| life-asoke-rama-9 | apthai.com |
| life-ladprao | apthai.com |
| life-one-wireless | apthai.com |
| modiz-rhyme-ramkhamhaeng | cdn.assetwise.co.th |
| knightbridge-collage-ramkhamhaeng | origin.co.th |
| knightsbridge-prime-sathorn | en.origin.co.th |
| supalai-oriental-sukhumvit-39 | supalai.com |
| the-line-sukhumvit-101 | sansiri.com |
| xt-phayathai | sansiri.com |
| xt-huai-khwang | sansiri.com |

## Gallery / hero provenance hosts

| Host pattern | Projects |
|--------------|----------|
| en.origin.co.th / origin.co.th uploads | KnightsBridge Prime, Collage |
| apthai.com production images | Rhythm, LIFE towers |
| sansiri.com / assets | XT, THE LINE |
| supalai.com stocks | Oriental Sukhumvit 39 |
| mqdc.com / corecms.mqdc.com | Forestias, Whizdom Essence |
| cdn.assetwise.co.th | Modiz Rhyme |

## Explicit non-sources

- PropertyHub / Hipflat / DDProperty / FazWaz images  
- Agency resale sites (e.g. theesseasoke.com)  
- Browser screenshots  
- Fabricated placeholders presented as official photos  

## Machine index

`pipelines/factory/media-library/wave1_media_factory_snapshot.json` lists every download, skip, and failure with reasons.
