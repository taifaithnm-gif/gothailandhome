# Implementation Blocker Register

**Phase:** Implementation Preparation — Readiness Assessment  
**Date:** 2026-07-18  
**Scope:** Identify every blocker preventing Content Factory V1 implementation  
**Mode:** Assessment only; no code, deployment, live data, or document mutation of Sprint 0–4 packages

## Summary

| Severity | Count | Effect |
| --- | --- | --- |
| Critical (blocks any implementation start) | 8 | NO-GO |
| High (blocks Windows deploy / live collect) | 6 | NO-GO for G4/G5 |
| Medium (blocks publication / scale) | 4 | NO-GO for G6 |
| Informational (deferred by design) | 1 | Non-blocking for V1 scope |

**Overall implementation status:** **BLOCKED**

---

## Critical blockers

### IB-001 — Feature Freeze / Alpha RC production ban

| Field | Value |
| --- | --- |
| Description | Alpha RC Feature Freeze prohibits production website, release, database, schema, and live publication changes. Implementation that touches production remains unauthorized. |
| Current status | OPEN — freeze active |
| Required owner | Human Owner |
| Dependencies | Explicit freeze lift or scoped exception decision |
| Resolution steps | 1) Confirm freeze still active. 2) Decide whether non-production implementation may proceed under staging/local only. 3) Record written exception boundaries if any. 4) Keep production publication blocked until G6. |
| Acceptance criteria | Written Owner decision stating what may be built offline/staging vs what remains frozen |
| Risk level | Critical |

### IB-002 — G1 source approval incomplete

| Field | Value |
| --- | --- |
| Description | No live source is nominated or approved. Maximum 2 sources allowed; each requires completed source approval template and Owner G1 result. |
| Current status | OPEN — zero sources approved |
| Required owner | Human Owner (+ source rights reviewer) |
| Dependencies | `PROPERTY_SOURCE_STANDARD_V1.md`; source approval template; legal/compliance review |
| Resolution steps | 1) Nominate ≤2 candidate sources by type (prefer official developer / owner-authorized file). 2) Complete one approval form per source. 3) Pass mandatory rejection criteria. 4) Record G1 PASS/FAIL with conditions. |
| Acceptance criteria | 1–2 sources with G1 PASS; rights/method/evidence retention cleared; no prohibited access methods |
| Risk level | Critical |

### IB-003 — G2 Owner acceptance of data/evidence standards not closed

| Field | Value |
| --- | --- |
| Description | Sprint 1 standards are documented but Human Owner G2 acceptance is CONDITIONAL / not recorded as closed. Blocks authoritative use for parser mapping and ingestion acceptance. |
| Current status | OPEN — CONDITIONAL GO pending Owner sign-off |
| Required owner | Human Owner |
| Dependencies | Sprint 1 package (data, field dictionary, source, evidence, duplicate, freshness, adapter contract) |
| Resolution steps | 1) Owner reviews Sprint 1 package. 2) Accept as-is or return revisions. 3) Record G2 acceptance date and version set. |
| Acceptance criteria | Explicit G2 APPROVED for the exact Sprint 1 document set |
| Risk level | Critical |

### IB-004 — G3 technical boundary / product inventory unresolved

| Field | Value |
| --- | --- |
| Description | Runtime language, repository/service placement, scheduler, queue/state store, evidence store, monitoring, and backup products/versions are unselected. Sprint 3 defines logical architecture only. |
| Current status | OPEN — product-neutral planning only |
| Required owner | Human Owner (approves); Technical proposer (drafts CF3-01 inventory) |
| Dependencies | Sprint 3 runtime standards; Windows boundary; D-016–D-019 |
| Resolution steps | 1) Draft pinned component/version inventory. 2) Confirm single-host, non-Docker default unless separately approved. 3) Owner approves G3 inventory and isolation plan. |
| Acceptance criteria | Approved inventory with pinned versions, isolation proof plan, and clean-removal runbook outline |
| Risk level | Critical |

### IB-005 — G4 Windows 01 deployment readiness incomplete

