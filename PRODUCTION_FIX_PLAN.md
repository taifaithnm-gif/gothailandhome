# Production Fix Plan

**Product:** GoThailandHome · **Baseline:** `eedf3f7` · **Prepared:** 2026-07-17
**Phase:** Production Fix Planning — **planning only, no code modified**
**Scope:** the three confirmed findings — **CRIT-01**, **CRIT-02**, **CRIT-03**.
Source of findings: `CEO_PRODUCT_REVIEW_PACKAGE.md` §6.1.

Companion documents: `IMPLEMENTATION_PRIORITY.md` (classification + order) ·
`DEVELOPMENT_TASKS.md` (executable tasks).

---

# CRIT-01 — A failed lead can show the customer a success page

## Root Cause

Two separate submit paths treat "the write failed" as "the request succeeded".

**Path 1 — redirect-based (5 marketplace channels + project viewing request).**
`src/app/[lang]/marketplace/actions.ts:45-59`:

```ts
async function finalizeLead(channel, localeRaw, create): Promise<never> {
  const locale = localeRaw || "en";
  const reference = generateLeadReference(LEAD_CHANNEL_PREFIX[channel]);
  const result = await create();
  const mode: LeadSubmitMode = result.ok ? "stored" : "placeholder";
  redirect(buildLeadSuccessPath(locale, channel, reference, mode));   // ← unconditional
}
```

`result.ok` is **read and then discarded** — it only selects a copy variant. The
redirect target is `/leads/success` on both branches. `buildLeadErrorPath` exists
in `src/lib/leads/urls.ts` and is **never called from this path**.

**Path 2 — inline (contact / platform support).**
`src/app/[lang]/marketplace/actions.ts:~316-340` returns
`{ ok: true, … , mode: result.ok ? "stored" : "placeholder" }` — a hardcoded
`ok: true` regardless of whether `createMarketplaceLead` inserted anything.

**Why the write can fail.** `createMarketplaceLead`
(`src/lib/marketplace/leads.ts:59-104`) returns `{ ok: false }` on:
1. `!hasSupabaseEnv()` → `"Lead storage is not configured."`
2. `!input.consent` → `"Consent is required."`
3. **any Postgres error** returned by `.from("marketplace_leads").insert(…)` —
   transient connection loss, RLS change, timeout, schema drift.

Cause 3 is the important one: it fires **in production, with storage correctly
configured**, whenever the database has a bad moment. The prior audit recorded
CRIT-01 as "unproven in production" because a happy-path submission returns
`mode=stored` — but the failure branch is live code on every submission.

**Why nobody noticed.** The only disclosure is the `leads.modePlaceholder`
string, rendered by `src/components/leads/lead-result.tsx:93` under a page titled
**"Request received"**:

> "Accepted as a platform placeholder reference. No CRM automation and no email were sent."

This is engineer vocabulary. It describes the *system's* state, not the
customer's ("we do not have your enquiry"). `mode` is also carried in the URL as
a client-supplied query param, so the success page cannot independently verify it.

**Aggravating factor.** `src/components/projects/project-lead-form.tsx:34+` fires
`fbq("track", "Lead")` / `gtag` conversion events from a `useEffect` keyed on
`state.ok`. Because `ok` is true in placeholder mode, **ad platforms are told a
conversion happened for a lead that was never stored.**

## Business Impact

| Dimension | Impact |
| --- | --- |
| **Revenue** | Direct, silent, and unbounded. Every dropped lead is a lost buyer/tenant/owner/developer/agency relationship. There is no dead-letter queue, no log-and-recover, no email fallback — the payload exists only in the failed request. It is **unrecoverable**. |
| **Trust** | The customer believes they are waiting for a callback that will never come. The second-order damage (a buyer who thinks GoThailandHome ignored them) is worse than an honest error. |
| **Marketing spend** | Phantom conversions are reported to Meta/Google, so bidding optimises toward traffic that produces no actual leads. Reported CPL diverges from real CPL with no visible signal. |
| **Detectability** | **Zero.** No alerting, no server log distinguishing the branches, and anon RLS blocks `select` — the platform cannot reconcile "leads submitted" against "leads stored". A month of loss looks identical to a quiet month. |
| **Blast radius** | All 6 forms / 5 channels: `find_my_home`, `list_your_property`, `viewing_request` (project pages), `developer_partnership`, `agency_partnership`, plus contact/platform support. |

