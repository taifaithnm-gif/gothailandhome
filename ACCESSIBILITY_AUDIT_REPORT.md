# Accessibility Audit Report

**Date:** 2026-07-15  
**Sources:** Lighthouse accessibility category + DOM/snapshot review. Not a full WCAG lab audit.

## Scores (Lighthouse)

| Page | Accessibility |
|------|---------------|
| `/en` | **100** |
| `/en/properties` | **99** |

## Strengths

- Primary nav landmark present.
- Mobile menu button exposes `aria-expanded` / `aria-controls` / accessible name.
- Form controls generally labelled (Find My Home snapshot shows named comboboxes/textboxes).
- Consent checkboxes are named.
- Color contrast audit passed on home (LH).
- Link name audit passed on home (LH).

## Defects

| Issue | Severity | Notes |
|-------|----------|-------|
| Root `<html lang="en">` hard-coded | P1 | Locale layout sets `lang` on an inner `div` + JS patch; assistive tech / validators may miss locale |
| No route-level `error.tsx` / live region for failures | P1 | Project 500 yields generic Next error page |
| Missing images / empty decorative gradients | P1 | Low information for screen mag users relying on visuals; ensure text alternatives remain strong |
| Very large DOM on inventory pages | P1 | Hurts AT navigation; LH dom-size pressure |
| “View details” repeated link names | P2 | Multiple identical names in lists (common pattern) |
| Checkbox marked readonly in a11y snapshot on some forms | P2 | Verify controllable state vs styling |
| Admin pages lack polished a11y pass | P3 | Internal tools |

## Keyboard / focus

- Not exhaustively tested; header link order is logical.
- Recommend focus trap validation for mobile menu in Alpha UX phase.

## Apple / contact a11y note

- Role text for Apple includes “Platform Customer Success” — good for clarity beyond iconography.
