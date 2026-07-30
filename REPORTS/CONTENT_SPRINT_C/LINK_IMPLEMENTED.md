# Content Sprint C — Internal Link Implementation

## Link graph coverage

| Edge | Implementation |
| --- | --- |
| Knowledge → Area | Article `related_links` to `/cities/{slug}` (e.g. retirement → Chiang Mai/Pattaya; area-selection → all four cities) |
| Knowledge → Project | Article `related_links` to `/projects` hub; project-facing guides (developer, condo, luxury) |
| Knowledge → Developer | Developer guide article links to `/developers` hub |
| Knowledge → Knowledge | Every article carries 3–5 related-article links |
| Area → Project | City pages render project grids; district pages link projects (existing framework) |
| Area → Knowledge | City `knowledge_links` + district knowledge-link block (buying guide, foreign ownership) |
| Project → Developer | Existing developer attribution retained |
| Project → Area | Existing district/city breadcrumbs retained |
| Project → Knowledge | NEW "Buyer guides" card in project sidebar (buying guide, foreign ownership, condo guide) |
| Developer → Project | Existing project listings retained |
| Developer → Knowledge | NEW knowledge-link block in developer FAQ section |

## Orphan prevention

- All 20 new articles are listed on the knowledge articles index (loader-driven) and cross-linked from at least two other articles; hub-and-spoke topics (visa/retirement/healthcare, tax family, buying-process family) form closed clusters.
- City pages are linked from the cities index, from knowledge articles, and from the sitemap.
- No page added in this sprint lacks at least one inbound and one outbound contextual link.

## Validation

- `test:internal-links` — PASS (related link targets resolve to real pages).
- Custom content-level scan of all `related_links` and `knowledge_links` paths against actual routes/slugs — all resolve.
- One broken slug found and fixed during QC: `luxury-condos-thailand` → `thailand-luxury-condo-guide` (2 files).
