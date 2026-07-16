# VISUAL_CONSISTENCY_REPORT

**Milestone:** Phase 12 — Product Polish · Wave 2  
**Date:** 2026-07-17

## System anchors

| Layer | Source of truth |
|-------|-----------------|
| Color | `--brand` / `--brand-deep` / `--brand-gold` / `--brand-soft` / `--brand-line` |
| Type | `font-heading` + `ds-h1`/`ds-h2`/`ds-caption` |
| Space | `--section-y`, `--card-pad`, `ds-container` |
| Elevation | `--shadow-soft` (**defined in Wave 2**) |
| Motion | 300ms translate / border / soft on cards |

## Consistency scorecard

| Element | Before Wave 2 | After Wave 2 |
|---------|---------------|--------------|
| Listing card hover | Lift + soft shadow | Unchanged (reference) |
| Project / developer cards | Border-only hover | **Aligned** lift + `--shadow-soft` |
| Marketplace entry cards | Border hover; broken soft shadow var | **Aligned** lift + defined shadow + focus ring |
| District tiles (home) | Ad-hoc `shadow-md` | **Aligned** to `--shadow-soft` + focus |
| Nav active state | Gold text | Unchanged |
| Nav overflow | Visible scrollbar track | **Hidden** scrollbar chrome |
| Empty media | Gradient + label | Unchanged (honest) |
| Card text blocks | Uneven when description missing | **Min-height** on home blurbs |

## Typography rhythm

- Hero: brand display → H1 → body → positioning — intact  
- Section blocks: H2 + subtitle + optional “View all” — intact  
- Captions (`ds-caption`) remain uppercase brand green for role labels  

## Spacing / section balance

- `ds-section` vertical rhythm unchanged  
- Marketplace info box vs entry grid still wider-than-cards by design (hub explanation) — acceptable; not redesigned  
- Home “Why” four-up and marketplace three-up remain balanced on desktop; stack cleanly on phone  

## Image proportions

- Listing media locked to **16:10** (`ListingMediaFrame`) — consistent across home/properties  
- Project/developer cards remain text-led when no hero binary — intentional Alpha honesty  

## Color / icon

- Brand teal + gold accents consistent in header/footer/CTAs  
- Lucide icons limited to menu/close/breadcrumb chevron — no competing icon languages  
- Evidence badge tones unchanged from design tokens  

## Residual visual notes (Product Review)

- Desktop nav remains link-dense even after Search removal — further IA grouping would be redesign-adjacent  
- Empty listing media still dominates card visual weight until real photos ship  
