# 13 — Data Quality Standard

**Document ID:** `13_DATA_QUALITY_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define measurable data quality dimensions, completeness grades, freshness bands, drift detection, and scoring rules for Catalog and Knowledge entities.

## 2. Scope

Quality policy and metrics. Complements validation (`12`) but focuses on fitness-for-publish and ongoing ops health.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Completeness grade** | A / B / C for catalog hubs. |
| **Freshness band** | `fresh` \| `warning` \| `expired` / `stale`. |
| **Drift** | Disagreement between package-of-record and Serving Catalog. |
| **Quality score** | 0–100 composite for ops prioritization. |
| **Orphan rate** | Share of listings without project link. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| DQ rule ids | `DQ-nn` (aligned with master plan) |
| Flags | `snake_case` |
| Scores | integer 0–100 |

## 5. Required Fields

Quality assessment records:

| Field | Notes |
| --- | --- |
| `entity_type` / `business_key` | |
| `assessed_at` | UTC |
| `completeness_grade` | A\|B\|C when applicable |
| `freshness_status` | When time-sensitive |
| `quality_flags[]` | |
| `score` | 0–100 |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `dimension_scores` | completeness, provenance, locale, media, seo, identity |
| `drift_items[]` | Field-level diffs |
| `reviewer_notes` | |
| `sla_breach` | boolean |

## 7. Validation Rules

Quality assessment must not invent entity field values. Scoring inputs come from existing package/serving fields only.

### Platform DQ rules (binding)

| ID | Rule |
| --- | --- |
| DQ-01 | Null preferred over fabricated value |
| DQ-02 | Every price has currency THB and provenance |
| DQ-03 | Coordinates require source evidence |
| DQ-04 | Duplicate fingerprints unique among published |
| DQ-05 | Package schema validation is blocking |
| DQ-06 | Dry-run required before apply on production catalog |
| DQ-07 | Published EN title required |
| DQ-08 | Soft-match auto-link never auto-publish |
| DQ-09 | Media must have rights/source note for official assets |
| DQ-10 | Drift report: package count vs DB count per wave |

### Freshness bands (listings / price claims)

| Band | Rule of thumb |
| --- | --- |
| `fresh` | Verified/captured within 30 days |
| `warning` | 30–90 days |
| `stale` / `expired` | > 90 days without re-verify — not represented as current |

Aligns with property freshness standards; exact thresholds Owner-adjustable without renaming bands.

## 8. Quality Rules

### Completeness grades

| Grade | Developer | Project | District |
| --- | --- | --- | --- |
| A | Name trinity, SEO trinity, logo, official link, ≥1 project | Profile, SEO, cover, district, developer, ≥1 source | Name, summary, SEO EN+, sources, not thin |
| B | Missing one non-critical locale/media | Minor gaps | Minor locale gaps |
| C | Stub | Stub | Thin / incomplete |

Only A/B are public-grade; C stays draft.

### Scoring guidance

Start at 100; subtract for missing provenance, locale gaps, media gaps, SEO issues, orphans, drift, staleness. P0 validation failures force score floor unsuitable for publish.

## 9. Lifecycle

Quality reassessment triggers: package edit, import apply, overnight audit, freshness sweep. Chronic P0 drift freezes wave apply (`20`).

## 10. Examples

```json
{
  "entity_type": "listing",
  "business_key": "propertyhub:ph-12345",
  "assessed_at": "2026-07-20T00:00:00Z",
  "completeness_grade": null,
  "freshness_status": "fresh",
  "quality_flags": ["orphan_listing"],
  "score": 72,
  "dimension_scores": {
    "provenance": 100,
    "identity": 80,
    "locale": 60,
    "project_link": 0
  }
}
```

## 11. Future Compatibility

- Dimension weights may change without renaming DQ-01…10.  
- Knowledge quality adds compliance dimension.  
- AI search boosts may use score but cannot override publish gates.  
- Windows01 overnight jobs emit the same assessment shape.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Validation | `12_DATA_VALIDATION_STANDARD.md` |
| Lifecycle / stale | `18_DATA_LIFECYCLE_STANDARD.md` |
| Listing freshness | `07_LISTING_DATA_STANDARD.md` |
| Legacy | `PROPERTY_FRESHNESS_STANDARD_V1.md` |
| Master plan §10.4 | `DATA_FACTORY_MASTER_PLAN.md` |
