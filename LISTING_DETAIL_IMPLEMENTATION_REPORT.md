# LISTING_DETAIL_IMPLEMENTATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.4 — Listing Detail Alpha  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main`  
**Pre-work HEAD:** `685240c1d6f0a7e1f4183e65186f81a435d0d8e2`

## Scope

Redesign `/[lang]/properties/[id]` only. No Search / Homepage / Project redesign. No harvest. No verified listing mutations. No deploy.

## Page structure delivered

| # | Section | Behavior |
|---|---------|----------|
| 1 | Gallery | Real `property_media` only; neutral `ListingMediaFrame` when empty; stable 16:10 |
| 2 | Key summary | Sale/rent, price, area, beds, baths, floor, verification badge |
| 3 | Property facts | Evidence-backed fields; unknown remains “Unknown” |
| 4 | Project | Project card + developer + district links when present |
| 5 | Map | Project verified coordinates / Google Maps URL only |
| 6 | Nearby | Listing `transit_tags` + project transportation / nearby POIs (normalized; no invention) |
| 7 | Contact | Split A (listing) / B (platform) — see CONTACT_PRESENTATION_REPORT |
| 8 | Request viewing | Existing marketplace viewing form |
| 9 | Find similar | Bounded paged query (≤3), prefer district → project → listing type |
| 10 | Source & verification | Source badge, last verified / source updated, optional source URL |

## Data additions (read-only mapping)

- `PropertyView.floorLabel` ← `floor_label`
- `PropertyView.buildingLabel` ← `building_label`

## Related files

- `src/app/[lang]/properties/[id]/page.tsx`
- `src/components/property/listing-gallery.tsx`
- `src/components/property/listing-contact-card.tsx`
- `src/components/property/viewing-request-form.tsx`
- `src/lib/data/properties.ts`
- `src/dictionaries/{en,zh,th}.json`

## Overall

# PASS — Listing Detail Alpha implemented
