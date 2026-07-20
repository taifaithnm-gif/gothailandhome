# 07 — Listing Data Standard

**Document ID:** `07_LISTING_DATA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the canonical **Listing** entity: a market offer (sale/rent) with provenance, price, identity, verification, and multi-source observations. Serving table concept: `properties`.

## 2. Scope

Listing records in packages (`listings.json` / `listings-<source>.json` / batch files) and Serving Catalog listings. Multi-source identity and price history concepts included at logical level.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Listing** | Offer to sell or rent a property unit/space. |
| **Source observation** | One portal/developer sighting of a listing. |
| **External ref** | Source-stable id within a source system. |
| **Duplicate fingerprint** | Deterministic identity signal for dedup. |
| **Orphan listing** | Listing without confirmed project link. |
| **Verification status** | Trust band for public display rules. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| `listing_type` | `sale` \| `rent` |
| `source` | lowercase portal key (`propertyhub`, `ddproperty`, …) |
| Identity | `external_ref` or `source_listing_id` |
| Business key display | `source:external_ref` |
| Sidecar files | `listings-<source>.json` |

## 5. Required Fields

| Field | Type | Notes |
| --- | --- | --- |
| `source` | string | Approved source key |
| `listing_url` | string | Canonical source URL |
| `listing_type` | enum | `sale` \| `rent` |
| `property_type` | enum | Per `03` |
| `price_thb` | number | ≥ 0; THB only when present |
| `title` | I18nString | EN required for publish |
| `sources` provenance | via `source` + URL | Capture metadata required when harvested |
| `source_updated_at` or capture fallback | datetime | Explicit note if fallback |
| Identity | `external_ref` and/or URL hash | Per `14` |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `summary` / `description` | I18nString |
| `project_slug` / `project_id` | Strongly recommended |
| `city_id` / `district_id` / slugs | Geography |
| `bedrooms` / `bathrooms` / `area_sqm` | Per `03` |
| `images[]` | Media refs (`11`) |
| `verification_status` | `unverified` \| `verified` \| `platform_verified` \| `stale` \| `delisted` |
| `duplicate_fingerprint` | string |
| `soft_match_*` | Pending identity |
| `status` | Serving: `draft` \| `published` (site) — maps from review/publish rules |
| `features[]` | Sourced amenity tags |
| Price history points | Append-only logical events |

## 7. Validation Rules

1. `listing_url` required and absolute HTTPS/HTTP.  
2. `price_thb` required for publish-grade sale/rent offers; currency THB.  
3. No fabricated “from” ranges unless source states range and basis recorded.  
4. Identity: at least one of `external_ref`, `source_listing_id`, or normalized URL hash.  
5. Soft-match cannot auto-publish merges (`02`, `14`).  
6. `verification_status = delisted` forces non-public serving.  
7. Freshness: price/availability older than freshness band without re-verify → `stale` (`13`, `18`).  
8. Schema validate via listing record contract before import.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| LST-Q1 | Provenance always: source + URL + time |
| LST-Q2 | Prefer project-linked listings; flag orphans |
| LST-Q3 | Multi-source observations retained; one serving listing after confirmed identity |
| LST-Q4 | Price changes append history; do not erase prior prices |
| LST-Q5 | AI match suggestions stay `soft` until human confirm |
| LST-Q6 | DQ-02 from master plan: every price has THB + provenance |

## 9. Lifecycle

```text
candidate → validated → in_review → approved → publish_ready → published
                 ↘ rejected
published → stale → (re-verify) published | archived
published → delisted → archived
```

Import batches record apply/rollback (`16`, `17`).

## 10. Examples

```json
{
  "entity_type": "listing",
  "schema_version": "1.0.0",
  "package_version": 1,
  "source": "propertyhub",
  "external_ref": "ph-12345",
  "listing_url": "https://example.invalid/listing/12345",
  "listing_type": "sale",
  "property_type": "condo",
  "price_thb": 8500000,
  "source_updated_at": "2026-07-18T00:00:00Z",
  "project_slug": "ashton-asoke",
  "title": {
    "en": "1 Bed Condo at Ashton Asoke",
    "zh": "Ashton Asoke 一房公寓",
    "th": "คอนโด 1 ห้องนอน Ashton Asoke"
  },
  "verification_status": "unverified",
  "locale_status": "partial"
}
```

## 11. Future Compatibility

- Additional portals add source keys without changing identity model.  
- Marketplace owner-published listings use parallel write path later; same field dictionary.  
- AI search indexes only `published` ∩ non-`stale` unless explicitly allowed.  
- Recommendation hard-filters use `listing_type`, price, geo, verification.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Property attrs | `03_PROPERTY_DATA_STANDARD.md` |
| Project link | `04_PROJECT_DATA_STANDARD.md` |
| Identifiers / dedup | `14_IDENTIFIER_STANDARD.md` |
| Import | `16_IMPORT_EXPORT_STANDARD.md` |
| Quality / lifecycle | `13`, `18` |
| Existing schema | `pipelines/factory/schemas/listing.record.json` |
| Duplicate rules (legacy) | `PROPERTY_DUPLICATE_RULE_V1.md` |
