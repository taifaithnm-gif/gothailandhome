# Mobile Audit Report

**Date:** 2026-07-15  
**Viewport tested:** 390×844 (CDP device metrics) + desktop comparison.

## Passes

- Sticky header with hamburger (`aria-expanded`, `aria-controls`).
- Hero search fields stack vertically inside white card.
- Buy/Rent/Investment chips wrap as compact pills.
- Marketplace forms use responsive 1→2 column grids.
- Viewport meta present (`width=device-width`).
- Lighthouse accessibility on home scored **100** (desktop LH run); properties **99**.

## Defects

| Defect | Evidence | Priority |
|--------|----------|----------|
| Inventory pages too heavy for mobile networks | `/en/properties` LCP ~9s (LH), multi-MB HTML | P0 |
| Project detail crashes | 33/50 500 — mobile users hit error docs | P0 |
| Missing listing photos | Detail shows gradient only | P0 |
| Mobile menu retains full desktop IA | High cognitive load after open | P1 |
| Language switcher less prominent on small screens | Competes with hamburger workflow | P2 |
| Long Find My Home form | Requires significant scroll before submit | P2 |
| Date field placeholder locale quirks | EN page showed CJK date placeholder in UI | P2 |
| Featured projects may appear sparse without scrolling | Mobile screenshot below-fold emptiness | P2 |

## Touch / interaction

- Menu button size adequate.
- Primary Search button full-width on mobile — good.
- Listing contact form inputs are large enough.

## Recommendations (later)

1. Paginate results aggressively on mobile (≤12/page).
2. Slim mobile nav to Buy/Rent/Projects/Find/More.
3. Prioritize photo loading for above-fold listing cards.
4. Brand the error state for failed project pages.
