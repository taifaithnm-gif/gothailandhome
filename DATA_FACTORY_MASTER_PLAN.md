# GoThailandHome — Data Factory Master Plan

**Document:** `DATA_FACTORY_MASTER_PLAN.md`  
**Project:** GoThailandHome Data Factory & AI Platform  
**Status:** Design only — no code, no schema apply, no deployment  
**Date:** 2026-07-20  
**Context:** Phase 1 website RC complete. This plan defines the complete backend data ecosystem for Phase 2 Data Architecture and beyond.  
**Workspace boundary:** Data Factory & AI Platform only. No UI development, page styling, frontend redesign, Core Development feature work, or production deployment from this workspace.

---

## 0. Executive verdict

GoThailandHome already has a **working Property Factory spine** (harvest → package → validate → Supabase import) and a **design-complete but unbuilt Content Factory / Windows01 runtime**. The strategic mistake would be treating these as two competing systems.

**Master decision:** Build one **Data Factory Platform** with two product domains sharing one spine:

| Domain | Job | Truth model today | Target truth model |
| --- | --- | --- | --- |
| **Catalog Factory** | Developers, projects, listings, districts | Packages + Supabase (partial sync) | Package = evidence/source of record; Supabase = serving catalog |
| **Knowledge Factory** | Articles, guides, FAQ, blog, legal/investment knowledge | Filesystem JSON only | Package → review store → publish package → site content store |

AI recommendation, AI search, and knowledge graph sit **on top of** this spine. They do not replace it.

---

## 1. Business Scope

### 1.1 Business problem

GoThailandHome must become the most trustworthy Thailand property discovery platform for international buyers (EN / ZH / TH). Trust requires:

1. **Real inventory** with provenance, not scraped noise.
2. **Real projects and developers** with official enrichment.
3. **Real geography** that powers SEO and discovery.
4. **Governed knowledge** (legal / investment / how-to) that never fabricates advice.
5. **AI that recommends and retrieves** only from approved, versioned facts.

### 1.2 In scope (Data Factory & AI Platform)

1. Property Data Model (canonical catalog entities + provenance)
2. Developer Database
3. Project Database
4. District Database
5. Knowledge Database
6. SEO Data Model
7. CMS Architecture (ops/admin for data — not public UI redesign)
8. Supabase Schema (additive evolution of existing catalog)
9. Admin Architecture (data ops / review / publish gates)
10. Import Pipeline (unify and harden existing factory)
11. Data Quality Rules
12. AI Recommendation Architecture
13. AI Search Architecture
14. Knowledge Graph
15. Metadata Standards
16. Data Versioning
17. Workflow Design
18. Automation Design
19. Windows01 Runtime Preparation
20. Phase 2 Data Architecture

### 1.3 Explicitly out of scope

| Out | Why |
| --- | --- |
| Public page redesign / styling | Core Development / website workspace |
| Marketplace payments, agent CRM UX, ads go-live | Platform / product phases — consume stable data interfaces only |
| Production website deployment | Separate release runbook |
| Fabricating prices, availability, ownership claims, ROI promises | Trust & legal risk |
| Unregistered source crawling | Governance risk |
| AI auto-publish | Human gate is non-negotiable |

### 1.4 Scale targets (planning horizon)

| Entity | Near-term (Phase 2A) | Mid-term (Phase 2B–C) | North star |
| --- | --- | --- | --- |
| Developers | 50 verified | 100 | 300+ Thailand |
| Projects | 80 Bangkok new-condo | 500 | Multi-city |
| Listings | 5,000 verified | 10,000 | Continuous refresh |
| Districts | 50 Bangkok complete | + secondary cities | National |
| Knowledge items | 50 approved | 200 | Multi-site reusable |
| Languages | EN / ZH / TH | same | + later locales only after trinity solid |

### 1.5 Success definition

A world-class real estate data platform for GoThailandHome means:

- Every public catalog fact is **traceable** to source evidence.
- Every publish is **reviewable, versioned, and rollbackable**.
- Package ↔ database **drift is measured and closed**.
- AI answers and recommendations **cite approved nodes only**.
- Windows01 can fail or be wiped **without destroying Mac mini control plane or production catalog**.

---

## 2. Overall Architecture

### 2.1 First principles

1. **Evidence before entity** — nothing enters the catalog without a source URI, capture time, and content hash when machine-collected.
2. **Package is the contract** — humans and machines exchange JSON packages; databases are projections.
3. **Serving store ≠ work store** — Supabase serves the website; Windows01 (or Mac mini ops) holds raw evidence, queues, review state, and experimental AI indexes until promoted.
4. **Human throughput is the bottleneck** — automation must throttle to review capacity.
5. **Additive evolution** — extend existing Supabase tables; do not rewrite the Phase 3–6 catalog.
6. **AI assists; humans govern** — extract, classify, match, translate, rank; never approve publish.
7. **Idempotent everything** — re-run harvest/import/embed without duplicate side effects.
8. **Design for two sites, not one hundred** — reusability proven at site #2; do not overbuild multi-tenant fantasy.

