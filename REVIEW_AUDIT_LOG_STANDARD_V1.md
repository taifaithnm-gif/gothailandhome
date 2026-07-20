# Review Audit Log Standard V1

**Status:** Sprint 2 frozen logical audit standard; no storage implementation  
**Purpose:** Make every review, publication approval and rollback approval traceable without exposing secrets or unnecessary payload data.

## Mandatory event fields

| Field | Requirement |
| --- | --- |
| `event_id` | Unique immutable ID |
| `event_type` | Controlled event name |
| `occurred_at` | UTC timestamp |
| `actor_id` | Human/system/AI-assistant reference |
| `actor_type` | `human`, `system`, or `ai_assistant` |
| `actor_role` | Assigned role used for action |
| `request_id` / `review_task_id` | Correlation references as applicable |
| `object_type` / `object_id` | Source, evidence, record, duplicate group, package, batch, decision, rollback |
| `object_version` | Exact immutable version/hash |
| `event_action` | Action performed/recommended |
| `from_state` / `to_state` | Required for transitions |
| `decision_id` / `reason_code` | Required for decisions |
| `evidence_references` | References viewed/affected; no secret/payload dump |
| `result_status` | Success, failure, blocked, no-change |
| `error_code` | Required on failure |
| `prior_event_id` | Link for correction/reopen/supersession |
| `metadata_version` | Audit event schema/version |

## Required event types

- review task created/assigned/opened/completed;
- checklist completed/failed;
- AI recommendation created (explicitly non-authoritative);
- human decision created;
- workflow state changed;
- change requested/rejected/quarantined/reopened;
- evidence viewed/hash verified/mismatch detected;
- duplicate group created/resolved/reopened;
- freshness evaluated/re-verification required;
- package assembled/validated;
- publication approved/rejected/invalidated/attempted/result;
- rollback requested/approved/blocked/started/completed/failed/verified;
- source approval changed/expired;
- security, personal-data, credential, cross-project or takedown incident;
- backup/restore verification referenced.

## Actor and authority rules

- AI actions are logged as `ai_assistant` recommendations, never human decisions.
- Only `human` actors in authorized roles may create final review/publication/rollback decisions.
- System actors may calculate, validate, route or record events but cannot grant human approval.
- Impersonation or missing actor identity is P0 failure.

## Immutability

- Audit events are append-only.
- Corrections append a new event referencing the incorrect event; no silent edit/delete.
- Events identify exact object versions and decision/checklist versions.
- Chronological timestamps do not replace causal references.
- Archived, rejected, superseded and rolled-back objects retain audit history.

## Traceability queries the future system must support

For any record/package/rollback, reconstruct:

1. source approval and evidence capture;
2. adapter/normalization/validation versions and results;
3. every reviewer, checklist, decision and state transition;
4. duplicate and freshness outcomes;
5. package composition/hash and human publication approval;
6. release result and rollback chain;
7. all prior/superseding versions.

## Security and privacy

- Never log credentials, environment-variable values, secret references that reveal values, full sensitive payloads, or unnecessary personal data.
- Use evidence/object references and hashes, not duplicate payload storage in logs.
- Redact error messages before persistence.
- Restrict audit access by role; access to audit records is itself auditable.
- Exact retention duration and backup destination remain subject to D-019 approval; audit history must be included in backup/restore verification.

## Completeness tests

- 100% of review decisions contain actor, role, target/version, decision, reason, evidence viewed and timestamp.
- 100% of transitions have valid from/to states and decision/event links.
- 100% of publication/rollback actions resolve to prior human approvals and exact hashes.
- No decision event can be mutated.
- No raw credential appears in logs.
- Missing mandatory audit event blocks the affected target from `approved`, `publish_ready`, publication, or completed rollback.

