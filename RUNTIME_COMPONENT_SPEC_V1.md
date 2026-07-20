# Runtime Component Specification V1

**Status:** Logical component specifications only; no product or implementation selected

## 1. Scheduler

- **Purpose:** Trigger only approved manual/bounded jobs at approved times.
- **Inputs:** Versioned schedule/job definition, source/manifest IDs, runtime profile.
- **Outputs:** Queue job reference and schedule audit event.
- **Dependencies:** Approved configuration, Queue health, system clock.
- **Configuration:** Enabled jobs, trigger time, concurrency `1` by default, pause flag; no arbitrary commands.
- **Health Check:** Scheduler process/OS trigger available; last/next run and missed-run state.
- **Failure Handling:** Do not create partial duplicate job; log/alert missed or invalid trigger.
- **Restart Strategy:** Restart safely; reconcile idempotency key before re-enqueue; remain paused if state uncertain.
- **Logging:** Trigger, job ID, config version, result, duration and error code; no secrets.
- **Backup:** Schedule definitions/configuration and last-known state; no executable/runtime binaries as authoritative data.

## 2. Queue

- **Purpose:** Preserve bounded job/stage state and safe retry ordering.
- **Inputs:** Versioned job envelope with request ID, source, payload/evidence references, stage, attempt and idempotency key.
- **Outputs:** Leased work item, completion/failure/dead-letter state.
- **Dependencies:** Isolated state store, clock, worker identity, Log Service.
- **Configuration:** Capacity <= pilot limits, lease timeout, future bounded retry count, dead-letter policy, pause/drain flags.
- **Health Check:** Queue readable/writable, depth, oldest age, leased/stuck/dead-letter counts.
- **Failure Handling:** Stop dispatch on state uncertainty; never discard; preserve last durable state and alert.
- **Restart Strategy:** Recover durable state, expire/reconcile leases, resume only after idempotency verification.
- **Logging:** Enqueue/lease/ack/fail/retry transitions with IDs and versions; payload references only.
- **Backup:** Durable queue metadata and unresolved job envelopes; restore must not duplicate acknowledged work.

## 3. Collector

- **Purpose:** In future, retrieve only a manifest-approved source/access point by its approved method.
- **Inputs:** Approved job, source approval/version, canonical access point, limits, idempotency key.
- **Outputs:** Raw evidence reference/hash, capture metadata, collection result/error.
- **Dependencies:** Queue, approved future network allowlist/credentials, Evidence Storage, Log Service.
- **Configuration:** Source-specific approved method, timeout/size/rate limits, content types; no discovery crawl.
- **Health Check:** Process readiness and synthetic offline fixture capability; live health check prohibited until source approval.
- **Failure Handling:** If evidence cannot be durably stored, fail/quarantine and do not invoke Parser; never bypass controls.
- **Restart Strategy:** Retry only explicitly retryable jobs with same idempotency key; changed payload is new version.
- **Logging:** Request/job/source IDs, approved endpoint identifier, timing, bytes, status/error; no credential or full payload.
- **Backup:** Collector config/version and collected evidence via Evidence Storage backup; transient transfer files excluded.

**Sprint 3 restriction:** Collector is architecture only. No implementation or live connection.

## 4. Parser

- **Purpose:** In future, transform verified evidence into versioned, citeable intermediate output.
- **Inputs:** Evidence ID/reference/hash, source/content type, parser/config version.
- **Outputs:** Parsed fields/sections, confidence/status, citeable locations, errors.
- **Dependencies:** Evidence Storage, Queue, source-format profile, Log Service.
- **Configuration:** Approved formats, size/time limits, parser version; OCR disabled.
- **Health Check:** Offline golden-fixture readiness and deterministic version response.
- **Failure Handling:** Malformed/unsupported/empty/low-confidence input becomes explicit failure/quarantine; no silent drop.
- **Restart Strategy:** Reprocess from immutable evidence using same version/idempotency key; append result, never overwrite.
- **Logging:** Input evidence/hash, parser version, output reference/hash, duration/status/errors; no full evidence dump.
- **Backup:** Parser config/version manifest and parsed output/state; original evidence backed up separately.

## 5. Validation Worker

- **Purpose:** Apply frozen data, evidence, freshness and duplicate rules deterministically.
- **Inputs:** Parsed output, original evidence references, field dictionary/rule versions, existing pilot identity keys.
- **Outputs:** Candidate record, per-rule validation, duplicate candidates, freshness state, errors.
- **Dependencies:** Queue, Evidence Storage, versioned standards/config, Log Service.
- **Configuration:** Pilot caps, Bangkok/new-condominium rules, field/null rules, price/currency invariants, duplicate/freshness versions.
- **Health Check:** Offline canary/golden rules produce expected deterministic result and version.
- **Failure Handling:** P0 failure blocks candidate approval; uncertain duplicate routes review; internal error quarantines.
- **Restart Strategy:** Re-run identical input/config idempotently to same canonical output hash; append attempt event.
- **Logging:** Rule IDs/versions, input/output hashes, pass/fail counts, duplicate/freshness outcomes, error codes.
- **Backup:** Rule/config versions, candidate/version state and validation results; all evidence references retained.

