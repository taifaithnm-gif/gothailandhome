# G-ANALYTICS — Analytics Scope

**Gate:** G-ANALYTICS  
**Document ID:** GAN-SCOPE-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. In scope (Phase 1)

| Capability | Notes |
| --- | --- |
| Consent-gated measurement adapter | Loads only after approved analytics consent |
| Fake / no-op adapter for dev/test | Default when IDs missing or consent denied |
| Frontend discovery + lead-intent events | Per approved taxonomy only |
| Optional GA4 Measurement ID via env | `NEXT_PUBLIC_GA_MEASUREMENT_ID` — inert if empty |
| Legacy ads placeholder retirement | Replace with consent-aware adapter; ads IDs remain optional env |

## 2. Out of scope

- Server-side tracking, CRM webhooks, email opens
- Session replay / heatmaps
- Cross-site identity graphs
- Inventing events outside taxonomy
- Loading scripts before consent
- Windows01 or live property pipeline metrics

## 3. Environments

| Environment | Behavior |
| --- | --- |
| Development / CI / test | Fake adapter; no network analytics scripts |
| Production (local build) | Real adapter only if consent granted **and** measurement ID present |

## 4. Approval

**APPROVED** under decision **GAN-D-001**.
