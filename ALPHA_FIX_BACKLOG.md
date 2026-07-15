# Alpha Fix Backlog

**Date:** 2026-07-15  
**Baseline:** `platform-alpha-data-freeze-v1` @ `8cd3595`  
**Rule:** Documentation only in this phase — implementation starts in a later task.

Priority key: **P0** blocker · **P1** required before public alpha · **P2** important after alpha · **P3** optional  
Complexity: **S / M / L / XL**

## Recommended implementation order

1. P0 project detail crash  
2. P0 inventory pagination / payload cut  
3. P0 listing media / honest empty states  
4. P1 robots/noindex admin + sitemap marketplace routes  
5. P1 nav IA trim + Buy/Rent landings  
6. P1 listing agent coverage strategy  
7. P1 JSON-LD + html lang  
8. P1 loading/error UI  
9. P2 content/DB stub hygiene + Knowledge  
10. P3 consumer dashboards / enhancements

---

## Backlog items

| ID | Action | Pri | Size | Dependencies | Files likely affected |
|----|--------|-----|------|--------------|------------------------|
| A1 | Guard POI/`name` i18n on project pages so undefined locales do not 500; add regression test for all 50 slugs | P0 | M | Project content POI shape | `src/app/[lang]/projects/[slug]/page.tsx`, `src/lib/data/projects.ts`, tests |
| A2 | Paginate `/properties`, `/search`, city/district listing grids (server + UI); cap SSR cards | P0 | L | Query API, cache | `src/app/[lang]/properties/page.tsx`, `search/page.tsx`, `cities/[slug]/page.tsx`, `lib/data/properties.ts`, card grid components |
| A3 | Ensure listing media pipeline or explicit no-photo state; stop empty gradient-as-photo without label | P0 | L | `property_media`, CDN | property detail/card components, media loaders, optional import scripts (**no harvest in freeze**) |
| A4 | Add branded `error.tsx` / `loading.tsx` under `[lang]` (and project segment) | P1 | S | None | `src/app/[lang]/error.tsx`, `loading.tsx`, possibly `projects/[slug]/error.tsx` |
| A5 | Disallow/noindex `/admin`; harden admin titles | P1 | S | robots + metadata | `src/app/robots.ts`, `src/app/admin/layout.tsx` |
| A6 | Add marketplace routes to sitemap (find-my-home, list-your-property, partners/*) | P1 | S | siteConfig | `src/app/sitemap.ts` |
| A7 | Trim header IA; separate Buy/Rent entry points; demote Search; surface Partners carefully | P1 | M | i18n dictionaries | `site-header.tsx`, `site-footer.tsx`, dictionaries, optional new buy/rent pages |
| A8 | Set `<html lang>` correctly per locale (avoid EN hardcode) | P1 | M | Next root layout constraints | `src/app/layout.tsx`, `[lang]/layout.tsx` |
| A9 | Add JSON-LD for Organization, listings, projects, breadcrumbs | P1 | M | metadata helpers | new `components/seo/*`, listing/project pages |
| A10 | Listing contact coverage plan: map agents where known OR show source-broker CTA — never Apple-as-owner | P1 | L | agents table, adapters policy | `properties` agent_id backfill scripts (careful), ListingContactCard copy |
| A11 | Deduplicate Properties vs Search UX (one canonical results surface) | P1 | M | A2, A7 | search/properties pages |
| A12 | Improve Find My Home / List Property success receipts + progressive disclosure | P1 | M | marketplace actions | marketplace form components |
| A13 | Clarify Contact vs Find My Home vs viewing-request routing on Contact page | P1 | S | copy | `contact/page.tsx`, dictionaries |
| A14 | Replace/omit homepage links to known-crash project slugs until A1 lands | P1 | S | project publish flags | home page featured query |
| A15 | Align DB developers/projects supersets with content master (23→20, 52→50) without touching listing sources | P2 | M | data stewardship | DB cleanup scripts, publish flags |
| A16 | District index page + breadcrumbs | P2 | M | geography | new districts index route |
| A17 | Knowledge/glossary public routes from `content/glossary` | P2 | L | editorial workflow | new knowledge app routes |
| A18 | Reduce placeholder project blurbs; deepen verified official copy only where sourced | P2 | L | Phase 7 rules | project content packs (**no fake fill**) |
| A19 | Image alt / repeated “View details” link names improvement | P2 | S | cards | `property-card.tsx` |
| A20 | Mobile nav information architecture (“More” drawer) | P2 | M | A7 | `site-header.tsx` |
| A21 | Lighthouse CI budgets for `/`, `/properties`, `/projects/[slug]` | P2 | M | CI | GitHub Action / package scripts |
| A22 | Consumer dashboards for lead status | P3 | XL | auth product | new app areas |
| A23 | Billing / lead resale | P3 | XL | explicitly out of M1 | — |
| A24 | Full WCAG manual audit + axe CI | P3 | M | A8 | test tooling |

---

## P0 acceptance criteria (public alpha gate)

- [ ] All 50 content project slugs return HTTP 200 (or intentional 404), never 500.
- [ ] `/en/properties` first page LCP ≤ 3.5s on Lighthouse mid mobile profile (or documented waiver).
- [ ] Listing cards/detail never impersonate Apple as owner/agent.
- [ ] Integrity still n=1315 with baseline hash unchanged.

## Notes

- Do **not** harvest or mutate the 1,315 source records to “fix” UI issues.
- Prefer crash-safety and pagination before visual redesign.
