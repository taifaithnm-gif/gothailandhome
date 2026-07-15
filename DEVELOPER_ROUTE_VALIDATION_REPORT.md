# DEVELOPER_ROUTE_VALIDATION_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.6 — Developer Detail Alpha  
**Base URL:** `http://127.0.0.1:3030`

## Result

| Metric | Value |
|--------|-------|
| Expected packages | 20 |
| Checked | 20 |
| Non-500 (OK) | **20/20** |
| Failures | 0 |
| Checked at | 2026-07-15T16:19:15.266Z |

Command: `BASE_URL=http://127.0.0.1:3030 npm run test:developer-routes`

## Multilingual spot checks

| Locale | Route | Status |
|--------|-------|--------|
| en | `/en/developers/ap-thailand` | 200 |
| zh | `/zh/developers/ap-thailand` | 200 |
| th | `/th/developers/ap-thailand` | 200 |

## Sample sizes

| Developer | Bytes | Listing cards | Neutral logo |
|-----------|------:|--------------:|:------------:|
| ap-thailand (dense) | 144,667 | 6 | yes |
| singha-estate (sparse) | 92,506 | 0 | yes |
| capitaland-thailand | 89,804 | — | yes |

All 20 routes returned 200. Aggregate ~90–147 KB HTML.

## Overall

# PASS — 20/20 developer routes
