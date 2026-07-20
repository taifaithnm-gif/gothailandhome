# Runtime Directory Standard V1

**Status:** Logical structure only  
**Important:** No directory is created by this document. The physical Windows 01 root/path and ACLs require later verification and approval.

## Logical root

Use a single dedicated variable:

`RUNTIME_ROOT`

No component may infer or write outside this root except an separately approved backup destination. Production, ERP and unrelated-project paths are prohibited.

## Logical structure

```text
RUNTIME_ROOT/
  runtime/
    scheduler/
    queue/
    collector/
    parser/
    validation/
    review-queue/
    log-service/
    monitoring/
    backup/
  config/
    base/
    profiles/
    components/
    policies/
    schemas/
  data/
    queue/
    candidates/
    review/
    packages/
    state/
  evidence/
    raw/
    snapshots/
    manifests/
    rights/
    versions/
    quarantine/
  logs/
    operational/
    errors/
    audit/
    security/
  backups/
    manifests/
    staging/
    verification/
  reports/
    health/
    incidents/
    review/
    backup/
  temp/
    collector/
    parser/
    work/
```

## Directory rules

| Directory | Purpose | Persistence | Backup |
| --- | --- | --- | --- |
| `runtime/` | Future component installation/runtime metadata by component | Re-creatable except approved state | Version manifest/config; not transient binaries by default |
| `config/` | Non-secret versioned configuration, profiles, policies and schemas | Persistent | Required |
| `data/queue/` | Durable future job state | Persistent while unresolved/retained | Required |
| `data/candidates/` | Candidate/validation/version state | Persistent | Required |
| `data/review/` | Tasks, assignments, immutable decision references | Persistent | Required |
| `data/packages/` | Future immutable package manifests/versions | Persistent | Required before publication |
| `data/state/` | Component checkpoints/idempotency indices | Persistent | Required |
| `evidence/raw/` | Original permitted source payloads | Immutable/versioned | Required |
| `evidence/snapshots/` | Permitted screenshots/snapshots | Immutable/versioned | Required |
| `evidence/manifests/` | Evidence metadata, hashes and locations | Immutable/versioned | Required |
| `evidence/rights/` | Source approval/rights snapshot references | Immutable/versioned | Required |
| `evidence/versions/` | Evidence version indices | Append-only | Required |
| `evidence/quarantine/` | Isolated blocked artifacts/references | Restricted persistent | Required per policy |
| `logs/operational/` | Structured component operation | Rotated | Per retention |
| `logs/errors/` | Structured failures and diagnostics | Rotated/restricted | Required per incident policy |
| `logs/audit/` | Append-only authoritative audit events | Persistent/immutable | Required |
| `logs/security/` | Access/security/secret-redaction events | Restricted | Required |
| `backups/manifests/` | Backup inventories/hashes | Persistent | Required/exported |
| `backups/staging/` | Temporary local staging, not sole backup | Temporary | Excluded after verified transfer |
| `backups/verification/` | Restore/hash verification results | Persistent | Required |
| `reports/` | Human-readable health/incident/review/backup reports | Persistent by policy | Required where audit evidence |
| `temp/` | Bounded disposable work files | Temporary | Excluded |

## Naming

- IDs and filenames use stable lowercase ASCII identifiers, timestamps in UTC, and explicit versions.
- No source/project personal name is required in a path.
- Evidence filenames include evidence ID/version and content hash reference, not credentials or full source URLs.
- Logs include component and UTC period; audit events use immutable event IDs.
- Temporary files include job/request ID and are removed only after durable output confirmation.

## Access boundaries

- Dedicated future service identity writes only approved runtime paths.
- Evidence/audit/config/backup areas use stricter permissions than temporary/operational areas.
- Reviewer access is read-only to evidence plus scoped decision submission; no evidence mutation.
- Secrets are not stored under `RUNTIME_ROOT` in plaintext or Markdown.
- Backup destination is separate from `RUNTIME_ROOT`; `backups/staging/` is never the only copy.

## Lifecycle and removal

Future removal must pause scheduling, drain/freeze queue, export verified evidence/state/audit/config, verify backup/restore, revoke credentials, remove runtime components, and preserve retention-controlled data. `temp/` may be cleaned after durable-output verification; evidence/audit cannot be deleted merely because runtime is removed.

