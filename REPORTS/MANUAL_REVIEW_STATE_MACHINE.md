# Manual Review State Machine

**Milestone:** `MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`  
**Date:** 2026-07-26  
**Mode:** Design only — not implemented

---

## 1. Two planes (must stay separate)

| Plane | Owns | Allowed ceiling |
| --- | --- | --- |
| **Entity / Review Item** (`staging_*`.review_state, `staging_review_items.review_state`) | Import + Decision side-effects | `READY_FOR_APPROVAL` max for automation/decision apply |
| **Decision** (`staging_review_decisions.status`) | Human decision lifecycle | `APPLIED` / `ROLLED_BACK` / `REJECTED` — never `PUBLISHED` |

Forbidden entity states for Decision apply: `APPROVED`, `READY_FOR_PRODUCTION`, `PUBLISHED`.

Decision Review (dual-control apply) ≠ Business Approval.

---

## 2. Review Item workflow states (decision overlay)

Existing DB CHECK states remain the **source of truth** for entity/review rows:

`RECEIVED` · `VALIDATED` · `REVIEW_REQUIRED` · `CONFLICT` · `DUPLICATE` · `READY_FOR_APPROVAL` · `REJECTED` · `QUARANTINED`

**Decision overlay** (application-level; may be stored on decision or derived):

| Overlay | Meaning |
| --- | --- |
| `PENDING` | No active decision; item awaits human work |
| `IN_REVIEW` | Draft decision exists (`DRAFT`) |
| `DECIDED` | Decision `APPLIED` |
| `DEFERRED` | Latest decision action is `DEFER` / status implies deferral |
| `REOPENED` | Prior applied decision rolled back or item reopened for new decision |
| `CANCELLED` | Item cancelled (session rolled back / batch cancelled) — no new decisions |

Overlay does **not** replace `review_state`. Mapping examples:

| Overlay | Typical review_state |
| --- | --- |
| PENDING | `REVIEW_REQUIRED` / `CONFLICT` |
| IN_REVIEW | unchanged |
| DECIDED (resolved) | often `READY_FOR_APPROVAL` or `REJECTED` / `QUARANTINED` |
| DEFERRED | stays `REVIEW_REQUIRED` / `CONFLICT` |
| REOPENED | back to `REVIEW_REQUIRED` / `CONFLICT` |

---

## 3. Decision status machine

```
                    ┌──────────┐
         create     │  DRAFT   │
       ───────────► │          │
                    └────┬─────┘
                         │ submit
                         ▼
                    ┌──────────┐
            ┌───────│SUBMITTED │──────┐
            │reject │          │ apply│
            ▼       └────┬─────┘      ▼
       ┌──────────┐      │       ┌──────────┐
       │ REJECTED │      │       │ APPLIED  │
       └──────────┘      │       └────┬─────┘
                         │            │ rollback
                         │            ▼
                         │       ┌────────────┐
                         └──────►│ROLLED_BACK │
                                 └────────────┘
```

| Status | Mutable fields | Terminal? |
| --- | --- | --- |
| `DRAFT` | payload, reason, evidence attachments | No |
| `SUBMITTED` | none (except reject/apply actors) | No |
| `APPLIED` | none (rollback creates new audit; status → ROLLED_BACK) | Soft-terminal |
| `REJECTED` | none | Yes |
| `ROLLED_BACK` | none | Yes |

---

## 4. Transition table — Review Item overlay

