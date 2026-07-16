# SEARCH_CONSOLE_READY

**Milestone:** Phase 11 — Google Readiness  
**Date:** 2026-07-16  
**Property:** https://www.gothailandhome.com

## Repo readiness vs operator readiness

| Item | Repo status | Operator action |
|------|-------------|-----------------|
| Production host reachable | PASS | — |
| `robots.txt` allows public crawl | PASS | Confirm in GSC robots tester |
| `sitemap.xml` returns 200 + URL set | PASS | **Submit** https://www.gothailandhome.com/sitemap.xml |
| Canonical absolute www URLs | PASS | URL Inspection spot-check |
| hreflang en / zh-CN / th / x-default | PASS | International targeting review |
| JSON-LD present on core templates | PASS | Rich Results / URL Inspection |
| Admin disallowed | PASS | — |
| GSC property verified | **NOT EVIDENCED IN REPO** | Verify DNS/HTML/tag ownership |
| Sitemap coverage green | **NOT EVIDENCED** | Monitor 7–14 days post-submit |
| GA4 / Search Console linking | **NOT EVIDENCED** | Optional measurement |

## Submit package

1. Verify property: `https://www.gothailandhome.com` (include www).  
2. Submit sitemap: `https://www.gothailandhome.com/sitemap.xml`.  
3. Request indexing for homepage + 3–5 representative templates (project, developer, district, listing, properties index).  
4. Watch Coverage / Page indexing for soft-404 and excluded-by-robots.  
5. After Media Factory binaries deploy, re-check OG/hero images (SVG default OG may underperform in some previews).

## Sitemap snapshot (live)

- URLs: **3456**
- Bytes: **745730**
- Properties/locale: **3003** (includes index; detail ≈ 3000 across 3 locales → ~1000 per locale)
- Projects/locale detail: ~50
- Known cap risk: listing generation historically PostgREST-capped (~1000/locale) — live count en properties paths = **1001**

## Gate

**SEARCH_CONSOLE_READY (code/crawl): YES (technical)**  
**SEARCH_CONSOLE_LIVE (ops): ACTION REQUIRED** — verification + sitemap submit not evidenced in repository.
