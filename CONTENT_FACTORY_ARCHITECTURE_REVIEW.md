# Content Factory — Senior Architecture Review

**Reviewed:** 6 documents, 4,110 lines · **Date:** 2026-07-17
**Baseline:** documentation-only design by Cursor · **Review type:** read-only architecture review
**Target runtime:** Windows 01 (24×7) · **Development/review machine:** Mac mini
**Decisions:** `CONTENT_FACTORY_DECISION_REGISTER.md` (55 entries)

> **Revision 2 — 2026-07-17.** A second independent review pass reached the same
> verdict and the same five P0s by an independent route. Its additional findings are
> merged as CFD-35 … CFD-55 and folded into §3.12, §4.11, §5, §6.2 and §8 below.
> No earlier conclusion is overturned. The convergence is itself a finding: two
> independent passes landing on the same five blockers means the P0 set is not a
> matter of reviewer taste.

---

## 1. Executive verdict

**The domain design is good. The system design does not exist yet.**

These six documents describe *what the Content Factory knows* with real rigour —
source-first provenance, evidence-bound claims, human-governed approval,
site-independent entities. That conceptual core is sound, and it is the hard part
to get right. It does not require redesign.

But the documents never describe *what the Content Factory runs on*. Across 4,110
lines, these terms appear **zero times**:

> Windows · Docker · WSL · Redis · MinIO · Tailscale · pgvector · Postgres ·
> worker · chunk · concurrency · restart · dead-letter · poison · oversize ·
> throughput · volume · cost · cron · restore · PDPA · GDPR

`idempotent` appears **once** — as a five-word sentence with no mechanism.
`backup` appears **once** — as a bullet in a "required before production" list.
`retry` appears **once**. `robots` appears **once**, as a field name that no table
defines.

This is not a gap to be patched during implementation. **It means the Windows 01
readiness validation that this review is meant to unlock cannot be performed**,
because there is nothing to validate against. You cannot audit a machine for
Redis, pgvector, MinIO, and OCR workers when no document says the system uses
them. The six documents describe a data model and a governance workflow, then
stop at the boundary where the operational system would begin.

The second structural problem is sequencing. `IMPLEMENTATION_PLAN.md` places the
pilot website at **Phase 14 of 15** — after thirteen phases of platform
construction, including a knowledge graph, translation memory, a media pipeline,
and a confidence-scoring service. The brief for this work states the first
implementation must remain a small pilot. The plan proposes the opposite: build
the enterprise, then find out whether it works on one site. Every assumption in
the design would go unvalidated for the entire construction period.

The third is scope calibration. The design is dimensioned for "100+ websites" — a
figure that appears in five documents and is supported nowhere by a volume,
throughput, reviewer-capacity, or cost estimate. That unexamined number is the
root cause of most of the overengineering below: 15 entity types for 5 sites (two
of which are hypothetical), 10 reviewer roles, 6 review levels, and an
8-component weighted confidence model whose weights are invented.

**Verdict: the documentation must be revised before Windows 01 validation is
meaningful.** The revision is bounded and mostly subtractive — cut the scope
claim, add a runtime layer, reconcile three state vocabularies, and move the
pilot to the front. The knowledge model largely survives intact.

---

## 2. Strongest parts of the design

These are genuinely good and should be preserved through any revision.

| Strength | Where | Why it matters |
| --- | --- | --- |
| **Source-first with hard gates** | `PIPELINE §3`, `ARCHITECTURE §7` | "No unregistered source can be collected. No source can be published to a site without source-site permission." This is the correct primitive, stated as an enforceable gate rather than an aspiration. It is the single best decision in the design. |
| **Evidence bound to claims, not to prose** | `DATABASE §9`, `DATA_MODEL §13` | `cf_fact_evidence` carries `evidence_quote`, `evidence_hash`, `document_section_id`. Facts cite a *character range in a parsed section*, not a URL. This is what makes "no fabrication" auditable rather than a slogan. |
| **"Missing facts remain unknown"** | `ARCHITECTURE §2.4` | Explicitly forbids confidence scoring from laundering unknowns into publishable facts. Most content pipelines get this wrong. |
| **Raw / parsed / normalized / reviewed separation** | `ARCHITECTURE §4` | Four distinct layers with immutable raw evidence at the base. Correct, and it is what makes reprocessing and re-review possible. |
| **Site-independent core with configuration overlays** | `ARCHITECTURE §6`, `DATABASE §4` | The right shape for multi-site reuse — shared entities, per-site policy. The *idea* is sound even though the tenancy mechanics are missing (§5). |
| **Publishing as versioned packages + adapters** | `PIPELINE §22` | "The factory does not prescribe page design." Correctly refuses to couple the factory to website UI. This boundary is clean and should be defended. |
| **Claim vs Fact distinction** | `DATA_MODEL §14` | `support_level: directly_verified / source_claimed / editorial_interpretation / unsupported` is a sophisticated and correct modelling instinct — marketing copy is not a fact. (It has no table; see §3.) |
| **Review reason codes** | `REVIEW_WORKFLOW §18` | Structured, enumerable decision codes rather than free text. Makes review auditable and measurable. |
| **Explicit non-goals** | `ARCHITECTURE §8` | "Not a crawler-first system. Not a permission bypass." Naming what the system refuses to be is a mark of a serious design. |

