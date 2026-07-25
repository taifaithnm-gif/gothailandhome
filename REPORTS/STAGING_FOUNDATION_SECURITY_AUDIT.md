# Staging Foundation — Security Audit

**Date:** 2026-07-23
**Scope:** Uncommitted staging-foundation changes on RC `0eca210`
**Production posture:** FREEZE CURRENT PRODUCTION — NO CUTOVER
**This round:** No commit / push / deploy
**Honesty rule:** No fake PASS

---

## Findings

### Service role client risk — mitigated (code)

- Service-role getter lives in `src/lib/supabase/service-env.ts` with `import "server-only"`
- Removed from shared `env.ts` re-exports to reduce accidental client graph pulls
- `assertServiceRoleNotPublic` guard used on access
- **Residual:** if Preview/dev still has Production service role in Vercel env, mitigated *import path* does not stop a server route from writing to prod — Owner isolation still required

### Preview / dev Production write risk — OPEN until Owner isolates Vercel env

- Code fail-closed isolation (`supabase-guard` + project ref markers) only works when markers and URLs are correctly set
- Until Owner provisions staging and rewires Preview (and local) credentials, write-capable env may still point at Production
- **CONDITIONAL** — not closed by this round

### Feature flags default false — OK for freeze

- `getPhase2FeatureFlags()` defaults OFF when unset
- `.env.example` documents all `FEATURE_P2_*` as false
- Does not protect against an operator manually enabling flags against a prod-linked Preview

### `partner_memberships_self_insert` RLS concern — OPEN (design review)

- Policy: authenticated insert with `user_id = auth.uid()` only
- Does **not** bind insert to a validated invite / org approval on the INSERT path
- Risk: self-enrollment into `partner_memberships` if table is reachable and flags/routes expose it
- Track for staging RLS review before partner portal enablement; **not** marked PASS

### Windows01 import safety gates — implemented (framework)

| Threat | Mitigation in code |
| --- | --- |
| Path traversal | `assertNoPathTraversal` on evidence paths/refs |
| Malicious URL / SSRF-class hosts | `assertSafeHttpUrl` blocks private/metadata hosts; http(s) only |
| Oversized payload | Per-record 512 KiB; batch recordCount cap 5_000 |
| In-batch replay / duplicate | Duplicate `recordId` / `contentHash` quarantined within a batch |
| Production import | Hard block when deploy env is production or mode is `blocked-production` |
| Audit integrity | Event hash chain (`prevHash` + SHA-256 `eventHash`) |

Cross-batch durable replay store is **not** claimed; in-memory/batch-local only until persistence is designed.

### Production import hard block — present

`StagingWindows01ImportAdapter.runImport` refuses production deploy env / blocked-production mode and records audit + quarantine reason `PRODUCTION_HARD_BLOCK`.

### Audit log hash chain — present (adapter-local)

Audit events append with linked hashes. Not yet a durable append-only store in Postgres — framework-level only.

---

## Overall verdict

**CONDITIONAL** until:

1. Owner staging Supabase project exists and Preview/local no longer inherit Production write credentials
2. Markers `SUPABASE_PRODUCTION_PROJECT_REF` / `SUPABASE_STAGING_PROJECT_REF` are set correctly in each environment
3. Partner membership RLS reviewed before T6 enablement
4. Staging smoke actually runs (currently all NOT_RUN)

**No overall PASS.** Code mitigations reduce some classes of mistake; environment isolation and RLS design gaps remain Owner / follow-up work. Production remains frozen.
