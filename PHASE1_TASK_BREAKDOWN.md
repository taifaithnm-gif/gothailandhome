# Phase 1 Task Breakdown

**Task count:** 36  
**Sizing:** S = 0.5–1 dev-day · M = 1–2 dev-days · L = 3–5 dev-days  
**Universal boundary:** Every task has **Windows01 Dependency: NO**.

## M1 — Resilient foundation

### P1-01 — Localized loading and route error boundaries

- **Objective:** Add branded, accessible loading and recoverable error states for localized public routes.
- **Existing module:** Locale root layout, `ui/states`, localized/global not-found pages.
- **Files likely involved:** `src/app/[lang]/loading.tsx`, `src/app/[lang]/error.tsx`, `src/components/ui/states.tsx`, `src/dictionaries/{en,zh,th}.json`, route-state tests.
- **Dependency:** P0 accepted; approved concise error/loading copy.
- **Acceptance Criteria:** EN/ZH/TH states render; errors expose retry/home navigation without internal details; focus and live-region behavior are tested; existing routes remain unchanged.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-02 — Automated accessibility baseline

- **Objective:** Establish deterministic accessibility checks for core public routes and forms.
- **Existing module:** Semantic UI components, breadcrumbs, fields, header/footer, current structural tests.
- **Files likely involved:** `package.json`, accessibility test configuration, `scripts/test-*.mjs`, optional browser-test fixtures.
- **Dependency:** P0 route/build harness.
- **Acceptance Criteria:** Agreed core route set is checked; critical/serious violations fail with route and selector; keyboard/focus/form-error checks are documented; no live service is contacted.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-03 — Responsive verification matrix

- **Objective:** Define and automate the mobile/tablet/desktop viewport matrix for core routes.
- **Existing module:** Responsive Tailwind layouts across header, grids, forms, gallery, and detail centers.
- **Files likely involved:** responsive test scripts/config, route fixtures, screenshot/output directory policy.
- **Dependency:** P0 local server harness.
- **Acceptance Criteria:** Core routes are checked at agreed widths; overflow, clipped controls, and unusable target sizes are reported by route/viewport; test is repeatable locally.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-04 — Navigation and locale-switching refinement

- **Objective:** Make primary/mobile/footer navigation coherent as Phase 1 routes grow.
- **Existing module:** `site-header.tsx`, `site-footer.tsx`, `localePath`, locale metadata contracts.
- **Files likely involved:** `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`, dictionaries, navigation tests.
- **Dependency:** Approved Phase 1 information architecture.
- **Acceptance Criteria:** Desktop/mobile groups match; active state is correct; locale switch preserves route/query where supported; keyboard behavior and EN/ZH/TH labels pass tests.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

## M2 — Discovery and detail

### P1-05 — Homepage conversion hierarchy

- **Objective:** Clarify the path from home to buy/rent, filtered listings, projects, districts, and inquiry.
- **Existing module:** `src/app/[lang]/page.tsx`, home hero search, property/project/developer cards, marketplace entry grid.
- **Files likely involved:** home page, `home-hero-search.tsx`, selected card/grid components, dictionaries, homepage tests.
- **Dependency:** P1-04; approved section order and CTA priorities.
- **Acceptance Criteria:** Every CTA lands on a valid localized route; featured sections remain bounded; no unsupported “verified” or performance claims; mobile order and keyboard flow are tested.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-06 — Search and filter URL contract hardening

- **Objective:** Freeze canonical parse/serialize semantics for all supported listing filters.
- **Existing module:** `src/lib/search/listing-search-state.ts`, `/search` redirect, `/properties` query handling.
- **Files likely involved:** search-state helper, listing-search tests, search/properties route tests.
- **Dependency:** None.
- **Acceptance Criteria:** All supported filters round-trip deterministically; invalid values fail safely; page resets on filter change; unknown parameters are ignored; localized base paths are preserved.
- **Estimated Size:** S
- **Windows01 Dependency:** NO

### P1-07 — Listing filter interaction improvements