### 2.2 Logical system map

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ CONTROL PLANE (Mac mini)                                                 │
│  Repo · Standards · Package review · Factory CLI · Owner gates · Website │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ approved packages / jobs / configs
┌───────────────────────────────▼──────────────────────────────────────────┐
│ EXECUTION PLANE (Windows01 — removable pilot node)                       │
│  Scheduler · Queue · Collectors · Parsers · Validators · Evidence store  │
│  Optional: OCR · Embed workers · Local Postgres/pgvector · MinIO · Redis │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ publish packages + import batches
┌───────────────────────────────▼──────────────────────────────────────────┐
│ SERVING PLANE (Supabase + Next.js loaders)                               │
│  Catalog tables · Geography · Media URLs · RLS · Website read path       │
│  Static knowledge loader (until Knowledge DB publish path is live)       │
└──────────────────────────────────────────────────────────────────────────┘
                                │ embeddings / graph / signals (approved only)
┌───────────────────────────────▼──────────────────────────────────────────┐
│ INTELLIGENCE PLANE (Phase 2C+)                                           │
│  Vector index · Knowledge graph · Recommenders · AI search · Feedback    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Domain boundaries

```text
DATA FACTORY PLATFORM
├─ Catalog Domain
│  ├─ Developer Factory
│  ├─ Project Factory
│  ├─ Listing / Property Factory
│  └─ District / Geography Factory
├─ Knowledge Domain
│  ├─ Articles / Blog / FAQ
│  ├─ Investment & Legal guides
│  └─ Source Registry & Evidence
├─ SEO Domain
│  ├─ Entity SEO fields
│  ├─ Sitemap / canonical / schema payloads (data, not UI)
│  └─ Freshness & uniqueness rules
├─ Ops Domain
│  ├─ Import Pipeline
│  ├─ Review & Publication Workflows
│  ├─ Admin / CMS for data ops
│  └─ Quality, versioning, audit
└─ Intelligence Domain
   ├─ Embeddings & AI Search
   ├─ Recommendations
   └─ Knowledge Graph
```

### 2.4 Relationship to existing repo assets

| Existing asset | Role in this plan |
| --- | --- |
| `pipelines/factory/*` | Catalog Factory runtime on Mac mini — keep, harden, contract-align |
| `content/developers|projects|areas|listings` | Package-of-record for catalog |
| `content/knowledge|blog|faq|guides` | Knowledge packages (filesystem today) |
| `supabase/migrations/*` | Serving catalog schema — evolve additively |
| `PROPERTY_*_V1.md`, `REVIEW_*_V1.md` | Freeze as Catalog Pilot standards |
| `CONTENT_FACTORY_ARCHITECTURE_V2.md` | Knowledge Domain + Windows01 design input |
| `WINDOWS01_*`, `RUNTIME_*` | Execution plane — implement only after P0 gates |
| `PROPERTY_FACTORY_MASTER_PLAN.md` | Superseded in strategy by this document; keep as historical Phase 6 plan |
| Website `src/app`, styling | **Read-only consumer** for this workspace |

### 2.5 Unification rule (binding)

Do **not** build a second parallel property database inside Content Factory.

- Content Factory V2 remains the **Knowledge + evidence + multi-site publish** architecture.
- Property Factory remains the **Catalog import** architecture into existing Supabase tables.
- Shared layers: Source Registry, Evidence Store, Review State Machine vocabulary, Package format conventions, Windows01 workers where collection is heavy.

Handoff between domains is always a **versioned package**, never a silent cross-DB write.

---

## 3. Database Architecture

### 3.1 Store topology

| Store | Technology | Owns | Does not own |
| --- | --- | --- | --- |
| **Serving Catalog DB** | Supabase Postgres (existing) | Public catalog entities, RLS, media refs, import batch audit | Raw HTML, OCR blobs, review queues, embeddings (initially) |
| **Package FS** | Git + `content/` | Human-reviewable manifests, evidence pointers, knowledge drafts | Runtime secrets |
| **Factory Work DB** | Windows01 Postgres (future) | Sources, raw items, review tasks, job state, `cf_*` knowledge objects | Website auth users |
| **Object Store** | Supabase Storage now; MinIO on Windows01 for evidence | Media mirrors, raw captures, evidence blobs | Canonical business keys |
| **Vector Index** | pgvector on Windows01 first; promote later if needed | Chunks/embeddings for approved knowledge & catalog text | Unreviewed raw text as searchable truth |

### 3.2 Serving catalog — canonical entities (keep & extend)

Existing tables remain the public catalog spine:

```text
cities
  └── districts
        └── locations (optional finer grain)
developers
  └── property_projects
        └── properties (listings)
              ├── property_media
              ├── property_features
              ├── property_listing_sources (multi-source observations)
              └── listing_price_history
import_batches / import_batch_items
agents / inquiries / marketplace_leads (adjacent; not factory core)
admin_users
```

**Additive evolution only** (Phase 2 Data Architecture):

| Addition | Purpose |
| --- | --- |
| `data_versions` / entity `row_version` + `content_hash` | Versioning & drift detection |
| `entity_seo` view or normalized SEO table (optional) | Cross-entity SEO governance |
| `publish_events` | Immutable publish/rollback log for catalog |
| `quality_scores` / `quality_flags` | Machine + human quality signals |
| Sync TypeScript `Database` types with factory ops tables | Close schema/type drift |
| Knowledge publish tables **or** continued FS publish with index | Decide in Milestone M3 (see §14) |

