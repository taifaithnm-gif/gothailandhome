# Review Role Permission V1

**Status:** Sprint 2 frozen logical role policy; no identity/access implementation  
**Principle:** Least privilege, explicit assignment, human accountability

## Roles

| Role | May | May not |
| --- | --- | --- |
| Human Owner | Approve source/data/review/runtime/pilot gates; assign humans; approve/reject exact publication and rollback; stop pilot | Bypass P0, evidence, version, audit or rollback requirements |
| Intake Reviewer | Approve/reject/quarantine intake against source/scope/evidence checklist | Approve facts, publication or rollback unless separately assigned that role |
| Fact Reviewer | Verify exact fields/evidence/freshness; request changes; approve/reject fact stage | Invent values; approve source rights; publish |
| Duplicate Reviewer | Resolve duplicate groups by merge/keep/false-positive/needs-evidence | Auto-merge uncertainty; delete member evidence/history; publish |
| Publication Reviewer/Approver | Validate exact package/batch/hash and record `approve_publication`/reject | Approve incomplete/P0-failing package; release without separate authority; let AI approve |
| Rollback Approver | Verify trigger/prior state and record `approve_rollback` | Execute without verified prior state; erase failed/new versions |
| Rollback Executor | Execute a separately authorized rollback plan and record actions | Self-authorize rollback unless explicitly holding both roles and Owner permits it |
| Rollback Witness | Independently verify prior-state restoration/hash/result | Alter rollback result or approve on AI recommendation alone |
| Audit Reviewer | Read/reconcile audit completeness and report gaps | Modify audit events or approve content solely from logs |
| Technical Operator | Maintain future runtime, inspect failures, preserve evidence/logs under approved scope | Approve facts/publication; access unrelated projects; change production DB |
| AI Assistant | Recommend, compare, classify, flag, summarize, draft checklists/reasons, detect possible errors/duplicates | Act as human; approve/reject; change authoritative state; publish; approve/execute rollback; waive P0 |
| System Process | Validate deterministic rules, compute freshness/hash, route tasks, append attributable events | Grant human approval, silently mutate decisions/evidence, publish autonomously |

## Assignment rules

- Every human role assignment records person reference, role, scope, effective dates and assigning Human Owner.
- No human name is invented in Sprint 2.
- One person may hold multiple V1 roles only through explicit assignments; every action records the role used.
- Publication approval remains a distinct decision from fact/duplicate review even when the same assigned person performs both.
- Rollback approval, execution and witness are distinct actions. If staffing requires one person to hold more than one, the Human Owner must explicitly approve the exception and all actions remain separately logged.
- Role expiry/revocation immediately removes future authority; prior decisions remain historical.

## Permission matrix

Legend: `R` read, `D` draft/recommend, `A` authoritative decision, `X` execute future authorized action, `—` prohibited.

| Object/action | Owner | Intake | Fact | Duplicate | Publication | Rollback Approver | Executor | AI | System |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Source/evidence review | A | A | R | R | R | R | R | D | R |
| Fact stage decision | A | — | A | — | R | R | R | D | — |
| Duplicate resolution | A | — | R | A | R | R | R | D | — |
| Record state routing | A | A scoped | A scoped | A scoped | A scoped | R | R | D | X deterministic |
| Publication decision | A | — | — | — | A | R | R | D | — |
| Publication execution | Separately authorized | — | — | — | — unless separately authorized | — | — | — | — by default |
| Rollback decision | A | — | — | — | R | A | R | D | — |
| Rollback execution | Separately authorized | — | — | — | — | — | X | — | X only under approved plan |
| Audit append | A | X own actions | X own actions | X own actions | X own actions | X own actions | X own actions | X recommendation | X attributed |
| Audit mutation/delete | — | — | — | — | — | — | — | — | — |

## Human responsibilities

- inspect exact evidence and target version;
- complete checklist honestly;
- record reasons, conditions and timestamps;
- stop on P0 failure, uncertainty, rights/security issue or scope breach;
- never approve from AI output without source evidence;
- protect credentials/personal data;
- preserve versions and audit history.

## AI responsibilities

- clearly label recommendations;
- cite record/evidence IDs and uncertainty;
- never fabricate missing facts;
- escalate inconsistent, stale, unsupported, duplicate or risky content;
- avoid secrets/personal data;
- never claim or perform approval, publication or rollback authority.

## Enforcement tests

- Unauthorized role/action pairs are rejected and audited.
- AI/system actors cannot create human approval decisions.
- Expired/revoked assignments cannot act.
- Every authoritative action resolves to assignment, role, exact target/version and audit event.
- P0 requirements cannot be overridden by any role.

