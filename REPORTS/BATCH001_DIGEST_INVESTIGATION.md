# BATCH001_DIGEST_INVESTIGATION

**Date:** 2026-07-26  
**Batch:** BATCH-GTH-20260724-001  
**Milestone:** BATCH001_DIGEST_INVESTIGATION  
**Mode:** READ-ONLY (no fix / regenerate / overwrite / commit)

## Verdict

Reported `SEALED_DIGEST = FAIL` was a **procedural false FAIL**: prior milestone marked digest FAIL because commit preflight was **NOT_RUN** (blocked on Staging Secret Rotation). Cryptographic sealed digest verification on the local Batch001 artifacts is **PASS** — Stored Digest equals Current Digest.

## 1. Batch composition

### Authority sources (local work copy)

| Role | Path |
| --- | --- |
| Batch ZIP | `.work/imports/BATCH-GTH-20260724-001/source/BATCH-GTH-20260724-001.zip` (34,407,985 bytes) |
| Sidecar (stored sealed digest) | `.work/imports/BATCH-GTH-20260724-001/source/BATCH-GTH-20260724-001.sha256` |
| External manifest | `.work/imports/BATCH-GTH-20260724-001/source/BATCH-GTH-20260724-001.batch_manifest.json` |
| Extracted payload | `.work/imports/BATCH-GTH-20260724-001/extracted/` (30 members) |
| Commit payload | `.work/staging-db/BATCH-GTH-20260724-001/implementation/commit-payload.json` |
| Review candidates | `.work/imports/BATCH-GTH-20260724-001/adapter-output/review-candidates.json` |
| Review console | `.work/review-console/BATCH-GTH-20260724-001/` |

**Original AI_SHARE path** (`/Volumes/AI_SHARE/GOTHAILANDHOME/EXPORTS/…`) is **not mounted** on this host today. Investigation used the frozen local `.work/imports/.../source` copy (same sealed digest as historical reports).

### Metadata

| Field | Value |
| --- | --- |
| `batch_id` | `BATCH-GTH-20260724-001` |
| `job_id` | `JOB-GTH-DISCOVERY-20260724-001` |
| Manifest schema | `goth_batch_manifest.v1` |
| Export contract schema | `goth_export_contract.v1` |
| `generated_at` | `2026-07-24T16:04:19Z` |
| `status` | `READY_FOR_STAGING_REVIEW` |
| `file_count` | 30 |
| `zip_size` | `00000000000034407985` |

### ZIP members (30)

- `data/`: developers, failures, news, projects, review_queue  
- `export_contract.json`  
- `images/` × 9  
- `pdfs/` × 5  
- `manifests/`: batch_manifest, file_inventory, SHA256SUMS, images_*, pdfs_manifest  
- `reports/` × 4  

### Source hashes (authority)

| Digest type | Value |
| --- | --- |
| Sealed (contract authority) | `d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786` |
| Raw ZIP (observational only) | `302827de6ce40c59b5c547d12b2321ebc91c17fbb3224dfaf50c078a5ef5480a` |

## 2. Stored Digest vs Current Digest

| Label | Abbreviated | Full |
| --- | --- | --- |
| STORED_DIGEST (sidecar + external/internal `zip_sha256` + CLI default + commit-payload) | `d709a72c2ff8…80ec6786` | `d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786` |
| CURRENT_DIGEST (`verifySealedZip` on local ZIP) | `d709a72c2ff8…80ec6786` | `d709a72c2ff89bbdb3c24a7a64d5766a76cb754e1bdaba6f7e49d34680ec6786` |

**Equal:** YES

Official gates (this investigation, read-only):

| Gate | Result |
| --- | --- |
| `validateSealedZipContract` | PASS |
| `validateGothBatchHashes` | PASS |
| `validateGothBatchInput` | ok=true, sealedStatus=PASS |

## 3. File-level comparison (digest-changing?)

Payload / asset / report members vs inventory + SHA256SUMS: **all PASS** (27 strict files).

