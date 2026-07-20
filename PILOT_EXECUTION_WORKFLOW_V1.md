# Pilot Execution Workflow V1

**Status:** Sprint 4 planning only; no live execution  
**Purpose:** Define the Collect → Review → Correct → Approve → Publish sequence for the V1 pilot

## Workflow overview

```text
Owner-approved manifest
        |
        v
   [Collect]
        |
        v
   [Review]
   intake → fact → freshness → duplicate
        |
        +--> Correct --> return to Review as new version
        |
        v
   [Approve]
   publish_review → approved → publish_ready
        |
        v
   [Publish]
   package → staging/local handoff → (production only if Feature Freeze lifted + G6)
        |
        +--> Rollback if needed
```

All stages remain offline/fixture-first until G1/G4/G5 and Owner live authorization exist.

## Stage 1 — Collect

**Actors:** Collector Operator / Validation Worker (later implementation); Owner for source/project approval  

**Inputs:**

- Approved source list (≤2)
- Approved project list (5–10)
- Adapter / capture policy versions
- Rights / retention confirmation

**Actions:**

1. Capture only Owner-approved source/project pairs
2. Persist original payload/snapshot and SHA-256
3. Normalize through adapter contract without fabricating values
4. Attach capture timestamps and adapter versions
5. Emit candidates into validation / intake queue

**Exit criteria:**

- Records ≤100
- Evidence retained for every captured item
- Out-of-scope types/geographies rejected
- No live collect until G4/G5 closed

**Hard stops:** rights failure, credential exposure, ceiling breach, missing evidence

## Stage 2 — Review

**Actors:** Intake Reviewer → Fact Reviewer → Duplicate Reviewer (100% coverage)  

**Actions:**

1. **Intake:** scope, rights, evidence presence, field completeness
2. **Fact:** accuracy, high-risk fields, freshness status
3. **Duplicate:** exact/strong/uncertain classification and human resolution
4. Record every decision with actor, timestamp, reason, evidence references

**Exit criteria:**

- All package-bound records have complete review decisions
- Quarantine / reject / needs_correction paths used when required
- No AI auto-approval

**Hard stops:** open P0, unresolved duplicates, missing audit entries

## Stage 3 — Correct

**Actors:** Fact Reviewer / Operator; new version created  

**Actions:**

1. Create a new `record_version` for every correction
2. Preserve prior version and prior decisions (append-only)
3. Attach new or clarified evidence as needed
4. Re-enter Review from the earliest invalidated stage
5. High-risk field corrections require fresh human approval

**Exit criteria:**

- Corrected exact version re-passes Review
- Prior approval is not inherited

**Hard stops:** silent overwrite, missing prior version, unreviewed high-risk changes

## Stage 4 — Approve

**Actors:** Publish Approver (human)  

**Actions:**

1. Confirm all prior stage decisions for the exact version
2. Confirm accuracy, duplicate, freshness, evidence, and quality gates
3. Confirm package candidates are within pilot ceilings
4. Transition: `publish_review` → `approved` → `publish_ready` when eligible
5. Deny or return to Correct/Review on any residual risk

**Exit criteria:**

- Exact versions marked approved / publish_ready with human actor IDs
- Package membership list frozen for assembly

**Hard stops:** incomplete checklist, open quarantine, Feature Freeze production attempts

## Stage 5 — Publish

**Actors:** Operator / Owner; Staging/Local handoff only while Feature Freeze active  

**Actions:**

1. Assemble deterministic package (records + evidence refs + citations + hash)
2. Rebuild and verify identical hash
3. Complete rollback rehearsal
4. Hand off to staging/local surface
5. Production publication only if Feature Freeze is lifted and G6 is closed by Owner

**Exit criteria:**

- Publish readiness checklist complete
- Rollback reference recorded
- Audit trail reconstructable end-to-end

**Hard stops:** hash mismatch, missing citations, failed rollback rehearsal, unauthorized production write

## Cross-cutting rules

- Manual review ratio remains 100% across Collect outcomes entering Review
- Corrections always create new versions
- Emergency stop / rollback may interrupt any stage
- Monitoring and backup standards apply once runtime exists; planning does not create runtime
- No Windows 01 deployment, Docker, or live source connection is authorized by this workflow alone

## Stage ownership summary

| Stage | Primary human authority | AI role |
| --- | --- | --- |
| Collect | Owner (approval) / Operator (capture later) | None for approval |
| Review | Intake / Fact / Duplicate Reviewers | Recommend only |
| Correct | Fact Reviewer / Operator | Suggest diffs only |
| Approve | Publish Approver | Recommend only |
| Publish | Operator / Owner | None |
