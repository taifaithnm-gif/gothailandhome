# Review Decision Standard V1

**Status:** Sprint 2 frozen immutable decision contract; no database or implementation

## Decision object

Every human review decision must contain:

| Field | Requirement |
| --- | --- |
| `decision_id` | Unique immutable ID |
| `review_task_id` | Exact task being decided |
| `decision_type` | Allowed decision value |
| `reason_code` | Required controlled reason |
| `comment` | Required concise human rationale |
| `reviewer_id` | Assigned human reference; never AI |
| `reviewer_role` | Role authorized for this stage |
| `target_type` / `target_id` | Record, evidence, duplicate group, package, batch or rollback |
| `target_version` | Exact immutable version/hash |
| `evidence_references_viewed` | Non-empty for fact/publish decisions |
| `checklist_version` | Exact checklist version |
| `from_state` / `to_state` | Valid workflow transition |
| `decided_at` | UTC timestamp |
| `prior_decision_id` | Required for reopen/superseding correction |
| `conditions` | Required for conditional/change decisions |

## Allowed decisions

| Decision | Meaning | Effect |
| --- | --- | --- |
| `approve_stage` | Exact target version passes current stage | Advances one valid state only |
| `change_requested` | Correctable defect exists | Blocks advancement; correction creates new version |
| `rejected` | Out-of-scope, unsupported, prohibited, or materially incorrect | Blocks package inclusion; retains all history |
| `quarantined` | Rights, integrity, security, evidence or policy concern | Stops processing pending authorized remediation |
| `merge` | Human confirms duplicate and canonical target | Creates reviewed resolution; preserves all members/evidence |
| `keep_separate` | Human confirms distinct identities | Closes duplicate group with reason |
| `false_positive` | Candidate match is not duplicate | Closes group and retains decision |
| `needs_more_evidence` | Duplicate/fact cannot be resolved | Remains blocked |
| `approve_publication` | Human approves exact package/batch after all gates | Permits separately authorized release only |
| `reject_publication` | Package/batch cannot release | Returns to revision/review |
| `approve_rollback` | Human authorizes rollback to exact prior approved state | Permits rollback execution only |
| `reopen` | New evidence/change invalidates prior review | Creates new tasks from earliest affected stage |

## Reason codes

Minimum controlled codes:

- `approved_source_backed`
- `approved_all_p0_pass`
- `needs_source`
- `needs_exact_evidence`
- `needs_field_correction`
- `needs_freshness_verification`
- `needs_duplicate_resolution`
- `unsupported_claim`
- `source_not_allowed`
- `rights_or_access_uncertain`
- `hash_or_integrity_failure`
- `materially_incorrect`
- `out_of_scope`
- `personal_data_or_secret_risk`
- `duplicate_merged`
- `distinct_project`
- `duplicate_false_positive`
- `package_gate_failed`
- `rollback_required`
- `incident_or_takedown`

## Approval rules

- Only a human with the required role may record a final decision.
- AI may draft recommendations and identify checklist gaps; AI is not a reviewer/approver.
- Approval is valid only for the exact target version/hash.
- A new version has no inherited approval.
- No state is skipped.
- P0 failure, missing evidence, unresolved duplicate/conflict, stale current claim, unknown rights, or quarantine prevents approval.
- Publication and rollback decisions are distinct from record approval.

## Reject process

1. Select `rejected` with reason and evidence.
2. Record exact target version and current state.
3. Preserve source, evidence, versions, checklist and all prior decisions.
4. Remove/block target from package eligibility without deleting it.
5. Reopening requires changed/new evidence or corrected version and an explicit `reopen` decision.

## Re-review and supersession

Decisions are never edited. To correct a decision:

1. append a new decision referencing the prior decision;
2. explain the correction/reopen trigger;
3. create new tasks and record/evidence version when content changed;
4. invalidate downstream approvals for the new version;
5. retain the prior decision as historical truth.

## Separation of responsibilities

One human may hold more than one V1 role only when explicitly assigned, but each decision must identify the role used. A human may not use an AI identity as approver. Publication approval must not be inferred from fact review, and rollback execution must not be inferred from publication approval.

## Objectivity tests

- 100% of decisions contain every mandatory field.
- Invalid role, state transition, missing evidence, missing version, or AI actor is rejected.
- Mutation of an existing decision is prohibited; correction appends.
- Every `approved`/`publish_ready` record resolves to complete prior decisions.
- Every publication/rollback resolves to an exact human approval and audit trail.

