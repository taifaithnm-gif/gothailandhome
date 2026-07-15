# TECHNICAL_DEBT

**As of:** Platform Alpha RC1 — 2026-07-16

## Priority legend

- **P0** — Blocks trust, correctness, or ship — none open for RC1 critical path  
- **P1** — Should fix before broad production marketing / SEO scale  
- **P2** — Important polish / scale / DX  
- **P3** — Nice-to-have cleanup  

## Backlog

| ID | Pri | Item | Notes |
|----|-----|------|-------|
| TD-01 | P1 | Sitemap listing pagination | `sitemap.ts` uses unbounded `listPublishedProperties`; ~1000 URLs/locale observed vs ~1318 published |
| TD-02 | P1 | UI/DB vs package reconciliation | Documented 1,318 vs 1,315; needs ops/data decision, not silent deletes |
| TD-03 | P2 | Homepage HTML weight | `/en` ~460KB HTML observed; further section bounding / streaming review |
| TD-04 | P2 | Lab LCP | Homepage/project LCP ~5s in Lighthouse; image/font priority pass |
| TD-05 | P2 | District Detail Alpha | Pages live but not Alpha-redesigned |
| TD-06 | P2 | `listPublishedProperties` callers | Prefer paged APIs everywhere (sitemap is the remaining heavy caller) |
| TD-07 | P2 | Developer similar-dev query cost | Acceptable at n=20/50; revisit if universe grows |
| TD-08 | P3 | Prettier drift | `format:check` reports hundreds of files; style-only, non-runtime |
| TD-09 | P3 | Pipeline lint warnings | Unused disable / unused var in factory harvest scripts |
| TD-10 | P3 | Overnight `_runs` artifacts | Route-check JSON can dirty status if regenerated; keep out of feature commits |
| TD-11 | P2 | Official logo rights clearance | Replace PLACEHOLDER logos when legal assets available |
| TD-12 | P2 | Marketplace form ops | Review queues, email, verification workflow incomplete |

## Completed (no longer debt)

- Unbounded listing grids on Project/Developer detail first HTML — replaced with paged previews  
- Contact role coupling of Apple into listing/developer sales UI — invariant-tested  

## Guidance

Do not treat this list as permission to change listings, evidence classifications, or schemas without an explicit milestone.
