# Pilot Success Metrics V1

**Status:** Sprint 4 planning only; no live measurement executed  
**Purpose:** Freeze KPIs, exit criteria, and failure criteria for the V1 pilot

## KPI framework

All KPIs are measured on the exact pilot package under review. AI recommendations do not count as approvals.

### Core KPIs

| KPI | Target | Priority | Measurement |
| --- | --- | --- | --- |
| Sample size | 5 projects target; ≤10 projects; ≤100 records | P0 | Manifest count |
| Source diversity | ≤2 approved sources | P0 | Source registry count |
| Manual review coverage | 100% of records and publishable fields | P0 | Decision log completeness |
| Field accuracy | 100% of sampled publishable fields match evidence | P0 | Accuracy audit |
| Duplicate exact-match recall | 100% | P0 | Duplicate fixture/live recall |
| Unresolved duplicate groups at package time | 0 | P0 | Duplicate queue |
| Freshness correctness | 100% status/age agreement | P0 | Freshness audit |
| Current-price freshness compliance | 0 violations of 30-day rule | P0 | Price presentation check |
| Evidence completeness | 100% of publishable fields cited | P0 | Citation inventory |
| Evidence integrity | 100% hash verify on sample | P0 | Hash audit |
| Approval validity | 100% human-approved exact versions only | P0 | Decision actor audit |
| Publish readiness | Exact package hash + citations + rollback rehearsal | P0 | Package checklist |
| Rollback rehearsal | Restore ≤15 minutes; prior+current retained | P0 | Drill record |
| Review cycle time | Measured median/p95; no automatic scale-up | P1 | Stage timestamps |
| Approval rate | Reported; only quality-passing records count | P1 | Approved / reviewed ratio |
| Quarantine/P0 residual | 0 open at package assembly | P0 | Risk/incident register |

## Success / exit criteria

The pilot may be declared **successful and complete** only when all of the following are true:

1. Owner-approved pilot manifest executed within frozen ceilings (Bangkok; new condominiums; ≤2 sources; 5–10 projects; ≤100 records).
2. 100% of package records completed human intake, fact, freshness, duplicate, and publish reviews.
3. Field accuracy, evidence completeness, and evidence integrity meet 100% thresholds.
4. Exact duplicate recall is 100%; unresolved duplicate groups = 0.
5. Freshness statuses are correct; no >30-day unverified current price/availability presentation.
6. Publication package rebuilds to an identical hash and includes citations.
7. Rollback rehearsal passes (≤15 minutes; both versions retained).
8. No open P0 defects, rights failures, or credential exposures.
9. Audit logs reconstruct source → evidence → decision → package → rollback references for every package record.
10. Owner or authorized Operator records an explicit pilot success decision with evidence links.

Feature Freeze remains in force until separately lifted. Pilot success does **not** automatically authorize production publication.

## Failure criteria

Declare **pilot failure / HOLD / stop** if any of the following occurs:

| ID | Failure condition |
| --- | --- |
| F01 | Materially incorrect property information found in package |
| F02 | Fabricated or inferred unsupported field values |
| F03 | Missing or corrupted evidence / hash mismatch |
| F04 | Rights / ToS / robots / privacy violation or uncertainty |
| F05 | Uncertain automatic merge performed or attempted without human resolution |
| F06 | Unresolved duplicate groups remain at package assembly |
| F07 | Current price/availability presented after 30 days without re-verification |
| F08 | Publication attempted without human package approval |
| F09 | Rollback rehearsal fails or prior versions are lost |
| F10 | Source/project/record ceilings exceeded |
| F11 | Cross-project contamination or uncontrolled secret exposure |
| F12 | AI used as approval authority |
| F13 | Production write attempted during Feature Freeze without Owner override |
| F14 | Open P0 residual at intended release time |

Any single F01–F14 is sufficient for NO-GO until corrected and retested.

## Scorecard presentation

A future pilot scorecard must report:

- KPI actual vs target
- P0 pass/fail
- P1 measurements
- Open incidents
- Exit decision: SUCCESS / HOLD / FAIL
- Linked evidence IDs for every P0 claim

## Non-goals for KPI measurement

- SEO / traffic / conversion KPIs (post-V1)
- Multi-site publication metrics
- OCR / embeddings performance
- Live production uptime SLAs beyond pilot monitoring thresholds
