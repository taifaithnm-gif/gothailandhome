# Content Factory V1 Acceptance Criteria

**Priority:** P0 = mandatory and release-blocking; P1 = recommended and reported; P2 = explicitly deferred.  
**Rule:** A P0 failure yields NO-GO/HOLD. AI cannot waive a P0.

## Data standard

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-D01 | P0 | The versioned contract accepts all approved golden fixtures and rejects every missing/invalid required field fixture with a field-level error. | Automated contract suite |
| AC-D02 | P0 | Every normalization stores original value, normalized value, rule version, actor/process, and timestamp; null remains null. | Fixture diff and audit query |
| AC-D03 | P0 | Price, when present, includes explicit currency, value/basis, “as of” time, evidence, and human approval; no currency is inferred silently. | 100% high-risk field audit |
| AC-D04 | P1 | Controlled values and field definitions are documented with valid/invalid examples. | Contract review |

## Source traceability and evidence retention

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-E01 | P0 | 100% of raw items identify approved source, job, canonical URL/file reference, capture time, MIME type, rights snapshot, SHA-256, and payload URI/reference. | Completeness query |
| AC-E02 | P0 | 100% of package fields resolve to evidence; high-risk fields resolve to an exact quote/value and page/section/row/cell/character location. | Package-to-evidence traversal |
| AC-E03 | P0 | Re-hashing every sampled retained payload and every restored payload equals its manifest hash. | Full pilot hash check |
| AC-E04 | P0 | Refresh, rejection, supersession, and rollback preserve previous evidence and versions; mutation/deletion attempts are rejected or audited. | Lifecycle and negative tests |
| AC-E05 | P1 | Evidence retention/takedown policy has owner, duration, and legal-hold behavior. | Policy review |

## Ingestion and parsing

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-I01 | P0 | Collector refuses unregistered sources, non-manifest URLs/files, unapproved methods, and a 101st record. | Allow/deny integration tests |
| AC-I02 | P0 | Re-running the same collection job creates no duplicate canonical raw item and records a no-change/idempotent result. | Repeat-run test |
| AC-I03 | P0 | Evidence storage failure prevents parser execution and leaves a correlated failure record. | Injected storage failure |
| AC-P01 | P0 | Golden source fixtures produce expected title/fields and citeable sections using a recorded parser version. | Golden parser tests |
| AC-P02 | P0 | Empty, malformed, oversized, unsupported, or low-confidence inputs become failed/quarantined records and are never silently dropped. | Negative parser suite |
| AC-P03 | P1 | In-scope parser success is >=95%; all remaining records are explicitly quarantined with reasons. | Pilot reconciliation |

## Validation and duplicate detection

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-V01 | P0 | All required-field, type, range, geography, evidence, date, unit, and currency rules produce deterministic pass/fail results. | Repeated validation suite |
| AC-V02 | P0 | A record with any P0 validation failure cannot enter approved or publish_ready state. | State-transition negative test |
| AC-X01 | P0 | Seeded exact duplicates by content hash, canonical URL, and source external ID are detected with 100% recall. | Seeded duplicate set |
| AC-X02 | P0 | Seeded candidates sharing normalized project name + developer + geography are grouped for human review with match reasons. | Deterministic candidate suite |
| AC-X03 | P0 | Every duplicate group has an immutable merge/keep/false-positive decision before package inclusion; member evidence survives merge. | Group reconciliation |
| AC-X04 | P2 | Embedding/vector semantic duplicate matching. | Deferred; no V1 deployment |

## Manual review and approval

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-R01 | P0 | 100% of candidate package records have completed intake, fact, duplicate, and publish review requirements. | Review-state query |
| AC-R02 | P0 | Every decision stores reviewer ID, role, target object/version, decision, reason, comment, evidence references viewed, and timestamp. | Decision completeness query |
| AC-R03 | P0 | Invalid workflow transitions and attempts to overwrite a decision fail; correction creates a new version/decision. | Transition/mutation tests |
| AC-R04 | P0 | No open mandatory task, unresolved critical conflict, or unknown rights status exists at package assembly. | Blocking-gate query |
| AC-R05 | P1 | Review elapsed time and rework count are measured per record and summarized. | Pilot metrics |