### 3.3 Knowledge / factory work model (logical)

Aligned with Content Factory V2, reduced to what Phase 2 needs:

```text
sources                 # registered, approved sources only
raw_items               # captured payloads + hash + URI + time
evidence_objects        # durable pointers to blobs + citation spans
entities                # typed nodes: developer|project|district|concept|org
facts                   # claim + support_level + evidence_ids + confidence
content_items           # article/faq/guide drafts bound to facts
review_tasks            # human workflow instances
publish_packages        # immutable export artifacts
cf_chunks / cf_embeddings  # Step-gated; not pilot day-1 if Owner defers
```

**Rule:** Catalog entities in Supabase are **not** duplicated as competing masters in `entities` unless the Knowledge Domain needs a graph node referencing them by stable external key (`developer_slug`, `project_slug`, `property_id`).

### 3.4 Identity & keys

| Entity | Business key | Technical key |
| --- | --- | --- |
| Developer | `slug` | UUID |
| Project | `slug` | UUID |
| Listing | `external_ref` + `source` **or** URL hash + soft fingerprint | UUID |
| District | `city_slug` + `district_slug` | UUID |
| Knowledge item | `content_type` + `slug` | UUID / path |
| Source observation | `source` + `source_listing_id` / URL hash | UUID in `property_listing_sources` |

Duplicate policy remains deterministic per `PROPERTY_DUPLICATE_RULE_V1.md`. Soft-match never auto-merges without human confirm for publish-grade records.

### 3.5 Locale model

Every public text block is a **locale trinity**: `en` / `zh` / `th`.

Allowed states per field group:

- `complete` — all three present and reviewed
- `partial` — at least EN present; others explicitly `pending`
- `blocked` — missing required EN for publish

Never invent translation. Machine draft translations are `draft` until human accept.

---

## 4. CMS Architecture

### 4.1 Position

This is **not** a marketing CMS rebuild. It is a **Data Ops CMS**:

- Inspect packages
- Review facts / listings / knowledge
- Approve / reject / request changes
- Trigger import / publish / rollback
- View quality, freshness, provenance

**Stance preserved:** Pipeline over public CMS for bulk inventory. CMS is the human control surface on top of packages and batches.

### 4.2 CMS surfaces (architecture only)

| Surface | Primary objects | Actor |
| --- | --- | --- |
| **Source Registry Admin** | Sources, permissions, robots/legal notes | Owner / Data Ops |
| **Package Browser** | Developer / project / district / listing / knowledge packages | Reviewer |
| **Review Console** | Review tasks, checklists, decisions, audit | Reviewer |
| **Import Console** | Batches, dry-run diffs, apply, resume, rollback | Data Ops |
| **Quality Console** | Completeness, freshness, drift, duplicate queues | Data Ops |
| **Publish Console** | Publish packages, batch hashes, rollback | Owner |
| **Catalog Admin (existing)** | Manual property CRUD | Admin (keep minimal) |

### 4.3 CMS ↔ stores

```text
Reviewer UI ──reads──► packages + review_tasks + evidence
           ──writes──► review decisions (append-only audit)
Data Ops   ──runs────► factory CLI / Windows01 jobs
Owner      ──signs────► publish package (hash + approval record)
Website    ──reads────► Supabase catalog + approved knowledge only
```

### 4.4 What not to build

- WYSIWYG page builder for public pages
- Unstructured “blog CMS” that bypasses source/evidence rules
- AI one-click publish
- Dual editors that write Supabase and packages without a sync contract

---

## 5. Property Pipeline (Listings)

### 5.1 Goal

Produce **verified, multi-source, history-aware listings** in Supabase without inventing data.

### 5.2 Current reality (keep)

Multi-portal harvest already exists: PropertyHub, LivingInsider, DDProperty, Hipflat, DotProperty, FazWaz → packages / match → import → `import_batches`, `property_listing_sources`, price history.

### 5.3 Target pipeline

```text
1. Source Registration (approved portal/developer feed)
2. Harvest Job (Windows01 preferred for heavy crawl; Mac mini OK for controlled waves)
3. Raw Capture Persist (URI, headers, body hash, captured_at)
4. Parse → Candidate Listing Record (adapter contract)
5. Validate (AJV schema + quality rules)
6. Identity Resolution (exact → soft match → human queue)
7. Package Write (per project listings-*.json and/or batch file)
8. Dry-run Diff against Supabase
9. Human Gate (verification_status / publish rules)
10. Apply Import (idempotent upsert + batch items)
11. Post-import Audit (overnight reconcile)
12. Freshness Sweep (stale / delisted)
```

### 5.4 Listing record contract (canonical fields)

Must always carry:

- `source`, `listing_url`, `external_ref` / `source_listing_id`
- `listing_type`, `property_type`, `price_thb`
- `source_updated_at` or capture fallback with explicit note
- i18n title/summary/description (trinity rules)
- project link (slug/FK) when known
- geography link when known
- `verification_status`, `duplicate_fingerprint`
- media refs with provenance

