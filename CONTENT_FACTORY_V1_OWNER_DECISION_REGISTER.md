# Content Factory V1 Owner Decision Register

**Sprint:** 0 — Baseline Confirmation and Decision Freeze  
**Status:** Owner Decision Freeze recorded  
**Approval date:** 2026-07-18  
**Approved:** 15  
**Conditional approvals:** 9  
**Deferred:** 1  
**Open decisions:** 0

## Instructions

- These decisions are authoritative governance boundaries, not implementation authorization.
- `CONDITIONAL APPROVAL` records approval in principle while preserving unresolved details as explicit conditions.
- A condition continues to block its named activity until objectively satisfied at the applicable gate.
- `DEFERRED` work cannot be implemented implicitly; a later Owner decision must reopen it.

| ID | Decision title | Current recommendation | Available alternatives | Reason | Risk if not decided | Blocking status | Owner approval required | Owner decision | Approval date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-001 | V1 scope approval | Controlled V1 pilot only; no enterprise-scale expansion | Reject or redefine pilot through a new Owner decision | Freezes the V1 boundary | Scope creep or contradictory execution | G0 cleared for Sprint 1 planning; no implementation authorization | Yes | **APPROVED** | 2026-07-18 | Enterprise-scale Data Factory expansion prohibited |
| D-002 | Pilot geography | Bangkok first | Another geography only through a new Owner decision | Reduces geographic ambiguity | Manifest and validation scope would remain undefined | Cleared for Sprint 1 field/rule definition | Yes | **APPROVED** | 2026-07-18 | Bangkok |
| D-003 | Property/project type | New condominium projects only | Another single type only through a new Owner decision | Keeps the pilot homogeneous | Incompatible fields and duplicate logic | Cleared for Sprint 1 data standard | Yes | **APPROVED** | 2026-07-18 | Excludes second-hand individual, rental, land, villas, commercial, and user-submitted listings |
| D-004 | Maximum project count | Maximum 10; operating target 5 initially | Lower count by Owner decision; never exceed 10 in V1 | Keeps review tractable | Scope creep or insufficient pilot control | Cleared as a hard manifest limit | Yes | **APPROVED** | 2026-07-18 | Initial target: 5 projects |
| D-005 | Maximum record count | Maximum 100 normalized records | Lower Owner-approved cap | Bounds runtime and review | Unbounded workload/storage | Cleared as a hard manifest limit | Yes | **APPROVED** | 2026-07-18 | Normalized records |
| D-006 | Approved source count | Maximum 2 | One source; no source until G1 | Limits compliance/technical surface | Uncontrolled collection scope | Count cleared; individual sources still require G1 | Yes | **APPROVED** | 2026-07-18 | No live source nominated |
| D-007 | Source selection standard | Legally accessible, stable, attributable, verifiable, evidence-retainable, low-personal-data sources approved by template | Reject candidate; impose stricter source-specific conditions | Enforces source governance | Legal exposure or unverifiable records | Standard cleared; every source still requires approval | Yes | **APPROVED** | 2026-07-18 | No live source selected |
| D-008 | Evidence retention standard | Retain source name, source URL/access point, capture timestamp, evidence snapshot/payload, parser/adapter version, record version, review status, reviewer, approval timestamp, publication batch, rollback reference | Stricter source-specific retention | Supports traceability and rollback | Records cannot be proven or restored | Cleared for Sprint 1 evidence dictionary; retention period remains conditional under D-019 | Yes | **APPROVED** | 2026-07-18 | Rights and integrity fields remain applicable from V1 baseline |
| D-009 | Minimum required data fields | Sprint 1 defines exact dictionary across approved minimum categories | Add fields; document exclusions; no implementation | Converts categories into testable contract | Parser/reviewer completeness ambiguity | **Blocks G2 acceptance until dictionary is frozen** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | Must include identity, developer, geography, type, price, units, completion/construction, source/evidence/capture/freshness/review/version |
| D-010 | Data freshness rule | Capture time, last verified time, freshness status required; >30 days cannot be presented as current price/availability without re-verification | Stricter field-specific freshness | Prevents stale claims appearing current | Incorrect current price/availability | Cleared for Sprint 1 measurable rules | Yes | **APPROVED** | 2026-07-18 | 30-day current-claim limit |
| D-011 | Duplicate-handling rule | Deterministic project identity, external ID, normalized developer+project+location; human review for uncertainty | Stricter deterministic rules; no semantic automation in V1 | Explainable duplicate control | False merges or duplicate publication | **Blocks G2 acceptance until exact keys/outcomes are defined** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | Uncertain duplicates must never auto-merge |
| D-012 | Human reviewer role | 100% manual review | Multiple humans using same approved process | AI cannot approve | Unaudited or bypassed review | Role policy cleared; person assignment remains required before review | Yes | **APPROVED** | 2026-07-18 | No reviewer name invented |
| D-013 | Final approval role | Human Owner or explicitly assigned human reviewer; AI recommendation only | Owner retains role; Owner explicitly assigns another human | Preserves accountable final approval | Unapproved publication | Role policy cleared; named assignee required before G6 if delegated | Yes | **APPROVED** | 2026-07-18 | No final approver name invented |
| D-014 | Publishing target | GoThailandHome only; no third-party syndication | No publication; target change requires new Owner decision | Preserves one-site boundary | Syndication/scope creep | Target cleared; publication remains NO-GO | Yes | **APPROVED** | 2026-07-18 | No live publication authorized |
| D-015 | Publication rollback rule | Every batch versioned, traceable, reversible, linked to approved records, restorable to prior approved state | Stricter recovery target; no publication | Makes publication reversible | Irreversible incorrect publication | Policy cleared; runbook, named rollback owner, rehearsal still block G6 | Yes | **APPROVED** | 2026-07-18 | Publication remains NO-GO |
| D-016 | Windows 01 runtime boundary | Only scheduler, queue, collector, parser, validation worker, evidence, logs, monitoring, backup | Remove optional components; no Windows runtime | Prevents cross-project/production contamination | Unsafe host coupling | **Blocks G4 until inventory and readiness evidence; deployment not authorized** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | Principle only; no deployment |
| D-017 | Runtime storage location | Dedicated namespace under existing Windows 01 AI workspace: `D:\AI-Workspace\GoThailandHome-Data-Factory\` | Revised dedicated path after verification; no deployment | Provides logical isolation | Wrong path or cross-project contamination | **Blocks G4 until physical path and ACLs are verified on Windows 01** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | Proposed: runtime, config, data, evidence, logs, backups, reports, temp; do not create now |
| D-018 | Credential handling | Environment variables or approved secret store; least scope; rotation/revocation; never Git/logs/Markdown | Credential-free public/manual inputs; approved managed store | Prevents secret exposure | Critical security incident | **Blocks G4/collection until mechanism and rotation/revocation are verified** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | Principle only; no credentials recorded here |
| D-019 | Backup rule | Daily incremental where applicable; backup before publication and schema/runtime changes; evidence retention; restore verification | Stricter schedule; no runtime | Protects evidence/state and rollback | Data loss or unusable backup | **Blocks G4/G6 until destination, retention period, and restore test are defined** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | Retention period due Sprint 1 or Sprint 3 |
| D-020 | OCR decision | Conditional only for essential approved image/PDF data unavailable reliably as text; not default runtime | Prohibit OCR; approve source-specific OCR later | Avoids unnecessary/error-prone processing | OCR errors or extra runtime surface | Cleared as default exclusion; affected source requires separate justification/G4 | Yes | **APPROVED** | 2026-07-18 | OCR not in default V1 runtime |
| D-021 | Embedding decision | Defer until after V1 pilot evaluation | Reopen only by later Owner decision | Deterministic matching is sufficient for V1 | Premature opaque infrastructure | Non-blocking because implementation is prohibited | Yes | **DEFERRED** | 2026-07-18 | No embeddings in V1 |
| D-022 | Database implementation timing | Production database changes deferred; Sprint 1 logical model only | Separate future database proposal and approval gate | Protects Feature Freeze and production | Unauthorized migration/coupling | Sprint 1 planning cleared; all DB implementation remains blocked | Yes | **APPROVED** | 2026-07-18 | Separate approval gate required |
| D-023 | Adapter contract approval | Sprint 1 may define source/raw/evidence/capture/version/normalized/validation/error/idempotency/retry contract | Defer contract; narrower fixture contract | Enables safe boundary without live implementation | Premature or unsafe adapter | **Blocks implementation; Sprint 1 definition only** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | No live adapter implementation |
| D-024 | Pilot success threshold | All P0 pass: 100% source traceability, evidence retention, and human review; no unapproved publication; rollback succeeds; no credential exposure or cross-project contamination; runtime/backup verified; limits respected | Add stricter measurable thresholds | Makes GO evidence-based | Subjective success | **Blocks G2/G7 until Sprint 1 converts principles into measurable thresholds** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | No P0 waiver |
| D-025 | Pilot failure threshold | Immediate stop for source-compliance uncertainty, missing evidence, untraceable records, credential exposure, unapproved publication, rollback failure, cross-project contamination, materially incorrect property information, exceeded source/record limits, or pilot-caused Windows 01 instability | Add stricter stop conditions | Defines fail-closed behavior | Unsafe continuation | **Blocks G2/G5 until Sprint 1 defines objective detection/stop tests** | Yes | **CONDITIONAL APPROVAL** | 2026-07-18 | All listed stop conditions mandatory |

## Deferred technical decisions

These remain unresolved implementation details:

- exact repository/service placement and runtime language;
- scheduler, queue, runtime metadata store, evidence store, and monitoring products;
- physical verification and ACLs for `D:\AI-Workspace\GoThailandHome-Data-Factory\`;
- backup destination and retention period;
- source-specific parser and optional OCR product;
- assigned human reviewer/final approver/rollback owner;
- exact Sprint 1 field dictionary, duplicate tests, success metrics, and failure tests;
- production website content interface and any database migration or live adapter.

They require later gate evidence. None authorizes code, deployment, collection, publication, or database changes.

## Owner sign-off

- **Package disposition:** **APPROVED WITH RECORDED CONDITIONS**
- **Human Owner:** _Authoritative Owner directive; personal name not supplied_
- **Decision date:** **2026-07-18**
- **Conditions:** As recorded in D-009, D-011, D-016–D-019, D-023–D-025 and the unresolved implementation details above.

