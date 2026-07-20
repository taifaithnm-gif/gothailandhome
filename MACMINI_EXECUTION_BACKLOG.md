# Mac mini Execution Backlog

**Scope:** Website repository work only  
**Current mode:** Backlog definition; do not implement  
**Authorization rule:** “Authorized later” means technically eligible for a separate,
explicit Owner-approved implementation task. No code change is authorized by this backlog.

## Priority rules

- **P0 — Safe and necessary now:** restores trustworthy local engineering/Alpha gates.
- **P1 — Safe after P0:** strengthens existing surfaces without new business capability.
- **P2 — Wait for business decisions:** technically Mac-capable but product/content approval is missing.
- **BLOCKED:** requires Windows 01, approved sources, runtime gates, production access, or another
  explicitly prohibited dependency.

---

## P0 — Safe and necessary now

### MM-P0-01 — Resolve developer logo metadata contract test failure

- **Exact objective:** Decide whether `official_cached` is a valid logo status, then align the
  invariant test and authoritative metadata contract without weakening evidence controls.
- **Existing evidence:** `npm test` fails in `scripts/test-developer-center.mjs` because
  `public/developers/ananda-development/logo.meta.json` is `official_cached`; typecheck passes.
- **Files/modules likely involved:** `scripts/test-developer-center.mjs`,
  `public/developers/*/logo.meta.json`, developer evidence helpers/tests.
- **Dependency:** Owner/technical confirmation of the authoritative logo-status vocabulary;
  no Windows 01 dependency.
- **Risk:** Medium — blindly changing data or relaxing the test could mislabel official media.
- **Acceptance criteria:** Contract is documented in code/test; all legitimate statuses retain
  evidence/URL requirements; `npm test` proceeds past developer-center with no integrity downgrade.
- **Code changes authorized later:** **Yes, only under a separate scoped website-fix authorization.**
- **Estimated effort:** Small.

### MM-P0-02 — Restore and certify current local engineering gates

- **Exact objective:** Make current `eedf3f7` plus approved fixes pass typecheck, lint, the complete
  test chain, production build, and local route smoke tests.
- **Existing evidence:** Typecheck PASS; lint 0 errors/9 warnings; aggregate test FAIL; RC2 build
  PASS applies to older `e3a5a9a`, not current HEAD.
- **Files/modules likely involved:** `package.json`, failing test modules, affected source modules,
  route-check scripts; no deployment files.
- **Dependency:** MM-P0-01; explicit authorization to run a local build (writes `.next/`).
- **Risk:** Low.
- **Acceptance criteria:** `typecheck`, `lint`, `test`, and `build` exit 0; documented project and
  developer route checks pass locally; no production/network write.
- **Code changes authorized later:** **Yes**, scoped to gate repair; local build artifacts must
  remain uncommitted.
- **Estimated effort:** Small.

### MM-P0-03 — Add regression coverage for current route and metadata contracts

- **Exact objective:** Protect home, property, project, developer, district, lead result, metadata,
  canonical, OG, JSON-LD, robots, and sitemap contracts at current Alpha scope.
- **Existing evidence:** Many structural scripts exist, but aggregate execution stops early on the
  developer test and build/route checks are separate from `npm test`.
- **Files/modules likely involved:** `scripts/test-*.mjs`, `scripts/check-*-routes.mjs`,
  `src/lib/i18n/metadata.ts`, `src/lib/seo/schema.ts`, route files.
- **Dependency:** MM-P0-02; local fixture/server strategy.
- **Risk:** Low.
- **Acceptance criteria:** Deterministic non-production tests cover critical routes and SEO
  contracts; failures identify exact route/contract; no live data source is contacted.
- **Code changes authorized later:** **Yes**, test-only or minimal corrective code under separate approval.
- **Estimated effort:** Medium.

### MM-P0-04 — Correct sitemap inventory completeness

- **Exact objective:** Include every eligible published property URL per locale without unbounded
  memory/query behavior.
- **Existing evidence:** `src/app/sitemap.ts` is dynamic; RC2 and `KNOWN_LIMITATIONS_RC2.md`
  document approximately 1,000 URLs per locale against 1,318 published properties.
- **Files/modules likely involved:** `src/app/sitemap.ts`, `src/lib/data/properties.ts`,
  `scripts/test-seo-performance.mjs`.
- **Dependency:** Existing approved database read contract or deterministic local fixtures; no new
  source data and no schema change.
- **Risk:** Medium — sitemap generation can create load/build-time regressions.
- **Acceptance criteria:** Exact eligible count is covered for EN/ZH/TH; pagination/chunking is
  bounded; no draft/unverified/admin URLs; SEO test proves completeness.
