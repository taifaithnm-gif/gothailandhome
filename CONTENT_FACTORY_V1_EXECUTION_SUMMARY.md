# Content Factory V1 Execution Summary

## 1. Current baseline

The six Content Factory documents define a source-first, evidence-preserving, human-governed enterprise system for 100+ sites. They are design-only and currently untracked. GoThailandHome is in Alpha RC with Feature Freeze active. `GO_THAILAND_HOME_CURRENT_STATUS.md` was not present. The workspace audit and organization report designate `GoThailandHome Master` as the sole permanent workspace.

This plan accepts the baseline principles but narrows implementation to a controlled property-project pilot. It does not authorize code, schema, deployment, collection, or publication.

## 2. V1 implementation boundary

- One site: GoThailandHome.
- 1–2 owner-approved, legally accessible, stable sources.
- 5–10 Thai residential property projects.
- Maximum 100 combined project/property records.
- One manual workflow and mandatory human approval.
- Immutable evidence, field-level traceability, versioning, deterministic validation/duplicates, logs, backup, and rollback.
- One versioned GoThailandHome package through a staging/non-production handoff during Feature Freeze.
- No production DB/schema/frontend/release change; no broad crawler, multi-site platform, distributed architecture, speculative AI, or unattended publication.

## 3. Recommended pilot

Use project-level profiles from one official developer source or owner-authorized structured file; add a second official/government source only where needed for attribution or location/status corroboration. Keep one province or coherent metro area and one residential project category. Prefer stable HTML/CSV/XLSX/text PDF or manual upload. Do not use aggregators, user listings, restricted sources, or volume-driven scraping.

## 4. Recommended Sprint order

1. **Sprint 0:** Freeze baseline conflicts, gates, architecture placement.
2. **Sprint 1:** Approve property data, evidence, source policy, and pilot manifest.
3. **Sprint 2:** Define and test the single manual review workflow.
4. **Sprint 3:** Establish minimal isolated runtime, evidence/state, logs, backup/restore.
5. **Sprint 4:** Implement one bounded collector and only required parser(s).
6. **Sprint 5:** Normalize, validate, and flag deterministic duplicates.
7. **Sprint 6:** Execute human fact and duplicate review.
8. **Sprint 7:** Assemble package, simulate handoff, rehearse rollback; hold production during freeze.
9. **Sprint 8:** Reconcile metrics/risks and record GO/NO-GO.

The critical sequence is governance -> contracts -> isolated runtime -> evidence-first ingestion -> deterministic quality gates -> human review -> package -> rollback -> evaluation.

## 5. Windows 01 role

Windows 01 may be a dedicated, removable pilot execution node for the minimal runtime, bounded scheduler, queue if needed, collector, parser, validator, evidence/state storage, logs, monitoring, and backup. OCR is conditional only for unavoidable scanned source content. Embeddings are deferred.

It must not host ERP, the production frontend/database, website release tooling, unrelated projects, broad crawlers, or experimental services. G4 requires isolation, service identity, allowlisted network, secret handling, capacity, backup/restore, health/alert, shutdown, and clean-removal proof.

## 6. Mac mini role

The Mac mini is the control plane: repository and configuration work, fixture/test authoring, operator actions, review access, package inspection, owner approvals, and management reporting. It does not duplicate Windows 01 runtime services and does not publish automatically.

## 7. Human review role

Humans approve sources, the data/evidence standard, Windows 01 deployment, every publishable fact—especially price/currency/availability/status—duplicate resolutions, package readiness, and publication. Each immutable decision identifies reviewer, role, evidence viewed, target version/hash, reason, comment, and timestamp. AI assists analysis and execution but cannot approve.

## 8. Deferred components

- Multi-site/multi-tenant platform and scale beyond 100 records.
- Production database integration/schema migration and direct production publishing.
- Broad crawl/discovery and more than two sources.
- Embeddings/vector search, semantic duplicate matching, AI extraction/rewriting.
- Localization/translation memory, full taxonomy/entity graph/relationships.
- Media processing/derivatives and OCR by default.
- Distributed queue/workflow/orchestration, HA/autoscaling, enterprise dashboards.

## 9. Main blockers

1. Feature Freeze blocks implementation impact, deployment, and production publication.
2. Human Owner has not approved the eight-document planning baseline (G0).
3. Pilot sources, rights, collection methods, geography, and exact projects are unselected (G1/G5).
4. Property/evidence contracts are unapproved (G2).
5. Same-repo vs separate service/repo, isolated store, runtime products, and adapter contract are unresolved (G3).
6. Windows 01 readiness, identity, network, backup target, and removal plan are unverified (G4).
7. Reviewer/Publisher identities and rollback recovery target require confirmation.
8. Current production package/content interface is not established and may not be inspected until a separately authorized implementation task.

## 10. Owner decisions required

| Decision | Required before |
| --- | --- |
| Approve/revise these eight V1 documents and conflict decisions | Any implementation |
| Select same repo vs separate service/repo; approve isolated runtime storage | Runtime work |
| Approve property/project fields, evidence requirements, and high-risk fields | Parsing/ingestion |
| Name 1–2 sources, allowed methods/rights, one geography, and 5–10 projects | Collection |
| Approve Windows 01 component inventory, security/network, backup, monitoring, removal | Deployment |
| Name Human Reviewer and Publisher; approve decision/checklist policy | Pilot review |
| Approve non-production GoThailandHome adapter contract and rollback target | Package tests |
| Lift/confirm Feature Freeze conditions and explicitly approve any production publication | Publication |
| Decide GO, repeat, stop, or propose post-V1 expansion from Sprint 8 evidence | After pilot |

## 11. GO / NO-GO recommendation

### Planning: GO

**Reason:** The V1 boundary is small, testable, source-governed, reversible, and consistent with the baseline's provenance and human-review principles.  
**Preconditions:** Human Owner reviews and records G0; unresolved assumptions remain visible.

### Implementation: CONDITIONAL GO

**Reason:** The backlog is executable, but Feature Freeze and unresolved architecture/data decisions prevent implementation now.  
**Preconditions:** Feature Freeze permits the work; G0–G3 approved; implementation remains isolated from production DB/frontend; each sprint stops at its gate.

### Windows 01 Deployment: CONDITIONAL GO

**Reason:** Windows 01 is suitable only as a dedicated pilot node under strict isolation; readiness is not established by the read scope.  
**Preconditions:** G4 approval after component/version inventory, non-admin identity, allowlisted network, secret handling, capacity, backup/restore, health/alert, shutdown, and removal tests. OCR only if separately justified; no embeddings.

### Pilot Data Collection: CONDITIONAL GO

**Reason:** A 1–2-source, 5–10-project pilot can test the factory safely, but no source is yet selected or approved.  
**Preconditions:** G1/G2/G5 approval; legally accessible attributable sources; signed manifest and hard caps; evidence store/backup operational; no live collection until Feature Freeze and owner authorization allow it.

## Responsibility and decision boundary

- **Cursor:** Document analysis, task decomposition, dependencies, acceptance criteria, risks; later implementation/testing only when authorized.
- **Claude:** Not used in this task; future architecture/consistency review only.
- **ChatGPT:** Owner-level planning, priority recommendations, gate structure, final GO/NO-GO recommendation.
- **Human Owner:** Final authority for sources, standards, database changes, Windows 01, package/publication, and expansion.

## Management conclusion

Approve the plan, not implementation. The first executable move after Feature Freeze approval is Sprint 0/G0—not collector coding or deployment. V1 should be judged on traceability, correctness, human control, recovery, and operational burden. Passing V1 does not authorize enterprise scale.

