# KNOWN_LIMITATIONS

**As of:** Platform Alpha RC1 (`platform-alpha-rc1`) — 2026-07-16

## Product / data

1. **Package vs UI/DB drift** — Content packages total **1,315** verified source listings; previously observed published UI/DB total **1,318**. Drift is documented; RC1 does not reconcile or delete the 3 rows.
2. **Developer logos** — All 20 Developer Master logos remain **PLACEHOLDER**. UI uses a neutral mark; placeholders are not treated as trademarks.
3. **Factory-linked portfolios** — Developer/project lists on GoThailandHome are platform-linked subsets, not claimed complete official portfolios (unless an OFFICIAL label applies).
4. **District pages** — Functional but **not** Redesigned under District Detail Alpha (not started).
5. **Marketplace forms** — Present as Alpha capture surfaces; not a completed partnership/ops workflow.
6. **Evidence gaps** — Many project/developer fields remain PARTIAL / UNVERIFIED / FACTORY by design; unavailable stays unavailable.
7. **Sitemap listing coverage** — `listPublishedProperties` used by `sitemap.ts` is subject to Supabase/PostgREST default row caps (~**1000** listing URLs per locale observed vs ~1318 published). Not a silent invent — incomplete SEO coverage until paged sitemap generation.
8. **Maps** — Verified coordinates linked out; no embedded map product SLA.
9. **Media** — Many listings/projects use neutral missing-image states when rights-cleared media is absent.
10. **Performance** — Lab LCP often ~4–5s on dense pages; CLS measured 0 in RC1 samples. Not marketed as Core Web Vitals budgets.

## Representation

- GoThailandHome aggregates verified marketplace data.  
- Apple is **Platform Customer Success only** — never listing agent / project sales / developer sales.  
- Official developer representation is **not** claimed unless a verified partnership exists.

## Localization

- EN / ZH / TH routes exist for Alpha surfaces.  
- Some harvested titles/descriptions remain source-language-heavy (expected for portal-sourced listings).

## Environment

- RC1 acceptance was run against **local** `next start`, not the live CDN deployment gate.
