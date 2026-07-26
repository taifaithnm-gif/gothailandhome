# Manual Review Data Model

**Milestone:** `MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`  
**Date:** 2026-07-26  
**Mode:** Design only — DDL draft **must not be executed** in this milestone

---

## 1. Design goals

- Persist structured human decisions separate from free-text `staging_review_items.decision`
- Support evidence, change diffs, audit replay, rollback reverse patches
- Single active decision per review item
- Immutable history; idempotent submit/apply/rollback
- No Approval / Publish / Production tables or columns

---

## 2. Table overview

| Table | Purpose |
| --- | --- |
| `staging_review_decisions` | Core decision records |
| `staging_review_decision_evidence` | Attached evidence refs |
| `staging_review_decision_changes` | Field-level before/after patches |
| `staging_review_decision_audit` | Append-only decision audit (complements `staging_audit_events`) |

Optional later: map `staging_review_items.decision` as denormalized pointer to latest applied decision id (read model only).

---

## 3. Field requirements (all decision tables)

Required conceptual fields (distributed across tables as noted):

| Field | Location |
| --- | --- |
| Primary key | All tables: `id UUID` |
| Foreign keys | decisions → review_item, session, optional conflict |
| Unique constraints | See §5 |
| `status` | decisions |
| `decision_type` / family + action | decisions |
| `target_type` / `target_id` | decisions |
| `review_item_id` | decisions |
| `conflict_id` | decisions (nullable) |
| `payload_before` / `payload_after` | decisions + changes |
| `reason` | decisions |
| `actor_id` / `actor_role` | decisions (create) + audit (each event) |
| `idempotency_key` | decisions |
| `created_at` / `submitted_at` / `applied_at` / `rolled_back_at` | decisions |

---

## 4. PostgreSQL DDL draft (DO NOT EXECUTE)

```sql
-- STAGING ONLY — DRAFT — DO NOT APPLY IN MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN
-- Future milestone: MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION

CREATE TABLE IF NOT EXISTS staging_review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_session_id TEXT NOT NULL
    REFERENCES staging_import_sessions(import_session_id),
  source_batch_id TEXT NOT NULL,
  review_item_id UUID NOT NULL
    REFERENCES staging_review_items(id),
  conflict_id UUID NULL
    REFERENCES staging_conflict_candidates(id),

  decision_family TEXT NOT NULL CHECK (decision_family IN (
    'DEVELOPER_CANONICAL_LINK',
    'PROJECT_PROVINCE',
    'IMAGE_FAILURE',
    'PDF_LINKAGE',
    'NEWS_METADATA'
  )),
  decision_action TEXT NOT NULL,
  -- validated in app against family allow-list

  target_type TEXT NOT NULL CHECK (target_type IN (
    'DEVELOPER','PROJECT','ASSET','PDF','NEWS','CONFLICT','REVIEW_ITEM'
  )),
  target_id TEXT NOT NULL,

  status TEXT NOT NULL CHECK (status IN (
    'DRAFT','SUBMITTED','APPLIED','REJECTED','ROLLED_BACK'
  )),
  risk_level TEXT NOT NULL CHECK (risk_level IN (
    'LOW','MEDIUM','HIGH','CRITICAL'
  )),

  payload_before JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload_after JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- province example payload keys:
  -- source_value, suggested_value, final_value, confidence, evidence_source

  reason TEXT,
  reject_reason TEXT,

  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  submitted_by TEXT,
  submitted_role TEXT,
  applied_by TEXT,
  applied_role TEXT,
  rolled_back_by TEXT,
  rolled_back_role TEXT,

  proposer_id TEXT,          -- dual-control
  approver_id TEXT,          -- apply actor; must ≠ proposer when required

  version INTEGER NOT NULL DEFAULT 1,
  review_item_version_at_apply INTEGER,

  idempotency_key TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  reverse_patch JSONB,       -- filled on apply for rollback
  rollback_of_decision_id UUID REFERENCES staging_review_decisions(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- Single active decision per review item
CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_decision_active_item
  ON staging_review_decisions (review_item_id)
  WHERE status IN ('DRAFT','SUBMITTED');

CREATE UNIQUE INDEX IF NOT EXISTS uq_staging_decision_idempotency
  ON staging_review_decisions (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_staging_decisions_batch_status
  ON staging_review_decisions (source_batch_id, status);

CREATE INDEX IF NOT EXISTS idx_staging_decisions_target
  ON staging_review_decisions (target_type, target_id);


CREATE TABLE IF NOT EXISTS staging_review_decision_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL
    REFERENCES staging_review_decisions(id),
  evidence_kind TEXT NOT NULL CHECK (evidence_kind IN (
    'URL','NOTE','HASH','SCREENSHOT_REF','SOURCE_PAYLOAD_PATH',
    'DNS_CHECK','OFFICIAL_SITE','MANUAL_UPLOAD_REF','OTHER'
  )),
  evidence_ref TEXT NOT NULL,
  evidence_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- immutable: no updated_at
  UNIQUE (decision_id, evidence_kind, evidence_ref)
);


CREATE TABLE IF NOT EXISTS staging_review_decision_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL
    REFERENCES staging_review_decisions(id),
  change_seq INTEGER NOT NULL,
  entity_table TEXT NOT NULL,
  entity_pk TEXT NOT NULL,
  field_name TEXT NOT NULL,
  value_before JSONB,
  value_after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (decision_id, change_seq),
  UNIQUE (decision_id, entity_table, entity_pk, field_name)
);


CREATE TABLE IF NOT EXISTS staging_review_decision_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL
    REFERENCES staging_review_decisions(id),
  review_item_id UUID NOT NULL,
  import_session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN (
    'SYSTEM','IMPORTER','REVIEWER','ADMIN'
  )),
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  previous_status TEXT,
  next_status TEXT,
  reason TEXT,
  payload_hash TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  -- append-only: no updated_at / deleted_at
);

CREATE INDEX IF NOT EXISTS idx_staging_decision_audit_decision
  ON staging_review_decision_audit (decision_id, created_at);
```

