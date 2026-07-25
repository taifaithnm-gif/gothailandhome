# GitHub Branch Protection Checklist

**Status:** Documentation / Owner console checklist. This file does not change GitHub settings by itself.
**Release posture:** **FREEZE CURRENT PRODUCTION — NO CUTOVER**
**RC baseline:** `0eca210` / `v2.0.0-rc1`

Companion docs: [`DEPLOYMENT_WORKFLOW.md`](DEPLOYMENT_WORKFLOW.md), [`PRODUCTION_RELEASE_POLICY.md`](PRODUCTION_RELEASE_POLICY.md), draft [`.github/CODEOWNERS`](../../.github/CODEOWNERS).

---

## 1. Protect `main` now

In GitHub → **Settings** → **Branches** → **Add branch ruleset** or classic **Branch protection rule** for `main`:

| Control | Required setting |
| --- | --- |
| Require a pull request before merging | **ON** |
| Require approvals | **ON** (at least 1; Owner sets count) |
| Dismiss stale reviews when new commits are pushed | Recommended **ON** |
| Require review from Code Owners | **ON** once CODEOWNERS is filled (see §5) |
| Require conversation resolution before merging | **ON** |
| Require status checks to pass | **ON** |
| Require branches to be up to date before merging | Recommended **ON** |
| Status check name (required) | **`typecheck-lint-test-build`** — job `name` from `.github/workflows/ci.yml` (`jobs.verify.name`) |
| Block force pushes | **ON** |
| Block deletions | **ON** |
| Restrict who can push | **ON** — no direct push to `main` for routine work; PR only |
| Do not allow bypassing the above settings | **Include administrators** (admins must follow the same rules) |

Confirm CI has run at least once on a PR so the check name `typecheck-lint-test-build` appears in the required-checks picker.

---

## 2. Future `release` branch (prepare, do not cut over)

Per [`DEPLOYMENT_WORKFLOW.md`](DEPLOYMENT_WORKFLOW.md), a future model uses `release` (or similar) as the only branch that maps to Vercel Production.

**This round:**

- [ ] Document intent only.
- [ ] **Do NOT** change Vercel **Production Branch** in this milestone.
- [ ] **Do NOT** retarget Production aliases.

**When Owner later authorizes the release-branch switch**, apply the **same** protection controls to `release`:

- PR required, status checks, conversation resolution, no force push, no deletion, include admins.
- Required check: `typecheck-lint-test-build`.
- Only promote commits that passed staging gates ([`STAGING_POLICY.md`](STAGING_POLICY.md)).

Until that switch is Owner-approved, protecting `main` still reduces unreviewed merges even while Vercel Production Branch remains `main`.

---

## 3. Ruleset / classic rule checklist (copy into console)

- [ ] Branch: `main` (now)
- [ ] Require PR + approval(s)
- [ ] Require conversation resolution
- [ ] Require status checks: `typecheck-lint-test-build`
- [ ] Block force push
- [ ] Block branch deletion
- [ ] Restrict direct pushes
- [ ] Include administrators
- [ ] (Later) Duplicate for `release` when created — still without changing Vercel Production Branch until Owner cutover decision

---

## 4. What CI guarantees (and does not)

From `.github/workflows/ci.yml`:

- Runs typecheck, lint, unit/contract tests, and production build with **staging-shaped placeholders**.
- Does **not** deploy to Production.
- Does **not** apply migrations.
- Does **not** use real `SUPABASE_SERVICE_ROLE_KEY` / `POSTGRES_URL`.

Passing `typecheck-lint-test-build` is necessary but not sufficient for Phase 2 cutover.

---

## 5. CODEOWNERS (draft)

A draft file lives at [`.github/CODEOWNERS`](../../.github/CODEOWNERS) with **comment placeholders only**.

- Owner must replace `# @OWNER_GITHUB_USERNAME` with real GitHub usernames/teams.
- Do **not** invent usernames in docs or CODEOWNERS.
- Enable “Require review from Code Owners” only after real owners are filled.

---

## 6. Stop conditions

- [ ] If CI check name is missing from the UI, merge a no-op PR first or wait for workflow run — do not invent a different required check name.
- [ ] If admins can still force-push, fix “include administrators” / bypass settings before declaring protection complete.
- [ ] Do not treat branch protection alone as authorization to enable Phase 2 in Production.
