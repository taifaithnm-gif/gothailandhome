# MULTILINGUAL_REVIEW

**Date:** 2026-07-15  
**Locales:** `en`, `zh`, `th`

## Confirmed

- Locale prefixes work (`/zh`, `/th`, property + project samples 200).  
- Chrome chrome strings (nav, many marketplace labels) translated via dictionaries.  
- Contact escalation strings exist in all three dictionaries post-P0.

## Gaps

| Issue | User impact |
|-------|-------------|
| Listing body/title often English source text | ZH/TH users see EN content inside localized chrome |
| Project descriptions frequently EN template | Weak ZH/TH SEO/usefulness |
| Placeholder About copy still “MVP” oriented | Trust mismatch in all locales |
| Smoke checks for EN phrase “Images unavailable” miss ZH/TH labels | QA must assert locale keys, not EN-only |

## Recommendation (backlog, not implement now)

Prioritize dictionary chrome + explicit “source language” badge on listings over machine-translating all inventories for Alpha.
