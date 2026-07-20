# 07 — Agent Business Contract

**Document ID:** `07_AGENT_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Agent** as a marketplace/participant identity that may be associated with listings or inquiries — without transferring Catalog ownership of Projects/Developers/Listings to agents.

## 2. Business Responsibility

- Represent licensed or platform-recognized agent participants (logical profile).
- Provide attribution/contact pathway where product allows.
- Support future co-broke / assignment without rewriting Catalog contracts.

Does **not** own: canonical Listing inventory from portal harvest, Developer masters, District masters, or Data Factory publish authority.

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Agent profile business object | Platform / Marketplace domain |
| Catalog listing truth | Data Factory — Catalog Domain |
| Link agent ↔ listing | Explicit relationship; Catalog remains source of listing facts |
| Auth identity | Supabase Auth (serving) — out of factory implementation scope here |

**Business key:** stable `agent_id` / slug (logical)

## 4. Inputs

- Agent registration/profile data (when product collects it)
- Optional license/public credentials (sourced)
- Assignment requests to listings/inquiries

## 5. Outputs

- Agent profile record (logical)
- Optional links to listings/inquiries
- Audit events on assignment changes

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `agent_id` | Stable |
| Display name | |
| Status | `active` \| `suspended` \| `pending` |
| Locale preference | Optional but recommended |

## 7. Relationships

- Agent * ↔ * Listing (assignment; non-owning)
- Agent * ↔ * Inquiry (handling)
- Agent may reference Developer/Project for specialty — non-owning
- Customer is distinct (`08`)

## 8. Business Rules

1. Agent assignment never overrides Listing provenance or price truth.
2. Harvested portal listings are not automatically “owned” by a GTH agent.
3. PII minimized; no credential secrets in packages.
4. AI cannot approve agent verification.

## 9. Validation Rules

- Unique agent_id.
- Suspended agents cannot receive new assignments.
- Contact fields validated for format when present; not fabricated.

## 10. Approval Rules

- Platform admin/Owner approves agent activation (product policy).
- Data Factory reviewers do not approve agents via Catalog publish workflow.

## 11. Lifecycle

`pending → active → suspended → archived`

## 12. Future Compatibility

- Maps to existing/future `agents` / marketplace role tables without changing Catalog contracts.
- Commission/billing out of this contract’s responsibility.

## 13. Cross References

- M1: `05_LISTING_CONTRACT.md`, `08_CUSTOMER_CONTRACT.md`, `09_INQUIRY_CONTRACT.md`, `19_AUDIT_LOG_CONTRACT.md`
- Platform: `PLATFORM_ARCHITECTURE_V2.md` (design input)
- Master: marketplace deferred from factory core