- **Code changes authorized later:** **Yes**, after explicit SEO-fix authorization; no database mutation.
- **Estimated effort:** Medium.

### MM-P0-05 — Correct locale document-language semantics

- **Exact objective:** Ensure server-rendered document language is correct for EN/ZH/TH without
  relying on a client script.
- **Existing evidence:** `src/app/layout.tsx` hardcodes `<html lang="en">`; locale layout adds a
  nested `lang` and client script; RC2 backlog R2 records the limitation.
- **Files/modules likely involved:** `src/app/layout.tsx`, `src/app/[lang]/layout.tsx`,
  `src/config/locales.ts`, locale route tests.
- **Dependency:** Next.js 16.2.10 documented layout constraints must be checked before implementation.
- **Risk:** Medium — incorrect restructuring could affect static generation, caching, or routing.
- **Acceptance criteria:** Initial HTML has correct BCP 47 language for every locale; no hydration
  patch; route/build tests pass.
- **Code changes authorized later:** **Yes**, under a separate localization fix.
- **Estimated effort:** Medium.

---

## P1 — Safe after P0

### MM-P1-01 — Add branded loading and route error boundaries

- **Exact objective:** Provide accessible, localized recovery UI for route loading and runtime failures.
- **Existing evidence:** Global/locale 404 and lead error pages exist; no app-level `loading.tsx` or
  route `error.tsx`; RC2 backlog R7 is open.
- **Files/modules likely involved:** `src/app/[lang]/loading.tsx`,
  `src/app/[lang]/error.tsx`, shared UI states/dictionaries.
- **Dependency:** P0 clean gate; approved error copy.
- **Risk:** Low.
- **Acceptance criteria:** Errors expose recovery/navigation without leaking details; loading state
  is accessible; locale and structural tests pass.
- **Code changes authorized later:** **Yes**, after P0 and separate approval.
- **Estimated effort:** Small.

### MM-P1-02 — Establish automated accessibility baseline

- **Exact objective:** Add reproducible accessibility checks and correct evidenced issues on core routes/forms.
- **Existing evidence:** Strong semantic/focus/ARIA foundation and prior Lighthouse evidence; no full
  WCAG/axe CI (`PUBLIC_ALPHA_BACKLOG.md` R13).
- **Files/modules likely involved:** layout/header/forms/listing filters/gallery, test configuration
  and accessibility scripts.
- **Dependency:** P0 stable local server/test harness.
- **Risk:** Medium — broad component changes can regress design or behavior.
- **Acceptance criteria:** Core routes have no agreed critical/serious automated violations;
  keyboard/focus/form-error checks documented; existing tests remain green.
- **Code changes authorized later:** **Yes**, scoped to evidenced accessibility issues.
- **Estimated effort:** Medium.

### MM-P1-03 — Responsive route verification and targeted fixes

- **Exact objective:** Re-validate existing routes at mobile/tablet/desktop widths and fix actual
  overflow, target-size, navigation, form, gallery, and table defects.
- **Existing evidence:** Responsive classes and Phase 12 reports exist; no physical-device matrix.
- **Files/modules likely involved:** `src/components/layout/*`, listings, property/project/developer/
  district components, marketplace forms, admin table.
- **Dependency:** P0 gate; agreed viewport matrix.
- **Risk:** Low to Medium.
- **Acceptance criteria:** Core route matrix has no horizontal overflow or inaccessible controls at
  agreed widths; screenshots/evidence recorded; no redesign.
- **Code changes authorized later:** **Yes**, correction-only.
- **Estimated effort:** Medium.

### MM-P1-04 — Improve existing image performance and failure behavior

- **Exact objective:** Optimize sizes/loading for current licensed/local/approved assets and make
  missing-media behavior stable.
- **Existing evidence:** Key detail routes use `next/image`; `next.config.ts` allows Supabase remote
  images; many media gaps and CDN/image pipeline work remain.
- **Files/modules likely involved:** project/detail media, listing gallery/card/media frame,
  developer center, `next.config.ts`.
- **Dependency:** Media rights/evidence must remain intact; no scraping or new remote collection.
- **Risk:** Medium.
- **Acceptance criteria:** Correct dimensions/sizes/priority on LCP images; no layout shift or broken
  fallback; local performance comparison; no unapproved asset introduced.
- **Code changes authorized later:** **Yes**, existing-assets only.
- **Estimated effort:** Medium.

### MM-P1-05 — Harden existing forms and local failure paths

