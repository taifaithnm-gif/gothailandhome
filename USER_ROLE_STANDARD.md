# User Role Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 Business Foundation (planning only)  
**Compatible with:** [PLATFORM_ARCHITECTURE_V2.md](./PLATFORM_ARCHITECTURE_V2.md) §6–7  
**Status:** Permanent business role contract — no implementation in this phase

---

## 1. Purpose

Define every human/org role that may interact with GoThailandHome before marketplace build. Permissions here are **business rules**; technical RLS maps later from this document.

**Principle:** Effective permissions = union of assigned roles; **Admin** supersedes; **Moderator** is staff subset. Multiple roles allowed (e.g. Agent + Owner).

**Architecture mapping**

| This standard  | Architecture V2                              |
| -------------- | -------------------------------------------- |
| Guest          | Unauthenticated                              |
| Buyer / Tenant | `customer` (intent subtype)                  |
| Agent          | `agent` + `agent_profiles`                   |
| Agency         | `organizations` type `agency` + members      |
| Owner          | `owner` + `owner_profiles`                   |
| Developer      | `developer` + `developer_accounts`           |
| Admin          | `admin` + existing `admin_users`             |
| Moderator      | Staff reviewer; subset of admin capabilities |

---

## 2. Role catalog

### 2.1 Guest

| Dimension                      | Rule                                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Who**                        | Unauthenticated visitor                                                                                                                                        |
| **Permissions**                | Browse public pages; search/filter published listings; view project/developer/area hubs; submit enquiry forms (with CAPTCHA/rate limits); no account dashboard |
| **Responsibilities**           | Comply with ToS/privacy; no scraping abuse                                                                                                                     |
| **Publishing rights**          | None                                                                                                                                                           |
| **Approval rights**            | None                                                                                                                                                           |
| **Membership eligibility**     | None until registration                                                                                                                                        |
| **Future billing eligibility** | None (may later pay one-off services only after account)                                                                                                       |

---

### 2.2 Buyer

| Dimension                      | Rule                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Who**                        | Registered user seeking to **purchase** property (customer intent = buy)                                            |
| **Permissions**                | All Guest browse + save favorites; manage enquiries; update profile; optional saved searches; view own lead history |
| **Responsibilities**           | Accurate contact info; good-faith enquiries                                                                         |
| **Publishing rights**          | None                                                                                                                |
| **Approval rights**            | None                                                                                                                |
| **Membership eligibility**     | Free customer tier only (no Agent/Agency/Developer plans)                                                           |
| **Future billing eligibility** | Optional premium alerts / concierge (future products); not listing ads                                              |

Maps to Architecture V2 `customer` with `intent_tags` including `buyer`.

---

### 2.3 Tenant

| Dimension                      | Rule                                                      |
| ------------------------------ | --------------------------------------------------------- |
| **Who**                        | Registered user seeking to **rent**                       |
| **Permissions**                | Same as Buyer for rent surfaces + rent-intent preferences |
| **Responsibilities**           | Same as Buyer                                             |
| **Publishing rights**          | None                                                      |
| **Approval rights**            | None                                                      |
| **Membership eligibility**     | Free customer tier only                                   |
| **Future billing eligibility** | Same as Buyer (consumer products only)                    |

Maps to Architecture V2 `customer` with intent `tenant`. A user may be both Buyer and Tenant.

---

### 2.4 Agent

| Dimension                      | Rule                                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Who**                        | Licensed or practicing individual broker; public `agents` card when published                                                                                                                                 |
| **Permissions**                | Create/edit own drafts; submit for review; manage accepted co-agent invites; receive/assign leads on participating listings; view agent analytics (tiered); apply co-agent splits; consume membership credits |
| **Responsibilities**           | Truthful listings; source/provenance; respond to leads per SLA; commission disclosure honesty                                                                                                                 |
| **Publishing rights**          | Publish **only after** approval workflow → `published`; scoped to own + org-authorized listings                                                                                                               |
| **Approval rights**            | None on platform-wide content; may approve/decline **co-agent invites** on own primary listings                                                                                                               |
| **Membership eligibility**     | Free, Agent Pro (see MEMBERSHIP_STANDARD)                                                                                                                                                                     |
| **Future billing eligibility** | Memberships, featured boosts, ad campaigns, lead packs                                                                                                                                                        |

