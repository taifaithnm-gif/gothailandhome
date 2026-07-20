# 20 — Data Factory Execution Standard

**Document ID:** `20_DATA_FACTORY_EXECUTION_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define how M0 standards are executed operationally across Control Plane (Mac mini), Execution Plane (Windows01), Serving Plane (Supabase), and Intelligence Plane — including hard stops, wave procedure, and M1 entry criteria.

## 2. Scope

Execution policy for Data Factory work after M0. Still documentation-level: does not authorize code, migrations, or deploy.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Wave** | Time-boxed collection/import set with frozen inventory. |
| **Control Plane** | Mac mini: repo, standards, review, authorized apply. |
| **Execution Plane** | Windows01: heavy collect/parse/evidence (gated). |
| **Stop the line** | Freeze apply on critical drift/P0 incidents. |
| **M1 entry** | Catalog truth & contracts milestone. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Waves | `wave_<yyyy>_<name>` |
| Job ids | `job_<plane>_<utc>_<purpose>` |
| Planes | `control` \| `execution` \| `serving` \| `intelligence` |

## 5. Required Fields

Wave plan record:

| Field | Notes |
| --- | --- |
| `wave_id` | |
| `entity_types[]` | |
| `source_ids[]` | Must be approved |
| `inventory_scope` | Counts/geo |
| `gates_required[]` | |
| `owner_signoff` | |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `windows01_required` | boolean |
| `embedding_rebuild` | boolean (default false until Owner decision) |
| `reviewer_capacity` | items/day |
| `backpressure_threshold` | |

## 7. Validation Rules

### Hard stops (non-negotiable)

1. No production code/SQL/migrations from M0 standards work.  
2. No UI/frontend changes from Data Factory workspace mandate.  
3. No push/deploy from execution of these standards alone.  
4. No Windows01 deploy before G-WIN01 + P0 closure.  
5. No AI auto-publish.  
6. No unregistered sources.  
7. No Serving Catalog apply without dry-run (DQ-06).  
8. Stop the line on critical package↔DB drift or poison parse outbreaks.

### Standard wave procedure

```text
1. Confirm gates (G-SOURCE / G-INVENTORY / …)
2. Freeze wave inventory
3. Collect (control or execution plane)
4. Package write + schema validate (12)
5. Quality assess (13)
6. Human review (18, 19)
7. Dry-run import (16)
8. Owner publish approval if required (G-PUBLISH)
9. Apply from Control Plane
10. Audit + reconcile (17, 13)
11. Freshness monitor
```

### Plane responsibilities

| Plane | Does | Does not |
| --- | --- | --- |
| Control | Standards, review, apply, git | Hold sole raw evidence at scale |
| Execution | Capture, parse, queue, evidence, optional embed | Own website; pilot prod writes |
| Serving | Public catalog projections | Raw HTML store |
| Intelligence | Search/recommend/graph on approved data | Create truth |

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| EXE-Q1 | Human review capacity sizes intake |
| EXE-Q2 | Same validator rule pack on all planes |
| EXE-Q3 | Overnight audit read-only by default |
| EXE-Q4 | Packages are the handoff contract |
| EXE-Q5 | Intelligence features wait for approved corpus versions |

### Compatibility checklist (execution readiness)

| Concern | Requirement |
| --- | --- |
| Windows01 | Package handoff; shared event/rule vocabulary; no secrets in git |
| AI Search | Index only approved/published versions; abstain on low confidence |
| Knowledge Graph | Edges from confirmed relationships; cite evidence when factual |

## 9. Lifecycle

M0 (this set) → Owner accept → M1 Catalog truth & contracts → M2 pipeline hardening → M3 knowledge/CMS → M4 Windows01 pilot → M5 AI foundations → M6 Data Factory RC  
(per `DATA_FACTORY_MASTER_PLAN.md`).

## 10. Examples

Wave plan excerpt:

```json
{
  "wave_id": "wave_2026_bangkok_listings_m1prep",
  "entity_types": ["listing", "project"],
  "source_ids": ["source_propertyhub"],
  "inventory_scope": { "city": "bangkok", "max_new_listings": 500 },
  "gates_required": ["G-SOURCE", "G-INVENTORY"],
  "windows01_required": false,
  "reviewer_capacity": 40,
  "owner_signoff": null
}
```

## 11. Future Compatibility

- Automation levels L0–L4 from master plan; L4 autonomous publish remains forbidden.  
- When Windows01 gains authorized apply, update POL-06 via Owner — do not silently change.  
- Second site execution reuses wave procedure with `site_id`.

## 12. Cross References

| Topic | Document |
| --- | --- |
| All M0 standards | `01`–`19` |
| Master plan execution sequence | `DATA_FACTORY_MASTER_PLAN.md` §16 |
| Governance gates | `19_DATA_GOVERNANCE_STANDARD.md` |
| Import | `16_IMPORT_EXPORT_STANDARD.md` |
| Windows01 | `WINDOWS01_*`, `RUNTIME_*` |
| Completion | `M0_FOUNDATION_COMPLETION_REPORT.md` |
