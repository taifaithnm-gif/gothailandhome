# Manual Review Phase A Implementation

**Milestone:** `MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION`  
**Date:** 2026-07-26  
**Mode:** Infrastructure only — Schema + RLS + types + repository skeleton + tests  
**Live DB apply:** not auto-executed in this session (`SKIPPED_EXTERNAL_ENVIRONMENT_NOT_PROVISIONED`)

---

## Schema Summary

Added four Staging-only tables (additive; no Batch001 row migration):

| Table | Purpose |
| --- | --- |
| `staging_review_decisions` | Core decision records (`DRAFT`…`ROLLED_BACK`) |
| `staging_review_decision_evidence` | Append-only evidence attachments |
| `staging_review_decision_changes` | Field-level before/after patches |
| `staging_review_decision_audit` | Append-only decision audit |

Forward SQL:

1. `database/staging-migrations/20260726_010_staging_review_decisions.sql`
2. `database/staging-migrations/20260726_011_staging_review_decisions_rls.sql`
3. `database/staging-migrations/20260726_012_staging_review_decisions_constraints.sql`

Includes: PK, FK (`import_sessions`, `review_items`, `conflict_candidates`, self-FK), UNIQUE (active item partial, idempotency, evidence, changes), CHECK (family/status/risk/target/evidence/actor_type), indexes, timestamps, `idempotency_key`, immutable-field triggers.

---

## RLS Summary

| App role | DB role | Grants (decision tables) |
| --- | --- | --- |
| `REVIEW_VIEWER` | `staging_review_viewer` | SELECT |
| `REVIEWER` | `staging_reviewer` | SELECT; INSERT `DRAFT`; UPDATE from `DRAFT` |
| `SENIOR_REVIEWER` | `staging_senior_reviewer` | SELECT; INSERT `DRAFT`; broader UPDATE |
| `REVIEW_ADMIN` | `staging_admin` | SELECT; INSERT `DRAFT`; UPDATE all decision statuses |
| `SYSTEM_AUDITOR` | `read_only_auditor` | SELECT |

- PUBLIC revoked on all four tables  
- No DELETE grants on evidence / changes / audit  
- No Approval / Publish / Production grants or policies  

---

## Migration Summary

| Item | Value |
| --- | --- |
| Forward count added | 3 (`010`–`012`) |
| `EXPECTED_STAGING_MIGRATIONS` | 12 (frozen V1 `001`–`009` unchanged as prefix) |
| Static audit | PASS (`npm run staging:db:migration-audit`) |
| Rollback SQL | `database/staging-rollback/20260726_review_decisions_rollback.sql` |
| Live apply this session | NOT RUN (staging client unavailable in runner) |

Ops notes: `docs/STAGING_REVIEW_DECISIONS.md`

---

## Repository Summary

| Module | Role |
| --- | --- |
| `src/lib/staging-db/decision-types.ts` | Types + vocabularies + role map |
| `src/lib/staging-db/decision-validation.ts` | Structural validation (no zod — project does not use zod) |
| `src/lib/staging-db/decision-idempotency.ts` | `sha256(batch\|item\|family\|action\|hash)` |
| `src/lib/staging-db/decision-repository.ts` | Interface |
| `src/lib/staging-db/mock-decision-repository.ts` | In-memory Create Draft / Read / List |
| `src/lib/staging-db/supabase/decision-repository.ts` | Supabase adapter Create Draft / Read / List |

**Supported:** `createDraft`, `findById`, `findByIdempotencyKey`, `list`, `listEvidence`, `listAudit`  
**Not implemented (by design):** Apply, Reject, Submit, Rollback, Decision Service, API, UI

---

## Constraint Verification

| Constraint | Verification |
| --- | --- |
| Unique active DRAFT/SUBMITTED per `review_item_id` | SQL partial unique index + mock repository test |
| Unique `idempotency_key` | SQL unique index + mock conflict test |
| FK to review items / sessions / conflicts | Declared in `010` DDL |
| CHECK family/status/risk/target/evidence | Declared in `010` DDL + TS validators |
| Immutable columns | Trigger `staging_forbid_decision_immutable_mutation` |
| Append-only evidence/changes/audit | BEFORE UPDATE/DELETE → `GTH_DECISION_CHILD_APPEND_ONLY` |

---

## Rollback Verification

Rollback script:

- Drops Phase A triggers + functions  
- Drops four decision tables (children first)  
- Removes `010`/`011`/`012` rows from `staging_schema_migrations`  
- Does **not** drop `staging_review_items` / entity tables / frozen roles used by import  

Static test asserts rollback scope and Staging-only header.

---

## Test Summary

| Suite | Result |
| --- | --- |
| `npm run test:staging-review-decisions` | **21 PASS** |
| `npm run staging:db:migration-audit` | **PASS** (12 files, 0 errors) |
| `npm run test:staging-db-implementation` | **147 PASS** |
| `npm run test:staging-rls` | **4 static PASS** (live skipped) |
| `npm run test:architecture-freeze` | **35 PASS** |
| `npm run typecheck` | **PASS** |
| `npm run lint` | **PASS** (0 errors; pre-existing warnings elsewhere) |
| `npm run build` | **PASS** |

Coverage: schema, RLS (static), migration, constraints/immutability, repository CRUD skeleton, unique/active, idempotency, audit event on draft create, rollback SQL, validation allow-lists.

---

## Explicit non-goals (confirmed absent)

- Decision API routes  
- Review Decision UI  
- Decision Service transitions (Submit/Apply/Reject/Rollback)  
- Approval / Publish / Production  
- Storage upload / Deploy / Git commit / Git push  
- Mutations to existing Batch001 review_items / conflicts  

---

## Next recommended action

**SUPERSEDED by `REVIEW_INFRASTRUCTURE_V1_FREEZE` (2026-07-26).**

Phase A migrations were applied and verified on Staging. Phase B is **DEFERRED**.  
Next product action: **`CONTENT_AND_SEO_DEVELOPMENT`** — see `REPORTS/REVIEW_INFRASTRUCTURE_V1_FREEZE.md`.