## Risk Level

**CRITICAL — P0.**

Both the *impact* (unrecoverable revenue loss) and the *detectability* (none) are
worst-case. It is also the explicit NO-GO criterion in
`CEO_PRODUCT_REVIEW_GUIDE.md` §9 — *"a lead form loses data, submits silently."*

**Risk of the fix itself: LOW-MEDIUM.** The change is confined to a control-flow
branch in one file plus copy. The medium component is that `mode=placeholder`
may be load-bearing for preview/demo environments without Supabase — removing it
outright could break non-production deploys. Mitigated by the env gate in the
solution below.

## Recommended Solution

**Principle: a customer may only be told "received" when a row exists.**

**1. Fail honestly on the redirect path.** In `finalizeLead`, branch on
`result.ok`:

- `result.ok === true` → redirect to `/leads/success` (drop the `mode` param
  entirely; success now means stored).
- `result.ok === false` → redirect to **`buildLeadErrorPath(locale, channel, code)`**
  — the function already exists and is already used elsewhere. The error page
  must show a **real alternative contact route** so the customer is not stranded.

**2. Fail honestly on the inline path.** In the platform-support action, return
`ok: result.ok` and surface `check`-style error copy when false. Remove the
hardcoded `ok: true`.

**3. Retire `mode` from the customer surface.** Delete the
`stored | placeholder` distinction from `LeadSuccessPanel`, the success route's
params, and `leads.modeStored` / `leads.modePlaceholder` in all three
dictionaries. A success page that can render "we didn't actually save this" is
the bug, not the messenger.

**4. Preserve non-production behaviour behind an env gate.** If preview deploys
without Supabase must still demo a success screen, gate it explicitly — e.g.
`LEADS_ALLOW_PLACEHOLDER` (default **off**), honoured only when
`NODE_ENV !== "production"`. Never let a production deploy reach the placeholder
branch. **→ Product decision required (see below).**

**5. Stop firing conversion events for unstored leads.** Because `ok` will now be
true only on a real insert, `project-lead-form.tsx`'s existing `state.ok`
`useEffect` becomes correct with no change — but this must be **verified**, not
assumed.

**6. Make the failure observable.** `console.error` the Postgres error (never the
PII payload) in `createMarketplaceLead`'s error branch, so a spike is visible in
platform logs. This is the minimum; a durable fallback (queue/dead-letter/email)
is a follow-up, not this fix.

**Product decision required before implementation:**
> On storage failure, is the correct customer outcome (a) the honest error page
> with an alternative contact route, or (b) a retry, or (c) accept-and-queue?
> **This plan assumes (a).** Options (b) and (c) are larger changes and are out
> of scope for the P0 fix.

## Estimated Development Time

| Work | Estimate |
| --- | --- |
| `finalizeLead` branch + error-path wiring | 2 h |
| Platform-support inline path correction | 1.5 h |
| Retire `mode` from success page, panel, params, 3 dictionaries | 2 h |
| Env gate for non-production placeholder | 1.5 h |
| Error-branch logging | 0.5 h |
| Testing (see strategy) | 4 h |
| Code review + revision | 1.5 h |
| **Total** | **≈ 13 h — 1.5–2 developer days** |

Excludes the product decision above (blocking) and any durable-queue follow-up.

## Testing Strategy

**The whole point is the failure path. A green happy path proves nothing.**

