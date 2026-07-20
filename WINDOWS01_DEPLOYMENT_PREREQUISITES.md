# Windows 01 Deployment Prerequisites

**Phase:** Implementation Preparation — Readiness Assessment  
**Date:** 2026-07-18  
**Status:** Prerequisites definition only — **deployment NO-GO**  
**Authority:** D-016–D-019; `CONTENT_FACTORY_V1_WINDOWS01_DEPLOYMENT_BOUNDARY.md`; Sprint 3 runtime standards

## Purpose

Define what must already be true, what remains incomplete, the future deployment sequence, and hard stop conditions before Windows 01 may host the Content Factory V1 pilot runtime.

## Role reminder

Windows 01 is a dedicated, removable pilot execution node only. It is not the GoThailandHome web host, release machine, ERP host, general AI lab, or shared business server. Mac mini remains the control plane.

---

## Required infrastructure already completed (planning / governance)

These items are **complete as documentation only**. They do **not** constitute deployment readiness.

| ID | Completed item | Evidence |
| --- | --- | --- |
| W-DONE-01 | Pilot scope freeze (Bangkok; new condominiums; ≤2 sources; ≤10 projects; ≤100 records) | Owner Decision Register; Sprint 0–4 |
| W-DONE-02 | Windows role and exclusions defined | Windows deployment boundary |
| W-DONE-03 | Logical component inventory defined (scheduler, queue, collector, parser, validation, evidence, logs, monitoring, backup) | Sprint 3 runtime package |
| W-DONE-04 | Logical directory standard defined | `RUNTIME_DIRECTORY_STANDARD_V1.md` |
| W-DONE-05 | Proposed dedicated root path recorded | `D:\AI-Workspace\GoThailandHome-Data-Factory\` (not created) |
| W-DONE-06 | Credential principle recorded (env/secret store; never Git) | D-018 |
| W-DONE-07 | Backup/restore principle recorded | D-019; `RUNTIME_BACKUP_STANDARD_V1.md` |
| W-DONE-08 | OCR default-off; embeddings deferred | D-020; D-021 |
| W-DONE-09 | Production DB / website / Docker default exclusions | Sprint 0–3 gates |
| W-DONE-10 | Removal / rollback order defined at policy level | Windows boundary; rollback workflow |

**Completed for deployment itself:** none. No path created, no ACL verified, no runtime installed, no backup destination proven.

---

## Remaining prerequisites

### A. Authorization prerequisites

| ID | Prerequisite | Owner | Status |
| --- | --- | --- | --- |
| W-PRE-01 | Feature Freeze permission for any Windows host change | Human Owner | OPEN |
| W-PRE-02 | G3 approved pinned product/version inventory | Human Owner | OPEN |
| W-PRE-03 | Explicit G4 deployment authorization | Human Owner | OPEN |
| W-PRE-04 | G1 sources approved if egress to live sources required | Human Owner | OPEN |
| W-PRE-05 | Named Windows Operator and Rollback Owner | Human Owner | OPEN |

### B. Host and path prerequisites

| ID | Prerequisite | Status |
| --- | --- | --- |
| W-PRE-06 | Confirm Windows 01 OS supported and patched baseline | OPEN |
| W-PRE-07 | Confirm parent `D:\AI-Workspace\` exists and is dedicated AI workspace | OPEN |
| W-PRE-08 | Verify proposed Data-Factory path does not collide with other projects | OPEN |
| W-PRE-09 | Create root only after G4; set deny-by-default ACLs | NOT STARTED |
| W-PRE-10 | Separate subpaths: runtime, config, data, evidence, logs, backups, reports, temp | NOT STARTED |
| W-PRE-11 | Capacity baseline (disk for ≤100 records + versions + evidence; CPU/RAM for single-host jobs) | OPEN |

### C. Identity and secrets

| ID | Prerequisite | Status |
| --- | --- | --- |
| W-PRE-12 | Dedicated non-admin service identity | OPEN |
| W-PRE-13 | Human reviewer credentials separate from service identity | OPEN |
| W-PRE-14 | Secret injection mechanism selected and rotation/revocation tested | OPEN |
| W-PRE-15 | Proof that secrets are absent from Git, logs, and Markdown | OPEN |

### D. Network

| ID | Prerequisite | Status |
| --- | --- | --- |
| W-PRE-16 | Default-deny inbound confirmed | OPEN |
| W-PRE-17 | Egress allowlist: approved sources (≤2), backup target, DNS/time, optional monitoring only | OPEN |
| W-PRE-18 | Explicit block of ERP, production DB, website admin, unrelated LAN services | OPEN |

### E. Storage, backup, monitoring

| ID | Prerequisite | Status |
| --- | --- | --- |
| W-PRE-19 | Isolated non-production metadata store selected | OPEN |
| W-PRE-20 | Evidence store capacity + hash verify procedure | OPEN |
| W-PRE-21 | Separate backup destination + encryption | OPEN |
| W-PRE-22 | Retention / legal-hold / takedown policy written | OPEN |
| W-PRE-23 | Hash-verified restore drill PASS | OPEN |
| W-PRE-24 | Health checks + alert path + synthetic canary | OPEN |
| W-PRE-25 | Clean-removal runbook rehearsed (export → stop → revoke → remove → verify no production change) | OPEN |

### F. Explicitly not prerequisites for V1 (remain excluded)

- Docker / container orchestration (NO-GO unless separate Owner decision)
- OCR engine (unless source-specific D-020 + G4)
- Embeddings / vector index
- Production website hosting or CI/CD on Windows 01
- Broad crawler / discovery tooling

---

## Runtime deployment sequence (future — do not execute now)

Execute only after W-PRE-01–W-PRE-05 and all applicable B–E prerequisites PASS.

```text
1. Record G4 authorization and inventory versions
2. Verify host baseline and parent workspace
3. Create dedicated root + ACLs + service identity
4. Install pinned runtime only (no Docker unless separately approved)
5. Configure scheduler (manual trigger acceptable initially)
6. Configure isolated metadata/queue (if async) — localhost only
7. Configure evidence store + logging + redaction
8. Configure monitoring canaries and alert path
9. Configure backup schedule to separate destination
10. Run offline fixture smoke tests (no live sources)
11. Hash-verified backup/restore drill
12. Shutdown test + clean-removal dry run (or documented equivalent)
13. Only then: enable allowlisted egress for G1-approved sources
14. Only then: G5-authorized bounded collection jobs
15. Continuous: preserve evidence; never write production systems
```

Handoff of packages to Mac mini / staging remains a versioned artifact transfer — not shared write access to the website.

---

## Deployment stop conditions

**Do not start or immediately halt deployment if any of the following is true:**

1. Feature Freeze forbids the planned host change and no Owner exception exists  
2. G3 inventory or G4 authorization missing  
3. Path/ACL collision with ERP, website, or unrelated projects  
4. Service identity is admin or shared with other workloads  
5. Secrets would be stored in Git, logs, evidence payloads, or Markdown  
6. Backup destination missing or restore drill fails  
7. Network allowlist would permit production DB / website admin / ERP  
8. Docker/orchestration introduced without separate Owner approval  
9. OCR/embeddings introduced without required decisions  
10. Live source egress enabled before G1 + G5  
11. Any production system write detected or attempted  
12. Pilot-caused Windows instability, credential exposure, or cross-project contamination  
13. Capacity insufficient for evidence retention of the pilot ceiling  
14. Clean-removal procedure cannot be demonstrated  

On stop: freeze new changes, preserve logs/evidence, open incident, require Owner resume authorization.

---

## Current gate decision

| Decision | Result |
| --- | --- |
| Prerequisites documented | YES |
| Windows 01 deployment | **NO-GO** |
| Directory creation | **NO-GO** |
| Runtime install | **NO-GO** |
| Live egress | **NO-GO** |
