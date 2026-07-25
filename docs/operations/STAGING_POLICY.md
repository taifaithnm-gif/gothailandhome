# Staging Policy

**Status:** Proposed — documentation only. No infrastructure, Vercel, GitHub, or Supabase configuration has been changed by this document.
**Companion documents:** [`PRODUCTION_RELEASE_POLICY.md`](PRODUCTION_RELEASE_POLICY.md) (governance/approval), [`DEPLOYMENT_WORKFLOW.md`](DEPLOYMENT_WORKFLOW.md) (production mechanics)
**Basis:** the four staging-cutover reports in `REPORTS/` (`PHASE2_STAGING_CUTOVER_REPORT.md`, `PHASE2_STAGING_BLOCKER_STATUS.md`, `PHASE2_FEATURE_FLAG_ENABLEMENT_REPORT.md`, `PHASE2_SMOKE_TEST_REPORT.md`) all independently reached **STAGING BLOCKED**, for the two reasons documented here.

---

## 1. Current deployment architecture (staging, as it exists today)

There is no staging environment. What exists instead:

- **Preview deployments**, created ad hoc via `npx vercel deploy --yes` — no dedicated hostname, no fixed environment variables, ephemeral per invocation.
- **Vercel Deployment Protection (SSO)** is enabled on Preview, so any unauthenticated request — including from CI or an automation agent — receives the Vercel login page instead of the app. This was confirmed directly: every probed path on the Phase 2 preview URL returned title `"Login – Vercel"`.
- **No isolated database.** The only non-production Postgres credential available anywhere in this environment is the local `.env.local`, which is production-linked (not a separate staging Supabase project). Every prior staging attempt correctly refused to run migrations against it for exactly this reason.
- Consequently: the T1–T10 feature-flag train has **never been executed or smoke-tested** anywhere, and the two Phase 2 migration files have **never been applied** anywhere, including staging.

This is why every prior cutover attempt stopped at "blocked" rather than producing a false pass — the existing reports made the correct, conservative call given the environment gaps below.

## 2. Recommended deployment architecture (staging)

- **Provision a dedicated staging Supabase project**, independent credentials, independent `POSTGRES_URL`/`POSTGRES_URL_NON_POOLING`. It should be seeded from a sanitized snapshot or the same migration set as production — never a copy of production credentials.
- **Wire that project's credentials into Vercel's Preview environment only** (never Production), so every Preview deployment is automatically staging-backed.
- **Resolve Deployment Protection** one of two ways, whichever the Owner prefers:
  - Grant an Owner-authenticated session/team seat to whoever runs staging smoke (human or CI service account), or
  - Configure a dedicated, still-protected-from-search-engines staging hostname with a scoped Protection Bypass for automation, limited to that hostname.
- **Give staging a stable URL** (a fixed alias, e.g. `staging.gothailandhome.com` or the Vercel branch alias for `main`) so smoke scripts and checklists don't have to be rewritten per deployment.

## 3. Branch strategy (staging)

Per `DEPLOYMENT_WORKFLOW.md §3`: `main` is the branch that feeds staging. Every push to `main` produces a Preview deployment against the staging database — this *is* the staging environment, not a separate branch. No code change is required to get a "staging branch"; what's missing is the database isolation and protection-bypass described in §2.

## 4. Promotion strategy (staging → production)

Staging is the mandatory gate before any promotion described in `DEPLOYMENT_WORKFLOW.md §4`. A build is eligible for promotion to `release`/Production only after, on that exact commit/deployment:

1. Migrations applied cleanly to the staging database (§5).
2. The relevant feature-flag train executed and smoke-tested in staging (§7).
3. Full journey smoke passed (§9) against the staging URL, authenticated or bypass-enabled.
4. Owner sign-off recorded (`PRODUCTION_RELEASE_POLICY.md §8`).

If any step is blocked (as all four prior attempts were), the correct output is **STAGING BLOCKED**, not a partial or assumed pass — this policy formalizes the judgment the prior reports already exercised.

## 5. Migration strategy (staging)

Staging is where migrations are proven before they are ever considered for production, per `DEPLOYMENT_WORKFLOW.md §5`:

