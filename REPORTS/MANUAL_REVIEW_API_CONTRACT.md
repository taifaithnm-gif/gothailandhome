# Manual Review API Contract

**Milestone:** `MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`  
**Date:** 2026-07-26  
**Mode:** Design only — **not implemented**  
**Prefix:** `/api/internal/review/...` (internal only; **must not** reuse public APIs)

Related legacy contract (state flips only, unimplemented mount):  
`/api/internal/staging/review/[candidateId]` PATCH — remains separate; Decision APIs are additive.

---

## 0. Shared conventions

| Aspect | Convention |
| --- | --- |
| Auth | Required session; no anonymous writes |
| Gate | `STAGING_REVIEWER_GATE_ENABLED` |
| Feature flag | `FEATURE_STAGING_REVIEW_DECISIONS` default false |
| Production | Disabled (`GTH_PRODUCTION_HARD_BLOCK`) |
| Idempotency | Header `Idempotency-Key` **or** body `idempotencyKey`; unique in DB |
| Optimistic concurrency | Body `expectedVersion` (decision) and/or `expectedReviewItemVersion` |
| Error shape | `{ name, code, message, details? }` with `GTH_DECISION_*` / existing `GTH_*` |
| Audit | Every mutation appends decision_audit + optionally `staging_audit_events` |
| Transaction | One DB transaction per apply/reject/rollback |

### Common error codes

| Code | Meaning |
| --- | --- |
| `GTH_REVIEW_AUTH_REQUIRED` | No auth |
| `GTH_DECISION_FORBIDDEN_ROLE` | Role matrix deny |
| `GTH_DECISION_GATE_DISABLED` | Reviewer gate off |
| `GTH_DECISION_NOT_FOUND` | Unknown id |
| `GTH_DECISION_INVALID_TRANSITION` | Bad status transition |
| `GTH_DECISION_ACTIVE_EXISTS` | Another DRAFT/SUBMITTED on item |
| `GTH_DECISION_VERSION_CONFLICT` | Stale decision version |
| `GTH_REVIEW_VERSION_CONFLICT` | Stale review item version |
| `GTH_DECISION_DUAL_CONTROL_REQUIRED` | Proposer = approver on HIGH/CRITICAL |
| `GTH_DECISION_VALIDATION_FAILED` | Payload/action invalid |
| `GTH_DECISION_ROLLBACK_INELIGIBLE` | Cannot auto-rollback |
| `GTH_DECISION_IDEMPOTENT_REPLAY` | Soft success on replay (or 200 with `replayed:true`) |
| `INVALID_REVIEW_STATE` / forbidden | Would set APPROVED+ |
| `GTH_PRODUCTION_HARD_BLOCK` | Production env |

---

## 1. `GET /api/internal/review/items`

**Role:** VIEWER+  
**Gate:** read allowed when gate on or read-only auditor path  
**Idempotency:** N/A  
**Transaction:** read-only

### Request

```
Query:
  batchId?: string
  status?: PENDING|IN_REVIEW|DECIDED|DEFERRED|REOPENED|CANCELLED
  reviewState?: string
  sourceReason?: string
  severity?: low|medium|high
  decisionFamily?: string
  q?: string
  page?: number
  pageSize?: number (max 100)
```

### Response `200`

```json
{
  "items": [{
    "id": "uuid",
    "entityType": "DEVELOPER",
    "entityId": "candidate-dev-…",
    "sourceReason": "UNKNOWN_DEVELOPER",
    "severity": "high",
    "reviewState": "REVIEW_REQUIRED",
    "blocking": true,
    "overlayStatus": "PENDING",
    "activeDecisionId": null,
    "confidence": "UNKNOWN",
    "relatedEntities": []
  }],
  "page": 1,
  "pageSize": 20,
  "total": 63
}
```

### Audit: none (read)

---

## 2. `GET /api/internal/review/items/:id`

**Role:** VIEWER+  
**Gate:** read  
**Transaction:** read-only

### Response `200`

Full review item + entity snapshot + conflict (if any) + decision history + evidence summary.

Must include: source/proposed/final values (from latest decision or entity), confidence, severity, blocking reason, related entities, evidence, decision history, actors, timestamps.

### Errors: `GTH_DECISION_NOT_FOUND` (or item not found code)

---

## 3. `POST /api/internal/review/items/:id/decisions`

**Role:** REVIEWER+  
**Gate:** required  
**Idempotency:** required  
**Optimistic concurrency:** `expectedReviewItemVersion`  
**Audit:** `DECISION_CREATED`  
**Transaction:** insert decision (+ optional evidence) only; **no entity mutate**

### Request

```json
{
  "idempotencyKey": "…",
  "expectedReviewItemVersion": 1,
  "decisionFamily": "DEVELOPER_CANONICAL_LINK",
  "decisionAction": "LINK_EXISTING_CANONICAL",
  "targetType": "DEVELOPER",
  "targetId": "candidate-dev-supalai",
  "conflictId": null,
  "payloadAfter": {
    "canonicalDeveloperId": "dev_…",
    "sourceValue": null,
    "suggestedValue": null,
    "finalValue": null
  },
  "reason": "Matches listed Supalai developer",
  "evidence": [{ "evidenceKind": "OFFICIAL_SITE", "evidenceRef": "https://…" }]
}
```

