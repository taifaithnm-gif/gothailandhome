# UI Audit Report

**Date:** 2026-07-15  
**Method:** Production server inspection + screenshots (desktop + 390×844 mobile) + HTML/CSS source cross-check. No redesign performed.

## Visual hierarchy

**Strengths**
- Strong brand-green header and hero gradient; brand name is hero-level on home.
- Listing detail sidebar correctly elevates price + contact.
- Marketplace form pages use a single white card with clear H1.

**Defects**
- Homepage H1 (“Thailand property, city by city”) competes with oversized brand wordmark above it.
- Primary nav shows ~10 items at desktop — labels compete equally; gold active state is the only hierarchy cue.
- Featured project cards open with muted, repeated placeholder blurbs — weak content hierarchy.
- Listing detail hero image is a blank brand gradient (no photo hierarchy).

## Spacing & layout

- `max-w-6xl` + generous section `py-14` is consistent.
- Forms use two-column grids that collapse cleanly on mobile.
- Properties index dumps an unbounded card grid → layout collapses into endless scroll with no density control.

## Typography

- Display/body via Plus Jakarta + CJK/Thai Noto stacks — expressive and on-brand.
- Root `<html lang="en">` remains English even on `/zh` and `/th` (client script patches `documentElement.lang`; crawlers may still see `en`).
- Project card body text is dense and boilerplate-heavy.

## Cards / buttons / forms

- Cards: rounded-2xl + light border — repeated system-wide (acceptable but monotonous).
- Primary buttons: solid brand green; ghost header icon for mobile menu — clear.
- Marketplace forms: readable labels; consent checkbox present; date input shows browser-locale placeholder (“日/月/年”) even on EN page (observed).
- Viewing request + Find My Home reuse similar field chrome — good reuse, limited visual differentiation.

## Color

- Brand deep green + gold accents consistent.
- Soft gray page background (`brand-soft`) separates content from navy header.
- Platform support block uses dashed border — correctly demoted vs listing contact.

## Images

- Listing cards often show fallback styling rather than photography.
- Sample detail page: **zero `<img>` tags** — trust and scannability suffer.
- No broken-image scan hits on that page because images are absent, not 404.

## Empty / loading / error

- Empty listing contact message is explicit and correct.
- No dedicated loading skeletons.
- Project 500 surfaces generic Next error document — not branded.

## Trust signals

- “Verified public listings” claims on home.
- Privacy statements on Find My Home are clear.
- Missing: verified badge near listing contact, source badge prominence varies, photo proof weak.

## Multilingual consistency

- EN/ZH/TH dictionaries present for marketplace keys.
- Nav labels localize; some raw source titles remain English on non-EN locales.
- `html` lang attribute audit finding above.

## Component reuse

- Header/footer, PropertyGrid/Card, marketplace forms, ListingContactCard reused appropriately.
- Properties vs Search appear near-duplicates → maintenance + UX confusion.

## Desktop consistency

- Desktop visual system is coherent.
- Overcrowded header and unpaginated indexes are the main desktop defects.

## Representative screenshot findings

1. Home desktop: brand-led hero + search card + Buy/Rent/Investment chips.
2. Listing detail: correct contact copy separating Apple as platform CS.
3. Find My Home: long but orderly private demand form.
4. Mobile home: hamburger present; search stacks; featured projects section follows.