- **Objective:** Improve filter usability, dependency behavior, reset/apply states, and accessibility.
- **Existing module:** `listing-filters.tsx`, shared `Field` components, city/district/project/developer options.
- **Files likely involved:** listing filters, field components, dictionaries, filter interaction tests.
- **Dependency:** P1-02, P1-06.
- **Acceptance Criteria:** Labels/errors are programmatic; mobile disclosure is keyboard-safe; active count is accurate; reset is deterministic; dependent options do not silently retain invalid values.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-08 — Results, sorting, pagination, and empty-state polish

- **Objective:** Make listing result state understandable across sort, page, count, no-result, and query combinations.
- **Existing module:** properties page, `search-results-chrome.tsx`, `listing-pagination.tsx`, `property-grid.tsx`.
- **Files likely involved:** result chrome, pagination, properties route, dictionaries, pagination/search tests.
- **Dependency:** P1-06, P1-07.
- **Acceptance Criteria:** Result summary reflects filters; canonical first page omits `page=1`; pagination preserves valid filters; no-result state offers useful reset/navigation; focus moves predictably.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-09 — Property card decision information

- **Objective:** Improve scanability of evidence-backed price, type, location, key facts, freshness, and primary CTA.
- **Existing module:** `property-card.tsx`, badges, listing media frame, data mapper.
- **Files likely involved:** property card, badges/media frame, dictionaries, property-card tests.
- **Dependency:** Property data display fields already available; no new source fields.
- **Acceptance Criteria:** Cards show only sourced fields; missing values remain honest; links and accessible names are unique; layout works at matrix widths; no card increases first-page catalog size.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-10 — Property detail trust and inquiry hierarchy

- **Objective:** Strengthen detail-page evidence presentation, contact-role separation, and inquiry CTAs.
- **Existing module:** property detail page, listing contact card, evidence badges, viewing form.
- **Files likely involved:** `properties/[id]/page.tsx`, `listing-contact-card.tsx`, contact blocks, dictionaries, detail tests.
- **Dependency:** P1-02; existing evidence/contact contracts.
- **Acceptance Criteria:** Listing owner/agent and platform support remain distinct; stale/missing facts are not promoted; viewing/contact CTAs carry listing context; metadata/JSON-LD contracts remain green.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-11 — Property gallery and media resilience

- **Objective:** Optimize existing approved media and stabilize gallery fallback/failure behavior.
- **Existing module:** listing gallery, listing media frame, no-image state, `next/image`.
- **Files likely involved:** `listing-gallery.tsx`, `listing-media-frame.tsx`, `ui/no-image.tsx`, media tests.
- **Dependency:** P1-10; existing approved/local media only.
- **Acceptance Criteria:** Correct dimensions/sizes/priority; keyboard-operable gallery; broken/missing images show labeled fallback; no layout shift or unapproved remote asset.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-12 — Project detail decision flow

- **Objective:** Improve navigation through project facts, evidence, units, facilities, nearby places, FAQ, related listings, and inquiry.
- **Existing module:** project detail route, normalized project content, project lead form, FAQ schema.
- **Files likely involved:** `projects/[slug]/page.tsx`, project components/helpers, dictionaries, project tests.
- **Dependency:** P1-02, P1-11; existing approved project packages.
- **Acceptance Criteria:** Section anchors and hierarchy are usable; facts retain evidence labels; FAQ schema matches visible FAQ; related listings remain bounded; inquiry includes project context.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-13 — Developer detail decision flow

- **Objective:** Improve developer identity, evidence, project portfolio, listing preview, and contact pathways.
- **Existing module:** developer detail route and `developer-center.tsx`.
- **Files likely involved:** developer page/center, logo/evidence helpers, dictionaries, developer tests.
- **Dependency:** P1-02; existing official/placeholder logo contract.
- **Acceptance Criteria:** Logo status is represented honestly; portfolio is labeled as platform subset; previews remain bounded; metadata/schema and responsive/a11y checks pass.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-14 — District detail discovery flow

- **Objective:** Make district pages useful entry points to projects, listings, location facts, and knowledge.
- **Existing module:** district detail route, `district-center.tsx`, geography/package loaders.
- **Files likely involved:** district page/center, related links, dictionaries, district tests.
- **Dependency:** P1-02, P1-08.
- **Acceptance Criteria:** Only available district facts render; empty amenities remain honest; project/listing previews are bounded; links preserve locale; metadata/schema pass.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

## M3 — Engagement and inquiry

### P1-15 — Accountless favorites state contract