| Layer | Test | Pass condition |
| --- | --- | --- |
| **Forced-failure (mandatory)** | In a local/staging env, make the insert fail — unset Supabase env, revoke the anon insert grant, or point at a bad table. Submit each of the 6 forms. | Customer lands on `/leads/error` with an alternative contact route. **Never** `/leads/success`. |
| **Transient-failure** | Simulate a Postgres error on insert (network cut / forced error) with env correctly configured. | Same as above — proves cause 3, the production-realistic case. |
| **Happy path** | Submit all 6 forms against working staging storage. | Lands on `/leads/success`; **a row exists in `marketplace_leads`** — verify with a service-role query, not by trusting the screen. |
| **Row-count reconciliation** | Submit N=10 leads across channels; count rows. | Rows stored == 10. This is the test that would have caught the original bug. |
| **Conversion tracking** | Forced-failure submit on a project page with the ads pixel in test mode. | **No** `fbq`/`gtag` Lead event fires. Happy path → exactly one fires. |
| **Consent guard** | Submit with consent unchecked. | Validation stops it on the form; no success page; no row. |
| **Placeholder gate** | Deploy preview without Supabase; then simulate a production build reaching the failure branch. | Preview may show placeholder if the gate is on; **production never can**. |
| **i18n** | Run forced-failure in en / zh / th. | Error copy is translated in all three; no English fallback leaking. |
| **Regression** | `npx tsc --noEmit`, `npx eslint`, `npm run test:ui-foundation`. | Clean — matches the Phase 12 validation bar. |
| **Manual (CEO checklist)** | Items 1.7.10, 1.11.7, 1.11.9, 1.11.11, 1.11.12, 1.11.13. | Success screen appears only for genuinely stored leads. |

---

# CRIT-02 — No legal pages exist, and no footer legal links

## Root Cause

**Content was never authored; routes were never built.** This is not a
regression, a broken link, or a translation gap — the artefacts do not exist at
any layer:

- No route directories under `src/app/[lang]/` for privacy, terms, cookies,
  disclaimer, or legal. `/en/privacy`, `/en/terms`, `/en/cookies`,
  `/en/disclaimer`, `/en/legal` all return **404**.
- No dictionary keys in `src/dictionaries/{en,zh,th}.json` — so it is missing in
  all three languages equally.
- `src/components/layout/site-footer.tsx` renders exactly two link columns —
  **Explore** (7) and **Company** (4: About, Knowledge, Partners, Contact) — plus
  a copyright line. There is no legal column and no legal link anywhere in the
  product.
- No cookie consent banner exists.

**The gap that makes it urgent:** six forms collect name, email, phone, LINE ID,
WhatsApp, and free-text messages behind a consent checkbox, and
`createMarketplaceLead` writes `consent: true` and
`consent_at: new Date().toISOString()` into `marketplace_leads`. **The platform
is recording affirmative consent to a privacy policy that does not exist.**

The only privacy-adjacent strings in the product are inline and page-scoped:
`marketplace.findPrivacyNote`, `developer.developerDisclaimer`, and
`developer.projectsDisclaimer` — role-separation statements, not legal documents.

## Business Impact

| Dimension | Impact |
| --- | --- |
| **Legal / regulatory** | Thailand's PDPA governs collection of exactly this personal data. Recording consent with no published policy defining purpose, retention, controller identity, or subject rights is the core exposure. GDPR is also in play — the platform markets to foreign buyers in English and Chinese. **Requires counsel, not engineering judgement.** |
| **Trust / conversion** | Fails "does the page look credible" and "international property-platform standard". A cautious foreign buyer looks for Privacy/Terms **before** giving a phone number to an unfamiliar Thai platform. Missing links suppress lead conversion precisely among the highest-value segment. |
| **Commercial** | Developer and agency partners perform diligence before signing. Absent terms is an obvious gap in partner review. |
| **Distribution** | Ad platforms (Meta/Google) require a reachable privacy policy for lead-gen advertising. This can block paid acquisition outright. |
| **Blast radius** | Whole platform, all locales, every form. |

## Risk Level

**HIGH — P1** (blocks launch unless explicitly waived in writing by the CEO).

**Not P0** on the audit's definition: no journey breaks and nothing misleads —
the pages are absent, not wrong. It is a launch-gating business/legal decision.