| FROM | ACTION | TO | ROLE | PRECONDITION | AUDIT_EVENT | ROLLBACK_ALLOWED |
| --- | --- | --- | --- | --- | --- | --- |
| PENDING | `CREATE_DRAFT` | IN_REVIEW | REVIEWER+ | Item exists; no active decision; Gate ON | `REVIEW_ITEM_IN_REVIEW` | N/A |
| IN_REVIEW | `SAVE_DRAFT` | IN_REVIEW | REVIEWER+ | Decision DRAFT; version match | `DECISION_DRAFT_SAVED` | N/A |
| IN_REVIEW | `SUBMIT` | IN_REVIEW* | REVIEWER+ | Decision DRAFT → SUBMITTED; required payload valid | `DECISION_SUBMITTED` | N/A |
| IN_REVIEW | `APPLY` | DECIDED | SENIOR_REVIEWER+ (HIGH/CRITICAL); REVIEWER (LOW; MEDIUM per config) | Decision SUBMITTED; dual-control if required; entity version match | `DECISION_APPLIED` | Yes (via decision rollback) |
| IN_REVIEW | `REJECT_DECISION` | PENDING | SENIOR_REVIEWER+ | Decision SUBMITTED | `DECISION_REJECTED` | N/A |
| IN_REVIEW | `DEFER` | DEFERRED | REVIEWER+ | Decision SUBMITTED with action DEFER applied or draft deferred | `DECISION_DEFERRED` | Yes (reopen) |
| DEFERRED | `REOPEN` | PENDING | REVIEWER+ | No conflicting active decision | `REVIEW_ITEM_REOPENED` | N/A |
| DECIDED | `REOPEN` | REOPENED → PENDING | REVIEW_ADMIN / SENIOR (policy) | Prior decision ROLLED_BACK or reopen after rollback | `REVIEW_ITEM_REOPENED` | N/A |
| DECIDED | `ROLLBACK_DECISION` | REOPENED | REVIEW_ADMIN | Decision APPLIED; within window; eligibility OK | `DECISION_ROLLED_BACK` | — |
| * | `CANCEL_ITEM` | CANCELLED | REVIEW_ADMIN / SYSTEM | Session cancelled or soft-deleted | `REVIEW_ITEM_CANCELLED` | No |
| Any | `APPROVE` / `PUBLISH` | — | — | **ALWAYS BLOCKED** | — | — |

\* After submit, overlay stays conceptually “in flight” until apply/reject; UI may show “Submitted”.

---

## 5. Transition table — Decision status

| FROM | ACTION | TO | ROLE | PRECONDITION | AUDIT_EVENT | ROLLBACK_ALLOWED |
| --- | --- | --- | --- | --- | --- | --- |
| (none) | `CREATE` | DRAFT | REVIEWER+ | Single-active constraint | `DECISION_CREATED` | N/A |
| DRAFT | `UPDATE` | DRAFT | REVIEWER (owner) / SENIOR | Version match; owner or admin | `DECISION_UPDATED` | N/A |
| DRAFT | `SUBMIT` | SUBMITTED | REVIEWER+ | Schema validation; evidence if required | `DECISION_SUBMITTED` | N/A |
| DRAFT | `CANCEL_DRAFT` | REJECTED* | REVIEWER (owner) / ADMIN | Optional soft-cancel path | `DECISION_CANCELLED` | N/A |
| SUBMITTED | `APPLY` | APPLIED | Per risk matrix + dual-control | Gate; proposer≠approver if HIGH/CRITICAL; idempotency | `DECISION_APPLIED` | Yes |
| SUBMITTED | `REJECT` | REJECTED | SENIOR_REVIEWER+ | Reason required | `DECISION_REJECTED` | No |
| APPLIED | `ROLLBACK` | ROLLED_BACK | REVIEW_ADMIN | Eligibility; dry-run optional; reverse patch | `DECISION_ROLLED_BACK` | Idempotent |
| APPLIED | `APPLY` (replay) | APPLIED | SYSTEM | Same idempotency_key → no-op success | `DECISION_APPLY_IDEMPOTENT` | — |
| REJECTED / ROLLED_BACK | any mutate | — | — | Forbidden | `DECISION_IMMUTABLE_VIOLATION` | — |

\* Cancelled drafts may use `REJECTED` with `reject_reason=CANCELLED_BY_AUTHOR` or a dedicated terminal if added later; V1 uses `REJECTED`.

