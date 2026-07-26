# Manual Review Decision Workflow Design

**Milestone:** `MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`  
**Date:** 2026-07-26  
**Mode:** Design only — no DB writes, migrations, RLS changes, decisions, Approval, Publish, Production, Deploy, or Git  
**Batch context:** `BATCH-GTH-20260724-001` · Session `sess_p2_fbda6bfdbeb462c00f25f88f`  
**Prior milestone:** `FIX_INTERNAL_ROUTE_LOCALE_BYPASS` · OVERALL PASS

---

## 1. Executive summary

This document designs the **human decision layer** for GoThailandHome Staging review. Decisions resolve review items (developers, provinces, images, PDFs, news) under Reviewer Gate constraints. Decisions **never** equal Business Approval, Publish, or Production writes.

Companion specs:

| Document | Focus |
| --- | --- |
| `REPORTS/MANUAL_REVIEW_STATE_MACHINE.md` | Review Item + Decision state machines |
| `REPORTS/MANUAL_REVIEW_DATA_MODEL.md` | Tables, DDL draft, immutability |
| `REPORTS/MANUAL_REVIEW_PERMISSION_MATRIX.md` | Roles, RLS draft, dual-control |
| `REPORTS/MANUAL_REVIEW_API_CONTRACT.md` | Internal API contracts |
| `REPORTS/MANUAL_REVIEW_UI_SPEC.md` | Review Console UX |
| `REPORTS/MANUAL_REVIEW_ROLLBACK_PLAN.md` | Decision rollback |
| `REPORTS/MANUAL_REVIEW_IMPLEMENTATION_PLAN.md` | Phases A–F (not executed) |

---

## 2. Architecture audit (read-only)

### 2.1 Reusable components

| Component | Path | Reuse |
| --- | --- | --- |
| Review state ceiling | `src/lib/staging-import/approval-state.ts` | Keep; Decision must not open APPROVED+ edges |
| Reason → state mapper | `src/lib/staging-import/adapters/goth-review-adapter.ts` | Map decision outcomes back to allowed `review_state` |
| Reviewer/approver separation | `src/lib/staging-db/review-repository.ts` | `assertApproverActionBlocked` remains hard block |
| Mutation + optimistic concurrency | `src/lib/staging-db/review-persistence.ts` | Extend with Decision actions; keep `version` |
| Idempotency engine | `src/lib/staging-db/idempotency.ts` | Decision keys: `sha256(batch\|review_item\|decision_type\|content_hash)` |
| Error codes | `src/lib/staging-db/errors.ts`, `docs/ERROR_CODE_CATALOG.md` | Add `GTH_DECISION_*` codes |
| Staging tables + RLS | `database/staging-migrations/001`–`009` | New decision tables; do not weaken existing CHECKs |
| Audit append-only | `staging_audit_events` | Mirror pattern for decision audit |
| Review Console shell | `src/app/internal/review/windows01/batches/[batchId]/` | Extend with decision panels |
| Internal locale bypass | `src/proxy.ts` | Already fixed; keep `/internal` reachable |
| Freeze / ADRs | `docs/architecture-freeze/*`, `docs/adr/*` | Non-negotiable isolation |

### 2.2 Missing components

- Structured decision vocabulary and persistence tables
- Decision service with submit / apply / reject / rollback
- Mounted authenticated decision APIs under `/api/internal/review/...`
- Console write UI (today: Marking Preview no-op)
- Dual-control (proposer ≠ approver) for HIGH/CRITICAL
- Decision-specific audit event types and reverse patches
- Sync of `staging_projects.province_conflict` with conflict candidates on apply

### 2.3 Forbidden contracts (must not break)

| Contract | Enforcement |
| --- | --- |
| No automation into `APPROVED` / `READY_FOR_PRODUCTION` / `PUBLISHED` | State machine, RLS WITH CHECK, Phase2 `GTH_REVIEWER_GATE` |
| No `dev-unknown` candidate | CHECK `candidate_id <> 'dev-unknown'` |
| No anonymous review writes | `ReviewAuthRequiredError` |
| No production catalog writes from staging | `GTH_PRODUCTION_HARD_BLOCK` |
| Storage upload default OFF | Env + RPC |
| `source_payload` / `idempotency_key` immutable on review items | Trigger `007` |
| Soft-delete rollback preserves audit | Rollback RPC design |
| Preview must not emit real CREATE/UPDATE/APPROVE/PUBLISH | Review rules + freeze |

