# HOMEPAGE_REVIEW

**Date:** 2026-07-15  
**Route:** `/en`, `/zh`, `/th`  
**Credible for public Alpha?** **No** — functional discovery shell, not a trustworthy public launch homepage.

## Current sections (observed)

1. Brand + gradient hero + keyword/city/type search + Buy/Rent/Investment shortcuts  
2. Featured projects (thin sourced blurbs)  
3. Latest listings (missing images)  
4. Cities strip  
5. Developers grid (includes seed placeholders e.g. Andaman Homes / Sathorn Living / Northern Estate)  
6. Buy sample cards  
7. Rent sample cards  
8. Investment teaser  
9. Help shortlist CTA  
10. Footer  

## Remain

- Brand-first hero with one search CTA  
- Language switcher  
- Clear Buy / Rent entry points  
- Small “latest verified listings” proof of real inventory  
- Cities entry (Bangkok first)  

## Remove or demote before public Alpha

- Full developer dump on homepage (move to `/developers`)  
- Seed/demo developer cards with example.com-era stubs  
- Repeated “View all listings” blocks that dilute one primary CTA  
- About-page-level MVP disclaimer tone leaking into home subcopy if still present elsewhere  

## Reorder (recommended)

1. Hero (brand + one headline + search)  
2. Trust strip (counts: listings/projects/sources — honest)  
3. Buy / Rent pathways  
4. Featured projects (6 max, real covers when available)  
5. Featured listings (6 max)  
6. Cities  
7. Help / Find My Home  
8. Partners teaser (not full directory)  

## Missing Alpha-required sections

- Explicit data sourcing statement (“public portal prices; not a brokerage”)  
- Clear “no listing agent on file → platform help” explainer  
- Coverage/limitation honesty (Bangkok Wave-1 bias)  
- Media/contact limitation notice  

## CTAs

| Priority | CTA |
|----------|-----|
| Primary | Search / Properties (Buy or Rent chosen) |
| Secondary | Find My Home **or** Contact platform help — not both equally |

## Mobile section order

Hero → search → Buy/Rent → 3 listings → 3 projects → cities → help. Defer developers.

## Data dependencies

Homepage still calls **unbounded** `listPublishedProperties` multiple times then slices client-side (perf/debt vs paginated `/properties`). Cities/devs/projects lists are additional.

## User problem if left as-is

Visitors cannot tell what GoThailandHome *is* (index vs agency), see mostly unavailable images, and may confuse platform CS for brokers later in the funnel.
