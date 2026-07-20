# Review Workflow V1

**Status:** Sprint 2 frozen planning workflow; no implementation  
**Scope:** 100% human review of V1 Bangkok new-condominium records

## Principles

- Evidence precedes approval.
- Every review targets one exact record/evidence version.
- AI may recommend, summarize, compare, and flag; AI may not approve or publish.
- Invalid, incomplete, stale, conflicted, or uncertain records fail closed.
- Decisions are immutable and traceable.
- Publication approval is separate from record review.
- Every publication must have an approved rollback path.

## Standard workflow

```text
candidate
  -> intake_review
  -> fact_review
  -> duplicate_review
  -> publish_review
  -> approved
  -> publish_ready
```

Exception exits from every review state:

```text
change_requested
rejected
quarantined
```

`published` is not granted by this record workflow. It requires the separate publication approval workflow and a reversible batch.

## Stage gates

| Stage | Human responsibility | Pass condition | Fail/hold outcome |
| --- | --- | --- | --- |
| `candidate` | Confirm exact candidate/version is available | Adapter/validation result and evidence references exist | `quarantined` if payload/evidence integrity failed |
| `intake_review` | Verify source approval, scope, access method, rights, evidence availability, pilot limits | Approved active source; Bangkok/new condominium; complete evidence object; no prohibited data | `rejected`, `quarantined`, or `change_requested` |
| `fact_review` | Compare every publishable field to evidence; verify price/currency/freshness and null semantics | All P0 fields valid and source-backed; high-risk fields explicitly approved | `change_requested`, `rejected`, or `quarantined` |
| `duplicate_review` | Resolve every exact/strong/ambiguous group | Immutable `merge`, `keep_separate`, or `false_positive`; no unresolved uncertain match | `change_requested`/hold; `needs_more_evidence` cannot pass |
| `publish_review` | Confirm complete reviews, current freshness, attribution, version, package eligibility and rollback reference design | Zero P0 failures/open tasks/conflicts; exact version identified | `change_requested` or `rejected` |
| `approved` | Certify exact record version after all record gates | Human decision with reviewer, reason, evidence viewed and approval time | Cannot be assigned by AI |
| `publish_ready` | Confirm record may enter an exact candidate publication batch | Separate human publication gate inputs complete | Remains approved but not publishable |

## Approval process

1. Reviewer authenticates under an assigned human role.
2. Reviewer opens the exact record version and all referenced evidence.
3. Reviewer completes every mandatory checklist item.
4. Reviewer records one allowed decision with reason, comment, evidence viewed, and timestamp.
5. A pass advances only through the allowed next transition.
6. Record approval requires all prior stage decisions and zero P0 failures.
7. Publication still requires a human approval for the exact package/batch version and hash.

## Reject process

- Use `rejected` when the record/source is out of scope, unsupported, prohibited, materially incorrect, or cannot be corrected safely.
- Record rejection reason, evidence, target version, reviewer, role, and timestamp.
- Rejection never deletes evidence, versions, or prior decisions.
- A rejected record cannot enter a package.
- Reopening requires new or corrected evidence, a new record version, and a `reopen` decision; it resumes at the earliest affected review stage.

## Change-request process

- Use `change_requested` for remediable missing/incorrect values, evidence locations, normalization, validation, freshness, or duplicate information.
- Specify each blocking field/rule and required correction.
- Correction creates a new record/evidence version.
- Prior decisions remain immutable.
- The new version returns to the earliest affected stage; later approvals are invalidated for the new version.

## Quarantine process

Use `quarantined` for rights uncertainty, hash mismatch, unavailable evidence, credential/personal-data exposure, source-policy breach, severe parser/adapter error, or security incident. Quarantine blocks all review advancement and package inclusion until a human Owner/compliance decision and verified remediation exist.

## Re-review process

Re-review is mandatory when:

- source approval, rights, attribution, ownership, access method, or terms change;
- source payload/hash or evidence changes;
- any publishable field changes;
- price/current availability exceeds 30 days without verification;
- freshness becomes `warning` or `expired`;
- a duplicate/conflict is discovered or prior merge is challenged;
- a reviewer correction, incident, takedown, rollback, or package rejection occurs;
- adapter, parser, normalization, dictionary, or review policy version changes materially.

Re-review creates an audit event, new review task(s), and—when data changed—a new record version. It starts at the earliest affected stage and re-runs all downstream gates.

## Transition controls

- No state may be skipped.
- No reviewer may approve an object version they did not inspect.
- A P0 failure prevents `approved` and `publish_ready`.
- `warning` freshness blocks current price/availability presentation; `expired` blocks current publication.
- Uncertain duplicate groups cannot advance.
- Corrections append; they never overwrite.
- Human publication approval and rollback approval are mandatory even when every record is approved.

