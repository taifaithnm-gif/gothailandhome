# Runtime Logging Standard V1

**Status:** Logical logging standard only; no log service or files created

## Streams

| Stream | Purpose | Authority |
| --- | --- | --- |
| Operational | Component/job lifecycle and performance | Diagnostic |
| Error | Failures, retries, quarantine and recovery | Diagnostic/incident |
| Audit | Human/system/AI actions, decisions, transitions, publication/rollback | Authoritative append-only |
| Security | Access denial, secret-redaction, cross-project/personal-data concerns | Restricted incident |

Operational/error logs do not replace the immutable review audit log.

## Log levels

| Level | Use |
| --- | --- |
| `TRACE` | Disabled by default; temporary approved offline diagnostics only; never payload/secret |
| `DEBUG` | Development/offline fixture diagnostics; disabled in future pilot by default |
| `INFO` | Normal lifecycle, state and result events |
| `WARN` | Recoverable anomaly, freshness warning, retry, capacity threshold |
| `ERROR` | Failed operation, quarantine, dead-letter, component degradation |
| `CRITICAL` | Integrity, audit, security, backup/restore, production-boundary or data-loss risk requiring stop |

## Structured fields

Every event includes UTC time, level, component/version, runtime profile, config version, event type, job/request/object IDs and versions, stage, result, duration when applicable, retry count and error code. Audit events additionally follow `REVIEW_AUDIT_LOG_STANDARD_V1.md`.

Use references/hashes, not full payloads. Never log:

- credentials, environment-variable secret values or authentication headers;
- full evidence payloads/screenshots;
- uncontrolled personal data;
- arbitrary source response bodies;
- unrelated project paths/data.

## Rotation

- Rotate operational/error/security logs by approved size and age, whichever occurs first.
- Audit logs use immutable segmented files/objects with sequence, period, schema version and integrity hash.
- Rotation must be atomic; events cannot be lost or duplicated.
- Compression/encryption products and thresholds remain later implementation decisions.
- Disk thresholds alert before rotation/retention failure.

## Retention

- Exact durations require Human Owner approval with D-019/legal-hold/takedown policy.
- Until approved, no implementation may assume deletion.
- Evidence-linked audit decisions and publication/rollback events must remain available with retained object history.
- Debug/trace retention is shortest and only when explicitly enabled.
- Security/incident retention follows incident/legal policy.
- Expiry/deletion actions are audited and suspended by legal hold.

## Error logs

Every error includes stable code, severity, stage/field where applicable, retryability, correlation IDs, component/config versions, sanitized message, quarantine/dead-letter state and timestamp.

Minimum categories:

- scheduler/queue state;
- source/policy/access;
- evidence/hash/storage;
- parser/validation/freshness/duplicate;
- review identity/transition/audit;
- configuration/secret/network;
- capacity/health;
- backup/restore;
- publication/rollback boundary.

Errors are never silently dropped. P0/audit/integrity/security failures are `CRITICAL` and stop affected progression.

## Audit logs

- Append-only and version-specific.
- Distinguish `human`, `system` and `ai_assistant`.
- AI recommendation is never recorded as approval.
- Decision correction appends a linked event.
- Missing authoritative audit persistence blocks state transition, publication and rollback completion.
- Backup includes audit segments/manifests and integrity verification.

## Redaction and verification

- Apply allowlisted fields and redaction before persistence.
- Redaction failures produce a security event and quarantine affected output.
- Future tests must verify rotation, ordering, integrity, secret/payload canaries, restart recovery and audit reconstruction.
- Monitoring checks last event time, write/rotation status, error rate and disk use.