---

## 3. Major contradictions

Ten conflicts where two documents cannot both be implemented as written.

### 3.1 The `Claim` object has no table — **P1**

`DATA_MODEL §14` defines Claim as a first-class object with `claim_text`,
`claim_type`, `support_level`, and evidence. `PIPELINE §9` extracts claims.
`IMPLEMENTATION_PLAN §9` lists "Claim extraction" as core work.
**`DATABASE.md` has no `cf_claims` table.** It has `cf_facts`,
`cf_fact_evidence`, and `cf_claim_conflicts` — and `cf_claim_conflicts` resolves
only `candidate_fact_ids`, so it cannot even hold a conflict between two claims.

The Claim/Fact distinction is one of the design's best ideas (§2) and it is
unstorable. Either add the table or collapse Claim into Fact with a
`support_level` column — but the three documents must agree.

### 3.2 Three incompatible state vocabularies — **P0**

| Document | States | Includes |
| --- | --- | --- |
| `ARCHITECTURE §5.16` | 13 + 6 exception | `localized`, `refreshed` |
| `DATA_MODEL §3` | 14 | **no** `localized`, **no** `refreshed`; adds `rejected`, `quarantined`, `removed` |
| `REVIEW_WORKFLOW §3` | 18 + 6 exception | `intake_review`, `fact_review`, `localization_ready`, `publish_review`, `refresh_required` — **none of which appear in the other two** |

`cf_facts.lifecycle_state`, `cf_content_items.lifecycle_state`, and
`cf_lifecycle_events.from_state/to_state` are all typed against a vocabulary that
**does not exist in any single document**. No transition table, no guards, no
terminal states, no legal-transition matrix. Three authors' state machines have
been laid side by side and never reconciled.

This is P0: it is not a naming quibble. Lifecycle state is the spine of the whole
system, and an implementer would have to invent it — differently in each service.

### 3.3 Review decisions cannot store what governance requires — **P1**

`REVIEW_WORKFLOW §2.4` ("Auditable decisions") requires every decision to store
reviewer, timestamp, reason, **and target version**. `§20` additionally requires
**role**, **before and after workflow state**, and **evidence references viewed
or attached**.

`DATABASE §15 cf_review_decisions` stores: `id`, `review_task_id`, `decision`,
`reason_code`, `comment`, `reviewer_id`, `decided_at`. **All four governance
fields are missing.** `DATA_MODEL §22` includes `target_version` — so the data
model and the workflow agree with each other and the database disagrees with
both.

Consequence: you could not answer "which version did the reviewer approve, and
what did they look at?" — which is the entire point of the audit trail. The
`no_silent_overwrite` principle (`§2.5`) is unenforceable without `target_version`.

### 3.4 Embedding similarity has no storage and no engine — **P1**

Embedding similarity is specified as a method in `ARCHITECTURE §5.15` (duplicate
detection), `PIPELINE §11` (entity resolution), and `PIPELINE §15`. But:

- `DATABASE.md` has **no** embeddings table, **no** chunk table, **no** vector column.
- The word `chunk` appears **zero times** across all six documents.
- `IMPLEMENTATION_PLAN §23` defers "Search and vector index strategy" to an
  undecided architecture decision point.

So three documents specify a capability that has no storage, no chunking
strategy, and no chosen engine — while the review brief expects pgvector on
Windows 01. Either the capability is real (then model chunks + embeddings and
pick the engine) or it is aspirational (then delete it from the methods lists).

### 3.5 Two table-naming conventions — **P1**

`DATABASE §4` names three tables `content_factory_tenants`,
`content_factory_sites`, `content_factory_site_policies`. **Every other table in
the document** uses the `cf_` prefix (`cf_sources`, `cf_entities`,
`cf_facts`, …). Trivial to fix, but it is a tell: the document was assembled
rather than designed, and it is the kind of drift that produces two migrations.

### 3.6 Reviewer roles: 7 vs 10 — **P2**

`ARCHITECTURE §5.9` lists 7 roles. `REVIEW_WORKFLOW §4` defines 10 — adding
Entity Reviewer, Relationship Reviewer, and Duplicate Reviewer. The architecture
document is the one that claims to be authoritative on components.

### 3.7 Confidence signals: 10 vs 8 — **P2**

`ARCHITECTURE §5.14` lists **10** signal groups, including `duplicate_risk` and
`media_rights_confidence`. `PIPELINE §14` defines **8** weighted components
summing to exactly 100 — and both extra signals are absent. Since the weights sum
to 100, adding the missing two requires re-weighting everything. The scoring model
is therefore not a shared definition.

