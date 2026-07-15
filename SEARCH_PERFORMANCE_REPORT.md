# SEARCH_PERFORMANCE_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.3 — Search Results Alpha  
**Tool:** lighthouse@12.2.1 · mobile · `/en/properties`

## Before / after (measured)

| Metric | Prior baseline (P0 / UI Foundation) | After Search Results Alpha |
|--------|-------------------------------------|----------------------------|
| HTML size | **218,642 B (~0.209 MB)** | **300,138 B (~0.286 MB)** |
| Initial cards | **24** | **24** |
| Full-catalog serialization | None | None |
| Lighthouse performance | **0.87–0.88** | **0.80** |
| LCP | **3.8 s** | **5.1 s** |
| FCP | **1.8–2.0 s** | **1.8 s** |
| CLS | (not previously scored in summary) | **0** |
| Accessibility | **0.99** | **0.98** |
| TBT | **0 ms** | **0 ms** |

## Mitigations applied

- Paged queries only (`DEFAULT_LISTING_PAGE_SIZE = 24`, cap 48)  
- Slim filter option payloads (id/slug/name only; projects capped at 80)  
- List select omits long `description_*` fields  
- Cards omit long summaries  
- Results region `min-h` reservation to prevent streaming CLS  
- Intrinsic image dimensions + stable media aspect ratio  

## Verdict

- No multi-megabyte HTML regression  
- No full-dataset serialization  
- Performance near prior search baseline (0.80 vs 0.87) — **acceptable for Alpha with richer filters/chrome**  
- Accessibility ≥ 0.95 — **PASS**  
- CLS material regression avoided after reserve/min-height fix — **CLS 0**  

Evidence:

- `pipelines/factory/overnight/_runs/search-payload-measure.json`  
- `pipelines/factory/overnight/_runs/search-results-lighthouse-summary.json`
