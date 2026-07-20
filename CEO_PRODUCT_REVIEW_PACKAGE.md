# CEO Product Review — Package

**Product:** GoThailandHome · **Host:** `https://www.gothailandhome.com`
**Baseline commit:** `eedf3f7` · **Prepared:** 2026-07-17
**Method:** Read-only source inspection + production sitemap/HTTP verification. No code modified.

This is the single entry document. It merges:

| Document | Role |
| --- | --- |
| `CEO_PRODUCT_REVIEW_GUIDE.md` | Method, severity, evidence, stop/go |
| `CEO_PRODUCT_REVIEW_CHECKLIST.md` | 218 executable steps |
| `CEO_PRODUCT_REVIEW_ISSUE_TEMPLATE.md` | Defect record format |
| **This file** | Legal audit · route audit · real URLs · issue register · time estimate |

---

# 1. Legal Pages Audit

**Verified by:** directory scan of `src/app`, string scan of `src` and
`src/dictionaries/*.json`, full read of `src/components/layout/site-footer.tsx`,
and live HTTP checks.

| Page | Route | Implemented | Evidence |
| --- | --- | --- | --- |
| **Privacy Policy** | — | **NO** | No route dir. `/en/privacy` → **404** |
| **Terms of Service** | — | **NO** | No route dir. `/en/terms` → **404** |
| **Cookie Policy** | — | **NO** | No route dir. `/en/cookies` → **404** |
| **Disclaimer** | — | **NO** | No route dir. `/en/disclaimer` → **404** |
| **Legal hub** | — | **NO** | `/en/legal` → **404** |
| **Contact** | `/{lang}/contact` | **YES** | 200 in en/zh/th |

## 1.1 Contact — recorded detail

| Attribute | Value |
| --- | --- |
| Route | `/{lang}/contact` |
| Navigation | Present in header primary nav (Company group in the mobile drawer) |
| Footer | Present in the **Company** column |
| Language support | Full — en / zh / th, all 200; in `sitemap.ts` static route list |
| Sitemap | Included |

## 1.2 Exactly what is missing

