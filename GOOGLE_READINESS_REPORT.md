# GOOGLE_READINESS_REPORT

**Milestone:** Phase 10 Sprint 6  
**Date:** 2026-07-16  
**Scope:** Google Search + measurement + related webmaster surfaces (Bing / IndexNow included as adjacent readiness)

## Overall: **ACTION REQUIRED** (not launch-certified)

Code exposes crawlable Alpha URLs with schema and sitemap. **Operator verification and analytics are not evidenced as live** in this repository audit.

## Google Search

| Item | Status | Evidence |
|------|--------|----------|
| Absolute canonical base `www.gothailandhome.com` | PASS | `siteConfig` + metadata helpers |
| robots.txt sitemap pointer | PASS | `src/app/robots.ts` |
| Dynamic sitemap | PASS* | `src/app/sitemap.ts` (*listing page-size cap) |
| JSON-LD Organization / WebSite / RealEstateListing / etc. | PASS | `src/lib/seo/schema.ts` + page JsonLd |
| Google Search Console property verified | **NOT EVIDENCED** | No verification token / ops runbook completion in repo |
| Sitemap submitted + coverage green | **NOT EVIDENCED** | Ops action |
| Rich Results validation (live) | **NOT RE-RUN** | Recommend GSC URL inspection post-deploy |

## GA4

| Item | Status |
|------|--------|
| Measurement ID in env | **MISSING** (`.env.example` has Ads/Meta only) |
| gtag/GTM bootstrapped for GA4 | **NO** — `AdsTrackingPlaceholders` is conversion placeholder only |
| Key events (lead submit, view listing) | Partial stubs via `gtag('event','conversion')` on project lead — not GA4-standard |
| **Gate** | **FAIL / ACTION** |

## Bing Webmaster

| Item | Status |
|------|--------|
| `msvalidate` / Bing verification | **NOT EVIDENCED** |
| Sitemap submit | **NOT EVIDENCED** |
| **Gate** | **ACTION** |

## IndexNow

| Item | Status |
|------|--------|
| API key file under `public/.well-known` | **ABSENT** |
| Publish/update ping pipeline | **ABSENT** |
| **Gate** | **ACTION** |

## Recommended minimum before paid/public marketing

1. GA4 property + Measurement ID + page_view + lead events  
2. GSC verify + sitemap submit + 7-day coverage check  
3. Bing verify (or GSC import)  
4. IndexNow key + ping on project/listing publish  

Until then: soft Alpha is **PASS WITH ACTIONS**; do not claim “Google-ready measurement.”
