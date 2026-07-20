# 19 — Data Governance Standard

**Document ID:** `19_DATA_GOVERNANCE_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define ownership, roles, source approval, AI limits, privacy, compliance, and Owner gates that control the Data Factory.

## 2. Scope

Policy for Catalog and Knowledge domains, Windows01 execution, and Intelligence plane. No legal advice; points at existing `G_LEGAL_*` / `G_INVESTMENT_*` packages.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Owner** | Final authority for sources, publish, exceptions. |
| **Source approval** | Signed permission to collect from a source. |
| **Gate** | Hard stop before a class of work. |
| **Exception grant** | Time-boxed Owner override with audit. |
| **PII** | Personal data; minimize in factory stores. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Gates | `G-SOURCE`, `G-FIELDS`, `G-INVENTORY`, `G-WIN01`, `G-PUBLISH` |
| Roles | `owner`, `reviewer`, `data_ops`, `collector_worker`, `ai_agent` |
| Policy ids | `POL-…` |

## 5. Required Fields

Governance records:

| Record | Required |
| --- | --- |
| Source approval | `source_id`, approver, scope, expiry, allowed methods |
| Exception grant | reason, scope, expiry, approver, audit id |
| Publish approval | batch hash, approver, timestamp |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| Geographic scope | e.g., Bangkok only |
| Rate limits | |
| Robots/ToS notes | |
| Redaction rules | For cloud LLM use |

## 7. Validation Rules

### Roles matrix

| Role | May | May not |
| --- | --- | --- |
| collector_worker | Capture/parse/propose | Approve publish; add unregistered sources |
| reviewer | Accept/reject/request changes within policy | Bypass source rules; approve as Owner publish batch |
| data_ops | Run validate/dry-run/apply when authorized | Change Owner policy |
| owner | Approve sources, publish batches, exceptions | — |
| ai_agent | Suggest/score/draft/flag | Final approve; invent facts; set `published` |

### Binding policies

| ID | Policy |
| --- | --- |
| POL-01 | No unregistered source collection |
| POL-02 | Evidence before entity for machine collection |
| POL-03 | Null-over-fabricate |
| POL-04 | AI cannot approve publish |
| POL-05 | High-risk knowledge requires compliance checklist |
| POL-06 | Windows01 pilot: no direct prod catalog writes |
| POL-07 | Secrets never in packages/git |
| POL-08 | PII minimization |
| POL-09 | Intake throttled by review capacity |
| POL-10 | Exception grants expire and are audited |

### Owner gates

| Gate | Blocks until signed |
| --- | --- |
| G-SOURCE | Live collection expansion |
| G-FIELDS | Field dictionary scale-up |
| G-INVENTORY | Wave inventory freeze |
| G-WIN01 | Windows01 deploy/runtime |
| G-PUBLISH | Production-impacting publish from factory |

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| GOV-Q1 | Governance beats throughput |
| GOV-Q2 | Dual Catalog/Knowledge factories share these rules |
| GOV-Q3 | Legal/investment public text must follow G_* packages |
| GOV-Q4 | Cloud LLMs only with redaction policy |
| GOV-Q5 | Removable Windows01 wipe must not destroy control plane |

## 9. Lifecycle

Sources: `proposed → approved → active → suspended → retired`.  
Exceptions: `requested → granted → expired|revoked`.  
Gates: open only via Owner record.

## 10. Examples

```json
{
  "source_id": "source_propertyhub",
  "status": "approved",
  "scope": { "geo": "bangkok", "entity_types": ["listing"] },
  "allowed_methods": ["harvest_wave_script"],
  "approved_by": "owner_ref_01",
  "approved_at": "2026-07-20T00:00:00Z",
  "expires_at": "2027-01-01T00:00:00Z"
}
```

## 11. Future Compatibility

- Second site adds `site_id` to source approvals without rewriting roles.  
- Marketplace governance maps additional roles later; cannot weaken POL-04.  
- Embedding enablement is an Owner decision recorded once (master plan conflict resolution).

## 12. Cross References

| Topic | Document |
| --- | --- |
| Master plan governance | `DATA_FACTORY_MASTER_PLAN.md` §10 |
| Knowledge compliance | `08_KNOWLEDGE_DATA_STANDARD.md` |
| Audit | `17_DATA_AUDIT_STANDARD.md` |
| Execution | `20_DATA_FACTORY_EXECUTION_STANDARD.md` |
| Legal / investment | `G_LEGAL_*`, `G_INVESTMENT_*` |
| Windows01 | `WINDOWS01_DEPLOYMENT_PREREQUISITES.md`, `V2_DECISION_REGISTER.md` |
