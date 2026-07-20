# 19 — Monitoring Architecture

**Document ID:** `19_MONITORING_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define monitoring, alerting, and observability for Data Factory planes: job health, drift, queue depth, security events, and external dead-man requirements for Windows01.

## 2. Components

| Component | Role |
| --- | --- |
| Metrics | Job success/fail, queue age, drift counts, apply latency |
| Logs | Structured logs with job_id/batch_id |
| Traces (optional) | Cross-worker spans |
| Heartbeat | Windows01 liveness |
| External dead-man | Off-host check (P0 theme) |
| Alert router | Severity → Owner/Data Ops |
| Dashboards | CMS Quality Console feeds |

## 3. Responsibilities

- Detect stop-the-line conditions (critical drift, poison storms, backup fail).
- Measure reviewer backlog for backpressure.
- Avoid alert noise that trains operators to ignore P0s.

## 4. Data Flow

```text
Services → metrics/logs → collector → rules → alerts
Heartbeat miss → dead-man → escalate
Overnight audit → drift report → Quality Console
```

## 5. Dependencies

- Automation Architecture jobs
- Security Architecture for auth alerts
- Backup job monitoring
- Existing overnight audit concepts in factory pipelines (ops pattern)

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Metrics pipeline down | Local log retention; secondary ping |
| Alert channel down | Fallback channel (email/SMS policy) |
| False positive spike | Tune rules; keep P0 manual confirm |

## 7. Security Considerations

- No secrets in logs
- Access control on dashboards
- Tamper-evident audit separate from mutable metrics

## 8. Scalability

- Sampling for high-volume harvest logs
- Aggregate per-wave metrics
- Retention limits on raw logs

## 9. Future Expansion

- SLO dashboards for import success and review age
- Anomaly detection on harvest volumes

## 10. Windows01 Integration

Local Uptime/heartbeat plus **external** dead-man required before production-like reliance; metrics exported over Tailscale to Control Plane views.

## 11. Cross References

- `RUNTIME_MONITORING_STANDARD_V1.md`; V2 P0 dead-man
- `16_AUTOMATION_ARCHITECTURE.md`, `15_WINDOWS01_RUNTIME_ARCHITECTURE.md`, `18_BACKUP_RECOVERY_ARCHITECTURE.md`
- M0 `13_DATA_QUALITY_STANDARD.md` drift DQ-10
