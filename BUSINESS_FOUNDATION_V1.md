# Business Foundation V1.0

**Product:** GoThailandHome — Thailand Property Platform  
**Version:** 1.0  
**Phase:** 6.5 Business Foundation  
**Status:** Permanent business specification (planning only — **no code, no DB, no UI, no routes**)  
**Authority:** All future marketplace development must comply with this foundation and its child standards.

---

## Document map

| #   | Document                                                     | Topic                                                                   |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1   | [USER_ROLE_STANDARD.md](./USER_ROLE_STANDARD.md)             | Guest, Buyer, Tenant, Agent, Agency, Owner, Developer, Admin, Moderator |
| 2   | [MEMBERSHIP_STANDARD.md](./MEMBERSHIP_STANDARD.md)           | Free, Agent Pro, Agency Pro, Developer, Enterprise                      |
| 3   | [COMMISSION_STANDARD.md](./COMMISSION_STANDARD.md)           | Exclusive, Open, Co-Agent, Full/Half/Negotiable, splits, workflow       |
| 4   | [PROPERTY_STATUS_STANDARD.md](./PROPERTY_STATUS_STANDARD.md) | Draft → Archived lifecycle                                              |
| 5   | [VERIFICATION_STANDARD.md](./VERIFICATION_STANDARD.md)       | Official Developer through Expired                                      |
| 6   | [ADVERTISEMENT_STANDARD.md](./ADVERTISEMENT_STANDARD.md)     | Featured products, banners, CPC/CPM future                              |
| 7   | [LEAD_STANDARD.md](./LEAD_STANDARD.md)                       | Lead lifecycle + WhatsApp/LINE/WeChat/Phone/Email/Messenger             |
| 8   | [PAYMENT_STANDARD.md](./PAYMENT_STANDARD.md)                 | Stripe, Omise, PromptPay, bank, Alipay, WeChat Pay, invoices, refunds   |
| 9   | [MEDIA_STANDARD_V2.md](./MEDIA_STANDARD_V2.md)               | Photos → TikTok/Matterport/drone/360                                    |
| 10  | [DATA_OWNERSHIP_STANDARD.md](./DATA_OWNERSHIP_STANDARD.md)   | Ownership classes, copyright, update/deletion                           |
| 11  | **This file**                                                | Consolidated permanent business spec                                    |

**Upstream compatibility**

- [PLATFORM_ARCHITECTURE_V2.md](./PLATFORM_ARCHITECTURE_V2.md) — domain tables & workflows
- [PROPERTY_FACTORY_MASTER_PLAN.md](./PROPERTY_FACTORY_MASTER_PLAN.md) — import scale path
- [MASTER_CONTENT_STANDARD.md](./MASTER_CONTENT_STANDARD.md) — content/field contract

---

## 1. Executive contract

1. **Roles before features** — every capability maps to USER_ROLE_STANDARD.
2. **Content before commerce** — listings still obey Content Standard L3+; business states wrap them.
3. **Provider-agnostic money** — payments only via billing abstractions (Architecture §7.9).
4. **Factory is platform ops** — imports are `imported` ownership; not charged against Agent Free caps until claimed.
5. **No silent AI facts** — AI assist never invents price, yield, or availability.
6. **Trust is layered** — Verification (identity) ≠ Platform Verified (listing content) ≠ Published (visibility).
7. **This phase ships documents only** — implementation later by Architecture migration sequence.

---

## 2. Role system (summary)

| Role           | Publish          | Platform approve   | Membership              | Billing                |
| -------------- | ---------------- | ------------------ | ----------------------- | ---------------------- |
| Guest          | N                | N                  | N                       | N                      |
| Buyer / Tenant | N                | N                  | Free consumer           | Consumer add-ons later |
| Agent          | Y scoped         | N                  | Free / Agent Pro        | Y                      |
| Agency         | Y via members    | N                  | Agency Pro / Enterprise | Y org                  |
| Owner          | Own units        | N                  | Free + boosts           | Limited                |
| Developer      | Brand inventory  | Claim-level        | Developer / Enterprise  | Y                      |
| Moderator      | Policy unpublish | Content/verify/ads | N                       | N                      |
| Admin          | Full             | Full               | N                       | Overrides              |

Multi-role union; Admin supersedes. Agency = organization + members (not only a user enum).

→ USER_ROLE_STANDARD

---

## 3. Membership (summary)

| Plan         | Active listings (default) | Featured credits/mo | Ad credits/mo | AI quota   |
| ------------ | ------------------------- | ------------------- | ------------- | ---------- |
| Free (Agent) | 5                         | 0                   | 0             | 0          |
| Agent Pro    | 50                        | 3                   | 1             | 50         |
| Agency Pro   | 300                       | 15                  | 8             | 300 shared |
| Developer    | 500 units                 | 10                  | 5             | 200        |
| Enterprise   | Custom                    | Custom              | Custom        | Custom     |

Lead management & analytics deepen by tier. Downgrade grace 14 days then auto-Hidden overflow.

→ MEMBERSHIP_STANDARD

---

## 4. Commission (summary)

- **Mandate:** Exclusive \| Open Listing.
- **Overlay:** Co-Agent invites + split %.
- **Offer modes:** Full \| Half \| Negotiable \| % \| Fixed THB.
- **Lifecycle:** projected → locked → invoiced → paid (void/disputed).
- Default public SEO: commission **private**; partners see offers.

