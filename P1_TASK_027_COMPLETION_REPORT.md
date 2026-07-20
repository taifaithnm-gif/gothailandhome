# Phase 1 Task 027 Completion Report

**Task ID:** P1-27  
**Objective:** FAQ hub

## Files modified

- `content/faq/INDEX.json`
- `content/faq/entries/*.json` (10 approved entries)
- `src/lib/content/types.ts`
- `src/lib/content/validate.ts`
- `src/lib/content/loader.ts`
- `src/lib/content/index.ts`
- `src/app/[lang]/faq/page.tsx`
- `src/lib/seo/schema.ts` (`platformFaqSchema`)
- `src/app/[lang]/knowledge/page.tsx`
- `src/app/sitemap.ts`
- `src/dictionaries/en.json`
- `src/dictionaries/zh.json`
- `src/dictionaries/th.json`
- `scripts/test-faq-hub.mjs`
- `package.json`

## Functional changes

- Added 10 approved FAQ entries per `G_CONTENT_PUBLIC_FAQ_INVENTORY.md` with complete EN/ZH/TH locales.
- Added `/[lang]/faq` hub with category sections, anchors, and keyboard-accessible `<details>`/`<summary>` controls.
- FAQPage JSON-LD matches visible question set via `platformFaqSchema`.
- Investment/legal FAQ entries link to approved guides instead of improvising depth.
- Linked from Knowledge hub and sitemap.

## Task-specific verification

- Added and passed `test:faq-hub`.

## Quality gates

- `npm run typecheck` ✅ PASS
- `npm run lint` ✅ PASS
- `npm test` ✅ PASS
- `npm run build` ✅ PASS

## Notes

- P1-27 only. No deploy, commit, push, Windows01, or live data.
