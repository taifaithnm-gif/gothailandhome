# BUG_LIST

**Milestone:** Phase 12 — Product Perfection · Wave 1  
**Date:** 2026-07-17

## Fixed (deterministic)

| ID | Severity | Surface | Bug | Fix |
|----|----------|---------|-----|-----|
| B1 | High | Footer | **Partners** linked to `/marketplace` (wrong destination; duplicate Marketplace entry) | Link → `/partners/developers` |
| B2 | Medium | Home + indexes | `dict.common.viewAll` = “View all listings” on projects/cities/developers | Copy → “View all” (EN/ZH/TH) |
| B3 | Medium | About | Page showed `placeholderNotice` (“Placeholder content for MVP preview.”) | Removed notice prop |
| B4 | Medium | Header mobile | Section captions hardcoded `Browse` / `Marketplace` / `Company` | Dictionary keys `nav.section*` |
| B5 | Low | Header language | `hrefLang="zh"` instead of `zh-CN` | Map zh → `zh-CN` |
| B6 | Medium | Home hero (mobile) | `min-h-[78vh]` + `justify-end` clipped search controls on short screens | Responsive min-height / justify |

## Open (not fixed — needs product decision or data)

| ID | Severity | Surface | Bug / defect | Why deferred |
|----|----------|---------|--------------|--------------|
| B7 | Low | Home hero search | Transit `<option>` labels hard-coded English | Tiny copy change; listed as UX P2 |
| B8 | Low | Header/Footer | Search nav/footer item is a noindex redirect | Intentional RC2 helper; demote later |
| B9 | Info | Listing cards | Widespread “Images unavailable” | Honest empty state; media pipeline separate |
| B10 | Info | Desktop nav | Crowding / overflow-x at `lg` | Would be IA change (redesign-adjacent) |

## Not bugs

- `/en/search` → properties redirect with `noindex`  
- Missing project hero binaries when only placeholders exist  
- Knowledge article JSON without a public article page (content factory artifact)

## Verification

- Public route crawl: all sampled pages **HTTP 200**  
- Homepage internal `/en/*` targets: **0 broken**