## 6. Review Queue

- **Purpose:** Route exact candidate/version tasks to assigned human roles without granting approval.
- **Inputs:** Candidate, validation/evidence/duplicate/freshness results, workflow/checklist versions, role assignments.
- **Outputs:** Review tasks, assignments, immutable human decisions and state transitions.
- **Dependencies:** Review standards, identity/role boundary, Audit Log, Evidence Storage.
- **Configuration:** Workflow transitions, mandatory checklist, role permissions, priority/SLA later approved.
- **Health Check:** Task create/read/assign/decision reference and transition-validation canary.
- **Failure Handling:** Preserve tasks/decisions; block transitions when audit, identity, evidence or state is uncertain.
- **Restart Strategy:** Restore durable tasks and assignments; reconcile decision IDs before reopening; never auto-decide.
- **Logging:** Task/assignment/open/completion, role, target version, transition and decision reference; no secret/evidence payload.
- **Backup:** Tasks, assignments, decisions, workflow/checklist/role versions and audit references.

## 7. Evidence Storage

- **Purpose:** Preserve immutable/retrievable source payloads/snapshots/references, manifests, hashes and versions.
- **Inputs:** Approved source artifact/reference, metadata, rights snapshot, content hash, citeable locations.
- **Outputs:** Stable evidence ID/version/reference and integrity verification result.
- **Dependencies:** Dedicated logical storage, least-privilege identity, capacity monitoring, Backup.
- **Configuration:** Logical paths, allowed types/sizes, append-only policy, integrity algorithm SHA-256, future retention policy.
- **Health Check:** Write/read/re-hash canary, capacity threshold and access-denial check.
- **Failure Handling:** Stop downstream parsing/review; quarantine mismatch; preserve incident/audit evidence.
- **Restart Strategy:** Mount/open read-only first, verify manifests/hashes, then enable approved writes.
- **Logging:** Evidence IDs, hashes, size/type, operation/result; never duplicate full payload in logs.
- **Backup:** Required: evidence, manifests, rights snapshots, version indices and integrity inventory; clean restore proof.

## 8. Log Service

- **Purpose:** Store structured operational/error logs and route authoritative audit events without mixing payloads/secrets.
- **Inputs:** Component events with timestamp, component, level, job/request/object/version IDs, status/error.
- **Outputs:** Rotated searchable logs, error stream and alert signals.
- **Dependencies:** Dedicated logical log storage, clock, configuration, Monitoring.
- **Configuration:** Levels, schemas, redaction, rotation, retention, size limits and audit separation.
- **Health Check:** Write/read/rotate/redaction canary and disk threshold.
- **Failure Handling:** Alert; block authoritative transitions if required audit event cannot persist; buffer only within approved bound.
- **Restart Strategy:** Reopen active segment safely, verify sequence/rotation and flush bounded buffer without duplication.
- **Logging:** Service self-events and redaction failures; never recursively copy full logs.
- **Backup:** Configuration and required audit/error logs per retention policy; routine debug logs only if approved.

## 9. Monitoring

- **Purpose:** Observe component health, queue/runtime state, storage, failures and backup status.
- **Inputs:** Health endpoints/status files, queue metrics, storage usage, logs/alerts, backup verification.
- **Outputs:** Current health state, alerts, incident references and status report.
- **Dependencies:** All components, Log Service, clock, future approved alert channel.
- **Configuration:** Poll intervals, thresholds, alert routes, suppression/escalation rules; no public inbound requirement.
- **Health Check:** Monitoring self-heartbeat and synthetic alert delivery.
- **Failure Handling:** Runtime health becomes unknown; pause new work where blind operation risks evidence/state.
- **Restart Strategy:** Rebuild status from current component checks; do not infer missed success.
- **Logging:** Check name/result/time/latency, threshold transitions and alert acknowledgements.
- **Backup:** Monitoring configuration, threshold versions and incident/status history required for audit.

## 10. Backup

- **Purpose:** Protect evidence, state, decisions, configuration and required logs and prove recoverability.
- **Inputs:** Approved backup manifest covering evidence, queue/review state, versions, configuration, audit and logs.
- **Outputs:** Versioned backup set, inventory/hash, result and restore-verification report.
- **Dependencies:** Separate approved destination, credentials/identity, source components quiesce/snapshot procedure, Monitoring.
- **Configuration:** Daily incremental where applicable, pre-publication and pre-runtime-change backups, retention (Owner decision pending), encryption and scope.
- **Health Check:** Last success/age, destination availability/capacity and scheduled clean restore verification.
- **Failure Handling:** Alert and block deployment/publication readiness; preserve prior valid backup; no false success.
- **Restart Strategy:** Reconcile incomplete set, never mark partial complete, resume/new set under approved procedure.
- **Logging:** Backup ID, scope/config version, start/end, item counts/hashes, result/error and restore result; no secrets.
- **Backup:** Backup configuration/inventory must itself be exportable; backup sets require separate retention and integrity control.

