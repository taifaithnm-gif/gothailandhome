# 15 — Windows01 Runtime Architecture

**Document ID:** `15_WINDOWS01_RUNTIME_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the **Windows01 Execution Plane** runtime structure for Data Factory workers: scheduler, queue, collectors, parsers, validators, evidence store, optional OCR/embed — as a removable pilot node. Supersedes fragmented reading of prior Windows01 docs for *Data Factory M2* planning; those docs remain design inputs until P0s close.

## 2. Components

| Component | Role |
| --- | --- |
| Host | Windows + WSL2 + Docker Compose (target) |
| Postgres + pgvector | Work DB + vectors |
| Redis | Queue/locks |
| MinIO | Evidence/objects |
| API + workers | Collect/parse/validate/OCR/embed |
| Scheduler | Crons + backpressure |
| Monitoring agents | Heartbeat + logs |
| Tailscale | Admin ingress only |

## 3. Responsibilities

- Execute M1 Windows01 Runtime Contract.
- Emit candidate packages + evidence refs to Control Plane.
- Enforce no pilot writes to production Supabase.
- Support wipe without destroying Mac mini control plane.

## 4. Data Flow

```text
Control job manifest → Scheduler → Queue → Worker
  → evidence MinIO + Work DB
  → candidate package export
  → Control Plane review/import
```

## 5. Dependencies

- G-WIN01 + V2 P0 closure (egress, dead-man, Tailscale, images, real RPO, durability model)
- Storage, Embedding, OCR, Automation, Security, Monitoring architectures
- Existing `WINDOWS01_*`, `RUNTIME_*`, `V2_DECISION_REGISTER.md` inputs

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Worker crash | Restart policy; job retry; DLQ |
| Host wipe/loss | Restore from off-box backup; packages re-pulled from Control git |
| Network isolation | Continue local queue; sync when Tailscale restores |
| Poison parse | Quarantine raw_item |

## 7. Security Considerations

- No public ports for factory services
- Secrets in local secret store
- Egress allowlist (P0)
- Least privilege between containers

## 8. Scalability

- Scale workers horizontally within host limits
- Multi-host later; pilot is single node
- Intake throttle vs reviewer capacity

## 9. Future Expansion

- Authorized apply path only after governance change
- GPU embed pool
- Second-site job namespaces

## 10. Windows01 Integration

This document *is* the Windows01 integration blueprint for M2. Control Plane remains source of standards, review, and Serving apply.

## 11. Cross References

- M1 `20_WINDOWS01_RUNTIME_CONTRACT.md`; M0 `20_DATA_FACTORY_EXECUTION_STANDARD.md`
- `12_OCR_PIPELINE_ARCHITECTURE.md`, `13_EMBEDDING_ARCHITECTURE.md`, `16_AUTOMATION_ARCHITECTURE.md`, `17_SECURITY_ARCHITECTURE.md`, `18_BACKUP_RECOVERY_ARCHITECTURE.md`, `19_MONITORING_ARCHITECTURE.md`
- Legacy inputs: `WINDOWS01_RUNTIME_ARCHITECTURE.md`, `RUNTIME_ARCHITECTURE_V1.md`
