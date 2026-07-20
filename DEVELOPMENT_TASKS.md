# Development Tasks

**Product:** GoThailandHome · **Baseline:** `eedf3f7` · **Prepared:** 2026-07-17
**Phase:** Production Fix Planning — **planning only, no code modified**
**Scope:** CRIT-01, CRIT-02, CRIT-03 only.

Context: `PRODUCTION_FIX_PLAN.md` (root cause, impact, testing) ·
`IMPLEMENTATION_PRIORITY.md` (classification, order, decisions).

**File paths are "likely affected" — verified read-only against `eedf3f7`, but
the implementer confirms before editing. Line numbers drift.**

**Legend:** `BLOCKED` = cannot start until a dependency clears · `READY` = can
start once its decision lands.

---

# CRIT-01 · P0 — Failed lead shows a success page

**Gate:** all tasks blocked on **DEC-1** (`IMPLEMENTATION_PRIORITY.md` §5) —
*on storage failure, does the customer see the honest error page (a), a retry (b),
or accept-and-queue (c)?* Tasks below assume **(a)**. If (b)/(c) is chosen,
FIX-01-02 and FIX-01-03 must be re-planned.

---

## FIX-01-01 · Reproduce the failure path and capture a baseline

**Status:** READY (no decision needed — do this first regardless)

**Description:** Before changing anything, prove the defect in a controlled
environment. Force `createMarketplaceLead` to return `{ ok: false }` (unset
Supabase env, revoke the anon insert grant, or point at a bad table) and submit
each of the 6 forms. Record the current behaviour: customer lands on
`/leads/success` titled "Request received" with `mode=placeholder`, no row
stored. Confirm whether `fbq`/`gtag` Lead events fire on the project form's
failure path. This baseline is the regression evidence for FIX-01-07.

**Files likely affected:** none — **read-only reproduction**. Environment/config
only.

**Dependencies:** none. **Start here.**

**Acceptance Criteria:**
- [ ] Forced-failure reproduction documented for all 6 forms (5 marketplace channels + contact/platform support).
- [ ] Confirmed: customer reaches `/leads/success` on a failed insert.
- [ ] Confirmed: no row lands in `marketplace_leads` (verified with a service-role query, not the UI).
- [ ] Recorded whether conversion events fire for an unstored lead on the project form.
- [ ] Baseline captured **before** any source change.

---

## FIX-01-02 · Branch `finalizeLead` on the insert result

**Status:** BLOCKED on DEC-1

**Description:** In `finalizeLead`, stop discarding `result.ok`. On success →
redirect to `/leads/success`. On failure → redirect via the **already-existing**
`buildLeadErrorPath(locale, channel, code)` in `src/lib/leads/urls.ts`, which is
currently never called from this path. Covers all 5 channels
(`find_my_home`, `list_your_property`, `viewing_request`,
`developer_partnership`, `agency_partnership`). Pass a failure code the error
page can render; **never** put the customer's PII in the URL.

**Files likely affected:**
- `src/app/[lang]/marketplace/actions.ts` (`finalizeLead`, ~lines 45-59)
- `src/lib/leads/urls.ts` (`buildLeadErrorPath` — consumer only; likely no change)
- `src/lib/marketplace/leads.ts` (may need a stable failure code alongside `message`)

**Dependencies:** DEC-1 · FIX-01-01 (baseline first)

**Acceptance Criteria:**
- [ ] Forced insert failure → customer lands on `/leads/error`, **never** `/leads/success`.
- [ ] Successful insert → customer lands on `/leads/success` exactly as today.
- [ ] All 5 channels take the branch correctly.
- [ ] No PII in any redirect URL or query param.
- [ ] Failure code is stable and renderable; no raw Postgres error text reaches the customer.
- [ ] `npx tsc --noEmit` and `npx eslint` clean.

---

## FIX-01-03 · Correct the inline platform-support path

**Status:** BLOCKED on DEC-1

**Description:** The contact / platform-support action returns a hardcoded
`ok: true` with `mode: result.ok ? "stored" : "placeholder"` (~lines 316-340) —
the same defect as FIX-01-02 in a second, non-redirect shape. Return
`ok: result.ok` and surface honest failure copy inline, consistent with the
existing `fail(check.code)` validation pattern. The customer must not see a
success message for an unstored lead.

