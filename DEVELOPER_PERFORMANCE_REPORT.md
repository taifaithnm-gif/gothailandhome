# DEVELOPER_PERFORMANCE_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.6 — Developer Detail Alpha  
**Tool:** Lighthouse 13.4.0 against `next start` on `127.0.0.1:3030`

## Measurements (laboratory only — not SLA targets)

### Dense — `/en/developers/ap-thailand`

| Metric | Value |
|--------|-------|
| Performance | 76 |
| Accessibility | 93 |
| LCP | 5.0 s |
| CLS | 0 |
| FCP | 3.0 s |
| HTML size | 144,667 bytes |
| Initial listing cards | 6 (≤3 sale + ≤3 rent) |

### Sparse — `/en/developers/singha-estate`

| Metric | Value |
|--------|-------|
| Performance | 76 |
| Accessibility | 93 |
| LCP | 5.0 s |
| CLS | 0 |
| FCP | 3.0 s |
| HTML size | 92,506 bytes |
| Initial listing cards | 0 |

## Bounds applied

- `DEVELOPER_LISTING_PREVIEW_SIZE = 3` per sale/rent
- `DEVELOPER_PROJECT_PREVIEW_SIZE = 6`
- No full listing catalog serialization
- Placeholder logos not loaded as heavy media (neutral CSS mark)

## Overall

# PASS — Performance measured with bounded sections
