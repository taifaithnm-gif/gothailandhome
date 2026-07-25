# Windows01 Staging Import Flow

**Status:** Staging-only operational flow.
**Contract status:** `WAITING_FOR_WINDOWS01_CONTRACT` (see [`WINDOWS01_DATA_IMPORT_CONTRACT.md`](WINDOWS01_DATA_IMPORT_CONTRACT.md))
**Code:** [`src/lib/integrations/windows01/`](../../src/lib/integrations/windows01/)
**Production:** Hard-blocked (`PRODUCTION_HARD_BLOCK` / `blocked-production` mode).

---

## 1. End-to-end pipeline

```
Results → Manifest → Schema → Safety → Dedup → Entity Match → Conflict
    → Human Review → Staging Import → Approval → Production Publish
```

| Stage | Who | Notes |
| --- | --- | --- |
| **Results** | Windows01 worker | Emits `windows01.results.v0` records; no forbidden worker states |
| **Manifest** | Windows01 worker | `windows01.manifest.v0`; `recordCount` matches package |
| **Schema** | Site validator | `validateManifest` / `validateRecord` |
| **Safety** | Site validator | URL allowlist, path traversal, payload size, evidence refs ⊆ manifest |
| **Dedup** | Site adapter | In-batch `recordId` / `contentHash` uniqueness |
| **Entity Match** | Site pipeline | Hints → candidate entities; may open conflict |
| **Conflict** | Site pipeline | `CONFLICT_DETECTED` → human review |
| **Human Review** | Human only | Quarantine triage; never auto-approve |
| **Staging Import** | Site adapter `mode: "staging"` | Persists staging-side accept; still not Production |
| **Approval** | Human only | `APPROVED_FOR_PUBLISH` |
| **Production Publish** | Human only | `PRODUCTION_PUBLISHED` — **out of scope / hard-blocked** while Production freeze and contract waiting |

Dry-run mode stops short of claiming staging persist and routes toward `AWAITING_HUMAN_REVIEW` in the adapter path.

---

## 2. Staging-only execution

Allowed now:

- `ImportMode = "dry-run" | "staging"`
- Preview/Development deploy env
- Synthetic or non-Production evidence packages

Forbidden now:

- Running import when `APP_DEPLOY_ENV` / deploy env resolves to `production`
- Using Production Supabase credentials for Windows01 ingest
- Worker self-transition into approve/publish states
- Skipping human review for Production publish

---

## 3. Production hard block

`StagingWindows01ImportAdapter.runImport`:

- If `mode === "blocked-production"` **or** `resolveDeployEnv() === "production"`:
  - Audit action: `production_import_hard_block`
  - Quarantine: `PRODUCTION_HARD_BLOCK`
  - `accepted: 0`

There is no silent fallback to staging when Production is detected.

---

## 4. Operator checklist (staging)

1. Confirm deploy env is Preview/Development and Supabase target is staging.
2. Receive batch package (manifest + results + evidence relative paths).
3. Run adapter validate / `runImport(..., "dry-run")` first.
4. Inspect quarantines; fix source data; do not loosen validators.
5. Run `runImport(..., "staging")` only after dry-run is clean enough for Owner.
6. Human review UI/process advances states per [`WINDOWS01_REVIEW_STATE_MACHINE.md`](WINDOWS01_REVIEW_STATE_MACHINE.md).
7. **Do not** execute Production publish while freeze / contract waiting.

---

## 5. Failure handling

| Symptom | Action |
| --- | --- |
| Schema/manifest errors | Quarantine batch; return to Windows01 |
| Safety failures | Quarantine; treat as hostile until proven otherwise |
| Dedup hits | Quarantine duplicates; investigate hash collisions |
| Entity conflicts | Human review; no auto-merge to Production |
| Production env detected | Hard block; abort |

---

## 6. Relationship to site Phase 2 freeze

Windows01 staging import experiments must not be confused with Phase 2 website cutover. Current site posture remains **FREEZE CURRENT PRODUCTION — NO CUTOVER** (RC `0eca210` / `v2.0.0-rc1`).
