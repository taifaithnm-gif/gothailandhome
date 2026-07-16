# INTERACTION_REVIEW

**Milestone:** Phase 12 — Product Polish · Wave 2  
**Date:** 2026-07-17

## Primary vs secondary actions

| Context | Primary | Secondary | Assessment |
|---------|---------|-----------|------------|
| Home hero | Search submit | Find My Home (gold) / List Property (ghost) | Clear; gold reserved for demand intake |
| Listing card | View details | Platform help (quiet) | Correct hierarchy |
| Marketplace cards | Continue / Browse CTA text | Card itself is the hit target | Improved hover/focus affordance |
| Forms | Submit | Breadcrumb back | Clear |

## Hover behavior

| Component | Hover | Notes |
|-----------|-------|-------|
| Listing cards | Lift + deeper shadow + image scale | Premium reference |
| Project / developer / district shells | Lift + border + soft shadow | **Aligned in Wave 2** |
| Marketplace entries | Lift + border + soft shadow | **Aligned in Wave 2** |
| Header links | Color brighten | Plus focus ring |
| Footer links | Brighten to white | Plus focus ring |

## Focus states (keyboard)

| Surface | Wave 2 |
|---------|--------|
| Primary nav links | Gold focus ring on deep header |
| Language switcher | Matching ring + offset |
| Footer links | Gold focus ring |
| Breadcrumbs | Brand focus ring |
| Home project/developer/district links | Brand focus ring |
| Listing CTAs | Brand focus ring |
| Marketplace entry cards | Brand focus ring |

Buttons already used shared `focus-visible:ring` via `buttonVariants` — left intact.

## Loading / empty perception

| State | Behavior | Polish stance |
|-------|----------|---------------|
| Missing listing photo | Gradient + “Images unavailable” | Keep — honest, not decorative fake photo |
| Missing developer blurb | Empty text previously collapsed cards | Min-height preserves grid rhythm |
| Search route | Redirect helper | Removed from chrome to avoid dead-end feel |

## Scrolling rhythm

- Sticky header preserved  
- Mobile drawer closes on navigate (existing)  
- Home hero no longer forces excess empty scroll (Wave 1)  
- Desktop nav can still scroll if needed, without showing a grey scrollbar bar  

## Animation consistency

Single family: `transition` / `duration-300` + `hover:-translate-y-0.5`. No competing spring/fade systems introduced.

## Device interaction notes

| Device class | Interaction notes |
|--------------|-------------------|
| iPhone / Android | Hamburger + localized section labels (Wave 1); touch targets on CTAs ≥44px where `min-h-11` used |
| iPad portrait | Same as large mobile / small tablet grids (`sm:grid-cols-2`) |
| iPad landscape / Desktop | Primary nav; language in bar; marketplace 3-col |

## Open interaction backlog (not fixed)

- Whole listing card as single hit target (would change interaction model)  
- Further nav grouping / mega-menu (redesign)  
