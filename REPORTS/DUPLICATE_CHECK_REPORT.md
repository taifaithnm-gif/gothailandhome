# DUPLICATE_CHECK_REPORT

**Date:** 2026-07-24T12:36:33.233Z
**Result:** PASS

## Keys checked

| Key | Action on hit |
| --- | --- |
| record_id | Skip |
| content_hash | Skip |
| source_url | Skip |
| project_name | Skip |
| developer + project (composite) | Skip |
| image_hash | Skip |
| pdf_hash | Skip |
| news_url | Skip |

## Hits this run

```json
[
  {
    "key": "source_url",
    "value": "https://example.com/projects/ashton-silom",
    "recordId": "mock-rec-001-dup",
    "priorRecordId": "mock-rec-001"
  }
]
```

## Quarantine (duplicate*)

```json
[
  {
    "batchId": "mock-batch-20260724",
    "recordId": "mock-rec-001-dup",
    "reason": "DUPLICATE_SOURCE_URL",
    "message": "Duplicate source_url=https://example.com/projects/ashton-silom (prior mock-rec-001); skipped",
    "at": "2026-07-24T12:36:33.233Z"
  }
]
```

## Policy

Duplicates are **Skipped** (quarantined). They are not imported and not auto-merged.
