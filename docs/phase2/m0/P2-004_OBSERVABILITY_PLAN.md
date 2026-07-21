# P2-004 — Observability & Error Budget Plan

**Date:** 2026-07-21

---

## Metric domains

| Domain | Metrics (draft) | Alert draft |
| --- | --- | --- |
| Auth | `auth_sign_in_success`, `auth_sign_in_fail`, session errors | Fail rate > 5% / 15m |
| Account | saved_item upsert errors, saved_search CRUD errors | Error rate > 2% / 15m |
| Leads | create rate, ops update rate, SLA breach count | SLA breach > 10 / day |
| Notifications | outbox pending age, send fail rate | Pending age p95 > 15m |
| CRM | sync success/fail, dead-letter depth, lag seconds | Lag > 10m or DLQ > 0 for 30m |
| AI (future M7) | recommend latency p95, fallback rate | p95 > budget or fallback > 20% |
| Map (future M5) | bbox query p95, 429 rate | 429 spike |

## Error budget (draft)

- Phase 2 flagged features: 99% success on mutating APIs during beta.
- Phase 1 core journeys: no regression budget — treat regressions as P0.

## Validation

- Owner alert thresholds draft recorded: **YES** (finalize numbers at first enable)