**Files likely affected:**
- `src/app/[lang]/marketplace/actions.ts` (platform-support action, ~lines 310-340)
- `src/components/marketplace/platform-support-form.tsx` (render the failure state)
- `src/components/marketplace/form-kit.tsx` (only if a shared error affordance is missing)

**Dependencies:** DEC-1 · FIX-01-01

**Acceptance Criteria:**
- [ ] Forced insert failure → the contact form shows an honest failure message with an alternative contact route.
- [ ] Success → unchanged from today.
- [ ] `ok` is never hardcoded true; it reflects the insert result.
- [ ] Typed form data is not destroyed on failure — the customer can retry without re-typing.
- [ ] Failure copy renders in en / zh / th.

---

## FIX-01-04 · Retire `mode` from the customer surface

**Status:** BLOCKED on FIX-01-02, FIX-01-03

**Description:** Once success means stored, the `stored | placeholder`
distinction is dead on the customer surface and must go — a success page that can
say "we didn't actually save this" is the bug, not the messenger. Remove `mode`
from the success route's params and from `LeadSuccessPanel`
(`lead-result.tsx:93`), and delete `leads.modeStored` / `leads.modePlaceholder`
from all three dictionaries. Keep the `LeadSubmitMode` type only if FIX-01-05
still needs it internally; otherwise delete it.

**Files likely affected:**
- `src/components/leads/lead-result.tsx` (`LeadSuccessPanel`, mode ternary at ~line 93)
- `src/app/[lang]/leads/success/page.tsx` (`parseLeadModeParam` usage)
- `src/lib/leads/urls.ts` (`buildLeadSuccessPath` signature, `parseLeadModeParam`)
- `src/lib/leads/channels.ts` (`LeadSubmitMode` type)
- `src/dictionaries/en.json`, `zh.json`, `th.json` (`leads.modeStored`, `leads.modePlaceholder`)

**Dependencies:** FIX-01-02, FIX-01-03

**Acceptance Criteria:**
- [ ] `/leads/success` renders no mode-dependent copy.
- [ ] `mode` removed from the success URL contract.
- [ ] `modeStored` / `modePlaceholder` removed from all 3 dictionaries; no orphan keys.
- [ ] The existing `?channel=` guard (`notFound()` on a missing/invalid channel) still works — direct access to `/leads/success` still 404s.
- [ ] No dead exports left behind; `npx tsc --noEmit` and `npx eslint` clean.

---

## FIX-01-05 · Gate placeholder behaviour to non-production

**Status:** BLOCKED on DEC-1

**Description:** Placeholder mode may be load-bearing for preview/demo deploys
that run without Supabase (`hasSupabaseEnv()` false). If it is retained at all,
gate it explicitly — e.g. `LEADS_ALLOW_PLACEHOLDER`, default **off**, honoured
only when `NODE_ENV !== "production"`. A production build must never reach the
placeholder branch. **If preview deploys do not need it, delete the branch
entirely and close this task** — confirm with the team before building the gate.

**Files likely affected:**
- `src/app/[lang]/marketplace/actions.ts` (`finalizeLead`)
- `src/lib/supabase/env.ts` (`hasSupabaseEnv` — reader only)
- `.env.example` (document the flag, if built)

**Dependencies:** DEC-1 · FIX-01-02

**Acceptance Criteria:**
- [ ] Confirmed with the team whether preview deploys need a placeholder success screen.
- [ ] If retained: production can never reach the branch, proven by test.
- [ ] If retained: default is **off**; flag documented in `.env.example`.
- [ ] If dropped: branch fully removed, no dead code.
- [ ] A production build with storage unconfigured shows the honest error page — never a success screen.

---

## FIX-01-06 · Make insert failures observable

**Status:** READY

**Description:** The failure is currently undetectable: no alerting, and anon RLS
blocks `select`, so submitted-vs-stored cannot be reconciled. Add a
`console.error` in `createMarketplaceLead`'s error branch carrying the Postgres
error and the channel — **never the PII payload** (name, email, phone, LINE ID,
WhatsApp, message). This is the minimum bar so a spike is visible in platform
logs. A durable dead-letter queue is a **follow-up, not this fix**.

**Files likely affected:**
- `src/lib/marketplace/leads.ts` (`createMarketplaceLead` error branch, ~lines 96-99)