Requires role application approval (Architecture `role_applications`).

---

### 2.5 Agency

| Dimension                      | Rule                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Who**                        | Organization (`organizations.type = agency`); acts via members (`owner` \| `manager` \| `staff`)                               |
| **Permissions**                | Org-scoped listing pool; seat management; org lead inbox; billing account; brand profile; bulk invite agents; agency analytics |
| **Responsibilities**           | Supervise member listings; compliance; invoice payment                                                                         |
| **Publishing rights**          | Via members under org entitlement limits; listings attributed to org + primary agent                                           |
| **Approval rights**            | Org **manager/owner** may submit/withdraw org listings; **not** platform approve. May accept co-agent at org policy            |
| **Membership eligibility**     | Agency Pro, Enterprise                                                                                                         |
| **Future billing eligibility** | Org subscriptions, ads, featured credits pools, invoices                                                                       |

Agency is not a `user_roles` enum alone — it is an **organization** with members who also hold `agent` (or staff) roles.

---

### 2.6 Owner

| Dimension                      | Rule                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Who**                        | Individual or corporate title holder of a unit                                                                               |
| **Permissions**                | Create own-unit drafts; appoint/remove agents; approve co-agent on owned units; view leads on owned units; limited analytics |
| **Responsibilities**           | Ownership honesty; document upload for verification; no fake “owner” claims                                                  |
| **Publishing rights**          | Own units only; gate = verification + content review                                                                         |
| **Approval rights**            | Appoint agent relationships; accept/reject co-agent on owned inventory; **not** platform moderation                          |
| **Membership eligibility**     | Free owner tools; optional light paid boosts (future); not Agent Pro unless also Agent                                       |
| **Future billing eligibility** | Optional featured boost for own listings; verification fees (if productized)                                                 |

---

### 2.7 Developer

| Dimension                      | Rule                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Who**                        | Marketplace operator of a `developers` brand (`developer_accounts`)                                                                                                                  |
| **Permissions**                | Manage linked projects (catalog fields per PROJECT_STANDARD); bulk unit drafts; appoint agencies; project media hub; developer analytics; claim official project data ownership tier |
| **Responsibilities**           | Official data accuracy; update completion/progress with sources; honor appointments                                                                                                  |
| **Publishing rights**          | Projects + inventory under brand; L2+ content gates; may mark **Official Developer Data** (DATA_OWNERSHIP)                                                                           |
| **Approval rights**            | Approve agency/agent listing claims against their projects (optional claim workflow); **not** global platform approve                                                                |
| **Membership eligibility**     | Developer, Enterprise plans                                                                                                                                                          |
| **Future billing eligibility** | Developer/Enterprise subs, project/developer featured ads, brochure boosts                                                                                                           |

---

### 2.8 Admin

| Dimension                      | Rule                                                                                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Who**                        | Platform staff; synced with `admin_users`                                                                                                                                                                |
| **Permissions**                | Full operational access: approve/reject content; verify entities; suspend users; override publish; billing overrides; disputes; analytics; impersonation flags (audited); config membership entitlements |
| **Responsibilities**           | Fair moderation; audit trail; escalate legal/ToS                                                                                                                                                         |
| **Publishing rights**          | May publish/unpublish any entity for ops                                                                                                                                                                 |
| **Approval rights**            | **Full** — content, verification, ads creatives, role applications, refunds (policy)                                                                                                                     |
| **Membership eligibility**     | N/A (staff)                                                                                                                                                                                              |
| **Future billing eligibility** | N/A — may issue comps/credits                                                                                                                                                                            |

---

### 2.9 Moderator

