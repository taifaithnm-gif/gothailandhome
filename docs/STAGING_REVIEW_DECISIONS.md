# Staging Review Decisions (Phase A)

**Milestone:** `MANUAL_REVIEW_WORKFLOW_PHASE_A_IMPLEMENTATION`  
**Scope:** Schema + RLS + types + repository skeleton + tests  
**Not in scope:** Decision Service, Decision API, Review UI, Apply/Reject/Submit/Rollback ops, Approval, Publish, Production

---

## Objects

| Object | Purpose |
| --- | --- |
| `staging_review_decisions` | Core decision records |
| `staging_review_decision_evidence` | Append-only evidence |
| `staging_review_decision_changes` | Field-level patches (filled on apply later) |
| `staging_review_decision_audit` | Append-only decision audit |

## Migrations (forward)

1. `database/staging-migrations/20260726_010_staging_review_decisions.sql`
2. `database/staging-migrations/20260726_011_staging_review_decisions_rls.sql`
3. `database/staging-migrations/20260726_012_staging_review_decisions_constraints.sql`

Apply only on Staging:

```bash
npm run staging:db:migration-audit
npm run staging:db:migrate -- --confirm-staging --expected-project-ref <STAGING_REF> --connection-mode session-pooler
npm run staging:db:schema-verify
```

## Rollback

```text
database/staging-rollback/20260726_review_decisions_rollback.sql
```

Drops Phase A decision tables/triggers/functions and removes their `staging_schema_migrations` rows. Does **not** touch Batch001 entity / review_item tables.

Apply rollback only with explicit Staging confirmation (same isolation gates as migrate).

## Roles (RLS)

| App role | DB role | Phase A capability |
| --- | --- | --- |
| REVIEW_VIEWER | `staging_review_viewer` | SELECT |
| REVIEWER | `staging_reviewer` | SELECT + INSERT DRAFT + UPDATE DRAFT |
| SENIOR_REVIEWER | `staging_senior_reviewer` | SELECT + INSERT DRAFT + broader UPDATE |
| REVIEW_ADMIN | `staging_admin` | SELECT + INSERT DRAFT + full status UPDATE |
| SYSTEM_AUDITOR | `read_only_auditor` | SELECT |

No Approval / Publish / Production grants.

## Repository (skeleton)

- `MockDecisionRepository` / `SupabaseDecisionRepository`
- Methods: `createDraft`, `findById`, `findByIdempotencyKey`, `list`, `listEvidence`, `listAudit`
- **Not** implemented: apply, reject, submit, rollback

## Tests

```bash
npm run test:staging-review-decisions
```