**Risk of the fix itself: LOW technically, HIGH on content.** The routes are
boilerplate. The danger is **shipping plausible-sounding legal text that was not
written or reviewed by counsel** — that is worse than shipping nothing, because
it creates a document the company is bound by. **Engineering must not draft this
content.**

## Recommended Solution

**Split into two tracks with different owners. The content track has the long
lead time and must start first.**

**Track A — Content (owner: CEO + legal counsel; NOT engineering)**
1. Commission PDPA-compliant (and GDPR-aware) **Privacy Policy**, **Terms of
   Service**, **Cookie Policy**, and **Disclaimer**.
2. The Privacy Policy must cover what the six forms actually collect (name,
   email, phone, LINE ID, WhatsApp, free-text message), the `marketplace_leads`
   storage, retention, and the controller's legal identity.
3. Commission **certified translations** into Simplified Chinese and Thai. Do
   not machine-translate legal text. Thai should be treated as the governing
   language for Thai jurisdiction — **confirm with counsel**.

**Track B — Implementation (owner: engineering; starts once Track A drafts land)**
1. Add four routes under `src/app/[lang]/`: `privacy`, `terms`, `cookies`,
   `disclaimer`. Reuse `PageShell` + breadcrumbs, matching About — no new
   patterns, no redesign.
2. Add a **Legal** column to `site-footer.tsx` (a third `links` array beside
   `explore` and `company`) with the four links.
3. Add dictionary keys (`nav.privacy`, `nav.terms`, `nav.cookies`,
   `nav.disclaimer`, `footer.legal`, plus `meta.*` title/description) to all
   three dictionaries.
4. Add the four paths to `staticPaths` in `src/app/sitemap.ts`.
5. Link the Privacy Policy from each form's consent checkbox so consent
   references the document it claims to.

**Explicitly deferred (separate decision, not this fix):** a cookie consent
banner. Whether one is required depends on what the site actually sets — that is
a counsel question, and adding a banner is a UX change, not a documentation fix.

## Estimated Development Time

| Track | Work | Estimate |
| --- | --- | --- |
| **A — Content** | Counsel drafting 4 documents | **1–3 weeks (external, blocking)** |
| **A — Content** | Certified zh + th translation | **3–7 days (external)** |
| **B — Eng** | 4 routes on the existing `PageShell` pattern | 4 h |
| **B — Eng** | Footer legal column | 1.5 h |
| **B — Eng** | Dictionary keys × 3 locales | 1.5 h |
| **B — Eng** | Sitemap `staticPaths` | 0.5 h |
| **B — Eng** | Consent-checkbox → policy links (6 forms) | 2 h |
| **B — Eng** | Testing + review | 3 h |
| **B — Eng subtotal** | | **≈ 12.5 h — 1.5 developer days** |

**Critical path is Track A, not engineering.** Engineering is ~1.5 days of work
gated behind 1–3 weeks of external drafting. **Start Track A immediately** —
before, not after, the P0 work.

## Testing Strategy

| Layer | Test | Pass condition |
| --- | --- | --- |
| **Route** | HTTP-check all 4 routes × 3 locales (12 URLs). | All 200. No 404 remains from the audit's list. |
| **Content integrity** | Diff rendered text against counsel's approved source. | Byte-identical. **Engineering must not paraphrase, summarise, or "tidy" legal copy.** |
| **i18n** | Load each page in en / zh / th. | Correct language throughout; no English fallback; Thai tone marks not clipped (per `RESPONSIVE_DESIGN_REPORT` risk note). |
| **Footer** | Load 3 different page types per locale. | Legal column renders identically everywhere; all 4 links resolve; focus-visible rings match the existing footer pattern. |
| **Consent linkage** | On each of the 6 forms, click the policy link by the consent checkbox. | Opens the Privacy Policy in the current locale; typed form data is not destroyed. |
| **Sitemap** | Fetch `/sitemap.xml`. | 12 new URLs present (4 × 3 locales). |
| **Responsive** | 1440 / 1024 / 768 / 390 / 375. | Long legal prose does not overflow horizontally; footer column stacks per the existing `md:grid-cols` rule. |
| **Design QA** | Compare against About. | Same `PageShell`, `ds-*` type scale, breadcrumbs — no new patterns introduced. |
| **Manual (CEO checklist)** | Item **1.2.9**. | Now passes. |

