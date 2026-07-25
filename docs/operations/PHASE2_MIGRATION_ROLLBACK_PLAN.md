# Phase 2 Migration Rollback Plan

**Status:** Documentation only.
**Release posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**RC baseline:** `0eca210` / `v2.0.0-rc1`

Companion docs: [`PHASE2_MIGRATION_RUNBOOK.md`](PHASE2_MIGRATION_RUNBOOK.md), [`STAGING_POLICY.md`](STAGING_POLICY.md), [`PRODUCTION_RELEASE_POLICY.md`](PRODUCTION_RELEASE_POLICY.md).

---

## 1. Default rollback posture

**Prefer feature flags OFF and leave additive tables in place.**

Phase 2A/2B migrations are designed as **additive** schema (`create table if not exists`, extensions, indexes, RLS). The safe default when something fails in staging smoke is:

1. Set all `FEATURE_P2_*` and `NEXT_PUBLIC_FEATURE_P2_*` to `false` / unset in Preview (and local).
2. Optionally set `FEATURE_P2_AI_KILL_SWITCH=true` if AI surfaces were involved.
3. Redeploy Preview if public flags were baked into the client bundle.
4. **Leave** Phase 2 tables, indexes, and policies on the staging database.

This matches the rollback readiness table in [`REPORTS/PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md`](../../REPORTS/PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md).

---

## 2. No destructive down migrations as default

- Do **not** author or run `DROP TABLE` / reverse migrations as the standard rollback path.
- Destructive downs risk collateral damage to shared Phase 1 objects and make evidence harder to audit.
- If a bad migration left staging inconsistent, prefer **staging reset** (§3) over hand-written downs.

Exception: only if Owner explicitly authorizes a one-off destructive cleanup on **staging**, with the SQL reviewed and recorded. Still never as Production default.

---

## 3. Staging reset (allowed)

Staging holds synthetic data only ([`SUPABASE_STAGING_CREATION_CHECKLIST.md`](SUPABASE_STAGING_CREATION_CHECKLIST.md)). Therefore:

- Owner may reset/recreate the staging database or entire staging project without Production-grade change control.
- Re-apply Phase 1 (+ Phase 2 if needed) via [`PHASE2_MIGRATION_RUNBOOK.md`](PHASE2_MIGRATION_RUNBOOK.md).
- Re-seed synthetic fixtures; recreate Auth test users.
- Document the reset (timestamp, reason, project ref) in `REPORTS/`.

Staging reset is the preferred recovery when schema is badly mid-applied.

---

## 4. App / deploy rollback (staging)

- Redeploy prior Ready Preview from the last known-good commit, or push a revert to `main` (Preview target).
- No customer traffic risk on staging.
- Do not change Production Alias or Production Branch as part of a staging rollback drill.

---

## 5. Production rollback — not in scope this round

**Document only — do not execute Production Phase 2 rollback procedures in this milestone.**

Reasons:

- Production must remain frozen: RC `0eca210` / `v2.0.0-rc1` with all `FEATURE_P2_*` **OFF**.
- Phase 2 migrations must **not** be applied to Production this round; therefore there is nothing Phase-2-schema-specific to roll back on Production.
- If a future approved Production cutover applies Phase 2 SQL, rollback policy will still prefer: flags OFF → leave additive tables → Owner-approved data decisions. Destructive Production downs remain exceptional and separately authorized.

| Layer | Staging (this round) | Production (this round) |
| --- | --- | --- |
| Flags | Freely toggle OFF | Must stay OFF; no enablement |
| Schema | Leave additive **or** reset project | No Phase 2 apply → N/A |
| Deploy | Redeploy Preview / revert on `main` | Freeze; no cutover |
| Destructive SQL | Optional Owner-only staging cleanup | Out of scope |

---

## 6. Decision tree (staging)

```
Smoke / migrate failure?
  ├─ Flags were ON? → turn all FEATURE_P2_* OFF, redeploy if needed
  ├─ Tables OK, app broken? → leave tables; fix app/flags
  ├─ Tables inconsistent? → staging reset + re-apply runbook
  └─ Tempted to touch Production? → STOP (freeze / no cutover)
```

---

## 7. Evidence

When rollback or reset is used, record:

- Staging project ref (not secrets)
- Commit SHA
- Which flags were toggled
- Whether tables were left or staging was reset
- Explicit statement: Production unchanged
