# Content Factory V1 Sprint Backlog

**Execution rule:** Planning does not authorize implementation. Each task is independently executable and verifiable after its dependencies and approval gates are met.  
**Roles:** Cursor = implementation/test execution when later authorized; ChatGPT = owner-level priority/gate recommendation; Human Owner = approvals; Human Reviewer/Publisher = review/publication decisions. Claude is not used in V1 planning.

Risk is `L/M/H`; complexity is `S/M/L`. “Approval” names the Human Owner gate required before the task may be treated as accepted or used downstream.

## Sprint 0 — Baseline confirmation and decision freeze

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF0-01 | Baseline conflict log | Freeze all V1 narrowings against the six design documents | Six baselines; V1 scope | Signed conflict/assumption log | None | Mac mini/docs | Cursor drafts; ChatGPT prioritizes | Cross-document review | Every narrowing and unresolved choice is explicit; no silent contradiction | M | S | Yes, G0 |
| CF0-02 | Architecture placement decision | Decide same repo vs separate service/repo and isolated storage | Baseline decision points; Feature Freeze | ADR proposal with rollback/removal | CF0-01 | Mac mini/docs | Cursor drafts; Human Owner decides | Decision checklist | Runtime cannot write production DB or couple to frontend; owner records choice | H | S | Yes, G3 |
| CF0-03 | Pilot gate register | Freeze approvers, evidence, and stop conditions | V1 scope; risk register | Gate register G0–G7 | CF0-01 | Mac mini/docs | Cursor + ChatGPT | Owner walkthrough | Named approver and required evidence exist for every gate | M | S | Yes, G0 |

**Sprint deliverable:** Approved V1 decision baseline and implementation stop/go gates.

## Sprint 1 — Property data standard and source-evidence standard

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF1-01 | Property/project contract | Define minimal canonical record and field semantics | Baseline data model; pilot definition | Versioned JSON/schema proposal and examples | CF0-02 | Mac mini/local fixtures | Cursor | Contract tests against valid/invalid fixtures | Required fields, types, unknown handling, original/normalized values defined | H | M | Yes, G2 |
| CF1-02 | Evidence contract | Define immutable provenance per field/record | Source/raw/section baseline objects | Evidence manifest schema | CF0-01 | Mac mini/local fixtures | Cursor | Traceability fixture test | Every publishable field resolves to source, payload hash, location/quote, rights snapshot, capture time | H | M | Yes, G2 |
| CF1-03 | Source policy template | Make source approval objectively reviewable | Source Registry baseline; legal risks | Source registration/approval checklist | CF0-03 | Mac mini/docs | Cursor drafts; Human Owner approves | Negative policy test | Unapproved method/source cannot produce a collection job | H | S | Yes, G1 |
| CF1-04 | Pilot manifest | Name 1–2 sources and 5–10 projects without collection | Approved source candidates supplied by owner | Signed bounded manifest | CF1-03 | Mac mini/docs | Human Owner; Cursor records | Count and policy audit | 1–2 approved sources, 5–10 projects, <=100-record cap stated | H | S | Yes, G5 |

**Sprint deliverable:** Owner-approved data, evidence, source-policy, and pilot contracts.

## Sprint 2 — Manual review and approval workflow

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF2-01 | Review state machine | Implement/specify one workflow and exception paths | Review baseline; G2 contracts | State-transition contract | CF1-01, CF1-02 | Local test runtime | Cursor | Transition matrix tests | Invalid transitions fail; publish_ready requires all mandatory reviews | H | M | Yes, G2 |
| CF2-02 | Reviewer checklist | Make evidence/fact/duplicate/publish review repeatable | Data/evidence contracts | One V1 checklist with reason codes | CF2-01 | Mac mini/review interface or file | Cursor; Human Reviewer validates | Checklist rehearsal on fixtures | Price, currency, availability, identity, evidence, duplicate status covered | H | S | Yes, G2 |
| CF2-03 | Immutable decision record | Capture who approved exactly which version | Review baseline; evidence contract | Decision/audit contract | CF2-01 | Isolated runtime store | Cursor | Mutation and audit tests | Decisions cannot be silently overwritten; actor, role, target version, reason, time retained | H | M | Yes, G3 |