### 3.8 Entity `review_status` exists in the model, not in the schema — **P2**

`DATA_MODEL §11` gives Entity a `review_status: approved`. `DATABASE §8
cf_entities` has `status` but **no** `review_status`. Yet `PIPELINE §11` sets a
hard gate — "high-impact entities … require review before public use" — which is
unenforceable without the column.

### 3.9 Content-item sources: array vs join table — **P2**

`DATA_MODEL §17` gives Content Item a `source_ids: ["source_001"]` array.
`DATABASE §12` defines `cf_content_item_sources` as a join table with
`raw_item_id`, `document_section_id`, `usage_type`. Two sources of truth for
provenance — the exact thing this system exists to get right.

### 3.10 Media alt text: value vs status — **P2**

`DATA_MODEL §20` stores `alt_text` as a localized JSON object on the asset.
`DATABASE §14` stores only `alt_text_status`, implying the text lives in
`cf_localizations`. An implementer will build both.

### 3.11 Cross-site entity reuse has no storage — **P1**

`DATA_MODEL §29` — the document's showcase pattern for multi-site reuse — shows
an entity carrying `usable_by_sites` and `site_overlays` with per-site
`required_locales` and `review_level`. **No table in `DATABASE.md` stores
either.** `cf_source_site_permissions` scopes *sources* to sites; nothing scopes
*entities* to sites. The single mechanism that the "100+ websites" claim rests on
is illustrated in JSON and absent from the schema.

### 3.12 Schema-integrity failures — `DATABASE.md` cannot store its own design — **P1** *(rev 2)*

Five findings that share one root cause. Each is registered separately
(CFD-35 … CFD-39); together they say something the individual entries do not.

- **Confidence is two incompatible scales at once** (CFD-35). Floats in `[0,1]`
  (`parse_confidence` 0.92, alias 0.88, fact 0.95, relationship 0.94, classification
  0.98) versus integers in `[0,100]` (`cf_confidence_scores.score` 92, every band in
  `PIPELINE §14`). **`cf_content_items` carries both on one row** — `confidence_score`
  0.84 and `quality_score` 88. Every threshold and gate in the design is ambiguous.
  This survives the scoring simplification in §3.7/CFD-25: whatever the model becomes,
  it still needs one type.
- **`cf_publish_packages` cannot express its own package types** (CFD-36). Keyed on a
  required `content_item_id`, while the declared types include Taxonomy, Site feed,
  Media, and Entity profile packages — none of which are content items. Half the
  publishing surface named in three documents has no storage path.
- **Entity merge — the one destructive operation in the design — has no audit trail**
  (CFD-37). No merge/redirect table. Published packages holding a merged entity's ID
  break silently; "Split incorrect merge" (`REVIEW_WORKFLOW §10`) is unrecoverable.
  Note this compounds §4.3: with no tenancy, a bad merge is global **and** unwindable.
- **Parsed documents are declared versioned with no version table** (CFD-39). The raw
  layer has `cf_raw_item_versions`; the parsed layer has nothing and no uniqueness
  rule. Every parser upgrade re-parses the corpus and either overwrites prior output —
  breaking the `document_section_id` citations that §2 calls the design's best
  feature — or silently duplicates.
- **No execution or error tables** (CFD-38). `PIPELINE §25` requires every stage emit
  status, retry count, and error code; `cf_collection_jobs` models **collection only**.
  Parse, extract, localize, and publish have no run record. `DATA_MODEL §2` omits both
  `chunk` and `error` from its object families, and the only "task" modelled is a
  review task.

**The pattern matters more than the items.** These are not scattered oversights —
they are all cases where `DATABASE.md` fails to store something another document
declares. Combined with the two naming conventions (§3.5), the missing entity
`review_status` (§3.8), the duplicated provenance (§3.9), the alt-text split (§3.10),
and the absent §29 overlay storage (§3.11), the conclusion is that **`DATABASE.md`
was assembled alongside the other documents rather than derived from them.** It is
the weakest of the six. Patching it finding by finding is the wrong move; it should
be **regenerated from the reconciled state machine (§3.2)** once that exists.

---

## 4. Missing controls

Absent, and load-bearing. Ordered by consequence.

### 4.1 Runtime and deployment architecture — **P0, and the reason this review cannot pass**

There is no document describing processes, services, hosts, queues, storage
engines, or networking. Not "underspecified" — **absent**. See §6.

### 4.2 Reliability engineering — **P0**

The review brief asks about idempotency, deduplication, retries, dead-letter
queues, job locking, concurrency control, restart recovery, partial failure,
poison documents, oversized files, rollback, and backup restoration. The
documents' complete coverage of that list:

> `PIPELINE §26`: *"Retries should be idempotent. Reprocessing should create new versions and retain prior audit history."*
> `PIPELINE §25`: `Retry count` — one bullet in an observability list.
> `IMPLEMENTATION_PLAN §22`: `Backup and retention policy` — one bullet.

