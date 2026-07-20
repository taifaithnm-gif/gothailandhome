# G-INVESTMENT — Investment Content Scope

**Gate:** G-INVESTMENT  
**Document ID:** GINV-SCOPE-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20  
**Owner:** Qualified Investment Reviewer (Phase 1 website static content)

## 1. Purpose

Defines the only investment-related public content Phase 1 may publish after G-INVESTMENT clears.

## 2. In scope

| Surface | Route | Content type |
| --- | --- | --- |
| Investment education guide | `/[lang]/knowledge/investment` | `investment_guide` |

Approved topics for the Phase 1 guide:

1. How GoThailandHome presents verified public listings (not a listing agent)
2. High-level due-diligence framing for property discovery (source checks, freshness, viewing requests)
3. Distinction between published listing prices and developer official pricing
4. Platform process pointers (Find My Home, Marketplace, Contact)
5. Explicit statement that the platform does not provide yield, ROI, or return forecasts

## 3. Out of scope

- ROI, yield, cap-rate, or rental-return calculators
- Market forecasts, price-index commentary, or performance rankings
- Personalized investment recommendations or portfolio advice
- Syndicated third-party research without inventory amendment
- District-level investment summaries beyond existing evidence-controlled district packages
- Any content implying guaranteed returns or risk-free outcomes

## 4. Filesystem scope

```
content/guides/investment/
```

Loader may read **only** this tree for `investment_guide` documents. No other path is authorized.

## 5. Locale requirement

All three locales (`en`, `zh`, `th`) must be complete before the guide is routable (per G-CONTENT-PUBLIC locale fallback policy default for guides).

## 6. Approval

**APPROVED** under `G_INVESTMENT_OWNER_DECISION_REGISTER.md` decision **GINV-D-001**.
