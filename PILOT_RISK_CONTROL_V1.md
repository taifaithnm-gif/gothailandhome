# Pilot Risk Control V1

**Status:** Sprint 4 planning only  
**Purpose:** Freeze pilot risk controls for rollback, manual override, emergency stop, and audit

## Risk control principles

1. Fail closed on P0
2. Every publication path is reversible
3. Humans may stop or override; AI may not
4. Overrides are exceptional, logged, and time-bounded
5. Audit evidence is mandatory for every control action

## Control inventory

| Control | Purpose | Authority |
| --- | --- | --- |
| Rollback | Restore prior approved package/state | Operator / Owner |
| Manual override | Temporary exception under Owner authority | Owner (or Owner-designated) |
| Emergency stop | Immediate halt of collect/review/publish | Operator / Owner / security-equivalent |
| Audit | Reconstruct who did what, when, why, on what evidence | All actors; immutable logs |

## Rollback

Aligned with `ROLLBACK_WORKFLOW_V1.md` and `RUNTIME_BACKUP_STANDARD_V1.md`.

**Triggers:**

- Material inaccuracy after package approval
- Rights / privacy incident
- Hash/integrity failure
- Duplicate or contamination discovery
- Failed publish handoff
- Owner/Operator decision

**Requirements:**

- Prior package version always retained before any release
- Rollback restores exact prior package identity/hash
- Target restore ≤15 minutes for pilot package
- Both prior and rolled-back-from versions retained
- New incident / decision records created; no silent history rewrite
- Re-publish requires fresh human approval of a new package version

**Prohibited:**

- Destructive delete of prior package as the rollback method
- Rollback without audit record
- Automatic re-publish after rollback

## Manual override

Manual override is a controlled exception, not a quality waiver by default.

**Allowed only when:**

- Owner explicitly authorizes the override
- Scope, duration, affected records/packages, and residual risk are written
- Override does **not** authorize fabrication, rights violations, or secret exposure
- Override cannot permanently disable audit, rollback readiness, or emergency stop

**Typical legitimate uses (examples):**

- Temporary pause of intake while staffing is restored
- Temporary narrowing of project list below target without changing hard ceilings
- Explicit Owner HOLD that blocks an otherwise technically complete package

**Never overrideable without new Owner decision register entry:**

- 100% human review requirement
- Evidence retention / hash integrity
- No-fabrication rule
- Duplicate no-auto-merge for uncertain groups
- Freshness 30/90 bands for current claims
- Feature Freeze production publication ban
- Source/project/record hard ceilings

Every override must expire or be renewed with a new decision ID.

## Emergency stop

**Immediate stop conditions:**

- Rights / ToS / robots / privacy breach or credible uncertainty
- Credential or secret exposure
- Cross-project contamination
- Material incorrectness in a published or publish-ready package
- Integrity/hash failure at scale
- Unauthorized production write attempt
- Uncontrolled live collection outside approved manifest

**Stop actions:**

1. Halt Collect / Review progression / Publish handoff
2. Quarantine affected records/packages
3. Preserve evidence and logs
4. Open incident with severity and owner
5. Require Owner clearance before resume
6. Re-run affected acceptance tests before any new package approval

Emergency stop may be initiated by Operator or Owner without waiting for full committee review.

## Audit

Aligned with `REVIEW_AUDIT_LOG_STANDARD_V1.md` and `RUNTIME_LOGGING_STANDARD_V1.md`.

**Every risk-control action must log:**

| Field | Requirement |
| --- | --- |
| Action type | rollback / override / emergency_stop / resume / quarantine |
| Actor | Human identity; never AI as authority |
| Timestamp | UTC |
| Target | Record IDs / package IDs / batch IDs |
| Reason | Free-text mandatory |
| Evidence refs | Supporting evidence/incident IDs |
| Prior state | State before action |
| Result state | State after action |
| Expiry | Required for overrides |
| Correlation ID | Links related events |

**Audit thresholds:**

- 100% of approvals, denials, rollbacks, overrides, and emergency stops logged
- Reconstruction of source → evidence → decision → package → rollback must remain possible
- Audit logs are append-only; retention follows Owner/runtime standards

## Residual risk acceptance

Residual risks that remain accepted for planning:

- No live sources nominated yet (G1/G5 open)
- No Windows 01 runtime deployed (G4 open)
- Feature Freeze blocks production publication (G6 open)

These are controls by absence, not defects in this planning package.

## Escalation

```text
P0 detected
  -> quarantine + emergency stop if needed
  -> Owner notified
  -> incident logged
  -> correction / rollback / reject
  -> retest
  -> Owner resume authorization
```
