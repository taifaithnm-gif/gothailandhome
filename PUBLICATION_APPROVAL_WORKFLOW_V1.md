# Publication Approval Workflow V1

**Status:** Sprint 2 frozen approval workflow; publication remains NO-GO  
**Target:** GoThailandHome only; no third-party syndication

## Principle

Record approval does not authorize publication. A separate human must approve the exact versioned publication package/batch after all record, evidence, freshness, duplicate, security and rollback gates pass.

AI may assemble a recommendation, summarize gate results and flag risks. AI may not approve, schedule, release, publish, or override a failed gate.

## Workflow

```text
batch_draft
  -> package_validation
  -> human_publication_review
  -> approved_for_release
  -> separately_authorized_release
```

Exception states:

```text
change_requested
rejected
quarantined
rollback_required
```

`approved_for_release` is permission for a later separately authorized release action; it is not proof that publication occurred.

## Required batch manifest

- batch/package ID and version;
- deterministic package content hash;
- GoThailandHome target/environment;
- exact approved record IDs/versions;
- source IDs, attribution and evidence references;
- completed review-decision references;
- freshness evaluation time/status;
- validation results and zero open P0 failures;
- prior approved package/state pointer and hash;
- rollback plan, rollback owner and witness;
- final human approver reference/role;
- planned release time and expiry of approval;
- publication event/result fields, initially null.

## Pre-approval gates

| Gate | Pass condition |
| --- | --- |
| Scope | GoThailandHome only; <=2 sources, <=10 projects, <=100 records |
| Record review | 100% of included exact record versions complete all mandatory stages |
| Evidence | 100% field traceability; hashes/references available; rights approved |
| Freshness | No expired record; no >30-day unverified current price/availability claim |
| Duplicates/conflicts | Zero unresolved group, uncertain merge or critical conflict |
| Validation | 100% P0 pass, zero waiver |
| Security | No credentials, uncontrolled personal data or cross-project contamination |
| Versioning | Deterministic package and exact record/evidence/review versions |
| Rollback | Prior state captured; reversible method and human rollback authority defined; rehearsal required before first release |
| Phase authority | Feature Freeze lifted/explicit publication authorization and G6 recorded |

Any failed gate yields `change_requested`, `rejected`, or `quarantined`; it cannot be waived by AI.

## Human publication review

The assigned Human Owner or explicitly delegated human reviewer:

1. verifies the package hash and manifest;
2. confirms included records and all decision/evidence references;
3. reviews price/current-availability freshness;
4. confirms target/environment and no third-party syndication;
5. verifies prior-state backup and rollback readiness;
6. records `approve_publication` or `reject_publication` for the exact package version/hash;
7. records reason, comment, evidence/checklist viewed and timestamp.

No approver name is invented by this standard.

## Approval expiry and invalidation

Approval is invalid if, before release:

- package bytes/hash, included record version or target changes;
- source/evidence/rights/freshness changes;
- a duplicate/conflict/incident/takedown is opened;
- rollback readiness or backup verification fails;
- approval expires under future Owner policy;
- Feature Freeze or another release stop is active.

Invalidation returns the batch to review and requires a new immutable approval.

## Release and result

If a later task separately authorizes release, it must record release actor, package hash, time, result, target response and visible-state verification. Failure opens `rollback_required`. This document creates no release implementation and does not authorize production access.