- **Exact objective:** Verify validation, consent, pending, placeholder-storage, duplicate-submit,
  and success/error behavior without enabling CRM or production automation.
- **Existing evidence:** Five marketplace entry forms, project/viewing forms, shared validation and
  lead result routes exist; RLS re-verification is an operational dependency before marketing.
- **Files/modules likely involved:** `src/components/marketplace/*`,
  `src/app/[lang]/marketplace/actions.ts`, project/viewing forms, lead tests.
- **Dependency:** Local/mock Supabase behavior; production data writes prohibited.
- **Risk:** Medium.
- **Acceptance criteria:** Deterministic tests cover success/failure/consent/double-submit; no lead
  loss claim; no CRM/email integration; no live production write.
- **Code changes authorized later:** **Yes**, local/fixture scope only.
- **Estimated effort:** Medium.

### MM-P1-06 — Expand knowledge routing for existing approved static articles

- **Exact objective:** Expose only already-approved, evidence-cited knowledge files through a
  deterministic article index/detail route.
- **Existing evidence:** `content/knowledge/articles/` exists; current `/knowledge` route links only
  general guides, glossary, and district index; no article loader/route found.
- **Files/modules likely involved:** `src/app/[lang]/knowledge/*`, new static loader, existing content
  manifests and metadata/schema helpers.
- **Dependency:** Content Owner confirms which existing articles are public and localized.
- **Risk:** Medium — publication may expose incomplete or untranslated claims.
- **Acceptance criteria:** Only approved articles render; citations and locale fallbacks are honest;
  sitemap/metadata/schema tests pass; no new factual content is invented.
- **Code changes authorized later:** **Conditional Yes**, after content approval.
- **Estimated effort:** Medium.

---

## P2 — Wait for business decisions

### MM-P2-01 — Decide property comparison scope

- **Exact objective:** Define whether Alpha needs side-by-side comparison and which evidence-backed
  fields may be compared.
- **Existing evidence:** No comparison route/component/state; project copy explicitly avoids
  investment comparison claims.
- **Files/modules likely involved:** Future property/project compare route and client state.
- **Dependency:** Product decision, privacy/persistence decision, field/evidence policy.
- **Risk:** Medium.
- **Acceptance criteria:** Approved product brief and comparison field contract before coding.
- **Code changes authorized later:** **No, not until business decision.**
- **Estimated effort:** Large.

### MM-P2-02 — Decide favorites and accountless persistence

- **Exact objective:** Choose no favorites, local-device favorites, or authenticated favorites.
- **Existing evidence:** No favorites/wishlist implementation; authentication expansion is explicitly deferred.
- **Files/modules likely involved:** Future cards/detail controls and persistence/auth layer.
- **Dependency:** Product/privacy/auth decision.
- **Risk:** Medium.
- **Acceptance criteria:** Approved UX, retention, cross-device, consent, and account policy.
- **Code changes authorized later:** **No, not until business decision.**
- **Estimated effort:** Medium to Large.

### MM-P2-03 — Approve legal and investment guidance scope/copy

- **Exact objective:** Decide whether to add dedicated legal/foreign-ownership/investment guidance,
  with qualified authorship, disclaimers, citations, and update ownership.
- **Existing evidence:** No legal route; investment content is limited and avoids invented yields/advice.
- **Files/modules likely involved:** Future knowledge/legal/investment routes and dictionaries.
- **Dependency:** Business Owner and qualified legal/content review; source/citation approval.
- **Risk:** High.
- **Acceptance criteria:** Signed-off scope/copy/citations/disclaimer/review cadence before publication.
- **Code changes authorized later:** **No until approved copy; route shell alone requires explicit scope approval.**
- **Estimated effort:** Large.

### MM-P2-04 — Approve analytics and webmaster operating model

- **Exact objective:** Decide GA4/GTM, consent, event taxonomy, GSC/Bing/IndexNow ownership, and paid
  conversion IDs.
- **Existing evidence:** Ads placeholders exist; GA4 ID/bootstrap and webmaster verification are absent.
- **Files/modules likely involved:** root/locale layouts, analytics component, `.env.example`,
  form events, privacy/cookie UI if required.
- **Dependency:** Business measurement plan, privacy decision, external account ownership.
- **Risk:** High.
- **Acceptance criteria:** Approved vendor/account IDs, consent basis, event dictionary, data retention,
  owner, and non-production validation plan.
- **Code changes authorized later:** **No until business/privacy decision.**
- **Estimated effort:** Medium.

### MM-P2-05 — Decide embedded map product and provider

