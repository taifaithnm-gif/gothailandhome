# Phase 2 Migration Safety Audit

**Date:** 2026-07-23
**RC / committed baseline:** `0eca210` (`v2.0.0-rc1`)
**Audit type:** Paste-quality planning audit for **staging only**
**Production apply this round:** **NONE** (freeze)
**This round:** No commit / push / deploy

---

## Migration inventory (8 files) — ORDER_SAFE timestamps

| Order | File | Notes |
| ---: | --- | --- |
| 1 | `20260714120000_init_property_foundation.sql` | Foundation tables/policies |
| 2 | `20260714183000_project_content_system.sql` | Content system |
| 3 | `20260714190000_platform_geography.sql` | Geography + **data-mutating UPDATEs** |
| 4 | `20260714200000_factory_m1_foundation.sql` | Import/factory tables |
| 5 | `20260714220000_wave1_hardening_multisource.sql` | Multi-source hardening |
| 6 | `20260715120000_marketplace_foundation_m1.sql` | Marketplace leads |
| 7 | `20260721100000_phase2a_customer_ops.sql` | Phase 2A (never applied anywhere) |
| 8 | `20260721120000_phase2b_acquisition_partners.sql` | Phase 2B (never applied anywhere) |

Timestamp ordering is monotonic → **ORDER_SAFE** for sequential apply.

---

## Idempotency / risk classification

| File | Classification | Rationale |
| --- | --- | --- |
| `…init_property_foundation.sql` | **NON_IDEMPOTENT** | `CREATE TABLE` / policies without full IF NOT EXISTS / DROP POLICY guards on first-create path — re-run fails or conflicts |
| `…marketplace_foundation_m1.sql` | **NON_IDEMPOTENT** | Creates tables/policies without re-run-safe policy drops on all objects |
| `…platform_geography.sql` | **DATA_RISK** | Includes unconditional `UPDATE` statements that rewrite listing/project/developer visibility (draft / unpublish). Re-apply on a live DB can mutate customer-visible data even if DDL is partially guarded |
| Phase2A / Phase2B | Policies were **NON_IDEMPOTENT**; **FIXED THIS ROUND** | Added `DROP POLICY IF EXISTS` before each `CREATE POLICY` in both Phase 2 files. **Phase 2 migrations have never been applied anywhere** (prod, staging, or otherwise). In-place edit of the still-unapplied files is documented here as intentional — not a production rewrite of already-applied SQL |

Other Wave1 / factory / content migrations use mixed `IF NOT EXISTS` / `DROP POLICY IF EXISTS` patterns; still treat full suite as **FORWARD_ONLY** for staging planning.

---

## Apply tooling

| Item | Finding |
| --- | --- |
| `scripts/apply-migration.mjs` | Applies raw SQL via `POSTGRES_URL*` / `DATABASE_URL`; loads `.env.local` if present |
| Migration tracking table | **Absent** |
| Automated environment gate | **Absent** in script |
| Classification | **MANUAL_REVIEW_REQUIRED** before any apply |
| Production apply this round | **Not performed** |

---

## Staging planning constraints

1. Apply only against an Owner-provisioned **staging** database (never prod-linked `.env.local`).
2. Prefer once-forward apply of the ordered set; do not assume safe re-run of NON_IDEMPOTENT / DATA_RISK files.
3. Record each staging apply in `REPORTS/` with filename, timestamp, and target project ref.
4. Phase2A/2B policy DROP IF EXISTS improves re-run safety for those two files only; does not make init/marketplace/geography safe to re-apply blindly.

---

## Verdict

**CONDITIONAL_PASS** for **staging planning** (order known, Phase2 policy hardening done, no production apply).

**Not** a pass to apply anywhere until staging DB exists and Owner approves the apply window. Production remains frozen.
