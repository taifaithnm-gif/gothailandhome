# Phase 1 Milestone Plan

**Milestones:** 6  
**Tasks:** 36  
**Planning assumption:** 2–3 engineers, one product/content reviewer, approvals available when scheduled  
**Boundary:** Website-only; no Windows01 or live-source dependency

## Milestone summary

| Milestone | Task range | Target duration | Decision |
| --- | --- | --- | --- |
| M1 — Resilient foundation | P1-01–P1-04 | 1–2 weeks | Required first |
| M2 — Discovery conversion | P1-05–P1-14 | 3–4 weeks | May overlap M3/M4 after shared contracts |
| M3 — Engagement and inquiry | P1-15–P1-21 | 2–3 weeks | Favorites/compare approval-gated |
| M4 — Static content product | P1-22–P1-28 | 2–3 weeks | Content/legal/investment approval-gated |
| M5 — SEO and measurement | P1-29–P1-32 | 1–2 weeks | Analytics approval-gated |
| M6 — Hardening and acceptance | P1-33–P1-36 | 2 weeks | Required last |

The target durations overlap. A purely sequential team should expect a longer
elapsed schedule than the indicative 10–14 weeks.

## M1 — Resilient foundation

**Tasks:** P1-01, P1-02, P1-03, P1-04  
**Effort:** 6–9 dev-days

### Objective

Create the quality and navigation foundation required for independent feature work.

### Entry criteria

- P0 final acceptance remains green.
- Explicit Owner authorization to begin Phase 1 implementation.
- Core route list and viewport matrix agreed.
- Error/loading copy and navigation information architecture approved.

### Deliverables

- Localized loading and recoverable error boundaries
- Automated accessibility baseline
- Repeatable responsive viewport matrix
- Stable desktop/mobile/footer navigation and locale-switching contracts

### Exit criteria

- All four task acceptance criteria pass independently.
- Critical routes have named a11y and responsive checks.
- Locale switching preserves supported paths and metadata behavior.
- Typecheck, lint, aggregate tests, and build remain green.

### Review checkpoint

Architecture/UX review of shared layout changes before M2/M3/M4 branches diverge.

## M2 — Discovery conversion

**Tasks:** P1-05–P1-14  
**Effort:** 17–25 dev-days

### Objective

Improve the complete route from homepage/search to an evidence-backed property,
project, developer, or district decision page.

### Entry criteria

- P1-02 and P1-04 complete.
- P1-06 may start immediately after P0; P1-07/P1-08 wait for its contract.
- No new source fields or live data are required.

### Delivery slices

1. **Discovery state:** P1-06 → P1-07 → P1-08
2. **Entry surfaces:** P1-04 → P1-05 and P1-09
3. **Property decision:** P1-10 → P1-11
4. **Entity centers:** P1-12, P1-13, P1-14

### Exit criteria

- Home/search/filter/results/card/detail journeys are coherent in EN/ZH/TH.
- Every displayed fact remains sourced or honestly absent.
- Result and related-content queries remain bounded.
- Route, metadata, JSON-LD, a11y, and responsive tests pass.

### Review checkpoint

Product review of one representative home → filter → property → inquiry journey
and one project/developer/district route in each locale.

## M3 — Engagement and inquiry

**Tasks:** P1-15–P1-21  
**Effort:** 12–18 dev-days

### Objective

Add low-risk accountless engagement and make inquiry flows reliable.

### Entry criteria

- G-PRODUCT-FAV closes before P1-15.
- G-PRODUCT-COMPARE closes before P1-17.
- P1-01 and P1-02 complete before form hardening.
- No auth expansion, backend favorites, CRM, or production-write scope.

### Delivery slices

1. **Favorites:** P1-15 → P1-16
2. **Compare:** P1-15 + G-PRODUCT-COMPARE → P1-17 → P1-18
3. **Inquiry:** P1-19 → P1-20 → P1-21

### Exit criteria