### 2.4 Isolation boundary

```
Import / Controlled Commit (done for Batch001 Phase2)
        ↓
Review Items (63 blocking) — entity review_state ≤ READY_FOR_APPROVAL
        ↓
★ HUMAN DECISION WORKFLOW (this design) ★
  - Create / Submit / Apply / Reject / Roll back decisions
  - May update staging entity fields + review_state within allowed set
  - Ceiling remains READY_FOR_APPROVAL
        ✗ no edge
Business Approval (APPROVED) — FUTURE; assertApproverActionBlocked
        ✗ no edge
Publish / Production / Storage upload — HARD BLOCK
```

**Rules:**

- Decision ≠ Approval  
- Apply Decision ≠ Publish  
- Decision Review (dual-control) ≠ Business Approval  
- Decision must pass Reviewer Gate; cannot set forbidden states  
- Approval / Publish buttons remain absent or disabled in Console

### 2.5 Batch001 decision inventory (design targets)

| Decision type | Count / focus | Actions required |
| --- | --- | --- |
| Developer Canonical Link | 5 UNKNOWN: supalai, ap-thailand-public, sansiri, infinite-real-estate, bundarn | LINK_EXISTING_CANONICAL, CREATE_NEW_CANONICAL_CANDIDATE, KEEP_UNKNOWN, REJECT_SOURCE_IDENTITY, DEFER — **no auto-bind** |
| Project Province | Project 36936 · `PROVINCE_NAME_CONFLICT` | ACCEPT_SOURCE_PROVINCE, OVERRIDE_PROVINCE, MARK_UNRESOLVED, REQUEST_MORE_EVIDENCE, DEFER |
| Image Failure | 31 `IMAGE_FETCH_FAILED` | RETRY_FETCH, MANUAL_UPLOAD_REQUIRED, ACCEPT_NO_IMAGE, REJECT_ASSET, DEFER — design only, no fetch/upload |
| PDF | 5 unlinked | LINK_TO_EXISTING_PROJECT, KEEP_UNLINKED, REJECT_PDF, MOVE_TO_OTHER_BATCH, REQUEST_REVIEW, DEFER |
| News | 10/10 missing date; 0/10 linked | SET_PUBLISHED_DATE, LINK_PROJECT, LINK_DEVELOPER, KEEP_UNLINKED, REJECT_NEWS, REQUEST_MORE_EVIDENCE, DEFER |

---

## 3. Decision type catalog

### 3.1 Developer Canonical Link Decision

| Field | Value |
| --- | --- |
| `decision_family` | `DEVELOPER_CANONICAL_LINK` |
| `target_type` | `DEVELOPER` |
| Risk | **HIGH** (dual-control required) |
| Auto-bind | **Forbidden** |

**Actions:**

| Action | Effect on apply (staging only) |
| --- | --- |
| `LINK_EXISTING_CANONICAL` | Set `canonical_developer_id` to chosen production/staging canonical id; `identity_status` → `RESOLVED` or `KNOWN`; review_state → `READY_FOR_APPROVAL` if no other blockers |
| `CREATE_NEW_CANONICAL_CANDIDATE` | Mark `identity_status=CANDIDATE`; leave `canonical_developer_id` null until Approval phase creates canonical; review may move to `READY_FOR_APPROVAL` |
| `KEEP_UNKNOWN` | Leave UNKNOWN; clear blocking only if policy allows quarantine path → typically stay `REVIEW_REQUIRED` or `QUARANTINED` |
| `REJECT_SOURCE_IDENTITY` | Entity → `REJECTED`; projects linked may inherit review flags |
| `DEFER` | Review item → decision deferred; entity unchanged |

### 3.2 Project Province Decision

