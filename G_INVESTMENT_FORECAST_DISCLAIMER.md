# G-INVESTMENT — Forecast Disclaimer

**Gate:** G-INVESTMENT  
**Document ID:** GINV-DISCLAIMER-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines the mandatory forecast and advice disclaimer for the investment guide.

## 2. Approved disclaimer (EN — binding meaning)

> This educational guide explains how GoThailandHome helps you discover and review verified public property listings. It does not provide investment advice, yield forecasts, ROI projections, or guaranteed outcomes. Listing prices and availability come from third-party public sources and may change. Consult qualified financial, tax, and legal professionals before making property decisions.

## 3. Localization

ZH and TH strings must preserve the same prohibitions and scope. Approved strings live in `content/guides/investment/thailand-property-discovery-guide.json` `disclaimer` field and dictionary keys `investmentGuide.disclaimer`.

## 4. Display rules

- Disclaimer must render **above the fold** on the guide page (visible without scrolling past hero on mobile).
- Disclaimer must appear in JSON-LD `description` only if it matches visible text (no hidden claims).
- `reviewed_at`, `owner`, and `version` must be visible adjacent to disclaimer metadata block.

## 5. Version binding

Disclaimer text is bound to guide version **INV-GUIDE-1.0.0**. Any material change requires re-approval under G-INVESTMENT editorial workflow.

## 6. Approval

**APPROVED** under decision **GINV-D-005**.
