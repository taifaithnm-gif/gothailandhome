# 16 — Automation Architecture

**Document ID:** `16_AUTOMATION_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define **automation layers** (L0–L4) for Data Factory operations: what can run unattended, what requires humans, and how backpressure works. L4 autonomous publish remains forbidden.

## 2. Components

| Layer | Examples |
| --- | --- |
| L0 Manual | Package edits in CMS/git |
| L1 Assisted | Harvest scripts, validate, dry-run |
| L2 Scheduled | Drift, freshness, completeness, overnight audit |
| L3 Closed-loop | Auto-restage stale proposals; soft-match queues |
| L4 Autonomous publish | **Forbidden** |

Supporting: Scheduler, job registry, alert router, capacity governor.

## 3. Responsibilities

- Align to Master Plan automation roadmap and M0 execution standard.
- Pause intake when review queue exceeds threshold.
- Emit audit events for automated state proposals (not silent publishes).

## 4. Data Flow

```text
Scheduler → job → produce artifacts/proposals
  → notify reviewers/ops
  → human gate for apply/publish
  → metrics → capacity governor
```

## 5. Dependencies

- Import/Export pipelines; Monitoring; Windows01 scheduler
- Quality/Validation standards
- CMS notification surfaces

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Job timeout | Retry/DLQ; alert |
| Alert storm | Dedup; severity collapse |
| Governor misconfig | Fail safe = pause intake |

## 7. Security Considerations

- Scheduled jobs use least privilege
- No stored Owner publish credentials for cron
- Automation cannot hold `review.approve` capability

## 8. Scalability

- Per-wave concurrency limits
- Priority queues (freshness vs bulk harvest)
- Idempotent job keys

## 9. Future Expansion

- Adaptive throttles from measured reviewer throughput
- Multi-site schedulers with isolation

## 10. Windows01 Integration

Heavy L1–L2 collect jobs prefer Windows01 post G-WIN01; Control Plane keeps L2 drift against Supabase and all apply/publish automation triggers.

## 11. Cross References

- Master Plan §13; M0 `20_DATA_FACTORY_EXECUTION_STANDARD.md`
- `10_IMPORT_PIPELINE_ARCHITECTURE.md`, `15_WINDOWS01_RUNTIME_ARCHITECTURE.md`, `19_MONITORING_ARCHITECTURE.md`
