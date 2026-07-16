# PERFORMANCE_REPORT

**Milestone:** Phase 9 M5 — SEO + Performance Polish  
**Date:** 2026-07-16  
**Scope:** Homepage · Search · Listing · Project · Developer · District  
**Method:** Code-level LCP/CLS/a11y polish + prior Lighthouse baseline (`PERFORMANCE_AUDIT_REPORT.md`, 2026-07-15). Full Lighthouse CI not re-run in this milestone (A21 still backlog).

## Prior baseline (unchanged reference)

| Route | Perf | LCP | CLS | A11y | SEO |
|-------|-----:|----:|----:|-----:|----:|
| `/en` | 86 | 4.1 s | 0 | 100 | 100 |
| `/en/properties` | 58 | 9.0 s | 0 | 99 | 100 |

Root cause of properties score was historical full-inventory SSR. Pagination + shared search state already landed before M5; M5 does not reintroduce full-list HTML.

## M5 performance changes

| Area | Change | Intent |
|------|--------|--------|
| LCP images | `fetchPriority="high"` + explicit `sizes` on listing media when `priority`; project hero Image `sizes` + `fetchPriority` | Faster LCP candidate discovery |
| CLS | Keep fixed `aspect-ratio: 16/10` + width/height on listing frames | Reserve space before paint |
| Homepage / grids | Existing `imagePriorityCount` on lead cards retained | Limit eager loads |
| Search | Redirect-only (no results SSR) + `noindex` | Avoid duplicate heavy surface |
| Accessibility | Property card CTA `aria-label` includes listing title (A19) | Unique accessible names |
| Caching | Did **not** put `headers()` in root layout for `html lang` | Protect ISR/`revalidate` on public pages |

## Surface notes

| Surface | LCP candidate | CLS risk | Notes |
|---------|---------------|----------|-------|
| Homepage | Text hero (CSS gradient, no hero bitmap) | Low | No large LCP image dependency |
| Search | N/A (302/redirect to `/properties`) | N/A | Bookmark compatibility only |
| Properties index | First 3 card covers when present | Low (aspect locked) | Paginated page size |
| Listing detail | Gallery frame `priority` | Low | Missing media shows labelled placeholder |
| Project | Official hero when allowed; else labelled placeholder | Low | `unoptimized` only when real hero path exists |
| Developer / District | Text-forward centers | Low | No decorative invented photos |

## Accessibility polish (scoped)

- Breadcrumbs already expose `nav[aria-label=Breadcrumb]` + `aria-current`.
- Listing gallery thumbnails keep empty `alt` with descriptive button labels.
- Card “View” links now include the property title in `aria-label`.

## Honest remaining performance debt (RC2)

1. **A21** — wire Lighthouse CI budgets for `/`, `/properties`, `/projects/[slug]`.
2. **Remote listing images** — no CDN transform pipeline; third-party URLs remain `unoptimized`/`img` and can still dominate LCP when present.
3. **Filter option payloads** — properties page still ships capped project/developer option lists (~80 projects); further trim if TTFB regresses.
4. **Re-measure** properties Perf score after deploy; expect improvement vs 58 if pagination is live in production, but do not claim a new LH number without a fresh run.

## Verdict

M5 ships the CLS/LCP hygiene and a11y naming fixes for the six Alpha surfaces without inventing media or breaking cacheability. Treat Lighthouse numbers as **baseline pending RC2 re-measure**, not as newly certified scores.
