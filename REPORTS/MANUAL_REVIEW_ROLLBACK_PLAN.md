# Manual Review Rollback Plan

**Milestone:** `MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`  
**Date:** 2026-07-26  
**Mode:** Design only — not implemented  
**Scope:** Decision-level rollback (not import-session `rollback_staging_import_v1`)

---

## 1. Goals

- Exact reverse of an APPLIED decision within staging  
- Dry-run preview before destructive reverse  
- Immutable audit of rollback  
- Idempotent rollback requests  
- Partial failure prevention via single transaction  
- Clear list of decisions that **cannot** auto-rollback

---

## 2. Dry-run preview

`POST .../rollback` with `dryRun: true`:

1. Load decision (`status=APPLIED`) + `reverse_patch` + changes  
2. Simulate applying reverse_patch against current entity rows  
3. Detect drift (entity field ≠ value_after) → mark `conflict` in preview  
4. Return preview; append `DECISION_DRY_RUN_PREVIEW` audit only  
5. **No** status change, **no** entity writes

Preview payload:

```json
{
  "eligible": true,
  "windowOpen": true,
  "conflicts": [],
  "plannedChanges": [
    { "entityTable": "staging_projects", "fieldName": "province", "from": "Chon Buri", "to": "กรุงเทพ" }
  ],
  "reviewItemRestore": { "reviewState": "CONFLICT", "versionBump": 1 }
}
```

---

## 3. Exact reverse patch

On APPLY, system stores `reverse_patch`:

```json
{
  "changes": [
    {
      "entityTable": "staging_developers",
      "entityPk": "…",
      "fieldName": "canonical_developer_id",
      "setTo": null
    }
  ],
  "reviewItem": {
    "review_state": "REVIEW_REQUIRED",
    "decision": null
  }
}
```

Generated from `staging_review_decision_changes` (`value_after` → restore `value_before`).

---

## 4. Rollback eligibility

| Condition | Eligible? |
| --- | --- |
| status = APPLIED | Required |
| reverse_patch present | Required |
| Within rollback window | Required |
| No newer APPLIED decision on same target fields | Required |
| Entity values still match value_after (no drift) | Required for auto |
| Actor = REVIEW_ADMIN | Required |
| Decision family allows auto-rollback | See §8 |

---

## 5. Rollback window

| Parameter | Proposal |
| --- | --- |
| Default window | 72 hours after `applied_at` |
| Env override | `STAGING_DECISION_ROLLBACK_WINDOW_HOURS` |
| After window | Auto-rollback denied → manual compensation + audit note |
| CRITICAL decisions | May require shorter window (24h) or Admin + second confirmer |

---

## 6. Immutable audit record

Rollback always inserts:

- `staging_review_decision_audit` event `DECISION_ROLLED_BACK`  
- `staging_audit_events` with `payload_hash` of reverse_patch  
- Never deletes prior `DECISION_APPLIED` audit  

Decision row: `status=ROLLED_BACK`, `rolled_back_at`, `rolled_back_by` set once.

---

## 7. Conflict handling

| Conflict | Behavior |
| --- | --- |
| Field drift since apply | Fail auto-rollback; return conflicts; require manual compensation |
| New active DRAFT on item | Block rollback until draft cancelled/rejected |
| Concurrent rollback | Idempotency key → replay; version conflict → fail |
| Session soft-deleted | Prefer session rollback path; decision rollback may be ineligible |

---

## 8. Partial failure prevention

Single DB transaction:

1. Lock decision + review_item + entity rows  
2. Re-validate eligibility + no drift  
3. Apply reverse_patch  
4. Restore review_item overlay/state  
5. Mark ROLLED_BACK  
6. Write audits  

Any step fails → full transaction abort.

---

## 9. Rollback idempotency

Key: `sha256(rollback | decision_id | reverse_patch_hash)`  

Replay when already ROLLED_BACK → `200` with `replayed:true`, no second reverse apply.

---

## 10. Transaction rollback vs decision rollback

| Mechanism | Scope |
| --- | --- |
| SQL transaction abort | Failed apply/rollback attempt — no partial writes |
| Decision rollback | Compensating reverse of successful APPLY |
| Session `rollback_staging_import_v1` | Soft-delete all session entities — broader; does not delete audit; decisions become orphaned historically (document ineligibility) |

---

## 11. Non-auto-rollback decisions (manual compensation)

| Decision / action | Why |
| --- | --- |
| `MOVE_TO_OTHER_BATCH` (if side effects started) | Cross-session intent; may need ops re-file |
| `RETRY_FETCH` after external fetch ran | External side effect (future); compensate manually |
| `MANUAL_UPLOAD_REQUIRED` after upload exists | Storage object lifecycle separate |
| `CREATE_NEW_CANONICAL_CANDIDATE` if Approval later created production canonical | Production object — **never** auto-deleted from decision rollback |
| `LINK_EXISTING_CANONICAL` if downstream Approval consumed link | Stop at staging unlink only if still pre-Approval; else manual |
| Any decision past rollback window with drift | Manual field restore + audit note |
| Reject cascades that touched multiple entities partially in older buggy apply | Manual |

**Rule:** Decision rollback never writes Production and never deletes Storage objects.

---

## 12. Operator checklist

1. Dry-run rollback  
2. Inspect plannedChanges / conflicts  
3. Confirm window + role  
4. Execute rollback (`dryRun:false`)  
5. Verify entity values + review item PENDING/REOPENED  
6. File new decision if needed  
7. Export audit for report  

---

## 13. Relation to Batch001

No applied decisions exist today (0 decisions). Rollback design is preparatory; pilot (Phase E) must exercise dry-run + real rollback on synthetic then one LOW decision before HIGH.
