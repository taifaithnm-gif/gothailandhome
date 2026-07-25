# Windows01 Data Import Contract

**Status:** `WAITING_FOR_WINDOWS01_CONTRACT`
**Code source of truth:** [`src/lib/integrations/windows01/`](../../src/lib/integrations/windows01/)
**Release posture:** Staging-oriented adapters only; Production import hard-blocked in code.

This document describes the **site-side adapter contract**. Final `DATA_CONTRACT_V1` field freeze from the Windows01 machine is **not** complete. Until Windows01 ships a frozen contract, treat payloads as **v0** and expect additive revisions.

Constant in code: `WINDOWS01_CONTRACT_STATUS = "WAITING_FOR_WINDOWS01_CONTRACT"` (`types.ts`).

---

## 1. Supported schema versions (v0)

| Schema version | Role |
| --- | --- |
| `windows01.manifest.v0` | Batch manifest |
| `windows01.results.v0` | Per-record result payload |

Exported as `SUPPORTED_WINDOWS01_SCHEMA_VERSIONS` in `types.ts`. Unsupported versions → quarantine (`UNSUPPORTED_SCHEMA`).

---

## 2. Adapter interface

`Windows01ImportAdapter` (`types.ts` / implemented by `StagingWindows01ImportAdapter` in `adapter.ts`):

```ts
interface Windows01ImportAdapter {
  readonly supportedSchemas: readonly Windows01SchemaVersion[];
  validateManifest(manifest: unknown): Windows01ManifestV0;
  validateRecord(record: unknown): Windows01RecordV0;
  runImport(batch: Windows01BatchV0, mode: ImportMode): ImportAdapterResult;
}
```

Factory: `createWindows01ImportAdapter()` → staging adapter.

### Import modes

| Mode | Meaning |
| --- | --- |
| `dry-run` | Validate + advance review path to human-review wait; no claim of Production publish |
| `staging` | Staging import accept path |
| `blocked-production` | Hard block result |

If `resolveDeployEnv() === "production"` or mode is `blocked-production`, import returns **zero accepts** with quarantine reason `PRODUCTION_HARD_BLOCK`.

---

## 3. Manifest shape (`windows01.manifest.v0`)

Required fields (validated in `validate.ts`):

| Field | Rule |
| --- | --- |
| `schemaVersion` | Exactly `windows01.manifest.v0` |
| `batchId` | Non-empty string |
| `producedAt` | Non-empty string (ISO timestamp expected) |
| `sourceMachine` | Exactly `windows01` |
| `recordCount` | Number ≥ 0; max 5000 |
| `contentHash` | String length ≥ 16 |
| `evidencePaths` | String array; relative paths only (no traversal, no absolute, no URLs) |

Batch integrity: `records.length` must equal `manifest.recordCount`.

---

## 4. Record shape (`windows01.results.v0`)

| Field | Rule |
| --- | --- |
| `schemaVersion` | Exactly `windows01.results.v0` |
| `recordId` | Non-empty string |
| `contentHash` | String length ≥ 16 |
| `evidenceRefs` | Non-empty string array; each ref must appear in manifest `evidencePaths` |
| `sourceUrl` | Optional; http(s) only; private/metadata hosts rejected |
| `workerState` | Optional; must not be a forbidden publish state |
| `entityHints` | Optional object |
| `payload` | Object; JSON size ≤ 512 KiB |

---

## 5. Forbidden worker states

Workers must **never** emit these (case-checked in validation):

- `APPROVED`
- `VERIFIED_FACT`
- `PUBLISHED`
- `PRODUCTION_READY`

Code: `FORBIDDEN_WORKER_STATES` in `types.ts`. Violation → `FORBIDDEN_WORKER_STATE` quarantine.

Human/site pipeline owns approve/publish review states — see [`WINDOWS01_REVIEW_STATE_MACHINE.md`](WINDOWS01_REVIEW_STATE_MACHINE.md).

---

## 6. Validation gates (summary)

| Gate | Failure reason codes |
| --- | --- |
| Manifest object/schema | `INVALID_MANIFEST`, `UNSUPPORTED_SCHEMA` |
| Evidence paths | `PATH_TRAVERSAL`, `MISSING_EVIDENCE` |
| Source URL safety | `MALICIOUS_URL` |
| Payload size / batch size | `OVERSIZED_PAYLOAD` |
| Worker publish claims | `FORBIDDEN_WORKER_STATE` |
| In-batch dedup | `DUPLICATE_RECORD`, `DUPLICATE_HASH` |
| Deploy/mode | `PRODUCTION_HARD_BLOCK` |
| Review transition | `CONFLICT` / quarantine |

Audit events are append-only (`ImportAuditEvent` with `prevHash` / `eventHash`).

---

## 7. Quarantine reasons (enum)

`INVALID_MANIFEST` · `UNSUPPORTED_SCHEMA` · `MISSING_EVIDENCE` · `DUPLICATE_RECORD` · `DUPLICATE_HASH` · `MALICIOUS_URL` · `PATH_TRAVERSAL` · `OVERSIZED_PAYLOAD` · `FORBIDDEN_WORKER_STATE` · `PRODUCTION_HARD_BLOCK` · `CONFLICT` · `SAFETY_FAIL`

---

## 8. Waiting on Windows01

Until Windows01 delivers a frozen contract:

- [ ] Confirm field dictionary for `payload` / `entityHints`
- [ ] Confirm content-hash algorithm and canonicalization
- [ ] Confirm evidence package layout vs `evidencePaths`
- [ ] Version bump plan beyond `*.v0` (e.g. `windows01.manifest.v1`)
- [ ] Explicit non-goals: worker must not self-approve or self-publish

Mark remains **`WAITING_FOR_WINDOWS01_CONTRACT`** until that freeze is recorded in-repo and agreed with Owner.

---

## 9. Related docs

- [`WINDOWS01_STAGING_IMPORT_FLOW.md`](WINDOWS01_STAGING_IMPORT_FLOW.md)
- [`WINDOWS01_REVIEW_STATE_MACHINE.md`](WINDOWS01_REVIEW_STATE_MACHINE.md)
- Runtime architecture notes may exist at repo root (`WINDOWS01_RUNTIME_ARCHITECTURE.md`) — adapter behavior here wins for import gating.