### Decision action allow-lists (enforced in service, not only CHECK)

```text
DEVELOPER_CANONICAL_LINK:
  LINK_EXISTING_CANONICAL | CREATE_NEW_CANONICAL_CANDIDATE |
  KEEP_UNKNOWN | REJECT_SOURCE_IDENTITY | DEFER

PROJECT_PROVINCE:
  ACCEPT_SOURCE_PROVINCE | OVERRIDE_PROVINCE | MARK_UNRESOLVED |
  REQUEST_MORE_EVIDENCE | DEFER

IMAGE_FAILURE:
  RETRY_FETCH | MANUAL_UPLOAD_REQUIRED | ACCEPT_NO_IMAGE |
  REJECT_ASSET | DEFER

PDF_LINKAGE:
  LINK_TO_EXISTING_PROJECT | KEEP_UNLINKED | REJECT_PDF |
  MOVE_TO_OTHER_BATCH | REQUEST_REVIEW | DEFER

NEWS_METADATA:
  SET_PUBLISHED_DATE | LINK_PROJECT | LINK_DEVELOPER |
  KEEP_UNLINKED | REJECT_NEWS | REQUEST_MORE_EVIDENCE | DEFER
```

---

## 5. Constraints & uniqueness

| Constraint | Purpose |
| --- | --- |
| `uq_staging_decision_active_item` | One active DRAFT/SUBMITTED per item |
| `uq_staging_decision_idempotency` | Prevent duplicate create/submit/apply replays |
| Evidence UNIQUE (decision, kind, ref) | Dedupe attachments |
| Changes UNIQUE per field | Deterministic reverse patch |
| FK to `staging_review_items` | Anchor queue |
| Optional FK to `staging_conflict_candidates` | Province conflict link |

---

## 6. Immutability

| Field / row | Rule |
| --- | --- |
| `idempotency_key`, `content_hash`, `payload_before` (after submit) | Immutable |
| `created_at`, evidence rows, change rows, audit rows | Immutable |
| `payload_after` | Mutable only in DRAFT; frozen on SUBMIT |
| `status` | Only via allowed transitions |
| `reverse_patch` | Written once on APPLY; immutable thereafter |
| `applied_at` / `rolled_back_at` / `rejected_at` | Set once |

Triggers (Phase A): reject UPDATE that mutates immutable columns; reject DELETE on audit/evidence/changes.

---

## 7. Allowed updates by status

| Status | Allowed updates |
| --- | --- |
| DRAFT | payload_after, reason, risk_level (recompute), evidence insert, version++ |
| SUBMITTED | status→APPLIED/REJECTED only; set applied_*/rejected_* |
| APPLIED | status→ROLLED_BACK only; set rolled_back_* |
| REJECTED / ROLLED_BACK | none |

---

## 8. Duplicate submit / concurrency

1. **Idempotency key:**  
   `sha256(batch_id | review_item_id | decision_family | decision_action | content_hash)`  
   Reuse existing staging idempotency style (no timestamps).

2. **Optimistic concurrency:** `version` on decision + `expectedVersion` on review_item at apply.

3. **Single transaction apply:**
   - Lock decision + review_item (+ entity row)
   - Validate status SUBMITTED
   - Dual-control check
   - Write changes + reverse_patch
   - Patch entity fields
   - Update review_item.review_state / notes / decision pointer / version
   - Insert decision_audit + staging_audit_events
   - Set decision APPLIED

4. Concurrent second apply with same key → idempotent return of first result.  
5. Concurrent different key while active exists → unique violation → `GTH_DECISION_ACTIVE_EXISTS`.

---

## 9. Rollback support

On APPLY, persist `reverse_patch` = exact inverse of `staging_review_decision_changes`.  
Rollback transaction:

1. Eligibility checks (see rollback plan)  
2. Apply reverse_patch to entities  
3. Restore review_item state from payload_before snapshot  
4. Mark decision ROLLED_BACK  
5. Append immutable audit  
6. Allow new DRAFT on item  

---

## 10. Audit replay

Replay inputs (sufficient for reconstruction):

- `staging_review_decision_audit` ordered by `created_at`
- `staging_review_decision_changes` ordered by `change_seq`
- `payload_before` / `payload_after` / `reverse_patch`
- Parent `staging_audit_events` with matching `metadata_json.decision_id`

No in-place mutation of audit rows; corrections are compensating events.

---

## 11. Province payload example (Project 36936)

```json
{
  "source_value": "กรุงเทพ",
  "suggested_value": "Chon Buri",
  "final_value": null,
  "confidence": "LOW",
  "conflict_reason": "PROVINCE_NAME_CONFLICT",
  "evidence_source": ["project_name_amata", "record_province"],
  "project_candidate_id": "36936"
}
```

After OVERRIDE apply, `final_value` set; mirrored in changes for `staging_projects.province`.

---

## 12. Relation to existing `decision` column

`staging_review_items.decision` (TEXT, currently null) remains for backward compatibility. Phase B may set it to applied `decision_id` or action summary. Structured truth lives in `staging_review_decisions`.

---

## 13. Non-goals this milestone

- Execute DDL  
- Alter existing CHECKs to add APPROVED+  
- Soft-delete decision history  
- Write production FKs as enforced constraints (canonical ids are opaque text until Approval)
