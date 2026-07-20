# Runtime Monitoring Standard V1

**Status:** Logical monitoring standard only; no agent, endpoint, dashboard or alert channel created

## Monitoring objectives

- Detect component unavailability and stalled work.
- Prove queue/runtime/evidence/log/backup health.
- Stop blind or unsafe operation.
- Alert humans without granting monitoring any approval/publication authority.
- Keep all metrics isolated from production and unrelated projects.

## Health checks

| Component | Check | Healthy condition | Failure action |
| --- | --- | --- | --- |
| Scheduler | Heartbeat, last/next trigger, missed run | Enabled/paused state matches profile; no unexplained missed trigger | Alert; do not create catch-up duplicate |
| Queue | Read/write, depth, oldest age, leases, dead-letter | Durable and within approved thresholds | Pause dispatch if state uncertain |
| Collector | Process/offline fixture readiness | Ready; live connectivity not checked until approved | Disable jobs; alert |
| Parser | Offline golden-fixture/version canary | Deterministic expected result | Stop parser dispatch/quarantine |
| Validation Worker | Rule/version canary | Expected P0/freshness/duplicate results | Stop validation; alert |
| Review Queue | Task/assignment/transition canary | Durable tasks and valid state rules | Block transitions |
| Evidence Storage | Read/write/re-hash/capacity/ACL denial | Hash matches; sufficient capacity; unauthorized access denied | Stop downstream work; critical alert |
| Log Service | Write/read/rotate/redaction/last event | No loss, redaction pass, capacity safe | Block authoritative transitions if audit unavailable |
| Monitoring | Self-heartbeat and synthetic alert | Current checks and alert route healthy | Runtime health becomes unknown; pause new work |
| Backup | Last success, age, capacity, restore verification | Within approved schedule; latest restore proof valid | Block readiness/publication |

## Queue status

Track:

- queued, leased/running, completed, failed, retryable, dead-letter and quarantined counts;
- oldest queued/leased age;
- attempt counts;
- duplicate idempotency-key anomalies;
- jobs by component/stage and approved source;
- cap usage against <=2 sources, <=10 projects and <=100 records.

No threshold is silently tuned. Exact warning/critical times and retry counts require later Owner-approved implementation configuration.

## Runtime status

Overall states:

- `healthy`: all required checks pass;
- `degraded`: non-authoritative capability impaired but evidence/state safe;
- `paused`: no new jobs; state preserved;
- `unhealthy`: required component failed;
- `unknown`: monitoring/audit unavailable;
- `stopped`: intentionally stopped;
- `not_deployed`: current Sprint 3 state.

`unknown` and `unhealthy` prevent new collection/processing and cannot be interpreted as success.

## Storage usage

Monitor separately:

- evidence bytes/item/version counts;
- queue/review/state size;
- operational/error/audit/security log size and rotation status;
- backup staging and destination capacity;
- temporary work size/age;
- remaining free space and growth rate.

Warning and critical thresholds require capacity baseline before deployment. At critical level, stop intake before evidence/log integrity is threatened; never delete required evidence/audit automatically.

## Failure alerts

Required future alert classes:

- component/heartbeat failure;
- missed/stuck/duplicate/dead-letter job;
- evidence/hash mismatch or unavailable reference;
- parser/validation P0 failure spike;
- review backlog/invalid transition/missing audit event;
- stale/expired current price or availability;
- source approval/rights expiry;
- credential/personal-data/cross-project/network incident;
- storage/log rotation threshold;
- backup failure or stale restore verification;
- publication or rollback boundary event;
- monitoring self-failure.

Critical alerts require incident reference and human acknowledgement. Alert silence/suppression is versioned, time-bounded and audited.

## Monitoring data and security

- Metrics use IDs/counts/statuses, not full payloads or secrets.
- No public inbound monitoring endpoint is assumed.
- Read-only component access and least privilege.
- Monitoring cannot approve records, publication or rollback.
- Monitoring configuration and incident history are included in backup according to retention policy.

## Readiness verification

Before future G4 approval, demonstrate synthetic checks/alerts, restart recovery, queue reconciliation, evidence re-hash, log redaction/rotation, storage thresholds, backup/restore status and monitoring self-failure behavior. No verification is executed in Sprint 3.

