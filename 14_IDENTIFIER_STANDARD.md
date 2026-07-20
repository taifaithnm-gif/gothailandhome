# 14 — Identifier Standard

**Document ID:** `14_IDENTIFIER_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define stable business keys, technical ids, source identities, fingerprints, and duplicate-resolution rules so Catalog and Knowledge entities remain idempotent across harvest, import, and graph joins.

## 2. Scope

Identifiers only. Dedup policy at logical level (compatible with `PROPERTY_DUPLICATE_RULE_V1.md`).

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Business key** | Human-stable natural key used in packages. |
| **Technical id** | UUID in Serving Catalog. |
| **Source identity** | Id unique within one `source`. |
| **URL hash** | Normalized hash of `listing_url`. |
| **Fingerprint** | Deterministic composite for soft/exact match. |
| **Idempotency key** | Key that prevents duplicate inserts on re-apply. |

## 4. Naming Convention

| Entity | Business key | Display form |
| --- | --- | --- |
| developer | `slug` | `sansiri` |
| project | `slug` | `ashton-asoke` |
| district | `city_slug` + `slug` | `bangkok/watthana` |
| city | `slug` | `bangkok` |
| listing | `source` + `external_ref` | `propertyhub:ph-12345` |
| knowledge_item | `content_type` + `slug` | `faq:faq-what-is-gth` |
| media_asset | `asset_id` | `asset_…` |
| source | `source_id` | `source_propertyhub` |
| evidence | `evidence_id` | `evidence_…` |

Slugs: lowercase kebab-case ASCII `[a-z0-9]+(?:-[a-z0-9]+)*`.

## 5. Required Fields

| Context | Required ids |
| --- | --- |
| Package | Business key fields for `entity_type` |
| Listing harvest | `source` + (`external_ref` \| `source_listing_id` \| URL hash) |
| Evidence | `evidence_id` + content hash |
| Import item | Idempotency key = business key + `content_hash` |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| Technical UUID | Serving only |
| `duplicate_fingerprint` | Listings |
| `soft_match_candidate_ids[]` | |
| `same_as[]` | Confirmed identity links |
| `prior_slugs[]` | After rename with redirects |

## 7. Validation Rules

1. Business keys immutable after first `published` except Owner-approved rename + redirect.  
2. Listing idempotency: upsert on (`source`,`external_ref`) when present; else URL hash.  
3. Exact match > soft match; soft match never auto-merges publish-grade records.  
4. Fingerprint collisions among published listings are P0 (`DQ-04`).  
5. Knowledge slug unique per `content_type`, not globally across types.  
6. Technical UUIDs never reused.  
7. Cross-source `SAME_AS` requires human confirm for merge.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| ID-Q1 | Prefer source-native ids over scraped titles for identity |
| ID-Q2 | Normalization rules versioned (`normalization_rule_version`) |
| ID-Q3 | Do not use price or bedroom alone as identity |
| ID-Q4 | Graph nodes key off business keys, not transient row numbers |
| ID-Q5 | Windows01 raw ids are not serving business keys |

## 9. Lifecycle

Identity created at candidate stage. Soft links resolve during review. Confirmed identity persists across republish. On delist, ids remain reserved to avoid resurrection collisions unless Owner recycles with new key.

## 10. Examples

```json
{
  "entity_type": "listing",
  "source": "livinginsider",
  "external_ref": "li-77881",
  "listing_url": "https://example.invalid/77881",
  "url_hash": "sha256:…",
  "duplicate_fingerprint": "fp:ashton-asoke|sale|35sqm|1br|…",
  "idempotency_key": "livinginsider:li-77881"
}
```

Rename with redirect:

```json
{
  "slug": "new-slug",
  "prior_slugs": ["old-slug"],
  "redirects": [{ "from_slug": "old-slug", "to_slug": "new-slug", "type": "301" }]
}
```

## 11. Future Compatibility

- New portals add `source` keys only.  
- Marketplace-generated listings mint `source = gth_marketplace` with internal refs.  
- Multi-site knowledge may prefix `site_id` without changing GTH slugs.

## 12. Cross References

| Topic | Document |
| --- | --- |
| ER / SAME_AS | `02_ENTITY_RELATIONSHIP_STANDARD.md` |
| Listings | `07_LISTING_DATA_STANDARD.md` |
| Versioning | `15_VERSIONING_STANDARD.md` |
| Legacy dedup | `PROPERTY_DUPLICATE_RULE_V1.md` |
| Import | `16_IMPORT_EXPORT_STANDARD.md` |
