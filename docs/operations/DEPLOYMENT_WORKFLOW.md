# Deployment Workflow

**Status:** Proposed — documentation only. No infrastructure, Vercel, GitHub, or Supabase configuration has been changed by this document.
**Companion documents:** [`PRODUCTION_RELEASE_POLICY.md`](PRODUCTION_RELEASE_POLICY.md) (governance/approval), [`STAGING_POLICY.md`](STAGING_POLICY.md) (staging environment detail)

---

## 1. Current deployment architecture

```
git push origin main
        │
        ▼
Vercel Git Integration (main = Production Branch)
        │
        ├──▶ Build ("next build", Turbopack)
        │
        ▼
Deployment created with target: production
        │
        ▼
Aliases auto-reassigned:
  www.gothailandhome.com
  gothailandhome.com
  gothailandhome.vercel.app
  gothailandhome-git-main-....vercel.app
        │
        ▼
LIVE — no human approval step in between
```

Confirmed facts (from live inspection, see `REPORTS/PHASE2_PRODUCTION_DRIFT_VERIFICATION.md`):

- Project: `gothailandhome` (`prj_pYDkz1oDZwjnmaP4iDixKvxo7TP4`), team `tai-faith-agri-platform-s-projects`.
- Production Branch = `main`. Every deployment in `vercel ls` with `target: production` corresponds 1:1 to a commit on `main` — there is no separate build-then-promote step visible in the deployment history.
- Preview deployments only exist when someone runs `vercel deploy` without `--prod`, or (not currently used) a PR is opened. They are **optional**, not a required gate.
- Preview URLs are behind Vercel Authentication/SSO (Deployment Protection) — unauthenticated `curl`/CI cannot exercise them. This makes Preview unusable as an automated pre-Production gate today.
- No `.github/workflows/`, no CODEOWNERS, no branch protection artifacts found in-repo — nothing outside Vercel's own dashboard settings currently constrains what reaches Production.
- Rollback today = manually finding a prior `READY` Production deployment via `vercel ls` / `vercel inspect` and re-promoting it; this works (verified: the pre-RC1 deployment `dpl_EaZ65FrS4o35zHWTdaDDSeQGRQKU` is still `READY`), but it is undocumented and untested as a drill.

## 2. Recommended deployment architecture

```
git push origin main  (day-to-day work)
        │
        ▼
Vercel Git Integration — Production Branch = "release" (renamed/repointed)
main  ──▶ Preview deployment only (protected, but reachable by the team/CI)
        │
        ▼
Staging validation (STAGING_POLICY.md): migrations, flag train, journey smoke
        │
        ▼
Owner approval recorded (PRODUCTION_RELEASE_POLICY.md §8)
        │
        ▼
Fast-forward / merge main → release  (the ONLY action that reaches Production)
        │
        ▼
Vercel Git Integration builds "release" ──▶ target: production
        │
        ▼
Aliases reassigned ──▶ LIVE
```

Key architectural change: **decouple "commit lands on the branch developers push to" from "commit reaches Production."** Two ways to achieve this with Vercel, in order of preference:

1. **Repoint Vercel's Production Branch** to a dedicated `release` (or `production`) branch. `main` keeps auto-deploying to Preview only. Promotion = a fast-forward merge or PR merge from `main` into `release`, done deliberately after staging sign-off.
2. If a single-branch model must be kept for other reasons, enable Vercel's **"Only build production deployments when manually triggered"** project setting (skip Git-triggered production builds) so pushes to `main` still auto-build Preview, but Production requires an explicit `vercel deploy --prod` / dashboard promotion by an approved operator.

Either option is a Vercel *setting/branch* change — not made by this task, and requiring the explicit infrastructure-update decision this document set is building toward.

## 3. Branch strategy

| Branch | Purpose | Vercel mapping | Merge rule |
| --- | --- | --- | --- |
| `main` | Day-to-day integration branch. All feature work lands here first. | Auto-deploys to **Preview** (with a stable branch alias for QA) | Direct push acceptable for solo/small-team velocity, but every push should still pass local typecheck/tests before pushing (existing `npm run typecheck` / `npm run test:*` scripts). |
| `release` (or `production`) | Exact mirror of what is live. Updated only by intentional promotion. | Vercel **Production Branch** | Fast-forward only from `main` at a specific, staging-validated commit. No direct commits. |
| `cursor/*` / feature branches (already in use, e.g. `cursor/data-factory-master-plan`) | Short-lived exploratory/agent work. | Preview only, on demand | Merge into `main` when ready; never targets `release` directly. |

Tags (`vX.Y.Z-rcN`, `vX.Y.Z`) continue to mark release candidates and shipped releases as they do today — but a tag is a **label for a commit under consideration**, not an instruction to deploy. Tagging a commit must not, by itself, touch `release`/Production.

## 4. Promotion strategy

