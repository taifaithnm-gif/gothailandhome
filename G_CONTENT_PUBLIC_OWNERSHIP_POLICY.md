# G-CONTENT-PUBLIC — Ownership Policy

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-OWNER-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Assigns accountable human ownership for Phase 1 public static content. AI systems may draft or validate structure; **AI cannot approve** public content.

## 2. Roles

| Role | Authority | May approve public routing? |
| --- | --- | --- |
| **Content Owner** | Inventories, types, locale policy, visibility, lifecycle amendments | **Yes** (gate-level and inventory-level) |
| **Editorial Reviewer** | Per-document accuracy, citations, locale completeness, claim hygiene | **Yes** for individual documents when delegated by Content Owner |
| **Qualified Investment Reviewer** | Investment guide scope/copy (G-INVESTMENT) | Only under G-INVESTMENT |
| **Qualified Legal Reviewer** | Legal guide exact copy (G-LEGAL) | Only under G-LEGAL |
| **Engineering** | Loader, routes, validation commands (P1-22–P1-28) | **No** — implements policy only |

## 3. Ownership of content types

| Type | Owning role | Notes |
| --- | --- | --- |
| `knowledge_article` | Content Owner | Editorial Reviewer may approve individual articles |
| `blog_post` | Content Owner | Author attribution required on-document |
| `faq_entry` | Content Owner | Process FAQs only; legal/investment answers must link to guides |
| `investment_guide` | Content Owner + Qualified Investment Reviewer | G-INVESTMENT required |
| `legal_guide` | Content Owner + Qualified Legal Reviewer | G-LEGAL required |

## 4. Document-level owner field

Every public static document must record:

- `owner` — role or named assignee (name may be withheld in repo; role required)
- `reviewed_by` — human reviewer role or assignee at last approval
- `reviewed_at` — ISO date

Missing owner/review metadata → fail validation (P1-28); not routable.

## 5. Inventory ownership

Only the Content Owner (or explicit delegate recorded in the Decision Register) may:

- Add, remove, or change disposition of inventory rows
- Amend locale fallback or status vocabulary
- Re-open G-CONTENT-PUBLIC with a new decision ID

## 6. Separation from listing ownership

Platform Customer Success, Apple, and marketplace contacts are **never** content authors or listing owners. Content ownership does not imply listing-agent status.

## 7. Approval

**APPROVED** under decision **GCP-D-003**.
