# RC2_PERFORMANCE_VALIDATION

**Date:** 2026-07-16  
**HEAD:** `e3a5a9a`  
**Method:** Code/HTML probes on local `next start` + prior lab Lighthouse (RC1). **No new Lighthouse CI run claimed as SLA.**

## HTML payload probes (RC2 local)

| Path | Approx HTML bytes | Notes |
|------|------------------:|-------|
| `/en` | ~477 KB | Dense home; no full inventory dump |
| `/en/properties` | ~319 KB | Paginated (vs historical ~4.7 MB) |
| `/en/buy` / `/en/rent` | ~170 KB | Preview landings |
| `/en/projects/ashton-asoke` | ~203 KB | Project center |
| `/en/developers/sansiri` | ~168 KB | Developer center |
| `/en/districts/watthana` | ~214 KB | District center |
| `/en/marketplace` | ~69 KB | Hub |

## Prior Lighthouse lab (RC1 reference — not re-certified)

| Page | Perf | A11y | SEO | LCP | CLS |
|------|-----:|-----:|----:|-----|-----|
| `/en` | 76 | 100 | 100 | ~5.1s | 0 |
| `/en/properties` | 84 | 98 | 100 | ~4.2s | 0 |
| `/en/projects/ashton-asoke` | 75 | 93 | — | ~5.3s | 0 |

## M5 mitigations present

- Listing media: reserved `aspect-ratio`, `width`/`height`, `sizes`, `fetchPriority` when priority  
- Project hero: `priority` + `sizes` + `fetchPriority`  
- Search no longer SSR-duplicates the full results surface  
- Card CTA unique `aria-label`s (a11y naming)

## Verdict

**PASS WITH ACTIONS** for Alpha — payloads are healthy relative to pre-pagination Alpha, but Core Web Vitals / Lighthouse budgets are **not** claimed. **P1/P2:** re-measure lab scores; add Lighthouse CI (A21); CDN image pipeline remains open.
