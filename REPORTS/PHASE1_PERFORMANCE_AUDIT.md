# Phase 1 Performance Audit

**Date:** 2026-07-20  
**Evidence:** `test:performance-budget`, production `next build` artifact sizes

---

## 1. Image / media

| Control | Status |
| --- | --- |
| `next/image` on cards/gallery/developer/project | Pass |
| Lazy loading default; bounded `priority` | Pass |
| Listing media frame `fetchPriority` gated | Pass |
| No full-catalog SSR on `/properties` | Pass |
| Pagination bounds | Pass |

## 2. Fonts

`next/font/google` — Plus Jakarta, Noto Sans SC, Noto Sans Thai, Geist Mono via `document-fonts` — self-hosted by Next font pipeline.

## 3. Bundle observations (local `.next/static/chunks`)

| Observation | Approx size |
| --- | --- |
| Largest chunk | ~222 KB |
| Next largest | ~138 KB, ~110 KB |
| Additional significant | ~53 KB, ~43 KB |

These are Turbopack production chunk fingerprints from local build; not Lighthouse field data. No unsupported performance marketing claims in UI (`test:performance-budget`).

## 4. Prefetch / lazy

Next.js Link default prefetch behavior retained. Client islands limited to engagement (favorites/compare), filters, forms, analytics consent.

## 5. Residuals

| ID | Severity | Issue | Status |
| --- | --- | --- | --- |
| PERF-1 | P2 | Turbopack NFT filesystem trace (glossary/content loader) | Accepted documented residual |
| PERF-2 | P2 | Many listings use honest empty/placeholder media (LCP opportunity) | Data/media ops — not RC redesign |
| PERF-3 | P3 | No CI bundle-size absolute budget file beyond script contracts | Acceptable for Phase 1 RC |

## 6. Verdict

**PASS WITH KNOWN RESIDUALS** — Agreed local budgets pass; NFT warning non-fatal.
