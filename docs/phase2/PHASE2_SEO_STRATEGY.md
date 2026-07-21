# Phase 2 — SEO Strategy

**Baseline:** Phase 1 SEO (metadata, sitemap, JSON-LD, hreflang EN/ZH/TH)
**Status:** Planning only
**Date:** 2026-07-21

---

## 1. Goals

1. Grow organic discovery for **new decision tools** (map, mortgage, legal workflow hubs) without diluting listing/project SEO.
2. Protect Phase 1 indexation quality (noindex private account/ops).
3. Support international SEO for existing locales; plan future locale growth carefully.
4. Ensure AI and personalized pages do not create thin/duplicate index bloat.

---

## 2. Indexation policy matrix

| Surface class | Index | Sitemap | Notes |
| --- | --- | --- | --- |
| Phase 1 public discovery | yes | yes | Preserve |
| `/{lang}/map` + geo deep links | yes | yes | Unique titles/descriptions per geo |
| Tools hubs (mortgage, finance, legal) | yes | yes | Strong disclaimers; educational intent |
| Investment assist landing | yes (careful) | yes | Avoid thin query variants |
| Account / auth / ops / partner app | no | no | `noindex, nofollow` |
| Saved search result URLs | no (default) | no | Prefer private; if share links exist → `noindex` |
| Recommendation API responses | n/a | n/a | Not pages |
| Favorites | revisit SEO-1 | policy | Keep feature landing if useful; body remains device/account |

---

## 3. Information architecture SEO

- **Map:** Canonical `/{lang}/map`; district deep links `/{lang}/map/districts/[slug]` with self-canonical; avoid infinite viewport query indexation (canonicalize stripped query).
- **Tools:** One hub per tool; calculators use progressive enhancement; results state in query only if non-indexable or canonical to hub.
- **Internal links:** Home → Tools; District pages ↔ Map; Property detail → Map pin; Knowledge legal/investment ↔ tools.
- **Breadcrumbs:** Extend Phase 1 breadcrumb JSON-LD to new public hubs.

---

## 4. Metadata & content standards

| Requirement | Rule |
| --- | --- |
| Title / description | Unique per locale; no keyword stuffing |
| H1 | One primary H1; brand-safe |
| Open Graph | Required on public tools/map |
| JSON-LD | `WebPage` / `FAQPage` where applicable; `RealEstateListing` only when data evidenced |
| Disclaimers | Visible + crawlable text for finance/legal/AI |
| Thin content | Tools pages need educational copy (≥ Owner-defined quality bar), not widget-only |

---

## 5. Technical SEO

- Extend `sitemap.ts` for approved public Phase 2 routes only.
- Extend `robots.ts` disallow for `/account`, `/ops`, `/partners/app`, auth callbacks, lead private paths.
- Preserve hreflang + `x-default` for new indexable locales pages.
- Performance: map tiles / JS budgets must not tank CWV on listing templates.
- Pagination / filter URLs: follow Phase 1 listing filter indexation rules (prefer noindex for arbitrary filter combos unless deliberately landed).

---

## 6. Content SEO program (editorial)

| Theme | Action |
| --- | --- |
| Map landing | District guides already in knowledge — cross-link |
| Mortgage tool | Fee/tax educational articles (non-advice) |
| Legal workflow | Link `G_LEGAL` approved guidance pages |
| Investment assist | Link investment guides; reinforce forbidden claims |
| Multilingual | EN/ZH/TH parity before indexing new surfaces |

---

## 7. Analytics ↔ SEO

Track organic landings on new hubs; Search Console property coverage for map/tools; watch soft-404 risk on empty map states.

Proposed events: `seo_tool_landing`, `map_organic_session` (finalize M8).

---

## 8. Future multilingual growth (SEO)

1. Stabilize EN/ZH/TH quality on Phase 2 surfaces.
2. Evaluate locale #4 only after: dictionary ops, hreflang capacity, content ownership, legal review.
3. Never auto-translate legal/investment without human review.
4. Soft-launch new locale behind flag with `noindex` until QA gate.

---

## 9. SEO gates per milestone

| Milestone | SEO gate |
| --- | --- |
| M1–M4 | Private surfaces noindex verified |
| M5 | Map canonical + sitemap + CWV sample |
| M6 | Tools educational copy + disclaimer crawlability |
| M7 | AI landings not thin; no parameterized index flood |
| M8 | Full SEO regression + Search Console checklist |

---

## 10. Risks

- Duplicate content between `/properties` filters and `/map` queries
- Indexing account-like URLs
- AI-generated text published without review
- Locale mismatch titles

Controls in `PHASE2_RISK_REGISTER.md`.
