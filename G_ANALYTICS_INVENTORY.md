# G-ANALYTICS — Inventory

**Gate:** G-ANALYTICS  
**Document ID:** GAN-INV-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Provider inventory

| Provider | Phase 1 status | Env key |
| --- | --- | --- |
| Fake / no-op adapter | **Approved default** | n/a |
| Google Analytics 4 | **Approved optional** | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Meta Pixel | Deferred (no auto-load) | `NEXT_PUBLIC_META_PIXEL_ID` (optional; inert without consent + future task) |
| Google Ads gtag conversion | Deferred | `NEXT_PUBLIC_GOOGLE_ADS_ID` (optional; inert without consent + future task) |

## 2. Event inventory

All six events in `G_ANALYTICS_EVENT_TAXONOMY.md` are approved for Phase 1 instrumentation.

## 3. Consent storage key

`gth_analytics_consent` → `granted` | `denied`

## 4. Approval

**APPROVED** under decision **GAN-D-010**.