---

# CRIT-03 — District pages have no index; 44 of 56 unreachable by browsing

## Root Cause

**A missing page, not a missing capability.**

- `/{lang}/districts` does not exist — no `page.tsx` under
  `src/app/[lang]/districts/`, only `[slug]/page.tsx`. The index 404s in all
  three locales while **56 district detail pages are published and in the
  sitemap**.
- The homepage renders `districts.slice(0, 12)`
  (`src/app/[lang]/page.tsx:102`) — **Bangkok only, capped at 12** — linking to
  `/{lang}/districts/{slug}`.
- City detail pages list their districts via `listDistrictsByCity`.

Net: **at least 44 of 56 district pages are reachable only by first knowing which
city to open.** They are fully indexable by Google (`sitemap.ts` calls
`listDistricts()` and emits all 56 × 3 locales), so **search engines can reach
pages a human cannot browse to** — the platform's own navigation is weaker than
its sitemap.

**The data layer is already done.** `src/lib/data/geography.ts:125` already
exports `listDistricts(): Promise<DistrictView[]>`, and `sitemap.ts` already
consumes it. No query, no schema, no data work is required — **only a page and a
nav entry.** This materially lowers the cost versus the audit's assumption.

## Business Impact

| Dimension | Impact |
| --- | --- |
| **Journey** | "Explore where to live" is a core journey for foreign buyers, who typically know *Bangkok* but not *Watthana*. Forcing city-first navigation inverts how an unfamiliar buyer actually searches. |
| **Content ROI** | 56 district content packages (`content/areas/bangkok/districts/*.json`, 50 files) were authored and verified. 44 are effectively invisible to a browsing customer — investment already made, value not collected. |
| **SEO ↔ UX mismatch** | Google-sourced traffic lands on a district page with no sibling index to explore laterally — a weak internal linking structure and a dead-endy experience for the visitor. |
| **IA clarity** | Nav says **Cities** (6), homepage says **Explore Bangkok districts** (12), depth is district-level (56). The same journey is named three ways. |
| **Severity of loss** | No customer is misled and no journey breaks — the experience is thinner than it should be. This is opportunity cost, not damage. |

## Risk Level

**MEDIUM — P2.**

The audit left this as "P1 if districts are core to the journey, P2 if primarily
an SEO surface." **Recommend P2**, on two grounds: nothing is broken or
misleading (fails the P1 bar of "a real buyer would hesitate or be confused" —
they simply browse by city instead), and the fix is cheap enough that arguing
severity costs more than shipping it.

**Escalate to P1 only if** the CEO's judgement at checklist item **1.9.3** is
that district-first browsing is central to the buyer journey.

**Risk of the fix itself: LOW.** Additive — one new page, one nav entry. No
existing route, component, or query changes. `listDistricts()` is already
production-proven by the sitemap.

## Recommended Solution

**Build the index page. Do not redesign navigation.**

1. Add `src/app/[lang]/districts/page.tsx`, mirroring
   `src/app/[lang]/cities/page.tsx` — same `PageShell`, breadcrumbs, and
   `ds-*` grid. Source data from the existing `listDistricts()`.
2. **Group by city.** A flat list of 56 is a worse experience than the current
   city-first path. Grouping preserves the city→district mental model while
   making all 56 browsable from one screen. Reuse the existing
   `DistrictCardShell` — no new card component.
3. Link it from the homepage district section's "View all" (the generic
   `common.viewAll` string already exists from the Wave 1 fix) and from each city
   page's district block.
4. Add `/districts` to `staticPaths` in `src/app/sitemap.ts`.
5. Add dictionary keys (`nav.districts`, `meta.districtsTitle`,
   `meta.districtsDescription`) to all three dictionaries.