That is the entire treatment. **No idempotency key. No job locking or lease. No
dead-letter queue. No concurrency limits. No restart recovery semantics. No
poison-document handling. No file-size ceiling. No restore procedure — and
"backup" without a *tested restore* is not a backup.**

For a 24×7 runtime on a single Windows box, these are not later-phase concerns.
An OCR worker that dies mid-PDF, a 400MB scanned document, or a Postgres restart
at 3am are Tuesday, not edge cases.

### 4.3 Multi-tenant isolation at the data layer — **P0**

`cf_sources` has `tenant_id`. `cf_content_items` has `tenant_id`. **`cf_entities`,
`cf_facts`, `cf_relationships`, `cf_media_assets`, and `cf_raw_items` do not.**

Entities are deliberately global (cross-site reuse is the point) — but that means
a fact extracted from a GoThailandHome source is, by default, visible to TAI FAITH
Agriculture and Malaysia Property Network. There is no row-level security model,
no per-tenant key, no query-scoping rule, and no statement of *which* objects are
shared versus isolated. `DATA_MODEL §29` gestures at per-site overlays; §3.11
shows they have no storage.

The brief asks about failure containment across projects. **Nothing in the design
contains a failure to one project.** A poisoned entity merge is global.

### 4.4 Robots / ToS enforcement — **P1**

`ARCHITECTURE §7` promises "Robots and terms review fields for future web
collection". **No table has a robots field.** `cf_sources` has a
`collection_policy` JSON blob and `rights_policy` free text. There is no
`robots_checked_at`, no `robots_allows`, no ToS review record, no crawl-delay,
no enforcement point in the pipeline. For a system whose entire legitimacy rests
on "we only collect what we're allowed to collect", the control is named and not
built.

### 4.5 Personal data — **P1**