1. Apply the migration file(s) to the **staging** database only, using the tracked/idempotent `apply-migration.mjs` described in `DEPLOYMENT_WORKFLOW.md §5`.
2. Run the full journey/contract test suite (`npm run test:*`) against staging post-migration.
3. Record the result (filename, timestamp, staging-only) in a `REPORTS/` entry, mirroring the existing `PHASE2_DATABASE_AUDIT.md` / `PHASE2_DATABASE_RELEASE_AUDIT.md` format.
4. Only after this record exists does the same migration become eligible for the production migration step in `PRODUCTION_RELEASE_POLICY.md §8`.

## 6. Rollback strategy (staging)

Staging rollback is intentionally cheap and low-ceremony — that's what makes it safe to experiment there:

- **App:** re-run `vercel deploy` from the prior commit, or simply push a revert to `main`; no aliasing risk since staging has no customer traffic.
- **Data:** staging database may be reset/reseeded from scratch at any time without Owner approval (unlike production data rollback, `PRODUCTION_RELEASE_POLICY.md §6`), since it holds no real customer data.
- **Flags:** freely toggled in the Preview environment for train testing; only the Production environment values require the approval/logging discipline.

## 7. Feature Flag strategy (staging validation)

Execute the T1–T10 train sequentially in staging, smoke-testing after each step, before any flag is considered for Production:

| Step | Flag(s) | Staging exit criterion |
| --- | --- | --- |
| T1 | `FEATURE_P2_ACCOUNT` (+ public mirror) | Customer sign-in/account/saved-search journeys pass |
| T2 | `FEATURE_P2_OPS_LEADS` | Staff lead inbox reachable and functional |
| T3 | `FEATURE_P2_NOTIFICATIONS` | Notification outbox/prefs verified |
| T4 | `FEATURE_P2_CRM_SYNC` | CRM adapter smoke-tested against a sandbox/mock endpoint |
| T5 | `FEATURE_P2_ACQUISITION` (+ public mirror) | Acquisition workflow journey passes |
| T6 | `FEATURE_P2_PARTNER_PORTAL` (+ public mirror) | Partner/developer portal journey passes |
| T7 | `FEATURE_P2_MAP` (+ public mirror) | Map surfaces render and perform within budget |
| T8 | `FEATURE_P2_TOOLS` (+ public mirror) | Finance/legal tools journeys pass |
| T9 | `FEATURE_P2_AI` (+ public mirror); kill switch verified OFF-capable | AI recommend/investment-assist journeys pass; kill switch verified to force safe mode |
| T10 | `FEATURE_P2_ANALYTICS_EXPANSION` | Expanded analytics events verified in staging analytics sink |

Only trains that pass in staging are candidates for the Production enablement described in `PRODUCTION_RELEASE_POLICY.md §7`/§8.

## 8. Owner Approval process (staging exit)

Owner sign-off is required to leave staging and enter the promotion path (`PRODUCTION_RELEASE_POLICY.md §8`), specifically confirming: migrations applied cleanly (§5), flag train passed (§7), and journey smoke passed (§9) — all on the one commit being promoted.

## 9. Production checklist (staging exit criteria)

Before a build may proceed to the Production checklist in `PRODUCTION_RELEASE_POLICY.md §9`:

- [ ] Staging database isolated and confirmed separate from production credentials.
- [ ] Migrations applied to staging only, tracked, and idempotent.
- [ ] Full flag train (T1–T10) executed and passed in staging.
- [ ] Journey smoke (customer, partner, developer, inquiry, favorites, comparison, maps, finance/legal tools, AI, analytics, multilingual EN/ZH/TH, SEO, accessibility, responsive) passed against the staging URL.
- [ ] No SSO/Deployment-Protection blocker prevented any of the above from actually running (a "blocked, assumed pass" is not a pass).

## 10. Release checklist (staging portion)

- [ ] Preview build created from the exact release-candidate commit.
- [ ] Staging database isolation confirmed for this run.
- [ ] Migrations applied to staging and recorded.
- [ ] Flag train executed and recorded (`STAGING §7`).
- [ ] Full journey smoke recorded, mirroring `PHASE2_SMOKE_TEST_REPORT.md`'s format but with all rows PASS instead of NOT RUN.
- [ ] Staging exit sign-off recorded before handing off to the Production release checklist in `PRODUCTION_RELEASE_POLICY.md §10`.