- **Objective:** Define a local-device favorites model with versioning, limits, migration, and privacy-safe behavior.
- **Existing module:** None; property IDs/slugs and client components already exist.
- **Files likely involved:** new `src/lib/favorites/*`, storage adapter, unit tests.
- **Dependency:** G-PRODUCT-FAV approval.
- **Acceptance Criteria:** No account/backend; deterministic add/remove/clear; corrupt/old storage fails safely; bounded item count; no property data beyond stable identifiers is persisted.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-16 — Favorites controls and localized favorites page

- **Objective:** Expose save/remove controls on cards/detail and a page listing saved properties.
- **Existing module:** property cards/grid/detail and locale routing.
- **Files likely involved:** favorite button, provider/hook, `src/app/[lang]/favorites/page.tsx`, navigation/dictionaries/tests.
- **Dependency:** P1-04, P1-15.
- **Acceptance Criteria:** Controls announce state; hydration is stable; missing/unpublished saved items are removed or clearly unavailable; empty state works; EN/ZH/TH metadata and tests pass.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-17 — Comparison selection contract

- **Objective:** Define accountless comparison state and an approved evidence-backed field allowlist.
- **Existing module:** None; reusable property view fields and local storage pattern from favorites.
- **Files likely involved:** new `src/lib/compare/*`, comparison field contract, tests.
- **Dependency:** P1-15; G-PRODUCT-COMPARE approval.
- **Acceptance Criteria:** Selection is bounded; only stable identifiers persist; field allowlist excludes unsupported investment claims; duplicate/corrupt selections fail safely.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-18 — Property comparison page and controls

- **Objective:** Add compare controls and a localized side-by-side comparison page.
- **Existing module:** cards/detail, UI table/card primitives, property data loader.
- **Files likely involved:** compare controls/tray, `src/app/[lang]/compare/page.tsx`, comparison view, dictionaries/tests.
- **Dependency:** P1-02, P1-17.
- **Acceptance Criteria:** Two-to-four items compare on approved fields; missing values display as unknown, not zero; table is responsive/accessible; removed/unpublished items are handled; page is noindex if state-dependent.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-19 — Contact form reliability and failure paths

- **Objective:** Harden validation, consent, pending, duplicate-submit, storage-unavailable, and success/error behavior.
- **Existing module:** marketplace forms, form kit, server actions, lead validation/result routes.
- **Files likely involved:** `components/marketplace/*`, `marketplace/actions.ts`, validation/leads helpers, form tests.
- **Dependency:** P1-01, P1-02; local/mock storage behavior only.
- **Acceptance Criteria:** Deterministic success/failure/consent/double-submit tests; no duplicate client submissions; accurate placeholder/storage messaging; no CRM/email claim or production write.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-20 — Contextual inquiry handoff

- **Objective:** Carry property/project/developer context into the appropriate inquiry form and result page.
- **Existing module:** viewing request, project lead form, contact blocks, lead URLs/channels.
- **Files likely involved:** inquiry forms, lead URL/channel helpers, marketplace actions, result panels, tests.
- **Dependency:** P1-10, P1-12, P1-13, P1-19.
- **Acceptance Criteria:** Context identifiers are allowlisted and validated; result page confirms channel/reference without exposing private payload; locale and back-navigation are preserved.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-21 — Contact and marketplace journey consolidation

- **Objective:** Align Contact, Marketplace, Find My Home, List Property, partnership, and viewing entry points.
- **Existing module:** contact page, marketplace hub/grid, five forms, contact blocks.
- **Files likely involved:** contact/marketplace pages, entry grid, header/footer links, dictionaries, journey tests.
- **Dependency:** P1-04, P1-19, P1-20.
- **Acceptance Criteria:** Each audience has one clear entry path; no dead/duplicate CTA; contact roles remain accurate; private submissions are never presented as published; route matrix passes.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

## M4 — Static content product

### P1-22 — Static content schema and loader

- **Objective:** Define a validated, filesystem-scoped content contract for approved website articles.
- **Existing module:** `content/knowledge/articles/INDEX.json`, one article JSON, glossary loader patterns.
- **Files likely involved:** new `src/lib/content/*`, content schemas/types, fixture tests.
- **Dependency:** G-CONTENT-PUBLIC approval of content types and locale fallback policy.
- **Acceptance Criteria:** Loader is scoped to approved content directory; slug/type/status/locale/citations validate; drafts do not render; deterministic order; no broad project filesystem trace.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-23 — Knowledge article index and detail routes

