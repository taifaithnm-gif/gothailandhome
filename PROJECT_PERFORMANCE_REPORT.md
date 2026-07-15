# PROJECT_PERFORMANCE_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.5 — Project Detail Alpha  
**Tool:** Lighthouse 13.4.0 (headless Chrome) against `next start` on `127.0.0.1:3020`

## Measurements (do not treat as SLA targets)

### Dense — `/en/projects/ashton-asoke`

| Metric | Value |
|--------|-------|
| Performance | 77 |
| Accessibility | 93 |
| LCP | 5.0 s |
| CLS | 0 |
| TBT | 0 ms |
| FCP | 2.9 s |
| HTML size | 182,117 bytes |
| Initial listing cards | 6 |

### Sparse — `/en/projects/168-sukhothai-residences`

| Metric | Value |
|--------|-------|
| Performance | 76 |
| Accessibility | 93 |
| LCP | 5.1 s |
| CLS | 0 |
| TBT | 0 ms |
| FCP | 3.0 s |
| HTML size | 99,591 bytes |
| Initial listing cards | 0 |

## Notes

- Listing sections are bounded (`PROJECT_LISTING_PREVIEW_SIZE = 3` per sale/rent).
- Full project listing catalogs are **not** serialized into the first HTML response.
- No loading.tsx Suspense thin-fallback was added for this route (prior listing CLS lesson).
- Scores are laboratory measurements only — not claimed production budgets.

## Overall

# PASS — Performance measured with bounded listings
