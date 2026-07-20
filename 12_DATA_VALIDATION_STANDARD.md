# 12 — Data Validation Standard

**Document ID:** `12_DATA_VALIDATION_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define validation layers, severity, blocking rules, and the contract between schema validation and business validation for all packages.

## 2. Scope

Logical validation only (AJV/schema conceptually). No code. Applies to Catalog and Knowledge packages before dry-run/import/publish.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Schema validation** | Structural/type/enum checks against package schema. |
| **Business validation** | Cross-field, referential, and policy checks. |
| **P0 failure** | Blocks `approved` / `publish_ready` / apply. |
| **P1 failure** | Blocks publish; may allow staging. |
| **P2 warning** | Non-blocking quality signal. |
| **Dry-run** | Diff against Serving Catalog without write. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Rule ids | `VAL-<AREA>-<nnn>` |
| Severity | `P0` \| `P1` \| `P2` |
| Result object | `{ valid, severity_max, errors[], warnings[] }` |

## 5. Required Fields

Validation result artifacts must include:

| Field | Notes |
| --- | --- |
| `package_business_key` | |
| `schema_version` | |
| `validated_at` | UTC |
| `validator_version` | Rule pack version |
| `errors[]` | `{ code, severity, path, message }` |
| `valid` | boolean (no P0/P1 as configured) |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `warnings[]` | P2 |
| `referential_checks[]` | Slug existence |
| `policy_checks[]` | Compliance scanners |
| `model_assist` | If AI pre-checked |

## 7. Validation Rules

### Layers (ordered)

1. **JSON parse** — fail closed.  
2. **Schema (AJV)** — required fields, types, enums.  
3. **Identifier** — business key shape (`14`).  
4. **Referential** — developer/district/project slugs.  
5. **Provenance** — sources/URLs/hashes when required.  
6. **Locale** — trinity gates.  
7. **Policy** — forbidden claims, disclaimers (`08`, `19`).  
8. **SEO linter** — (`09`).  
9. **Dry-run diff** — before apply (`16`).

### Cross-entity P0 examples

| Code | Rule |
| --- | --- |
| `VAL-ID-001` | Missing business key |
| `VAL-REF-001` | Project references unknown developer |
| `VAL-PROV-001` | Listing missing `listing_url`/`source` |
| `VAL-PRICE-001` | Published listing missing `price_thb` |
| `VAL-GEO-001` | Fabricated coordinates suspected (no evidence) |
| `VAL-LIFE-001` | Illegal lifecycle transition |
| `VAL-COMP-001` | Legal/investment missing disclaimer |

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| VAL-Q1 | Schema pass ≠ publishable |
| VAL-Q2 | Validator version pinned on results |
| VAL-Q3 | Re-validation required after material edit |
| VAL-Q4 | Soft-match suggestions never count as referential pass |
| VAL-Q5 | Windows01 and Mac mini must use same rule pack ids |

## 9. Lifecycle

Validation runs at: package write, pre-review, pre-dry-run, pre-apply, pre-publish. Failures reset `review_status` away from `publish_ready` when P0/P1 introduced.

## 10. Examples

```json
{
  "package_business_key": "ashton-asoke",
  "schema_version": "1.0.0",
  "validator_version": "m0-val-1.0.0",
  "validated_at": "2026-07-20T00:00:00Z",
  "valid": false,
  "severity_max": "P1",
  "errors": [
    {
      "code": "VAL-REF-001",
      "severity": "P1",
      "path": "/developer/slug",
      "message": "developer slug not found in catalog or batch"
    }
  ],
  "warnings": [
    {
      "code": "VAL-MED-101",
      "severity": "P2",
      "path": "/media",
      "message": "cover image missing"
    }
  ]
}
```

## 11. Future Compatibility

- Rule packs version independently of entity `schema_version`.  
- New entity types register rules without renaming old codes.  
- CI later may enforce validator on packages; not authorized in M0.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Quality scoring | `13_DATA_QUALITY_STANDARD.md` |
| Import gates | `16_IMPORT_EXPORT_STANDARD.md` |
| Entity field rules | `03`–`09` |
| Execution | `20_DATA_FACTORY_EXECUTION_STANDARD.md` |
