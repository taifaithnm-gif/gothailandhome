# SPRINT_C_PREVIEW_QA

**Date:** 2026-07-30  
**Branch:** `preview/sprint-c-final-qa`  
**Commit:** `60f331c`  
**Local preview:** `http://127.0.0.1:3010`  
**Vercel Preview:** `https://gothailandhome-96m8gacic-tai-faith-agri-platform-s-projects.vercel.app`  
**Alias:** `https://gothailandhome-git-pr-1dd927-tai-faith-agri-platform-s-projects.vercel.app`  
**Deployment ID:** `dpl_FexpGUfZSMdZd5Hr7N8VCkXJPRvA`  
**Vercel status:** Ready (Deployment Protection / SSO gated)

## Playwright (Chromium) — local build of Sprint C

Evidence: `.work/sprint-c-preview-qa/evidence/playwright-local-results.json`

| Check | Result |
| --- | --- |
| Home `/en` `/zh` `/th` | 200 |
| Cities hub + Bangkok/Pattaya/Phuket/Chiang Mai | 200 |
| Developers / Projects / Knowledge / FAQ | 200 |
| Knowledge article detail | 200 |
| robots.txt / sitemap.xml | 200 |
| 404 on smoke routes | none |
| PageError | 0 |
| Console errors | 0 |
| Hydration suspect | none |
| Internal links (home sample 30) | 0 broken |

## SEO QA (same run)

| Check | Result |
| --- | --- |
| Canonical | PASS (all HTML routes) |
| OpenGraph title | PASS |
| Twitter Card | PASS |
| hreflang (≥3) | PASS |
| Organization (home) | PASS |
| Article (buying guide) | PASS |
| FAQPage (buying guide + city pages + FAQ hub) | PASS |
| BreadcrumbList | PASS (city + FAQ + article surfaces) |
| Sitemap | PASS (66 knowledge article URLs; 18 city URLs) |
| Robots | PASS |

## Preview deployment note

Unauthenticated public GET to the Vercel Preview URL returns **302 → Vercel SSO**. That is expected under Deployment Protection. Functional QA for Sprint C content was executed against the identical production build served locally on port 3010.