- **Objective:** Publish approved static knowledge articles through localized index/detail routes.
- **Existing module:** `/knowledge`, glossary/district knowledge pages, existing article index.
- **Files likely involved:** `knowledge/page.tsx`, new `knowledge/articles/[slug]/page.tsx`, content components, dictionaries/tests.
- **Dependency:** P1-22; public article inventory approval.
- **Acceptance Criteria:** Only approved articles render; citations and verification date are visible; locale fallback is disclosed; unknown/draft slugs 404; metadata and route tests pass.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-24 — Static blog index and detail routes

- **Objective:** Add a clearly separated editorial/blog content type using the validated static loader.
- **Existing module:** No blog route; knowledge content and UI primitives exist.
- **Files likely involved:** `src/app/[lang]/blog/*`, content schema/index, shared article components, dictionaries/tests.
- **Dependency:** P1-22, P1-23; approved blog inventory and ownership.
- **Acceptance Criteria:** Blog is distinguished from evidence/reference guides; drafts excluded; author/date/update labels defined; EN/ZH/TH metadata and empty-state behavior pass.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-25 — Investment guide surface

- **Objective:** Publish approved educational investment guidance without advice, yield, or return claims not supported by evidence.
- **Existing module:** Knowledge hub and article components; no dedicated investment guide.
- **Files likely involved:** localized investment guide route/content, disclaimers, citations, dictionaries/tests.
- **Dependency:** P1-22; G-INVESTMENT approval.
- **Acceptance Criteria:** Exact approved copy/citations/disclaimer render; review date/owner visible; no calculator or invented yield; structured data matches visible content.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-26 — Legal guide surface

- **Objective:** Publish qualified, approved legal/foreign-ownership guidance as informational content.
- **Existing module:** Knowledge hub/article components; no dedicated legal route.
- **Files likely involved:** localized legal guide route/content, disclaimer/citation components, dictionaries/tests.
- **Dependency:** P1-22; G-LEGAL approval.
- **Acceptance Criteria:** Legal reviewer-approved text is byte/version identifiable; jurisdiction, disclaimer, citations, review date, and owner display; no personalized legal advice claim.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-27 — FAQ hub

- **Objective:** Aggregate approved platform/process/property FAQs into a localized, searchable-by-heading static page.
- **Existing module:** Project FAQ rendering/schema and dictionary/content patterns.
- **Files likely involved:** `src/app/[lang]/faq/page.tsx`, FAQ content/index, accordion/details UI, dictionaries/tests.
- **Dependency:** P1-22; G-CONTENT-PUBLIC.
- **Acceptance Criteria:** Visible questions equal FAQ schema; categories and anchors work; keyboard semantics pass; unsupported legal/investment answers link to approved guides rather than improvise.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-28 — Static CMS validation and editorial QA

- **Objective:** Add one command that validates all public static content before review/build.
- **Existing module:** JSON content indexes, dictionaries, structural test scripts.
- **Files likely involved:** `scripts/test-content-*.mjs`, `package.json`, content fixtures, route metadata tests.
- **Dependency:** P1-22–P1-27 as applicable.
- **Acceptance Criteria:** Duplicate slugs, missing locale policy, invalid status, broken internal links, absent required citations/disclaimers, and stale review dates fail with file/field; command runs in aggregate tests.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

## M5 — SEO and frontend measurement

### P1-29 — Content metadata, schema, and sitemap integration

- **Objective:** Make approved new content discoverable with correct canonical, hreflang, OG, schema, and sitemap behavior.
- **Existing module:** metadata helper, JSON-LD/schema helpers, bounded sitemap inventory, route-metadata tests.
- **Files likely involved:** new content routes, `src/lib/seo/schema.ts`, `src/app/sitemap.ts`, SEO tests.
- **Dependency:** P1-23–P1-28.
- **Acceptance Criteria:** Approved pages included per locale; drafts/noindex pages excluded; canonical/hreflang/OG valid; Article/FAQ schema mirrors visible content; sitemap remains deterministic/bounded.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-30 — Internal linking and breadcrumb completion

