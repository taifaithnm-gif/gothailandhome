# 09 — Inquiry Business Contract

**Document ID:** `09_INQUIRY_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Inquiry** (lead): a customer expression of interest about a Listing, Project, or general contact — referencing Catalog entities without modifying them.

## 2. Business Responsibility

- Capture intent to contact / request information.
- Preserve attribution (UTM, gclid/fbclid when present) and target entity references.
- Route to handling (ops/agent) per product rules.

Does **not** own: Listing price truth, Project facts, or Knowledge content. Does not publish catalog.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Inquiry / lead records | Platform / Serving (inquiries, marketplace leads) |
| Target entity keys | References Catalog business keys |
| Handling assignment | Platform ops / Agent |
| Catalog updates from inquiry text | Forbidden without separate review package |

**Business key:** `inquiry_id`

## 4. Inputs

- Customer identity or guest contact fields
- Target: listing_id/slug, project_slug, or general
- Message body, locale, channel, attribution params
- Consent to contact

## 5. Outputs

- Inquiry record with status
- Optional agent assignment
- Feedback signal for Recommendations (`enquire`)
- Audit events for status changes

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `inquiry_id` | |
| `created_at` | UTC |
| Target reference | At least one: listing / project / general intent |
| Contact channel or contact point | Per product policy |
| `status` | e.g. `new` \| `in_progress` \| `closed` \| `spam` |

## 7. Relationships

- Inquiry → Customer (optional guest)
- Inquiry → Listing and/or Project (non-owning)
- Inquiry → Agent (optional handler)
- Inquiry ↛ Catalog publish

## 8. Business Rules

1. Creating an inquiry never changes listing verification or price.
2. Spam/abuse states suppress recommend feedback weight.
3. PII retained per privacy policy; not copied into factory packages.
4. AI may draft replies later; cannot mark catalog published.

## 9. Validation Rules

- Target business keys must exist when specific listing/project intent claimed (or soft-fail to general).
- Empty contact with no recoverable channel → invalid.
- Attribution fields stored as opaque strings; not invented.

## 10. Approval Rules

- Marketplace lead `review_status` (if used) is Platform admin — distinct from Catalog Review Workflow.
- Catalog Review Workflow does not approve inquiries.

## 11. Lifecycle

`new → in_progress → closed | spam | archived`

## 12. Future Compatibility

- CRM handoff export job may consume this contract’s outputs (`16_EXPORT_JOB_CONTRACT`).
- Multi-channel (LINE/WhatsApp) additive channels.

## 13. Cross References

- M1: `05_LISTING_CONTRACT.md`, `02_PROJECT_CONTRACT.md`, `07_AGENT_CONTRACT.md`, `08_CUSTOMER_CONTRACT.md`, `12_RECOMMENDATION_CONTRACT.md`, `19_AUDIT_LOG_CONTRACT.md`
- Existing serving concepts: `inquiries`, `marketplace_leads`
