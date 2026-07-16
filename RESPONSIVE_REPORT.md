# RESPONSIVE_REPORT

**Milestone:** Phase 12 — Product Perfection · Wave 1  
**Date:** 2026-07-17  
**Breakpoints exercised:** Mobile (~390), Tablet (~768), Desktop (≥1024)

## Method

- Live production HTML crawl of public routes  
- Cursor browser snapshot at mobile device metrics + desktop restore  
- Source review of grid/`lg:`/`md:` header visibility rules

## Header / navigation

| Width | Expected | Observed |
|-------|----------|----------|
| &lt; `lg` | Hamburger | Menu button present; primary links in drawer |
| ≥ `lg` | Primary link row | Links visible |
| ≥ `md` | Language switcher in bar | Present |
| &lt; `md` | Language in drawer | Present in mobile menu |

## Layout results

| Surface | Mobile | Tablet | Desktop | Notes |
|---------|--------|--------|---------|-------|
| Home hero | Fixed | OK | OK | Was clipping search via forced `min-h-[78vh]`; now `md:min-h-[72vh]` |
| Home sections | Stack → 2 → 3 cols | OK | OK | Standard progressive grids |
| Properties | Filters stack | OK | OK | Heavy HTML payload remains a perf concern (not a layout break) |
| Project detail | Single column → split | OK | OK | `lg:grid-cols-[1.15fr_0.85fr]` |
| Developer detail | OK | OK | OK | |
| District | OK | OK | OK | |
| Knowledge | Cards 1→2→3 | OK | OK | |
| Marketplace forms | Full width fields | OK | OK | |
| Footer | 1 → 3 columns | OK | OK | |

## Issues found

| ID | Severity | Issue | Action |
|----|----------|-------|--------|
| R1 | Medium | Home hero short-viewport cutoff | **Fixed** |
| R2 | Low | Desktop nav horizontal overflow at mid-`lg` widths | Backlog (no redesign) |
| R3 | Info | Listing media empty states dominate mobile card height | Data/media; honest empty state kept |

## Overflow / scroll

- No broken internal targets from homepage crawl.  
- Sticky header (`z-40`) behaves; mobile drawer opens below header.  
- Body uses fixed decorative gradients — no horizontal page scroll observed on audited templates.
