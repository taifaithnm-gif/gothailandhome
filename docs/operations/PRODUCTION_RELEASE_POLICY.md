# Production Release Policy

**Status:** Proposed — documentation only. No infrastructure, Vercel, GitHub, or Supabase configuration has been changed by this document.
**Applies to:** GoThailandHome (`gothailandhome` Vercel project, `taifaithnm-gif/gothailandhome` GitHub repo)
**Companion documents:** [`DEPLOYMENT_WORKFLOW.md`](DEPLOYMENT_WORKFLOW.md) (mechanics), [`STAGING_POLICY.md`](STAGING_POLICY.md) (staging environment)
**Basis:** [`../../REPORTS/PHASE2_PRODUCTION_DRIFT_VERIFICATION.md`](../../REPORTS/PHASE2_PRODUCTION_DRIFT_VERIFICATION.md) — this policy exists because the RC1 release commit auto-deployed to Production via Vercel's Git integration when it was pushed to `main`, without an Owner decision gate.

---

## 1. Current deployment architecture

- **One branch, one environment mapping:** `main` is both the working branch and Vercel's configured Production Branch. There is no `staging`/`develop` branch and no required-review gate before merge (141 commits on `main`, zero merge commits — history is entirely direct pushes).
- **Vercel Git integration:** every push to `main` triggers an automatic build that deploys straight to **Production** and re-points `www.gothailandhome.com` / `gothailandhome.com` at the new deployment. There is no manual promotion step and no approval gate between "push" and "live."
- **Preview deployments** exist only when manually triggered (`npx vercel deploy --yes`, no `--prod`) or from a PR — but this repo has no PR workflow, so Preview is effectively an opt-in side channel, not a required gate before Production.
- **Preview Deployment Protection (Vercel SSO)** is on, which blocks unauthenticated smoke testing of Preview URLs — the tool that exists to de-risk Production changes cannot be exercised by automation or by anyone without a Vercel team login.
- **No isolated staging database.** The only non-production-labeled Postgres connection available is a local `.env.local` credential that is, in practice, the production Supabase instance — there is no environment where Phase 2 migrations or flag trains can be validated without touching production data.
- **Migrations are manual, ungated, and non-idempotent.** `scripts/apply-migration.mjs` runs a raw `.sql` file against whatever `POSTGRES_URL`/`POSTGRES_URL_NON_POOLING` is in scope, with no migration-tracking table and no `IF NOT EXISTS` guards in any of the 8 existing migration files. Nothing prevents a file from being applied twice, applied out of order, or applied against the wrong database.
- **Feature flags default off** and are read at runtime from environment variables (`src/lib/feature-flags/index.ts`); this part of the design is sound and is why the RC1 auto-deploy did not change user-visible behavior.

**Net effect:** the only thing standing between "someone commits Phase 2 code" and "Phase 2 code is live in Production" today is (a) feature flags happening to be off, and (b) nobody having applied the migrations by hand. Neither is a deployment-process control — both are just current, reversible facts.

## 2. Recommended deployment architecture

- Separate the **Production Branch** from the **default working branch**. Promotion to Production happens by an explicit, reviewable action (merge or fast-forward into a release branch), not by every commit to the branch developers push to daily.
- Make Preview the mandatory first stop for every change, with Deployment Protection either bypassed for an internal staging hostname or paired with an Owner-authenticated smoke step — Preview must be exercisable, or it isn't a gate.
- Stand up an **isolated staging Supabase project** (separate credentials, separate `POSTGRES_URL`) wired to Vercel's Preview environment only, so migrations and flag trains can be validated without any path to production data.
- Require migrations to be applied to staging, verified, and then applied to Production as a **distinct, logged, Owner-approved step** — never implicitly via deploy/build.
- Keep the feature-flag design (env-driven, default-off, per-domain) and add a formal enablement record (who, when, which flags, in which environment) so "flags are off" is an audited fact, not an inference from `vercel env ls`.
- Add branch protection / required status checks on GitHub so history can't silently gain direct-to-`main` commits once the new branch strategy is adopted.

Full mechanics: [`DEPLOYMENT_WORKFLOW.md`](DEPLOYMENT_WORKFLOW.md). Staging environment detail: [`STAGING_POLICY.md`](STAGING_POLICY.md).

## 3. Branch strategy

