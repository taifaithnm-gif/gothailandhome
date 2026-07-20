# G-CONTENT-PUBLIC — Content Lifecycle

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-LIFE-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines create → review → publish → maintain → archive for Phase 1 public static content.

## 2. Lifecycle states

| Phase | Status | Engineering behavior |
| --- | --- | --- |
| Create | `draft` | Writable in approved trees; excluded from routes/sitemap |
| Review | `in_review` | Excluded from routes |
| Live | `approved` + inventory Approved | Eligible for routes if Visibility Rules pass |
| Retire | `archived` | Removed from indexes; detail 404 unless redirect recorded |
| Reject | `rejected` | Never route; keep file for audit if desired |

## 3. Create

- File placed only under approved directories (`G_CONTENT_PUBLIC_CONTENT_TYPES.md` §4).
- Slug reserved in draft inventory notes or PR description; public inventory row added only at approval.

## 4. Maintain

- Material factual changes require re-review and new `reviewed_at`.
- Locale additions that complete a previously partial locale require re-review of that locale.
- Broken citation URLs discovered in P1-28 → fail build/test until fixed or document demoted from Approved.

## 5. Archive / unpublish

Content Owner may set `archived` and remove or mark inventory disposition **Archived**. Engineering must stop routing within the same change set that archives.

## 6. Inventory amendments

Adding a new public slug requires:

1. Editorial workflow pass
2. Inventory file row with disposition **Approved**
3. Decision Register note or inventory revision stamp (`updated_at`)

Empty inventories (blog at gate clearance) are valid; empty-state UI is required (P1-24).

## 7. Dual-gate types

`investment_guide` and `legal_guide` follow this lifecycle **and** cannot become Live until G-INVESTMENT / G-LEGAL clear for the specific versioned copy.

## 8. Rollback

If incorrect content reaches public routes: archive or revert file, remove from inventory Approved set, re-run P1-28, and record incident in Decision Register notes. No Windows01 dependency.

## 9. Approval

**APPROVED** under decision **GCP-D-009**.
