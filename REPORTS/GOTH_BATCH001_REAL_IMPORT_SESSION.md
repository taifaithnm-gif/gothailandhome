# GOTH_BATCH001_REAL_IMPORT_SESSION

**Batch:** BATCH-GTH-20260724-001
**Job:** JOB-GTH-DISCOVERY-20260724-001
**Schema:** goth_batch_manifest.v1
**Mode:** DRY RUN

## Session outcome

| Gate | Result |
| --- | --- |
| Sealed ZIP validation | PASS |
| ImportSession | PASS |
| Phase | `blocked_commit` |
| Commit | throws `COMMIT_NOT_IMPLEMENTED` |
| Database writes | 0 |
| Storage uploads | 0 |

## Entity reception

| Entity | Count |
| --- | --- |
| Developers | 5 |
| Projects | 10 |
| Images | 9 |
| PDFs | 5 |
| News | 10 |
| Source review items | 38 |

## Preview actions (ImportSession)

| Action | Count |
| --- | --- |
| WOULD_CREATE | 24 |
| WOULD_UPDATE | 0 |
| WOULD_REVIEW | 15 |
| WOULD_REJECT | 0 |
| WOULD_DUPLICATE | 0 |
| WOULD_QUARANTINE | 0 |
| WOULD_SKIP_DUPLICATE | 0 |

WOULD_REVIEW = 5 UNKNOWN developers + 10 projects (unknown developer / low province confidence).

## Performance (latest local run)

| Metric | ms |
| --- | --- |
| zipVerify/adapter | ~124 |
| extraction | 0 (already extracted) |
| validation | ~3 |
| total | ~128 |
| peak memory estimate | ~12 MB |

## Output

`.work/imports/BATCH-GTH-20260724-001/adapter-output/`
