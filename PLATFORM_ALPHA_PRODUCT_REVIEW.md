# PLATFORM_ALPHA_PRODUCT_REVIEW

**Date:** 2026-07-15  
**Site under review:** local production `http://127.0.0.1:3000`  
**Head:** `c363284` (post–P0 stabilization)  
**Mode:** Read-only product review — no UI implementation  

## Verdict

**Public Alpha: NOT READY** (aligned with prior Alpha readiness).  
P0 engineering blockers for project 500s and search HTML bloat are fixed, but product credibility is still limited by: missing listing contacts on sourced inventory, pervasive “Images unavailable”, oversized city/district pages, nav clutter, and placeholder About/copy debt.

## Personas

| Persona | What works | Friction |
|---------|------------|----------|
| Buyer | Sale filters, project pages, prices with source-ish summaries | No broker; weak media; city pages slow |
| Tenant | Rent badge + rent filters; viewing request form | Same contact/media gaps |
| Owner | List Your Property intake exists | Hard to find vs nav noise; unclear post-submit |
| Agent / agency | Agency partnership form | No agent dashboard; no inventory tools |
| Developer | Developer profiles + partnership form | Seed developers still listed (Sathorn Living, etc.) |
| Platform help seeker | Contact shows CS roles; listing CTA separates help | Apple visible as CS (correct) but dense next to missing listing contact |

## Page-type matrix (EN smoke)

| Page type | Route sample | Status | Notes |
|-----------|--------------|--------|-------|
| Homepage | `/en` | 200 | Brand hero + search; long scroll of projects/devs |
| Buy / Rent | `/en/properties?listing_type=*` | 200 | Works; paginated |
| Properties / Search | `/en/properties`, `/en/search` | 200 | ~0.2 MB HTML; page=2 works |
| Listing detail | `/en/properties/xt-phayathai-rent-fazwaz-6200779` | 200 | Missing media + missing contact honest |
| Project detail | `/en/projects/ashton-asoke` | 200 | Facilities/POI no longer 500 |
| Developer | `/en/developers/sansiri` | 200 | **~1.1 MB** — unbounded listing dump |
| District | `/en/districts/watthana` | 200 | **~1.4 MB** |
| City | `/en/cities/bangkok` | 200 | **~6.7 MB** — P0 perf debt remains off `/properties` |
| Knowledge/article | — | **Absent** | No routes |
| Find My Home | `/en/find-my-home` | 200 | Private brief form |
| List property | `/en/list-your-property` | 200 | Review intake |
| Dev / agency partner | `/en/partners/*` | 200 | Pending-review copy |
| Contact | `/en/contact` | 200 | Platform CS only |
| Auth / dashboards | `/admin` | Present | Not public Alpha surface |
| 404 | `/en/does-not-exist-404` | 404 | Minimal |
| Empty results | `?q=zzzz-no-match-xyz` | 200 | Empty grid message |

ZH/TH shells load (titles localized). Listing contact copy is localized; some smoke string checks are EN-only.

Evidence: `pipelines/factory/overnight/_runs/alpha-product-route-smoke.json`

## Cross-cutting scores (qualitative)

| Dimension | Assessment |
|-----------|------------|
| Purpose clarity | Medium — marketplace + content hybrid |
| Visual hierarchy | Medium on home hero; weak below fold (lists compete) |
| Trust | Mixed — “verified” claim vs placeholder About MVP text |
| Contact safety | Good separation on listing detail |
| Media honesty | Good unavailable state; bad for conversion |
| Perf | Properties/search improved; **cities/districts/developers regress** |
| i18n | Routes exist; content still EN-heavy on listing body text |
| A11y | Basic landmarks; dense nav; forms labeled |

## Do not redesign yet

This review feeds [ALPHA_DECISION_BACKLOG.md](ALPHA_DECISION_BACKLOG.md). No homepage or UI implementation in this milestone.
