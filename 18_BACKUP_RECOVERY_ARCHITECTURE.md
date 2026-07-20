# 18 — Backup & Recovery Architecture

**Document ID:** `18_BACKUP_RECOVERY_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define backup and recovery for Control Plane packages/git, Serving Catalog, Supabase Storage, and Windows01 Work DB/MinIO — with honest RPO/RTO and removable-node wipe recovery.

## 2. Components

| Asset | Backup approach (logical) |
| --- | --- |
| Git packages/standards | Remote git remotes; tagged releases |
| Supabase Postgres | Provider PITR / scheduled dumps (ops) |
| Supabase Storage | Versioned/mirrored critical media |
| Windows01 Work DB | Scheduled dump off-box |
| MinIO evidence | Replication or periodic sync off-box |
| Publish/export artifacts | Hash-addressed retention |

## 3. Responsibilities

- Close false RPO claims (align with V2 P0 review themes).
- Ensure Control Plane can rebuild candidate ops without Windows01.
- Test restore drills before trusting Windows01 pilot data.

## 4. Data Flow

```text
Periodic backup jobs → off-box store → restore drill
Incident → declare scope → restore store → re-validate hashes → resume
```

## 5. Dependencies

- Storage Architecture; Security encryption
- Monitoring for backup job failures
- Windows01 P0 durability decisions (Object Lock vs erasure)

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Backup job fail | Alert P0; retry; pause risky waves |
| Corrupt dump | Fall back to prior generation; git packages |
| Windows01 total loss | Wipe/rebuild host; rehydrate jobs from Control manifests; evidence may be partial — republish from packages |

## 7. Security Considerations

- Encrypted backups at rest
- Access-controlled restore credentials
- No production secrets in backup docs/repos

## 8. Scalability

- Incremental backups for evidence blobs
- Retention tiers: hot 30d / warm 90d / cold 1y (policy-tunable)
- Prioritize Serving + git over raw evidence volume

## 9. Future Expansion

- Cross-region replication for Serving
- Formal game-day cadence

## 10. Windows01 Integration

Off-box backup mandatory before pilot trust; node is disposable; packages on Control Plane are recovery backbone for business content.

## 11. Cross References

- `RUNTIME_BACKUP_STANDARD_V1.md`, `V2_DECISION_REGISTER.md`
- `03_STORAGE_ARCHITECTURE.md`, `15_WINDOWS01_RUNTIME_ARCHITECTURE.md`, `19_MONITORING_ARCHITECTURE.md`
- M0 execution / M1 Windows01 contracts
