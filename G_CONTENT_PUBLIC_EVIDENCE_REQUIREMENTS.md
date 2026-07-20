# G-CONTENT-PUBLIC — Evidence Requirements

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-EVID-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines minimum evidence so public static content remains verifiable and fail-closed.

## 2. Evidence classes (knowledge)

Aligned with existing project evidence language where applicable:

| Class | Meaning | Public use |
| --- | --- | --- |
| `OFFICIAL` | Taken from an allowed official/government/operator source | May present as fact with citation |
| `EDITORIAL` | Platform narrative without external numeric claim | Blog only; must not invent market stats |
| `UNVERIFIED` | Not human-verified | **Must not render** as public fact |

## 3. Per-type minimums

### knowledge_article

- At least one citation in `sources` with `verified_at`
- `verified_at` / `reviewed_at` on the document
- No yield/ROI/guaranteed-return claims
- `field_evidence` encouraged for structured facts; required when asserting contact numbers, network labels, or similar extractable facts
- Body paragraphs must not contradict cited sources

### blog_post

- `author`, `published_at`, `updated_at`
- Factual statistics require citations
- Must be distinguishable from knowledge/reference guides in UI copy

### faq_entry

- `category`, `sort_order`, `reviewed_at`
- Answers that would be legal or investment advice must **link** to approved guides (after G-LEGAL / G-INVESTMENT) rather than improvise
- Platform-process answers need no external URL but must set `source_class: platform_process`

### investment_guide / legal_guide

- Evidence rules deferred to G-INVESTMENT / G-LEGAL packages (exact copy, disclaimer, citations, review cadence)

## 4. Freshness of review

| Type | Max age since `reviewed_at` before re-review required |
| --- | --- |
| knowledge_article | 180 days |
| blog_post | 365 days (or on material update) |
| faq_entry | 180 days |
| investment_guide / legal_guide | Per qualified-gate cadence |

Stale beyond max → status treated as not routable until re-reviewed (P1-28 must fail).

## 5. Fail-closed validation (P1-28)

Fail with file/field when:

- Missing required citations for knowledge articles
- `UNVERIFIED` facts presented
- Review date missing or stale
- Disclaimer missing on investment/legal types (when those gates clear)
- Broken internal links to guides/FAQ/knowledge

## 6. Approval

**APPROVED** under decision **GCP-D-007**.