| Dimension                      | Rule                                                                                                                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Who**                        | Staff reviewer without full Admin powers                                                                                                                                                                                                           |
| **Permissions**                | Content review queues; verification document check; ad creative moderation; spam lead marks; request changes; approve/reject **listings/projects within policy**; cannot change billing plans or grant Enterprise; cannot delete users permanently |
| **Responsibilities**           | Apply CONTENT_REVIEW + VERIFICATION standards; document reason codes                                                                                                                                                                               |
| **Publishing rights**          | May unpublish for policy breach; may not create commercial ads for self                                                                                                                                                                            |
| **Approval rights**            | Content + verification + ad creatives; **not** membership price overrides or payout disputes (escalate to Admin)                                                                                                                                   |
| **Membership eligibility**     | N/A                                                                                                                                                                                                                                                |
| **Future billing eligibility** | N/A                                                                                                                                                                                                                                                |

Store as `user_roles.role = moderator` or Admin with capability flags — implementation choice deferred (Architecture open decision).

---

## 3. Permission matrix (summary)

| Capability             | Guest | Buyer | Tenant | Agent | Agency* | Owner | Developer | Mod     | Admin    |
| ---------------------- | ----- | ----- | ------ | ----- | ------- | ----- | --------- | ------- | -------- |
| Browse public          | Y     | Y     | Y      | Y     | Y       | Y     | Y         | Y       | Y        |
| Enquire                | Y†    | Y     | Y      | Y     | Y       | Y     | Y         | Y       | Y        |
| Favorites              | N     | Y     | Y      | Y     | Y       | Y     | Y         | Y       | Y        |
| Draft listing          | N     | N     | N      | Y     | Y       | Y     | Y         | —       | Y        |
| Submit listing         | N     | N     | N      | Y     | Y       | Y     | Y         | —       | Y        |
| Platform approve       | N     | N     | N      | N     | N       | N     | N         | Y       | Y        |
| Co-agent invite        | N     | N     | N      | Y     | Y       | Y     | limited   | —       | Y        |
| Org billing            | N     | N     | N      | N     | Y       | N     | Y         | N       | override |
| Official project claim | N     | N     | N      | N     | N       | N     | Y         | review  | Y        |
| Suspend user           | N     | N     | N      | N     | N       | N     | N         | limited | Y        |

\*Agency via member roles. †Rate-limited.

---

## 4. Publishing & approval rights (normative)

| Role                                      | Can submit   | Can approve platform-wide | Can publish after approval   |
| ----------------------------------------- | ------------ | ------------------------- | ---------------------------- |
| Guest / Buyer / Tenant                    | N            | N                         | N                            |
| Agent / Agency member / Owner / Developer | Y (scoped)   | N                         | Y (own scope + entitlements) |
| Moderator                                 | N (ops only) | Y (content policy)        | Unpublish/policy publish     |
| Admin                                     | Y            | Y                         | Y                            |

Public pages continue to require Architecture rule: workflow **approved** + visibility **published**.

---

## 5. Membership & billing eligibility (pointer)

Full plan matrix → [MEMBERSHIP_STANDARD.md](./MEMBERSHIP_STANDARD.md) · [PAYMENT_STANDARD.md](./PAYMENT_STANDARD.md)

| Role                | Eligible plans                   |
| ------------------- | -------------------------------- |
| Buyer / Tenant      | Free (customer)                  |
| Agent               | Free, Agent Pro                  |
| Agency              | Agency Pro, Enterprise           |
| Owner               | Free (+ à la carte boosts later) |
| Developer           | Developer, Enterprise            |
| Guest / Mod / Admin | None                             |

---

## 6. Role acquisition workflow (business)

1. Register → default Buyer/Tenant-capable customer profile.
2. Apply for Agent / Owner / Developer via `role_applications`.
3. Moderator reviews documents → Approved / Rejected.
4. Agency: create org → invite members → seat limits from membership.
5. Suspension removes publishing + lead receive; browse may remain.

---

## 7. Non-goals

- No UI for role switcher in this phase
- No RLS SQL
- No change to current `/admin` behavior until implementation phase

---

_End of User Role Standard V1.0_
