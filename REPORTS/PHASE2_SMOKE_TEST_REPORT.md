# Phase 2 Smoke Test Report (Staging Cutover)

**Date:** 2026-07-21
**Status refresh:** 2026-07-22
**RC:** `v2.0.0-rc1` (`0eca210`)
**Environment attempted:** Vercel Preview
**Result:** **INCOMPLETE / BLOCKED**
**Production posture:** Running RC1 `0eca210` via Vercel automatic Git deployment; `FEATURE_P2_*` OFF; no Phase 2 migrations; **FREEZE CURRENT PRODUCTION — NO CUTOVER**

---

## Scope attempted

| Surface | Result | Notes |
| --- | --- | --- |
| Preview HTTP routes (EN/ZH/TH home, listings, favorites, compare, marketplace, faq, inquiry, map, tools, account, partners, robots, sitemap) | **BLOCKED** | Responses are Vercel Login page (SSO), not app HTML |
| Production home `/en` | PASS | HTTP 200 — Production serves RC1 flags-off (Phase 1–equivalent); not broken by preview deploy |
| Local/CI contract suite (prior RC gates) | PASS | Already validated at RC publish; not a substitute for staging smoke |

## Journey checklist (staging)

| Journey | Status |
| --- | --- |
| Customer workflows | NOT RUN (SSO) |
| Partner workflows | NOT RUN |
| Developer workflows | NOT RUN |
| Inquiry flow | NOT RUN |
| Favorites | NOT RUN |
| Comparison | NOT RUN |
| Maps | NOT RUN |
| Finance tools | NOT RUN |
| Legal tools | NOT RUN |
| AI recommendations | NOT RUN |
| Analytics | NOT RUN |
| Multilingual routes | NOT RUN |
| SEO | NOT RUN on preview |
| Accessibility | NOT RUN on preview |
| Responsive | NOT RUN on preview |

## Evidence

Preview base:
`https://gothailandhome-lh5toy2v2-tai-faith-agri-platform-s-projects.vercel.app`

Sample unauthenticated GET returns title **“Login – Vercel”** for all probed paths.

## Decision

Smoke validation for staging cutover is **BLOCKED** pending Deployment Protection bypass or dedicated public staging hostname.
