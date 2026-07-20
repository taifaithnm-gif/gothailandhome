# Pilot Release Gate V1

**Status:** Sprint 4 planning only; no release executed  
**Purpose:** Freeze the mandatory checklist, required approvals, and blocking conditions before any pilot package may be released

## Gate posture

Default: **NO-GO / HOLD**

A pilot package may move to staging/local handoff only when every mandatory item below is PASS. Production publication additionally requires Feature Freeze lift and G6 closure.

## Mandatory checklist

| ID | Checklist item | Pass evidence |
| --- | --- | --- |
| RG-01 | Pilot scope within ceilings | ≤2 sources; 5–10 projects; ≤100 records; Bangkok; new condominiums only |
| RG-02 | Manifest approved | Owner-signed/approved pilot manifest version |
| RG-03 | Sources approved | Completed source approval templates; rights clear |
| RG-04 | Data standard compliance | Sprint 1 standards applied to exact versions |
| RG-05 | Required fields complete | No missing required categories; valid null handling |
| RG-06 | Evidence completeness | 100% publishable fields cited; evidence retained |
| RG-07 | Evidence integrity | Hash verification sample 100% |
| RG-08 | Accuracy | 100% sampled field accuracy; zero fabricated values |
| RG-09 | Duplicate control | Exact recall 100%; unresolved groups = 0 |
| RG-10 | Freshness | Status correct; no >30-day unverified current price/availability |
| RG-11 | Manual review coverage | 100% intake/fact/duplicate/publish decisions present |
| RG-12 | Quality grade | Q-PASS for all package members |
| RG-13 | Acceptance tests | All P0 acceptance cases PASS |
| RG-14 | Success metrics | All P0 KPIs meet target; no F01–F14 active |
| RG-15 | Package determinism | Rebuild yields identical hash |
| RG-16 | Citations / attribution | Package includes required citations |
| RG-17 | Rollback rehearsal | ≤15 minutes; prior+current retained |
| RG-18 | Backup / restore proof | Backup standard checks recorded for package artifacts |
| RG-19 | Audit reconstructability | End-to-end trace sample PASS |
| RG-20 | Risk controls ready | Rollback, emergency stop, override policy acknowledged |
| RG-21 | Feature Freeze compliance | Staging/local only unless freeze explicitly lifted |
| RG-22 | No live unauthorized collect | Collection limited to approved manifest |
| RG-23 | No Windows01 unauthorized change | Runtime deployment only if separately authorized |
| RG-24 | Residual P0 = 0 | Incident register clear for package scope |

All RG-01–RG-24 are mandatory. Any FAIL = blocking.

## Required approvals

| Approval | Authority | Required for |
| --- | --- | --- |
| Source approval | Owner | Any collect / package membership |
| Manifest approval | Owner | Pilot execution start and package scope |
| Record publish approval | Publish Approver (human) | Each exact record version in package |
| Package approval | Publish Approver / Owner | Package assembly and handoff |
| Rollback rehearsal sign-off | Operator + Publish Approver/Owner | Release eligibility |
| Staging/local release | Operator / Owner | Non-production handoff |
| Production release | Owner + Feature Freeze lift + G6 | Production only |
| Emergency resume after stop | Owner | Resume after emergency stop |

AI systems cannot provide any of the above approvals.

## Blocking conditions

Release is blocked if any of the following is true:

1. Any RG checklist item is FAIL or incomplete
2. Any open P0 defect, quarantine, or unresolved duplicate remains
3. Evidence missing, corrupted, or rights-uncertain
4. Accuracy, freshness, or duplicate P0 thresholds missed
5. Manual review coverage < 100%
6. Package hash non-deterministic or citations missing
7. Rollback rehearsal failed
8. Feature Freeze active and target is production
9. G1 / G4 / G5 / G6 still open for the intended live/production action
10. Manual override attempts to waive non-waivable rules
11. Emergency stop active without Owner resume
12. Source/project/record ceilings exceeded
13. Cross-project contamination or secret exposure
14. AI used as approval authority

## Gate decisions

| Decision | Meaning |
| --- | --- |
| GO-STAGING | Staging/local handoff allowed; production still blocked |
| GO-PRODUCTION | Production publication allowed (requires freeze lift + G6) |
| HOLD | Remediation required; no handoff |
| NO-GO | Structural unreadiness; do not release |
| STOP | Emergency stop engaged |

## Current planning-time gate (Sprint 4)

| Target | Decision | Reason |
| --- | --- | --- |
| Sprint 4 planning package | GO | Planning documents complete |
| Fixture / offline acceptance design | CONDITIONAL GO | Executable after implementation exists |
| Live pilot collect | NO-GO | G1/G5 open; no sources nominated |
| Windows 01 runtime deploy | NO-GO | G4 open; Feature Freeze |
| Staging package release | NO-GO | No dataset/package yet |
| Production publication | NO-GO | Feature Freeze + G6 |

## Sign-off template (future use)

```text
Package ID:
Package hash:
Checklist RG-01..RG-24: PASS/FAIL
P0 residual: 0 / list
Rollback rehearsal: PASS/FAIL
Approver:
Owner:
Decision: GO-STAGING / HOLD / NO-GO / STOP
Timestamp (UTC):
Evidence links:
```
