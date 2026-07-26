# Manual Review Implementation Plan

**Milestone:** `MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`  
**Date:** 2026-07-26  
**Mode:** Plan only — **no Phase executed in this milestone**

Next recommended action after design exit:  
`MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION`

---

## Phase overview

| Phase | Name | Executes now? |
| --- | --- | --- |
| A | Schema + RLS + tests | NO |
| B | Decision service + API | NO |
| C | Review Console UI | NO |
| D | Synthetic decision tests | NO |
| E | Batch001 pilot review | NO |
| F | Approval readiness assessment | NO |

Hard stops across all phases: no Approval open, no Publish, no Production writes, no Deploy unless separately authorized.

---

## Phase A — Schema + RLS + tests

### Scope

- Add migrations for decision tables (from data model DDL)  
- RLS policies per permission matrix  
- Immutability triggers  
- Unit tests for constraints / single-active / idempotency keys  
- **No** API mount; **no** UI; **no** real Batch001 decisions

### Files (expected)

- `database/staging-migrations/2026XXXX_01X_staging_review_decisions*.sql`  
- `docs/STAGING_REVIEW_DECISIONS.md` (ops)  
- `scripts/test-staging-review-decisions-schema.mjs`  
- Possibly `src/lib/staging-db/types.ts` type additions only

### Tests

- Migration apply on staging-only with `--confirm-staging`  
- Unique active decision  
- Audit append-only  
- RLS deny anon / deny forbidden states

### Gates

- Reviewer Gate unchanged ON  
- Architecture freeze tests still PASS  
- Production project ref blocked

### Rollback

- Drop new tables/policies via reverse migration on staging only  
- No data loss on existing Batch001 entity tables if additive

### Exit criteria

- Schema verified on staging  
- RLS tests green  
- Zero decision rows required  
- Reports updated with apply evidence

---

## Phase B — Decision service + API

### Scope

- Decision service (create/submit/apply/reject/rollback/evidence)  
- Mount `/api/internal/review/*` routes  
- Dual-control + risk classification  
- Feature flag default **false**  
- Wire audit events  
- **No** Console write UI yet (optional curl/cli)

### Files (expected)

- `src/lib/staging-db/decision-*.ts`  
- `src/app/api/internal/review/**`  
- `src/lib/staging-db/errors.ts` (new codes)  
- `scripts/test-staging-review-decisions-api.mjs`

### Tests

- Contract tests per API  
- Dual-control rejection  
- Idempotent apply  
- Forbidden APPROVED transition attempts  
- Dry-run apply/rollback

### Gates

- Auth required  
- Flag default false  
- Production disabled  
- Gate enabled for mutations

### Rollback

- Disable feature flag  
- Routes return 404/disabled  
- Schema retained

### Exit criteria

- All routes pass contract tests  
- No Batch001 production side effects  
- Docs: `docs/STAGING_REVIEW_API.md` extended

---

## Phase C — Review Console UI

### Scope

- Decision panels per UI spec  
- Button gating by role  
- Diff + audit timeline + rollback preview  
- Keep Approve/Publish disabled  
- Sorting still backlog WARNING

### Files (expected)

- `src/app/internal/review/windows01/batches/[batchId]/*`  
- `src/lib/review-console/*` extensions  
- Possibly DB-backed loader (vs local JSON) behind flag

### Tests

- Component/interaction tests for button matrix  
- Proxy `/internal` still reachable  
- Flag-off remains read-only

### Gates

- Feature flags  
- No publish UI affordance

### Rollback

- Flag off → previous read-only console

### Exit criteria

- UX checklist from UI spec signed off in staging  
- No real HIGH applies required yet (can use mocks)

---

## Phase D — Synthetic decision tests

### Scope

- Synthetic review items / fixtures  
- Full lifecycle: draft→submit→apply→rollback  
- One HIGH dual-control path with two test users  
- Image/PDF/News families covered without external fetch/upload

### Files (expected)

- `scripts/test-staging-review-decisions-e2e.mjs`  
- Fixtures under `artifacts/` or `.work/` (non-prod)

### Tests

- All five decision families  
- Idempotency + concurrency conflicts  
- Rollback eligibility + ineligible cases

### Gates

- Isolated staging session (not Batch001 replace) preferred

### Rollback

- Soft-delete synthetic session

### Exit criteria

- E2E green  
- Evidence report in `REPORTS/`

---

## Phase E — Batch001 pilot review

### Scope

- Human decisions on Batch001 under dual-control  
- Priority order:  
  1. Developer links (Supalai / AP / Sansiri first)  
  2. Project 36936 province  
  3. Image / PDF / News dispositions  
- Still **no** Approval / Publish  
- Capture evidence in reports

### Files (expected)

- `REPORTS/BATCH001_PILOT_REVIEW_*.md`  
- Decision rows in staging DB only

### Tests

- Post-decision read verification queries  
- Gate assertions still block Approve/Publish

### Gates

- SENIOR apply for HIGH  
- Dry-run before first rollback exercise

### Rollback

- Decision rollback for mistaken applies  
- Session rollback only if catastrophic (last resort)

### Exit criteria

- Blocking queue reduced per agreed threshold  
- 0 forbidden states  
- Approval still BLOCKED

---

## Phase F — Approval readiness assessment

### Scope

- Read-only assessment: are remaining items acceptable to open **future** Approval design?  
- Does **not** implement Approval  
- Does **not** set APPROVED  
- Produce go/no-go checklist for a later Approval milestone

### Files (expected)

- `REPORTS/BATCH001_APPROVAL_READINESS.md`

### Tests

- Assert still 0 APPROVED/PUBLISHED  
- Architecture freeze PASS

### Gates

- Explicit human sign-off that Approval milestone may be planned

### Rollback

- N/A (read-only)

### Exit criteria

- Written readiness verdict  
- Approval remains BLOCKED until new milestone authorizes design/implementation

---

## Cross-phase constraints

| Constraint | All phases |
| --- | --- |
| No Production catalog writes | ✓ |
| No Storage upload execution (until dedicated milestone) | ✓ |
| No auto canonical bind without human action | ✓ |
| No Git push / Deploy unless user asks | ✓ |
| Architecture freeze tests | Must stay PASS |

---

## Suggested sequencing after this design

```
DESIGN (done) → Phase A → Phase B → Phase D (can overlap late B) → Phase C → Phase E → Phase F
```

Phase D may start as soon as B lands; C can parallel late B with mocks.

---

## This milestone stop line

Do **not** start Phase A until a new user-authorized milestone  
`MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION` begins.