- **Objective:** Connect home, discovery, detail, district, developer, knowledge, blog, and guides through contextual links.
- **Existing module:** breadcrumb component/schema, header/footer, detail related sections.
- **Files likely involved:** navigation, breadcrumbs, selected route pages, content components, internal-link tests.
- **Dependency:** P1-04, P1-12–P1-14, P1-23–P1-27.
- **Acceptance Criteria:** No orphan public Phase 1 route; visible breadcrumb equals schema; links preserve locale; no circular/irrelevant bulk links; route tests identify broken target.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

### P1-31 — Consent-aware frontend analytics bootstrap

- **Objective:** Replace placeholders with a provider adapter that loads only after approved consent.
- **Existing module:** `ads-tracking-placeholders.tsx`, optional `gtag` call in project lead form.
- **Files likely involved:** new analytics component/adapter, locale root layout, environment example, consent UI if required, tests.
- **Dependency:** G-ANALYTICS approval.
- **Acceptance Criteria:** No network script before consent where required; missing IDs are inert; dev/test uses a fake adapter; no PII in events; provider failure does not break pages.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-32 — Frontend event taxonomy and instrumentation

- **Objective:** Instrument approved discovery and lead-intent events through the analytics adapter.
- **Existing module:** property/project/detail CTAs, filters, favorites/compare, forms, placeholder conversion event.
- **Files likely involved:** analytics event types, selected client components/forms, deterministic event tests.
- **Dependency:** P1-31 and completed target surfaces.
- **Acceptance Criteria:** Event names/properties match approved taxonomy; identifiers are non-PII; duplicate events are prevented; disabled/denied consent produces no calls; conversion events fire only after confirmed outcome.
- **Estimated Size:** M
- **Windows01 Dependency:** NO

## M6 — Hardening and acceptance

### P1-33 — Cross-route accessibility remediation

- **Objective:** Resolve evidenced critical/serious accessibility defects across Phase 1 routes.
- **Existing module:** P1-02 baseline and all delivered route/components.
- **Files likely involved:** only components/routes named by test evidence; accessibility regression tests.
- **Dependency:** P1-01–P1-32 relevant surfaces; P1-02.
- **Acceptance Criteria:** Agreed core matrix has zero critical/serious automated violations; keyboard/focus/error behavior manually checked; fixes do not redesign unrelated surfaces.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-34 — Cross-route responsive remediation

- **Objective:** Resolve evidenced overflow, target-size, navigation, form, gallery, table, and content-layout defects.
- **Existing module:** P1-03 matrix and all Phase 1 public surfaces.
- **Files likely involved:** only routes/components named by viewport evidence; responsive regression fixtures.
- **Dependency:** P1-03 and delivered target surfaces.
- **Acceptance Criteria:** Core viewport matrix has no horizontal overflow/clipped action; compare/content tables have usable mobile patterns; screenshots/evidence recorded.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-35 — Performance and media budget pass

- **Objective:** Enforce route-level payload, LCP-media, and layout-stability budgets without changing source data.
- **Existing module:** image/media components, pagination, build output, prior performance reports.
- **Files likely involved:** media/card/detail/content components, performance scripts/config, build-budget tests.
- **Dependency:** P1-05–P1-14, P1-23–P1-29.
- **Acceptance Criteria:** Agreed local budgets pass on representative routes; no full-catalog SSR; image priority is bounded; no unsupported performance claim; pre-existing NFT warning is either scoped separately or documented.
- **Estimated Size:** L
- **Windows01 Dependency:** NO

### P1-36 — Phase 1 release-candidate acceptance

- **Objective:** Execute the complete business-feature acceptance matrix and produce a release decision.
- **Existing module:** P0 gate scripts, Phase 1 tests, route smoke tests, milestone evidence.
- **Files likely involved:** acceptance script/checklist and release report only; corrective files require separate failing-task scope.
- **Dependency:** P1-01–P1-35 or recorded Owner waivers; G-RELEASE.
- **Acceptance Criteria:** Typecheck/lint/test/build pass; EN/ZH/TH route/metadata/a11y/responsive/performance matrices pass; approval records exist; no prohibited dependency or production write; GO/CONDITIONAL GO/NO-GO recorded.
- **Estimated Size:** M
- **Windows01 Dependency:** NO
