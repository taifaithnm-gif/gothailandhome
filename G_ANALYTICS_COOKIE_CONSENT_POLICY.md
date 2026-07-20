# G-ANALYTICS — Cookie / Consent Policy

**Gate:** G-ANALYTICS  
**Document ID:** GAN-CONSENT-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Consent basis

Analytics measurement requires **prior opt-in** (grant). Strictly necessary site cookies for locale/session UX are out of this gate.

## 2. Consent UI requirements

- Visible grant / deny controls before loading measurement scripts
- Localized EN / ZH / TH copy
- Persist choice in `localStorage` key `gth_analytics_consent` with values `granted` | `denied`
- Unset → treat as not granted (no scripts)

## 3. Script loading rule

| Consent | Measurement ID | Behavior |
| --- | --- | --- |
| unset / denied | any | Fake/no-op adapter; **no** network analytics script |
| granted | empty / placeholder | Fake/no-op; inert |
| granted | real GA measurement ID | Load provider script once |

## 4. Ads placeholders

Historical `AdsTrackingPlaceholders` must not load network pixels before consent. Phase 1 replaces bootstrap with the consent-aware analytics adapter. Optional Meta/Google Ads IDs remain env-only and must not auto-load without consent.

## 5. Approval

**APPROVED** under decision **GAN-D-007**.
