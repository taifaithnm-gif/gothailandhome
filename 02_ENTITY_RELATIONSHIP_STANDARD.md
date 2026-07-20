# 02 — Entity Relationship Standard

**Document ID:** `02_ENTITY_RELATIONSHIP_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define canonical relationships among Data Factory entities for Catalog, Knowledge, and Intelligence planes, including cardinality, ownership, and graph-edge vocabulary.

## 2. Scope

Logical ER only. No SQL foreign-key migrations in M0. Compatible with existing Supabase catalog shape and future Windows01 work store.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Owning side** | Entity that stores the FK or package pointer. |
| **Link** | Resolved relationship between two business keys. |
| **Soft link** | Suggested match pending human confirm. |
| **Graph edge** | Typed directed relation for Knowledge Graph (`edge_type`). |
| **Observation** | Per-source listing sighting (`property_listing_sources` concept). |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Relationship name | `SCREAMING_SNAKE` for graph edges (`DEVELOPS`) |
| Package pointers | `*_slug` or `*_id` |
| Soft-match fields | `soft_match_*` prefix |
| Edge records | `from_node`, `to_node`, `edge_type`, `evidence_ids[]` |

## 5. Required Fields

Every persisted relationship (package or future table) must include:

| Field | Notes |
| --- | --- |
| `from_entity_type` / `to_entity_type` | Canonical types |
| `from_business_key` / `to_business_key` | Stable keys |
| `edge_type` or relation role | Controlled vocabulary |
| `link_status` | `confirmed` \| `soft` \| `rejected` |
| `updated_at` | UTC |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `confidence` | 0–1 for soft matches / AI suggestions |
| `evidence_ids[]` | Supporting evidence |
| `distance_m` | For `NEAR` edges when sourced |
| `valid_from` / `valid_to` | Temporal edges |
| `model_assist` | If AI proposed the link |

## 7. Validation Rules

### 7.1 Catalog cardinality

```text
city 1 ──* district
district 1 ──* project (preferred)
developer 1 ──* project
project 1 ──* listing
listing * ──* source_observation (via listing sources)
listing 1 ──* media_asset
project 1 ──* media_asset
developer 1 ──* media_asset (logo)
```

Rules:

1. A `project` **must** reference a `developer` slug/id before `publish_ready`.  
2. A `project` **should** reference `city` + `district` before public SEO push.  
3. A `listing` **should** link to `project`; orphans flagged (`quality_flags: orphan_listing`).  
4. Soft links never auto-set `link_status = confirmed` for publish-grade merges.  
5. Cycles forbidden: project cannot develop a developer; district cannot contain a city.

### 7.2 Knowledge relationships

```text
source 1 ──* evidence
evidence * ──* fact
fact * ──* knowledge_item
knowledge_item * ──* entity (catalog refs by business key)
knowledge_item 1 ──* media_asset
content_item SUPERSEDES content_item (0..1 prior)
```

### 7.3 Controlled edge types (Knowledge Graph v0)

| `edge_type` | From → To | Meaning |
| --- | --- | --- |
| `DEVELOPS` | developer → project | Builder relationship |
| `LOCATED_IN` | project\|listing → district\|city | Geography |
| `HAS_LISTING` | project → listing | Inventory |
| `NEAR` | project\|district → transit\|amenity | Sourced proximity |
| `CITES` | knowledge_item → source\|evidence | Attribution |
| `ABOUT` | knowledge_item → catalog entity | Topic binding |
| `SAME_AS` | entity → entity | Identity link |
| `SUPERSEDES` | knowledge_item → knowledge_item | Version succession |
| `SERVES_TRANSIT` | project\|district → transit_node | Transit service |

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| ER-Q1 | Confirmed links require human or deterministic exact-match rule |
| ER-Q2 | Soft links visible in review queues only |
| ER-Q3 | Broken FK/slug references block `publish_ready` |
| ER-Q4 | Graph edges for AI search must point at `published` or `approved` nodes only |
| ER-Q5 | `SAME_AS` never merges published listings without Owner exception |

## 9. Lifecycle

1. Link proposed (`soft`) during harvest/match.  
2. Reviewer confirms or rejects.  
3. Confirmed links travel in package.  
4. Import applies FK/slug to Serving Catalog.  
5. On archive/unpublish, dependent public edges become non-indexable but retained for audit.

## 10. Examples

```json
{
  "from_entity_type": "developer",
  "from_business_key": "ananda-development",
  "to_entity_type": "project",
  "to_business_key": "ashton-asoke",
  "edge_type": "DEVELOPS",
  "link_status": "confirmed",
  "updated_at": "2026-07-20T00:00:00Z"
}
```

Soft listing match:

```json
{
  "from_entity_type": "listing",
  "from_business_key": "propertyhub:12345",
  "to_entity_type": "listing",
  "to_business_key": "livinginsider:99881",
  "edge_type": "SAME_AS",
  "link_status": "soft",
  "confidence": 0.82,
  "model_assist": { "model": "match-v1", "ts": "2026-07-20T00:00:00Z" }
}
```

## 11. Future Compatibility

- Additive edge types allowed; deprecate via `valid_to`, do not reuse names.  
- Multi-city: `LOCATED_IN` remains; no schema redesign.  
- Windows01 may store edges in work DB; Serving Catalog keeps relational FKs.  
- Recommendation engine consumes confirmed edges only.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Data model | `01_DATA_MODEL_STANDARD.md` |
| Entities | `03`–`08` |
| Identifiers | `14_IDENTIFIER_STANDARD.md` |
| Lifecycle | `18_DATA_LIFECYCLE_STANDARD.md` |
| Master plan § knowledge graph | `DATA_FACTORY_MASTER_PLAN.md` |
