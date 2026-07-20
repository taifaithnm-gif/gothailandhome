# Content Factory Architecture V2

**Status:** Documentation only — no code, no schema, no deployment
**Supersedes:** `CONTENT_FACTORY_ARCHITECTURE.md` (V1)
**Date:** 2026-07-17
**Review basis:** `CONTENT_FACTORY_ARCHITECTURE_REVIEW.md` · `CONTENT_FACTORY_DECISION_REGISTER.md` (34 decisions)
**Runtime detail:** `WINDOWS01_RUNTIME_ARCHITECTURE.md`
**Readiness gate:** `WINDOWS01_VALIDATION_CHECKLIST.md`

---

## 1. What changed from V1

V2 exists to close the five P0 findings that blocked implementation. The knowledge
model from V1 survives largely intact — it was the strong part. What was missing
was the system around it.

| # | V1 problem | V2 resolution | Decision |
| --- | --- | --- | --- |
| 1 | **No runtime architecture** — Windows, Docker, Redis, Postgres, MinIO, worker, restart appeared 0 times in 4,110 lines | §9 + `WINDOWS01_RUNTIME_ARCHITECTURE.md` name every process, service, container, volume, limit and restart rule | CFD-01 |
| 2 | **Pilot at Phase 14 of 15** | §12 inverts the sequence — one real article publishes before any platform generalisation | CFD-02 |
| 3 | **Three incompatible state vocabularies** (13 vs 14 vs 18+6 states) | §7 defines one canonical state machine on two orthogonal axes, with a transition table | CFD-03 |
| 4 | **Reliability absent** (one sentence on idempotency) | §10 principles + runtime doc §6 (task pipeline, retry, DLQ, poison, locking) | CFD-04 |
| 5 | **Tenant isolation undefined** | §8 states per-table scope, the containment boundary, and the RLS deferral rule | CFD-05 |
| 6 | **"100+ websites" unsubstantiated** — the root cause of most overengineering | §2 reframes to "a second site must not require a rewrite". 15 entity types → 3. 10 reviewer roles → 1. | CFD-16, CFD-24, CFD-30 |
| 7 | **Embedding similarity with no storage** | §11 retains the capability and models it properly: `cf_chunks` + `cf_embeddings` on pgvector | CFD-08 |
| 8 | **Claim had no table** | §6.5 collapses Claim into Fact via `support_level` | CFD-06 |

**Note on the reversal in row 7.** The V1 review recommended deleting embedding
similarity because it was specified with no storage and no engine. The approved
direction now requires a document pipeline through embedding and indexing, so the
capability is **retained and specified** rather than deleted. That is a
deliberate change of decision, not an oversight — see §11 and CFD-08 in the
register.

---

## 2. Purpose and scope

The Content Factory collects approved source material, normalizes it into
site-independent knowledge objects, extracts facts with evidence, routes them
through human review, and publishes approved content packages to websites.

### 2.1 Scope claim — corrected

**V1 claimed:** support for 100+ websites.
**V2 claims:** *adding a second website must not require rewriting the pipeline.*

The 100+ figure was supported by no volume, throughput, reviewer-capacity or cost
model, and it was the justification for complexity that made V1 undeliverable.
Two sites prove reusability. The real near-term portfolio is:

| Site | Status | Role in this plan |
| --- | --- | --- |
| **GoThailandHome** | Live, mid-Alpha, one open P0 | **Pilot** — knowledge articles only |
| **TAI FAITH Agriculture** | Planned | **Second site** — the real reuse test (Step 6) |
| Malaysia Property Network | Planned | Later |
| Badminton platform | Hypothetical | Not a design input |
| Trade lead platform | Hypothetical | Not a design input |

**Design for 2. Validate at 2. Do not design for 100.** Capacity beyond the
second site is a scaling exercise informed by measured data, not a V1 design
input.

### 2.2 The binding constraint

**Human review throughput — not compute — is this system's bottleneck.**

A pipeline that produces 500 candidate facts per day and a reviewer who can
approve 50 is not a workflow; it is a queue that grows forever. Every capacity
decision in this architecture is sized against reviewer capacity first
(§10.5 backpressure), and the runtime is sized second.

Realistic V1 reviewer population: **1–3 people.** This single fact invalidates
V1's 10 reviewer roles, 6 review levels, and business-day SLAs.

---

## 3. Core principles

Carried from V1 (unchanged — these were correct):

