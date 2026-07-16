# AP_MEDIA_REPORT

**Milestone:** Phase 11 Batch 1 · AP Thailand  
**Date:** 2026-07-16  
**Policy:** Register official media provenance. Do not scrape unlicensed gallery/hero binaries.

## Provenance fields (every asset)

`official_url` · `copyright_source` · `downloaded_date` · `checksum_sha256` · `local_storage_path` · `download_status`

## Inventory

| Project | Gallery | Brochure | Floor plans | Hero |
|---------|---------|----------|-------------|------|
| rhythm-ekkamai | not_downloaded_pending_license | downloaded | not_downloaded_pending_license | placeholder_pending_official_mirror |
| life-asoke-rama-9 | not_downloaded_pending_license | not_downloaded_pending_license | not_downloaded_pending_license | placeholder_pending_official_mirror |
| life-ladprao | not_downloaded_pending_license | not_downloaded_pending_license | not_downloaded_pending_license | placeholder_pending_official_mirror |
| life-one-wireless | not_downloaded_pending_license | not_downloaded_pending_license | not_downloaded_pending_license | placeholder_pending_official_mirror |
| aspire-sathorn-taksin | not_downloaded_pending_license | unverified_no_official_pdf | unverified_no_official_plans_published | placeholder_pending_official_mirror |

## Downloaded binaries

| Asset | Path | Checksum |
|-------|------|----------|
| Rhythm Ekkamai brochure PDF | `content/media/library/projects/rhythm-ekkamai/brochure.pdf` / `public/projects/rhythm-ekkamai/brochure.pdf` | retained from Sprint 4 media library |
| AP logo / favicon | `public/developers/ap-thailand/official-logo.ico` | Sprint 4 cache |

## Hotlink registrations

Official gallery image URLs (AP CDN) are listed on `media_library.gallery.gallery_image_urls` where the official page publishes them. Binaries are **not** mirrored pending license clearance.

## Aspire note

`coming_soon` project page does not currently expose gallery/brochure/facility/plan payloads — media classes remain UNVERIFIED / unverified download status.
