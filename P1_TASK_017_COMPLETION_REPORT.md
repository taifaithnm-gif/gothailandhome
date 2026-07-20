# Phase 1 Task 017 Completion Report

**Date:** 2026-07-19  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` — working tree only; no commit, push, or deploy

## Task ID

**P1-17** — Comparison selection contract

## Objective

Define accountless comparison state and an approved evidence-backed field
allowlist.

## Files modified

1. `src/lib/compare/index.ts` — accountless compare selection contract:
   versioned parse/serialize, normalize (identifiers only), add/remove/clear,
   bounded capacity (`COMPARE_MAX_ITEMS = 4`), memory + browser storage
   adapters, local-device retention note.
2. `src/lib/compare/fields.ts` — G-PRODUCT-COMPARE field allowlist of
   evidence-backed PropertyView facts; explicit investment-claim blocklist;
   `unknown_not_zero` missing-value policy for P1-18 UI.
3. `scripts/test-compare-state.mjs` — P1-17 deterministic contract suite.
4. `package.json` — `test:compare-state` wired into `npm test`.
5. `P1_TASK_017_COMPLETION_REPORT.md` — this report.

No compare UI, route, navigation, or dictionaries were added (P1-18 scope).

## Functional changes

- Local-device-only comparison state (`gth.compare.v1`), no account/backend.
- Versioned JSON schema (`COMPARE_SCHEMA_VERSION = 1`); corrupt JSON, empty
  payloads, and unsupported versions fail closed to an empty state.
- Deterministic `addCompareItem` / `removeCompareItem` / `clearCompare`;
  duplicate add moves the item to most-recent; overflow drops oldest first at
  `COMPARE_MAX_ITEMS` (4).
- Persisted fields are limited to stable identifiers (`id` and/or `slug`);
  titles, prices, yields, images, and other property payloads are stripped.
- Approved compare fields cover sourced listing facts (type, price, beds/baths,
  area, location/project, transit, source/verification timestamps).
- Blocked fields explicitly exclude yield/ROI/cap-rate/appreciation and related
  unsupported investment claims.
- Storage adapters: in-memory (tests) and browser localStorage (fail closed on
  quota/privacy errors).

## Routes/components affected

- None. Library-only contract under `src/lib/compare/*`.
- No `/[lang]/compare` route, compare button, provider, or nav changes.

Favorites state/UI, homepage conversion, listing filters/results, property
cards, property detail trust, property media, project/developer/district detail
flows, accessibility, responsive behavior, navigation, metadata, canonical,
hreflang, and JSON-LD contracts are preserved.

## Task-specific verification

**PASS** — `npm run test:compare-state` exited 0:

- no account/backend coupling
- identifier-only normalization
- deterministic add/remove/clear
- corrupt/old storage fail-safe
- bounded selection (max 4)
- serialize strips non-identifiers
- storage adapter load/save/clear
- field allowlist excludes unsupported investment claims
- no React UI / compare page introduced

## Typecheck result

**PASS** — `npm run typecheck` exited 0.

## Lint result

**PASS** — `npm run lint` exited 0.

## Test result

**PASS** — `npm test` exited 0, including `test:compare-state` and all
previous P0/P1 aggregate tests.

## Build result

**PASS** — `npm run build` exited 0; Next.js 16.2.10 compiled successfully.

The pre-existing non-fatal Turbopack NFT trace warning through
`src/lib/knowledge/glossary.ts` remains and was not introduced by P1-17.

## Remaining P1 tasks

**19 tasks remain; none started by this task:**

- M3: P1-18–P1-21
- M4: P1-22–P1-28
- M5: P1-29–P1-32
- M6: P1-33–P1-36

**Stopped after P1-17.** P1-18 not started.
