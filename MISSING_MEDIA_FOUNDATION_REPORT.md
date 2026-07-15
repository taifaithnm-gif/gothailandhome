# MISSING_MEDIA_FOUNDATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8 P0 — Milestone 3

## Scope

Missing-media foundation only. **No** third-party image harvest or downloads.

## Implementation

`src/components/property/listing-media-frame.tsx`

- Stable **16:10** (cards) / reusable aspect class (detail can use 16:9)
- Property-type-aware **neutral SVG silhouette** (condo / house-villa / land) — not fake interiors or building photos
- Clear **“Images unavailable”** label (`dict.common.imagesUnavailable`)
- Accessible `aria-label` / `role="img"` when placeholder
- Real media: lazy by default; optional source disclosure (`Image source: {source}`)
- Wired into `PropertyCard` and property detail hero

## Constraints

| Rule | Status |
|------|--------|
| No fake interiors/buildings | Honored |
| No new third-party media sourced | Honored |
| Stable aspect / reduced CLS | Honored |
| Accessible alt / unavailable label | Honored |