## Publication and rollback

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-U01 | P0 | Package contains only approved GoThailandHome pilot records, package version, manifest, citations, source IDs, and content hash. | Package schema/manifest test |
| AC-U02 | P0 | Rebuilding from unchanged approved inputs produces byte-equivalent canonical output and the same content hash. | Two clean builds |
| AC-U03 | P0 | During Feature Freeze, adapter tests use only a staging/local fixture; network/log audit shows no production write or release. | Endpoint and audit review |
| AC-U04 | P0 | Publication requires an immutable human approval tied to the exact package version/hash. | Publish-gate negative/positive tests |
| AC-B01 | P0 | Rollback restores the prior package pointer/output within 15 minutes and verification matches the prior hash. | Timed rollback drill |
| AC-B02 | P0 | Rollback retains both versions and records actor, reason, start/end, result, and verification. | Audit query |

## Logging, backup, and runtime stability

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-L01 | P0 | Every stage emits job/record IDs, status, timestamps, input/output version IDs, error code, and retry count. | End-to-end log trace |
| AC-L02 | P0 | Secret/payload canaries never appear in logs; logs rotate at configured size/age and remain queryable for pilot retention. | Redaction/rotation test |
| AC-K01 | P0 | Backup includes evidence, manifests, state, decisions, configuration, and version inventory at an approved separate destination. | Backup manifest check |
| AC-K02 | P0 | A clean restore reproduces all records and 100% sampled hashes and permits a review/package rebuild. | Restore drill |
| AC-T01 | P0 | Runtime survives service restart without lost/duplicated jobs; interrupted job resumes or fails explicitly and idempotently. | Restart fault test |
| AC-T02 | P0 | Health checks expose runtime, queue/job state, evidence store, disk threshold, and last backup; test alerts fire. | Synthetic health/alert test |
| AC-T03 | P1 | Pilot execution stays inside the approved CPU, memory, disk, and job-duration baseline set at G4. | Resource report |

## Security

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-S01 | P0 | Dedicated non-admin service identity has write access only to pilot paths; unauthorized identity tests fail. | ACL tests |
| AC-S02 | P0 | Network tests show default-deny inbound and egress only to approved sources, backup, time/DNS, and approved monitoring destinations. | Firewall/connection audit |
| AC-S03 | P0 | No raw credential exists in repository, config export, evidence, package, queue payload, or logs; only approved secret references are used. | Secret scan + runtime inspection |
| AC-S04 | P0 | No ERP, production frontend/database/release tool, or unrelated project data/service is present or reachable from the pilot identity. | Inventory and access tests |
| AC-S05 | P1 | Dependency inventory is pinned and reviewed for known critical vulnerabilities before deployment. | SBOM/inventory review |

## Pilot completion

| ID | Pri | Objectively testable criterion | Verification |
| --- | --- | --- | --- |
| AC-C01 | P0 | Final set contains 1–2 approved sources, 5–10 projects, and <=100 records. | Manifest/count reconciliation |
| AC-C02 | P0 | 100% P0 criteria pass with linked evidence; exceptions are zero, not waived. | Signed scorecard |
| AC-C03 | P0 | Zero production website/database/schema/deployment changes occurred during planning and Feature Freeze pilot validation. | Git, endpoint, deployment audit |
| AC-C04 | P0 | Human Owner records G7 GO/NO-GO; no repeat, publication, or expansion occurs automatically. | Decision record |
| AC-C05 | P1 | Reviewer effort, parser failure rate, duplicate rate, correction rate, storage growth, and recovery times are reported. | Metrics report |
| AC-C06 | P2 | Multi-site scale, localization, AI extraction, media pipeline, embeddings, and distributed architecture. | Deferred roadmap only |