### 5.5 Quality gates before `published`

| Gate | Rule |
| --- | --- |
| Provenance | Source URL resolvable at capture time; hash stored |
| Price | Numeric THB; no fabricated “from” ranges unless sourced |
| Identity | No unresolved soft-match collisions |
| Project link | Prefer linked project; orphan listings flagged |
| Freshness | Within freshness band or marked `stale` |
| Locale | EN required; ZH/TH pending allowed with flag |
| Human | Publish requires verification rule pass — AI cannot set published |

---

## 6. Developer Pipeline

### 6.1 Goal

Build a **trusted developer graph** (profile + SEO + official links + related projects).

### 6.2 Pipeline

```text
Approved official sources
  → capture website / Maps / brand pages
  → extract profile fields (no invention)
  → package: content/developers/<slug>/manifest.json
  → validate developer.manifest schema
  → review (brand names EN/ZH/TH, logo rights, SEO)
  → import upsert → developers
  → link property_projects
  → completeness matrix score
```

### 6.3 Required field groups

| Group | Examples |
| --- | --- |
| Identity | slug, legal/brand names EN/ZH/TH |
| Narrative | descriptions EN/ZH/TH (sourced or marked editorial) |
| Assets | logo path/URL with license note |
| Links | official site, Maps, social (sourced) |
| SEO | title/description trinity |
| Relations | published project slugs |
| Governance | `publish_ready`, sources[], evidence hashes |

### 6.4 Completeness scoring

Reuse the existing completeness-matrix idea:

- **A** — profile + SEO trinity + logo + ≥1 linked published project + official link
- **B** — missing one non-critical locale or media
- **C** — stub / name-only — not public-grade

Only A/B enter public developer surfaces; C stays draft.

---

## 7. Project Pipeline

### 7.1 Goal

Make each project a **SEO-grade, media-rich, geography-linked hub** that listings attach to.

### 7.2 Pipeline

```text
Developer-linked candidate
  → multi-source project facts (official + portals)
  → evidence-backed specs / facilities / transit / nearby
  → media library assets (hero, gallery, brochure metadata)
  → package: content/projects/<slug>/manifest.json (+ listings-*.json)
  → validate project.manifest + media.manifest
  → review (facts, duplicates, media rights, SEO)
  → import → property_projects (+ media paths)
  → attach listings via FK/slug
  → project completeness score
```

### 7.3 Critical project data classes

1. **Identity** — slug, developer, status  
2. **Geography** — city, district, coordinates only if sourced  
3. **Product facts** — unit types, sizes, facilities (null if unknown)  
4. **Access** — transit tags / named nodes with distances when sourced  
5. **Media** — cover + gallery with asset manifests  
6. **SEO** — trinity title/description + OG asset  
7. **FAQ** — sourced or explicitly templated boilerplate  
8. **Provenance** — sources[] on every non-editorial field group  

### 7.4 Anti-patterns

- Filling coordinates from guesswork
- Copying portal marketing claims as verified facts
- Publishing projects with zero media and no district
- Treating listing count as project completeness

---

## 8. Knowledge Pipeline

### 8.1 Goal

Produce **governed knowledge objects** (articles, FAQ, investment/legal guides, blog) that can eventually serve multiple sites without rewriting the pipeline.

### 8.2 Dual-track reality → convergence

| Track | Today | Phase 2 plan |
| --- | --- | --- |
| Website editorial FS | `content/knowledge|blog|faq|guides` + loader | Remains valid publish target for GoThailandHome v1 |
| Content Factory V2 | Docs only | Windows01 work DB + evidence + review for new collection |

**Convergence rule:** New collected knowledge enters Factory review first; export publish package into the website content path (or future knowledge tables) only after approval.

### 8.3 Pipeline stages (compressed from CF V2)

```text
Source register → collect → parse → extract facts/entities
  → duplicate & conflict check → language check → compliance check
  → human review → publish package → site ingest → archive/supersede
```

### 8.4 Content types

| Type | Risk class | Extra gates |
| --- | --- | --- |
| General knowledge article | Medium | Source attribution |
| FAQ | Medium | No advice creep |
| Blog | Medium | Marketing claims review |
| Investment guide | High | Forbidden claims / ROI wording / forecast disclaimer |
| Legal guide | High | Forbidden advice / required disclaimers / source attribution |

Investment and legal already have governance packages (`G_INVESTMENT_*`, `G_LEGAL_*`). Knowledge Pipeline must enforce those as machine-checkable rules where possible and human checklist otherwise.

### 8.5 Knowledge database decision (Milestone M3)

Choose exactly one serving strategy for GoThailandHome:

**Option K1 — FS remains package-of-record for knowledge** (faster, current site compatible)  
**Option K2 — Supabase knowledge tables** (better query/admin; migration cost)

Default recommendation: **K1 for Phase 2A–B**, design schema for K2, migrate when review console needs DB queries at scale.

---

## 9. SEO Pipeline

### 9.1 Goal

Treat SEO as a **first-class data product**, not a page afterthought.

### 9.2 SEO data model

Every indexable entity carries:

| Field | Rule |
| --- | --- |
| `seo_title_{en,zh,th}` | Unique within entity type+locale; length band enforced |
| `seo_description_{en,zh,th}` | Non-duplicate; no keyword stuffing; no fabricated claims |
| Canonical slug | Stable; redirects recorded on change |
| OG/hero asset | Exists for projects/developers when published |
| Structured data payload | Generated from approved fields only (`Organization`, `RealEstateListing`, `BreadcrumbList`, etc.) |
| Freshness signal | `updated_at` / `source_updated_at` influence revisit policy |
| Indexability flag | draft/noindex until publish gate |

### 9.3 SEO pipeline flow

```text
Entity package fields
  → SEO linter (length, uniqueness, locale completeness, forbidden phrases)
  → human SEO review for high-traffic hubs (districts, top projects, developers)
  → import SEO columns
  → sitemap entity set = published ∩ indexable
  → search console feedback loop (manual ops initially)
```

### 9.4 Priority SEO surfaces (data readiness order)

1. Bangkok districts (50) — hub pages  
2. Top projects — transactional + informational  
3. Developers — brand hubs  
4. Listing detail — long tail  
5. Knowledge hubs — trust & acquisition  

### 9.5 SEO quality rules (non-negotiable)

- No SEO text that asserts legal/investment outcomes not allowed by governance docs  
- No thin district pages: summary trinity required before `is_active` public push  
- Slug changes require redirect record (data table or package sidecar)  
- Multilingual titles are translations/localizations of the same entity, not different products  

---

## 10. Data Governance

### 10.1 Governance pillars

1. **Source approval** — no collector against unregistered sources  
2. **Evidence retention** — hash + URI + time for machine captures  
3. **Human publish authority** — AI cannot approve  
4. **Locale honesty** — pending is allowed; fabrication is not  
5. **Freshness** — 30/90-day bands (per property standards) with stale handling  
6. **Auditability** — append-only review and publish logs  
7. **Rollback** — every publish batch has reverse path  
8. **PII minimization** — do not store unnecessary personal data from portals  

### 10.2 Roles

| Role | May | May not |
| --- | --- | --- |
| Collector / Worker | Capture, parse, propose | Approve publish |
| Reviewer | Accept/reject/edit within policy | Bypass source rules |
| Data Ops | Run imports, freeze waves, remediate drift | Change Owner policy |
| Owner | Approve sources, publish batches, exception grants | — |
| AI Agent | Suggest, score, draft, flag | Final approve / invent facts |

### 10.3 State machines (unify vocabularies)

**Catalog record (listing/project/developer):**  
`candidate → validated → in_review → approved → publish_ready → published → stale|archived|rejected`

**Knowledge item:**  
Same spine; compliance sub-checks are flags on `in_review`, not separate infinite role trees.

**Publication batch:**  
`draft_batch → hashed → owner_approved → applied → (rolled_back)`

### 10.4 Data quality rules (platform-wide)

| Rule ID | Rule |
| --- | --- |
| DQ-01 | Null preferred over fabricated value |
| DQ-02 | Every price has currency THB and provenance |
| DQ-03 | Coordinates require source evidence |
| DQ-04 | Duplicate fingerprints must be unique among published |
| DQ-05 | Package schema validation is blocking |
| DQ-06 | Dry-run required before apply on production catalog |
| DQ-07 | Published EN title required |
| DQ-08 | Soft-match auto-link never auto-publish |
| DQ-09 | Media must have rights/source note for official assets |
| DQ-10 | Drift report: package count vs DB count per wave |

### 10.5 Owner gates before live factory expansion

Carry forward unresolved gates (names may map to existing G1–G5):

| Gate | Meaning |
| --- | --- |
| G-SOURCE | Approved source list signed |
| G-FIELDS | Field dictionary acceptance for scale-up |
| G-INVENTORY | Pilot/product inventory freeze for wave |
| G-WIN01 | Windows01 validation checklist pass + V2 P0 closure |
| G-PUBLISH | Publication approval workflow authorized for target environment |

No gate → no production-impacting automation.

---

## 11. AI Architecture

### 11.1 Design stance

AI is an **intelligence plane** over governed data. It does not own truth.

### 11.2 Capability map

| Capability | Input | Output | Phase |
| --- | --- | --- | --- |
| Extraction assist | Raw pages | Candidate facts/fields | 2B |
| Dedup / match assist | Listings/projects | Soft-match suggestions | 2A (extend existing) |
| Translation draft | EN fields | ZH/TH drafts marked `machine_draft` | 2B |
| Embedding index | Approved text chunks | Vectors | 2C (after Owner embedding decision) |
| AI Search | Query + filters | Ranked entity/chunk hits with citations | 2C |
| Recommendations | User context + catalog signals | Ranked property/project suggestions | 2C–2D |
| Knowledge graph reasoning | Entities + relations | Path explanations / related hubs | 2D |
| Compliance flagging | Draft text | Forbidden-phrase / missing-disclaimer hits | 2B |

### 11.3 AI Search Architecture

```text
Query
  → language detect
  → retrieve (keyword + vector on approved chunks only)
  → filter (publish status, locale, geo, listing_type)
  → re-rank (business rules: verified > stale, completeness, freshness)
  → response package {hits, citations, abstain_if_low_confidence}
```

