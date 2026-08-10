# WEBSITE_QUALITY_SPRINT_02

**Baseline in:** `COMMERCIAL_BASELINE_V1_3`  
**Baseline out:** `COMMERCIAL_BASELINE_V1_4`  
**Date:** 2026-08-10

## Tasks (6/6)

1. Image fallback — developer logos use `object-contain` letterboxing  
2. LINE / WeChat — verified QR destinations from existing assets; QR clickable + scan hint  
3. Bangkok page size — amenity/listing previews + district show-more (12 initial)  
4. Facility/status localization — `facilityTags` + `projectStatuses` EN/ZH/TH  
5. Bangkok duplicate intro — overview rendered once  
6. Favorites duplicate — retention note once (PageShell only)

## Measurements

| Metric | Before (prod) | After (local) |
|--------|---------------|---------------|
| Bangkok body characters | 360912 | 12971 |
| District links initial | 50 (uncapped) | 12 |

## Gates

Chromium + WebKit × Desktop/Tablet/Mobile — PASS  
Build — PASS  
Buyer journey Knowledge→Project→Contact — PASS  

Evidence: `REPORTS/WEBSITE_QUALITY_SPRINT_02/evidence/`