**Explicitly NOT in scope:** adding **Districts** to the primary nav. The desktop
nav already carries 11 links and is documented as crowded at 1024
(`MED-05` / `BUG_LIST` B10). Adding a 12th makes a known P2 worse. Reach the
index from the homepage and city pages instead. **Nav IA is a separate decision
(open decision #3), and this fix must not pre-empt it.**

**Product decision required:**
> Should the index cover all cities (56 districts across Bangkok, Pattaya,
> Phuket, Chiang Mai, Rayong, Hua Hin), or Bangkok only to match the homepage
> section's framing? **This plan assumes all cities**, grouped by city.

## Estimated Development Time

| Work | Estimate |
| --- | --- |
| `districts/page.tsx` mirroring the cities index, grouped by city | 3 h |
| Metadata + dictionary keys × 3 locales | 1 h |
| Homepage + city-page "View all" links | 1 h |
| Sitemap `staticPaths` | 0.25 h |
| Testing | 2 h |
| Review | 1 h |
| **Total** | **≈ 8.25 h — ~1 developer day** |

Low because `listDistricts()` already exists. **If this were a P1, it would still
be ~1 day** — severity does not change the cost, which is the argument for simply
shipping it.

## Testing Strategy

| Layer | Test | Pass condition |
| --- | --- | --- |
| **Route** | HTTP-check `/en/districts`, `/zh/districts`, `/th/districts`. | All **200** (currently 404). |
| **Coverage** | Count district links rendered on the index. | **All 56** published districts present and grouped by their correct city. The 44 previously unreachable are now browsable. |
| **Link integrity** | Click through every district link (or automate the 56). | All resolve 200; each lands on the district named on the card. |
| **Reachability** | From `/en` cold, reach a **non-Bangkok** district (e.g. `central-pattaya`) by clicking only. | Reachable without typing a URL or knowing the city — this is the defect being fixed. |
| **Data honesty** | Districts with no summary. | Card keeps grid rhythm (`min-h` + line-clamp, per the Wave 2 pattern); no collapsed cards. |
| **i18n** | Load all 3 locales. | District names in the right script; Thai wrapping clean; no English leakage. |
| **Responsive** | 1440 / 1280 / 1024 / 768 / 430 / 390 / 375. | 1 → 2 → 3 column step per `RESPONSIVE_DESIGN_REPORT`; **no horizontal overflow** at any width. |
| **Design QA** | Compare against the cities index. | Same shell, tokens, hover lift, focus rings. No new patterns. |
| **Nav non-regression** | Inspect header at 1024. | **Districts was NOT added to the primary nav**; link density unchanged (guards MED-05). |
| **Sitemap** | Fetch `/sitemap.xml`. | 3 new index URLs; the 168 district detail URLs unchanged. |
| **Regression** | `npx tsc --noEmit`, `npx eslint`, `npm run test:ui-foundation`. | Clean. |
| **Manual (CEO checklist)** | Items **1.9.1, 1.9.2, 1.9.3**. | Item 1.9.3 ("is the absence of a districts index a problem?") is retired by this fix. |

---

# Summary

| ID | Issue | Risk | Est. eng time | Critical path |
| --- | --- | --- | --- | --- |
| **CRIT-01** | Failed lead shows success page | **CRITICAL / P0** | ≈ 13 h (1.5–2 d) | Product decision on failure UX |
| **CRIT-02** | No legal pages / no footer legal links | **HIGH / P1** | ≈ 12.5 h (1.5 d) | **External counsel drafting: 1–3 weeks** |
| **CRIT-03** | No district index (44/56 unbrowsable) | **MEDIUM / P2** | ≈ 8.25 h (1 d) | Product decision on scope |
| | **Total engineering** | | **≈ 34 h — 4–4.5 developer days** | |

**The binding constraint is not engineering capacity — it is CRIT-02's external
legal drafting.** All three fixes are ~4.5 developer days combined; CRIT-02's
content track is 1–3 weeks and gates launch. Start it today, in parallel with
CRIT-01.

Execution order and classification: `IMPLEMENTATION_PRIORITY.md`.
Task breakdown: `DEVELOPMENT_TASKS.md`.
