# Phase 2 — Information Architecture

**Baseline:** `v1.0.0` LIVE public IA
**Status:** Planning only — no routes created
**Date:** 2026-07-21

---

## 1. Principles

1. Preserve Phase 1 public discovery IA; **extend**, don’t replace.
2. Authenticated surfaces live under clear namespaces (`/account`, `/ops`, `/partners`).
3. Every new public URL needs locale prefix `/{lang}/…`, metadata, and sitemap policy.
4. Private/ops URLs must remain non-indexable (`robots` / `noindex`).
5. One primary job per major nav item.

---

## 2. Phase 1 retained public IA (do not regress)

| Area | Pattern |
| --- | --- |
| Home | `/{lang}` |
| Buy / rent / search / properties | `/{lang}/buy`, `/rent`, `/search`, `/properties`, `/properties/[id]` |
| Projects / developers / districts / cities | existing hubs |
| Favorites / compare | device-local (evolve carefully in M1) |
| Marketplace / contact / lead forms | existing |
| Knowledge / blog / FAQ / about | existing |

---

## 3. Proposed Phase 2 IA additions

### 3.1 Customer (M1+)

| Route (proposed) | Purpose | Index |
| --- | --- | --- |
| `/{lang}/account` | Dashboard hub | noindex |
| `/{lang}/account/saved` | Favorites / compare sync | noindex |
| `/{lang}/account/searches` | Saved searches | noindex |
| `/{lang}/account/inquiries` | Customer’s lead history | noindex |
| `/{lang}/account/alerts` | Notification preferences | noindex |
| `/{lang}/auth/*` | Sign-in / callback / sign-out | noindex |

### 3.2 Ops — leads & acquisition (M2–M3)

| Route (proposed) | Purpose | Index |
| --- | --- | --- |
| `/ops` or `/admin/ops` | Staff shell | noindex |
| `/ops/leads` | Lead inbox | noindex |
| `/ops/leads/[id]` | Lead detail | noindex |
| `/ops/acquisition` | Acquisition queue | noindex |
| `/ops/acquisition/[id]` | Case detail / review | noindex |

Exact prefix (`/ops` vs expand `/admin`) decided in M0 IA freeze.

### 3.3 Partners (M4)

| Route (proposed) | Purpose | Index |
| --- | --- | --- |
| `/{lang}/partners/portal` | Partner landing (marketing OK) | indexable landing only |
| `/partners/app` (or similar) | Authenticated partner app | noindex |
| `/partners/app/developer/*` | Developer management | noindex |
| `/partners/app/agent/*` | Agent workflow | noindex |

### 3.4 Public tools (M5–M6)

| Route (proposed) | Purpose | Index |
| --- | --- | --- |
| `/{lang}/map` | Interactive map discovery | index |
| `/{lang}/map/districts/[slug]` | Geo deep links | index |
| `/{lang}/tools/mortgage` | Mortgage calculator | index |
| `/{lang}/tools/finance` | Finance scenarios hub | index |
| `/{lang}/tools/legal` | Legal workflow guide hub | index (disclaimer-bound) |

### 3.5 AI surfaces (M7)

| Route (proposed) | Purpose | Index |
| --- | --- | --- |
| `/{lang}/recommend` or embedded modules | Recommendation UX | prefer embedded on properties/home; standalone optional |
| `/{lang}/tools/investment-assist` | Investment analysis assist | index with strong disclaimers |

---

## 4. Navigation model

### 4.1 Public primary nav (evolve)

Keep Phase 1 groups; add carefully:

- **Discover** — Buy, Rent, Map (new), Districts…
- **Projects** — Projects, Developers
- **Tools** — Mortgage, Legal guide, Investment assist (phased visibility)
- **Learn** — Knowledge, Blog, FAQ
- **Account** — Sign in / Dashboard (when authenticated)

### 4.2 Customer secondary nav

Dashboard · Saved · Searches · Inquiries · Alerts · Settings

### 4.3 Ops / partner shells

Role-filtered side nav; English-first for ops unless Owner expands (Phase 1 admin EN-only residual).

---

## 5. Content types & modules

| Module | Placement |
| --- | --- |
| Saved search card | Account + optional listing results banner |
| Lead status timeline | Account inquiries + ops lead detail |
| Acquisition checklist | Ops acquisition case |
| Map cluster / pin drawer | `/map` + optional properties split view |
| Finance result summary | Tools + shareable (non-index query) |
| Legal checklist progress | Tools/legal (device or account) |
| Recommendation rail | Property detail, home, account |
| AI disclaimer block | Mandatory on AI surfaces |

---

## 6. State ownership

| State | Phase 1 | Phase 2 target |
| --- | --- | --- |
| Favorites / compare | `localStorage` | Dual-write → account sync (opt-in) |
| Saved searches | n/a | Server (account) |
| Lead records | form → storage/placeholder | Lead service + CRM mirror |
| Notification prefs | n/a | Account |
| Acquisition cases | form only | Case store + audit |
| Map viewport filters | n/a | URL-serializable query state (SEO-friendly share) |

---

## 7. Localization IA rules

- All customer-facing Phase 2 routes require EN/ZH/TH copy keys before release gate.
- Ops/partner apps may remain EN-first with documented exception (carry Phase 1 P3 policy unless Owner upgrades).
- Hreflang only for indexable public tools/map pages.
- Locale switch must preserve path/query on public pages (Phase 1 contract).

---

## 8. Accessibility IA notes

- Map: keyboard alternatives for pin lists; do not trap focus.
- Dashboards: landmark regions, skip links, table semantics for lead lists.
- Calculators: associated labels, live regions for results.
- AI: dismissible panels; screen-reader-friendly explanations.

---

## 9. Open IA decisions (M0)

1. Staff shell prefix: expand `/admin` vs new `/ops`.
2. Partner app domain path vs subdomain (future).
3. Whether `/map` replaces or complements `/properties` list UX.
4. Favorites sitemap policy revisiting (Phase 1 SEO-1 residual).
