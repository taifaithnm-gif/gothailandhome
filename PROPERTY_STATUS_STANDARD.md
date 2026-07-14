# Property Status Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 (planning only)  
**Compatible with:** PLATFORM_ARCHITECTURE_V2 §7.3 (keep `properties.status` + additive workflow) · CONTENT_REVIEW_STANDARD

---

## 1. Purpose

Define the **complete listing lifecycle** as business states. Implementation may split across `workflow_status`, `availability_status`, and public `status` — this document is the canonical meaning.

---

## 2. State catalog

| State              | Code             | Layer          | Public visible?             | Indexable?        |
| ------------------ | ---------------- | -------------- | --------------------------- | ----------------- |
| **Draft**          | `draft`          | Workflow       | N                           | N                 |
| **Pending Review** | `pending_review` | Workflow       | N                           | N                 |
| **Approved**       | `approved`       | Workflow       | N until published           | N                 |
| **Published**      | `published`      | Visibility     | Y if also market-available* | Y*                |
| **Available**      | `available`      | Market         | Y (with published)          | Y                 |
| **Reserved**       | `reserved`       | Market         | Y (labeled)                 | Y soft / optional |
| **Sold**           | `sold`           | Market         | Optional history page       | N default         |
| **Rented**         | `rented`         | Market         | Optional history            | N default         |
| **Expired**        | `expired`        | Market/mandate | N default                   | N                 |
| **Hidden**         | `hidden`         | Visibility     | N                           | N                 |
| **Rejected**       | `rejected`       | Workflow       | N                           | N                 |
| **Archived**       | `archived`       | Terminal       | N                           | N                 |

\*Published + Available is the standard public card. Published + Reserved may show with badge. Sold/Rented normally unpublished or `noindex`.

---

## 3. Layer model (normative)

Three orthogonal axes:

```text
workflow_status:   draft | pending_review | approved | rejected | …
visibility:        published | unpublished | hidden | archived
availability:      available | reserved | sold | rented | expired | unknown
```

**Architecture mapping**

| Business state                       | Suggested storage                                     |
| ------------------------------------ | ----------------------------------------------------- |
| Draft                                | workflow=`draft`, visibility≠published                |
| Pending Review                       | workflow=`pending_review` / `submitted` / `in_review` |
| Approved                             | workflow=`approved`                                   |
| Published                            | visibility=`published` (legacy `status=published`)    |
| Available / Reserved / Sold / Rented | `availability_status`                                 |
| Expired                              | availability or mandate end → visibility hidden       |
| Hidden                               | visibility=`hidden` / `unpublished`                   |
| Rejected                             | workflow=`rejected`                                   |
| Archived                             | workflow/visibility=`archived`                        |

Legacy: current DB `property_status` draft|published remains; market states additive.

---

## 4. Allowed transitions

```text
Draft → Pending Review → Approved → Published (+ Available)
                ↓
            Rejected → Draft (resubmit) | Archived

Published+Available → Reserved → Sold | Rented | Available
Published+Available → Expired → Hidden | Archived
Published* → Hidden → Published (relist)
Any non-terminal → Archived (ops)
Rejected → Archived
Sold | Rented → Archived (after retention)
```

Illegal: Rejected → Published; Sold → Available without new listing identity; Draft → Published skipping review (unless Admin override).

---

## 5. State definitions

### Draft

Publisher editing. Not public. Factory imports may land here or jump to pending after validation.

### Pending Review

Submitted; in Moderator/Admin/AI-assist queue. Locked fields may apply.

### Approved

Passed review; **not automatically public**. Awaiting publish action or auto-publish entitlement.

### Published

Visible shell allowed. Must combine with availability for card behavior.

### Available

On market; enquire enabled.

### Reserved

Hold/LOI; enquire may show “waitlist” policy. Commission may move toward lock.

### Sold / Rented

Terminal market success for that listing type. Default: unpublish + keep history for parties. SEO: noindex.

### Expired

Mandate or refresh window ended; treating as off-market. May renew → Pending or Available if still approved.

### Hidden

Soft off-market (membership over-cap, owner request, soft violation). Reversible.

### Rejected

Failed review; reason codes required. Not public.

### Archived

Cold storage; retained for audit/disputes; excluded from publisher caps after grace.

---

## 6. Who can set what

| Transition                  | Agent/Agency/Owner/Dev | Moderator | Admin       |
| --------------------------- | ---------------------- | --------- | ----------- |
| Draft → Pending             | Y                      | —         | Y           |
| Pending → Approved/Rejected | N                      | Y         | Y           |
| Approved → Published        | Y (if entitled)        | policy    | Y           |
| Available ↔ Reserved        | Y                      | —         | Y           |
| → Sold/Rented               | Y                      | —         | Y           |
| → Hidden                    | Y (own)                | Y         | Y           |
| → Archived                  | limited                | Y         | Y           |
| Override skip review        | N                      | N         | Y (audited) |

---

## 7. Interaction with Content Review & Factory

- Property Factory verified imports: may enter Pending Review then Approved/Published under ops SLA.
- Stale source → Expired or Hidden per CONTENT_REVIEW staleness.
- Quality hard fail → Rejected.

---

## 8. SLA (business targets)

| Stage                        | Target                                                 |
| ---------------------------- | ------------------------------------------------------ |
| Pending Review (clean)       | &lt; 24–48h                                            |
| Approved → Publisher publish | Immediate self-serve                                   |
| Reserved hold max            | Configurable (e.g. 14d) then auto Available or Expired |

---

_End of Property Status Standard V1.0_
