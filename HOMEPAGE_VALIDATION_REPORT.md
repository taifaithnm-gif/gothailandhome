# HOMEPAGE_VALIDATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.2 — Homepage Alpha

## Gates

| Gate | Result |
|------|--------|
| TypeScript (`npm run typecheck`) | PASS |
| Lint (`npm run lint`) | PASS (0 errors; pre-existing pipeline warnings) |
| Tests (`npm test`) | PASS (contact, integrity, project content, pagination, ui-foundation) |
| Production build (`npm run build`) | PASS |
| Listing integrity n=1315 | PASS |
| Contact-role / Apple invariants | PASS |
| Multilingual `/en` `/zh` `/th` | PASS HTTP 200 |
| Navigation from homepage CTAs | PASS (`/find-my-home`, `/list-your-property`, `/partners/*`, `/contact`, `/about`, `/properties`) |
| Seed demo developers on homepage | PASS (filtered out) |
| Accessibility (Lighthouse mobile `/en`) | **1.00** |
| Performance (Lighthouse mobile `/en`) | **0.75** · LCP **5.1 s** · FCP **3.2 s** · TBT **10 ms** |
| Responsive | Viewport meta + mobile drawer (`lg` breakpoint) + `.ds-container` gutters |
| Schema / listing package changes | None |
| Harvest / deploy | None |

## Content honesty checks

| Check | Result |
|-------|--------|
| Not-a-brokerage copy | Present (en/zh/th) |
| No invented testimonials/awards | Present (Knowledge explicitly declines inventing them) |
| Platform CS + AI Concierge blocks | Present via foundation components |
| Apple never labeled listing agent | Covered by contact-role tests + home Platform Support section |

## Performance note

UI Foundation baseline was **`/en/properties`** mobile performance **0.87** / a11y **0.99**. Homepage is a different, content-heavier route. Practical mitigations applied: paged listings (6), Bangkok-scoped project/district queries, capped project select payload (40), single priority listing image. Further LCP work is backlog (font/media strategy), not a listing-data change.

Evidence: `pipelines/factory/overnight/_runs/homepage-lighthouse-summary.json`

## Overall

# PASS
