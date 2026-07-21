# Phase 2 — Data Model Impact

**Status:** Planning impact analysis only
**Does NOT authorize:** migrations, schema changes, or database edits
**Baseline:** Phase 1 Supabase catalog + filesystem content packages
**Date:** 2026-07-21

---

## 1. Purpose

Describe **planned** logical data impacts so engineering can later design migrations under a separate Owner-authorized schema task. This document is not a migration.

---

## 2. Current Phase 1 entities (baseline)

| Entity | Serving today | Notes |
| --- | --- | --- |
| Property / listing | Supabase | Public catalog |
| Project / developer / district / city | Supabase + content packages | Hubs |
| Lead / inquiry | Form channels (+ optional store) | Limited ops |
| Favorites / compare | Device localStorage | No account |
| Editorial content | Filesystem packages | Knowledge/blog/FAQ |
| Admin user | Auth for thin property admin | EN staff |

---

## 3. Planned logical domains (Phase 2)

```text
Identity        CustomerProfile, Session, RoleBinding
Engagement      SavedSearch, NotificationPreference, DeviceLink
DemandOps       Lead, LeadEvent, LeadAssignment
SupplyOps       AcquisitionCase, AcquisitionEvidence, ReviewDecision
Partners        DeveloperOrg, AgentProfile, Stewardship
Tools           MortgageScenario (optional persist), LegalChecklistProgress
AI              RecommendationRequest, AiSession, AiAuditEvent
Integrations    CrmSyncCursor, WebhookDelivery
Analytics       (event stream — mostly not relational OLTP)
```

---

## 4. Entity impact table

| Entity | New / Extend | Milestone | Sensitivity |
| --- | --- | --- | --- |
| `customer_profile` | New | M1 | PII |
| `auth_identity` link | New/extend | M1 | Security |
| `saved_item` (favorites/compare server) | New | M1 | PII-light |
| `saved_search` | New | M1 | PII-light |
| `notification_preference` | New | M2 | PII |
| `notification_outbox` | New | M2 | PII |
| `lead` | Extend | M2 | PII / business |
| `lead_event` | New | M2 | Audit |
| `lead_assignment` | New | M2 | Ops |
| `crm_external_ref` | New | M2 | Integration |
| `acquisition_case` | New | M3 | Business |
| `acquisition_evidence` | New | M3 | Evidence |
| `acquisition_review` | New | M3 | Audit |
| `developer_org` / membership | New/extend | M4 | Partner |
| `agent_profile` / stewardship | New | M4 | Partner |
| `map` — usually no new entity | — | M5 | Uses geo fields on listing/district |
| `mortgage_scenario` | Optional new | M6 | May stay client-only initially |
| `legal_checklist_progress` | Optional new | M6 | Account-linked |
| `recommendation_log` | New | M7 | Product analytics |
| `ai_session` / `ai_audit_event` | New | M7 | Compliance |
| Listing/property columns | Possibly extend | M3–M5 | Only with evidenced fields |

---

## 5. Relationships (logical)

```text
CustomerProfile 1—* SavedSearch
CustomerProfile 1—* SavedItem
CustomerProfile 1—* Lead (as requester, when authenticated)
Lead 1—* LeadEvent
Lead *—1 AgentProfile | StaffUser (assignee)
AcquisitionCase *—? Property (after publish link)
AcquisitionCase 1—* AcquisitionEvidence
DeveloperOrg 1—* Project stewardship
AgentProfile *—* Listing stewardship
RecommendationRequest → CustomerProfile? + listing set
AiSession → CustomerProfile? + tool context
CrmExternalRef → Lead
```

---

## 6. Compatibility rules

1. **Do not break** existing public property/project/developer reads.
2. New tables prefer additive; avoid destructive renames of Phase 1 columns.
3. Device favorites remain readable until migration UX completes.
4. Filesystem editorial packages remain valid; do not force CMS migration in Phase 2 core.
5. Any geo fields for maps must reuse existing location/district data first.
6. AI must not write authoritative listing facts without acquisition/review workflow.

---

## 7. PII & retention (planning requirements)

| Data | Retention planning needed before implement |
| --- | --- |
| Leads / CRM mirrors | SLA + deletion/export |
| Notification outbox | Short TTL + suppressions |
| AI prompts/logs | Redaction + bounded retention |
| Auth identities | Standard auth provider policies |

---

## 8. Alignment with Data Factory contracts

Factory M0/M1 contracts (`01_PROPERTY_CONTRACT.md`, etc.) remain the **catalog truth language**. Phase 2 acquisition should map into those contracts at publish time. Factory runtime is not required to start human acquisition cases.

---

## 9. Explicit non-actions (this planning cycle)

- No Supabase migration files
- No production schema apply
- No backfill scripts
- No destructive data repair

Future schema work requires a separate Owner-authorized engineering task referencing this impact map.