1. Merge feature work into `main` → automatic Preview build.
2. Smoke-test the Preview build (per `STAGING_POLICY.md`) using an Owner-authenticated session or an approved Deployment Protection bypass — this closes the current SSO blocker.
3. Run the staging cutover (migrations against the **isolated staging DB**, then the feature-flag train) against that same Preview build.
4. On sign-off, promote by fast-forwarding/merging `main`'s validated commit into `release` (or, under the single-branch fallback, manually triggering the Production build from that exact commit).
5. Vercel's Git integration builds `release` and reassigns aliases — this is the only path that changes what `www.gothailandhome.com` serves.
6. Post-promotion smoke against the live domain (§9/§10 of `PRODUCTION_RELEASE_POLICY.md`).

No commit reaches Production by any path other than step 4–5. This directly closes the gap that caused the RC1 drift (a tag/push to `main` auto-reaching Production).

## 5. Migration strategy

Current state: manual, single-shot `node scripts/apply-migration.mjs <file>.sql` against whichever `POSTGRES_URL` is in scope; no tracking table; no `IF NOT EXISTS` guards in any of the 8 existing migration files; no environment separation (the only available Postgres credential is production-linked).

Recommended:

1. **Isolate environments first.** Staging Supabase project with its own `POSTGRES_URL`, wired only into Vercel's Preview/Staging environment (see `STAGING_POLICY.md §2`). Nothing below is safe without this.
2. **Track applied migrations.** Introduce a `schema_migrations(filename text primary key, applied_at timestamptz)` table (or adopt Supabase's own migration history if moving to `supabase db push`/CLI-managed migrations later); `apply-migration.mjs` should refuse to re-apply a filename already recorded, and record success after applying.
3. **Make migrations idempotent** going forward (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, guarded `DO $$ ... $$` blocks for constraints/indexes) so a re-run or partial-failure retry cannot double-apply or error out destructively.
4. **Order: staging before production, always.** A migration is only eligible to run against production after it has been applied to staging and the corresponding flag train has been smoke-tested there.
5. **Migrations are never a build step.** `next build` must never gain a migration side effect — deploy and schema change are independent, separately approved actions (per `PRODUCTION_RELEASE_POLICY.md §8`), so a redeploy/rollback of the app never implicitly touches schema.
6. **Additive-first.** Prefer new tables/columns over altering/dropping existing ones so that a flags-off rollback never leaves Phase 1 code pointing at a changed/missing column.

## 6. Rollback strategy

See `PRODUCTION_RELEASE_POLICY.md §6` for the decision policy. Mechanically:

- **App rollback:** `vercel ls` to find the last-known-good `READY` Production deployment (recorded at release time per the release checklist), then `vercel promote <deployment-url-or-id>` (or the dashboard's "Promote to Production"). No rebuild required — this was verified working-in-principle during drift verification (`dpl_EaZ65FrS4o35zHWTdaDDSeQGRQKU` remains `READY` and promotable).
- **Flag rollback:** flip the specific `FEATURE_P2_*` (and `NEXT_PUBLIC_` mirror) to `false` in the Production environment via `vercel env` (Owner-approved, per policy §8); redeploy only if the flag is read at build time rather than request time.
- **Data rollback:** forward-fix by default; destructive rollback only with Owner approval and a verified Supabase point-in-time-recovery/backup, executed as its own tracked migration (§5), never as an ad hoc `DROP`/`ALTER` outside the migration path.

## 7. Feature Flag strategy

Adopts `docs/phase2/m0/P2-003_FEATURE_FLAG_POLICY.md` unchanged as the technical contract (naming, defaults, fail-closed gating). This workflow document adds the process wrapper:

- Flags are enabled **only** against a Vercel environment (Preview/staging first, Production only after staging sign-off), never in application code defaults.
- Enabling a flag in Production is a promotion-equivalent event: it requires the same Owner approval and logging as a deployment (`PRODUCTION_RELEASE_POLICY.md §8`).
- The flag train (T1–T10, as already sequenced in `REPORTS/PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md`) is executed and smoke-tested one train at a time in staging before any train is repeated in Production.

## 8. Owner Approval process

See `PRODUCTION_RELEASE_POLICY.md §8` — this document's promotion steps (4) and migration steps (staging→production in §5) are the concrete actions that require the recorded approval described there.

## 9. Production checklist

See `PRODUCTION_RELEASE_POLICY.md §9`. Mechanically, "confirm deployed SHA" = `git rev-parse <tag>` compared against `vercel inspect <deployment> | grep -A2 "Meta"` / the API's `gitSource.sha`, the same method used in the drift verification.

## 10. Release checklist

See `PRODUCTION_RELEASE_POLICY.md §10`. This document supplies the exact CLI/dashboard steps referenced by that checklist's promotion and post-deploy-smoke items (§4 and §6 above).
