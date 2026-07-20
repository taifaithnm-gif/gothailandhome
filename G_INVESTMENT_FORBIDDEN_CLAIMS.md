# G-INVESTMENT — Forbidden Claims

**Gate:** G-INVESTMENT  
**Document ID:** GINV-FORBIDDEN-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines claims that must never appear in investment guide copy, UI labels on the guide route, or FAQ answers that substitute for the guide.

## 2. Forbidden claim categories

| Category | Examples (non-exhaustive) |
| --- | --- |
| Return guarantees | "guaranteed return", "assured yield", "risk-free investment" |
| Yield / ROI forecasts | "expected ROI", "projected yield", "rental return of X%", "cap rate" |
| Performance rankings | "best district to invest", "top-performing area", "highest appreciation" |
| Calculators | Interactive or static ROI/yield/mortgage-return calculators on the guide route |
| Personalized advice | "you should buy", "we recommend this project for investors" |
| Market predictions | "prices will rise", "market will recover by", "forecast growth" |
| Invented statistics | Unsourced median prices, absorption rates, or occupancy figures |
| Legal conclusions | Foreign-ownership eligibility for a specific buyer (defer to G-LEGAL guide) |

## 3. Blocked tokens (P1-28 must fail)

Case-insensitive substring scan on investment guide body + disclaimer fields:

- `guaranteed return`
- `guaranteed yield`
- `expected roi`
- `projected yield`
- `rental yield`
- `cap rate`
- `price will rise`
- `best investment`
- `roi calculator`
- `yield calculator`

## 4. FAQ boundary

FAQ answers must **not** improvise investment depth. They must link to `/knowledge/investment` when investment topics arise.

## 5. Approval

**APPROVED** under decision **GINV-D-003**.
