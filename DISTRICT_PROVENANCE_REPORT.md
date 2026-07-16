# DISTRICT_PROVENANCE_REPORT

**Milestone:** Phase 10 Sprint 4 · **Date:** 2026-07-16

Every district package now has `field_evidence` with `provenance`, `verified_at`, and `evidence_class` for BTS, MRT, schools, hospitals, shopping, parks.

| evidence_class | Meaning |
|----------------|---------|
| OFFICIAL | Named amenity/station present with source URL |
| OFFICIAL_ABSENCE | Rail dimension verified empty from BTS/MRT line + district maps (UI array left empty) |
| UNVERIFIED | No named sourced amenity yet |

Primary sources: Wikipedia BTS/MRT line pages, Wikipedia district Places/Education/Shopping sections, official institution websites where linked.

Artifact: `pipelines/factory/district-master/sprint4_field_snapshot.json`
