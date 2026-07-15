# LISTING_CARD_IMPLEMENTATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.3 — Search Results Alpha

## Foundation

Uses `ListingCardShell` + `ListingMediaFrame` + `SourceBadge` / `Badge`.

## Evidence-backed fields shown

| Field | Behavior |
|-------|----------|
| Sale / rent | From `listing_type` |
| Published price | `formatPrice(price_thb)` |
| Project | Localized project name when joined |
| District | Localized district name when joined; else location name |
| Bedrooms / bathrooms / area | Numeric fields or em dash |
| Source badge | Real `source` string only |
| Verification | `Verified` badge when `is_verified_listing` |
| Last verified | `last_verified_at` preferred; else honest “Source updated {date}” from `source_updated_at` |

## Media

- Real cover URL only when present  
- Otherwise approved neutral no-image state (type-aware SVG)  
- Stable `aspect-[16/10]` + intrinsic `width`/`height` on images  
- No fabricated interiors  

## Contact

- Cards never present Apple as listing contact  
- Do not imply an agent exists  
- Optional CTA: “Ask platform for help contacting the source” → `/contact` (platform assistance label)

## Payload note

Long listing summaries omitted from search cards to keep result HTML bounded; detail pages remain unchanged in this milestone.
