# Phase 2 Staging Smoke Matrix

**Date:** 2026-07-23
**RC:** `v2.0.0-rc1` (`0eca210`)
**Environment:** Staging **not wired** (no dedicated staging Supabase; Preview may inherit prod; Deployment Protection historically blocks unauthenticated smoke)
**Production posture:** FREEZE CURRENT PRODUCTION — NO CUTOVER
**Result:** All cells **NOT_RUN**

---

## Dimensions

- **Train steps:** T1–T10 (per `docs/operations/STAGING_POLICY.md` §7)
- **Locales:** EN / ZH / TH
- **Viewports:** Desktop / Mobile
- **Personas:** Customer / Partner / Staff(Ops) / Anonymous
- **States:** Flag-OFF baseline / Flag-ON for step under test

---

## Matrix (flag train × locale)

All combinations **NOT_RUN** — staging foundation code exists locally; staging runtime not available.

| Step | Flag(s) | EN | ZH | TH | Notes |
| --- | --- | --- | --- | --- | --- |
| T1 | `FEATURE_P2_ACCOUNT` (+ public mirror) | NOT_RUN | NOT_RUN | NOT_RUN | Customer sign-in / account / saved-search |
| T2 | `FEATURE_P2_OPS_LEADS` | NOT_RUN | NOT_RUN | NOT_RUN | Staff lead inbox |
| T3 | `FEATURE_P2_NOTIFICATIONS` | NOT_RUN | NOT_RUN | NOT_RUN | Outbox / prefs |
| T4 | `FEATURE_P2_CRM_SYNC` | NOT_RUN | NOT_RUN | NOT_RUN | CRM adapter (sandbox/mock) |
| T5 | `FEATURE_P2_ACQUISITION` (+ public) | NOT_RUN | NOT_RUN | NOT_RUN | Acquisition workflow |
| T6 | `FEATURE_P2_PARTNER_PORTAL` (+ public) | NOT_RUN | NOT_RUN | NOT_RUN | Partner / developer portal |
| T7 | `FEATURE_P2_MAP` (+ public) | NOT_RUN | NOT_RUN | NOT_RUN | Map surfaces |
| T8 | `FEATURE_P2_TOOLS` (+ public) | NOT_RUN | NOT_RUN | NOT_RUN | Finance / legal tools |
| T9 | `FEATURE_P2_AI` (+ public); kill switch OFF-capable | NOT_RUN | NOT_RUN | NOT_RUN | AI recommend / assist |
| T10 | `FEATURE_P2_ANALYTICS_EXPANSION` | NOT_RUN | NOT_RUN | NOT_RUN | Expanded analytics sink |

---

## Viewport × persona coverage (all NOT_RUN)

| Surface family | Desktop | Mobile | Customer | Partner | Staff | Anonymous |
| --- | --- | --- | --- | --- | --- | --- |
| Public Phase 1 journeys (flag-OFF) | NOT_RUN | NOT_RUN | NOT_RUN | — | — | NOT_RUN |
| Account / saved search (T1 ON) | NOT_RUN | NOT_RUN | NOT_RUN | — | — | NOT_RUN |
| Ops leads (T2 ON) | NOT_RUN | NOT_RUN | — | — | NOT_RUN | — |
| Notifications (T3 ON) | NOT_RUN | NOT_RUN | NOT_RUN | — | NOT_RUN | — |
| CRM sync (T4 ON) | NOT_RUN | NOT_RUN | — | — | NOT_RUN | — |
| Acquisition (T5 ON) | NOT_RUN | NOT_RUN | NOT_RUN | — | NOT_RUN | NOT_RUN |
| Partner portal (T6 ON) | NOT_RUN | NOT_RUN | — | NOT_RUN | NOT_RUN | NOT_RUN |
| Map (T7 ON) | NOT_RUN | NOT_RUN | NOT_RUN | — | — | NOT_RUN |
| Tools (T8 ON) | NOT_RUN | NOT_RUN | NOT_RUN | — | — | NOT_RUN |
| AI (T9 ON) | NOT_RUN | NOT_RUN | NOT_RUN | — | — | NOT_RUN |
| Analytics (T10 ON) | NOT_RUN | NOT_RUN | NOT_RUN | — | NOT_RUN | NOT_RUN |

---

## Flag state pairs (all NOT_RUN)

| Step | Flag-OFF regression | Flag-ON step smoke |
| --- | --- | --- |
| T1–T10 | NOT_RUN | NOT_RUN |

---

## Blockers preventing execution

1. No Owner-provisioned staging Supabase project / Preview rewire
2. Vercel Preview Deployment Protection historically returns Login page to unauthenticated agents
3. Production freeze — must not enable flags or apply Phase 2 migrations on Production

---

## Decision

Matrix published for tracking only. **Zero PASS claims.** Re-run and fill cells only after staging is wired and accessible.