1. **Reusable by default** — no source, entity, field, or stage hard-coded to one website.
2. **Source-first** — content starts from registered sources and carries provenance through every transformation.
3. **Human-governed** — AI may extract, classify, translate, summarize and deduplicate; approval remains workflow-controlled.
4. **No fabrication** — missing facts remain unknown. Confidence scoring cannot convert unknown facts into publishable facts.
5. **Evidence-preserving** — every published claim traces to source records, reviewer actions, or approved editorial overrides.
6. **Composable publishing** — the factory produces packages; websites decide how to render them.
7. **Lifecycle-aware** — content has freshness, expiry, supersession, archival, takedown and version history.

Added in V2:

8. **Every stage is idempotent and resumable** — a stage may be re-run at any time with the same inputs and produce no duplicate side effects. Reprocessing creates new versions and retains prior audit history (§10).
9. **The runtime is part of the architecture** — a design that does not say what runs it, on what, and what happens when it restarts, is not finished (§9).
10. **Intake is throttled by review capacity** — the factory must never produce candidates faster than humans can approve them (§10.5).
11. **Staged, not deferred-forever** — every capability names its V1 status: `V1`, `Step 5`, `Step 6+`. Nothing is "in the design" without a phase.

---

## 4. System boundaries

### Included

Source registry · source permissions and collection policy · collector framework ·
document and media intake · parsing · normalization · chunking · embedding ·
vector index · knowledge extraction · entity recognition and resolution ·
relationship mapping · classification · review workflow · publishing workflow ·
multi-language pipeline · media pipeline · version control · confidence scoring ·
duplicate detection · content lifecycle · **runtime, reliability and recovery (new in V2)**.

### Excluded

Website UI and page rendering · migration of the current GoThailandHome schema ·
crawling at V1 · replacement of human review · permission bypass for restricted
content · ERP/CRM/marketing automation.

---

## 5. High-level architecture

```text
                         ┌──────────────────────────────────┐
                         │   CONTROL PLANE (API + Review)   │
                         └──────────────────────────────────┘
                                        │
  Source Registry ──► Collection Jobs ──► Raw Evidence Store (MinIO, immutable)
                                        │
                                        ▼
                          Parser / OCR ──► Parsed Document + Sections
                                        │
                                        ▼
                             Chunker ──► Embedder ──► Vector Index (pgvector)
                                        │
                                        ▼
                        Knowledge Extraction (rules + LLM)
                                        │
                     ┌──────────────────┼──────────────────┐
                     ▼                  ▼                  ▼
                 Entities            Facts           Relationships
                (+ aliases)     (+ evidence)          [Step 6+]
                     └──────────────────┼──────────────────┘
                                        ▼
                        Confidence · Duplicate checks
                                        ▼
                        ══════ HUMAN REVIEW GATE ══════
                                        ▼
                     Localization [Step 6+] · Media [Step 5+]
                                        ▼
                          Versioned Content Packages
                                        ▼
                   Publishing Workflow ──► Website Adapters
```

Four layers stay strictly separated: **raw evidence** (immutable) → **normalized
facts** → **reviewed knowledge** → **site-specific publication output**.

---

## 6. Major components

Trimmed against V1. Every component carries a phase.

### 6.1 Source Registry — **V1**

Master inventory of approved sources. Each source defines ownership, type,
allowed collection method, language, jurisdiction, refresh policy, rights policy,
extraction profile, publication restrictions.