**Dependencies:** none (independent of DEC-1)

**Acceptance Criteria:**
- [ ] Every failed insert emits a server-side error log with the Postgres error and channel.
- [ ] **No PII in any log line** — reviewed explicitly against the `CreateMarketplaceLeadInput` fields.
- [ ] Forced-failure test produces exactly one log entry per failed submission.
- [ ] Success path logs nothing new (no noise).

---

## FIX-01-07 · Verify conversion events and reconcile row counts

**Status:** BLOCKED on FIX-01-02, FIX-01-03, FIX-01-04

**Description:** Two verifications that must not be assumed. **(1)** The project
lead form fires `fbq("track", "Lead")` / `gtag` from a `useEffect` keyed on
`state.ok` (`project-lead-form.tsx:34+`). Once `ok` reflects a real insert this
*should* become correct with no code change — **prove it**, do not assume it.
**(2)** Run the reconciliation that would have caught the original bug: submit 10
leads across channels and count rows.

**Files likely affected:**
- `src/components/projects/project-lead-form.tsx` (verify only; change only if the effect still fires on failure)
- No other source changes expected — this task is primarily verification.

**Dependencies:** FIX-01-02, FIX-01-03, FIX-01-04

**Acceptance Criteria:**
- [ ] Forced-failure submit on a project page with the pixel in test mode → **no** `fbq`/`gtag` Lead event fires.
- [ ] Happy-path submit → exactly **one** conversion event fires.
- [ ] 10 leads submitted across all channels → **rows stored == 10**, verified with a service-role query.
- [ ] Forced-failure run in en / zh / th → error copy translated in all three; no English fallback.
- [ ] `npm run test:ui-foundation` passes.
- [ ] CEO checklist items 1.7.10, 1.11.7, 1.11.9, 1.11.11, 1.11.12, 1.11.13 pass.

---

# CRIT-02 · P1 — No legal pages, no footer legal links

**Gate:** every engineering task is blocked on **FIX-02-01**. Engineering must not
draft, paraphrase, or "tidy" legal text — shipping plausible-sounding legal copy
that counsel did not write is worse than shipping nothing, because it binds the
company to a document nobody approved.

---

## FIX-02-01 · Commission legal content and certified translations

**Status:** READY — **START TODAY. This is the launch critical path.**

**Description:** **Owner: CEO + legal counsel. NOT engineering.** Commission
PDPA-compliant (GDPR-aware) Privacy Policy, Terms of Service, Cookie Policy, and
Disclaimer. The Privacy Policy must cover what the 6 forms actually collect
(name, email, phone, LINE ID, WhatsApp, free-text message), `marketplace_leads`
storage, retention, the controller's legal identity, and subject rights — the
platform already writes `consent: true` / `consent_at` against a policy that does
not exist. Then commission **certified** zh + th translations; do not
machine-translate legal text. Confirm with counsel whether Thai is the governing
language for Thai jurisdiction.

**Files likely affected:** none — external content deliverable.

**Dependencies:** none. **Longest lead time of any task in this plan (1–3 weeks).
Every other CRIT-02 task waits on it.**

**Acceptance Criteria:**
- [ ] All 4 documents drafted and approved by counsel.
- [ ] Privacy Policy explicitly covers the 6 forms' collected fields, storage, retention, controller identity, and subject rights.
- [ ] Certified zh + th translations delivered.
- [ ] Governing-language question answered in writing.
- [ ] Approved source text handed to engineering in a form that can be transcribed **verbatim**.

---

## FIX-02-02 · Build the four legal routes

**Status:** BLOCKED on FIX-02-01

**Description:** Add `privacy`, `terms`, `cookies`, and `disclaimer` under
`src/app/[lang]/`, mirroring the existing About page — `PageShell` + breadcrumbs
+ `ds-*` type scale. **No new patterns, no redesign.** Transcribe counsel's text
verbatim. Include `buildPageMetadata` per page.

**Files likely affected:**
- `src/app/[lang]/privacy/page.tsx` **(new)**
- `src/app/[lang]/terms/page.tsx` **(new)**
- `src/app/[lang]/cookies/page.tsx` **(new)**
- `src/app/[lang]/disclaimer/page.tsx` **(new)**
- `src/components/layout/page-shell.tsx` (consumer only; no change expected)
- `src/lib/i18n/metadata.ts` (`buildPageMetadata` — consumer only)

