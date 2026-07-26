# Manual Review Permission Matrix

**Milestone:** `MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`  
**Date:** 2026-07-26  
**Mode:** Design only — RLS draft **must not be executed**

---

## 1. Roles

| Role | Maps to (existing / new) | Nature |
| --- | --- | --- |
| `REVIEW_VIEWER` | new app role; DB: `read_only_auditor` or dedicated viewer | Read-only queue/detail |
| `REVIEWER` | extends `staging_reviewer` | Create draft, submit, attach evidence (low/medium per config) |
| `SENIOR_REVIEWER` | new capability on reviewer or elevated claim | Apply HIGH; reject submitted; dual-control approver |
| `REVIEW_ADMIN` | extends `staging_admin` for decision ops | Rollback, reopen, cancel; not Production |
| `SYSTEM_AUDITOR` | `read_only_auditor` | Forever read-only; export audit |

**Out of workflow (must remain absent):**

- Approver / Publisher roles for Business Approval & Publish  
- Production DBA write roles for catalog cutover  

---

## 2. Permission matrix

| Capability | VIEWER | REVIEWER | SENIOR | ADMIN | AUDITOR |
| --- | --- | --- | --- | --- | --- |
| View queue | ✓ | ✓ | ✓ | ✓ | ✓ |
| View details | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create draft | ✗ | ✓ | ✓ | ✓ | ✗ |
| Submit decision | ✗ | ✓ | ✓ | ✓ | ✗ |
| Apply decision (LOW) | ✗ | ✓ | ✓ | ✓ | ✗ |
| Apply decision (MEDIUM) | ✗ | configurable | ✓ | ✓ | ✗ |
| Apply decision (HIGH/CRITICAL) | ✗ | ✗ | ✓* | ✓* | ✗ |
| Reject decision | ✗ | ✗ | ✓ | ✓ | ✗ |
| Reopen item | ✗ | ✓† | ✓ | ✓ | ✗ |
| Roll back decision | ✗ | ✗ | ✗ | ✓ | ✗ |
| Attach evidence | ✗ | ✓ | ✓ | ✓ | ✗ |
| View audit history | ✓ | ✓ | ✓ | ✓ | ✓ |
| Export review report | ✓‡ | ✓ | ✓ | ✓ | ✓ |
| Business Approval | ✗ | ✗ | ✗ | ✗ | ✗ |
| Publish | ✗ | ✗ | ✗ | ✗ | ✗ |
| Production write | ✗ | ✗ | ✗ | ✗ | ✗ |

