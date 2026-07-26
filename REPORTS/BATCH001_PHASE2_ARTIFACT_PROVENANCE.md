# Batch001 Phase2 Artifact — Provenance

**Milestone:** `BUILD_BATCH001_PHASE2_COMMIT_ARTIFACT`  
**Artifact hash:** `9d31bf8b5bca…f723d562`

## Binding proof

The Phase2 artifact is a **deterministic derivation** of unmodified Batch001 + frozen Review Console output. It does **not** replace or re-seal the source Batch.

| Binding | Value |
| --- | --- |
| batchId | `BATCH-GTH-20260724-001` |
| jobId | `JOB-GTH-DISCOVERY-20260724-001` |
| sourceSealedDigest | `d709a72c2ff8…80ec6786` (unchanged pin) |
| externalManifestSha256 | `a01487fa7754…3ee4dfec` |
| internalManifestSha256 | `a01487fa7754…3ee4dfec` |
| sidecar file sha256 | `432ccae3dba3…f870f0aa` |
| sealed ZIP raw sha256 (observational only) | `302827de6ce4…5ef5480a` |
| Phase2 RPC SQL sha256 | `fd742d2c526c…9288fbe5` |
| Phase2 schema sha256 | (see `database/staging-rpc/commit-payload-phase2.schema.json`) |
| V1 commit payload sha256 (preserved) | `f60a4c9a8f69…bc85c43f` |
| generatorVersion | `build-batch-phase2-commit-artifact.v1` |
| contractVersion | `commit_staging_import_v1.phase2` |
| sourceGeneratedAt (frozen) | `2026-07-24T16:04:19Z` |
| phase2ArtifactHash | `9d31bf8b5bcaa76015396ef188fff0270e9ed59c7cb19697b6a6dddef723d562` |

## Review Console fingerprints

Embedded in `commit-payload.phase2.provenance.json` under `reviewConsoleFingerprints` (developers/projects/images/pdfs/news/review-items/conflicts/duplicates/ready-for-approval/summary).

## Absolute artifact path

`/Users/jun/AI-Workspace/Projects/GoThailandHome/ARTIFACTS/STAGING_COMMIT/BATCH-GTH-20260724-001/PHASE2/commit-payload.phase2.json`
