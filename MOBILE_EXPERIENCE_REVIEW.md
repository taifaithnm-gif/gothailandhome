# MOBILE_EXPERIENCE_REVIEW

**Date:** 2026-07-15  
**Basis:** Responsive layout inspection + prior mobile audits + local route payloads (desktop browser chrome used for screenshots).

## Findings

| Area | Assessment |
|------|------------|
| Hero search | Usable; stacked fields on small widths |
| Primary nav | Many items — likely overflow/hamburger; high cognitive load |
| Listing cards | Stable 16:10 media frame reduces CLS vs empty gradients |
| Listing detail | Contact + viewing form long on small screens; help CTA after form |
| Filters | `/properties` filter grid is heavy; no dedicated mobile sheet |
| City pages | **Critical:** multi-MB HTML hurts mobile LCP/transfer |
| Sticky CTAs | No misleading “Call agent” sticky observed |

## User problems to solve later

1. Reduce nav to Alpha essentials on small screens.  
2. Paginate or cap city/district/developer listing grids.  
3. Keep missing-image aspect stable (done) and avoid text-only late shifts.
