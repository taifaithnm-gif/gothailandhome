# Property Data Standard V1

**Status:** Sprint 1 frozen planning standard; no implementation authorization  
**Scope:** Bangkok new condominium project pilot only  
**Limits:** Initial target 5 projects; maximum 10 projects, 100 normalized records, and 2 approved sources

## Purpose

Define one canonical, evidence-backed project record for the GoThailandHome V1 pilot. Records describe new condominium projects, not individual resale/rental listings. Missing values remain `null`; no value may be inferred or fabricated.

## Canonical record sections

| Section | Frozen content | Requirement |
| --- | --- | --- |
| Project | Stable record ID, source-backed original project name, normalized project name | Required |
| Developer | Original and normalized developer name | Required |
| Location | Country `TH`, Bangkok geography, and source-backed locality/address fields | Required |
| Property Type | Controlled value `new_condominium_project` | Required |
| Price | Source value/range/basis and “as of” time | Required category; value may be `null` only with explicit `not_provided` status |
| Currency | ISO 4217 code; `THB` only when explicitly supported by evidence | Required when price is present |
| Area | Source value/range and unit | Required category; nullable when source does not provide it |
| Bedroom | Source value/range or supported option list | Required category; nullable when source does not provide it |
| Bathroom | Source value/range or supported option list | Required category; nullable when source does not provide it |
| Parking | Source value/rule and basis | Required category; nullable when source does not provide it |
| Completion Status | Controlled construction/completion status plus source date | Required |
| Source | Approved source ID, source name, URL/access point, optional external ID | Required |
| Evidence | Immutable evidence reference(s), exact field location/quote/value, integrity hash, rights snapshot | Required |
| Capture Time | UTC source capture time and last verified time | Required |
| Review Status | Manual-review state, reviewer reference, decision and approval time | Required |
| Version | Record version, adapter version, normalization-rule version and prior version reference | Required |

Exact field names, types, null handling, and validation are frozen in `PROPERTY_FIELD_DICTIONARY_V1.md`.

## Record rules

1. One canonical record represents one new condominium project for the pilot. Unit information is represented as project-level ranges/options unless a later Owner decision authorizes child records.
2. Preserve original values beside normalized values for project name, developer, location text, price, area, bedroom, bathroom, parking, and completion status.
3. Every non-system value must resolve to approved source evidence.
4. Price/current availability claims older than 30 days without re-verification must not be represented as current.
5. Price cannot exist without explicit currency, basis, evidence, source “as of”/capture context, and manual approval.
6. Unknown is different from zero, false, unavailable, sold out, or not applicable.
7. A record with any P0 validation failure cannot become `approved` or `publish_ready`.
8. All V1 records receive 100% manual review. AI may flag or recommend but cannot approve.
9. Corrections create a new record version; they do not overwrite prior evidence or decisions.
10. Uncertain duplicate candidates remain separate and blocked until a human decides.

## Controlled statuses

### Completion status

- `pre_launch`
- `under_construction`
- `completed`
- `completion_status_unknown`

Marketing terms are retained as original source text but do not create additional canonical states without Owner approval.

### Review status

- `candidate`
- `intake_review`
- `fact_review`
- `duplicate_review`
- `publish_review`
- `approved`
- `publish_ready`
- `change_requested`
- `rejected`
- `quarantined`

### Freshness status

- `fresh`: 0–30 elapsed calendar days since `last_verified_at`
- `warning`: 31–90 days
- `expired`: more than 90 days

## Validation and approval boundary

- Validation is deterministic against the frozen dictionary.
- Source approval is separate from record approval.
- Record approval is tied to the exact record version and evidence references.
- Publication approval is separate and tied to an exact publication batch/package.
- GoThailandHome is the only publication target; no publication is authorized by this document.
- This standard defines no database table, migration, collector, parser, adapter implementation, or Windows 01 deployment.