\* Dual-control: apply actor ≠ proposer.  
† Reopen after DEFER / after admin rollback only — not reopen APPLIED without rollback.  
‡ Viewer export may be redacted (no PII beyond what's already in queue).

---

## 3. Risk levels & dual-control

### 3.1 Risk taxonomy

| Level | Meaning | Dual-control |
| --- | --- | --- |
| `LOW` | Reversible metadata; low blast radius | Optional single-person |
| `MEDIUM` | Linkage / dates / soft disposition | Configurable single or dual |
| `HIGH` | Identity, conflict resolution, overrides, rejects of core entities | **Required** |
| `CRITICAL` | Cross-batch moves, mass impact, security-sensitive | **Required** + Admin may be mandatory apply |

### 3.2 Forced HIGH (minimum)

| Decision | Risk |
| --- | --- |
| Developer Canonical Link (all actions except DEFER) | HIGH |
| Province Override (`OVERRIDE_PROVINCE`) | HIGH |
| Reject Project (if introduced) | HIGH |
| Reject Developer (`REJECT_SOURCE_IDENTITY`) | HIGH |
| Conflict Resolution (any apply that clears CONFLICT) | HIGH |
| `REJECT_PDF` / `REJECT_NEWS` / `MOVE_TO_OTHER_BATCH` | HIGH |
| `DEFER` / `REQUEST_MORE_EVIDENCE` / `KEEP_*` | LOW–MEDIUM |

### 3.3 Dual-control rules

1. `proposer_id` recorded on create/submit; `approver_id` = apply actor.  
2. If `risk_level ∈ {HIGH, CRITICAL}` then `approver_id <> proposer_id` else `GTH_DECISION_DUAL_CONTROL_REQUIRED`.  
3. MEDIUM: env `STAGING_DECISION_MEDIUM_DUAL_CONTROL=true|false` (default **true** for Batch001 pilot safety).  
4. LOW: single person may submit+apply.  
5. **Decision Review ≠ Business Approval** — dual-control only authorizes staging field patches.  
6. **Apply Decision ≠ Publish** — no publish permission granted by apply.

---

## 4. RLS policy draft (DO NOT EXECUTE)

Align with `20260725_006_staging_rls.sql` patterns: REVOKE PUBLIC; grant by role; WITH CHECK blocks forbidden review states.

```sql
-- DRAFT ONLY — DO NOT APPLY IN THIS MILESTONE

ALTER TABLE staging_review_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_review_decision_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_review_decision_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_review_decision_audit ENABLE ROW LEVEL SECURITY;

-- VIEWER / AUDITOR: SELECT only
CREATE POLICY decision_select_auditor ON staging_review_decisions
  FOR SELECT TO read_only_auditor USING (true);

CREATE POLICY decision_select_reviewer ON staging_review_decisions
  FOR SELECT TO staging_reviewer USING (true);

CREATE POLICY decision_select_admin ON staging_review_decisions
  FOR SELECT TO staging_admin USING (true);

-- REVIEWER: INSERT drafts; UPDATE only DRAFT rows they own (app enforces ownership)
CREATE POLICY decision_insert_reviewer ON staging_review_decisions
  FOR INSERT TO staging_reviewer
  WITH CHECK (status = 'DRAFT');

CREATE POLICY decision_update_reviewer_draft ON staging_review_decisions
  FOR UPDATE TO staging_reviewer
  USING (status = 'DRAFT')
  WITH CHECK (status IN ('DRAFT','SUBMITTED','REJECTED'));

-- SENIOR/ADMIN apply/rollback via service role or staging_admin
CREATE POLICY decision_update_admin ON staging_review_decisions
  FOR UPDATE TO staging_admin
  USING (true)
  WITH CHECK (status IN ('DRAFT','SUBMITTED','APPLIED','REJECTED','ROLLED_BACK'));

-- Evidence: insert by reviewer; select all authenticated staging roles; no update/delete
CREATE POLICY evidence_insert_reviewer ON staging_review_decision_evidence
  FOR INSERT TO staging_reviewer WITH CHECK (true);

CREATE POLICY evidence_select_all ON staging_review_decision_evidence
  FOR SELECT TO staging_reviewer, staging_admin, read_only_auditor USING (true);

-- Changes: insert only on apply (admin/service); select all; no update/delete
CREATE POLICY changes_insert_admin ON staging_review_decision_changes
  FOR INSERT TO staging_admin WITH CHECK (true);

CREATE POLICY changes_select_all ON staging_review_decision_changes
  FOR SELECT TO staging_reviewer, staging_admin, read_only_auditor USING (true);

-- Decision audit: INSERT by reviewer/admin; SELECT by all; no UPDATE/DELETE
CREATE POLICY decision_audit_insert ON staging_review_decision_audit
  FOR INSERT TO staging_reviewer, staging_admin WITH CHECK (true);

CREATE POLICY decision_audit_select ON staging_review_decision_audit
  FOR SELECT TO staging_reviewer, staging_admin, read_only_auditor USING (true);

-- Never grant DELETE on decision_audit / evidence / changes
-- Never grant policies that allow review_state APPROVED / READY_FOR_PRODUCTION / PUBLISHED
```

App-layer must still call `assertApproverActionBlocked` and Reviewer Gate regardless of RLS.

---

## 5. Gate integration

| Check | When |
| --- | --- |
| `STAGING_REVIEWER_GATE_ENABLED=true` | All mutating decision APIs |
| Auth required | All POST decision routes |
| Role claim matches matrix | Middleware |
| Feature flag `FEATURE_STAGING_REVIEW_DECISIONS` default **false** until Phase B exit |
| Production environment | All routes return `GTH_PRODUCTION_HARD_BLOCK` / disabled |

---

## 6. Existing RLS — do not weaken

Current importer/reviewer WITH CHECK excluding APPROVED+ on `staging_review_items` must remain. Decision apply that would set forbidden states must fail before write.