**Sprint deliverable:** Tested single manual workflow and audit contract.

## Sprint 3 — Minimal runtime foundation

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF3-01 | Runtime ADR and inventory | Select minimal scheduler, queue, runtime store, evidence store, logs | CF0-02; Windows boundary | Approved component/version inventory | CF0-02, CF1-01, CF2-03 | Mac mini design; Windows 01 target | Cursor drafts; Human Owner decides | Dependency/security review | No undocumented service; each component has health check and removal plan | H | M | Yes, G3/G4 |
| CF3-02 | Isolated runtime skeleton | Establish non-production service boundaries and configuration | Approved ADR | Reversible runtime skeleton | CF3-01 | Windows 01 isolated pilot | Cursor | Startup/shutdown smoke test | No production DB/frontend/release dependency; clean removal succeeds | H | M | Yes, G4 |
| CF3-03 | Evidence/version store | Preserve immutable payloads, manifests, hashes, and versions | CF1-02; storage decision | Isolated evidence repository | CF3-02 | Windows 01 | Cursor | Write/read/hash/tamper tests | Retrieval reproduces hash; prior versions retained; access denied by default | H | M | Yes, G4 |
| CF3-04 | Logging, monitoring, backup | Add bounded operations and recovery | CF3-02, CF3-03 | Structured logs, health check, backup/restore procedure | CF3-02, CF3-03 | Windows 01 + approved backup target | Cursor; Human Owner approves target | Alert, backup and restore drill | Job/record correlation works; restore matches hashes; no secrets in logs | H | M | Yes, G4 |

**Sprint deliverable:** Minimal isolated runtime that starts, stops, backs up, restores, and can be removed.

## Sprint 4 — Pilot collector and ingestion

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF4-01 | Approved-source collector | Collect only manifest URLs/files using one minimal collector profile | Signed pilot manifest; source policy | Idempotent collector | CF1-04, CF3-04 | Windows 01 | Cursor | Allow/deny and fixture integration tests | Rejects all non-manifest inputs; respects method/rate policy; retry is idempotent | H | M | Yes, G1/G5 |
| CF4-02 | Raw ingestion | Store payload/reference and collection metadata before parsing | Collector output; evidence contract | Raw items and collection-job audit | CF4-01, CF3-03 | Windows 01 | Cursor | Hash/replay/failure tests | 100-record hard cap; evidence failure blocks parsing; errors retained | H | M | Yes, G5 |
| CF4-03 | Source-specific parser | Parse only selected pilot formats with citeable locations | Raw pilot fixtures | Versioned parsed documents/sections | CF4-02 | Windows 01 | Cursor | Golden fixture tests | Required text/fields and section references match fixtures; failure quarantines | H | M | No (within approved G5) |

**Sprint deliverable:** Bounded, idempotent ingestion from approved sources to citeable parsed records.

## Sprint 5 — Normalization, validation and duplicate control

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF5-01 | Deterministic normalization | Normalize names, geography, dates, units, prices/currency while retaining originals | Parsed records; data contract | Versioned candidate records | CF4-03, CF1-01 | Windows 01 | Cursor | Golden and property-based tests | No invented values; transformations/version recorded; currency never inferred silently | H | M | No |
| CF5-02 | Validation gates | Reject/quarantine incomplete or invalid candidates | Candidate records; required rules | Validation report/status | CF5-01 | Windows 01 | Cursor | Positive/negative fixture suite | All P0 rules deterministic; errors identify field/evidence; invalid records cannot review-pass | H | M | No |
| CF5-03 | Duplicate candidates | Detect exact and explainable likely duplicates | Valid candidates; existing pilot records | Duplicate groups with match reasons | CF5-02 | Windows 01 | Cursor | Seeded duplicate test set | Hash/URL/external ID exact matches found; deterministic project/developer/geography candidates routed to review | M | M | No |

**Sprint deliverable:** Validated candidates with original values, deterministic versions, and reviewable duplicate groups.