→ COMMISSION_STANDARD · Architecture `listing_commissions` / `commission_splits`

---

## 5. Property status (summary)

**Workflow:** Draft → Pending Review → Approved / Rejected  
**Visibility:** Published · Hidden · Archived  
**Market:** Available · Reserved · Sold · Rented · Expired

Public browse = Published + Available (Reserved optional with badge). Sold/Rented → noindex default.

→ PROPERTY_STATUS_STANDARD · Architecture workflow + availability columns

---

## 6. Verification (summary)

Official Developer · Verified Agency · Verified Agent · Verified Owner · Platform Verified · Pending · Rejected · Expired

Documents required per level; Moderator reviews; validity 12–24 months; badges unlock plans and trust UI.

→ VERIFICATION_STANDARD

---

## 7. Advertising (summary)

Homepage / City / District / Project / Developer Featured · Search Sponsored · Banner · Premium Listing · Priority Ranking

Billing: credits & flat period first; **CPC/CPM** later via Architecture ad_impressions/clicks. Always label Sponsored.

→ ADVERTISEMENT_STANDARD

---

## 8. Leads (summary)

New → Assigned → Contacted → Viewing → Negotiating → Closed | Lost | Spam

Channels: WhatsApp, LINE, WeChat, Phone, Email, Facebook Messenger (+ web_form, ads). Extends `inquiries`.

→ LEAD_STANDARD

---

## 9. Payments (summary)

Future rails: Stripe, Omise, PromptPay, Bank Transfer, Alipay, WeChat Pay.  
Objects: customers, invoices, payments, subscriptions, refunds, webhooks.  
Domain never calls PSP SDKs directly.

→ PAYMENT_STANDARD

---

## 10. Media V2 (summary)

Adds Drone, 360°, Virtual Tour, Matterport, YouTube, TikTok on top of Content MEDIA_STANDARD V1 (photos, video, floor plans, brochures, rights, sizes).

→ MEDIA_STANDARD_V2

---

## 11. Data ownership (summary)

Official Developer Data ≻ Verified Owner ≻ Agency/Agent mandate ≻ Imported Platform Verified ≻ … ≻ AI Generated (weakest on facts).

Copyright licenses for display; deletion = soft-archive + PDPA erase paths; Factory remains steward until claim.

→ DATA_OWNERSHIP_STANDARD

---

## 12. End-to-end business flow (normative)

```text
Register (Buyer/Tenant)
  └─ apply Agent | Owner | Developer → Verification Pending → Verified
       └─ choose Membership → (future Payment) → entitlements
            └─ create Draft listing (Media V2 + Content Standard)
                 └─ Pending Review → Approved → Published + Available
                      ├─ Co-Agent / Commission projected
                      ├─ Optional Featured / Ads
                      ├─ Leads across channels → Closed
                      │     └─ Commission locked → invoiced → paid
                      └─ Reserved → Sold/Rented | Expired | Hidden | Archived
```

Property Factory path: Import → ownership `imported` → Platform Verified → Published without agent membership burn → later Claim → Agency/Owner/Developer stewardship.

---

## 13. Compatibility matrix

| Concern        | Business Foundation                    | Architecture V2                  | Content / Factory                |
| -------------- | -------------------------------------- | -------------------------------- | -------------------------------- |
| Roles          | Expanded Guest/Buyer/Tenant/Agency/Mod | user_roles + orgs + admin_users  | —                                |
| Listing states | Full lifecycle names                   | workflow + status + availability | Review L0–L4                     |
| Commission     | Modes + workflow                       | listing_commissions              | Field dictionary private default |
| Ads            | Product catalog                        | ad_* + featured_placements       | Advertisement entity             |
| Leads          | Rich lifecycle + channels              | inquiries extension              | —                                |
| Billing        | Provider list + refunds                | billing_*                        | —                                |
| Media          | V2 rich types                          | media table roles                | MEDIA V1 baselines               |
| Ownership      | Classes + precedence                   | participants                     | Provenance/source                |

**Conflict rule:** Specialty child standard wins within its domain; Architecture wins on table naming when implementation starts; Content Standard wins on field truthfulness.

---

## 14. Explicit non-goals (Phase 6.5)

- No application code, migrations, RLS, or checkout
- No UI or route changes
- No live Stripe/Omise/LINE SDK wiring
- No redesign of homepage/listing shells
- No change to Property Factory running pipelines beyond documented ownership rules

---

## 15. Implementation readiness (future)

When build starts, follow Architecture V2 §12 migration sequencing, but **configure entitlements, enums, and reason codes from this Business Foundation first**. Content Standard V1.0 remains the catalog contract; Business Foundation V1.0 is the marketplace rules contract.

---

## 16. Versioning

| Change type                       | Version                               |
| --------------------------------- | ------------------------------------- |
| Additive products/fields          | V1.x                                  |
| Rename plan codes / remove states | V2 proposal                           |
| Child doc bump                    | Reflect in this Master changelog note |

---

## 17. Adoption statement

> **Business Foundation V1.0** is the permanent business specification for GoThailandHome.  
> Marketplace, membership, ads, leads, verification, commission, payments, rich media, and data ownership must conform.  
> Phase 6.5 delivers **architecture and business rules only** — stop at documentation.

---

_End of Business Foundation V1.0_
