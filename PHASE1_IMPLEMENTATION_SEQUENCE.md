# Phase 1 Implementation Sequence

**Purpose:** Convert the 36-task backlog into executable waves while preserving
small review boundaries and independent verification.

## 1. Execution rule

- Implement one task ID per review unit.
- Do not begin a task until its direct dependencies and approval gates are satisfied.
- A task is complete only when its acceptance criteria and quality gates pass.
- If a task reveals unrelated defects, record them separately; do not expand scope silently.
- Keep Windows01, runtime, live-source, synchronization, and deployment work outside every task.

## 2. Recommended sequence

### Wave 0 — Authorizations and fixtures

No implementation task starts in this wave.

1. Confirm explicit Phase 1 implementation authorization.
2. Approve core route list, viewport matrix, navigation IA, and loading/error copy.
3. Start G-PRODUCT-FAV, G-PRODUCT-COMPARE, G-CONTENT-PUBLIC,
   G-INVESTMENT, G-LEGAL, and G-ANALYTICS reviews in parallel.
4. Freeze deterministic local fixtures and route samples used by tests.

**Exit:** M1 can start; approval owners and due dates are named.

### Wave 1 — Independent foundations

Run in parallel:

- **P1-01** localized loading/error boundaries
- **P1-02** accessibility baseline
- **P1-03** responsive matrix
- **P1-04** navigation refinement
- **P1-06** search/filter URL contract
- **P1-09** property card decision information

**Merge/review order:** P1-01 → P1-02 → P1-03 → P1-04; P1-06 and P1-09 may
land independently if they avoid shared dictionary conflicts.

**Exit:** Shared quality contracts stable; M2/M3/M4 feature branches may begin.

### Wave 2 — Discovery interaction and content foundation

Run these lanes concurrently:

**Lane A — Discovery**

1. P1-07 listing filter interactions
2. P1-08 results/sort/pagination/empty state
3. P1-05 homepage conversion hierarchy

**Lane B — Detail foundations**

1. P1-10 property detail trust/inquiry hierarchy
2. P1-13 developer detail decision flow
3. P1-14 district detail discovery flow (after P1-08)

**Lane C — Content**

1. P1-22 static content schema/loader (**G-CONTENT-PUBLIC CLEARED 2026-07-20** — may proceed under normal implementation authorization)

**Lane D — Local engagement**

1. P1-15 favorites state contract (only after G-PRODUCT-FAV)

**Exit:** Discovery state and base loaders/storage contracts are review-approved.

### Wave 3 — Complete primary business surfaces

Run in parallel where file ownership does not overlap:

- P1-11 property gallery/media resilience
- P1-12 project detail decision flow (after P1-11)
- P1-16 favorites controls/page
- P1-17 comparison selection contract (after G-PRODUCT-COMPARE)
- P1-19 contact form reliability
- P1-23 knowledge article routes
- P1-25 investment guide (after G-INVESTMENT)
- P1-26 legal guide (after G-LEGAL)
- P1-27 FAQ hub
- P1-31 analytics bootstrap (after G-ANALYTICS)

**Exit:** All major feature primitives exist; no task waits on Windows01.

### Wave 4 — Integrated journeys

Recommended order:

1. P1-18 property comparison page/controls
2. P1-20 contextual inquiry handoff
3. P1-21 contact/marketplace consolidation
4. P1-24 blog routes
5. P1-28 static CMS/editorial validation
6. P1-29 content metadata/schema/sitemap
7. P1-30 internal links/breadcrumbs
8. P1-32 frontend event instrumentation

P1-18, P1-20, and P1-24 may run in parallel. P1-28 must see the final content
contracts; P1-29/P1-30 follow the public route set; P1-32 follows stable target UI.

**Exit:** End-to-end discovery, engagement, inquiry, content, SEO, and measurement
journeys are feature-complete.

### Wave 5 — Cross-route quality

Run evidence gathering in parallel, then fix by isolated finding group:

- P1-33 accessibility remediation
- P1-34 responsive remediation
- P1-35 performance/media budget pass

Avoid broad “cleanup” branches. A fix should cite the failing route, viewport,
selector/budget, and regression test.

**Exit:** All agreed quality matrices pass.

### Wave 6 — Release acceptance

- P1-36 Phase 1 release-candidate acceptance
- Obtain G-RELEASE decision

No feature code should be added during acceptance. Any failure reopens the
smallest responsible task or creates a new explicitly approved correction task.

## 3. Task execution template

Use this workflow for every future task:

1. **Confirm scope:** task ID, dependencies, approval evidence, allowed files.
2. **Capture baseline:** task-specific tests and current behavior.
3. **Implement minimally:** no adjacent feature or cleanup.
4. **Add regression coverage:** deterministic, local, exact failure message.
5. **Verify:** task test, typecheck, lint, aggregate test, build as required.
6. **Review:** acceptance checklist, locale parity, evidence/privacy/SEO impact.
7. **Close:** record files, results, known limitations, and next unblocked tasks.

## 4. Review-unit boundaries

| Review unit | Recommended maximum scope |
| --- | --- |
| State/helper task | One helper module + direct unit test |
| UI component task | One surface/component family + interaction test |
| Route task | One route family + metadata/schema/route test |
| Content task | One content type + loader/validation test |
| SEO task | One route inventory/schema change + deterministic SEO test |
| Quality remediation | One evidenced issue group + regression proof |

Dictionary updates may accompany the owning task but must include all EN/ZH/TH
keys and should not bundle unrelated copy.

## 5. Parallel ownership plan

With three engineers:

| Engineer/lane | Primary sequence |
| --- | --- |
| Discovery/UI | P1-03, P1-04, P1-05, P1-07–P1-14, P1-34–P1-35 |
| Engagement/forms | P1-01, P1-15–P1-21, P1-32–P1-33 |
| Content/SEO | P1-02, P1-22–P1-31, P1-36 |

Rotate reviews across lanes. Coordinate shared dictionaries, navigation,
`package.json`, sitemap, and schema files before editing.

## 6. Verification command policy

Minimum at task close:

```text
npm run typecheck
npm run lint
npm test
```

Also run `npm run build` for any route, layout, metadata, schema, content-loader,
configuration, or server/client boundary change. Run local route/browser
verification for navigation, forms, locale, responsive, accessibility, and
performance tasks.

No verification may contact a live property source or write production data.

## 7. Stop conditions

Stop the active task and request a decision if:

- a required approval is absent or ambiguous;
- implementation would need Windows01, a live source, runtime, collector, or DB sync;
- legal/investment copy lacks qualified approval;
- analytics would load without the approved consent basis;
- favorites/compare would require account/auth/backend behavior;
- a proposed field is not supported by current property evidence;
- a task cannot remain independently reviewable;
- existing P0 gates regress.

## 8. Recommended first implementation task

**P1-01 — Localized loading and route error boundaries**

It is small, Windows-independent, user-visible, and establishes failure behavior
needed by later forms and content routes. In parallel, prepare P1-02, P1-03,
P1-04, P1-06, and the approval gates.