---

## 6. Per-family apply effects (entity plane)

### 6.1 Developer Canonical Link

| Action | Entity changes | review_state target |
| --- | --- | --- |
| LINK_EXISTING_CANONICAL | `canonical_developer_id=…`, `identity_status=RESOLVED` | `READY_FOR_APPROVAL` if unblocked |
| CREATE_NEW_CANONICAL_CANDIDATE | `identity_status=CANDIDATE`, canonical null | `READY_FOR_APPROVAL` or stay `REVIEW_REQUIRED` (policy: READY) |
| KEEP_UNKNOWN | notes only | `QUARANTINED` or stay `REVIEW_REQUIRED` |
| REJECT_SOURCE_IDENTITY | — | `REJECTED` |
| DEFER | none | unchanged |

**No automatic production developer bind.**

### 6.2 Project Province

| Action | Entity changes | Conflict row |
| --- | --- | --- |
| ACCEPT_SOURCE_PROVINCE | Keep province; set `province_conflict=false`; store final=source | Mark resolved in decision changes |
| OVERRIDE_PROVINCE | Set province=final; confidence HIGH; conflict false | Resolved |
| MARK_UNRESOLVED | conflict true | Remains CONFLICT |
| REQUEST_MORE_EVIDENCE | none | CONFLICT / REVIEW_REQUIRED |
| DEFER | none | unchanged |

Must persist source / suggested / final in decision payload forever.

### 6.3 Image Failure

| Action | Entity / review effect | Side effect this milestone |
| --- | --- | --- |
| RETRY_FETCH | Flag `retry_requested=true` in change payload | **Not executed** (queue only) |
| MANUAL_UPLOAD_REQUIRED | Asset `storage_status` stays PLANNED/FAILED | Upload **not** performed |
| ACCEPT_NO_IMAGE | Clear image blocker; project may proceed without media | — |
| REJECT_ASSET | Asset → REJECTED | — |
| DEFER | none | — |

### 6.4 PDF / News

Apply only mutates staging linkage / `published_at` / review_state within allowed set. `MOVE_TO_OTHER_BATCH` records intent; actual re-batch is a later ops workflow (manual compensation if applied).

---

## 7. Concurrency & single-active rules

1. Partial unique index: one decision per `review_item_id` where `status IN ('DRAFT','SUBMITTED')`.  
2. Apply locks review_item row `FOR UPDATE` and checks `version`.  
3. Concurrent apply → `GTH_DECISION_VERSION_CONFLICT` or `GTH_REVIEW_VERSION_CONFLICT`.  
4. Historical APPLIED/REJECTED/ROLLED_BACK rows never deleted.

---

## 8. Gate assertions (every transition)

```
assertReviewerGateEnabled()
assertNotForbiddenEntityState(target)
assertApproverActionBlocked()  // APPROVE/PUBLISH always throw
assertRoleAllows(action, risk)
assertDualControl(decision)    // when risk HIGH/CRITICAL
assertIdempotency(key)
```

---

## 9. Audit event vocabulary (new)

| Event | When |
| --- | --- |
| `DECISION_CREATED` | Draft created |
| `DECISION_UPDATED` | Draft saved |
| `DECISION_SUBMITTED` | Submit |
| `DECISION_APPLIED` | Apply success |
| `DECISION_APPLY_IDEMPOTENT` | Replay |
| `DECISION_REJECTED` | Reject |
| `DECISION_ROLLED_BACK` | Rollback |
| `DECISION_EVIDENCE_ATTACHED` | Evidence add |
| `REVIEW_ITEM_IN_REVIEW` | First draft |
| `REVIEW_ITEM_REOPENED` | Reopen |
| `REVIEW_ITEM_CANCELLED` | Cancel |
| `DECISION_DRY_RUN_PREVIEW` | Rollback/apply dry-run |

All events append to `staging_audit_events` and/or `staging_review_decision_audit` (see data model).
