# 20 — Phase 2 Implementation Roadmap

**Document ID:** `20_PHASE2_IMPLEMENTATION_ROADMAP`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture / planning only — does not authorize code  
**Date:** 2026-07-20

---

## 1. Purpose

Sequence **future implementation** of the Data Factory after M0–M2 documentation, aligned to Master Plan milestones M3–M6, without starting coding in this deliverable.

## 2. Components

| Wave | Focus | Primary architectures |
| --- | --- | --- |
| **W0** | Owner accept M0–M2; freeze gates | Governance |
| **W1** | Schema blueprint + type alignment design | `01`,`02`,`14` |
| **W2** | Import/export hardening design→build (authorized) | `10`,`11`,`16` |
| **W3** | CMS/Admin IA → thin vertical slice | `05`,`06`,`04` |
| **W4** | Windows01 P0 close + pilot runtime | `15`,`17`,`18`,`19` |
| **W5** | Knowledge publish path (K1/K2 decision) | Export + Knowledge |
| **W6** | Graph materializer + Search keyword | `09`,`07` |
| **W7** | Embeddings if Owner enables | `13`,`12` optional |
| **W8** | Recommendation interfaces | `08` |
| **W9** | Data Factory RC | All |

## 3. Responsibilities

- Keep documentation-only until Owner authorizes each build wave.
- Preserve workspace boundary: no frontend redesign in factory workspace.
- Prefer Control Plane catalog ops before Windows01 dependency.

## 4. Data Flow

```text
Docs (M0–M2) → Owner gates → authorized build waves
  → evidence in audit → RC review → next phase
```

## 5. Dependencies

| Prerequisite | Blocks |
| --- | --- |
| Owner accept M0–M2 | All builds |
| G-SOURCE / G-INVENTORY | Live harvest expansion |
| G-WIN01 + P0s | Windows01 deploy |
| Embedding decision | W7 |
| G-PUBLISH | Prod-impacting publish |
| K1/K2 decision | Knowledge serving build |

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Gate denied | Continue Mac mini L1/L2 catalog hardening only |
| P0 reopen on Windows01 | Fall back to Control Plane harvest |
| Scope bleed to UI | Reject PR; restate boundary |

## 7. Security Considerations

- No early distribution of prod service roles
- Security Architecture review at each wave gate
- Backup drills before trusting Execution Plane

## 8. Scalability

- Wave sizing by reviewer capacity, not scraper throughput
- Measure before multi-site generalization (design for 2)

## 9. Future Expansion

- After RC: second site export profile; marketplace interfaces remain Platform-owned
- Continuous improvement of rule packs without breaking business keys

## 10. Windows01 Integration

Appears at W4 only; until then architecture docs guide prep. Pilot: packages out, no prod apply.

## 11. Cross References

- `DATA_FACTORY_MASTER_PLAN.md` §14–16
- M0/M1 completion reports; all M2 `01`–`19`
- `PHASE2_PREPARATION_REPORT.md` (website Phase 2 ≠ this roadmap; keep separate)

---

### Suggested immediate *documentation* follow-ons (still not code)

1. `DATA_FACTORY_SCHEMA_BLUEPRINT.md`  
2. `DATA_FACTORY_PACKAGE_CONTRACTS.md` (machine schemas)  
3. `WINDOWS01_P0_CLOSURE_PLAN.md`  
4. CMS IA detail under M3
