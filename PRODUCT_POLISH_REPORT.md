# PRODUCT_POLISH_REPORT

**Milestone:** Phase 12 — Product Polish · Wave 2  
**Date:** 2026-07-17  
**Lens:** First-time customer · product designer (not engineer)  
**Mode:** Premium polish only — no features · no deploy · no content harvesting  
**Baseline:** Wave 1 (`1c01f39`)

## Verdict: **READY FOR PRODUCT REVIEW**

Wave 2 tightened first-impression clarity, interaction honesty, and visual consistency across public surfaces. Layout structure is unchanged; only deterministic polish defects were fixed.

## First-time customer journey (reviewed)

| Step | Surface | First impression | Wave 2 action |
|------|---------|------------------|---------------|
| Land | Homepage | Brand + search clear; section CTAs readable | District title clarity; card hover/focus; hero transit labels |
| Find inventory | Properties / Buy / Rent | Filters usable; empty media honest | Focus on card CTAs |
| Inspect unit | Listing detail | Hierarchy OK | Inherited focus patterns |
| Understand project | Project index/detail | Text-heavy cards acceptable | Shared card hover lift |
| Trust developer | Developer index/detail | Uneven card height when description empty | Min-height on blurb |
| Learn area | District | Calm reading surface | — |
| Learn terms | Knowledge | Clean cards | — |
| Take action | Marketplace + forms | Paths clear; cards felt flat | Hover depth + focus rings; `--shadow-soft` defined |
| Orient | Nav / Footer | Search redirect confused IA; nav scrollbar streak | Demoted Search; hid scrollbar track |

## Devices considered

Desktop · iPad landscape · iPad portrait · iPhone · Android — reviewed via live production + responsive source rules (`sm`/`md`/`lg`). No layout redesign; mobile hero clipping already addressed in Wave 1.

## What changed (polish only)

1. Defined missing `--shadow-soft` token (marketplace highlight previously referenced an undefined shadow)  
2. Removed **Search** from primary nav + footer Explore (redirect helper, not a destination)  
3. Hid desktop nav overflow scrollbar (visual streak across links)  
4. Localized home hero BTS/MRT option labels via dictionary  
5. Homepage section title → **Explore Bangkok districts** (EN/ZH/TH)  
6. Unified card hover lift/shadow for project/developer/district/marketplace cards  
7. Added `focus-visible` rings on header, footer, breadcrumbs, home cards, listing CTAs, marketplace entries  
8. Balanced home project/developer card blurb height (`min-h` + line-clamp)

## Explicitly not changed

- Grid systems / page templates  
- New CTAs or flows  
- Invented imagery for empty media  
- Knowledge article public routing  

## Stop

Waiting for Product Review.
