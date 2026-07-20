# Pilot Dataset Preparation Plan

**Phase:** Implementation Preparation — Readiness Assessment  
**Date:** 2026-07-18  
**Status:** Preparation plan only — **no dataset created, collected, or connected**  
**Authority:** `PILOT_DATASET_STANDARD_V1.md`; G5; Sprint 1–4 standards

## Purpose

Define how the V1 pilot dataset will be prepared once sources and roles exist. This plan does not nominate projects or perform collection.

## Required sample size

| Dimension | Required value |
| --- | --- |
| Operating target | **5** distinct new condominium projects |
| Hard project ceiling | **10** |
| Hard record ceiling | **100** normalized records |
| Recommended first composition | **5 project-level records only** (no unit children) |
| Seeded fixtures | Duplicate/negative fixtures allowed for offline tests; not counted as published projects unless Owner-approved |
| Sources | **1–2** G1-approved sources bound in G5 manifest |

**Minimum for executable pilot:** ≥5 projects and ≤10 projects, total records ≤100.

## Geographic coverage

| Field | Requirement |
| --- | --- |
| Country | `TH` |
| Metro / province | Bangkok only |
| District / subdistrict / address | Source-backed only; never inferred |
| Expansion outside Bangkok | New Owner decision required |

Coverage goal: one coherent Bangkok set. Diversity within Bangkok (multiple districts) is optional and must remain evidence-backed.

## Category coverage

| Allowed | Prohibited |
| --- | --- |
| `new_condominium_project` | Second-hand / resale listings |
| | Rental |
| | Land |
| | Villas / houses |
| | Commercial |
| | Hotels / hospitality |
| | User-submitted / agent-scraped listings |
| | Aggregator catalogs |

Category coverage target for V1: **100% new condominium projects**. Mixed types are a hard fail.

## Evidence completeness

Every package-bound record must achieve **100%** evidence completeness for publishable fields:

- Approved source ID and name  
- Source URL / access point  
- Capture timestamp  
- Immutable screenshot / payload / permitted reference  
- SHA-256 integrity hash  
- Field-level citeable locations for all publishable fields  
- Adapter/parser version when applicable  
- Record version  
- Review status, reviewer reference, approval timestamp  
- Publication batch and rollback reference before any release  

Missing evidence is a **blocking failure**, not a soft warning.

### Preparation sequence for evidence (future)

```text
1. Bind G1 sources + G5 projects
2. Capture original evidence before parse
3. Hash and rights-snapshot at intake
4. Link every publishable field to citeable location
5. Quarantine any incomplete evidence chain
6. Include only Q-PASS / fully cited records in package candidates
```

## Manual review workload

### Coverage rule

**100%** of records and publishable fields require human review across:

1. Intake review  
2. Fact review (including freshness)  
3. Duplicate review  
4. Publish review / package approval  

AI may recommend only. High-risk fields (price, currency, availability, completion/status) require explicit human approval when present.

### Workload estimate (planning envelope)

Assumes first run of **5 project-level records** and complete evidence packs.

| Stage | Est. effort per record | 5-record total (order of magnitude) |
| --- | --- | --- |
| Intake | 20–40 min | 2–3.5 h |
| Fact + freshness | 30–60 min | 2.5–5 h |
| Duplicate | 15–30 min | 1.5–2.5 h |
| Publish / package checks | 20–40 min (amortized) | 2–4 h package-level |
| Corrections / re-review buffer | +25–40% | +2–4 h |

**Planning envelope for 5 projects:** roughly **10–20 human hours**, excluding source approval, Windows setup, and rollback rehearsal.  
**Upper bound at 10 projects / heavier evidence:** plan **20–40 human hours** and confirm staffing before G5.

These estimates are capacity planning aids only. They do not waive quality gates or authorize rushed review.

### Staffing prerequisites

| Role | Required before live review |
| --- | --- |
| Intake Reviewer | Named |
| Fact Reviewer | Named |
| Duplicate Reviewer | Named |
| Publish Approver | Named |
| Rollback Owner | Named |
| Backup coverage | Documented |

## Dataset preparation workstream (future — do not execute now)

| Step | Action | Gate |
| --- | --- | --- |
| 1 | Close G2 standards acceptance | G2 |
| 2 | Approve 1–2 sources | G1 |
| 3 | Assign reviewers and estimate capacity | IB-007 / IB-013 |
| 4 | Nominate 5–10 Bangkok new condominium projects | Owner |
| 5 | Sign pilot manifest | G5 |
| 6 | Prepare offline golden fixtures (accuracy/duplicate/freshness) | Pre-live |
| 7 | Only after G4 (if runtime collect): bounded capture | G4 + G5 |
| 8 | 100% review → correct → approve | Sprint 2 workflow |
| 9 | Assemble package; rollback rehearsal | Pre-G6 |
| 10 | Staging/local handoff only until freeze lift | Feature Freeze |

## Success alignment

Preparation is complete enough to enter live collect only when:

- Sample size within ceilings  
- Geography = Bangkok  
- Category = new condominiums only  
- Sources ≤2 and G1-approved  
- Evidence completeness design satisfied  
- Manual review staffing covers 100% workload  
- Manifest signed (G5)  

## Current status

| Item | Status |
| --- | --- |
| Preparation plan | Complete (this document) |
| Projects nominated | 0 |
| Records collected | 0 |
| Evidence packs | 0 |
| Manual reviews completed | 0 |
| Dataset ready for implementation use | **NO-GO** |