**Dependencies:** FIX-02-01 (**hard block** — no content, no page)

**Acceptance Criteria:**
- [ ] 12 URLs return **200** (4 routes × en/zh/th); the audit's 404s on `/en/privacy`, `/en/terms`, `/en/cookies`, `/en/disclaimer` are gone.
- [ ] Rendered text is **byte-identical** to counsel's approved source — no paraphrase, no summary.
- [ ] Each page uses `PageShell` + breadcrumbs, matching About; no new component patterns introduced.
- [ ] Metadata (title/description) set per page, per locale.
- [ ] No horizontal overflow at 1440 / 1024 / 768 / 390 / 375; Thai tone marks not clipped.
- [ ] `npx tsc --noEmit`, `npx eslint`, `npm run test:ui-foundation` clean.

---

## FIX-02-03 · Add the footer Legal column

**Status:** BLOCKED on FIX-02-02

**Description:** `site-footer.tsx` renders exactly two link arrays — `explore`
(7) and `company` (4). Add a third `legal` array with the four documents, and
render it as a column following the existing pattern (same
`focus-visible:ring-[var(--brand-gold)]/60` treatment). Confirm the
`md:grid-cols-[1.4fr_1fr_1fr]` template still balances with a fourth column, and
that it stacks cleanly on mobile.

**Files likely affected:**
- `src/components/layout/site-footer.tsx`

**Dependencies:** FIX-02-02 (do not link routes that 404) · FIX-02-04 (labels)

**Acceptance Criteria:**
- [ ] Legal column renders on every page, in every locale.
- [ ] All 4 links resolve 200.
- [ ] Grid template rebalanced for the extra column; no cramped or orphaned column at 1440 / 1024 / 768.
- [ ] Footer stacks cleanly at 430 / 390 / 375; tap targets remain comfortable.
- [ ] Focus-visible rings match the existing footer links exactly.
- [ ] CEO checklist item **1.2.9** now passes.

---

## FIX-02-04 · Add legal dictionary keys (3 locales)

**Status:** BLOCKED on FIX-02-01

**Description:** No legal keys exist in any dictionary — this is missing in all
three languages equally, not a translation gap. Add nav/footer labels
(`nav.privacy`, `nav.terms`, `nav.cookies`, `nav.disclaimer`, `footer.legal`) and
page metadata keys (`meta.privacyTitle` / `meta.privacyDescription`, and the same
for the other three) to `en.json`, `zh.json`, `th.json`.

**Files likely affected:**
- `src/dictionaries/en.json`
- `src/dictionaries/zh.json`
- `src/dictionaries/th.json`

**Dependencies:** FIX-02-01 (approved terminology — do not invent legal labels)

**Acceptance Criteria:**
- [ ] All keys present in all 3 dictionaries; **no English fallback** in zh/th.
- [ ] Dictionary shape stays parallel across locales (no key present in one file and missing in another).
- [ ] Labels match counsel's approved document titles.
- [ ] Type-checks against the `Dictionary` type.

---

## FIX-02-05 · Link the Privacy Policy from every consent checkbox

**Status:** BLOCKED on FIX-02-02

**Description:** Six forms record `consent: true` and `consent_at` with no link
to the policy that consent refers to. Add a Privacy Policy link beside each
consent checkbox, in the current locale. Do not change validation, field names,
or the `consent` payload contract — this is a copy/link addition only.

**Files likely affected:**
- `src/components/marketplace/find-my-home-form.tsx`
- `src/components/marketplace/list-your-property-form.tsx`
- `src/components/marketplace/developer-partnership-form.tsx`
- `src/components/marketplace/agency-partnership-form.tsx`
- `src/components/marketplace/platform-support-form.tsx`
- `src/components/projects/project-lead-form.tsx`
- `src/components/marketplace/form-kit.tsx` (if the consent affordance is shared)

**Dependencies:** FIX-02-02, FIX-02-04