See [`DEPLOYMENT_WORKFLOW.md` §3](DEPLOYMENT_WORKFLOW.md#3-branch-strategy) for the full model. Summary: `main` becomes the integration branch (auto-deploys to **Preview/Staging**, not Production); `release/*` or a protected `production` branch — updated only by an explicit, Owner-approved promotion — is the sole branch wired to Vercel's Production target.

## 4. Promotion strategy

See [`DEPLOYMENT_WORKFLOW.md` §4](DEPLOYMENT_WORKFLOW.md#4-promotion-strategy). Summary: commit → Preview (automatic) → Staging validation (flags, migrations, journeys) → Owner sign-off → promotion to the production branch → Production (automatic from that branch only). No step skips the one before it.

## 5. Migration strategy

See [`DEPLOYMENT_WORKFLOW.md` §5](DEPLOYMENT_WORKFLOW.md#5-migration-strategy). Summary: migrations are additive-first, applied to staging before production, tracked in a `schema_migrations` table, and always a separate, logged action from the app deployment — never a build-time side effect.

## 6. Rollback strategy

Two independent rollback axes, because Vercel and Supabase fail independently:

| Layer | Rollback mechanism | Trigger |
| --- | --- | --- |
| **Application (Vercel)** | Re-promote the last known-good Production deployment (`vercel promote <deployment>` / dashboard "Promote to Production" on a prior `READY` deployment) or revert the production branch and let CI redeploy. No rebuild needed — Vercel deployments are immutable and instantly re-aliasable. | Any Production incident traced to the app layer, or a confirmed unwanted release. |
| **Feature flags** | Set the affected `FEATURE_P2_*` (and `NEXT_PUBLIC_` mirror) to `false` in the Production environment; use `FEATURE_P2_AI_KILL_SWITCH` for the AI surface specifically. This is the fastest rollback (no redeploy required if the app reads env at request time; otherwise one redeploy). | Any Production incident traced to a specific Phase 2 feature while the underlying deployment is otherwise sound. |
| **Data (Supabase)** | Prefer **forward-fix, not down-migration**. Additive migrations (new tables/columns) are not rolled back destructively; a broken migration is fixed with a new corrective migration. Destructive rollback (dropping/altering shipped columns) requires Owner approval and a pre-verified backup/point-in-time-recovery snapshot. | Only when a migration itself is the incident, and only after Owner approval — see §8. |

Rollback decision order: **flags off → app rollback → data forward-fix**, escalating only as far as the evidence requires. Do not roll back a layer that isn't implicated.

## 7. Feature Flag strategy

Summary (full policy: `docs/phase2/m0/P2-003_FEATURE_FLAG_POLICY.md`, which this policy adopts unchanged):

- Naming: `FEATURE_P2_<DOMAIN>`, optional `NEXT_PUBLIC_FEATURE_P2_<DOMAIN>` mirror for client-safe booleans.
- Default: `false` everywhere, including Production, until explicitly enabled.
- Enablement is an **Owner-approved, logged, one-flag-at-a-time (or documented train)** action against Vercel environment variables — never a side effect of merging or deploying code.
- Every gated route/component must fail closed (`notFound()` or safe Phase-1 fallback) when its flag is off — this is already implemented correctly and verified in the drift report.
- Flag state is periodically reconciled: `vercel env ls production` output should match the enablement log (see `STAGING_POLICY.md §7` for the validation train).

## 8. Owner Approval process

Owner approval is required, and must be recorded (in the PR/release notes or a dated approval note in `REPORTS/`), before any of the following:

1. Promoting a deployment to Production (first-time cutover or any subsequent release).
2. Changing a `FEATURE_P2_*` / `NEXT_PUBLIC_FEATURE_P2_*` value in the Production environment.
3. Applying a migration to the production database.
4. Performing a rollback that touches data (not just flags-off or app redeploy).
5. Changing Vercel's Production Branch, Deployment Protection settings, or domain/alias configuration.

Approval is captured as: **who** approved, **what** was approved (deployment SHA / flag / migration file), **when**, and **why** (link to release notes or incident). No automated process may substitute for this record.

## 9. Production checklist

Before anything is promoted to Production:

- [ ] Deployed commit SHA matches the tagged release exactly (`git rev-parse <tag>` == deployment `gitSource.sha`).
- [ ] Staging smoke (EN/ZH/TH, all flag-gated journeys) passed on this exact build — see `STAGING_POLICY.md §9`.
- [ ] All Phase 2 flags intended to stay off are confirmed off in the target Production environment (`vercel env ls production`).
- [ ] Any migration required by this release has already been applied to staging and reviewed; production migration step is scheduled/approved separately (§5, §8).
- [ ] Rollback target (previous Production deployment ID) identified and confirmed `READY` before promoting.
- [ ] Owner approval recorded (§8).

## 10. Release checklist

For each release:

- [ ] Tag cut from the intended commit; changelog/release notes drafted.
- [ ] Preview deployment built and smoke-tested (unauthenticated or Owner-authenticated).
- [ ] Staging cutover run per `STAGING_POLICY.md` (migrations → flag train → journey smoke).
- [ ] Production checklist (§9) completed.
- [ ] Owner promotes the release branch / triggers the Production deployment explicitly.
- [ ] Post-deploy smoke on `www.gothailandhome.com` (EN/ZH/TH + flag-gated routes 404 as expected, or intended new routes live as expected).
- [ ] Release closure report filed in `REPORTS/` recording deployed commit, deployment ID, flag state, migration state — mirroring the format already used in `PHASE2_PRODUCTION_DRIFT_VERIFICATION.md`.
