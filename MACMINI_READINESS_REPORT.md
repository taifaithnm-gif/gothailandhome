# Mac mini Website Readiness Report

**Audit:** GoThailandHome Mac mini Website Implementation Boundary  
**Date:** 2026-07-18  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch/HEAD:** `main` / `eedf3f7`  
**Mode:** Read-only audit and execution backlog

## Executive result

The existing website is **65% capability-complete** under the audit's 30-item scoring model.
Most core Alpha surfaces exist. Mac mini website stabilization does **not** depend on Windows 01.

**Decision: CONDITIONAL GO**

- **GO:** Read-only audit, planning, and non-mutating diagnostics.
- **CONDITIONAL GO:** P0/P1 local website code work after explicit Owner authorization.
- **NO-GO:** Production deployment, database changes, live source work, automated publishing,
  Content Factory runtime, or Windows 01 activity.

## Repository status

| Item | Result |
| --- | --- |
| Root | `/Users/jun/AI-Workspace/Projects/GoThailandHome` |
| Branch | `main` |
| Remote state | `HEAD == origin/main == eedf3f7` |
| Framework | Next.js 16.2.10 App Router, React 19.2.4, TypeScript, Tailwind 4 |
| App version | `0.1.0` |
| Latest tagged RC | Platform Alpha RC2 (`platform-alpha-rc2`) — PASS WITH ACTIONS |
| Current code status | Phase 12 current HEAD is newer than RC2 tag; not separately re-certified |
| Tracked working tree | No tracked modifications found |
| Existing untracked state | Numerous pre-existing planning/audit Markdown files |
| Required current-status doc | `GO_THAILAND_HOME_CURRENT_STATUS.md` absent |
| Production URL reference | `https://www.gothailandhome.com` |
| Preview URL | None found |
| Deployment config | Linked Vercel project in `.vercel/project.json`; no `vercel.json` or CI workflow; no preview URL in source |
| Feature Freeze | Active |

## Current engineering diagnostics

| Gate | Result |
| --- | --- |
| Typecheck | PASS |
| Lint | PASS with 9 warnings, 0 errors |
| Aggregate tests | FAIL at developer logo metadata invariant |
| Current production build | Not run because this audit prohibits generated writes |
| Prior build evidence | PASS at RC2 commit `e3a5a9a`, not current HEAD |
| Deployment certification | Not evidenced; RC2 used local `next start` |

The failing aggregate test makes current build/test health **PARTIAL**, even though prior RC2
acceptance passed.

## Existing website completion

| Classification | Count |
| --- | ---: |
| COMPLETE | 13 |
| PARTIAL | 13 |
| NOT BUILT | 3 |
| BLOCKED BY BUSINESS DECISION | 1 |
| Total | 30 |

Weighted score: `(13 × 1 + 13 × 0.5) / 30 = 65%`.

The 65% score measures implemented capability, not content completeness, production readiness,
or Content Factory readiness.

## Mac mini tasks available now

There are **11 technically available P0/P1 website tasks** after a separate code-change authorization:

### P0

1. MM-P0-01 — Resolve developer logo metadata contract test failure
2. MM-P0-02 — Restore/certify typecheck, lint, full tests, build and local route checks
3. MM-P0-03 — Add route and metadata regression coverage
4. MM-P0-04 — Correct sitemap inventory completeness
5. MM-P0-05 — Correct server-rendered locale document language

### P1

6. MM-P1-01 — Add branded loading/error boundaries
7. MM-P1-02 — Establish automated accessibility baseline
8. MM-P1-03 — Responsive route verification and targeted corrections
9. MM-P1-04 — Improve existing image performance/failure behavior
10. MM-P1-05 — Harden existing forms and local failure paths
11. MM-P1-06 — Route existing approved static knowledge articles

None of these require Windows 01. P1-06 additionally requires Content Owner approval of public articles.

## Business-decision tasks

These are Mac-capable but should wait:

1. Property comparison
2. Favorites/persistence
3. Legal and investment guidance
4. Analytics/webmaster operating model
5. Embedded map provider/product

## Windows 01 / approved-data blocked tasks

| Task | Blocking gate |
| --- | --- |
| Live property collection/ingestion | G1/G4/G5; no approved source or manifest |
| Evidence-first parser/validator runtime | G2/G3/G4 |
| Sprint 2 authoritative review interface | G2/G3, isolated store, named roles |
| Automated package publication | G6, rollback rehearsal, freeze lift |
| OCR/embeddings/project AI backend | OCR conditional decision; embeddings deferred |
| Windows 01 runtime deployment | All W-PRE prerequisites open |
| Production database/schema/data repair | D-022, Feature Freeze, separate DB approval |

Website UI fixes must not be bundled with these blocked workstreams.

## Recommended first P0 task

**MM-P0-01 — Resolve developer logo metadata contract test failure.**

Reason:

- It is reproduced at current HEAD.
- It blocks the remainder of the aggregate test suite.
- It is small and isolated.
- It needs no live data, database mutation, deployment, or Windows 01.
- The correct fix must preserve evidence integrity rather than merely suppressing the assertion.

## Preconditions for P0 implementation

Before code changes:

1. Human Owner issues a scoped Mac mini website-fix authorization.
2. Scope explicitly excludes production database, live data, deployment, and Content Factory runtime.
3. For MM-P0-01, the authoritative logo-status contract is confirmed.
4. Git work is isolated from the existing untracked planning documents.

## Final gate dashboard

| Activity | Decision |
| --- | --- |
| Mac mini boundary audit | **GO** |
| P0/P1 local website implementation | **CONDITIONAL GO** — explicit Owner authorization required |
| P2 product work | **NO-GO pending business decisions** |
| Local build certification | **CONDITIONAL GO after test repair** |
| Preview deployment | **NO-GO** |
| Production deployment | **NO-GO** |
| Live data / collectors / runtime | **NO-GO** |
| Windows 01 changes | **NO-GO** |
| Database changes | **NO-GO** |

## Verification declaration

- Exactly four new Markdown files were created.
- No existing file or planning document was modified.
- No source code or database was modified.
- No build/deployment was performed.
- No live data source was connected.
- No Windows 01 change occurred.
- No commit or push occurred.