## Sprint 6 — Manual review execution

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF6-01 | Intake and fact review | Verify every candidate against retained evidence | Validation reports; evidence; checklist | Approved/rejected/change-request decisions | CF5-03, CF2-02 | Mac mini review client + Windows store | Human Reviewer | 100% decision/evidence audit | Every publishable P0 field approved; unsupported values rejected/unknown | H | L | Yes, reviewer |
| CF6-02 | Duplicate resolution | Select canonical records without losing evidence | Duplicate groups; reviewed candidates | Merge/keep-separate decisions | CF6-01 | Mac mini review client | Human Reviewer | Seed reconciliation | Every group resolved; all member evidence retained; false-positive reason recorded | H | M | Yes, reviewer |
| CF6-03 | Review completion audit | Confirm package candidates meet all gates | Review decisions and audit trail | Signed review completion report | CF6-01, CF6-02 | Mac mini | Cursor checks; Human Publisher certifies | Independent query/reconciliation | Zero open P0 review tasks/conflicts; exact versions identified | H | S | Yes, G6 prerequisite |

**Sprint deliverable:** Fully human-reviewed canonical pilot set.

## Sprint 7 — Controlled publication and rollback test

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF7-01 | Package assembly | Build one deterministic GoThailandHome package | Certified records; adapter contract | Versioned package, hash, manifest, citations | CF6-03, CF0-02 | Windows 01 build; Mac mini inspect | Cursor | Rebuild/contract tests | Same inputs produce same hash; all records cite evidence; <=100 records | H | M | No |
| CF7-02 | Staging handoff simulation | Validate adapter boundary without production changes | Package; non-production adapter fixture | Handoff result and logs | CF7-01 | Staging/local fixture only | Cursor | Contract/smoke test | No production endpoint/write; validation and failure reporting pass | H | M | Yes, G6 |
| CF7-03 | Rollback rehearsal | Restore previous package pointer/remove pilot package | Two fixture package versions; rollback runbook | Timed rollback evidence | CF7-02 | Staging/local fixture only | Cursor executes; Human Publisher witnesses | Before/after hash and visibility checks | Prior version restored within target; new version retained; event audited | H | M | Yes, G6 |
| CF7-04 | Publication decision | Decide whether any post-freeze publication may proceed | Reviews, package, rollback evidence, Alpha RC status | Recorded GO/HOLD/REJECT | CF7-03 | Mac mini approval gate | Human Owner/Publisher; ChatGPT recommends | Gate checklist | During Feature Freeze outcome is HOLD; later GO requires lifted freeze and explicit approval | H | S | Yes, G6 |

**Sprint deliverable:** Validated package and successful non-production rollback rehearsal; no production publication during freeze.

## Sprint 8 — Pilot evaluation and GO / NO-GO review

| ID | Task | Objective | Input | Output | Depends on | Environment | Responsible | Verification | Acceptance criteria | Risk | Size | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF8-01 | Metrics reconciliation | Measure pilot against all P0/P1 criteria | Logs, records, decisions, package, recovery tests | Pilot scorecard | CF7-04 | Mac mini analysis | Cursor | Reconcile counts/hashes to source records | Every P0 has evidence; exceptions and P1 misses listed | M | M | No |
| CF8-02 | Risk and incident review | Reassess release blockers and operational burden | Risk register; incidents; reviewer timing | Residual-risk report | CF8-01 | Mac mini/docs | Cursor + ChatGPT | Owner review | All release-blocking risks closed or explicitly accepted; no concealed incident | H | S | Yes, G7 |
| CF8-03 | GO / NO-GO decision | Decide stop, repeat, publish later, or expand | Scorecard and residual risks | Signed decision with bounded next scope | CF8-02 | Mac mini approval gate | Human Owner; ChatGPT recommends | Decision record completeness | Decision states evidence, constraints, owner, date, and no automatic scale-up | H | S | Yes, G7 |

**Sprint deliverable:** Evidence-based GO/NO-GO; expansion is a new approved phase, never an automatic V1 action.

## Backlog-wide completion rules

- No task bypasses its approval or predecessor.
- Every deployment task includes startup, health check, backup where stateful, and clean rollback/removal.
- Every publication task requires human approval tied to an exact version/hash.
- A failed P0 criterion stops the critical path and opens a corrective task; it is never waived by AI.