### Response `201`

```json
{
  "decision": {
    "id": "uuid",
    "status": "DRAFT",
    "version": 1,
    "riskLevel": "HIGH",
    "proposerId": "user_…",
    "createdAt": "…"
  },
  "replayed": false
}
```

### Errors: validation, active exists, version conflict, auth

---

## 4. `POST /api/internal/review/decisions/:id/submit`

**Role:** REVIEWER+ (owner or senior)  
**Gate:** required  
**Idempotency:** key scoped to `submit:{decisionId}`  
**Concurrency:** `expectedVersion`  
**Audit:** `DECISION_SUBMITTED`  
**Transaction:** DRAFT → SUBMITTED; freeze payload

### Request

```json
{
  "idempotencyKey": "…",
  "expectedVersion": 1,
  "reason": "optional amend"
}
```

### Response `200` — status `SUBMITTED`, `submittedAt` set

---

## 5. `POST /api/internal/review/decisions/:id/apply`

**Role:** per risk matrix; SENIOR+ for HIGH/CRITICAL  
**Gate:** required  
**Idempotency:** required  
**Concurrency:** decision `expectedVersion` + `expectedReviewItemVersion`  
**Dual-control:** enforced  
**Audit:** `DECISION_APPLIED`  
**Transaction boundary:** decision + changes + entity patch + review_item + audits — **atomic**

### Request

```json
{
  "idempotencyKey": "…",
  "expectedVersion": 2,
  "expectedReviewItemVersion": 3,
  "dryRun": false
}
```

### Response `200`

```json
{
  "decision": { "id": "…", "status": "APPLIED", "appliedAt": "…", "approverId": "…" },
  "changes": [{ "entityTable": "staging_developers", "fieldName": "canonical_developer_id", "valueBefore": null, "valueAfter": "dev_…" }],
  "reviewItem": { "id": "…", "reviewState": "READY_FOR_APPROVAL", "version": 4 },
  "dryRun": false,
  "replayed": false
}
```

If `dryRun:true`: compute changes, write `DECISION_DRY_RUN_PREVIEW` audit only, **no** entity writes, status stays SUBMITTED.

**Must not:** set APPROVED/PUBLISHED; upload storage; write production.

---

## 6. `POST /api/internal/review/decisions/:id/reject`

**Role:** SENIOR_REVIEWER+  
**Gate:** required  
**Idempotency:** yes  
**Concurrency:** `expectedVersion`  
**Audit:** `DECISION_REJECTED`  
**Transaction:** SUBMITTED → REJECTED; release active slot

### Request

```json
{
  "idempotencyKey": "…",
  "expectedVersion": 2,
  "rejectReason": "Insufficient evidence for canonical link"
}
```

---

## 7. `POST /api/internal/review/decisions/:id/rollback`

**Role:** REVIEW_ADMIN  
**Gate:** required  
**Idempotency:** yes  
**Concurrency:** yes  
**Audit:** `DECISION_ROLLED_BACK`  
**Transaction:** apply reverse_patch + status ROLLED_BACK + reopen item — atomic

### Request

```json
{
  "idempotencyKey": "…",
  "expectedVersion": 3,
  "dryRun": true,
  "reason": "Incorrect province override"
}
```

### Response includes `rollbackPreview` when dryRun

### Errors: `GTH_DECISION_ROLLBACK_INELIGIBLE`

---

## 8. `POST /api/internal/review/decisions/:id/evidence`

**Role:** REVIEWER+  
**Gate:** required  
**Idempotency:** yes (dedupe kind+ref)  
**Allowed when:** decision status DRAFT (V1); SUBMITTED may allow add-only if policy true  
**Audit:** `DECISION_EVIDENCE_ATTACHED`  
**Transaction:** insert evidence row only

### Request

```json
{
  "idempotencyKey": "…",
  "evidenceKind": "URL",
  "evidenceRef": "https://…",
  "evidenceJson": { "note": "Amata City Chonburi listing" }
}
```

---

## 9. `GET /api/internal/review/decisions/:id/audit`

**Role:** VIEWER+ / AUDITOR  
**Transaction:** read-only

### Response

Chronological `staging_review_decision_audit` (+ linked `staging_audit_events` ids).

---

## 10. Non-routes (explicitly out of scope)

| Route / action | Status |
| --- | --- |
| Approve / Ready for production / Publish | **Not defined** — blocked |
| Public `/api/*` decision endpoints | **Forbidden** |
| Storage upload API | **Out of scope** |
| Production canonical create API | **Out of scope** |

---

## 11. Mapping to Batch001 UI flows

| UI flow | Primary APIs |
| --- | --- |
| Developer Resolution | create → evidence → submit → apply (senior) |
| Province Resolution | create with source/suggested/final → submit → apply |
| Image / PDF / News | same pipeline; family-specific payload |
| Rollback Preview | rollback `dryRun:true` then confirm |
