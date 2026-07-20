# Runtime Configuration Standard V1

**Status:** Logical configuration standard only; no files, environment variables or secrets created

## Principles

- Configuration is versioned, validated, non-secret and environment-specific.
- Secrets are referenced, never committed or stored in Markdown/logs/evidence.
- Defaults fail closed.
- Production is not a V1 runtime profile.
- A configuration change requires validation, audit and rollback to prior approved version.

## Environment variables

Future environment variables are grouped by purpose; names are logical contracts, not installed values.

| Variable | Purpose | Secret | Rule |
| --- | --- | --- | --- |
| `GTH_RUNTIME_PROFILE` | Select approved profile | No | `offline-fixture`, `pilot-disabled`, or later `pilot-approved`; default disabled |
| `GTH_RUNTIME_ROOT` | Approved physical root | No | Must resolve to dedicated verified root |
| `GTH_COMPONENT_NAME` | Identify running component | No | One allowed component ID |
| `GTH_CONFIG_VERSION` | Active config snapshot | No | Required and immutable per job |
| `GTH_QUEUE_ENDPOINT_REF` | Local queue/state reference | No/Reference | No raw credential |
| `GTH_EVIDENCE_ROOT` | Logical evidence location | No | Must remain under approved root |
| `GTH_LOG_ROOT` | Logical log location | No | Must remain under approved root |
| `GTH_BACKUP_TARGET_REF` | Approved separate target reference | Reference | No secret value |
| `GTH_SECRET_STORE_REF` | Approved secret-store namespace/reference | Reference | Never secret itself |
| `GTH_MAX_SOURCES` | Pilot source cap | No | `2` |
| `GTH_MAX_PROJECTS` | Pilot project cap | No | `10` |
| `GTH_MAX_RECORDS` | Pilot record cap | No | `100` |
| `GTH_NETWORK_MODE` | Egress posture | No | Default `disabled`; future `allowlist` only |
| `GTH_OCR_ENABLED` | OCR feature gate | No | Always `false` for default V1 |
| `GTH_EMBEDDING_ENABLED` | Embedding feature gate | No | Always `false` for V1 |

Unknown variables do not silently enable features. Sensitive values use future approved environment injection or secret store, not config files.

## Secret management

- Use an approved OS/environment injection mechanism or secret store.
- Store only references in non-secret configuration.
- Scope each secret to one component/source and minimum permissions.
- Separate service, reviewer and backup credentials.
- Define owner, purpose, creation/rotation/revocation dates and incident process.
- Never expose values in Git, Markdown, command arguments, queue payloads, evidence, logs, reports, errors or backups without approved encryption.
- Startup fails if a required secret reference is absent/invalid; it never falls back to embedded credentials.
- No secret is created in Sprint 3.

## Configuration files

Logical configuration groups:

```text
config/base/runtime
config/profiles/<profile>
config/components/<component>
config/policies/source
config/policies/review
config/policies/freshness
config/policies/duplicate
config/policies/security
config/schemas/<contract-version>
```

Every config snapshot includes:

- config ID/version and content hash;
- profile and component;
- effective date/status;
- compatible contract/component versions;
- Owner approval reference where required;
- non-secret values only;
- prior-version/rollback reference.

Precedence is explicit: base -> approved profile -> approved component override. Ad hoc local override is prohibited outside an approved offline fixture profile.

## Runtime profiles

| Profile | Purpose | Network | Live source | Publication | Status |
| --- | --- | --- | --- | --- | --- |
| `offline-fixture` | Future local deterministic tests with synthetic/manual approved fixtures | Disabled | Prohibited | Prohibited | Architecture-defined only |
| `pilot-disabled` | Installed but all scheduling/work disabled | Disabled | Prohibited | Prohibited | Future safe default |
| `pilot-approved` | Future bounded pilot after G1–G5/G4 | Approved allowlist only | Approved manifest only | Prohibited by default | Not authorized |
| `production` | Not part of V1 | — | — | — | Prohibited |

No OCR or embedding profile exists.

## Validation and change control

- Validate schema, types, ranges, paths, caps, profile, component compatibility, secret references and prohibited flags.
- Reject caps above 2 sources/10 projects/100 records.
- Reject OCR/embedding enabled, production profile, unapproved network mode/path/target or embedded secret.
- Record config version in every job/output/log/audit event.
- Changing config creates a new snapshot; active jobs retain their original snapshot.
- Rollback restores a prior approved config version and records the event.