**Acceptance Criteria:**
- [ ] All 6 forms show a Privacy Policy link at the consent checkbox.
- [ ] The link opens the policy in the **current locale**.
- [ ] Clicking it does **not** destroy typed form data.
- [ ] Consent validation, field `name` attributes, hidden UTM/`gclid`/`fbclid` fields, `data-ads-lead-form`, and `data-ads-conversion` are **unchanged** (guards the Phase 12 Design QA fix).
- [ ] The label remains the hit area for the checkbox; tap target still compliant at 375.

---

## FIX-02-06 · Add legal routes to the sitemap

**Status:** BLOCKED on FIX-02-02

**Description:** Add the four paths to the `staticPaths` array in
`src/app/sitemap.ts` (which already carries `/about`, `/contact`, `/knowledge`,
etc.).

**Files likely affected:**
- `src/app/sitemap.ts`

**Dependencies:** FIX-02-02

**Acceptance Criteria:**
- [ ] `/sitemap.xml` contains 12 new URLs (4 paths × 3 locales).
- [ ] Existing 3,456 URLs unaffected.
- [ ] No 404 in the sitemap — every emitted URL resolves 200.

---

# CRIT-03 · P2 — No district index

**Gate:** blocked on **DEC-3** — *all 6 cities (56 districts) or Bangkok only?*
Tasks assume **all cities, grouped by city**.

**Note:** `listDistricts()` already exists at `src/lib/data/geography.ts:125` and
is already production-proven by `sitemap.ts`. **No data-layer work is required** —
this is a page and a link.

---

## FIX-03-01 · Build the district index page

**Status:** BLOCKED on DEC-3

**Description:** Add `src/app/[lang]/districts/page.tsx`, mirroring the cities
index — same `PageShell`, breadcrumbs, and `ds-*` grid. Source from the existing
`listDistricts()`. **Group by city**: a flat list of 56 is a worse experience
than today's city-first path, and grouping preserves the city→district mental
model while making all 56 browsable from one screen. Reuse `DistrictCardShell` —
no new card component.

**Files likely affected:**
- `src/app/[lang]/districts/page.tsx` **(new)**
- `src/lib/data/geography.ts` (`listDistricts` — **consumer only, no change**)
- `src/components/ui/*` (`DistrictCardShell` — consumer only)
- `src/components/layout/page-shell.tsx` (consumer only)

**Dependencies:** DEC-3 · FIX-03-02 (labels)

**Acceptance Criteria:**
- [ ] `/en/districts`, `/zh/districts`, `/th/districts` all return **200** (currently 404).
- [ ] **All 56** published districts render, grouped under their correct city.
- [ ] Every district link resolves 200 and lands on the district named on its card.
- [ ] Districts with no summary keep grid rhythm (`min-h` + line-clamp, per the Wave 2 pattern) — no collapsed cards.
- [ ] Grid steps 1 → 2 → 3 columns per `RESPONSIVE_DESIGN_REPORT`; **no horizontal overflow** at 1440 / 1280 / 1024 / 768 / 430 / 390 / 375.
- [ ] Same shell, tokens, hover lift, and focus rings as the cities index — no new patterns.
- [ ] `npx tsc --noEmit`, `npx eslint`, `npm run test:ui-foundation` clean.

---

## FIX-03-02 · Add district-index dictionary keys (3 locales)

**Status:** BLOCKED on DEC-3

**Description:** Add `nav.districts`, `meta.districtsTitle`, and
`meta.districtsDescription` to all three dictionaries. `common.viewAll` already
exists (Wave 1 made it context-neutral) and can be reused for the entry links —
**do not reintroduce a "View all listings" string on a non-listing section.**

**Files likely affected:**
- `src/dictionaries/en.json`
- `src/dictionaries/zh.json`
- `src/dictionaries/th.json`

**Dependencies:** DEC-3

**Acceptance Criteria:**
- [ ] Keys present in all 3 dictionaries; no English fallback in zh/th.
- [ ] Dictionary shape stays parallel across locales.
- [ ] `common.viewAll` reused, not duplicated.
- [ ] Type-checks against the `Dictionary` type.

---

## FIX-03-03 · Link the index from the homepage and city pages

**Status:** BLOCKED on FIX-03-01

**Description:** The homepage renders `districts.slice(0, 12)` (Bangkok only) at
`src/app/[lang]/page.tsx:102` with no way to see the rest. Add a "View all" entry
from that section to `/{lang}/districts`, and from each city page's district
block.

