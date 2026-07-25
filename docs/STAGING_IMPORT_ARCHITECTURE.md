# Staging Import Architecture

**Milestone:** `STAGING_IMPORT_FRAMEWORK_V1`
**Code:** `src/lib/staging-import/`
**Mode:** Dry-run only — no Production DB writes, no Storage uploads, no commit, no true approval.

## Overview

```
Windows01 Export
    ↓
Batch (manifest + entities)
    ↓
Mac Import Session (staging-import)
    ↓
Validation → Normalize → Review Mapping → Duplicate Check → Preview
    ↓
Review Queue / Approval Candidates (not approved)
    ↓
Ready For Production  (future — not in V1)
```

V1 stops at **preview + READY_FOR_APPROVAL**. Commit and APPROVED+ states are blocked.

## Module map

| File | Role |
| --- | --- |
| `types.ts` | Shared contracts, flags, preview actions |
| `errors.ts` | Typed failures (commit/approval/storage blocked) |
| `approval-state.ts` | Review state machine |
| `approval-engine.ts` | Approval / reject / quarantine candidates |
| `staging-session.ts` | Import Session orchestrator |
| `batch-loader.ts` | Batch construction + perf mocks |
| `contract-validator.ts` | Manifest / batch contract |
| `validation-engine.ts` | Unified validation |
| `province-validator.ts` | Thailand provinces + aliases |
| `developer-validator.ts` | Developer UNKNOWN / DNS / evidence |
| `developer-import.ts` | Developer preview import |
| `project-import.ts` | Project preview import |
| `asset-import.ts` | Image preview import (mock storage path) |
| `pdf-import.ts` | PDF preview import |
| `news-import.ts` | News preview import |
| `duplicate-check.ts` | Unified duplicate engine |
| `review-mapper.ts` | Review queue mapping |
| `transaction.ts` | Dry-run transaction (no commit) |
| `audit.ts` | Append-only audit chain |
| `report.ts` | Preview dashboard |

## Hard flags

```ts
{
  dryRun: true,
  stagingOnly: true,
  productionWrite: false,
  databaseWrite: false,
  storageUpload: false,
  approval: false,
  publish: false,
  commitEnabled: false,
}
```

## Relationship to Windows01 adapter

`src/lib/integrations/windows01/` remains the Windows01 package / sealed-ZIP / Goth Batch adapter.
`src/lib/staging-import/` is the **site-side Import Session + Review + Approval candidate framework** that consumes normalized batch entities (including mocks) and never crosses into Production.

## CLI

```bash
npm run staging:import
npm run staging:preview
npm run staging:validate
npm run staging:report
```

All commands are dry-run only.
