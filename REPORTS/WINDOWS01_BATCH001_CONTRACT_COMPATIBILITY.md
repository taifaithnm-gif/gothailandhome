# WINDOWS01_BATCH001_CONTRACT_COMPATIBILITY

**Date:** 2026-07-24T16:21:52.473013+00:00
**Result:** PASS (Goth → site dry-run compatibility layer)
**Windows01 schema:** `goth_batch_manifest.v1`
**Site v0:** still supported for mock packages; Goth v1 accepted via adapter layer without requiring Windows01 downgrade.

## Field mapping

| Field | Status | Windows01 | Site |
| --- | --- | --- | --- |
| `schema_version` | TRANSFORM_REQUIRED | `goth_batch_manifest.v1` | `windows01.manifest.v0 / windows01.results.v0` |
| `batch_id` | RENAMED | `batch_id` | `batchId` |
| `job_id` | OPTIONAL | `job_id` | `(not in v0 manifest; preserve as unsupported/extension)` |
| `record_id` | TRANSFORM_REQUIRED | `project_id / image_id / …` | `recordId` |
| `source_url` | DIRECT_MATCH | `source_url` | `sourceUrl` |
| `source_domain` | OPTIONAL | `source_domain` | `(entityHints / payload)` |
| `captured_at / discovered_at` | RENAMED | `captured_at | discovered_at | retrieved_at` | `timestamp` |
| `content_hash` | TRANSFORM_REQUIRED | `sha256 / evidence.sha256` | `contentHash` |
| `evidence` | TRANSFORM_REQUIRED | `evidence object / local_path` | `evidenceRefs[] + evidencePaths` |
| `review_status` | TRANSFORM_REQUIRED | `reason / province_resolution.status` | `Windows01ReviewState / EvidenceReviewStatus` |
| `developer_id` | TRANSFORM_REQUIRED | `developer_resolution.developer_id` | `entityHints.developer` |
| `project_id` | DIRECT_MATCH | `project_id` | `entityHints.project / payload` |
| `province` | DIRECT_MATCH | `province / province_resolution` | `entityHints.province` |
| `location_confidence` | RENAMED | `province_resolution.confidence` | `(payload)` |
| `linkage_status` | OPTIONAL | `linkage_status` | `(not in v0; preserve)` |
| `local_path` | TRANSFORM_REQUIRED | `local_path / file` | `evidencePaths relative refs` |
| `sha256` | RENAMED | `sha256` | `contentHash / evidence.imageHash|pdfHash` |
| `media_type` | TRANSFORM_REQUIRED | `format / doc_type` | `(payload)` |
| `failure classification` | OPTIONAL | `failures[].classification` | `(quarantine reason mapping)` |

Unknown fields preserved in `unsupported_fields.json` (not silently dropped).
