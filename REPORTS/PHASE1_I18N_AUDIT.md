# Phase 1 Internationalization Audit

**Date:** 2026-07-20  
**Locales:** `en`, `zh`, `th`

---

## 1. Dictionary parity

| Locale | Flattened keys | Missing vs EN | Extra vs EN |
| --- | --- | --- | --- |
| en | 773 (+1 RC: `nav.primary`) | — | — |
| zh | matched | **0** | **0** |
| th | matched | **0** | **0** |

## 2. Locale routing & switch

| Check | Result |
| --- | --- |
| `isLocale` / `generateStaticParams` | Pass |
| `<html lang>` server-rendered | Pass (`localeHtmlLang`) |
| Locale switcher preserves path + query | Pass (`test:navigation`) |
| Fallback disclosure on content | Pass (knowledge/blog loaders) |

## 3. Hard-coded user strings

| Area | Finding | Severity |
| --- | --- | --- |
| Public chrome | Primary nav label moved to `dict.nav.primary` (RC fix) | Fixed |
| `LoadingState` default `"Loading…"` | Callers pass localized labels; default is English fallback | P3 |
| `Breadcrumb` `aria-label="Breadcrumb"` | English landmark name | P3 |
| Admin property form | English-only staff UI | P3 (acceptable) |

## 4. Content packages

Knowledge, blog, FAQ, investment, legal packages carry EN/ZH/TH fields with `locale_status` validation via content loader / editorial tests — **PASS**.

## 5. Issues

| ID | Severity | Issue |
| --- | --- | --- |
| I18N-1 | P3 | LoadingState English default |
| I18N-2 | P3 | Breadcrumb English aria-label |
| I18N-3 | P3 | Admin UI not localized |

## 6. Verdict

**PASS** — Public EN/ZH/TH parity is complete for Phase 1 dictionaries and content contracts.
