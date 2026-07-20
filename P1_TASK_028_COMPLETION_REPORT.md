# Phase 1 Task 028 Completion Report

**Task ID:** P1-28  
**Objective:** Static CMS validation and editorial QA

## Files modified

- `scripts/test-content-editorial.mjs`
- `package.json`

## Functional changes

- Added aggregate editorial validation command `test:content-editorial` integrated into `npm test`.
- Validates knowledge articles, blog posts, investment guide, legal guide, and FAQ entries for:
  - duplicate slugs/ids
  - invalid/non-approved status in indexes
  - incomplete locale policy
  - stale `reviewed_at` (90d guides, 180d articles/FAQ)
  - missing citations, disclaimers, jurisdiction, version, owner
  - forbidden investment/legal claim tokens per G-INVESTMENT / G-LEGAL
  - FAQ guide-link requirements

## Task-specific verification

- Added and passed `test:content-editorial`.

## Quality gates

- `npm run typecheck` ✅ PASS
- `npm run lint` ✅ PASS
- `npm test` ✅ PASS
- `npm run build` ✅ PASS

## Notes

- P1-28 completes M4 static content product. No P1-29 work started. No deploy, commit, push, Windows01, or live data.
