# 13 — Knowledge Business Contract

**Document ID:** `13_KNOWLEDGE_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Knowledge items** (articles, FAQ, blog, investment/legal guides) and their facts/evidence obligations — what governed content the platform manages.

## 2. Business Responsibility

- Produce evidence-backed, human-approved knowledge for trust and SEO.
- Enforce elevated compliance for investment/legal content.
- Publish packages to site ingest (K1 FS today; K2 tables later) without creating a parallel property database.

Does **not** own: Listing inventory, Project masters, or Customer PII.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Knowledge packages & facts | Data Factory — Knowledge Domain |
| Compliance sign-off | Reviewer + policy checklists; Owner for exceptions |
| Site rendering | Website consumer |
| Collection runtime | Windows01 when gated |

**Business key:** `content_type` + `slug`

## 4. Inputs

- Approved sources & evidence
- Editorial drafts / AI drafts (flagged)
- Compliance checklist results
- Catalog entity references for `ABOUT`

## 5. Outputs

- Versioned knowledge packages
- Facts with support_level
- Publish packages for site ingest
- Graph edges `CITES`, `ABOUT`, `SUPERSEDES`
- Approved corpus for AI Search embeddings (future)

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `content_type`, `slug` | |
| `title` EN | |
| `review_status` / editorial status | Mapped to lifecycle |
| `sources[]` | Except pure boilerplate flagged |
| High-risk: disclaimers + checklist id | Investment/legal |

## 7. Relationships

- Knowledge → Evidence/Sources
- Knowledge → Catalog entities (`ABOUT`)
- Knowledge → Media
- Knowledge → SEO
- Search/Recommend may retrieve Knowledge; do not own it

## 8. Business Rules

1. Unknown facts are not publishable.
2. Forbidden claims block approval.
3. AI cannot approve.
4. Confidence scores cannot convert unknown → fact.
5. No second property DB inside Knowledge Domain.

## 9. Validation Rules

- Unique slug per content_type.
- Compliance failures are P0 for high-risk types.
- Catalog refs must use valid business keys.

## 10. Approval Rules

- Human review mandatory for `approved`.
- Owner publish gate for factory-collected production publish.
- Editorial website FS path still follows public content governance packages.

## 11. Lifecycle

Shared spine + compliance sub-flags on `in_review`; supersession via new version.

## 12. Future Compatibility

- K1/K2 serving choice (M3) does not change this business contract.
- Second site publish binding at export time.

## 13. Cross References

- M0: `08_KNOWLEDGE_DATA_STANDARD.md`, `19_DATA_GOVERNANCE_STANDARD.md`
- M1: `14_SEO_CONTRACT.md`, `17_REVIEW_WORKFLOW_CONTRACT.md`, `18_PUBLISH_WORKFLOW_CONTRACT.md`, `11_SEARCH_CONTRACT.md`, `20_WINDOWS01_RUNTIME_CONTRACT.md`
- Policies: `G_LEGAL_*`, `G_INVESTMENT_*`, `G_CONTENT_PUBLIC_*`
- CF V2: `CONTENT_FACTORY_ARCHITECTURE_V2.md`