- **Exact objective:** Decide whether external map links are sufficient or an embedded property map
  is required.
- **Existing evidence:** Coordinates and Google Maps links exist; no map component/provider integration.
- **Files/modules likely involved:** district/property/project surfaces and future provider adapter.
- **Dependency:** Provider/licensing/privacy/performance decision and coordinate quality standard.
- **Risk:** Medium.
- **Acceptance criteria:** Approved provider, key handling, consent, fallback, clustering and data-quality scope.
- **Code changes authorized later:** **No until business/provider decision.**
- **Estimated effort:** Large.

---

## BLOCKED — Wait for Windows 01 or approved data sources

### MM-BLK-01 — Live property collection and ingestion

- **Exact objective:** Collect approved pilot data.
- **Existing evidence:** G1/G4/G5 open; no live sources or manifest; Runtime Architecture remains planned.
- **Files/modules likely involved:** Explicitly outside website source; future Windows runtime.
- **Dependency:** G1 sources, G2/G3, G4 Windows, G5 manifest, legal approval.
- **Risk:** Critical.
- **Acceptance criteria:** All gates close before any collection.
- **Code changes authorized later:** **No.**
- **Estimated effort:** Large.

### MM-BLK-02 — Sprint 2 evidence/review/admin workflow

- **Exact objective:** Implement candidate → intake → fact → duplicate → publish review with immutable decisions.
- **Existing evidence:** Existing admin is basic Supabase property CRUD; runtime/store/roles are unselected.
- **Files/modules likely involved:** Future review application and isolated authoritative store; not current CRUD.
- **Dependency:** G2/G3, named roles, implementation charter, storage/audit decision.
- **Risk:** Critical.
- **Acceptance criteria:** Separate approved implementation plan and non-production architecture.
- **Code changes authorized later:** **No under current boundary.**
- **Estimated effort:** Large.

### MM-BLK-03 — Automated package publication

- **Exact objective:** Publish approved Content Factory packages to GoThailandHome.
- **Existing evidence:** G6 open; staging handoff unproven; Feature Freeze active; rollback not rehearsed.
- **Files/modules likely involved:** Future adapter/package boundary, not current website routes.
- **Dependency:** Successful pilot, package hash/citations, rollback, G6, freeze lift.
- **Risk:** Critical.
- **Acceptance criteria:** RG-01–RG-24 pass and explicit Owner publication authorization.
- **Code changes authorized later:** **No.**
- **Estimated effort:** Large.

### MM-BLK-04 — OCR, embeddings, project-specific AI backend

- **Exact objective:** Add extraction/semantic/AI backend capability.
- **Existing evidence:** OCR conditional only; embeddings deferred; runtime architecture excludes AI generation service.
- **Files/modules likely involved:** None authorized.
- **Dependency:** Separate Owner decision; source-specific need; G3/G4 security/resource review.
- **Risk:** High.
- **Acceptance criteria:** New approved decision and architecture; otherwise remain absent.
- **Code changes authorized later:** **No.**
- **Estimated effort:** Large.

### MM-BLK-05 — Production database/schema and production data repair

- **Exact objective:** Migrate schema, clean current live data drift, or alter production records.
- **Existing evidence:** D-022 and Feature Freeze prohibit database changes; RC2 documents +3 row drift and seed entities.
- **Files/modules likely involved:** `supabase/migrations/`, provisioning/apply scripts, production data layer.
- **Dependency:** Separate migration proposal, impact/rollback plan, freeze lift, Owner authorization.
- **Risk:** Critical.
- **Acceptance criteria:** Explicit database gate and tested rollback before any mutation.
- **Code changes authorized later:** **No.**
- **Estimated effort:** Large.

### MM-BLK-06 — Windows 01 runtime deployment

- **Exact objective:** Install/configure the isolated Content Factory runtime.
- **Existing evidence:** All W-PRE authorization/host/identity/network/storage/backup prerequisites are open.
- **Files/modules likely involved:** Windows 01 only; outside website worktree.
- **Dependency:** G3/G4 and `WINDOWS01_DEPLOYMENT_PREREQUISITES.md`.
- **Risk:** Critical.
- **Acceptance criteria:** G4 checklist PASS with restore/removal proof.
- **Code changes authorized later:** **No.**
- **Estimated effort:** Large.

## Recommended first task

**MM-P0-01 — Resolve developer logo metadata contract test failure.**

It is the smallest evidenced defect blocking the aggregate test suite, has no Windows 01 or live
source dependency, and should be resolved before claiming current build/test readiness.
