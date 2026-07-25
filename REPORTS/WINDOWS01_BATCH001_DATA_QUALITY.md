# WINDOWS01_BATCH001_DATA_QUALITY

**Date:** 2026-07-24T16:21:52.473013+00:00
**Note:** Quality issues map to WOULD_REVIEW / WOULD_SKIP_DUPLICATE — they do **not** fail sealed hash validation.

## Counts

| Entity | Received |
| --- | --- |
| Developers | 5 |
| Projects | 10 |
| Images | 9 |
| PDFs | 5 |
| News | 10 |
| Review items | 38 |

## Hash (BATCH_CONTRACT_V1)

| Gate | Result |
| --- | --- |
| sealed_zip_sha256 | PASS `d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786` |
| raw_zip_sha256 | observational `302827de6ce40c59b5c547d12b2321ebc91c17fbb3224dfaf50c078a5ef5480a` |
| Payload hashes | 27/27 |
| Meta LAX | manifests/SHA256SUMS.txt, manifests/batch_manifest.json, manifests/file_inventory.json |
| Inventory membership | True |
| SHA256SUMS membership | True |

## Quality findings (non-blocking for hash)

- Developers with `dev-unknown`: 5
- Site developer duplicate candidates: 3
- Projects with PROVINCE_LOW_CONFIDENCE: 6
- Independent image linkage PASS: 9/9
- PDF %PDF magic PASS: 5/5
