# Lead Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 (planning only)  
**Compatible with:** PLATFORM_ARCHITECTURE_V2 §7.10 (extend `inquiries`) · MEMBERSHIP_STANDARD

---

## 1. Purpose

Define lead lifecycle, channels, assignment, and anti-spam rules for all enquiries. Extends existing `inquiries` — does not replace them.

---

## 2. Lead lifecycle states

| State           | Code          | Meaning                                |
| --------------- | ------------- | -------------------------------------- |
| **New**         | `new`         | Just created; unassigned or unworked   |
| **Assigned**    | `assigned`    | Owned by agent/org/owner               |
| **Contacted**   | `contacted`   | Outbound attempt documented            |
| **Viewing**     | `viewing`     | Site visit scheduled/done              |
| **Negotiating** | `negotiating` | Offer / terms discussion               |
| **Closed**      | `closed`      | Won deal (sale/rent success)           |
| **Lost**        | `lost`        | Explicitly lost / abandoned after work |
| **Spam**        | `spam`        | Abuse / fake / irrelevant              |

Architecture aliases: map `qualified`≈early contacted; `won`→`closed`. Keep legacy `inquiry_status` mappable 1:1 during migration.

---

## 3. Transitions

```text
New → Assigned → Contacted → Viewing → Negotiating → Closed
         ↓           ↓           ↓           ↓
       Spam        Lost        Lost        Lost
New → Spam
Any active → Lost (with reason)
Closed / Lost / Spam → terminal (reopen = Admin only → New/Assigned)
```

---

## 4. Channels

| Channel                | Code                 | Capture                                        | Notes                             |
| ---------------------- | -------------------- | ---------------------------------------------- | --------------------------------- |
| **WhatsApp**           | `whatsapp`           | Click-to-chat + optional return webhook future | Prefer E.164                      |
| **LINE**               | `line`               | LINE OA / share link                           | Store LINE user id when available |
| **WeChat**             | `wechat`             | Deep link / QR ops                             | Strong for ZH locale              |
| **Phone**              | `phone`              | Tap-to-call + manual log                       | Mask in UI per privacy            |
| **Email**              | `email`              | Form / mailto                                  | Existing form primary             |
| **Facebook Messenger** | `facebook_messenger` | Page link / future plugin                      |                                   |
| Web form               | `web_form`           | Default site enquiry                           | Always available                  |
| Ads                    | `ads`                | Campaign attribution                           | `campaign_id`                     |
| Import                 | `import`             | Factory/ops                                    | Rare                              |

A lead has `source_channel` (first touch) and `preferred_channel` (customer preference). Events may log additional touches.

---

## 5. Lead record (business fields)

| Field                                     | Req              |
| ----------------------------------------- | ---------------- |
| `inquiry_id`                              | Existing PK      |
| `listing_id` / `project_id`               | Context          |
| `customer_user_id`                        | If logged in     |
| `contact_name`, `email`, `phone`          | Consent captured |
| `locale`                                  | en/zh/th         |
| `message`                                 | Free text        |
| `lead_status`                             | Lifecycle        |
| `assigned_to_user_id` / `assigned_org_id` |                  |
| `score`                                   | 0–100 optional   |
| `channel` fields                          | above            |
| `utm` / `campaign_id`                     | Ads              |
| `spam_score`                              | System           |

---

## 6. Assignment rules

| Strategy           | When                             |
| ------------------ | -------------------------------- |
| `primary_agent`    | Default for listing with primary |
| `owner_first`      | Owner-published units            |
| `round_robin_org`  | Agency Pro+                      |
| `developer_router` | Project inventory policy         |
| Manual             | Assignee or Admin                |

History: `lead_assignments_history`. Notify assignee on all supported channels they enabled.

---

## 7. Channel handling rules

1. Deep links must prefill listing URL/ref id when possible.
2. Logging an outbound WhatsApp/LINE/WeChat/Phone marks **Contacted** if from New/Assigned.
3. No bulk export of contacts on Free tier.
4. Consent: store marketing opt-in separately from transactional lead follow-up.
5. Cross-border WeChat/WhatsApp: still THB deals; content language follows `locale`.

---

## 8. Closed / Lost / Spam

| State  | Required                                              |
| ------ | ----------------------------------------------------- |
| Closed | Optional `deal_id`; closed price private              |
| Lost   | `lost_reason` controlled list                         |
| Spam   | Auto or human; suppress future identical fingerprints |

Lost reasons: `price` · `location` · `financing` · `chose_other` · `no_response` · `other`.

---

## 9. SLA (business)

| Tier                                | First response target         |
| ----------------------------------- | ----------------------------- |
| Free                                | Best effort                   |
| Agent Pro                           | &lt; 4 business hours         |
| Agency Pro / Developer / Enterprise | Configurable; default &lt; 2h |

Breach → analytics flag only (no auto-penalty V1).

---

## 10. Privacy

- PII visible to assignee, org managers, Admin/Moderator.
- Buyers see their own enquiry thread only.
- Retention: active 24 months; spam 90 days; export/delete per policy (DATA_OWNERSHIP / legal).

---

_End of Lead Standard V1.0_
