# Performance Audit Report

**Date:** 2026-07-15  
**Tooling:** Lighthouse 13.4 (headless Chrome) + raw HTML size probes on production server.

## Lighthouse — Home `/en`

| Category | Score |
|----------|------:|
| Performance | **86** |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

| Metric | Value |
|--------|-------|
| FCP | 1.7 s |
| LCP | 4.1 s |
| TBT | 0 ms |
| CLS | 0 |
| SI | 2.5 s |
| TTI | 4.1 s |

## Lighthouse — Properties `/en/properties`

| Category | Score |
|----------|------:|
| Performance | **58** |
| Accessibility | 99 |
| SEO | 100 |

| Metric | Value |
|--------|-------|
| FCP | **7.1 s** |
| LCP | **9.0 s** |
| TBT | 10 ms |
| CLS | 0 |
| SI | 7.1 s |
| TTI | 9.1 s |
| Server response | ~510 ms |
| LH total byte weight | ~1,530 KiB (compressed transport); uncompressed HTML probe ~4.7MB |

## Other size probes (uncompressed HTML)

| Path | Approx size |
|------|-------------|
| `/en` | ~113 KB |
| `/en/properties` | ~4.7 MB |
| `/en/search` | ~4.7 MB |
| `/en/cities/bangkok` | ~4.8 MB |
| `/en/projects` | ~103 KB |
| `/en/properties/{id}` sample | ~62 KB |

## Root causes (inferred, no code changes)

1. Inventory routes SSR the full published listing set into HTML cards.
2. Duplicate Properties/Search surfaces amplify the problem.
3. Missing image CDN pipeline means little LCP image optimization opportunity — but HTML/DOM dominate.

## Project page reliability impact

33/50 project details 500 → failed navigations count as UX performance failures even if TTFB is low.

## Alpha performance bar (recommended)

- Inventory HTML ≤ 300 KB uncompressed for first page.
- LCP ≤ 3.5 s on mid mobile on listing index.
- Project detail error rate = 0 for published slugs.

## Priority

Treat inventory weight + project 500s as **P0** before public alpha traffic.
