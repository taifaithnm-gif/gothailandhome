# Pilot Acceptance Test Plan V1

**Status:** Sprint 4 planning only; no tests executed  
**Purpose:** Define objectively testable acceptance cases for the future V1 pilot

## Test principles

- Fail closed: any P0 failure yields HOLD / NO-GO
- AI cannot waive a P0
- Tests use offline fixtures first; live sources only after G1/G4/G5
- Every test records target version, evidence, actor, and result
- Publication tests remain staging/local until Feature Freeze and G6 allow otherwise

## Acceptance dimensions

| Dimension | Pass condition | Priority |
| --- | --- | --- |
| Accuracy | 100% of sampled publishable fields match retained evidence; zero fabricated values | P0 |
| Duplicate rate | Exact-hash / URL / external-ID recall = 100%; zero uncertain auto-merges; unresolved groups = 0 at package time | P0 |
| Freshness | Status matches age bands; no >30-day unverified current price/availability presentation | P0 |
| Review time | Measured and reported; does not override quality gates | P1 |
| Approval rate | Only fully reviewed, P0-passing exact versions reach approved / publish_ready | P0 |
| Publish readiness | Exact package hash, citations, rollback rehearsal, and human approval complete | P0 |

## Accuracy tests

| ID | Case | Expected |
| --- | --- | --- |
| AT-A01 | Golden fixture with complete evidence | All required fields validate; original + normalized retained |
| AT-A02 | Missing required identity/developer/location/type | Validation fail; cannot approve |
| AT-A03 | Price present without currency | Fail; currency never inferred |
| AT-A04 | Unsupported claim / invented value | Reject or mark unknown; never publish |
| AT-A05 | High-risk field without exact quote/location | Fail evidence gate |

**Accuracy threshold:** 100% of package fields must be source-backed. Materially incorrect property information is an immediate stop.

## Duplicate-rate tests

| ID | Case | Expected |
| --- | --- | --- |
| AT-D01 | Same content hash | Exact duplicate detected; no second canonical raw item |
| AT-D02 | Same source external ID | Exact identity match; human review if values conflict |
| AT-D03 | Same canonical URL | Exact source duplicate flagged |
| AT-D04 | Same normalized developer + project + Bangkok locality | Strong candidate group; human decision required |
| AT-D05 | Ambiguous phase/tower difference | Uncertain group; no auto-merge |
| AT-D06 | Attempt automatic merge of uncertain group | Blocked |

**Duplicate threshold:** Exact-match recall 100%; unresolved duplicate groups at package assembly = 0.

## Freshness tests

| ID | Age since `last_verified_at` | Expected |
| --- | --- | --- |
| AT-F01 | 0–30 days | `fresh`; current claims allowed only if all other gates pass |
| AT-F02 | 31–90 days | `warning`; no current price/availability presentation |
| AT-F03 | >90 days | `expired`; blocked from current publication |
| AT-F04 | Price >30 days unverified labeled current | Fail / HOLD |

## Review-time tests

| ID | Metric | Threshold |
| --- | --- | --- |
| AT-R01 | Intake elapsed time | Measured; report median/p95 |
| AT-R02 | Fact review elapsed time | Measured; report median/p95 |
| AT-R03 | Duplicate resolution elapsed time | Measured; report median/p95 |
| AT-R04 | End-to-end record review cycle | Measured; no automatic scale-up |

Review-time metrics are P1. Slow review pauses intake; it never authorizes skipped checks.

## Approval-rate tests

| ID | Case | Expected |
| --- | --- | --- |
| AT-P01 | Incomplete checklist | Cannot approve |
| AT-P02 | Open P0 / quarantine / unresolved duplicate | Cannot reach publish_ready |
| AT-P03 | AI-only recommendation without human decision | Rejected as invalid actor |
| AT-P04 | All stages complete for exact version | May become approved |
| AT-P05 | New corrected version | Prior approval does not inherit |

**Approval threshold:** 100% of approved package records have complete human decisions for intake, fact, duplicate, and publish review.

## Publish-readiness tests

| ID | Case | Expected |
| --- | --- | --- |
| AT-U01 | Package rebuild from unchanged inputs | Same content hash |
| AT-U02 | Package with missing citation | Fail |
| AT-U03 | Staging handoff only during Feature Freeze | No production write |
| AT-U04 | Rollback rehearsal | Prior package restored ≤15 minutes; both versions retained |
| AT-U05 | Publication without human package approval | Blocked |

## Execution order

1. Offline fixture suite (accuracy, duplicates, freshness, validation)
2. Review-workflow transition and audit tests
3. Package/rebuild/rollback rehearsal on staging/local fixture
4. Live pilot only after G1/G4/G5 and Owner authorization
5. Final scorecard against P0 criteria

## Pass / fail rule

- All P0 cases pass with linked evidence → acceptance eligible
- Any P0 fail → HOLD / NO-GO until corrected and retested
- P1 misses are reported but do not authorize waiver of P0
