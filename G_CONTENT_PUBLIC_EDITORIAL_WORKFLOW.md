# G-CONTENT-PUBLIC — Editorial Approval Workflow

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-EDIT-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines the human editorial path from draft to public routing. Separates **document approval** from **engineering implementation**.

## 2. Stages

```
draft → in_review → approved → (routable if inventory + visibility pass)
                ↘ rejected
approved → archived  (Owner decision)
```

## 3. Workflow steps

| Step | Actor | Action | Outcome |
| ---: | --- | --- | --- |
| 1 | Author / Engineering | Create document in approved filesystem tree with `status: draft` | Not routable |
| 2 | Author | Complete locales, citations, evidence per policies | Ready for review |
| 3 | Editorial Reviewer | Checklist: accuracy, attribution, locale, claim hygiene, no illegal advice | Pass → recommend approve; Fail → `rejected` with reasons |
| 4 | Content Owner or delegate | Record inventory disposition **Approved** (or reject) | Inventory updated |
| 5 | Engineering | P1-22+ loader/routes; P1-28 validation | Routable only if all gates pass |
| 6 | Content Owner | Periodic re-review per Evidence Requirements | Refresh `reviewed_at` or archive |

## 4. Checklist (editorial)

- [ ] Type id is allowed
- [ ] Slug unique within type
- [ ] Status vocabulary respected
- [ ] Locale policy satisfied
- [ ] Citations present and URLs reachable at review time
- [ ] No unsupported investment/legal claims
- [ ] Owner / reviewer / reviewed_at present
- [ ] Distinguishes blog vs knowledge when applicable
- [ ] FAQ answers that need guides link out instead of improvising

## 5. AI constraints

- AI may propose drafts and run structural validation.
- AI **must not** set inventory disposition to Approved.
- AI **must not** clear G-INVESTMENT or G-LEGAL.

## 6. Record keeping

Each approval records: document slug, type, reviewer role, date, inventory decision id (row), and optional conditions. Prefer Decision Register amendments for inventory changes.

## 7. Relationship to publication systems

This workflow is for **website static content**. It does not authorize Content Factory live collection, Windows01 publication batches, or listing auto-publish.

## 8. Approval

**APPROVED** under decision **GCP-D-008**.