| Field | Value |
| --- | --- |
| Description | Windows 01 path/ACLs, capacity, identity, network allowlist, secrets, backup/restore, health/removal tests are unverified. Deployment remains NO-GO. |
| Current status | OPEN — path proposed only (`D:\AI-Workspace\GoThailandHome-Data-Factory\`); not created/verified |
| Required owner | Human Owner; Windows Operator |
| Dependencies | G3 inventory; D-016–D-019; Windows deployment boundary |
| Resolution steps | See `WINDOWS01_DEPLOYMENT_PREREQUISITES.md` |
| Acceptance criteria | All G4 checklist items PASS with evidence; Feature Freeze permission for any host change |
| Risk level | Critical |

### IB-006 — G5 pilot manifest unsigned / no projects nominated

| Field | Value |
| --- | --- |
| Description | No Owner-approved pilot manifest exists. No projects named. Live collection cannot start. |
| Current status | OPEN — template only |
| Required owner | Human Owner |
| Dependencies | G1 sources; G2 standards; project list within 5–10 Bangkok new condominiums; ≤100 records |
| Resolution steps | 1) Nominate 5 (target) to ≤10 projects. 2) Bind to approved sources. 3) Complete manifest template. 4) Owner signs G5. |
| Acceptance criteria | Signed manifest with sources, projects, ceilings, hard stops, and review staffing references |
| Risk level | Critical |

### IB-007 — Named human roles unassigned

| Field | Value |
| --- | --- |
| Description | Intake/Fact/Duplicate reviewers, Publish Approver, Rollback Owner/executor/witness, and delegated Owner assignees are not named. 100% human review cannot be staffed. |
| Current status | OPEN — role classes defined; persons not assigned |
| Required owner | Human Owner |
| Dependencies | Sprint 2 role/permission standards; review SLA capacity |
| Resolution steps | 1) Assign named humans to each required role. 2) Record assignment dates and backup coverage. 3) Confirm no AI approval authority. |
| Acceptance criteria | Named assignees for all mandatory review and rollback roles before live review starts |
| Risk level | Critical |

### IB-008 — Adapter / collector / runtime implementation unauthorized

| Field | Value |
| --- | --- |
| Description | D-023 and Sprint gates authorize logical contracts only. No Owner authorization exists to write collectors, parsers, adapters, databases, or deploy runtime. |
| Current status | OPEN — implementation NO-GO across Sprints 0–4 |
| Required owner | Human Owner |
| Dependencies | Closure of IB-001 (scoped), IB-002–IB-007 as applicable to the requested workstream |
| Resolution steps | 1) Owner issues explicit implementation authorization scoped by workstream (offline fixtures vs Windows deploy vs live collect). 2) Bind authorization to gate evidence. 3) Prohibit production writes until G6 + freeze lift. |
| Acceptance criteria | Written implementation charter with allowed/disallowed actions and gate prerequisites |
| Risk level | Critical |

---

## High blockers

### IB-009 — Credential / secret handling unverified

| Field | Value |
| --- | --- |
| Description | D-018 requires env vars or approved secret store with rotation/revocation. Mechanism not selected or verified. |
| Current status | OPEN |
| Required owner | Human Owner; Windows Operator |
| Dependencies | G3/G4; no secrets in Git/logs/Markdown |
| Resolution steps | Select mechanism → prove injection → prove rotation/revocation → document runbook |
| Acceptance criteria | Verified secret path with rotation/revocation drill; zero secrets in repo |
| Risk level | High |

### IB-010 — Backup destination, retention, restore proof undefined

| Field | Value |
| --- | --- |
| Description | D-019 blocks G4/G6 until backup destination, retention period, legal-hold/takedown handling, and restore test are defined and proven. |
| Current status | OPEN |
| Required owner | Human Owner |
| Dependencies | Evidence/backup standards; Windows path isolation |
| Resolution steps | Choose destination → set retention → encrypt → run hash-verified restore drill → record result |
| Acceptance criteria | Restore proof with matching hashes; retention and takedown policy written |
| Risk level | High |

### IB-011 — Network egress allowlist undefined

| Field | Value |
| --- | --- |
| Description | No approved source endpoints, backup path, or monitoring path allowlist exists. Default-deny inbound is policy only. |
| Current status | OPEN |
| Required owner | Human Owner; Windows Operator |
| Dependencies | G1 source endpoints; backup destination; monitoring path |
| Resolution steps | Derive allowlist from approved sources + backup/monitoring → apply on Windows 01 → test deny of production/ERP |
| Acceptance criteria | Documented allowlist; verified block of production DB/website admin/ERP |
| Risk level | High |

### IB-012 — Evidence / audit retention duration unresolved

| Field | Value |
| --- | --- |
| Description | Evidence retention principle approved; exact duration and legal-hold/takedown handling remain conditional. |
| Current status | OPEN |
| Required owner | Human Owner (+ legal counsel if required) |
| Dependencies | D-008, D-019; source rights snapshots |
| Resolution steps | Set retention days → define legal hold → define takedown SLA → align backup retention |
| Acceptance criteria | Written retention/takedown policy accepted by Owner |
| Risk level | High |

### IB-013 — Review SLA / staffing capacity unknown

| Field | Value |
| --- | --- |
| Description | 100% manual review of 5–10 projects / ≤100 records requires capacity. SLA, expiry, escalation contact unset. |
| Current status | OPEN |
| Required owner | Human Owner; Review leads |
| Dependencies | IB-007 named roles; pilot sample size |
| Resolution steps | Estimate hours per record → assign capacity → set SLA/escalation → confirm before G5 |
| Acceptance criteria | Staffing plan covering 100% review with named backups |
| Risk level | High |

### IB-014 — Isolated non-production metadata store unselected

| Field | Value |
| --- | --- |
| Description | Runtime needs isolated non-production state store. Production DB changes are prohibited (D-022). Product not chosen. |
| Current status | OPEN |
| Required owner | Human Owner |
| Dependencies | G3; Feature Freeze; no production schema authority |
| Resolution steps | Propose isolated store → Owner approve → confirm zero production DB coupling |
| Acceptance criteria | Approved isolated store design with removal plan; no production migrations |
| Risk level | High |

---

## Medium blockers

### IB-015 — G6 publication gate incomplete

| Field | Value |
| --- | --- |
| Description | No reviewed records, package hash, citations, rollback rehearsal, or package approval exist. Production publication blocked. |
| Current status | OPEN |
| Required owner | Human Owner; Publish Approver; Rollback Owner |
| Dependencies | Successful pilot collect/review; Feature Freeze lift; IB-010 restore proof |
| Resolution steps | Complete package → rollback rehearsal ≤15 min → human package approval → Owner G6 |
| Acceptance criteria | G6 PASS with RG-01–RG-24 and rollback rehearsal evidence |
| Risk level | Medium (for publication; not required to start offline fixture work) |

### IB-016 — Physical Windows path not verified / not created

| Field | Value |
| --- | --- |
| Description | Proposed path `D:\AI-Workspace\GoThailandHome-Data-Factory\` is logical only. Must not be created until G4 authorizes. |
| Current status | OPEN — unverified |
| Required owner | Windows Operator; Human Owner |
| Dependencies | G4 authorization |
| Resolution steps | Verify parent AI workspace → create only after G4 → set ACLs → record proof |
| Acceptance criteria | Path exists with deny-by-default ACL evidence after authorization |
| Risk level | Medium |

### IB-017 — OCR justification path unused / unresolved per source

| Field | Value |
| --- | --- |
| Description | OCR is conditional (D-020). If a selected source is image-only, OCR + G4 justification is required; otherwise remains excluded. |
| Current status | OPEN — deferred until source selection |
| Required owner | Human Owner |
| Dependencies | G1 source format assessment |
| Resolution steps | Prefer text sources; if OCR needed, justify and pass G4; human-check every OCR value |
| Acceptance criteria | Either no OCR in pilot, or source-specific OCR approval with human verification rule |
| Risk level | Medium |

### IB-018 — GoThailandHome staging handoff contract unproven

| Field | Value |
| --- | --- |
| Description | Logical adapter contract exists; non-production handoff fixture and prior-version pointer not implemented or rehearsed. |
| Current status | OPEN |
| Required owner | Website owner / Human Owner |
| Dependencies | D-023; Feature Freeze; G6 for production |
| Resolution steps | Build staging/local fixture only after implementation charter → prove deterministic hash → rehearse rollback |
| Acceptance criteria | Staging handoff succeeds without production write |
| Risk level | Medium |

---

## Informational / deferred

### IB-019 — Embeddings deferred (D-021)

| Field | Value |
| --- | --- |
| Description | Embeddings/vector index deferred after V1. Deterministic duplicate keys are sufficient. |
| Current status | DEFERRED — non-blocking |
| Required owner | Human Owner (to reopen later) |
| Dependencies | Post-V1 evaluation |
| Resolution steps | Do not implement in V1 |
| Acceptance criteria | Confirmed absent from V1 inventory |
| Risk level | Informational |

---

## Gate mapping

| Gate | Blockers | Status |
| --- | --- | --- |
| G0 Planning | — | PASS (Sprints 0–4 planning complete) |
| G1 Source | IB-002, IB-011, IB-017 | OPEN |
| G2 Data/evidence | IB-003 | OPEN |
| G3 Technical boundary | IB-004, IB-014 | OPEN |
| G4 Windows 01 | IB-005, IB-009, IB-010, IB-011, IB-016 | OPEN |
| G5 Pilot manifest | IB-006, IB-007, IB-013 | OPEN |
| G6 Publication | IB-001, IB-015, IB-018 | OPEN |
| Implementation charter | IB-008 | OPEN |

## Recommended resolution order

1. Owner closes **IB-003 (G2)** and issues scoped **IB-008** charter for offline/fixture work only  
2. Nominate/approve sources **IB-002 (G1)**  
3. Assign roles/staffing **IB-007 / IB-013**  
4. Sign manifest **IB-006 (G5)**  
5. Approve inventory **IB-004 (G3)** then Windows prerequisites **IB-005 (G4)**  
6. Only then authorize live collect  
7. Hold **IB-015 (G6)** until package + freeze lift
