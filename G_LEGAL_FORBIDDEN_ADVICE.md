# G-LEGAL — Forbidden Legal Advice

**Gate:** G-LEGAL  
**Document ID:** GLEG-FORBIDDEN-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines advice and claims that must never appear in legal guide copy or FAQ substitutes.

## 2. Forbidden categories

| Category | Examples |
| --- | --- |
| Personalized advice | "You can buy this condo as a foreigner", "You qualify for freehold" |
| Contract guidance | "Sign this clause", "Use this structure to avoid tax" |
| Visa/tax/inheritance | Visa eligibility, tax optimization, estate planning |
| Guarantees | "Legally guaranteed ownership", "approved by regulator for your case" |
| Unsigned copy | Any legal guide without `owner` and `version` |
| Improvised law | Rules stated without government citation |
| Case outcomes | "Courts always rule that…" |

## 3. Blocked tokens (P1-28 must fail)

Case-insensitive substring scan on legal guide body + disclaimer:

- `you qualify`
- `you can legally`
- `we recommend you`
- `legal advice for your`
- `guaranteed ownership`
- `tax avoidance`

## 4. FAQ boundary

FAQ answers must **not** improvise legal depth. They must link to `/knowledge/legal`.

## 5. Approval

**APPROVED** under decision **GLEG-D-003**.
