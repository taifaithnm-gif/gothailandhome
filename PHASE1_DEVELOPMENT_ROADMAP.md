# Phase 1 Business Feature Development Roadmap

**Status:** Planning baseline  
**Scope:** GoThailandHome business website only  
**Entry condition:** P0 engineering stabilization accepted — GO  
**Execution boundary:** Mac mini/local development; no Windows01, runtime, collectors, live-source connection, database synchronization, or deployment

## 1. Phase objective

Phase 1 turns the stable Alpha website into a more complete discovery, engagement,
and content product. Work is divided into 36 small tasks that can each be
implemented, tested, and reviewed independently.

The earlier `IMPLEMENTATION_READINESS_REPORT.md` NO-GO applies to Content Factory,
Windows01, live-source, and pilot-runtime execution. It does not block the
Windows-independent website work defined here. Tasks that require product,
privacy, legal, analytics, or content approval remain individually gated.

## 2. Product outcomes

1. Improve discovery from home, search, filters, listing cards, and detail pages.
2. Add accountless favorites and comparison without creating an auth/backend dependency.
3. Make contact and inquiry journeys consistent, accessible, and failure-safe.
4. Expose approved static knowledge, blog, investment, legal, and FAQ content.
5. Extend SEO and frontend-only analytics without weakening consent or evidence rules.
6. Finish with measurable accessibility, responsive, performance, and release gates.

## 3. Scope boundary

### Included

- Home and global navigation
- Property listing, filters, search, pagination, cards, and detail
- Project, developer, and district detail
- Local-device favorites and comparison
- Contact forms and inquiry handoff
- Static knowledge, blog, investment, legal, and FAQ publishing
- Static CMS validation and editorial checks
- SEO, structured data, sitemap integration, and internal linking
- Frontend-only analytics after privacy/measurement approval
- Loading/error states, responsive behavior, accessibility, and performance

### Excluded

- Runtime, queues, workers, collectors, parsers, OCR, embeddings
- AI chat backend or generated factual content
- Database synchronization, migrations, or production data repair
- Live property sources or automated publication
- Windows01 installation, configuration, or integration
- Deployment, Search Console operations, CRM/email automation, or account expansion

## 4. Delivery principles

1. **Evidence first:** existing property/project/developer claims remain subject to
   current evidence and freshness controls.
2. **Progressive delivery:** each task has a bounded file surface and its own tests.
3. **No hidden backend:** favorites and compare are local-device features only.
4. **Fail closed:** forms and content loaders do not claim persistence/publication
   when storage or approvals are unavailable.
5. **Locale parity:** EN/ZH/TH route, metadata, and accessibility contracts apply to
   every new public page.
6. **Approval before exposure:** legal, investment, analytics, and public-content
   tasks cannot publish unapproved copy or identifiers.
7. **Green gates:** every task must preserve typecheck, lint, aggregate tests, and build.

## 5. Workstreams

| Workstream | Tasks | Primary outcome |
| --- | --- | --- |
| Foundation and resilience | P1-01–P1-04 | Reliable errors/loading, testable a11y, responsive baseline, coherent navigation |
| Discovery and detail | P1-05–P1-14 | Better home-to-detail property discovery |
| Engagement and inquiry | P1-15–P1-21 | Favorites, comparison, and reliable inquiry journeys |
| Static content product | P1-22–P1-28 | Approved articles, blog, guides, FAQ, and editorial validation |
| SEO and measurement | P1-29–P1-32 | Indexable content and consent-aware frontend measurement |
| Hardening and acceptance | P1-33–P1-36 | Cross-route quality fixes and release decision |

## 6. Milestone roadmap

| Milestone | Tasks | Exit condition | Estimated effort |
| --- | --- | --- | --- |
| M1 — Resilient foundation | P1-01–P1-04 | Error/loading, a11y harness, viewport matrix, and navigation contracts green | 6–9 dev-days |
| M2 — Discovery conversion | P1-05–P1-14 | Core discovery/detail journey verified across locales | 17–25 dev-days |
| M3 — Engagement and inquiry | P1-15–P1-21 | Local favorites/compare and inquiry flows pass deterministic tests | 12–18 dev-days |
| M4 — Content product | P1-22–P1-28 | Only approved static content is routable, validated, and reviewable | 13–20 dev-days |
| M5 — SEO and measurement | P1-29–P1-32 | New content indexed correctly; analytics is consent-aware and testable | 7–11 dev-days |
| M6 — Hardening and acceptance | P1-33–P1-36 | Quality budgets and Phase 1 acceptance checklist pass | 10–16 dev-days |

**Total estimated engineering effort:** 65–99 dev-days.  
**Indicative elapsed time:** 10–14 weeks with 2–3 engineers and timely approvals.

## 7. Approval gates

| Gate | Required before | Evidence | Status |
| --- | --- | --- | --- |
| G-PRODUCT-FAV | P1-15 | Owner approves accountless/local-device favorites and retention wording | Cleared via P1-15 contract |
| G-PRODUCT-COMPARE | P1-17 | Owner approves comparable fields and local-device selection behavior | Cleared via P1-17 contract |
| G-CONTENT-PUBLIC | P1-22/P1-23/P1-24/P1-27 | Content Owner approves public article/blog/FAQ inventory and locale fallback policy | **CLEARED 2026-07-20** — `G_CONTENT_PUBLIC_OWNER_DECISION_REGISTER.md` |
| G-INVESTMENT | P1-25 | Qualified reviewer approves scope, citations, disclaimer, and review cadence | **CLEARED 2026-07-20** — `G_INVESTMENT_OWNER_DECISION_REGISTER.md` |
| G-LEGAL | P1-26 | Qualified legal reviewer approves exact copy, citations, disclaimer, and owner | **CLEARED 2026-07-20** — `G_LEGAL_OWNER_DECISION_REGISTER.md` |
| G-ANALYTICS | P1-31 | Privacy/Business Owner approves provider, IDs, consent basis, taxonomy, and retention | **CLEARED 2026-07-20** — `G_ANALYTICS_OWNER_DECISION_REGISTER.md` |
| G-RELEASE | P1-36 | Owner approves release candidate after all required gates and tests | **CLEARED 2026-07-20** — `G_RELEASE_OWNER_DECISION_REGISTER.md` |

If a gate remains open, dependent tasks stay pending; unrelated work may continue.

## 8. Quality gate for every task

- Task-specific deterministic tests pass.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm test` passes.
- `npm run build` passes when route, metadata, configuration, or build behavior changes.
- EN/ZH/TH behavior is verified for localized surfaces.
- No production write, live-source call, deployment, or Windows01 dependency is introduced.
- Review diff is bounded to the task’s acceptance criteria.

## 9. Phase exit criteria

Phase 1 is complete only when:

1. P1-01 through P1-36 are completed or explicitly waived by the Owner.
2. All approval-gated public features have recorded approvals.
3. Core EN/ZH/TH journeys pass route, metadata, a11y, responsive, and performance checks.
4. Favorites/compare remain accountless and backend-independent.
5. Forms make no unsupported storage, CRM, or response-time claims.
6. Static content is approved, cited where required, and validated before publication.
7. Typecheck, lint, aggregate tests, build, and the Phase 1 acceptance suite are green.

## 10. Roadmap recommendation

**CONDITIONAL GO**

Begin M1 and non-gated M2 work after explicit implementation authorization.
Run approval work in parallel. Do not start gated favorites, compare, legal,
investment, public-content, or analytics tasks until their named gate closes.
Windows01 is not required for any Phase 1 task.
