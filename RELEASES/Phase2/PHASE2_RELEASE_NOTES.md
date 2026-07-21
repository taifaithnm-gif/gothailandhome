# Phase 2 Release Notes (Release Candidate)

**Product:** GoThailandHome
**Baseline:** Phase 1 production `v1.0.0`
**Package:** Phase 2 Engineering Release Candidate
**Date:** 2026-07-21
**Production deploy:** **NOT included** — Owner-gated after staging trains

---

## Summary

Phase 2 adds flagged customer operations, supply acquisition/partner portals, map discovery, finance/legal tools, L0 AI assists, and expanded analytics — all default **OFF** to preserve Phase 1 behavior.

## New capabilities

### Customer & demand ops
- Customer account (sign-in, dashboard, saved items, saved searches, alert prefs)
- Ops lead lifecycle inbox (`/admin/ops/leads`)
- Notification outbox + quiet hours
- CRM HTTPS webhook adapter (optional credentials)

### Supply / partners
- Acquisition case state machine + evidence + publish bridge
- Partner RBAC portal (`/partners/app`) for developer/agent roles
- Invite hash onboarding

### Maps
- `/{lang}/map` list-first browse with OSM embed
- District deep links; honest unmapped counts
- Bbox/filter URL state with canonicalization

### Finance & legal
- Deterministic mortgage calculator
- Informational legal checklist with disclaimer ACK
- Tools hub under `/{lang}/tools`

### AI
- L0 similar-listings rail (rules only; no LLM)
- Investment scenario assist bound to mortgage math
- Kill switch + non-AI fallbacks

### Analytics
- Expanded consent-gated event helpers (`FEATURE_P2_ANALYTICS_EXPANSION`)
- PII blocklist retained

### SEO / a11y / i18n
- Robots disallow account/partners/app
- Conditional sitemap entries when map/tools flags ON
- EN/ZH/TH dictionary coverage for new public surfaces
- Admin/ops remains EN-first

## Known issues

| Sev | Issue |
| --- | --- |
| P2 | Sparse map pins until project coordinates populated |
| P2 | Partner invite admin UI incomplete (API-level onboarding) |
| P2 | Acquisition rate-limit fails open on DB error |
| P2 | Soft dual-control on acquisition publish |
| P3 | Turbopack NFT warning (optional P2-091) |
| P3 | Optional residuals P2-090–094 excluded |

## Migration notes

Apply in order on staging first:

1. `20260721100000_phase2a_customer_ops.sql`
2. `20260721120000_phase2b_acquisition_partners.sql`

Do not enable dependent flags before apply succeeds.

## Rollback notes

1. Set all `FEATURE_P2_*` / `NEXT_PUBLIC_FEATURE_P2_*` OFF
2. Redeploy if public mirrors were changed
3. Optional: `FEATURE_P2_AI_KILL_SWITCH=true`
4. Leave additive tables in place
5. Phase 1 pin `v1.0.0` remains safe baseline

## Version tagging

Owner decides Phase 2 version name at cutover (e.g. `v1.1.0`) — **not tagged in this RC package**.
