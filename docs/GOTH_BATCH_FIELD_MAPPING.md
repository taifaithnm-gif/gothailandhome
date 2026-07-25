# Goth Batch Field Mapping

Maps Windows01 Goth schema → site internal import entities.

| Goth field | Internal field | Notes |
| --- | --- | --- |
| `batch_id` | `manifest.batchId` | Required identity |
| `job_id` | `manifest.jobId` | Required identity |
| `schema_version` | `manifest.schemaVersion` | Must be `goth_batch_manifest.v1` |
| `developer_resolution.developer_id=dev-unknown` | `candidate-dev-{hash}` | Never reuse `dev-unknown` as PK |
| `name` / `slug` | `name` / `aliases` / `sourceId` | Provenance retained |
| `project_id` | `project.id` / `sourceId` | |
| `project_name` | `name` / `normalizedName` / `slugCandidate` | |
| `province` + `province_resolution` | `province` / `provinceConfidence` / `provinceConflict` | Thai aliases supported |
| `images_manifest[]` | `image` candidates | Local path only; no Storage |
| `pdfs_manifest[]` | `pdf` candidates | `%PDF` magic; category map |
| `doc_type=corporate` | `company_profile` | |
| `news[]` | `news` candidates | Never auto-publish |
| `review_queue[]` | review candidates | Automation ≤ READY_FOR_APPROVAL |

Every record retains:

- `source_record_id`
- `source_schema`
- `source_batch_id`
- `source_job_id`
- `source_url` / `source_domain`
- `captured_at`
- `raw_payload`
- `unsupported_fields`
- `evidence` / `confidence` / `review_reason`

Unsupported fields are listed — never silently dropped.
