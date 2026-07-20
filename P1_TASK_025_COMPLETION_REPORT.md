# Phase 1 Task 025 Completion Report

**Task ID:** P1-25  
**Objective:** Investment guide surface

## Governance prerequisite

- G-INVESTMENT cleared via `G_INVESTMENT_PACKAGE.md` and `G_INVESTMENT_OWNER_DECISION_REGISTER.md`

## Files modified

- `content/guides/investment/INDEX.json`
- `content/guides/investment/thailand-property-discovery-guide.json`
- `src/lib/content/types.ts`
- `src/lib/content/validate.ts`
- `src/lib/content/loader.ts`
- `src/lib/content/index.ts`
- `src/app/[lang]/knowledge/investment/page.tsx`
- `src/app/[lang]/knowledge/page.tsx`
- `src/app/sitemap.ts`
- `src/dictionaries/en.json`
- `src/dictionaries/zh.json`
- `src/dictionaries/th.json`
- `scripts/test-investment-guide.mjs`
- `package.json`

## Functional changes

- Added approved investment guide content (`INV-GUIDE-1.0.0`) with tri-locale copy, disclaimer, forecast disclaimer, citations, owner, and review date.
- Extended static content loader with scoped `getInvestmentGuide` / `renderInvestmentGuideLocale`.
- Added `/[lang]/knowledge/investment` route with visible disclaimer, version, owner, review date, citations, and educational/not-advice labels.
- No calculator or yield/ROI forecast UI.
- Linked from Knowledge hub and sitemap static inventory.

## Task-specific verification

- Added and passed `test:investment-guide`.

## Quality gates

- `npm run typecheck` ✅ PASS
- `npm run lint` ✅ PASS
- `npm test` ✅ PASS
- `npm run build` ✅ PASS

## Notes

- P1-25 only. No P1-26+ scope. No deploy, commit, push, Windows01, or live data.
