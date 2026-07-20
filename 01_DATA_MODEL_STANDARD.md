# 01 — Data Model Standard

**Document ID:** `01_DATA_MODEL_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Authority:** `DATA_FACTORY_MASTER_PLAN.md`  
**Date:** 2026-07-20

---

## 1. Purpose

Define the canonical data model for the GoThailandHome Data Factory: domains, entity types, stores, shared field patterns, and binding principles that all other M0 standards extend.

## 2. Scope

**In scope:** Catalog Domain, Knowledge Domain, SEO Domain, Ops Domain, and Intelligence Domain data shapes at the logical level.

**Out of scope:** SQL DDL, Supabase migrations, APIs, CMS UI, pipeline code, frontend.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Catalog Domain** | Developers, projects, listings, cities, districts, and related media/features. |
| **Knowledge Domain** | Articles, FAQ, blog, investment/legal guides, facts, and evidence-backed claims. |
| **Package** | Versioned JSON artifact exchanged between humans and machines; package-of-record for review. |
| **Serving Catalog** | Supabase Postgres projection used by the public website. |
| **Factory Work Store** | Windows01 (future) store for raw items, queues, review tasks, evidence blobs, embeddings. |
| **Entity** | A typed business object with a stable business key. |
| **Locale Trinity** | Required public languages: `en`, `zh`, `th`. |
| **I18nString** | Object `{ en, zh?, th? }` for localized text. |
| **Null-over-fabricate** | Missing facts remain `null` (with status); values must not be invented. |
| **Publish** | Promotion of an approved package version into a serving surface. |
| **AI assist** | Machine extraction, match, draft, score, or rank — never final publish approval. |

### Canonical entity types

| `entity_type` | Domain | Business key (see `14_IDENTIFIER_STANDARD`) |
| --- | --- | --- |
| `developer` | Catalog | `slug` |
| `project` | Catalog | `slug` |
| `listing` | Catalog | `source` + `external_ref` (or URL hash) |
| `city` | Catalog | `slug` |
| `district` | Catalog | `city_slug` + `slug` |
| `knowledge_item` | Knowledge | `content_type` + `slug` |
| `media_asset` | Cross-cutting | `asset_id` / storage path |
| `source` | Ops | `source_id` |
| `evidence` | Ops | `evidence_id` |
| `fact` | Knowledge | `fact_id` |
| `graph_node` / `graph_edge` | Intelligence | node/edge ids (logical) |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Entity type names | `snake_case` singular (`listing`, not `Listings`) |
| Field names | `snake_case` |
| Slugs | lowercase kebab-case ASCII (`ashton-asoke`) |
| Enums | `snake_case` |
| Locale codes | ISO 639-1: `en`, `zh`, `th` |
| Country | ISO 3166-1 alpha-2: `TH` |
| Currency | ISO 4217: `THB` |
| Timestamps | ISO 8601 UTC (`2026-07-20T12:00:00Z`) |
| Document IDs | `NN_NAME_STANDARD` |

I18n fields use either:

- nested: `name: { en, zh, th }`, or  
- flat: `name_en`, `name_zh`, `name_th` in serving tables  

Packages prefer nested I18nString; serving DB may flatten. Mapping is lossless.

## 5. Required Fields

Every entity package and serving projection must support:

| Field | Type | Notes |
| --- | --- | --- |
| `entity_type` | enum | From canonical list |
| `business_key` | string / composite | Per identifier standard |
| `schema_version` | string | Package schema semver |
| `package_version` / `row_version` | integer ≥ 1 | Monotonic |
| `content_hash` | string | Hash of canonical payload |
| `locale_status` | enum | `complete` \| `partial` \| `blocked` |
| `review_status` | enum | See lifecycle |
| `sources[]` | array | At least one for non-system entities |
| `updated_at` | datetime | UTC |

## 6. Optional Fields

| Field | Type | Notes |
| --- | --- | --- |
| `evidence_ids[]` | array | Required before publish for machine-collected facts |
| `verification_status` | enum | Catalog listings/projects |
| `quality_flags[]` | array | Machine + human flags |
| `model_assist` | object | `{ model, prompt_id, ts }` if AI touched |
| `graph_refs[]` | array | Knowledge-graph node ids |
| `seo` | object | Per `09_SEO_DATA_STANDARD` |
| `media` | object/array | Per `11_MEDIA_STANDARD` |

## 7. Validation Rules

1. Unknown `entity_type` → reject package.  
2. Missing `business_key` → reject.  
3. `locale_status = complete` requires EN/ZH/TH for required text groups.  
4. `review_status` transitions must follow `18_DATA_LIFECYCLE_STANDARD`.  
5. Coordinates, prices, and legal/investment claims require evidence when present.  
6. `content_hash` must match canonical serialization rules in `15_VERSIONING_STANDARD`.  
7. Packages must declare `schema_version`.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| DM-Q1 | Null preferred over fabricated value |
| DM-Q2 | Original source text preserved beside normalized values when both exist |
| DM-Q3 | Serving Catalog is a projection; packages remain reviewable truth for ops |
| DM-Q4 | No silent cross-domain DB writes — handoff via versioned package |
| DM-Q5 | AI outputs are drafts until human acceptance |

## 9. Lifecycle

Shared review spine (all entities):

`candidate → validated → in_review → approved → publish_ready → published → stale | archived | rejected`

Publication batch spine:

`draft_batch → hashed → owner_approved → applied → rolled_back?`

Detail: `18_DATA_LIFECYCLE_STANDARD`.

## 10. Examples

```json
{
  "entity_type": "project",
  "schema_version": "1.0.0",
  "package_version": 3,
  "business_key": "ashton-asoke",
  "locale_status": "complete",
  "review_status": "approved",
  "content_hash": "sha256:…",
  "sources": [{ "type": "official_developer", "url": "https://example.invalid/p" }],
  "updated_at": "2026-07-20T00:00:00Z"
}
```

## 11. Future Compatibility

- Additive fields only in minor versions; breaking renames require major `schema_version`.  
- Second site reuse: Knowledge Domain packages must not hard-code GoThailandHome routes.  
- Windows01 Work Store may add `raw_item_id` without changing serving keys.  
- Intelligence plane attaches embeddings/graph edges by business key + version — never mutates facts in place.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Master plan | `DATA_FACTORY_MASTER_PLAN.md` |
| Relationships | `02_ENTITY_RELATIONSHIP_STANDARD.md` |
| Entity standards | `03`–`08` |
| SEO / metadata / media | `09`, `10`, `11` |
| Validation / quality | `12`, `13` |
| Identifiers / versioning | `14`, `15` |
| Import-export / audit / lifecycle / governance / execution | `16`–`20` |
| Legacy pilot inputs | `PROPERTY_*_V1.md`, `CONTENT_FACTORY_ARCHITECTURE_V2.md` |