**⚠️ Do NOT add Districts to the primary nav.** The desktop nav already carries 11
links and is documented as crowded at 1024 (MED-05 / `BUG_LIST` B10); a 12th
worsens a known P2. Nav IA is a separate decision — **this task must not pre-empt
it.**

**Files likely affected:**
- `src/app/[lang]/page.tsx` (district section, ~lines 227-252)
- `src/app/[lang]/cities/[slug]/page.tsx` (district block)
- `src/components/layout/site-header.tsx` — **MUST NOT CHANGE** (listed to make the constraint explicit)

**Dependencies:** FIX-03-01, FIX-03-02

**Acceptance Criteria:**
- [ ] Homepage district section links to `/{lang}/districts`.
- [ ] Each city page's district block links to the index.
- [ ] From `/en` cold, a **non-Bangkok** district (e.g. `central-pattaya`) is reachable **by clicking only** — no URL typing, no prior knowledge of the city. *(This is the defect being fixed.)*
- [ ] **`site-header.tsx` is unmodified**; primary nav link count unchanged at 11 (guards MED-05).
- [ ] Focus-visible rings on new links match the existing home card pattern.

---

## FIX-03-04 · Add the district index to the sitemap

**Status:** BLOCKED on FIX-03-01

**Description:** Add `/districts` to `staticPaths` in `src/app/sitemap.ts`.

**Files likely affected:**
- `src/app/sitemap.ts`

**Dependencies:** FIX-03-01

**Acceptance Criteria:**
- [ ] `/sitemap.xml` contains 3 new index URLs (1 path × 3 locales).
- [ ] The 168 existing district detail URLs are unchanged.
- [ ] Every emitted URL resolves 200.

---

# Task summary

| ID | Task | Class | Status | Est. |
| --- | --- | --- | --- | --- |
| FIX-01-01 | Reproduce failure path, capture baseline | P0 | READY | 2 h |
| FIX-01-02 | Branch `finalizeLead` on insert result | P0 | BLOCKED (DEC-1) | 2 h |
| FIX-01-03 | Correct inline platform-support path | P0 | BLOCKED (DEC-1) | 1.5 h |
| FIX-01-04 | Retire `mode` from customer surface | P0 | BLOCKED (01-02, 01-03) | 2 h |
| FIX-01-05 | Gate placeholder to non-production | P0 | BLOCKED (DEC-1) | 1.5 h |
| FIX-01-06 | Make insert failures observable | P0 | READY | 0.5 h |
| FIX-01-07 | Verify conversions + reconcile rows | P0 | BLOCKED (01-02→04) | 3.5 h |
| **CRIT-01 subtotal** | | | | **≈ 13 h** |
| FIX-02-01 | **Commission legal content + translations** | P1 | **READY — START TODAY** | **1–3 wks (external)** |
| FIX-02-02 | Build 4 legal routes | P1 | BLOCKED (02-01) | 4 h |
| FIX-02-03 | Footer Legal column | P1 | BLOCKED (02-02, 02-04) | 1.5 h |
| FIX-02-04 | Legal dictionary keys × 3 | P1 | BLOCKED (02-01) | 1.5 h |
| FIX-02-05 | Consent → Privacy Policy links | P1 | BLOCKED (02-02, 02-04) | 2 h |
| FIX-02-06 | Legal routes → sitemap | P1 | BLOCKED (02-02) | 0.5 h |
| **CRIT-02 subtotal (eng)** | | | | **≈ 12.5 h** |
| FIX-03-01 | Build district index page | P2 | BLOCKED (DEC-3) | 3 h |
| FIX-03-02 | District dictionary keys × 3 | P2 | BLOCKED (DEC-3) | 1 h |
| FIX-03-03 | Link from homepage + city pages | P2 | BLOCKED (03-01, 03-02) | 1 h |
| FIX-03-04 | District index → sitemap | P2 | BLOCKED (03-01) | 0.25 h |
| **CRIT-03 subtotal** | | | | **≈ 8.25 h** |
| | **Total engineering** (excl. testing/review overhead in the plan) | | | **≈ 34 h — 4–4.5 dev days** |

**Start now, blocked on nothing:** **FIX-02-01** (external, 1–3 weeks — the
launch critical path), **FIX-01-01**, **FIX-01-06**.

**One sentence from the CEO (DEC-1) unblocks the entire P0.**
