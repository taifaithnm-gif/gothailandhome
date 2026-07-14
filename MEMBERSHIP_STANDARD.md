# Membership Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 (planning only)  
**Compatible with:** PLATFORM_ARCHITECTURE_V2 §7.8 entitlements JSON

---

## 1. Purpose

Define commercial membership tiers and entitlements before marketplace billing ships. Numbers below are **business defaults** — adjustable by Admin without renaming plan codes.

**Plan codes (stable):** `free` · `agent_pro` · `agency_pro` · `developer` · `enterprise`

---

## 2. Plans overview

| Plan           | Audience                         | Billing interval (future) | Intent                               |
| -------------- | -------------------------------- | ------------------------- | ------------------------------------ |
| **Free**       | Agent (starter), Owner, Customer | —                         | Publish limited / enquire only       |
| **Agent Pro**  | Individual agent                 | month / year              | Serious solo inventory + leads       |
| **Agency Pro** | Agency org                       | month / year              | Team seats + shared credits          |
| **Developer**  | Developer brand                  | month / year              | Project catalog + inventory bulk     |
| **Enterprise** | Large agency or developer group  | custom / annual           | Limits, SSO-ready, SLA, API (future) |

Customers (Buyer/Tenant) remain on an implicit free consumer tier — not sold as Agent Free.

---

## 3. Entitlement matrix

| Entitlement                       | Free (Agent)              | Agent Pro            | Agency Pro          | Developer           | Enterprise            |
| --------------------------------- | ------------------------- | -------------------- | ------------------- | ------------------- | --------------------- |
| **Active published listings**     | 5                         | 50                   | 300                 | 500 units**         | Custom (∞ negotiated) |
| **Draft listings**                | 20                        | 200                  | 1,000               | 2,000               | Custom                |
| **Featured listing credits / mo** | 0                         | 3                    | 15                  | 10                  | Custom pool           |
| **Advertisement credits / mo**    | 0                         | 1                    | 8                   | 5                   | Custom                |
| **Lead management**               | Basic inbox               | Full + notes         | Org inbox + routing | Project routing     | Advanced + export     |
| **Analytics**                     | 7-day basic               | 90-day agent         | Org rollups         | Project rollups     | Custom + raw export   |
| **Co-agent slots / listing**      | 1                         | 3                    | 5                   | 5                   | Custom                |
| **Seats (users)**                 | 1                         | 1                    | 10                  | 5 brand ops         | Custom                |
| **Official data claim tools**     | N                         | N                    | N                   | Y                   | Y                     |
| **Priority support**              | N                         | Email                | Priority email      | Priority            | Dedicated             |
| **Future AI access**              | N                         | Assist draft (quota) | Team quota          | Project copy assist | Custom + API          |
| **API / bulk import**             | Property Factory ops only | N                    | Limited CSV         | Bulk inventory      | Full (contract)       |

\*\*Developer plan listing cap counts **units** under claimed projects; projects themselves capped separately (e.g. 25 active projects on Developer, custom on Enterprise).

**Free Owner:** up to 3 own units published after verification; 0 ad credits; basic leads on own units.

**Free Customer:** 0 listings; unlimited enquiries within anti-spam limits.

---

## 4. Listing limits (rules)

1. **Active** = `workflow` approved + visibility published + not Sold/Rented/Expired/Archived/Hidden.
2. Exceeding cap blocks **new publish**; drafts allowed until draft cap.
3. Downgrade: grace 14 days, then oldest non-featured listings auto-`Hidden` until under cap (notify user).
4. Admin comps do not change plan code — grant `entitlement_overrides`.

---

## 5. Featured listing credits

| Rule        | Spec                                                                                |
| ----------- | ----------------------------------------------------------------------------------- |
| Credit unit | 1 credit = 7 days on one channel (`home` \| `city` \| `search` \| `project`)        |
| Stacking    | Multiple channels consume multiple credits                                          |
| Expiry      | Credits expire end of billing period (no rollover default; Enterprise may rollover) |
| Source      | Membership perk or purchased pack                                                   |
| Sync        | Projects `featured_placements` → denorm `properties.featured` per Architecture V2   |

---

## 6. Advertisement credits

| Rule        | Spec                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Credit unit | Maps to flat-period products in ADVERTISEMENT_STANDARD (e.g. 1 credit = District Featured 7 days) |
| CPC/CPM     | Future; credits may convert to wallet balance                                                     |
| Creative    | Still requires moderation approval                                                                |
| Unused      | Expire with period unless Enterprise                                                              |

---

## 7. Lead management by tier

| Tier       | Features                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| Free Agent | New → Contacted statuses; email notify                                   |
| Agent Pro  | Full LEAD_STANDARD lifecycle; WhatsApp/LINE deep links; notes; reminders |
| Agency Pro | Org assignment, round-robin rules, SLA dashboards                        |
| Developer  | Leads on project inventory; appoint agency routing                       |
| Enterprise | CRM webhook (Architecture CRM adapter); export                           |

Spam tools available on all authenticated lead owners.

---

## 8. Analytics by tier

| Tier       | Metrics                                      |
| ---------- | -------------------------------------------- |
| Free       | Views (7d), lead count                       |
| Agent Pro  | Views, saves, lead funnel, channel mix (90d) |
| Agency Pro | Per-agent leaderboard, org funnel            |
| Developer  | Per-project views, inventory velocity        |
| Enterprise | Custom dimensions + warehouse export path    |

No PII of other buyers beyond lead consent fields.

---

## 9. Future AI access

Architecture AI remains adapter-only. Membership gates **quota**, not model choice:

| Tier       | Monthly AI assist units (design default) |
| ---------- | ---------------------------------------- |
| Free       | 0                                        |
| Agent Pro  | 50                                       |
| Agency Pro | 300 shared                               |
| Developer  | 200                                      |
| Enterprise | Custom                                   |

Allowed assists: locale draft, description polish, photo alt suggestions. **Forbidden:** invent price, yield, availability (CONTENT_REVIEW).

---

## 10. Subscription states (future)

`trialing` · `active` · `past_due` · `cancelled` · `expired` — per Architecture `membership_subscriptions`.

Trial: Agent Pro 14 days optional; card-on-file policy deferred to PAYMENT_STANDARD.

---

## 11. Compatibility

- Entitlements stored as Architecture `membership_plans.entitlements` JSON.
- Property Factory imports are **platform ops**, not charged against Agent Free caps.
- Imported L3 listings owned by platform until claimed by Agent/Owner/Developer.

---

_End of Membership Standard V1.0_
