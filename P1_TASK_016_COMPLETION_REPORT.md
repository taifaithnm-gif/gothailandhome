# Phase 1 Task 016 Completion Report

**Date:** 2026-07-19  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` — working tree only; no commit, push, or deploy

## Task ID

**P1-16** — Favorites controls and localized favorites page

## Objective

Expose save/remove controls on cards/detail and a page listing saved
properties.

## Files modified

1. `src/components/favorites/favorites-provider.tsx` — hydration-safe
   `FavoritesProvider` / `useFavorites` via `useSyncExternalStore` over the
   P1-15 local-device contract.
2. `src/components/favorites/favorite-button.tsx` — save/remove control with
   `aria-pressed`, live region, and `data-favorite-state`.
3. `src/components/favorites/favorites-board.tsx` — client board: resolve
   slugs, empty/unavailable UI, prune missing published inventory.
4. `src/app/[lang]/favorites/page.tsx` — localized favorites page + metadata.
5. `src/app/[lang]/favorites/actions.ts` — `resolveFavoriteProperties` server
   action (published-only resolution).
6. `src/lib/data/properties.ts` — `getPublishedPropertiesBySlugs`; re-exports
   client-safe `PropertyView` / `formatPrice`.
7. `src/lib/property/property-view.ts` — client-safe `PropertyView` type and
   `formatPrice` (keeps cards/board off `server-only` data loaders).
8. `src/components/property/property-card.tsx` — FavoriteButton on card media;
   client boundary so favorites board can reuse cards.
9. `src/app/[lang]/properties/[id]/page.tsx` — FavoriteButton on listing key
   summary.
10. `src/app/[lang]/layout.tsx` — wraps locale shell with `FavoritesProvider`.
11. `src/lib/navigation/site-nav.ts` — `/favorites` browse nav entry.
12. `src/app/sitemap.ts` — `/favorites` path inventory.
13. `src/dictionaries/en.json` / `zh.json` / `th.json` — `nav.favorites`,
    `meta.favorites*`, `favorites.*` copy.
14. `scripts/test-favorites-ui.mjs` — P1-16 acceptance contract suite.
15. `package.json` — `test:favorites-ui` wired into `npm test`.
16. `P1_TASK_016_COMPLETION_REPORT.md` — this report.

P1-15 contract (`src/lib/favorites/index.ts`) is reused unchanged in behavior;
UI only consumes it.

## Functional changes

- Accountless save/remove on property cards and property detail.
- Controls announce pressed/saved state; provider hydrates without
  server/client storage mismatch (`getServerSnapshot` empty).
- Localized `/[lang]/favorites` lists published matches via server action;
  missing/unpublished slugs show as unavailable and are pruned from storage.
- Empty state with browse CTA; local-device retention note surfaced.
- EN/ZH/TH metadata and nav labels; sitemap includes `/favorites`.

## Routes/components affected

- `/[lang]/favorites` — new favorites page (EN/ZH/TH SSG).
- Components: `FavoritesProvider`, `FavoriteButton`, `FavoritesBoard`,
  `PropertyCard` (control + client-safe view helpers).
- Property detail key summary hosts FavoriteButton.
- Site nav browse group and sitemap inventory.

Preserved: P1-15 favorites state contract; homepage conversion; listing
filters/results; property card decision fields; property detail trust;
property media; project/developer/district detail flows; accessibility;
responsive behavior; navigation; metadata; canonical; hreflang; JSON-LD.
No Windows01, live collectors, OCR, embeddings, AI runtime, or production
config changes.

## Task-specific verification

**PASS** — `npm run test:favorites-ui` exited 0:

- controls announce state and are hydration-safe
- cards and detail expose save/remove controls
- page empty/unavailable and prune contracts
- nav + layout + sitemap wiring
- P1-15 contract remains local-device only
- EN/ZH/TH metadata and copy keys

Related targeted suites also passed:

- `npm run test:favorites-state`
- `npm run test:property-card`
- `npm run test:navigation`

## Typecheck result

**PASS** — `npm run typecheck` exited 0.

## Lint result

**PASS** — `npm run lint` exited 0.

## Test result

**PASS** — `npm test` exited 0, including `test:favorites-ui`,
`test:favorites-state`, and all previous P0/P1 aggregate tests.

## Build result

**PASS** — `npm run build` exited 0; Next.js 16.2.10 compiled and generated
routes including `/[lang]/favorites` (en/zh/th).

The pre-existing non-fatal Turbopack NFT trace warning through
`src/lib/knowledge/glossary.ts` remains and was not introduced by P1-16.

## Remaining P1 tasks

**20 tasks remain; none started by this task:**

- M3: P1-17–P1-21
- M4: P1-22–P1-28
- M5: P1-29–P1-32
- M6: P1-33–P1-36

**Stopped after P1-16.** P1-17 not started.
