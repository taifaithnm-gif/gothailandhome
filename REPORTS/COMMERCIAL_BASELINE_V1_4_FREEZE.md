# COMMERCIAL_BASELINE_V1_4 — FROZEN

**Date:** 2026-08-10  
**Status:** APPROVED AND FROZEN  
**Maintenance Mode:** ACTIVE  
**Production commit:** `8c23e44`  
**Production deployment:** `dpl_7Fi9ybzQL7ckDQmq37XC8C8pm9mF`  
**Rollback target:** `77af666` (`dpl` prior production / build-info at V1_3)

## Delta from V1_3

WEBSITE_QUALITY_SPRINT_02 closed the six remaining visitor-facing defects from
`REPORTS/WEBSITE_QUALITY_PRODUCTION_REVIEW_V2/`:

1. Image fallback presentation (developer logo `object-contain`)
2. LINE / WeChat QR interaction (verified destinations only)
3. Bangkok page size (capped district list + reduced repetitive render)
4. Facility / status localization (EN / ZH / TH fixed vocabulary)
5. Bangkok duplicate intro paragraph removed
6. Favorites duplicate retention paragraph removed

Plus gate restore: Knowledge → Project → Contact journey bridge shipped to production.

## Measurements (production)

| Metric | Before | After |
|--------|--------|-------|
| Bangkok body characters | 360912 | ~13014 |
| Bangkok district links (initial) | uncapped / review ~394 placeholders | 12 |

## Gates

- INTERNAL_ARTIFACTS = 0
- BROKEN_IMAGES / EMPTY_IMAGE_BLOCKS = 0
- CARD_INTERACTION = PASS
- DESKTOP_NAVIGATION = PASS
- KNOWLEDGE_TO_PROJECT = PASS
- PROJECT_TO_CONTACT = PASS
- EN / ZH / TH = PASS
- Chromium + WebKit × Desktop / Tablet / Mobile = PASS

## Next

`CLAUDE_FINAL_VISITOR_QA` — do not start Sprint 03 automatically.
