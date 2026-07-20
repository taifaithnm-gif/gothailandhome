# Rollback Workflow V1

**Status:** Sprint 2 frozen approval and verification workflow; no rollback tooling  
**Rule:** Every publication batch must be reversible to the previous approved state.

## Rollback boundary

Rollback restores the prior approved package pointer/output or removes the pilot package without deleting the failed/new package, evidence, decisions, logs or versions. Production database rollback is outside V1 because production database writes are prohibited.

## Required rollback record

- rollback ID;
- triggering publication batch/package version/hash;
- reason/incident/takedown reference;
- current and prior approved state/package versions and hashes;
- target/environment;
- exact records affected;
- backup/restore verification reference;
- human rollback approver;
- rollback executor and witness;
- requested, approved, started and completed times;
- execution/result status;
- post-rollback visible-state/hash verification;
- residual issues and follow-up decision.

## Approval workflow

```text
rollback_requested
  -> impact_and_prior_state_verified
  -> human_rollback_approval
  -> separately_authorized_execution
  -> verification
  -> rollback_completed
```

Exception states:

```text
rollback_blocked
rollback_failed
escalated
```

AI may detect symptoms, recommend rollback, compare versions and prepare evidence. AI may not approve or execute rollback.

## Rollback triggers

- publishing/adapter error;
- materially incorrect property fact;
- unapproved or wrong package/record version;
- missing/changed evidence or rights;
- stale current price/availability;
- duplicate/conflict discovered after release;
- credential/personal-data/cross-project incident;
- takedown or Owner direction;
- package integrity/hash mismatch;
- publication verification failure.

## Pre-execution gates

1. Identify and preserve the current failed/new package and all logs.
2. Verify the exact prior approved package/state and hash.
3. Verify backup/reference availability and restoration method.
4. Assess affected records and any security/legal containment.
5. Obtain immutable `approve_rollback` from the assigned human.
6. Confirm executor, witness, target and change window.
7. Stop further release/refresh actions for the affected batch.

Missing prior state, hash mismatch, unavailable backup or missing human approval yields `rollback_blocked` and immediate escalation.

## Execution plan

Execution is future work and requires separate authorization. The approved plan must:

1. freeze new publication actions;
2. atomically restore the prior approved pointer/output or remove the pilot package;
3. avoid production database writes;
4. retain both old/new versions and audit history;
5. record every action and result;
6. stop on unexpected target/state mismatch.

## Verification

Rollback passes only when:

- the active/visible state matches the prior approved version/hash;
- affected GoThailandHome output is checked;
- failed/new package remains preserved but inactive;
- no unrelated content/project changed;
- all actions, actors and times are logged;
- the target recovery time is met (V1 rehearsal target: within 15 minutes);
- Human Owner/witness records the verification result.

Failure triggers `rollback_failed`, containment and incident review; it blocks further publication.

## Re-review after rollback

Affected records/packages return to the earliest impacted review stage. Corrections create new versions and require all downstream reviews and a new publication approval. Rollback never reinstates approval for changed content.

## Rehearsal requirement

Before first production publication can be considered, a staging/local fixture must:

- switch between two immutable package versions;
- restore the prior hash within 15 minutes;
- retain both versions;
- produce a complete audit log;
- be witnessed and approved by a human.

No rehearsal or rollback is executed in Sprint 2.

