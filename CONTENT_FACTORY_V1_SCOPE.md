# Content Factory V1 Scope

**Phase:** GoThailandHome Alpha RC — Feature Freeze  
**Status:** Executable planning baseline; implementation requires later approval  
**Pilot:** GoThailandHome only, controlled and reversible

## V1 objective

Prove that a small set of approved property-project records can move from source registration through immutable evidence, deterministic normalization, validation, duplicate control, one human review workflow, a versioned publication package, and rollback without changing the current production website or database during Alpha RC.

V1 narrows the six enterprise baseline documents to one site, 1–2 trusted sources, 5–10 projects, and at most 100 records. It validates the baseline principles; it does not implement the baseline's multi-site scale.

## A. Required for V1

- One approved GoThailandHome pilot configuration.
- A pilot property/project data contract and source-evidence contract.
- Manual source registration and owner-approved collection policy.
- Exactly 1–2 legally accessible, stable, attributable sources.
- At least 5 and at most 10 property projects; at most 100 total project/property records.
- Immutable raw evidence or a retained immutable evidence snapshot/reference, SHA-256 hash, source identity, canonical URL/file reference, timestamps, rights snapshot, and collection job ID.
- Original and normalized values, deterministic parser/normalizer versions, record versions, lifecycle events, and audit events.
- Exact duplicate checks plus deterministic candidate matching on source external ID, canonical URL, normalized project/developer name, and geography.
- One manual review workflow: `candidate -> intake_review -> fact_review -> duplicate_review -> publish_review -> approved/publish_ready`, with reject, quarantine, and change-request exits.
- Human approval for sources, data standard, runtime deployment, each publish package, and any publication.
- A versioned GoThailandHome package exported to a staging/non-production handoff boundary.
- A rehearsed rollback to the previous package version and preservation of all audit history.
- Minimal logs, health checks, backup, restore test, access controls, and credential references.

## B. Deferred until after V1

- Multi-tenant or multi-site operation; additional publishing targets.
- Production database integration or any schema migration.
- Automated production website release tooling or direct unattended publishing.
- Distributed services, high availability, autoscaling, orchestration clusters, and enterprise workflow engines.
- Broad crawling, unrestricted scraping, source discovery, and more than two sources.
- AI extraction, generative rewriting, automated translation, media derivatives, and advanced confidence scoring.
- Embeddings/vector search and semantic duplicate matching.
- Full entity graph, relationship automation, taxonomy engine, translation memory, and multi-language publishing.
- Media collection beyond evidence capture.
- OCR unless a selected approved pilot source contains necessary image-only/scanned content and deterministic extraction is otherwise impossible.
- Operational scale beyond 10 projects or 100 records.

## C. Prohibited during V1

- Collection from unregistered, unapproved, restricted, unstable, or legally questionable sources.
- Bypassing robots directives, access controls, terms, rate limits, or source policy.
- Inventing missing facts or treating confidence as approval.
- Publishing without a recorded human decision tied to the exact package version/hash.
- Writing to the Alpha RC production database or modifying its schema.
- Hosting ERP, production frontend, release tooling, unrelated projects, or experimental services on Windows 01.
- Cross-project data, credentials, queues, storage paths, or logs.
- Silent overwrite, destructive correction, or evidence deletion.
- Exceeding the pilot limits without a new owner-approved scope decision.

## Pilot and data-source limits

| Boundary | V1 limit |
| --- | --- |
| Sites | 1: GoThailandHome |
| Trusted sources | 1–2 |
| Projects | 5–10 |
| Total project/property records | 100 maximum |
| Workflow | 1 manual workflow |
| Publishing target | GoThailandHome only |
| Languages | Source language plus existing approved package fields; no automated localization |
| Collection | Approved pages/files only; no discovery crawl |

## Human review requirement

One named human may perform multiple V1 review roles, but every decision must identify the reviewer, role, target record/package version, evidence viewed, decision, reason, comment, and timestamp. Price, currency, availability, ownership, and official-status claims are high risk and require explicit fact approval. AI and deterministic checks may propose or flag; they cannot approve.

## Publishing boundary

The factory produces a validated, immutable, versioned package for GoThailandHome. During Feature Freeze, the handoff ends at a staging/non-production artifact and publication simulation. Any later production consumption is a separately approved website change. The runtime must not control page rendering or website releases.

## Rollback boundary

Before any approved post-freeze publication, preserve the current package/version and deployment configuration. Rollback means atomically restoring the prior approved package pointer or removing the pilot package, verifying the website-visible state, retaining failed/new versions, and recording the rollback event. Database rollback is out of scope because V1 must not write to the production database.

## Explicit assumptions

1. `GO_THAILAND_HOME_CURRENT_STATUS.md` does not exist; Alpha RC and Feature Freeze are accepted from the task directive.
2. The six baseline files are design inputs, not implementation authorization.
3. Final runtime language, storage engine, queue product, scheduler product, and package adapter are unresolved; V1 tasks must select the smallest approved options without creating production coupling.
4. Windows 01 is a dedicated pilot runtime candidate; its readiness, security, backup destination, and network policy are not yet approved.
5. Mac mini remains the control plane for repository work, operator actions, package inspection, and owner approval—not a second runtime.
6. Source choices will be made without live research in this planning task.
7. The existing production content contract is not assumed; adapter compatibility must be confirmed before implementation.

## Baseline conflicts and narrowing decisions

- The baseline targets 100+ sites and broad mixed-source ingestion; V1 intentionally proves one property pilot only.
- The baseline implementation plan recommends many parser types; V1 implements only the parser(s) required by approved pilot sources.
- The baseline includes future scheduling and production publishing; V1 allows a minimal scheduler but collection remains bounded, and publication is simulated during Feature Freeze.
- The baseline suggests embeddings as a duplicate method; V1 defers embeddings in favor of explainable deterministic matching.
- The baseline logical database is not authorization for tables or migrations; V1 must use an isolated runtime store or fixtures only after owner approval.

## Approval gates

| Gate | Approval | Required evidence | Blocks |
| --- | --- | --- | --- |
| G0 Planning baseline | ChatGPT owner-level decision + Human Owner | Eight V1 documents internally consistent | All implementation |
| G1 Sources | Human Owner | Rights/collection policy, owner, allowed method, refresh policy | Collection |
| G2 Data standard | Human Owner | Required fields, evidence contract, validation rules | Runtime build/ingestion |
| G3 Technical boundary | Human Owner | Repo/service location, isolated storage, package adapter contract, rollback design | Implementation |
| G4 Windows 01 | Human Owner | Readiness, security, network, backup/restore, removal plan | Deployment |
| G5 Pilot manifest | Human Owner | Named sources, 5–10 projects, record cap | Live pilot collection |
| G6 Publish package | Human Publisher/Owner | Review completion, package hash/version, rollback rehearsal | Publication |
| G7 Pilot GO/NO-GO | Human Owner with ChatGPT recommendation | Acceptance results and risk review | Any expansion |

