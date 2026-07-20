# Pilot Dataset Standard V1

**Status:** Sprint 4 planning only; no dataset creation, collection, or live source access  
**Authority:** Owner Decision Freeze D-001–D-015, D-024–D-025; Sprint 1–3 standards

## Purpose

Define the bounded pilot dataset that will be used later to prove GoThailandHome Content Factory V1 governance, quality, and reversibility. This standard does not nominate live sources or projects.

## Pilot scope

| Dimension | Frozen V1 value |
| --- | --- |
| Site / publish target | GoThailandHome only |
| Geography | Bangkok first |
| Property category | New condominium projects only |
| Exclusions | Second-hand individual listings, rental, land, villas, commercial, user-submitted listings |
| Operating sample size | Initial target **5** projects |
| Hard project ceiling | Maximum **10** projects |
| Hard record ceiling | Maximum **100** normalized records |
| Source diversity | Maximum **2** approved sources; one preferred if sufficient |
| Manual review ratio | **100%** of records and publishable fields |
| Evidence completeness | **100%** of publishable fields must resolve to retained evidence |
| Record level | Project-level first; unit children only if later Owner-approved |

## Sample-size rules

1. The first executable pilot must include at least **5** and at most **10** distinct new condominium projects.
2. Total normalized records must remain ≤ **100**.
3. Initial recommended composition: **5 project-level records only**.
4. Additional projects or unit-level child records require a new Owner-approved manifest revision and may not exceed the ceilings.
5. Seeded duplicate and negative fixtures may exist for testing but do not count toward published project quotas unless Owner-approved as canonical pilot records.

## Property categories

Allowed:

- `new_condominium_project` in Bangkok

Prohibited in V1:

- Second-hand / resale individual listings
- Rental listings
- Land
- Villas / houses
- Commercial property
- Hotels / hospitality
- User-submitted or agent-scraped listings
- Aggregator catalogs

## Geographic scope

- Country: `TH`
- Province / metro: `Bangkok`
- District / subdistrict / address: source-backed when present; never inferred
- One coherent Bangkok geography only; expansion outside Bangkok requires a new Owner decision

## Source diversity

- Maximum **2** sources
- Preferred: one Q1 official developer/owner-authorized source
- Optional second source: Q2 official/government corroboration only when needed
- Every source must pass `PROPERTY_SOURCE_STANDARD_V1.md` and the source approval template
- No live source is selected by this document
- Source diversity is measured by approved source IDs, not by page count

## Manual review ratio

- Intake, fact, freshness, duplicate, and publish-stage review: **100%**
- High-risk fields (price, currency, availability, completion/status): **100%** explicit human approval when present
- AI may recommend; AI may never approve or reduce the review ratio
- Reviewer identities are assigned later; no names are invented here

## Evidence completeness

Every pilot record must retain or reference:

- Approved source ID and name
- Source URL / access point
- Capture timestamp
- Immutable screenshot / payload / permitted reference
- SHA-256 integrity hash
- Field-level citeable locations for all publishable fields
- Adapter / parser version when applicable
- Record version
- Review status, reviewer reference, approval timestamp
- Publication batch and rollback reference before any release

Evidence completeness is **100%** for package eligibility. Missing evidence is a blocking failure, not a soft warning.

## Dataset package (logical)

A future pilot dataset package must declare:

1. Manifest version and Owner approval reference
2. Approved source list (≤2)
3. Approved project list (5–10)
4. Expected normalized record count (≤100)
5. Field dictionary / standard versions used
6. Evidence inventory
7. Seeded duplicate / negative fixture inventory (if any)
8. Hard stop conditions

## Prohibitions

- No live collection under this standard
- No invented project or source names
- No fabrication of missing fields
- No embeddings / OCR as default dataset methods
- No production database writes
- No package inclusion of incomplete, expired, or unresolved-duplicate records

## Exit condition for this standard

This standard is ready for later G5 manifest population when:

- Owner accepts Sprint 4 planning
- Exact sources/projects are nominated and approved separately
- Evidence retention and review staffing are confirmed
- No ceiling or exclusion is violated
