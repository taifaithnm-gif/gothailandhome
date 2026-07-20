# G-CONTENT-PUBLIC — Content Governance Approval Package

**Gate:** G-CONTENT-PUBLIC  
**Phase:** Phase 1 — Static content product (M4)  
**Package status:** COMPLETE  
**Gate disposition:** **CLEARED**  
**Approval date:** 2026-07-20  
**Scope:** Website static public content only (knowledge articles, blog, FAQ, and type boundaries for investment/legal guides). Does **not** authorize Windows01, live property sources, collectors, OCR, embeddings, CRM, deployment, or production configuration changes.

## Purpose

This package is the sole authority that clears **G-CONTENT-PUBLIC** so that **P1-22** (static content schema and loader) and dependent public-content tasks may begin under normal Phase 1 implementation rules.

It does **not** clear:

| Gate | Still required for |
| --- | --- |
| **G-INVESTMENT** | P1-25 investment guide copy, citations, disclaimer, review cadence |
| **G-LEGAL** | P1-26 legal guide exact copy, jurisdiction, disclaimer, owner |
| **G-ANALYTICS** | P1-31–P1-32 |
| **G-RELEASE** | P1-36 |

## Package contents

| # | Document | Covers |
| ---: | --- | --- |
| 0 | `G_CONTENT_PUBLIC_PACKAGE.md` | This index |
| 1 | `G_CONTENT_PUBLIC_CONTENT_TYPES.md` | Public content types |
| 2 | `G_CONTENT_PUBLIC_STATUS_VOCABULARY.md` | Inventory status vocabulary |
| 3 | `G_CONTENT_PUBLIC_OWNERSHIP_POLICY.md` | Ownership policy |
| 4 | `G_CONTENT_PUBLIC_LOCALE_FALLBACK_POLICY.md` | Locale fallback policy |
| 5 | `G_CONTENT_PUBLIC_VISIBILITY_RULES.md` | Public visibility rules |
| 6 | `G_CONTENT_PUBLIC_SOURCE_ATTRIBUTION.md` | Source attribution rules |
| 7 | `G_CONTENT_PUBLIC_EVIDENCE_REQUIREMENTS.md` | Evidence requirements |
| 8 | `G_CONTENT_PUBLIC_EDITORIAL_WORKFLOW.md` | Editorial approval workflow |
| 9 | `G_CONTENT_PUBLIC_CONTENT_LIFECYCLE.md` | Content lifecycle |
| 10 | `G_CONTENT_PUBLIC_OWNER_DECISION_REGISTER.md` | **Official approval record** |
| A | `G_CONTENT_PUBLIC_ARTICLE_INVENTORY.md` | Approved knowledge-article inventory |
| B | `G_CONTENT_PUBLIC_BLOG_INVENTORY.md` | Approved blog inventory |
| C | `G_CONTENT_PUBLIC_FAQ_INVENTORY.md` | Approved FAQ inventory |

## Gate clearance criteria (all met)

| Criterion | Source document | Met |
| --- | --- | --- |
| Content types defined and approved | Content Types | Yes |
| Status vocabulary + routability | Status Vocabulary | Yes |
| Ownership policy | Ownership Policy | Yes |
| Locale fallback policy | Locale Fallback Policy | Yes |
| Public article / blog / FAQ inventories | Inventories A–C | Yes |
| Visibility, attribution, evidence, workflow, lifecycle | Docs 5–9 | Yes |
| Official Owner decision register signed | Decision Register | Yes |

## What this gate unlocks

- **P1-22** — Static content schema and loader  
- **P1-23** — Knowledge article index/detail (subject to Article Inventory)  
- **P1-24** — Blog routes (subject to Blog Inventory; may ship empty-state)  
- **P1-27** — FAQ hub (subject to FAQ Inventory)  
- **P1-28** — Static CMS validation (must enforce this package)  
- **P1-29 / P1-30** — Content metadata / internal links (after applicable routes exist)

## What this gate does not unlock

- Publishing investment or legal guide **copy** (still G-INVESTMENT / G-LEGAL)
- Live collection, Windows01, OCR, embeddings, production writes, deploy, commit authorization

## Authority chain

`PHASE1_EXECUTION_READY_REPORT.md` → this package → `G_CONTENT_PUBLIC_OWNER_DECISION_REGISTER.md` (binding) → P1-22 implementation.

## Gate statement

# G-CONTENT-PUBLIC: CLEARED