Three `LAX_HASH_PATHS` (BATCH_CONTRACT_V1 meta self-reference) show declared ≠ actual by design. They are **membership + bytes only** in hash validation and do **not** invalidate the sealed digest:

| Path | Result for sealed digest | SHA256 (declared in inventory/SUMS) | SHA256 (actual ZIP/extracted bytes) |
| --- | --- | --- | --- |
| `manifests/batch_manifest.json` | N/A (lax; digest still PASS) | `f0512351e7bd…e2b96565` | `a01487fa7754…23ee4dfec` |
| `manifests/file_inventory.json` | N/A (lax; digest still PASS) | `e7fbfe5c015b…dd0ed580` | `0208764abb27…597fe713` |
| `manifests/SHA256SUMS.txt` | N/A (lax; digest still PASS) | `0740b7f0f113…8daf1292` | `3abcda043496…af8e5871` |

**Files that changed the sealed digest:** NONE.

| Check | Result |
| --- | --- |
| Payload member digests vs inventory | PASS |
| Sealed digest vs sidecar / manifests | PASS |
| Schema / generated_at drift vs freeze baseline | PASS (unchanged) |

## 4. Classification (A–H)

| Code | Hypothesis | Finding |
| --- | --- | --- |
| A | Batch 文件被修改 | **NO** — payload members match; sealed digest unchanged |
| B | Manifest 被修改 (causing digest fail) | **NO** — manifest `zip_sha256` still matches sealed; lax self-hash mismatch is contract-normal |
| C | 生成时间参与 Hash 导致 FAIL | **NO** — `generated_at` frozen `2026-07-24T16:04:19Z`; sealed still matches |
| D | Schema Version 改变 | **NO** — still `goth_batch_manifest.v1` / `goth_export_contract.v1` |
| E | Freeze 后重新生成 Batch | **NO** — digests match Jul 24 dry-run / ZIP security audit baseline |
| F | Digest 校验程序 Bug | **NO** — verifier returns PASS and agrees with sidecar |
| G | 读取错误 Batch | **NO** — batch id / job id / expected identity match |
| H | 其它 | **YES** — prior `SEALED_DIGEST=FAIL` was assigned when preflight was skipped (`COMMIT_PREFLIGHT NOT_RUN`) due to secret-rotation pause ([prior run](4b7cc2f0-c084-4ab6-8277-eeef7537e90d)); not a cryptographic mismatch |

## DIGEST_ROOT_CAUSE mapping

Allowed enum has no `FALSE_FAIL_GATE_SKIPPED`. Closest allowed value:

**`UNKNOWN`** — reported FAIL is not explained by FILE/MANIFEST/SCHEMA/TIMESTAMP/WRONG_BATCH/HASH_BUG; root cause is **status mis-attribution from skipped preflight**.

## Evidence trail

1. `REPORTS/BATCH001_CONTROLLED_COMMIT_PREFLIGHT.md` — Commit preflight **NOT_RUN**; blocked on secret rotation.  
2. Prior agent final status set `COMMIT_PREFLIGHT=FAIL` and `SEALED_DIGEST=FAIL` without running sealed verification.  
3. This investigation recomputed sealed digest → equal to stored `d709a72c…6786`.  
4. Historical PASS baselines: `REPORTS/WINDOWS01_BATCH001_ZIP_SECURITY_AUDIT.md`, dry-run `hash_validation.json`.

## Recommended fix (do not execute in this milestone)

1. Do **not** regenerate Batch, overwrite sidecar, or rewrite digest.  
2. On next controlled-commit preflight (after unrelated gates allow), re-run sealed verification — expect **VERIFIED/PASS**.  
3. Treat prior `SEALED_DIGEST=FAIL` as **NOT_VERIFIED / SKIPPED**, not digest corruption.

## Safety

- Database: not modified  
- Migration / Bootstrap / Batch regenerate / Digest overwrite: not performed  
- Commit / Push / Deploy: not performed  
