# PROJECT_PAGE_REVIEW

**Date:** 2026-07-15  
**Samples:** `/en/projects/ashton-asoke` (rich), `/en/projects/ideo-rama-9` (thin), `/zh/projects/ashton-asoke`

## Confirmed

| Check | Result |
|-------|--------|
| 50/50 routes render | **Pass** (prior P0 route check; samples 200) |
| Facilities/POI crash | Fixed (flat facilities normalized) |
| Listings separated from project facts | Sale/rent lists under dedicated section |
| Missing project data | Thin projects still render without inventing POIs |
| Lead form as ownership claim | Lead is “project enquiry” — monitor copy so it does not equal “we are the developer” |

## Verification labeling

Pages do **not** consistently badge facts as OFFICIAL / VERIFIED_PORTAL / DERIVED / UNVERIFIED. Generic descriptions (“real Bangkok project… omitted until separately sourced”) appear for many cards/home tiles — honest about thin data, but **trust taxonomy is under-exposed**.

## User problems

1. Hard to tell which specs are developer-official vs portal-derived.  
2. Listing prices on project page need persistent source link visibility (present when `listing_url` exists).  
3. Hero placeholders vary; not always “unavailable” labeled like listing media frame.
