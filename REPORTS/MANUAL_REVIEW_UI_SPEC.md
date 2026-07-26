# Manual Review UI Spec

**Milestone:** `MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`  
**Date:** 2026-07-26  
**Mode:** Design only — **no coding** in this milestone

**Base route (existing):** `/internal/review/windows01/batches/[batchId]`  
**Flag:** extend `FEATURE_GOTH_REVIEW_CONSOLE`; decisions behind `FEATURE_STAGING_REVIEW_DECISIONS` (default off)

---

## 1. Design principles

- Read-first; mutations gated by role + Reviewer Gate  
- Approval / Publish buttons **absent or permanently disabled** with tooltip “Blocked by Reviewer Gate”  
- Always show: source value, proposed value, final value, confidence, severity, blocking reason, related entities, evidence, decision history, actor, timestamps  
- Buttons by gate/role: Save Draft · Submit · Apply · Reject · Reopen · Roll Back  
- Sorting WARNING remains UX backlog — **do not implement in this design milestone or Phase C MVP unless separately approved**

---

## 2. Screens / panels

### 2.1 Review Queue

**Purpose:** Triage 63 Batch001 items (and future batches).

| Element | Behavior |
| --- | --- |
| Summary strip | Counts: Pending / In review / Deferred / Decided / Conflicts / Blocking |
| Filters | reason, severity, entity type, overlay status, decision family |
| Search | entity id, name, reason |
| Pagination | existing console pattern |
| Row badges | UNKNOWN DEV, PROVINCE CONFLICT, IMAGE_FETCH_FAILED, etc. |
| Row CTA | Open detail |
| Disabled | Approve, Publish |

### 2.2 Review Item Detail

**Layout:** header (entity + severity + blocking) · values trio · related entities · evidence · decision composer · history · audit timeline

**Values trio (required):**

| Column | Source |
| --- | --- |
| Source value | `payload_before` / entity original |
| Proposed value | system suggestion / draft `payload_after` |
| Final value | applied final or “—” |

### 2.3 Conflict Detail

Specialized for `PROVINCE_NAME_CONFLICT` / Project 36936:

- Show record province vs name-derived suggestion  
- Link to conflict candidate id  
- Actions: ACCEPT_SOURCE · OVERRIDE · MARK_UNRESOLVED · REQUEST_MORE_EVIDENCE · DEFER  
- Require reason + evidence for OVERRIDE (HIGH)

### 2.4 Developer Resolution

Targets: supalai, ap-thailand-public, sansiri, infinite-real-estate, bundarn

| Control | Notes |
| --- | --- |
| Action select | LINK_EXISTING / CREATE_NEW / KEEP_UNKNOWN / REJECT / DEFER |
| Canonical picker | Search existing canonicals — **no auto-bind on load** |
| Evidence | Website, DNS, notes |
| Dual-control banner | “HIGH: another senior must Apply” |

### 2.5 Province Resolution

Same as Conflict Detail embedded in project item; retain immutable display of source/suggested after apply.

### 2.6 Image Failure Resolution

| Action | UI note |
| --- | --- |
| RETRY_FETCH | Queues intent only; copy: “Fetch not executed in this phase” |
| MANUAL_UPLOAD_REQUIRED | Shows upload placeholder disabled |
| ACCEPT_NO_IMAGE | Confirm project may lack media |
| REJECT_ASSET | Confirm |
| DEFER | — |

### 2.7 PDF Resolution

List 5 unlinked PDFs; actions LINK / KEEP_UNLINKED / REJECT / MOVE_TO_OTHER_BATCH / REQUEST_REVIEW / DEFER.  
Project picker for LINK; MOVE shows warning (manual compensation may be needed).

### 2.8 News Resolution

For each of 10 news: date picker (`SET_PUBLISHED_DATE`), project/developer linkers, KEEP_UNLINKED, REJECT, REQUEST_MORE_EVIDENCE, DEFER.

### 2.9 Evidence Panel

Attach URL / note / hash / official site; list immutable attachments; Viewer read-only.

### 2.10 Audit Timeline

Chronological events from decision audit API; filter by event type.

### 2.11 Decision Diff

Table of field changes (before → after) from `staging_review_decision_changes`; available after apply and in dry-run preview.

### 2.12 Rollback Preview

Admin-only: dry-run rollback → show reverse patch → confirm Roll Back.

---

## 3. Button visibility matrix

| Button | Visible when | Enabled when |
| --- | --- | --- |
| Save Draft | REVIEWER+ & item open | DRAFT or creating |
| Submit | REVIEWER+ | DRAFT & validation OK |
| Apply | SENIOR+ (or REVIEWER for LOW) | SUBMITTED & dual-control OK |
| Reject | SENIOR+ | SUBMITTED |
| Reopen | REVIEWER+ | DEFERRED or after ROLLED_BACK |
| Roll Back | ADMIN | APPLIED & eligible |
| Approve | never / disabled | never |
| Publish | never / disabled | never |

Gate off → all mutate buttons disabled with reason.

---

## 4. Interaction flows (happy path)

```
Queue → Item Detail → choose family action → Save Draft
  → attach Evidence → Submit
  → (different) Senior opens → reviews Diff → Apply
  → Item shows DECIDED; values trio shows Final
```

Defer path: Submit DEFER → overlay DEFERRED → Reopen later.

Rollback: Admin → Rollback Preview (dry-run) → confirm → item REOPENED/PENDING.

---

## 5. Empty / error states

| State | UI |
| --- | --- |
| Feature flag off | Read-only console; “Decisions not enabled” |
| Version conflict | Toast + reload detail |
| Dual-control fail | Inline error; Apply stays disabled for proposer |
| Rollback ineligible | Explain manual compensation path |

---

## 6. Accessibility & performance

- Preserve existing console search/filter/pagination performance expectations  
- Keyboard-accessible action menus  
- No sort control required this round (backlog WARNING)

---

## 7. Out of scope for UI implementation this milestone

- Coding any of the above  
- Enabling Approval/Publish  
- Live storage upload widgets  
- Sorting control implementation