**Abstain rule:** If evidence confidence below threshold, return curated navigation (district/project hubs) rather than hallucinated answer text.

### 11.4 AI Recommendation Architecture

Stable interfaces (tables/contracts first, models later) — compatible with `PLATFORM_ARCHITECTURE_V2` future adapters:

```text
recommendation_profiles     # audience / intent features
recommendation_snapshots    # immutable scored candidate sets
recommendation_feedback     # click / enquire / dismiss / convert
recommendation_rules        # hard filters (budget, locale, geo, verification)
```

Ranking signals (examples):

- Hard filters: budget, sale/rent, district, bedrooms  
- Soft: project completeness, verification, freshness, media quality  
- Behavioral: enquire rate, compare/favorite overlap (privacy-safe aggregates)  
- Graph: same developer / same transit node / complementary districts  

No dark-pattern ranking. No paid placement in organic AI rank without explicit labeled inventory later.

### 11.5 Knowledge Graph

**Purpose:** Explain relationships; power relatedness; support editorial consistency — not replace SQL catalog.

**Node types:** `Developer`, `Project`, `District`, `City`, `TransitNode`, `Amenity`, `Concept` (e.g. foreign-ownership), `Source`, `ContentItem`.

**Edge types (examples):**  
`DEVELOPS`, `LOCATED_IN`, `NEAR`, `SERVES_TRANSIT`, `HAS_LISTING`, `CITES`, `SUPERSEDES`, `SAME_AS` (identity links).

**Storage:** Start with relational edge table + package exports; evaluate specialized graph DB only after query patterns demand it.

### 11.6 Model hosting policy

- Prefer **local / Windows01** models for embeddings and extraction where feasible (data control).  
- Cloud LLMs allowed only with redaction policy and no PII/raw credential leakage.  
- Model prompts and versions are recorded on review tasks that used them.

---

## 12. Windows01 Integration Plan

### 12.1 Role

Windows01 is a **removable execution node** for collection, parsing, evidence storage, queues, and later embeddings. It is **not** the website host and **not** the production Supabase authority.

Mac mini remains:

- Git control plane  
- Standards and Owner decisions  
- Package review operations  
- Website engineering boundary (separate from this workspace’s implementation work)

### 12.2 Integration pattern

```text
Mac mini                          Windows01
────────                          ─────────
Define job manifests       ──►    Pull jobs / run workers
Review packages locally    ◄──    Write candidate packages + evidence refs
Approve publish            ──►    (optional) finalize export
Factory CLI apply to       ◄──    Never writes Supabase directly in pilot
  Supabase (control plane)
```

**Pilot rule:** Windows01 should not hold production DB credentials with write access until Owner explicitly authorizes a controlled service role and audit path. Prefer package handoff.

### 12.3 Runtime stack (target, gated)

From existing Windows01 design, keep the shape but freeze implementation until P0s close:

| Component | Role |
| --- | --- |
| WSL2 + Docker Compose | Process isolation |
| Postgres + pgvector | Work DB + vectors |
| Redis | Queue / locks |
| MinIO | Evidence/object store |
| API + workers | Collect/parse/validate/embed |
| Scheduler | Crons / backpressure |
| Monitoring | Heartbeat + external dead-man (required) |

### 12.4 Preconditions (NO-GO until done)

