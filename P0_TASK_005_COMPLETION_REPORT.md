# P0 Task 005 Completion Report

**Date:** 2026-07-19
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`
**HEAD baseline:** `eedf3f7` — task modifies working tree only; no commit/push/deploy

## Task ID

**MM-P0-05** — Correct locale document-language semantics

## Objective

Ensure server-rendered document language is correct for EN/ZH/TH without relying
on a client script. Initial HTML must expose the correct BCP 47 `lang` for every
locale; locale switching must not regress SEO metadata; route/build tests must pass.

## Files modified

1. `src/app/[lang]/layout.tsx` — became the **locale root layout** owning
   `<html lang={localeHtmlLang[lang]}>` (en / zh-CN / th); removed nested
   `lang` wrapper script that patched `document.documentElement.lang`.
2. `src/app/layout.tsx` — **deleted** (hardcoded `lang="en"` root removed so
   `[lang]` can own the document shell per Next.js App Router i18n guidance).
3. `src/app/admin/layout.tsx` — promoted to sibling root document shell
   (`<html lang="en">`) so admin no longer depends on the deleted top-level layout.
4. `src/app/auth/layout.tsx` — **new** minimal root shell for `/auth/*`.
5. `src/lib/ui/document-fonts.ts` — **new** shared fonts/metadata/body chrome
   used by all root document shells (avoids `headers()` and preserves ISR).
6. `scripts/test-route-metadata-contracts.mjs` — added html-lang + SEO locale
   switch contracts; asserts top-level `app/layout.tsx` is absent.

No Runtime / Windows01 / business-feature changes.

## Locale verification

| Locale route param | BCP 47 `html lang` | Verified live HTML |
| --- | --- | --- |
| `en` | `en` | `/en`, `/en/about` → `lang="en"` |
| `zh` | `zh-CN` | `/zh`, `/zh/about` → `lang="zh-CN"` |
| `th` | `th` | `/th`, `/th/about` → `lang="th"` |

`generateStaticParams` still emits all three locales. No `headers()` / `cookies()`
in the public root layout (ISR/`revalidate` posture preserved).

## HTML language verification

- Server HTML includes the correct `<html lang="…">` for each locale.
- `document.documentElement.lang=…` client patch: **removed** (confirmed absent
  in live responses).
- Admin/auth shells use `lang="en"` as internal English surfaces.

## SEO verification

Live checks on home + about for EN/ZH/TH:

| Check | Result |
| --- | --- |
| Canonical URL stays locale-prefixed | PASS (e.g. `…/zh/about`) |
| `og:locale` matches locale map | PASS (`en_US` / `zh_CN` / `th_TH`) |
| `buildPageMetadata` hreflang / canonical / OG contracts | PASS (suite) |
| Noindex search + admin robots contracts | PASS (unchanged) |

## Typecheck result

**PASS** — `npm run typecheck` exit 0 (after `.next` type regeneration via build)

## Lint result

**PASS** — `npm run lint` exit 0

## Test result

**PASS** — `npm test` exit 0 (includes new html-lang / SEO locale contracts)

## Build result

**PASS** — `npm run build` exit 0 (66 pages generated)

## Remaining P0 tasks

**None.** MM-P0-05 was the final P0 task in `MACMINI_EXECUTION_BACKLOG.md`.

## Stop

MM-P0-05 complete. No P1 started. No commit. No push. No deploy.
