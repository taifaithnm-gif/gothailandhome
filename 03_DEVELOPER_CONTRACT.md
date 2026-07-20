# 03 — Developer Business Contract

**Document ID:** `03_DEVELOPER_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Developer**: brand/legal identity and catalog hub for related Projects.

## 2. Business Responsibility

- Maintain trusted developer identity (brand + legal names, locale trinity).
- Hold official links, logo/media rights notes, and SEO for developer hubs.
- Anchor the `DEVELOPS` relationship to Projects.

Does **not** own: projects’ physical specs, listings, or agent brokerage profiles.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Developer package & catalog | Data Factory — Catalog Domain |
| Logo rights acceptance | Reviewer / Owner |
| Marketplace org linkage (future) | Platform — links by slug only |

**Business key:** `slug`

## 4. Inputs

- Official website, IR, Maps, approved public sources
- Logo/media assets with attribution
- SEO drafts; related project slug lists

## 5. Outputs

- Versioned developer package
- Serving Catalog developer projection
- Graph node `Developer` + `DEVELOPS` edges
- Completeness grade A/B/C

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `slug` | |
| `name` EN | Trinity preferred |
| `sources[]` | Prefer official |
| Envelope + `review_status` | Per M0 metadata |

## 7. Relationships

- Developer 1 → * Project
- Developer 1 → * Media (logo)
- Developer 1 → SEO
- Knowledge may `ABOUT` Developer
- Agent may *reference* Developer but does not own it (`07_AGENT_CONTRACT`)

## 8. Business Rules

1. Grade C stubs are not public-grade.
2. Do not invent founding year, ticker, or awards.
3. Press claims need corroboration for publish.
4. Social URLs require provenance.

## 9. Validation Rules

- Unique slug.
- `publish_ready` requires EN name, ≥1 qualifying source, SEO EN pair, no P0 failures.
- Logo rights note required before public logo use.

## 10. Approval Rules

- Human approval for publish_ready.
- AI drafts for ZH/TH remain flagged until accepted.

## 11. Lifecycle

Shared catalog spine (`17`, M0 `18`).

## 12. Future Compatibility

- Multi-brand groups via graph `SAME_AS` / parent edges later.
- Marketplace `developer_accounts` link by slug; no ownership transfer.

## 13. Cross References

- M0: `05_DEVELOPER_DATA_STANDARD.md`
- M1: `02_PROJECT_CONTRACT.md`, `06_MEDIA_CONTRACT.md`, `14_SEO_CONTRACT.md`, `17_REVIEW_WORKFLOW_CONTRACT.md`