**Hard gates (unchanged from V1 — the design's best decision):**
- No unregistered source can be collected.
- No source can be published to a site without an explicit source-site permission.
- Restricted sources require compliance review before activation.

**V1 source types (3):** `manual_upload`, `pdf`, `html_page`.
Deferred: `rss`, `word`, `excel`, `image`, `api`, `news`, `government_website`, `developer_website`.

**Robots/ToS (CFD-11):** V1 is manual-upload only, so no robots check applies.
`cf_sources` gains `robots_checked_at`, `robots_allows`, `tos_reviewed_at`,
`tos_review_note` **before any fetch collector ships**. The collection planner
must hard-gate on them. Until then the fields exist and the collector does not.

### 6.2 Collector Layer — **V1 (manual upload only)**

Collectors capture source material, metadata, timestamps, hashes and logs. They
do not decide truth and do not publish.

**V1:** manual upload collector only. **Step 5+:** approved page fetch, RSS.
**Step 6+:** API, email.

### 6.3 Raw Evidence Store — **V1**

Immutable. Content-addressed. Object-versioned and retention-locked
(runtime doc §4.3). Stores payload, source ID, job ID, retrieval timestamp,
content hash, MIME type, language hints, rights snapshot, parser status, errors.

### 6.4 Parsing, OCR and Normalization — **V1 (HTML + PDF)**

Parser output: plain text, structured sections, tables, metadata, title, language
detection, page/cell/char references, parser confidence.

**Sections are the citation unit.** `cf_document_sections` carries
`char_start`/`char_end` — this is what makes evidence verifiable rather than
gestural, and it must survive into chunks (§11).

**V1 parsers:** HTML article, PDF text. **OCR:** PDF-image fallback only.
**Step 5+:** Word, Excel, image metadata, RSS. **Step 6+:** PDF layout.

### 6.5 Knowledge Extraction — **V1 (rules + LLM-assisted)**

Produces candidate facts with evidence references, extraction method, model/rule
version, confidence score and review status.

**Claim is collapsed into Fact (CFD-06).** V1 had Claim as a first-class object in
the data model with no table anywhere. V2 keeps the good idea — the distinction
between a verified fact and a marketing assertion — as a column:

```
cf_facts.support_level ∈ {
  directly_verified,        -- source states it plainly
  source_claimed,           -- the source asserts it about itself
  cross_source_supported,   -- two independent sources agree
  editorial_interpretation, -- a human wrote it, and owns it
  unsupported               -- cannot publish
}
```

`cf_claim_conflicts` is renamed `cf_fact_conflicts` and resolves `fact_ids`.

Extraction must keep separate: direct source quotes · structured facts ·
interpretive summaries · editorial notes · AI-generated drafts.

### 6.6 Entity Registry and Resolution — **V1 (3 types)**

**V1 entity types (3):** `organization`, `project`, `location`.
**Removed from V1 (CFD-30):** `brand`, `website`, `person`, `product`, `property`,
`government_agency`, `regulation`, `document`, `article`, `faq_topic`,
`sport_event`, `trade_lead`, `media_asset`. Each type is a schema commitment, a
review path and a test surface. Add a type when a site needs it.

`cf_entities` gains **`review_status`** (CFD-22) — without it, the hard gate
"high-impact entities require review before public use" is unenforceable.

**V1 resolution:** exact slug match · canonical URL match · alias match.
**Step 5+:** embedding similarity (§11), structured identity keys, geo proximity.

### 6.7 Relationship Mapping — **Step 6+**

Deferred entirely from V1. Nothing in the knowledge-article pilot needs a graph.

### 6.8 Classification and Taxonomy — **Step 6+**

Deferred. V1 routes by `content_type` + `site_id`, which is a column, not an engine.

### 6.9 Review Workflow — **V1 (one role)**

**V1 reviewer roles: one.** Outcomes: **approve / reject / needs-work**. Plus
**batch approve-by-source** (CFD-28) — with one reviewer, batch operations are the
difference between viable and not.

**Removed from V1 (CFD-24):** 10 roles, 9 task types, 6 levels (L0–L5), 3 risk
classes, escalation matrix, business-day SLAs (CFD-27). These describe a
content-operations department aimed at a team of 1–3. Re-introduce roles when
headcount exists — **Step 6+**.

`cf_review_decisions` gains the four fields governance requires and V1 could not
store (CFD-07): **`target_version`**, **`reviewer_role`**, **`state_before`**,
**`state_after`**, **`evidence_viewed_ids`**. Without `target_version` the
"no silent overwrite" principle is unenforceable.

### 6.10 Publishing Workflow — **V1**

Versioned content packages consumed by per-site adapters. The factory does not
prescribe page design. **V1 package type:** `knowledge_article` only.

### 6.11 Multi-Language Pipeline — **Step 6+**

Deferred (CFD-34). Translation memory, glossary and TM match IDs are a
localization industry stack for a system that has not published one article.
Re-enters when a second locale is required for **published** content.

Note: the embedding model chosen in §11 (`bge-m3`) is multilingual across EN/ZH/TH
by design, so deferring localization does not paint the vector index into a corner.

### 6.12 Media Pipeline — **Step 5+**

Deferred. `cf_media_assets.alt_text` lives in `cf_localizations`, not on the asset
(CFD-31).

### 6.13 Version Control and Audit — **V1**

`cf_object_versions` only (CFD-29 — V1's dual mechanism is removed).

**Mutability rules (CFD-19).** V1's "append-only history" rule contradicted
`updated_at` on mutable rows. V2 states it per table:

| Class | Tables | Rule |
| --- | --- | --- |
| **Immutable** | `cf_raw_items`, `cf_document_sections`, `cf_review_decisions`, `cf_audit_events`, `cf_lifecycle_events`, `cf_object_versions` | Never updated. Corrections create a new row. |
| **Versioned** | `cf_facts`, `cf_content_items`, `cf_entities` | In-place update **only** for non-material fields. Any change to value, evidence, or review status writes `cf_object_versions` first and bumps `version`. |
| **Mutable** | `cf_sources`, `cf_site_policies`, `cf_review_tasks` | Free update; changes land in `cf_audit_events`. |

"Material" = any field a reviewer approved against. Material change → new version → review reopens.

### 6.14 Confidence Scoring — **V1 (3 signals)**

**V1 (CFD-25):** `source_authority` + `has_evidence` + `reviewer_approved`. That's it.

**Removed from V1:** the 8-component weighted model (20/15/15/15/10/10/10/5) whose
weights were invented, unvalidated, and disagreed with V1's own architecture
document (10 signals vs 8). Bands implying a 73 and a 76 differ meaningfully are
false precision when nothing has calibrated them.

**Step 6+:** re-introduce a weighted model **calibrated against reviewer decisions
collected during the pilot** — real data, not invented weights.

`cf_quality_scores` is removed; one score, not two (CFD-26).

### 6.15 Duplicate Detection — **V1 (2 methods)**

**V1:** content hash + canonical URL.
**Step 5+:** normalized title, text similarity, embedding similarity.
**Step 6+:** perceptual hash, alias overlap, relationship overlap.

---

## 7. Canonical lifecycle state machine (resolves CFD-03)

V1 carried **three incompatible vocabularies** — 13 states in the architecture, 14
in the data model, 18+6 in the review workflow — and typed
`cf_facts.lifecycle_state` against a vocabulary that existed in none of them.

V2 defines **one** machine on **two orthogonal axes**. This is the reconciliation:
V1 conflated "where is this in the pipeline" with "where is this in review".

### 7.1 Axis 1 — `lifecycle_state` (pipeline position)

```text
registered → collected → parsed → normalized → extracted
    → reviewing → approved → localized → publish_ready → published
    → superseded → archived
```

### 7.2 Axis 2 — `review_state` (only meaningful while `lifecycle_state = reviewing`)

```text
pending → in_review → { approved | changes_requested | rejected }
```

### 7.3 Exception states (terminal or hold, on axis 1)

```text
quarantined · blocked · rejected · expired · takedown_pending · removed
```

### 7.4 Transition table

| From | To | Guard |
| --- | --- | --- |
| `registered` | `collected` | Source approved for the collection method |
| `collected` | `parsed` | Payload stored and hashed; rights not `blocked` |
| `collected` | `quarantined` | Rights `blocked`, or payload unstorable |
| `parsed` | `normalized` | Parse succeeded; confidence ≥ floor |
| `parsed` | `quarantined` | Empty content and source is not media-only |
| `parsed` | `blocked` | Parser failed after max attempts → DLQ |
| `normalized` | `extracted` | At least one candidate produced |
| `extracted` | `reviewing` | Review task created |
| `reviewing` | `approved` | `review_state = approved` **and** all required gates satisfied |
| `reviewing` | `rejected` | `review_state = rejected` (terminal) |
| `reviewing` | `extracted` | `review_state = changes_requested` → re-extract |
| `approved` | `localized` | Required locales complete **[Step 6+; V1 skips this state]** |
| `approved` | `publish_ready` | V1 path — no locales required |
| `localized` | `publish_ready` | Publishing checks passed |
| `publish_ready` | `published` | Adapter reported success |
| `published` | `reviewing` | Material source change, conflict, or takedown → **review reopens** |
| `published` | `superseded` | A newer version published |
| `published` | `takedown_pending` | Takedown request received |
| `takedown_pending` | `removed` | Takedown approved (terminal) |
| `superseded` | `archived` | Retention policy elapsed |
| any | `quarantined` | Policy violation or poison detection |
| any | `expired` | Freshness policy elapsed |

**Rules.** Every transition writes `cf_lifecycle_events` (`from_state`, `to_state`,
`reason_code`, `actor_id`). Transitions not in this table are rejected by the
state machine, not by convention. `rejected`, `removed` and `archived` are
terminal. **No path reaches `published` without passing `reviewing`.**

### 7.5 V1 subset

```text
registered → collected → parsed → extracted → reviewing → approved
    → publish_ready → published → archived
+ quarantined · rejected
```

`normalized`, `localized`, `superseded`, `expired`, `takedown_pending`, `removed`,
`blocked` are defined now and unused until their phase — so the vocabulary never
has to change again.

---

## 8. Tenancy and isolation model (resolves CFD-05)

V1 put `tenant_id` on `cf_sources` and `cf_content_items` and **omitted it from
`cf_entities`, `cf_facts`, `cf_relationships`, `cf_media_assets` and
`cf_raw_items`** — so a GoThailandHome fact was visible to TAI FAITH by default,
with no RLS, no scoping rule, and no containment boundary.

### 8.1 Per-table scope — explicit

| Scope | Tables | Rule |
| --- | --- | --- |
| **Tenant-scoped** (`tenant_id NOT NULL`) | `cf_sources`, `cf_collection_jobs`, `cf_raw_items`, `cf_parsed_documents`, `cf_document_sections`, `cf_chunks`, `cf_embeddings`, `cf_facts`, `cf_content_items`, `cf_media_assets`, `cf_review_tasks`, `cf_review_decisions`, `cf_jobs`, `cf_jobs_dlq` | Never readable across tenants. Every query carries the tenant. |
| **Global by design** | `cf_entities`, `cf_entity_aliases` | The entity registry is deliberately shared — cross-site reuse is the point. |
| **Site-scoped** | `cf_publish_packages`, `cf_publish_events`, `cf_source_site_permissions`, `cf_entity_site_overlays`, `cf_site_policies` | Bound to one site within one tenant. |
| **System** | `cf_audit_events`, `cf_object_versions`, `cf_lifecycle_events` | Carry `tenant_id` where derivable; admin-read only. |

### 8.2 The global entity registry — and its boundary

Entities are global. Facts are **not**. A fact is tenant-scoped and points at a
global entity. Two tenants may hold different facts about the same organization
without seeing each other's evidence.

**`cf_entity_site_overlays` (new — resolves CFD-09).** V1's showcase multi-site
pattern (`usable_by_sites`, `site_overlays`) was illustrative JSON with no table.
V2 makes it real:

```
cf_entity_site_overlays(
  id, entity_id, site_id,
  usable            boolean,     -- explicit grant; absence = not usable
  required_locales  text[],
  review_level      text,
  display_overrides jsonb
)
```

**Reuse is opt-in, not ambient.** An entity is usable by a site only with a row here.

### 8.3 Failure containment

| Boundary | Mechanism |
| --- | --- |
| **Queue** | Job queues are namespaced per tenant. A poison document in tenant A cannot starve tenant B (runtime doc §6.6). |
| **Concurrency** | Per-tenant worker concurrency caps. One tenant cannot consume the whole pool. |
| **Storage** | MinIO bucket per tenant. Postgres schema shared; rows scoped. |
| **Blast radius** | An erroneous entity merge is the one genuinely global action — therefore entity merge requires human review and is fully reversible via `cf_object_versions` (split-merge). |

### 8.4 RLS deferral rule

**V1 runs one tenant.** Postgres RLS is **not** enabled at V1 — with one tenant it
protects nothing and complicates every query and migration.

**But `tenant_id` is present on every scoped table from day one**, and scoping is
enforced in a single repository layer with no raw-SQL bypass. Retrofitting
`tenant_id` later is a rewrite; enabling RLS later is a migration.

**Hard gate:** RLS must be enabled and tested **before tenant 2 (TAI FAITH,
Step 6)**. This is a checklist item, not an intention.

---

## 9. Runtime architecture (resolves CFD-01)

The V1 documents named no process, service, host, queue, or storage engine. This
section states the shape; **`WINDOWS01_RUNTIME_ARCHITECTURE.md` is the full
specification** and is normative.

### 9.1 Topology

```text
┌──────────────────────── Windows 01 (Windows 11, 24×7) ────────────────────────┐
│  Windows Task Scheduler (at boot) ──► wsl.exe -d factory                      │
│  ┌────────────────── WSL2 · Ubuntu 24.04 · systemd ───────────────────────┐   │
│  │  docker.service (Docker Engine — NOT Docker Desktop)                    │   │
│  │  ┌──────────────── docker compose project: cf ─────────────────────┐    │   │
│  │  │  postgres(+pgvector) · redis · minio · api · worker-parse       │    │   │
│  │  │  worker-ocr · worker-embed · worker-extract · scheduler         │    │   │
│  │  │  uptime-kuma                                                     │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│  Tailscale (Windows host service) — the ONLY ingress. No public ports.        │
└────────────────────────────────────────────────────────────────────────────────┘
                                       │ Tailscale
                              ┌────────┴────────┐
                              │  Mac mini       │  dev · review UI · backup target
                              └─────────────────┘
```

### 9.2 The five load-bearing runtime decisions

| # | Decision | Choice | Why |
| --- | --- | --- | --- |
| **RD-1** | Container runtime | **WSL2 + Docker Engine**, not Docker Desktop | Docker Desktop requires an interactive login session and is per-seat licensed. **It is not a 24×7 unattended server runtime.** This was invisible to V1. |
| **RD-2** | Job queue | **PostgreSQL `SKIP LOCKED`** at V1; Redis for cache/rate-limit; Redis queues at Step 6+ | Transactional enqueue in the same commit as the state change eliminates dual-write bugs; jobs are backed up and restored **with** the database. Redis at V1 adds a service, an AOF config, a second backup path, and a failure mode — for volume that does not exist. |
| **RD-3** | Vector store | **pgvector in the same Postgres** | One site, one index. A separate vector service (Qdrant/Weaviate) is a second database to run, back up and restore for no benefit at this volume. |
| **RD-4** | Embedding model | **bge-m3, local, CPU** (1024-dim) | Multilingual EN/ZH/TH in one model — matches the trilingual requirement exactly. Local = no per-document API cost, no source content leaving the box. |
| **RD-5** | LLM for extraction | **Claude API** (`claude-sonnet-5`), abstracted behind a provider interface | No local model of adequate quality fits a CPU box. **Carries a data-governance obligation (§9.3).** GPU availability is unknown — `REQUIRES WINDOWS 01 AUDIT DATA`. |

Full rationale, alternatives and reversal triggers: runtime doc §2.

### 9.3 Data governance consequence of RD-5 — **new P1**

Sending source documents to an external LLM API means **source content leaves the
box**. If a source document contains personal data, that is a cross-border
transfer requiring a lawful basis and a data-processing agreement under PDPA and
GDPR.

This obligation did not exist in V1 because V1 never said where extraction ran.
**Naming the runtime created it.**

**Mitigation (V1):** PII detection runs **before** the LLM call, not after. Any
document flagged as containing personal data routes to human extraction and never
reaches the API. Registered as **CFD-35** (see §13).

---

## 10. Reliability principles (resolves CFD-04)

V1's complete reliability coverage was one sentence. These are the principles;
mechanisms are in runtime doc §6.

### 10.1 Idempotency

Every job carries an **idempotency key** = `sha256(stage, input_object_id, input_content_hash, stage_version)`.
Re-running a job with the same key is a no-op that returns the prior result. This
makes every stage safe to retry, replay from a DLQ, or re-run after a crash — and
it is why the pipeline can restart mid-flight without producing duplicates.

### 10.2 Exactly-once effects, at-least-once delivery

Delivery is at-least-once (the honest guarantee). Effects are made exactly-once by
the idempotency key plus a unique constraint on `(stage, idempotency_key)`.

### 10.3 Job locking

`SELECT … FOR UPDATE SKIP LOCKED` with a **lease** (`locked_until`). A worker that
dies loses its lease and the job returns to the queue automatically after the
visibility timeout. No distributed lock service required.

### 10.4 Failure escalation

```text
attempt fails → retry with exponential backoff + jitter (max 5)
             → poison check (same failure signature 3×?)
             → dead-letter queue (cf_jobs_dlq) with full context
             → alert → human triage → fix → replay by idempotency key
```

**A DLQ entry is never silently discarded.** Every DLQ item is triaged or
explicitly written off with a reason code.

### 10.5 Backpressure — the principle V1 lacked entirely

**The factory throttles intake against human review capacity, not CPU.**

```text
review_backlog > 200 items  → pause collection planning; alert
review_backlog > 500 items  → hard stop intake; page the operator
dlq_depth      > 50 items   → hard stop the affected stage
```

Compute is cheap and reviewers are not. A system that fills a queue faster than a
human empties it has failed, however healthy its dashboards look.

### 10.6 Recovery

Every stage is resumable from the last durable state. Restart, backup, restore and
DR: runtime doc §7. **A backup with no tested restore is not a backup** — restore
verification is a quarterly gate, not a document.

---

## 11. Document pipeline: chunks, embeddings and the index (resolves CFD-08)

V1 specified embedding similarity in three documents with no storage, no chunking
strategy and no engine; `chunk` appeared zero times. V2 models it.

```text
Upload → OCR → Chunk → Embedding → Index → Knowledge
```

### 11.1 The rule that matters

**Chunks must preserve citation offsets.**

A chunk carries `document_section_id`, `char_start` and `char_end`. This is not
bookkeeping: it is what lets a fact extracted from a chunk cite an exact character
range in an immutable parsed section. **Break this and the evidence model becomes
decorative** — you would be citing a vector, not a source.

### 11.2 Objects (new)

```
cf_chunks(
  id, tenant_id, parsed_document_id, document_section_id,
  chunk_index, text, token_count,
  char_start, char_end,          -- citation offsets — mandatory
  chunk_hash, chunker_version, created_at
)

cf_embeddings(
  id, tenant_id, chunk_id,
  model, model_version, dim,
  embedding vector(1024),        -- pgvector
  created_at
  UNIQUE(chunk_id, model, model_version)
)
```

### 11.3 Strategy

| Aspect | V1 choice |
| --- | --- |
| **Chunker** | Section-aware. Never cross a `cf_document_sections` boundary. |
| **Target size** | 512 tokens, 64-token overlap. |
| **Small sections** | Kept whole below 512 — do not pad or merge across headings. |
| **Oversized sections** | Split on sentence boundaries; offsets preserved through every split. |
| **Model** | `bge-m3`, 1024 dims, multilingual EN/ZH/TH (RD-4). |
| **Index** | pgvector **HNSW**, `m=16`, `ef_construction=64`, cosine. |
| **Re-embedding** | A model change writes a new `(chunk_id, model, model_version)` row. Embeddings are never overwritten — the old vectors stay queryable until the new index is verified. |
| **Chunker change** | Bumps `chunker_version` → new chunks → re-embed. Old chunks retained until dependent facts are re-verified. |

### 11.4 What the vector index is for at V1 — and what it is not

| Use | Phase | Note |
| --- | --- | --- |
| Retrieval for LLM-assisted extraction (RAG over approved sources) | **V1** | The reason embeddings exist at V1 |
| Reviewer evidence search ("find the section that says X") | **V1** | Directly serves review throughput — the binding constraint |
| Soft duplicate detection | **Step 5+** | After exact-hash dedup has actually run |
| Entity resolution by similarity | **Step 5+** | Never auto-merges. Proposes; a human decides. |

**The vector index never decides truth.** It retrieves candidates. Facts cite
sections, not vectors.

---

## 12. V1 boundary and implementation sequence (resolves CFD-02)

V1's plan placed the pilot at **Phase 14 of 15** — thirteen phases of platform
construction, including a knowledge graph, translation memory and a media
pipeline, before any contact with a real website. Every assumption would go
unvalidated for the entire build.

### 12.1 V1 boundary

**One tenant. One site. One content type. One reviewer. No crawling.**

**In:** manual source registration · raw evidence store (MinIO, immutable) ·
HTML + PDF parsers · OCR fallback · sections with citation offsets · chunking ·
embedding · pgvector index · entity + alias (3 types) · fact + evidence +
`support_level` · one-role review with batch approve · publish package JSON ·
audit + versioning · **one reconciled state machine** · idempotency, retry, DLQ,
backpressure · backup with **verified restore**.

**Out (with phase):** relationships (6+) · taxonomy/classification (6+) ·
weighted confidence (6+) · duplicate detection beyond hash+URL (5+) ·
translation memory + glossary + localization (6+) · media pipeline (5+) ·
perceptual hash (6+) · multi-tenancy RLS (6) · site overlays (6) · SLAs (6+) ·
escalation (6+) · L0–L5 (6+) · risk classes (6+) · 10 roles (6+) ·
RSS/API/email collectors (5+/6+) · scheduling (5+) · crawling (6+).

### 12.2 Pilot content

**GoThailandHome knowledge articles.** `content/knowledge/articles/` already holds
one authored, verified, trilingual article (`bts-skytrain-overview`) that **no
route reads** — content investment already made, returning nothing
(`CEO_PRODUCT_REVIEW_PACKAGE.md` MED-01).

It is real content, with a real and already-diagnosed publishing gap, needing no
crawling, exercising the entire spine — source → evidence → review → package →
adapter — and producing a visible business outcome rather than a platform.

**If the factory cannot publish one article that already exists, it will not serve 100 websites.**

### 12.3 Sequence

| Step | Work | Exit gate |
| --- | --- | --- |
| **0** | **Documentation revision** — this document + runtime + checklist | Six documents agree. **Costs no engineering time.** |
| **1** | **Windows 01 readiness audit** — `WINDOWS01_VALIDATION_CHECKLIST.md` | All P0 checklist items pass; RD-1 and RD-5 confirmed against real hardware |
| **2** | **Vertical slice on Mac mini** — one HTML fixture → parsed → sections → chunk → embed → one fact with evidence → review → package JSON. No Windows dependency, no containers | One article publishes end to end |
| **3** | **Move to Windows 01** — the real runtime test | **Survives a forced reboot mid-pipeline with zero data loss and zero duplicate side effects.** Restore verified from backup. |
| **4** | **Pilot: GoThailandHome knowledge articles** | Article live via adapter; **reviewer throughput measured against real volume** (§2.2) |
| **5** | **Harden** — reliability controls built against *observed* failures | DLQ, poison handling, backpressure tuned to measured rates |
| **6** | **Second site: TAI FAITH** — RLS enabled; the real multi-tenancy test | A site added by configuration. **The reuse claim is proven or falsified here — in month 2, not month 14.** |
| **7** | Generalise only what Steps 4–6 proved necessary | — |

### 12.4 Organisational constraint

GoThailandHome currently has an **open P0** — silent lead loss
(`PRODUCTION_FIX_PLAN.md` CRIT-01) — and a launch-gating P1. **The Content Factory
must not consume engineering capacity until the revenue-losing defect is closed.**
Step 0 is documentation and costs nothing; Step 1 is an audit. Neither competes
with the P0 fix. Step 2 must not start before CRIT-01 ships.

---

## 13. Decision register resolution map

| Decision | V1 finding | V2 status |
| --- | --- | --- |
| CFD-01 | No runtime architecture | **Resolved** — §9 + runtime doc |
| CFD-02 | Pilot at Phase 14/15 | **Resolved** — §12.3 |
| CFD-03 | Three state vocabularies | **Resolved** — §7 |
| CFD-04 | Reliability absent | **Resolved** — §10 + runtime doc §6 |
| CFD-05 | Tenant isolation undefined | **Resolved** — §8 |
| CFD-06 | Claim has no table | **Resolved** — §6.5, collapsed into Fact |
| CFD-07 | Review decisions unauditable | **Resolved** — §6.9 |
| CFD-08 | Embeddings, no storage | **Resolved by retention, not deletion** — §11 |
| CFD-09 | Site overlays unstorable | **Resolved** — §8.2 |
| CFD-10 | Two naming conventions | **Resolved** — `cf_` throughout |
| CFD-11 | Robots named, not built | **Resolved** — §6.1; V1 has no fetch collector |
| CFD-12 | Personal data = 2 bullets | **Partially** — §9.3 + CFD-35; a compliance workstream, not an architecture fix |
| CFD-13 | Retention has no executor | **Resolved** — runtime doc §4.6 |
| CFD-14 | Backup, no restore | **Resolved** — runtime doc §7 + checklist |
| CFD-15 | Reviewer capacity unmodelled | **Resolved** — §2.2, §10.5 |
| CFD-16 | "100+" unsubstantiated | **Resolved** — §2.1 |
| CFD-17, CFD-18 | Phase ordering contradictions | **Resolved** — §12.3 replaces both plans |
| CFD-19 | Append-only vs mutable | **Resolved** — §6.13 |
| CFD-20…CFD-34 | Reconciliations and overengineering | **Resolved** — §6 |
| **CFD-35** | **New: LLM API sends source content off-box (PDPA/GDPR)** | **Open — P1.** Created by naming the runtime. Mitigation §9.3; owner Compliance/Legal; gate: before Step 4 |

**34 V1 decisions → 33 resolved, 1 partial (CFD-12), 1 new (CFD-35).**

---

## 14. Non-goals

The Content Factory is not: a crawler-first system · a UI redesign · a migration
plan for the GoThailandHome Alpha schema · a page rendering architecture · a
replacement for human review · a permission bypass for restricted content · a
one-site content script · an ERP, CRM, or marketing automation platform.

---

## 15. Success criteria

**V1 succeeds when:**

1. One real knowledge article moves source → evidence → chunk → embedding → review → package → published, with every fact citing a character range in an immutable section.
2. The pipeline survives a forced Windows 01 reboot mid-run with **zero data loss and zero duplicate side effects**.
3. A restore from backup is **performed and verified**, not documented.
4. Measured reviewer throughput is known and intake is throttled against it.
5. Adding TAI FAITH requires **configuration and an adapter — not a pipeline rewrite**.

Criterion 5 is the whole thesis. It is testable at Step 6, in month 2.

**Readiness:** this revision closes the five P0 findings. Next gate is
`WINDOWS01_VALIDATION_CHECKLIST.md`.
