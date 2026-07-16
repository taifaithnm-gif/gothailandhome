# UI_CONSISTENCY_REPORT

**Milestone:** Phase 12 — Product Perfection · Wave 1  
**Date:** 2026-07-17

## Design tokens in use

| Token | Role |
|-------|------|
| `--brand` / `--brand-deep` / `--brand-gold` | Primary actions, header/footer, accents |
| `--brand-soft` / `--brand-line` | Surfaces and dividers |
| `font-heading` + `ds-h1`/`ds-h2` | Section hierarchy |
| `ds-container` / `ds-section` | Page rhythm |
| `buttonVariants` | Primary / secondary / ghost |

## Consistency findings

| Area | Status | Detail |
|------|--------|--------|
| Page shells | Consistent | Marketplace/knowledge/about use `PageShell` + breadcrumbs |
| Cards | Mostly consistent | `ProjectCardShell` / `DeveloperCardShell` / `SurfaceCard` / property cards share radius + border language |
| Buttons | Consistent | Shared `Button` / `buttonVariants`; gold CTA only on home Find My Home (intentional emphasis) |
| Form fields | Consistent | Shared `Field` / `Input` / `Select` |
| Section headers | Improved | `viewAll` no longer incorrectly says “listings” on non-listing sections |
| Footer IA | Improved | Partners label now matches a partners route |
| Mobile nav labels | Improved | Section captions localized |
| About notice | Improved | Placeholder MVP banner removed |

## Remaining inconsistencies (backlog)

1. **Primary nav density** — 12+ desktop links; overflow scroll at `lg` feels crowded vs footer grouping.  
2. **Search in primary nav** — behaves as redirect helper; label suggests a destination page.  
3. **Project vs listing cards** — projects often text-only; listings use media frame with empty state — acceptable honesty, but visual weight differs.  
4. **Hardcoded BTS/MRT option labels** in home hero search (`BTS`/`MRT` English literals) while surrounding UI is localized.  
5. **Footer Explore includes Search** — same redirect helper as header.

## Animation

Hover translate on district cards (`hover:-translate-y-0.5`) and button active nudge are the only motion patterns observed — light and consistent. No conflicting animation systems found.