1. Close Windows01 V2 **P0 blockers** (egress policy, external dead-man, Tailscale path, image/arch strategy, real off-box backup/RPO, object durability model).  
2. Pass `WINDOWS01_VALIDATION_CHECKLIST.md` hardware/environment audit.  
3. Create dedicated directory root (proposed `D:\AI-Workspace\GoThailandHome-Data-Factory\`) with backup plan.  
4. Owner gate **G-WIN01**.  
5. Agree embedding on/off for pilot (conflict between V1 deferral and V2 retention must be Owner-decided once).

### 12.5 Security boundary

- Tailscale-only admin ingress  
- No public ports for factory services  
- Secrets in local secret store / env not committed  
- Evidence retention policy with legal hold exceptions  
- Wipe procedure documented (removable node)  

---

## 13. Automation Roadmap

### 13.1 Automation layers

| Layer | Examples | Human still required? |
| --- | --- | --- |
| L0 Manual | One-off package edits | Yes |
| L1 Assisted | Harvest scripts, schema validate, dry-run diffs | Yes before apply |
| L2 Scheduled | Overnight reconcile, freshness sweep, completeness matrix | Yes on exceptions |
| L3 Closed-loop | Auto-restage stale listings, auto soft-match queue | Yes on publish |
| L4 Autonomous publish | — | **Forbidden** |

### 13.2 Near-term automations (safe)

1. Package ↔ Supabase drift detector (daily)  
2. Freshness classifier → `stale` proposals  
3. Completeness matrix regeneration  
4. SEO linter on packages  
5. Forbidden-claim regex/scanner for knowledge drafts  
6. Soft-match suggestion queue  
7. Import dry-run summary to audit folder  

### 13.3 Medium-term automations (Windows01)

1. Scheduled multi-source harvest with backpressure  
2. Evidence blob persistence + hash verify  
3. Parser version pinning + reprocess  
4. Dead-letter queue for poison records  
5. Embedding rebuild for approved corpus  
6. Reviewer workload throttle (pause intake when queue > N)  

### 13.4 Automation SLOs (planning)

| Metric | Target |
| --- | --- |
| Review queue age P50 | < 72h |
| Failed job retry exhaust to DLQ | 100% visibility |
| Drift open items | Trend to zero weekly |
| Accidental duplicate published listings | 0 |
| AI-approved publishes | 0 |

---

## 14. Milestone Plan

### Milestone M0 — Architecture freeze (this document)

**Outcome:** Owner accepts Data Factory Master Plan + unification rule.  
**Exit:** Signed scope; no code required.

### Milestone M1 — Catalog truth & contracts

**Focus:** Property / Developer / Project / District data model + quality rules + schema/type alignment plan.  
**Deliverables (docs + inventories, then gated implementation elsewhere):**

- Canonical field dictionaries reconciled (pilot V1 ↔ live schemas)  
- Drift baseline report  
- Adapter contract adoption plan for existing harvesters  
- SEO data rules freeze  

### Milestone M2 — Pipeline hardening

**Focus:** Import Pipeline + multi-source identity + overnight audit as platform services.  
**Outcomes:**

- Single CLI contract for validate / dry-run / apply / rollback  
- Batch publish log standard  
- Freshness & duplicate queues defined  

### Milestone M3 — Knowledge & CMS architecture

**Focus:** Knowledge DB decision (K1/K2), review console IA, admin architecture.  
**Outcomes:**

- Knowledge publish path specified  
- CMS surface map + permission model  
- Compliance rule hooks for legal/investment  

### Milestone M4 — Windows01 pilot runtime

**Focus:** Runtime preparation only after P0 + G-WIN01.  
**Outcomes:**

- Compose stack boots offline  
- One collector + one validator path on sample sources  
- Evidence store round-trip  
- No production catalog writes from Windows01  

### Milestone M5 — AI foundations

**Focus:** Embeddings decision, chunking standard, search/recommend interfaces.  
**Outcomes:**

- `cf_chunks` / embedding policy applied or explicitly deferred with date  
- Recommendation interface tables designed (additive)  
- Knowledge graph v0 edge list from existing catalog  

### Milestone M6 — Phase 2 Data Architecture release candidate

**Focus:** Integrated Data Factory RC for Owner review (still separate from website UI work).  
**Outcomes:**

- End-to-end: harvest → review → package → import → audit on agreed pilot set  
- AI search prototype on approved corpus (if embedding approved)  
- Risk register residual acceptable  

---

## 15. Risk Register

| ID | Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| R01 | Dual-factory divergence (CF vs Property) | High | High | Binding unification rule in §2.5; shared package/review vocabulary |
| R02 | Package ↔ DB drift grows | High | High | Daily drift job; freeze publish on critical drift |
| R03 | Windows01 P0 unresolved → stalled runtime | High | High | Keep Mac mini L1 automation; do not block catalog ops on Win01 |
| R04 | Embedding policy conflict (defer vs require) | Medium | High | Single Owner decision recorded before M5 |
| R05 | Portal ToS / legal crawl risk | High | Medium | Source approval gate; rate limits; official sources preferred |
| R06 | Fabricated enrichment by AI | High | Medium | Null-over-fabricate; evidence required; AI cannot publish |
| R07 | Reviewer backlog explosion | High | Medium | Intake backpressure; reduce source fan-out |
| R08 | Soft-match false merges | High | Medium | Human confirm for publish-grade merges |
| R09 | Schema/type drift (`types.ts` vs SQL) | Medium | High | M1 alignment task; CI check later |
| R10 | Knowledge compliance miss (legal/investment) | High | Medium | Machine scanners + mandatory human checklist |
| R11 | Secrets on Windows01 | High | Low | No prod write creds in pilot; Tailscale; wipe drill |
| R12 | Scope bleed into UI/frontend | Medium | High | Workspace boundary enforced; packages only |
| R13 | Overbuilding multi-tenant CF | Medium | Medium | Design for 2 sites; measure before scale |
| R14 | SEO thin content at district scale | Medium | Medium | Completeness gate before indexability |
| R15 | Marketplace/AI tables built too early | Low | Medium | Interfaces first; implement behind milestones |

---

## 16. Execution Sequence

Strict order. Do not skip gates.

```text
STEP 0  Owner accepts this Master Plan
        └─ Decision: unify Catalog + Knowledge under one Data Factory spine

STEP 1  Freeze standards pack used by Phase 2
        ├─ Property field/source/evidence/duplicate/freshness V1
        ├─ Review + publication + rollback V1
        ├─ Content Factory V2 principles (knowledge)
        └─ Resolve embedding defer-vs-retain (Owner one-liner)

STEP 2  M1 Catalog truth
        ├─ Inventory live schema vs packages vs types
        ├─ Drift baseline
        └─ SEO + DQ rule freeze

STEP 3  M2 Pipeline hardening (Catalog)
        ├─ Adapter contract alignment plan for harvesters
        ├─ Batch/audit/rollback as standard operating path
        └─ Completeness + freshness automation (L2)

STEP 4  M3 Knowledge + CMS architecture
        ├─ Choose K1/K2 knowledge serving
        ├─ Review console IA + permissions
        └─ Compliance hooks for legal/investment

STEP 5  Windows01 P0 closure + validation checklist
        └─ G-WIN01 gate

STEP 6  M4 Windows01 pilot runtime (no prod writes)
        └─ Evidence + one collector path

STEP 7  M5 AI foundations
        ├─ Chunk/embed policy
        ├─ Search architecture spike on approved corpus
        └─ Recommendation + graph interface design

STEP 8  M6 Data Factory RC
        └─ Owner review → authorize next implementation wave

HARD STOPS
  ✗ No UI/page styling work in this workspace
  ✗ No production deployment from factory workspace
  ✗ No Windows01 deploy before P0 + G-WIN01
  ✗ No AI auto-publish
  ✗ No unregistered source collection
```

### 16.1 Immediate next documents (after this plan — not this task)

When Owner authorizes follow-on design (still no premature code):

1. `DATA_FACTORY_SCHEMA_BLUEPRINT.md` — additive Supabase + work DB  
2. `DATA_FACTORY_PACKAGE_CONTRACTS.md` — unified package envelopes  
3. `DATA_FACTORY_REVIEW_CMS_IA.md` — admin/CMS information architecture  
4. `DATA_FACTORY_AI_INTERFACE_SPEC.md` — search/recommend/graph contracts  
5. `WINDOWS01_P0_CLOSURE_PLAN.md` — kill the runtime blockers  

---

## 17. Metadata Standards (summary)

All factory objects carry a common metadata envelope:

```text
meta.schema_version
meta.entity_type
meta.business_key
meta.locale_status          # complete | partial | blocked
meta.sources[]             # {source_id, uri, captured_at, content_hash}
meta.evidence_ids[]
meta.quality_flags[]
meta.verification_status
meta.review_status
meta.content_hash
meta.row_version / package_version
meta.created_at / updated_at
meta.created_by / reviewed_by
meta.model_assist          # optional {model, prompt_id, ts} if AI touched
```

Versioning rules:

- Package version increments on any field change.  
- Import apply stores package hash on batch item.  
- Publish creates immutable publish event.  
- Supersession keeps prior version readable for audit/rollback.

---

## 18. Workflow Design (end-to-end)

### 18.1 Catalog wave workflow

```text
Plan wave → approve sources → harvest → package → validate
  → dry-run → review queue → owner publish approval
  → apply → reconcile → freshness monitor
```

### 18.2 Knowledge workflow

```text
Register source → collect → extract → compliance scan
  → human review → publish package → site ingest → monitor citations/freshness
```

### 18.3 Incident workflow

```text
Detect (drift, poison parse, legal takedown, bad publish)
  → freeze affected wave/entity
  → rollback publish if needed
  → patch package
  → re-validate → re-approve → re-apply
  → postmortem note in audit log
```

---

## 19. Phase 2 Data Architecture — definition

**Phase 2 Data Architecture** is the first authorized build-and-operate cycle of this Master Plan. It is **not** website Phase 2 product themes (CDN, ads, CRM UX).

Phase 2 Data Architecture includes:

- Catalog truth alignment and pipeline hardening  
- Knowledge serving decision and review architecture  
- Windows01 preparation (gated)  
- AI interface design (implementation only behind M5)  

Phase 2 Data Architecture excludes:

- Public UI feature work  
- Production cutover  
- Marketplace billing  
- Unbounded multi-site expansion  

---

## 20. Document control

| Item | Value |
| --- | --- |
| Classification | Architecture / Master Plan |
| Implementation authority | None until Owner accepts + milestone gate |
| Supersedes (strategy) | Fragmented dual-track reading of Property Factory vs Content Factory as separate platforms |
| Does not delete | Existing V1/V2 standards; they remain cited inputs |
| Workspace | GoThailandHome Data Factory & AI Platform only |

---

## Appendix A — Current baseline snapshot (2026-07-20)

| Area | Baseline |
| --- | --- |
| Website Phase 1 | RC complete (engineering GO) |
| Supabase catalog | Foundation + geography + factory M1 + multisource + marketplace leads |
| Developers packages | ~23 |
| Project packages | ~51 |
| Bangkok district packages | 50 |
| Harvest sources | 6 major portals + official enrichment batches |
| Knowledge | Filesystem editorial packages |
| Admin | Minimal property CRUD |
| Windows01 | Docs only; deployment NO-GO |
| Embeddings / graph / recommenders | Not implemented |
| Content Factory readiness (prior report) | ~30% planning; Owner gates open |

## Appendix B — World-class bar (definition used in this plan)

A world-class real estate data platform is not the one with the most scrapers. It is the one that can prove, for every public fact:

1. Where it came from  
2. When it was true  
3. Who approved it  
4. How to reverse it  
5. What AI is allowed to do with it  

This Master Plan exists to make that bar operational for GoThailandHome.

---

**END OF MASTER PLAN — stop here. No implementation in this deliverable.**
