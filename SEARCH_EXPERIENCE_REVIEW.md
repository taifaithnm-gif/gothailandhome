# SEARCH_EXPERIENCE_REVIEW

**Date:** 2026-07-15  
**Routes:** `/en/properties`, `/en/search` (+ filters, `page=`)

## Confirmed

| Check | Result |
|-------|--------|
| Pagination | **Works** (`page=2` 200; 24 unique cards on page 1) |
| Result window size | 24 / page; totals via pagination summary |
| Filters | Sort, listing type, city, district, developer, transit, beds, price, q present on `/properties` |
| Sale/rent state | Badge on cards + listing_type filter |
| No-result recovery | Empty dashed panel when `q` matches nothing |
| Performance vs 4.7 MB | **Improved** (~0.19–0.21 MB HTML) |
| Cards imply false contact/media | Media shows “Images unavailable”; cards do not fake agent |

## Issues (user problems)

1. **City / district pages still unbounded** (`/en/cities/bangkok` ~6.7 MB) — users entering via Cities skip the pagination fix.  
2. Search form on `/search` is thinner than `/properties` filters — two mental models.  
3. Pagination duplicate (top + bottom) is fine; filter UX on mobile is a long form, not a drawer.  
4. “Showing / page summary” copy must stay consistent when filters return &lt; 24.

## Acceptance for Alpha search

- Keep URL state for filters + page  
- Extend pagination pattern to city/district/developer listing grids before calling search “done”