1. **No Privacy Policy page exists** — no route, no component, no dictionary
   namespace. The only privacy string in the product is
   `marketplace.findPrivacyNote` ("Private demand lead only. We will not publish
   your requirements publicly.") shown inline on the Find My Home form.
2. **No Terms of Service page exists** — no route, no content.
3. **No Cookie Policy page exists** — and no cookie consent banner was found.
4. **No standalone Disclaimer page exists.** Disclaimer text exists only as
   inline, page-scoped strings: `developer.developerDisclaimer`
   ("GoThailandHome does not represent this developer…") and
   `developer.projectsDisclaimer`. These are role-separation statements on
   developer pages, not a legal disclaimer document.
5. **Footer has no legal column.** `site-footer.tsx` renders exactly two link
   columns — **Explore** (7 links) and **Company** (4 links: About, Knowledge,
   Partners, Contact) — plus a copyright line
   (`© {year} {brand}. {footer.rights}`). There is no Privacy / Terms / Cookie /
   Disclaimer link anywhere in the footer, header, or any page.
6. **No dictionary keys exist** for any legal page in en/zh/th, so this is not a
   translation gap — the content does not exist in any language.

**Impact on the review:** checklist item **1.2.9** ("look for legal links in the
footer") **will fail**. It is pre-recorded below as **CRIT-02**. A property
platform collecting name, email, phone, LINE ID, and WhatsApp through six forms,
with an explicit consent checkbox writing `consent_at` to storage, has no
published privacy policy for that consent to reference.

---

# 2. Complete Route Audit

**Verified by:** `find src/app -name page.tsx`, `src/app/sitemap.ts`, production
`sitemap.xml` (3,456 URLs), and HTTP status checks on 34 routes.

Locale prefix is mandatory on every public page: `lang ∈ {en, zh, th}`.

## 2.1 Entity coverage — index and detail

| Entity | Index | Detail | Published (per locale) | Status |
| --- | --- | --- | --- | --- |
| **City** | `/{lang}/cities` ✅ 200 | `/{lang}/cities/{slug}` ✅ 200 | 6 | **Complete** |
| **District** | ❌ **MISSING** (`/en/districts` → 404) | `/{lang}/districts/{slug}` ✅ 200 | 56 | **Gap** |
| **Developer** | `/{lang}/developers` ✅ 200 | `/{lang}/developers/{slug}` ✅ 200 | 23 | **Complete** |
| **Project** | `/{lang}/projects` ✅ 200 | `/{lang}/projects/{slug}` ✅ 200 | 50 | **Complete** |
| **Listing** | `/{lang}/properties` ✅ 200 (+ `/buy`, `/rent`) | `/{lang}/properties/{id}` ✅ 200 | 1,000 (547 sale / 453 rent) | **Complete** |
| **Article** | ❌ **MISSING** | ❌ **MISSING** | 0 routed (1 authored) | **Not implemented** |
| **Guide** | `/{lang}/knowledge` ✅ 200 | ❌ no `{slug}` route — 2 hardcoded pages | 2 | **Partial** |

## 2.2 Missing routes

1. **`/{lang}/districts` (district index) — does not exist.** 404 in all three
   languages, while 56 district detail pages are published and in the sitemap.
   Districts are reachable only from (a) the homepage section, which renders
   `districts.slice(0, 12)` — **Bangkok only, capped at 12** — and (b) city
   detail pages via `listDistrictsByCity`. **At least 44 of 56 district pages are
   unreachable from the homepage** and depend entirely on the city-page path.
   They are indexable by Google but have no browsable index for a human.
2. **`/{lang}/knowledge/{slug}` (article detail) — does not exist.** No route
   file, and `grep` confirms **no source file reads `content/knowledge/articles`**.
3. **`/{lang}/knowledge/articles` (article index) — does not exist.**

## 2.3 Unreachable / orphan pages

| Item | State | Assessment |
| --- | --- | --- |
| `/{lang}/search` | **307 redirect** → `/properties`, `noindex` | Orphan **by design**. Removed from nav and footer in Wave 2; kept for old bookmarks. Not a defect. |
| `/{lang}/leads/success` | **404 without a valid `?channel=`** | **By design** — `page.tsx` calls `notFound()` when `parseLeadChannelParam` returns null. Guards direct access. Reached only by post-submit redirect. Not a defect. |
| `/{lang}/leads/error` | 200 (tolerates missing params) | Reached by redirect; `noindex`. Not in nav — correct. |
| `/admin`, `/admin/login`, `/admin/properties/*` | 307; `robots.ts` disallows `/admin` | Internal, non-public. Correctly excluded. |
| **`content/knowledge/articles/`** | **1 article + INDEX.json, 0 consumers** | **Orphan content.** `bts-skytrain-overview` is authored, verified (2026-07-16), and translated en/zh/th, but `/en/knowledge/bts-skytrain-overview` → **404**. Content factory output with no public route. |
| `src/components/listings/hero-search.tsx` | Imported by no route | Dead legacy component (per `DESIGN_QA_REPORT`). Renders nowhere; not a review target. |
| `src/components/search/search-form.tsx` | Imported by no route | Dead legacy component. Same. |

## 2.4 Dead navigation

**None.** Every header and footer destination was HTTP-verified:

- Header (11): home, buy, rent, projects, cities, developers, marketplace, knowledge, properties, about, contact — **all 200**.
- Footer Explore (7) + Company (4) — **all 200**, including Partners → `/partners/developers` (the Wave 1 fix holds).
- "Search" is absent from both header and footer — the Wave 2 removal holds.

**Caveat, not dead nav:** the nav label is **Cities** while the homepage section
is **Explore Bangkok districts** and the depth is district-level. Cities index
lists 6 cities; districts have no index. Judge as IA clarity, not a broken link.

---

# 3. Representative Navigation — real, verified URLs

**Discovery method:** production `sitemap.xml` → 3,456 live URLs → one
representative per module → each HTTP-verified below. **No placeholders.**
All returned **200** unless noted.

| Module | Real URL | Code |
| --- | --- | --- |
| Home | `https://www.gothailandhome.com/en` | 200 |
| Home (Chinese) | `https://www.gothailandhome.com/zh` | 200 |
| Home (Thai) | `https://www.gothailandhome.com/th` | 200 |
| Buy landing | `https://www.gothailandhome.com/en/buy` | 200 |
| Rent landing | `https://www.gothailandhome.com/en/rent` | 200 |
| Listing index | `https://www.gothailandhome.com/en/properties` | 200 |
| **Listing detail (rent)** | `https://www.gothailandhome.com/en/properties/kave-town-space-rent-livinginsider-2615264` | 200 |
| **Listing detail (sale)** | `https://www.gothailandhome.com/en/properties/life-one-wireless-sale-livinginsider-3138282` | 200 |
| **Listing detail (sale, 2nd)** | `https://www.gothailandhome.com/en/properties/the-esse-sukhumvit-36-sale-livinginsider-2639760` | 200 |
| **Listing detail (rent, 2nd)** | `https://www.gothailandhome.com/en/properties/supalai-veranda-rama-9-rent-livinginsider-3033007` | 200 |
| Project index | `https://www.gothailandhome.com/en/projects` | 200 |
| **Project detail** | `https://www.gothailandhome.com/en/projects/ashton-asoke` | 200 |
| Project detail (alt) | `https://www.gothailandhome.com/en/projects/168-sukhothai-residences` | 200 |
| Project detail (alt) | `https://www.gothailandhome.com/en/projects/ascott-embassy-sathorn` | 200 |
| Developer index | `https://www.gothailandhome.com/en/developers` | 200 |
| **Developer detail** | `https://www.gothailandhome.com/en/developers/ananda-development` | 200 |
| Developer detail (alt) | `https://www.gothailandhome.com/en/developers/ap-thailand` | 200 |
| Developer detail (alt) | `https://www.gothailandhome.com/en/developers/assetwise` | 200 |
| City index | `https://www.gothailandhome.com/en/cities` | 200 |
| **City detail** | `https://www.gothailandhome.com/en/cities/bangkok` | 200 |
| City detail (alt) | `https://www.gothailandhome.com/en/cities/phuket` | 200 |
| **District detail** | `https://www.gothailandhome.com/en/districts/watthana` | 200 |
| District detail (alt) | `https://www.gothailandhome.com/en/districts/phra-nakhon` | 200 |
| District detail (non-Bangkok) | `https://www.gothailandhome.com/en/districts/central-pattaya` | 200 |
| Knowledge hub | `https://www.gothailandhome.com/en/knowledge` | 200 |
| Knowledge guide | `https://www.gothailandhome.com/en/knowledge/glossary` | 200 |
| Knowledge guide | `https://www.gothailandhome.com/en/knowledge/bangkok-districts` | 200 |
| Marketplace hub | `https://www.gothailandhome.com/en/marketplace` | 200 |
| Form — buyer | `https://www.gothailandhome.com/en/find-my-home` | 200 |
| Form — owner | `https://www.gothailandhome.com/en/list-your-property` | 200 |
| Form — developer | `https://www.gothailandhome.com/en/partners/developers` | 200 |
| Form — agency | `https://www.gothailandhome.com/en/partners/agencies` | 200 |
| Form — platform | `https://www.gothailandhome.com/en/contact` | 200 |
| About | `https://www.gothailandhome.com/en/about` | 200 |
| **Lead success (stored)** | `https://www.gothailandhome.com/en/leads/success?channel=find_my_home&ref=FMH-TEST&mode=stored` | 200 |
| **Lead success (placeholder)** | `https://www.gothailandhome.com/en/leads/success?channel=find_my_home&ref=FMH-TEST&mode=placeholder` | 200 |
| Lead error | `https://www.gothailandhome.com/en/leads/error` | 200 |
| Search helper | `https://www.gothailandhome.com/en/search` | 307 → `/en/properties` |

**Language equivalents:** swap the `/en/` segment for `/zh/` or `/th/`; every
listed path exists in all three locales (sitemap carries 1,152 URLs per locale).

**Known 404s (documented above, not review targets):** `/en/districts`,
`/en/privacy`, `/en/terms`, `/en/cookies`, `/en/disclaimer`, `/en/legal`,
`/en/knowledge/bts-skytrain-overview`.

---

# 4. Review sequence

Full method in `CEO_PRODUCT_REVIEW_GUIDE.md` §3–§5.

| Pass | Focus | Device / language |
| --- | --- | --- |
| 1 | Reference experience — all journeys | Desktop 1440 · en |
| 2 | Layout squeeze points | Desktop 1280 → 1024 · en |
| 3 | Primary mobile walk — all journeys | Mobile 390 · en |
| 4 | Extremes spot-check | Mobile 430 + 375 · en |
| 5 | Tablet | iPad 768 portrait + 1024 landscape · en |
| 6 | Language integrity | zh · desktop + mobile |
| 7 | Language integrity (highest wrap risk) | th · desktop + mobile |
| 8 | Data credibility · roles · states | any · en |

Run in order. Each pass assumes the previous one set the reference.

---

# 5. Total checklist

| Session | Group | Items |
| --- | --- | --- |
| **S1 — Reference** (Desktop 1440, en) | 1.1 Homepage first impression | 12 |
| | 1.2 Global navigation and chrome | 11 |
| | 1.3 Browse properties | 13 |
| | 1.4 Buy landing | 5 |
| | 1.5 Rent landing | 5 |
| | 1.6 Listing detail | 14 |
| | 1.7 Project detail + project lead form | 13 |
| | 1.8 Explore developer | 8 |
| | 1.9 Explore district / city | 8 |
| | 1.10 Knowledge content | 7 |
| | 1.11 Marketplace and lead forms | 18 |
| | 1.12 Keyboard and focus | 6 |
| | 1.13 About | 3 |
| | **S1 subtotal** | **123** |
| **S2 — Responsive** | 2.1 Desktop 1280 | 4 |
| | 2.2 Desktop 1024 | 7 |
| | 2.3 Mobile 390 (full walk) | 19 |
| | 2.4 Mobile 430 | 4 |
| | 2.5 Mobile 375 | 7 |
| | 2.6 iPad 768 portrait | 8 |
| | 2.7 iPad landscape | 4 |
| | **S2 subtotal** | **53** |
| **S3 — Languages** | 3.1 Chinese desktop | 13 |
| | 3.2 Chinese mobile | 4 |
| | 3.3 Thai desktop | 12 |
| | 3.4 Thai mobile | 4 |
| | 3.5 Language switching | 8 |
| | **S3 subtotal** | **41** |
| **S4 — Credibility** | 4.1 Property data accuracy | 9 |
| | 4.2 Project data accuracy | 5 |
| | 4.3 Developer attribution | 5 |
| | 4.4 Source and evidence | 6 |
| | 4.5 Role separation | 7 |
| | 4.6 Loading / empty / error states | 7 |
| | 4.7 Cross-cutting consistency | 6 |
| | **S4 subtotal** | **45** |
| | **TOTAL** | **262** |

Executable steps live in `CEO_PRODUCT_REVIEW_CHECKLIST.md` (218 numbered items;
the 262 above counts the per-group rows including the sub-steps of the merged
device passes). **Use the checklist file as the working document.**

**Sampling depth for S4:** 10 listings · 5 projects · 5 developers · 3 districts.
Draw from §3 above — the URLs are real and verified.

---

# 6. Issue register — pre-filled from source inspection

These are **found already**, before the CEO opens a browser. They are recorded
here so review time is spent on judgement, not rediscovery. Log any new finding
with `CEO_PRODUCT_REVIEW_ISSUE_TEMPLATE.md`.

## 6.1 Critical issues (P0 / P1 — block launch)

### CRIT-01 · P0 candidate — a failed lead can show the customer a success page

**Where:** `src/app/[lang]/marketplace/actions.ts:57-58`

```ts
const mode: LeadSubmitMode = result.ok ? "stored" : "placeholder";
redirect(buildLeadSuccessPath(locale, channel, reference, mode));
```

`finalizeLead` redirects to **`/leads/success` regardless of whether the insert
succeeded**. When `createMarketplaceLead` fails — storage unconfigured
(`hasSupabaseEnv()` false → `"Lead storage is not configured."`) or any Postgres
error — the customer still lands on a page titled **"Request received"**. The
only disclosure is `leads.modePlaceholder`:

> "Accepted as a platform placeholder reference. No CRM automation and no email were sent."

A buyer will not decode that as *"nobody has your details."* Same pattern at
`actions.ts:336` for the project lead form. This affects all five lead channels
(`find_my_home`, `list_your_property`, `viewing_request`,
`developer_partnership`, `agency_partnership`).

**Severity rationale:** this is exactly the NO-GO criterion in
`CEO_PRODUCT_REVIEW_GUIDE.md` §9 — *"a lead form loses data, submits silently."*

**Not yet proven in production.** Production has Supabase configured, so the
normal path is `mode=stored`. **The CEO must confirm which mode real submissions
produce** — this is checklist items 1.7.10, 1.11.7, 1.11.9, 1.11.11, 1.11.12,
1.11.13. Compare the two states directly:

- stored → `…/en/leads/success?channel=find_my_home&ref=FMH-TEST&mode=stored`
- placeholder → `…/en/leads/success?channel=find_my_home&ref=FMH-TEST&mode=placeholder`

**If real submissions return `mode=stored`:** downgrade to **P1** — the failure
path is still misleading, but is not firing.
**If any real submission returns `mode=placeholder`:** **P0, NO-GO.** Leads are
being dropped behind a success screen.

### CRIT-02 · P1 — no legal pages exist, and no footer legal links

Privacy, Terms, Cookie Policy, and Disclaimer do not exist in any language
(§1). Six forms collect name, email, phone, LINE ID, WhatsApp, and free-text
messages behind a consent checkbox that writes `consent: true` and `consent_at`
to storage — with no published policy that consent refers to.

**Customer impact:** fails *"does the page look credible"* and *"does it meet an
international property-platform standard."* A cautious foreign buyer looks for
these links before submitting a phone number.

**Decision required from CEO:** launch without them, or block. This is a
content/legal authoring task, not a UI defect.

### CRIT-03 · P1 candidate — 44 of 56 district pages have no browsable route in

Districts have no index (§2.2). The homepage caps its section at 12 Bangkok
districts; the rest exist only via city detail pages. All 56 are in the sitemap,
so Google can reach pages a human cannot browse to.

**Judge at checklist item 1.9.3.** If districts are core to the "explore where to
live" journey → **P1**. If they are primarily an SEO surface reached from search
→ **P2**.

## 6.2 Medium issues (P2 — ship, fix next wave)

| ID | Issue | Source |
| --- | --- | --- |
| MED-01 | **Knowledge article content is orphaned.** `content/knowledge/articles/bts-skytrain-overview.json` is authored, verified 2026-07-16, and translated en/zh/th, but no route reads `content/knowledge/articles` — `/en/knowledge/bts-skytrain-overview` → 404. The Knowledge hub advertises only 2 hardcoded guides. Content investment currently returns nothing. | §2.3; `UX_IMPROVEMENT_LIST` P3 |
| MED-02 | **Nav says "Cities", homepage says "districts", and district depth has no index.** Label/IA mismatch across the same journey. | §2.4 |
| MED-03 | **Widespread "Images unavailable" on listing cards.** Honest empty state, accepted by prior waves — but at 1,000 published listings the *volume* is a credibility judgement only the CEO can make. Checklist 1.1.9, 1.3.10, 4.1.9. | `BUG_LIST` B9 |
| MED-04 | **`official` evidence badge uses `--brand-deep`** while the dedicated `--evidence-official` token exists and is unused. Visible trust-colour inconsistency; needs a brand decision. | `VISUAL_INCONSISTENCY_LIST` §5 |
| MED-05 | **Desktop nav density at 1024.** 11 primary links inside `max-w-[42rem]` with `overflow-x-auto` as a safety valve. Scrollbar chrome hidden in Wave 2, but crowding remains. Checklist 2.2.1–2.2.2. | `UI_CONSISTENCY_REPORT`; `BUG_LIST` B10 |

## 6.3 Minor issues (P3 — backlog)

| ID | Issue | Source |
| --- | --- | --- |
| MIN-01 | **Dead legacy components** `src/components/listings/hero-search.tsx` and `src/components/search/search-form.tsx` render on no route and carry off-system controls (`hero-search` inputs have no focus indicator at all). Recommended for deletion. Not customer-visible — do not review. | `VISUAL_INCONSISTENCY_LIST` §6 |
| MIN-02 | **Split focus-ring width convention** — primitives `ring-3`, link/card affordances `ring-2`. Internally consistent per role; unifying is a design choice. | `DESIGN_SYSTEM_AUDIT` §8 |
| MIN-03 | **Admin screens use raw palette** (`emerald-*`, `red-*`, `amber-*`) instead of status tokens. Non-public; out of review scope. | `VISUAL_INCONSISTENCY_LIST` §8 |
| MIN-04 | **Project/developer cards are text-led** where no hero binary exists. Intentional Alpha honesty. | `VISUAL_CONSISTENCY_REPORT` |

## 6.4 Open product decisions (answer in S5 — not defects)

1. Is removing Search from the nav acceptable while `/search` (307) stays for bookmarks?
2. Should listing cards be fully clickable, or keep the explicit "View details" CTA?
3. Priority: real listing photography vs further nav simplification?
4. Should the `official` badge take `--evidence-official`, or keep brand-deep?
5. **New —** ship without legal pages (CRIT-02), or block launch on them?
6. **New —** does the district level need an index page (CRIT-03)?
7. **New —** wire the knowledge article route (MED-01), or delete the orphan content?

---

# 7. Review time estimate

| Session | Contents | Estimate |
| --- | --- | --- |
| **S1 — Reference** | Pass 1 · 123 items · Desktop 1440 · en · includes 6 form submissions | **75–90 min** |
| **S2 — Responsive** | Passes 2–5 · 53 items · 1280 / 1024 / 390 / 430 / 375 / 768 / landscape | **50–65 min** |
| **S3 — Languages** | Passes 6–7 · 41 items · zh + th, desktop + mobile + switching | **45–55 min** |
| **S4 — Credibility** | Pass 8 · 45 items · 10 listings, 5 projects, 5 developers, 3 districts | **45–60 min** |
| **S5 — Decision** | Triage, severity, 7 product decisions, stop/go verdict | **30 min** |
| **Total focused review time** | | **4 h 05 m – 5 h 00 m** |
| **+ Issue writing overhead** | ~4 min per issue · assume 15–25 issues | **+60–100 min** |
| **Realistic total** | | **≈ 5–6.5 hours across 5 sittings** |

**Scheduling guidance:**

- **Do not compress into one day.** Fatigue produces false passes, and S1 sets
  the reference standard for everything after it.
- Suggested: **Day 1** S1 (morning) + S2 (afternoon) · **Day 2** S3 + S4 ·
  **Day 3** S5.
- Start every session on a **cold load** (new tab, site history cleared) so
  first-impression judgement stays honest.
- **S1 and S4 are the highest-yield sessions.** If time is cut, cut S2's 430/375
  spot-checks — never cut S4.

---

# 8. Stop / Go — quick reference

Full criteria in `CEO_PRODUCT_REVIEW_GUIDE.md` §9.

**GO** requires: zero open P0 · zero open P1 (or written waivers) · all 3
languages complete buy + rent end to end · all 6 forms reach `/leads/success`
**with `mode=stored`** · no horizontal overflow at 375/390/430/768 · contact
roles unambiguous everywhere · no wrong price or currency · and your answer to
*"would a real buyer or tenant continue using this platform?"* is **yes** on
desktop **and** mobile.

**NO-GO** on any of: an open P0 · three or more open P1s in one journey · a lead
form losing data (**see CRIT-01**) · content readable as fabricated · data
attributed to the wrong owner/agent/agency/developer · "would a real buyer
continue?" = **no** on mobile.

**Entering this review, two P1s are already open (CRIT-02, CRIT-03) and one P0
candidate is unresolved (CRIT-01).** A GO verdict requires disposing of all three.

```
VERDICT: ___________________     Date: __________
Open P0: ____   Open P1: ____   Waived P1: ____
CRIT-01 lead mode observed:  stored ☐   placeholder ☐
CRIT-02 legal pages:  waived ☐   blocking ☐
CRIT-03 district index:  P1 ☐   P2 ☐
Conditions:
Signed:
```
