# Navigation Audit Report

**Date:** 2026-07-15

## Primary header (desktop)

Order observed:
1. Home  
2. Properties  
3. Projects  
4. Cities  
5. Developers  
6. Find My Home  
7. List Property  
8. Search  
9. About  
10. Contact  
+ language switcher

### Issues

| Issue | Type | Priority |
|-------|------|----------|
| 10 peer links overload attention | IA | P1 |
| Properties + Search overlap | duplicate CTA | P1 |
| No Buy / Rent primary entries | journey gap | P1 |
| Partnerships absent from header | discoverability | P2 |
| Knowledge absent | gap | P2 |
| Active state marks entire `/properties` tree while on a listing | OK-ish | P3 |

## Mobile nav

- Menu button with aria-expanded/controls — good a11y baseline.
- Same link set revealed — still too many.
- Sticky dark header preserves brand.

## Footer nav

- Explore: Properties, Projects, Cities, Developers, Find My Home, List Property, Search.
- Company: About, Partners (developers), Agency Partnership, Contact.
- Healthier split than header, but inconsistent labeling (“Partners”).

## Contact routing map

| Intent | Correct destination | Current |
|--------|---------------------|---------|
| Ask about a listing | Listing contact / viewing form | Implemented; agent often missing |
| Platform help | `/contact` + CS contacts | Implemented |
| Demand matching | `/find-my-home` | Implemented |
| Supply intake | `/list-your-property` | Implemented |
| B2B partnerships | `/partners/*` | Implemented |

## Apple / platform CS positioning in nav

- Apple is **not** a nav item (correct).
- Appears only in contact/support surfaces with Platform Customer Success role (correct).

## Recommended IA (for later implementation — not this task)

1. Primary: Buy · Rent · Projects · Cities · More  
2. More: Developers, Find My Home, List Property, Partners, About, Contact  
3. Merge Search into Buy/Rent results  
4. Add Knowledge when content ready