`PII` appears twice, both as bullets ("PII detection for future sources"; "PII
detection policy"). There is **no** PII field, no data-subject-rights flow, no
erasure mechanism, no PII-specific retention, no lawful-basis record, and **no
mention of PDPA or GDPR anywhere** — despite Thai and Malaysian operations and
`cf_sources.jurisdiction` existing as a field.

Note the pattern: this same organisation's property platform was found to be
recording `consent_at` against a privacy policy that does not exist
(`CEO_PRODUCT_REVIEW_PACKAGE.md` CRIT-02). Personal-data governance is a
demonstrated blind spot, not a hypothetical one.

### 4.6 Deletion and retention have policy but no executor — **P1**

`cf_retention_policies` defines `archive_after_days`, `delete_after_days`,
`legal_hold_allowed`. **Nothing describes what enforces them.** No job, no
schedule, no cascade rules (delete a raw item → what happens to facts citing it,
to published packages quoting it?), no legal-hold override mechanism, no
verification. A retention policy that nothing executes is a compliance liability
rather than a control, because it documents an intent you are not meeting.

### 4.7 Backup and restore — **P1**

One bullet. No RPO, no RTO, no backup target, no restore test, no statement of
what is recoverable. On a single-box 24×7 runtime this is the difference between
an incident and a company-ending data loss. The brief explicitly asks for backup
restoration; the documents do not answer.

### 4.8 Reviewer capacity — **P1**

`REVIEW_WORKFLOW §19` sets SLAs: intake 1 day, fact 2 days, compliance 5 days.
`§4` defines 10 roles. `IMPLEMENTATION_PLAN §25` lists "Review backlog at scale"
as a known risk.

**Nowhere is there an estimate of how many humans exist, how many items per day
they can review, or how many items per day the pipeline will produce.** The SLAs
are invented. The 10 roles imply a content-operations department. The realistic
V1 reviewer population appears to be **one to three people**. A pipeline that can
generate 500 candidate facts a day and a reviewer who can approve 50 is not a
workflow — it is a queue that grows forever. **Review throughput is the system's
real bottleneck and it is unmodelled.**

### 4.9 Batch review — **P2**

The brief asks for it; the workflow has no batch operations. With one reviewer,
per-item review is the difference between viable and not. Bulk approve-by-source,
bulk merge, and bulk reject are V1 features, not refinements.

### 4.10 No capacity, volume, or cost model anywhere — **P1**

Zero hits for `throughput`, `volume`, `cost`. The design claims 100+ websites
with no estimate of documents/day, storage growth, embedding cost, AI extraction
cost, or reviewer hours. **The "100+" figure is unfalsifiable as written** (§7).

### 4.11 Four gates that are claimed but cannot be computed — **P1/P2** *(rev 2)*

The design repeatedly asserts a control in prose that no field or mechanism can
evaluate. §4.4 (robots) and §4.6 (retention) are the known cases. Three more:

- **"Required locales complete"** (CFD-43) is checked at both `PIPELINE §21` and
  `REVIEW_WORKFLOW §16`. `cf_localizations` is an EAV table; completeness requires
  counting rows against a per-site, per-content-type required-field manifest that
  does not exist. The gate cannot be computed.
- **"Source changes materially"** (CFD-44) is the primary reopen trigger for
  published content. Nothing defines material. The only hook is
  `cf_raw_item_versions.diff_summary`, semantics undefined — so the trigger either
  fires on whitespace or gets disabled. *There is a good answer available:* a section
  hash change on a section **cited by an approved fact** is material; uncited changes
  are logged only. That makes `cf_document_sections.section_hash` load-bearing, which
  is what it is for.
- **Rollback** (CFD-45) is named as Phase 13 core work. `cf_publish_events.event_type`
  is unenumerated and no mechanism reverts an adapter to `package_version` N−1.
  Supersession (forward) is designed; rollback (backward) is not — and rollback is
  what you need at 3am.

Add to these the **absence of any resource ceiling** (CFD-41): no max payload size,
no per-worker memory cap, no stage timeout, no poison threshold. A 400MB scanned PDF
on a single box shared with Postgres has undefined behaviour.

### 4.12 The confidence model actively penalises human review — **P1** *(rev 2)*

`PIPELINE §14` weights **reviewer validation at 5 of 100 — below recency at 10**. A
human verifying a fact against a government source contributes half of what the
calendar does. This contradicts `ARCHITECTURE §2.3` and `REVIEW_WORKFLOW §2.7`
("AI assists, humans govern").

It is worse in combination with `REVIEW_WORKFLOW §21`, which reopens review when
"confidence score drops below threshold": **recency decay alone can drag a
human-approved, evidence-backed government fact below threshold and auto-reopen
it.** The system would generate review churn as a direct consequence of a reviewer
having done the work — against the reviewer capacity that §4.8 shows is already the
binding constraint. Whatever replaces the scoring model (§5, CFD-25) must carry the
constraint that **verified facts do not decay because time passed.**

---

## 5. Overengineered areas

Cut or defer. Most of this traces to the unexamined "100+ websites" premise.

| Area | Where | Assessment |
| --- | --- | --- |
| **15 entity types** | `DATABASE §8`, `DATA_MODEL §11` | Includes `sport_event` and `trade_lead` for two websites that do not exist. Every type is a schema commitment, a review path, and a test surface. **V1 needs 3–4.** |
| **10 reviewer roles, 9 task types, 6 levels (L0–L5), 3 risk classes** | `REVIEW_WORKFLOW §4, §5, §6, §16` | A permission matrix for a content-operations department, aimed at a team of ~1–3. **V1 needs one role and approve/reject/needs-work.** This is the single largest source of unnecessary complexity. |
| **8-component weighted confidence model with 5 bands** | `PIPELINE §14` | The weights (20/15/15/15/10/10/10/5) are invented, unvalidated, and disagree with `ARCHITECTURE §5.14` (§3.7). False precision: a 73 and a 76 fall in different bands with no evidence the model discriminates at all. **V1: source authority + has-evidence + reviewer-approved.** Defer scoring until there is data to calibrate against. |
| **Two parallel scoring systems** | `DATABASE §18` | `cf_confidence_scores` *and* `cf_quality_scores`, each with breakdowns and versions. Nothing explains how they interact or which gates publication. **Collapse to one.** |
| **Translation memory + glossary + TM match IDs** | `DATABASE §13`, `IMPL §15` | A localization industry stack before a single article has been published. **Defer entirely.** |
| **Dual versioning** | `DATABASE §6, §17` | `cf_object_versions` (generic snapshots) *and* `cf_raw_item_versions` (specific). Two mechanisms, no rule for which applies. **Pick one.** |
| **`cf_source_credentials`** | `DATABASE §5` | Secret references for API collectors that the MVP explicitly defers. **Remove from V1.** |
| **22 pipeline stages** | `PIPELINE §2` | Each implies status, error handling, retry, and observability. **V1 needs ~7.** |
| **9 duplicate detection methods** | `ARCHITECTURE §5.15` | Including embedding similarity and perceptual hashing before exact-hash dedup has run once. **V1: content hash + canonical URL.** |
| **SLA table** | `REVIEW_WORKFLOW §19` | Business-day SLAs with no reviewer capacity model (§4.8). Numbers with nothing behind them. **Remove until staffed.** |
| **12 relationship types / 10 content types / 13 classification dimensions** | Multiple | Same pattern. Enumerating the eventual world instead of the V1 world. |
| **`cf_publication_channels`** *(rev 2)* | `DATABASE §16` | A channel abstraction layered on top of `cf_sites.publishing_adapter` — an abstraction over an abstraction, for one pilot site with one adapter. **Remove from V1.** |
| **Three-table taxonomy** *(rev 2)* | `DATABASE §11` | `cf_taxonomies` + `cf_taxonomy_terms` + `cf_classifications`, with hierarchy, localized labels, scopes, and per-assignment confidence and review — before one article is published. **V1: a flat tag list.** |
| **`cf_review_checklists`** *(rev 2)* | `DATABASE §15` | Configurable per-site, per-content-type checklist definitions in JSON, for a team of 1–3. The checklists in `REVIEW_WORKFLOW §8–§16` are already written as prose and are perfectly usable as prose. **Keep them in Markdown.** |
| **Email/mailbox collector** *(rev 2)* | `ARCHITECTURE §5.2` | A collector family for a mailbox that does not exist, feeding a source that is not registered. **Remove.** |
| **`cf_tenants` as a managed object** *(rev 2)* | `DATABASE §4` | Status workflow and lifecycle for one tenant. **Narrower than it looks:** §4.3 requires `tenant_id` *columns* on the core tables and that stands. Defer tenant *management*, not tenant *scoping*. |
| **"Reviewer dismissal saved as training signal"** *(rev 2)* | `PIPELINE §15` | No training loop, model, cadence, or consumer of the signal exists in six documents. Capability that does not exist. **Delete the phrase or restate it honestly.** |

**The pattern:** these documents consistently mistake *enumerating a domain* for
*designing a system*. Long lists of types, roles, states, and methods read as
thorough, but each entry is a commitment that must be built, tested, migrated,
and reviewed. The design would be stronger at half the size.

---

## 6. Windows 01 dependencies

**The documents specify none.** Zero occurrences of Windows, Docker, WSL, Redis,
MinIO, Tailscale, pgvector, Postgres, worker, cron, restart, or restore.
`IMPLEMENTATION_PLAN §23` defers queue system, object storage, vector index,
workflow engine, and observability platform to undecided "architecture decision
points" — which is honest, but it means **the runtime is an open question, not a
design**.

Therefore the requested Windows 01 assessment cannot be performed. What follows
is **what the revised documents must specify** before a Windows 01 audit has
anything to check.

### 6.1 Services the design implies but never names

Inferred from the pipeline's actual requirements — each needs an explicit decision:

| Implied by | Service | Open question |
| --- | --- | --- |
| `cf_*` relational schema, 30+ tables | **PostgreSQL** | Version? Native Windows service or containerised? Where does the data directory live? |
| Embedding similarity (§3.4) | **pgvector** | Needed at V1 at all? If yes: extension availability on the chosen Postgres. If no: delete the capability. |
| `payload_uri`, `file_uri`, media derivatives | **Object storage (MinIO?)** | Or just a filesystem path at V1? MinIO is a service to run, back up, and monitor — justify it. |
| Collection jobs, parser/OCR/embedding workers | **Queue (Redis?)** | Redis on Windows is not first-class. Native, WSL2, or container? Persistence config? |
| `cf_collection_jobs`, `scheduled_refresh` | **Scheduler** | Windows Task Scheduler, a container cron, or in-process? Behaviour on missed runs after reboot? |
| Image metadata parser, OCR handoff | **OCR worker** | Which engine? GPU or CPU? Memory ceiling per document? |
| PDF/Word/Excel parsers | **Parser workers** | Native Windows or Linux containers? Office-format parsing on Windows has real licensing and library implications. |
| `ARCHITECTURE §7` audit + access | **Network access** | Tailscale-only was stated in the brief and appears in no document. |
| `IMPL §22` backup | **Backup target** | Where? Which machine? Tested how? |
| `PIPELINE §25` dashboards | **Monitoring** | Named nowhere. Who gets paged at 3am on a 24×7 box? |

### 6.2 Windows-specific risks the documents never consider

1. **Docker Desktop on Windows is not a server runtime.** It requires an
   interactive login session, updates itself, and is licensed per-seat for
   commercial use. For 24×7 unattended operation it is the wrong tool. **This
   needs an explicit decision: Docker Desktop, WSL2 + native Docker, Windows
   containers, or native services.** The docs do not know the question exists.
2. **WSL2 memory ballooning and vmmem growth** are the classic failure mode for
   long-running Linux workloads on Windows. No memory ceiling is specified for
   any worker.
3. **Windows Update forced reboots** vs a 24×7 runtime. No restart-recovery
   semantics exist (§4.2), so a reboot mid-pipeline has undefined behaviour.
4. **Filesystem semantics.** Path length limits, case-insensitivity, and file
   locking differ from the Mac mini dev machine. Content hashing and
   `payload_uri` handling will behave differently across the two.
5. **Redis on Windows** has no maintained native build; it runs in WSL2 or a
   container, inheriting both.
6. **Single point of failure.** One box runs Postgres, Redis, MinIO, and every
   worker. No document acknowledges this, and no restore path exists (§4.7).
7. **Dev/prod divergence.** Mac mini (ARM) develops; Windows 01 (x86) runs. No
   document mentions architecture-specific dependencies, container image
   platforms, or how parity is maintained.

#### Added in revision 2

8. **Name the alternatives to Docker Desktop, don't just flag it.** Risk 1 above is
   correct but stops short of a decision. The viable options are: **(A) WSL2 distro
   with `systemd` enabled**, services under systemd, Docker Desktop off the path;
   **(B) Hyper-V Linux VM with native Docker** (requires Windows 11 Pro);
   **(C) containers behind a service wrapper** such as NSSM. **Recommend A or B.**
   Option C inherits Docker Desktop's session dependency and only hides it.
9. **Data volumes must live inside the WSL2 filesystem or MinIO — never a `/mnt/c`
   bind mount.** This is the highest-probability silent failure on this stack.
   Cross-boundary fsync semantics, path-length limits, and case-insensitivity will
   corrupt or badly slow Postgres and the raw payload store. It is also the default
   thing a developer does.
10. **`ext4.vhdx` does not auto-shrink.** The raw payload store grows monotonically:
    deleting raw items reclaims no disk on the Windows volume without a manual
    compact. Interacts directly with the unenforced retention policy (§4.6) — the
    policy would not free space even if something executed it.
11. **`.wslconfig` memory and CPU caps must be set explicitly.** The defaults will
    either starve the workers or let `vmmem` consume the box. This is risk 2 above,
    made actionable.
12. **Docker bypasses the Windows firewall.** A `docker run -p` rule inserts directly
    into the `DOCKER-USER` chain and silently punches through a Tailscale-only intent.
    Bind services to `tailscale0` or `127.0.0.1` and publish no ports. **This is the
    most likely way the Tailscale-only requirement gets violated without anyone
    noticing** — worth an explicit check in the audit.
13. **Tailscale-only means no inbound webhook, so alerting must be outbound push.**
    §6.1's monitoring row asks who gets paged; the network model constrains the answer.
14. **Thai OCR quality is a measurable risk, not an assumption.** Recommend **OCR is
    out of V1 entirely** — text-layer PDFs only, scanned PDFs quarantine. Consistent
    with the §8 boundary, which already cuts image parsing. Measure Thai OCR accuracy
    before any workflow depends on it.
15. **If the embedding worker calls an API, source text leaves the box.** That is a
    rights and PDPA decision (§4.5), not a performance one — and it interacts with
    `rights_policy` on sources that may not permit third-party processing. Local model
    versus API is therefore a governance question. Moot if CFD-08 deletes embeddings
    from V1, which is the recommendation.

### 6.3 What the Windows 01 audit must return

**Do not run this audit until the documents name their services.** Once they do,
capture: OS build and update policy · CPU/RAM/disk headroom and growth ·
virtualisation and WSL2 status · Docker licensing posture · existing installed
services and port conflicts · power and sleep settings · Windows Update reboot
window · antivirus interference with container/DB I/O · Tailscale configuration ·
backup target and last successful *restore* test · unattended-restart behaviour ·
remote-access path for Mac mini review sessions.

Marked in the register as **REQUIRES WINDOWS 01 AUDIT DATA** — but the dependency
runs the other way first: **specify, then audit.**

---

## 7. The "100+ websites" claim

It appears in five of six documents and is supported by nothing:

- No estimate of documents/day, facts/day, or storage growth.
- No reviewer-capacity model (§4.8) — **and human review is the binding
  constraint, not compute.**
- No cost model for AI extraction, embeddings, or translation.
- No multi-tenancy mechanics (§4.3) — entities are global with no isolation.
- No storage for the one pattern the claim rests on (§3.11).

**Assessment: the claim is aspirational and is actively harmful as a design
input.** It is the justification for the 15 entity types, 10 roles, 6 levels, and
22 stages that make V1 undeliverable. The real near-term portfolio is **five
sites, of which two are hypothetical and one (GoThailandHome) is mid-Alpha with
an open P0** (`CEO_PRODUCT_REVIEW_PACKAGE.md`).

The honest reframing: *"designed so a second site does not require rewriting the
pipeline."* That is achievable, testable, and sufficient. Two sites prove
reusability; 100 is a marketing number. **Design for 2. Do not design for 100.**

---

## 8. V1 recommended boundary

**One tenant. One site. One content type. One reviewer. No crawling. No embeddings.**

### In scope

| Capability | Constraint |
| --- | --- |
| Source registry | Manual registration only; the source-permission gate is kept — it is the design's best idea |
| Raw item store | Content hash, payload URI, rights snapshot, immutable |
| Parsers | **HTML + PDF only.** Not Word, Excel, image, OCR, RSS, API |
| Parsed document + sections | With citeable `char_start`/`char_end` — this is what makes evidence real |
| Entity + alias + evidence | **3 types max** (`organization`, `project`, `location`) |
| Fact + fact evidence | With `support_level` folded in from Claim (§3.1) |
| Review | **One role. Three outcomes: approve / reject / needs-work.** Batch approve-by-source |
| Publish package | JSON output + content hash |
| Audit + version | `cf_object_versions` only — with `target_version` on review decisions (§3.3) |
| Lifecycle | **One reconciled state machine** with an explicit transition table (§3.2) |

### Added in scope by revision 2 — five tables that are not optional

The boundary above is a *subtraction* from Cursor's design. Revision 2 adds back the
small number of tables without which the P0/P1 integrity and reliability findings
cannot be closed:

| Table | Closes |
| --- | --- |
| `cf_job_runs` | CFD-38 / §4.2 — stage-agnostic execution record; the thing CFD-04's idempotency key, lease, and attempt counter attach to |
| `cf_errors` | CFD-38 — no error object exists anywhere in the model |
| `cf_entity_merges` | CFD-37 — the design's one destructive operation currently has no audit trail or redirect |
| `cf_parsed_document_versions` | CFD-39 — or make `(raw_item_id, parser_type, parser_version)` unique; without it, parser upgrades break evidence citations |
| chunks + embeddings | **Only if CFD-08 retains similarity. The V1 recommendation is to delete it instead** — then this table is not needed and §6.1's pgvector row disappears with it |

**The trade is close to cost-neutral.** Four required tables in; seven out
(`cf_publication_channels`, `cf_review_checklists`, the three taxonomy tables, and
the glossary/TM pair). **The V1 table count does not grow — it redistributes from
conceptual surface to operational floor.** That is the same trade §5 argues for, and
it is the whole shape of this review: the design is simultaneously overbuilt in what
it *describes* and underbuilt in what it *runs on*.

### Explicitly deferred

Relationships · taxonomy engine (flat tags instead) · classification · confidence
scoring · quality scoring · duplicate detection beyond exact hash · translation
memory · glossary · localization pipeline · media pipeline · perceptual hashing ·
embeddings and vector search · multi-tenancy · site overlays · SLAs · escalation ·
L0–L5 · risk classes · compliance review · 10 roles · API/RSS/**email** collectors ·
`cf_publication_channels` · `cf_review_checklists` · `cf_source_credentials` ·
tenant *management* (the `tenant_id` **columns** stay — §4.3 requires them; only the
management workflow defers) · scheduling · crawling.

### Recommended pilot content

**Knowledge articles for GoThailandHome.** From prior review in this session
(`CEO_PRODUCT_REVIEW_PACKAGE.md` MED-01): `content/knowledge/articles/` already
holds one authored, verified, trilingual article (`bts-skytrain-overview`) that
**no route reads** — content investment already made and returning nothing.

That is an unusually good pilot. It is real content with a real, already-diagnosed
publishing gap; it needs no crawling; it exercises the full spine — source →
evidence → review → package → adapter — and it produces a visible business outcome
(a published article) rather than a platform. If the factory cannot publish one
article that already exists, it will not publish 100 websites.

---

## 9. Safe implementation sequence

The plan's order (13 platform phases → pilot at Phase 14) must be inverted. Prove
the spine on one real article, then generalise.

| Step | Work | Gate to exit |
| --- | --- | --- |
| **0** | **Revise documentation** — resolve all P0s: runtime layer, state machine, tenancy, reliability, pilot sequencing; cut the scope claim | Six documents agree with each other |
| **1** | **Windows 01 readiness audit** — against the now-named services (§6.3) | Audit data returned; Docker/WSL2 decision made |
| **2** | **Vertical slice on Mac mini** — one HTML fixture → parsed → sections → one fact with evidence → review → package JSON. No Windows dependency, no queue, no containers | One article publishes end to end |
| **3** | **Move the slice to Windows 01** — the real runtime test: restart recovery, backup **and verified restore**, Tailscale access, unattended operation | Survives a forced reboot mid-pipeline with no data loss |
| **4** | **Pilot: GoThailandHome knowledge articles** — the orphaned article, published through an adapter | Article live; reviewer throughput measured against real volume |
| **5** | **Harden** — reliability controls (§4.2) informed by what actually broke in steps 3–4 | Idempotency, DLQ, locking, poison handling — built against observed failures, not imagined ones |
| **6** | **Second site (TAI FAITH)** — the *real* multi-tenancy test | A second site added by configuration. **This is where the reuse claim is proven or falsified** |
| **7** | Generalise only what steps 4–6 proved necessary | — |

**The principle:** every deferred item in §8 should re-enter only when a real
pilot demonstrates the need. Step 6 is the honest test of the entire premise — and
it arrives in month 2, not month 14.

Note the organisational constraint: GoThailandHome currently has an **open P0**
(silent lead loss, `PRODUCTION_FIX_PLAN.md` CRIT-01) and a launch-gating P1. The
Content Factory should not consume engineering capacity until the revenue-losing
defect is closed. **Step 0 is documentation work and costs no engineering time —
start there.**

---

## 10. Final readiness classification

The knowledge model is sound and does not require redesign — which rules out
BLOCKED. But no Windows 01 validation can be performed against documents that
never name a single runtime component, and the pilot sequencing would build an
enterprise before testing an assumption — which rules out READY.

The required revision is bounded, largely subtractive, and needs no code:
reconcile the state machine, add a runtime layer, define tenancy, specify
reliability controls, move the pilot to the front, and delete the "100+" premise
along with the complexity it justifies.

**REVISE DOCUMENTATION BEFORE WINDOWS 01 VALIDATION**
