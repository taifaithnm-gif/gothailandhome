# LICENSE_REPORT

**Milestone:** Phase 11 Media Factory Wave 1  
**Date:** 2026-07-16  
**Scope:** Mirrored official media under `content/media/library/` and `public/`

## Posture

GoThailandHome mirrors **publicly posted official marketing / identity assets** for catalog integrity (checksum, provenance, offline verification).  
**Trademark and copyright remain with the rights holders.**  
**Commercial reuse, ad redistribution, or sublicensing requires explicit license from the developer / publisher.**

## License notes by class

| Class | `license_note` summary | Binary status |
|-------|------------------------|---------------|
| Developer logos / favicons | Official website identity asset mirrored for catalog. Trademark remains with rights holder. | Mirrored |
| Brochure PDFs | Official marketing PDF mirrored for catalog. Redistribution/commercial use subject to rights-holder terms. | Mirrored |
| Gallery / hero images | Official CDN/marketing images archived for checksum catalog (subset). Commercial reuse requires license. | Mirrored subset |
| Floor plans | Official floor-plan assets archived for checksum catalog. Commercial reuse requires license. | Mirrored where direct URL exists |
| Page-only hotlinks | Hotlink / pending license — binary not mirrored | Not mirrored |

## Allowed this wave

1. Official developer domain logos / favicons / apple-touch icons  
2. Official brochure PDFs already registered with direct `.pdf` URLs  
3. Direct official CDN image URLs from prior Official Content / Project Factory evidence  

## Forbidden (enforced)

1. Portal screenshots  
2. Portal watermarked listing photos  
3. Fabricated or AI-generated stand-ins labeled as official  
4. Scraping interactive floor-plan viewers without a direct asset URL  

## Residual risk

Mirrored photo/PDF assets are stored with `download_status` values such as `downloaded_pending_license`.  
Until legal clears commercial display rights, product UI should treat them as **catalog/archive** (or continue hotlinking) per product policy.

## Skips (not a license failure)

Unavailable items were skipped because **no obtainable official binary URL** existed — not because license was refused. See `MEDIA_FACTORY_REPORT.md` and the Wave 1 snapshot skip lists.

## Contact / next legal step

For public site display of gallery/hero/floor-plan binaries beyond identity logos and brochure PDFs, obtain written permission (or confirm existing marketing CDN terms) per developer.