- Favorites and comparison are bounded, local-device, versioned, and privacy-safe.
- No local storage contains private contact data or full property records.
- Forms pass validation, consent, pending, duplicate-submit, and failure tests.
- Contact roles and persistence claims remain accurate.

### Review checkpoint

Privacy/product review of storage keys, retention wording, comparable field
allowlist, and inquiry result messaging.

## M4 — Static content product

**Tasks:** P1-22–P1-28  
**Effort:** 13–20 dev-days

### Objective

Create an approved, deterministic static-content publishing layer for business
website content without creating a runtime CMS.

### Entry criteria

- **G-CONTENT-PUBLIC: CLEARED (2026-07-20)** — public inventory, status vocabulary, ownership, and locale fallback are defined in `G_CONTENT_PUBLIC_PACKAGE.md` / `G_CONTENT_PUBLIC_OWNER_DECISION_REGISTER.md`.
- G-INVESTMENT closes before P1-25.
- G-LEGAL closes before P1-26.
- Content remains repository-managed and reviewable in source control.

### Delivery slices

1. **Foundation:** P1-22
2. **General content:** P1-23 → P1-24 and P1-27
3. **Qualified guides:** P1-25 and P1-26
4. **Editorial gate:** P1-28

### Exit criteria

- Only approved content is routable.
- Drafts, invalid slugs, and incomplete approval metadata fail closed.
- Citations, disclaimers, review dates, and fallback status render where required.
- Editorial validation runs in aggregate tests.

### Review checkpoint

Content Owner and qualified reviewers sign off exact versions before routes become
release-eligible.

## M5 — SEO and measurement

**Tasks:** P1-29–P1-32  
**Effort:** 7–11 dev-days

### Objective

Make Phase 1 content discoverable and measure approved frontend interactions
without violating consent or privacy boundaries.

### Entry criteria

- P1-23–P1-28 complete for SEO integration.
- G-ANALYTICS closes before P1-31.
- Provider IDs, consent basis, event taxonomy, PII rules, retention, and owner approved.

### Delivery slices

1. **Organic discovery:** P1-29 and P1-30
2. **Measurement:** P1-31 → P1-32

### Exit criteria

- New public routes have valid canonical/hreflang/OG/schema/sitemap behavior.
- No draft, personalized state, or noindex route enters sitemap.
- Analytics is inert without approved IDs/consent.
- Approved events contain no PII and do not double-fire.

### Review checkpoint

SEO review of generated HTML/sitemap and privacy review of actual emitted event payloads.

## M6 — Hardening and acceptance

**Tasks:** P1-33–P1-36  
**Effort:** 10–16 dev-days

### Objective

Resolve evidence-backed quality defects and make a formal Phase 1 release decision.

### Entry criteria

- All intended product tasks completed or explicitly waived.
- Approval records available for all gated public features.
- Representative routes/data fixtures fixed for repeatable verification.

### Delivery slices

1. **Accessibility remediation:** P1-33
2. **Responsive remediation:** P1-34
3. **Performance/media budgets:** P1-35
4. **Release candidate acceptance:** P1-36

### Exit criteria

- No agreed critical/serious accessibility failures.
- No horizontal overflow or unusable controls in the viewport matrix.
- Performance/media budgets pass without full-catalog SSR.
- Typecheck, lint, tests, build, route/metadata, and acceptance checks pass.
- Owner records GO, CONDITIONAL GO, or NO-GO.

## Cross-milestone controls

At every milestone close:

1. Review task-scoped diffs; do not bundle unrelated cleanup.
2. Verify EN/ZH/TH parity for localized work.
3. Run task tests plus typecheck/lint/test/build in proportion to change risk.
4. Confirm no Windows01/live-source/runtime/database/deployment work entered scope.
5. Record open approval gates and explicit waivers.
6. Do not advance a dependent task on an assumed approval.

## Schedule risk

The main risks are approval latency, dictionary conflicts, shared route-file
conflicts, and late accessibility/responsive findings. None requires Windows01.
Start product/content/privacy/legal approvals during M1 to keep them off the
critical path.
