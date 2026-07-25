# IMPORT_VALIDATION_REPORT

**Date:** 2026-07-24T12:36:33.233Z
**Contract status:** `WAITING_FOR_WINDOWS01_CONTRACT`
**Source:** `mock`
**Overall (this report):** PASS

## Scope

Windows01 → Mac mini data reception dry-run. Production frozen. No DB writes.

## Pipeline

```text
AI_SHARE → RESULTS → Manifest → Schema Validation → Review → Staging (workspace files)
```

## Workspace

| Path | Role |
| --- | --- |
| `documents/imports/` | Intake |
| `documents/review/` | Review + preview packages |
| `staging/import/` | Dry-run summaries |
| `staging/quarantine/` | Schema/dup rejects |
| `staging/archive/` | Archive |
| `logs/import/` | Run logs |

## Batches processed

- **mock-batch-20260724** (mock): accepted=3, quarantined=1, mode=dry-run

## Dry-run summaries

```json
[
  {
    "mode": "dry-run",
    "batchId": "mock-batch-20260724",
    "ranAt": "2026-07-24T12:36:33.233Z",
    "databaseWrites": 0,
    "productionChanged": false,
    "autoApproved": false,
    "totalRecords": 4,
    "schemaValid": 4,
    "schemaInvalid": 0,
    "duplicateSkipped": 1,
    "quarantined": 1,
    "reviewCardsPrepared": 3,
    "simulatedImportReady": 3,
    "simulatedImported": 3,
    "coveragePercent": 75,
    "nextStates": [
      {
        "recordId": "mock-rec-001",
        "state": "AWAITING_HUMAN_REVIEW"
      },
      {
        "recordId": "mock-rec-002",
        "state": "AWAITING_HUMAN_REVIEW"
      },
      {
        "recordId": "mock-rec-003",
        "state": "AWAITING_HUMAN_REVIEW"
      }
    ],
    "reviewStatuses": [
      {
        "recordId": "mock-rec-001",
        "status": "NEW"
      },
      {
        "recordId": "mock-rec-002",
        "status": "NEW"
      },
      {
        "recordId": "mock-rec-003",
        "status": "NEW"
      }
    ]
  }
]
```

## Output files

- reviewJson: `documents/review/mock-batch-20260724.review.json`
- previewJson: `documents/review/mock-batch-20260724.preview.json`
- stagingSummaryJson: `staging/import/mock-batch-20260724.dry-run-summary.json`
- quarantineJson: `staging/quarantine/mock-batch-20260724.quarantine.json`
- logFile: `logs/import/2026-07-24T12-36-33-233Z-mock-batch-20260724.log.json`

## Safety

| Check | Result |
| --- | --- |
| Database writes | **0** |
| Production changed | **NO** |
| Auto-approved | **NO** |
| Commit | NOT_CREATED |
| Push | NOT_EXECUTED |
| Deploy | NOT_EXECUTED |

## Required schema fields

- `schema_version`
- `worker_version`
- `manifest`
- `hash`
- `source_url`
- `record_id`
- `content_hash`
- `timestamp`
