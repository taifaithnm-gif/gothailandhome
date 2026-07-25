# SCHEMA_VALIDATION_REPORT

**Date:** 2026-07-24T12:36:33.233Z
**Result:** PASS

## Version check

Validated fields:

| Field | Gate |
| --- | --- |
| schema_version | Must match `windows01.manifest.v0` / `windows01.results.v0` |
| worker_version | Required on manifest |
| manifest | Object + integrity (`recordCount`) |
| hash / contentHash | Required (≥16 chars) |
| source_url | Optional; http(s) + SSRF blocklist |
| record_id | Required |
| content_hash | Required |
| timestamp | Required ISO |

Mismatch → **quarantine** (`UNSUPPORTED_SCHEMA` / `VERSION_MISMATCH` / `INVALID_MANIFEST`). Pipeline does not continue for that batch/record.

## Sample version check (positive)

```json
{
  "ok": true,
  "schemaVersion": "windows01.manifest.v0",
  "workerVersion": "windows01-worker.0.1.0-mock",
  "reasons": []
}
```

## Sample version check (negative)

```json
{
  "ok": false,
  "schemaVersion": "windows01.manifest.v999",
  "workerVersion": "",
  "reasons": [
    "schema_version mismatch: got windows01.manifest.v999, expected windows01.manifest.v0",
    "worker_version missing"
  ]
}
```

## Quarantine (schema-related)

```json
[]
```