| Field | Value |
| --- | --- |
| `decision_family` | `PROJECT_PROVINCE` |
| Focus | Project `36936`, conflict `PROVINCE_NAME_CONFLICT` |
| Risk | OVERRIDE = **HIGH**; ACCEPT_SOURCE = **MEDIUM** |

**Payload must retain forever:**

- `source_value` (original province string)  
- `suggested_value` (system suggestion)  
- `final_value` (chosen on apply)  
- `reason`  
- `evidence_refs[]`  
- `actor_id` / `actor_role`  
- timestamps (`created_at`, `submitted_at`, `applied_at`)

**Actions:** `ACCEPT_SOURCE_PROVINCE` · `OVERRIDE_PROVINCE` · `MARK_UNRESOLVED` · `REQUEST_MORE_EVIDENCE` · `DEFER`

### 3.3 Image Failure Decision

| Field | Value |
| --- | --- |
| `decision_family` | `IMAGE_FAILURE` |
| Source reason | `IMAGE_FETCH_FAILED` |
| Risk | REJECT_ASSET = **MEDIUM**; ACCEPT_NO_IMAGE = **LOW**; MANUAL_UPLOAD = **MEDIUM** (upload itself out of scope) |

**Actions:** `RETRY_FETCH` · `MANUAL_UPLOAD_REQUIRED` · `ACCEPT_NO_IMAGE` · `REJECT_ASSET` · `DEFER`  
**This phase:** design only — no fetch, no upload execution.

### 3.4 PDF Decision

| Field | Value |
| --- | --- |
| `decision_family` | `PDF_LINKAGE` |
| Context | 5 PDFs with `project_candidate_id=null` |
| Risk | LINK = **MEDIUM**; REJECT / MOVE_BATCH = **HIGH** |

**Actions:** `LINK_TO_EXISTING_PROJECT` · `KEEP_UNLINKED` · `REJECT_PDF` · `MOVE_TO_OTHER_BATCH` · `REQUEST_REVIEW` · `DEFER`

### 3.5 News Decision

| Field | Value |
| --- | --- |
| `decision_family` | `NEWS_METADATA` |
| Context | 10 missing `published_at`; 0 linked |
| Risk | SET_DATE / LINK = **MEDIUM**; REJECT = **HIGH** |

**Actions:** `SET_PUBLISHED_DATE` · `LINK_PROJECT` · `LINK_DEVELOPER` · `KEEP_UNLINKED` · `REJECT_NEWS` · `REQUEST_MORE_EVIDENCE` · `DEFER`

---

## 4. Design principles

1. **Two-plane state:** Entity/review_item `review_state` (existing) vs Decision workflow status (new) — never collapse into one enum.  
2. **Single active decision** per review item (`UNIQUE` where status ∈ DRAFT|SUBMITTED).  
3. **History is permanent** — rolled-back / rejected decisions remain rows.  
4. **Apply is transactional** — decision row + entity patch + review_item update + audit in one DB transaction.  
5. **Dual-control for HIGH/CRITICAL** — proposer ≠ apply actor.  
6. **Idempotent submit/apply/rollback** via `idempotency_key` + optimistic `version`.  
7. **No Approval / Publish / Production** in this workflow.

---

## 5. Verification constraints (this milestone)

| Action | Status |
| --- | --- |
| Database changed | NO |
| Migration added/applied | NO |
| RLS changed | NO |
| Review item decision written | NO |
| Conflict modified | NO |
| Canonical link created | NO |
| Approval / Publish | BLOCKED |
| Production | UNCHANGED |
| Deploy / Commit / Push | NOT_EXECUTED |

---

## 6. Exit criteria (design milestone)

- [x] Architecture audit documented  
- [x] State machines with transition tables  
- [x] Data model + DDL draft (not executed)  
- [x] Permission matrix + RLS draft (not executed)  
- [x] Dual-control rules  
- [x] API contracts (not implemented)  
- [x] UI spec (not coded)  
- [x] Rollback design  
- [x] Phased implementation plan (not executed)  
- [x] Eight reports under `REPORTS/`  

**Next recommended action:** `MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION` (Schema + RLS + tests only, under a future approved milestone).
