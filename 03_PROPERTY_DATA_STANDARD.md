# 03 — Property Data Standard

**Document ID:** `03_PROPERTY_DATA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the **Property** concept as the shared real-estate typology and attribute vocabulary used by projects and listings. This standard does **not** replace project or listing packages; it constrains shared enums and physical attributes.

## 2. Scope

**In scope:** `property_type`, shared physical attributes, completion vocabulary, and rules for representing unknown vs zero.

**Out of scope:** Sale/rent offer fields (see `07_LISTING_DATA_STANDARD`), project hub SEO/media (see `04`), pilot-only project record shape in legacy `PROPERTY_DATA_STANDARD_V1.md` (superseded for Data Factory M0; retained as historical pilot input).

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Property (conceptual)** | A real-estate object class and its physical/product attributes. |
| **Listing** | A market offer for a property unit/space (`07`). |
| **Project** | A named development hub that groups units/listings (`04`). |
| **Property type** | Controlled enum classifying the object. |
| **Status field pattern** | `*_status`: `provided` \| `not_provided` \| `conflicted`. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Enum `property_type` | `snake_case` |
| Physical measures | SI where normalized (`area_*_sqm`) |
| Original vs normalized | `*_original` beside normalized fields |
| Completion | `completion_status` enum |

## 5. Required Fields

When a record asserts property/product facts (project or listing), these categories apply:

| Field / category | Type | Notes |
| --- | --- | --- |
| `property_type` | enum | Required |
| `country_code` | string | `TH` for current scope |
| Area category | status + optional values | `area_status` required if area discussed |
| Bedroom category | status + optional values | When applicable to type |
| Bathroom category | status + optional values | When applicable |
| `completion_status` | enum | Required on projects; optional on listings if sourced |

### Controlled `property_type` (M0)

| Value | Use |
| --- | --- |
| `condo` | Condominium unit or condo project context |
| `house` | House |
| `townhouse` | Townhouse |
| `land` | Land plot |
| `commercial` | Commercial space |
| `other` | Only with sourced label in `property_type_original` |

Legacy pilot value `new_condominium_project` maps to project records with `property_type = condo` plus project completion fields — do not invent a second parallel enum in packages.

### Controlled `completion_status`

- `pre_launch`
- `under_construction`
- `completed`
- `completion_status_unknown`

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `area_min_sqm` / `area_max_sqm` | > 0 when present |
| `bedroom_options[]` | Non-negative; studio may be `0` only if sourced |
| `bathroom_options[]` | > 0 when present |
| `parking_value` / `parking_basis` | No inferred allocation |
| `floor` / `building_floors` | Sourced only |
| `furnishing` | Sourced enum later; free text original allowed |
| `property_type_original` | Exact source wording |

## 7. Validation Rules

1. `conflicted` status blocks `approved` / `publish_ready`.  
2. Normalized area requires explicit unit conversion rule version when converted.  
3. Zero is never a stand-in for unknown.  
4. `property_type = other` requires `property_type_original`.  
5. Price is **not** defined here — listings own price (`07`).  
6. Coordinates belong to project/listing location blocks and require evidence (`06` / `04` / `07`).

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| PROP-Q1 | Preserve `*_original` whenever normalized values exist |
| PROP-Q2 | Marketing adjectives are not completion states |
| PROP-Q3 | Physical attributes on listings should not contradict linked project ranges without a conflict flag |
| PROP-Q4 | AI-inferred bedrooms/bathrooms remain drafts |

## 9. Lifecycle

Property attributes follow the parent entity lifecycle (`18`). Material attribute changes increment parent `package_version` and may require re-verification of freshness for price-adjacent claims on listings.

## 10. Examples

```json
{
  "property_type": "condo",
  "property_type_original": "Condominium",
  "area_status": "provided",
  "area_original": "35 sqm",
  "area_min_sqm": 35.0,
  "area_max_sqm": 35.0,
  "bedroom_status": "provided",
  "bedroom_options": [1],
  "bathroom_status": "provided",
  "bathroom_options": [1],
  "completion_status": "completed"
}
```

Unknown parking:

```json
{
  "parking_status": "not_provided",
  "parking_original": null,
  "parking_value": null
}
```

## 11. Future Compatibility

- New `property_type` values require Owner approval and major/minor dictionary bump.  
- Unit-level child records may be added later without changing project hubs.  
- Compatible with AI search facet filters on `property_type`, area, bedrooms.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Project | `04_PROJECT_DATA_STANDARD.md` |
| Listing | `07_LISTING_DATA_STANDARD.md` |
| Validation / quality | `12`, `13` |
| Legacy pilot | `PROPERTY_DATA_STANDARD_V1.md`, `PROPERTY_FIELD_DICTIONARY_V1.md` |
| Model | `01_DATA_MODEL_STANDARD.md` |
