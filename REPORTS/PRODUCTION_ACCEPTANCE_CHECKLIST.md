# Production Acceptance Checklist

**Product:** GoThailandHome Phase 1  
**Version:** `v1.0.0-rc1` (pending Owner tag)  
**Date:** 2026-07-20  
**Environment:** ☐ Staging ☐ Production  

Use after deploy (or on staging promotion). Mark each row Pass / Fail / N/A. Failures block GO unless Owner waives with reason.

---

## A. Core discovery

| # | Surface | Checks | Result |
| --- | --- | --- | --- |
| A1 | Homepage | Hero, primary CTAs, locale switch, no yield claims | ☐ |
| A2 | Listings | Filters, sort, pagination, empty state, URL state | ☐ |
| A3 | Property | Price/trust labels, gallery, inquiry CTA, contacts separated | ☐ |
| A4 | Project | Specs/evidence labels, listings preview, inquiry context | ☐ |
| A5 | Developer | Logo/status honesty, portfolio subset, contact paths | ☐ |
| A6 | District | Summary, project/listing previews, empty amenities honest | ☐ |

## B. Engagement

| # | Surface | Checks | Result |
| --- | --- | --- | --- |
| B1 | Favorites | Add/remove, persistence, empty state, nav entry | ☐ |
| B2 | Compare | 2–4 items, noindex, unknown≠zero, mobile scroll | ☐ |
| B3 | Contact | Platform CS role only, marketplace handoff | ☐ |
| B4 | Inquiry | Viewing/marketplace forms → success; context label; no private payload leak | ☐ |
| B5 | Marketplace hub | Five audience entries; private ≠ published copy | ☐ |

## C. Content

| # | Surface | Checks | Result |
| --- | --- | --- | --- |
| C1 | Knowledge | Approved articles only; citations; draft 404 | ☐ |
| C2 | Blog | Separated from reference guides; author/dates | ☐ |
| C3 | Investment Guide | Disclaimer/version/owner; no calculator/yield UI | ☐ |
| C4 | Legal Guide | Jurisdiction/disclaimer; no personalized advice claim | ☐ |
| C5 | FAQ | Categories/anchors; schema parity; guide links | ☐ |

## D. SEO

| # | Check | Result |
| --- | --- | --- |
| D1 | Title/description present per locale sample | ☐ |
| D2 | Canonical + hreflang on sample pages | ☐ |
| D3 | OG/Twitter tags present | ☐ |
| D4 | JSON-LD present where expected (home/listing/FAQ/article) | ☐ |
| D5 | `/sitemap.xml` lists approved families; no `/leads/` | ☐ |
| D6 | `/robots.txt` disallows admin (+ leads); sitemap URL correct | ☐ |

## E. Analytics

| # | Check | Result |
| --- | --- | --- |
| E1 | Consent banner visible before tracking | ☐ |
| E2 | No provider network before consent (DevTools) | ☐ |
| E3 | Deny/dismiss leaves pages functional | ☐ |
| E4 | Missing measurement IDs remain inert | ☐ |

## F. Performance

| # | Check | Result |
| --- | --- | --- |
| F1 | Listing page does not stall on huge payload | ☐ |
| F2 | Above-fold images use sensible priority | ☐ |
| F3 | No unsupported “fastest/best” performance marketing claims | ☐ |

## G. Accessibility

| # | Check | Result |
| --- | --- | --- |
| G1 | Skip to content works | ☐ |
| G2 | Keyboard reaches primary nav + mobile menu | ☐ |
| G3 | Form errors associated/visible | ☐ |
| G4 | FAQ / filters operable by keyboard | ☐ |

## H. Locales

| # | Check | Result |
| --- | --- | --- |
| H1 | EN page set smoke | ☐ |
| H2 | ZH page set spot-check | ☐ |
| H3 | TH page set spot-check | ☐ |
| H4 | Language switch preserves path/query | ☐ |

---

## Decision

| Outcome | Criteria |
| --- | --- |
| **GO** | All critical rows Pass; no P0/P1 production defects |
| **GO WITH WAIVERS** | Owner documents accepted P2/P3 only |
| **NO-GO** | Any critical Fail without waiver |

**Recorded decision:** ☐ GO ☐ GO WITH WAIVERS ☐ NO-GO  

**Signer:** __________________ **Date:** __________

---

## Notes / defects

| ID | Severity | Surface | Description | Waiver? |
| --- | --- | --- | --- | --- |
| | | | | |

**Do not start Phase 2 from this checklist.**
