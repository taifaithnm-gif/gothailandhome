# Platform Architecture V2

**Status:** Architecture only — do not implement in this phase  
**Product shape:** Thailand Property Marketplace  
**Constraint:** Extend current GoThailandHome stack; do **not** rewrite existing public pages  
**Compatibility:** Additive Supabase migrations only; preserve existing tables, enums, RLS patterns, and import pipeline

---

## 1. Purpose

Transform GoThailandHome from a content + listing site into a multi-sided marketplace where:

- Customers discover and enquire on properties
- Owners and developers publish inventory
- Agents list, co-operate, and earn commission
- Admins approve inventory, manage memberships, ads, and disputes
- Billing, payments, AI recommendations, and CRM arrive later behind stable interfaces

Phase 5 UI/geography work (if present in the repo) is treated as optional discovery surface. Architecture V2 does not depend on rewriting those pages; marketplace behavior attaches through new tables, roles, and workflows.

---

## 2. Non-goals (this document)

- No feature implementation
- No page redesign or route rewrite
- No payment provider wiring
- No AI model or CRM vendor integration
- No public-login UX build-out beyond the designed contract
- No destructive schema changes to Phase 3–4 core tables

---

## 3. Compatibility principles

1. **Additive only** — new tables / enums / nullable columns; no renames or drops of production columns without a later migration plan.
2. **Auth remains Supabase Auth** — `auth.users` is the identity source of truth.
3. **Existing entities stay** — `properties`, `property_projects`, `developers`, `agents`, `locations`, `cities`, `districts`, `inquiries`, `admin_users`, `property_media`, `property_features` remain.
4. **Bridge, don’t replace** — marketplace roles map onto existing rows via FKs (`agents.user_id`, `developers.owner_user_id`, etc.).
5. **Public read path unchanged** — published properties continue to use `status = 'published'` (+ existing verified-listing filters where already present).
6. **Import pipeline stays** — `pipelines/condo-import` continues for official/portal ingestion; marketplace publishing is a parallel write path with approval.
7. **Locale surface stays** — `/[lang]/…` routes remain; marketplace dashboards attach under new paths later (`/account`, `/agent`, `/owner`, `/developer`, `/admin` extensions).

---

## 4. Current foundation (keep)

| Layer      | Keep as-is                                                   |
| ---------- | ------------------------------------------------------------ |
| Auth       | Supabase Auth; `admin_users` gate for staff                  |
| Catalog    | `properties`, media, features, projects, developers, agents  |
| Geography  | `locations`; optional `cities` / `districts`                 |
| Provenance | `source`, `listing_url`, `source_updated_at`, `external_ref` |
| Leads (v1) | `inquiries` + UTM / `gclid` / `fbclid`                       |
| Storage    | `property-media` bucket                                      |
| Public SEO | Existing property / project / locale pages                   |

---

## 5. Marketplace domain model

```text
auth.users
   │
   ├─ profiles (1:1)
   ├─ user_roles (1:N) ── role: admin | agent | owner | developer | customer
   │
   ├─ organizations (optional company shell)
   │     ├─ organization_members
   │     └─ linked developer / agency brand
   │
   ├─ agent_profiles ── extends public.agents
   ├─ owner_profiles
   ├─ developer_accounts ── links public.developers
   │
   └─ customers (default role; enquiry + favorites later)

properties (existing)
   ├─ listing_lifecycle (approval / publish / unpublish)
   ├─ listing_owners (owner / developer attribution)
   ├─ listing_agents (primary + co-agents)
   ├─ commissions / commission_splits
   ├─ featured_placements / ad_campaigns
   └─ leads (extends inquiries)
```

---

## 6. Multi-role users

### 6.1 Roles

| Role          | Intent                                                               |
| ------------- | -------------------------------------------------------------------- |
| **Admin**     | Platform operations, approval, billing overrides, dispute, analytics |
| **Agent**     | Publish/manage listings, co-agent splits, receive leads, membership  |
| **Owner**     | Publish own units, appoint agents, approve co-agent invites          |
| **Developer** | Manage project catalog, appoint agencies, bulk inventory             |
| **Customer**  | Register, enquire, save preferences; no publish rights               |

Users may hold **multiple roles** (e.g. agent + owner). Effective permissions = union of granted roles, with admin superseding.

### 6.2 Compatibility with `admin_users`

- Keep `admin_users` as the fast staff ACL used by current `/admin`.
- V2 adds `user_roles` with `role = 'admin'` synced to `admin_users` (trigger or application service) so existing admin checks keep working during migration.

### 6.3 Compatibility with `agents` / `developers`

- `agents` remains the public-facing agent card table.
- Add nullable `agents.user_id → auth.users`.
- `developers` remains public developer SEO entity.
- Add nullable `developers.account_user_id` or join table `developer_accounts` for the marketplace operator of that brand.

---

## 7. Proposed database extensions

All names are proposed; implementations land in future migrations only.

### 7.1 Identity & roles

```text
profiles
  user_id PK → auth.users
  display_name, phone, locale, avatar_url
  account_status: pending | active | suspended
  created_at, updated_at

user_roles
  id PK
  user_id → auth.users
  role: admin | agent | owner | developer | customer
  unique (user_id, role)

role_applications
  id PK
  user_id → auth.users
  requested_role: agent | owner | developer
  payload jsonb          -- license, company docs refs
  status: submitted | approved | rejected
  reviewed_by, reviewed_at, notes
```

### 7.2 Organizations (agency / developer company)

```text
organizations
  id, slug, name_*, type: agency | developer_company | other
  tax_id, website, logo_url, status

organization_members
  organization_id, user_id, member_role: owner | manager | staff
  unique (organization_id, user_id)
```

### 7.3 Publishing & approval (extends `properties`)

**Do not remove** existing `property_status` (`draft` | `published`).  
**Extend** via new enum + columns:

```text
-- new enum (additive)
listing_workflow_status:
  draft | submitted | in_review | approved | rejected
  | published | unpublished | archived

alter properties
  add workflow_status listing_workflow_status default 'draft'
  add submitted_at, reviewed_at, reviewed_by
  add rejection_reason text
  add publisher_user_id → auth.users
  add owner_user_id → auth.users          -- end owner when applicable
  add organization_id → organizations
  -- keep status for public visibility: only 'published' is public
```

Rule: public SEO pages continue to read `status = 'published'`.  
Workflow gate: only `approved` → system/admin/agent action may set `status = 'published'`.

```text
listing_reviews
  id, property_id, reviewer_user_id
  action: submit | approve | reject | request_changes | unpublish
  notes, created_at
```

### 7.4 Attribution & co-agent cooperation

```text
listing_participants
  id PK
  property_id → properties
  user_id → auth.users
  participant_role: primary_agent | co_agent | owner | developer_rep
  share_percent numeric(5,2)     -- 0–100; optional until commission locks
  invited_by, invite_status: pending | accepted | declined | revoked
  unique (property_id, user_id, participant_role)
```

Co-agent workflow:

1. Primary agent (or owner) invites co-agent.
2. Invitee accepts → `accepted`.
3. Commission split rows created/updated from accepted shares.
4. Leads can be assigned to primary or routed by split rules.

Keep legacy `properties.agent_id` as **denormalized primary agent** for current UI; sync from `listing_participants` where `participant_role = primary_agent`.

### 7.5 Commission model

```text
commission_policies
  id, name, listing_type, default_rate_percent
  payable_on: deal_closed | lead_qualified | custom
  active

listing_commissions
  id, property_id
  policy_id
  gross_rate_percent
  currency default 'THB'
  status: projected | locked | invoiced | paid | void

commission_splits
  id, listing_commission_id
  beneficiary_user_id
  beneficiary_org_id nullable
  split_percent
  amount_thb nullable          -- filled when deal amount known
  status: open | payable | paid | disputed
```

Deal event (future):

```text
deals
  id, property_id, inquiry_id nullable
  closed_price_thb, closed_at, closed_by
  status: reserved | closed | cancelled
```

### 7.6 Advertisement system

```text
ad_products
  id, code: homepage_banner | project_spotlight | search_sponsored
  name_*, billing_model: cpm | cpc | flat_period
  price_thb, duration_days nullable

ad_campaigns
  id, advertiser_user_id / organization_id
  product_id, status: draft | pending_payment | active | paused | ended
  targeting jsonb   -- city_id, district_id, listing_type
  start_at, end_at, budget_thb

ad_creatives
  id, campaign_id, asset_url, headline_*, cta_url
  moderation_status: pending | approved | rejected

ad_impressions / ad_clicks   -- append-only analytics facts
  id, campaign_id, creative_id, occurred_at, meta jsonb
```

Serving: read-only injection points on existing homepage/listing shells later; architecture forbids redesigning those shells now.

### 7.7 Featured listings

Current `properties.featured boolean` remains for backward compatibility.

```text
featured_placements
  id, property_id
  channel: home | city | search | project
  starts_at, ends_at
  source: manual_admin | membership_perk | paid_boost
  status: scheduled | active | expired | cancelled
  unique active window enforced in app or exclusion constraint
```

Projection job / trigger: `properties.featured = true` while any `active` home/search placement exists.

### 7.8 Membership plans

```text
membership_plans
  id, code, name_*
  audience_role: agent | owner | developer
  price_thb, interval: month | year
  entitlements jsonb
    -- max_active_listings, featured_credits, co_agent_slots,
    -- ad_credits, lead_priority, analytics_tier

membership_subscriptions
  id, user_id / organization_id
  plan_id, status: trialing | active | past_due | cancelled | expired
  current_period_start, current_period_end
  external_customer_id nullable   -- future payment provider
  external_subscription_id nullable
```

### 7.9 Billing architecture (provider-agnostic)

```text
billing_customers
  id, user_id / organization_id
  provider: stripe | omise | manual | none
  provider_customer_id

billing_invoices
  id, customer_id
  purpose: membership | featured_boost | ad_campaign | commission_fee
  amount_thb, currency, status: draft | open | paid | void | uncollectible
  issued_at, due_at, paid_at
  provider_invoice_id nullable

billing_payments
  id, invoice_id
  provider, provider_payment_id
  amount_thb, status: pending | succeeded | failed | refunded
  raw_payload jsonb              -- webhook mirror

billing_webhook_events
  id, provider, event_id unique, payload jsonb, processed_at
```

Future payment integration plugs into `billing_*` only; domain features never call Stripe/Omise APIs directly.

### 7.10 Lead management

Extend existing `inquiries` (do not replace):

```text
alter inquiries
  add lead_status: new | qualified | assigned | contacted | won | lost | spam
  add assigned_to_user_id → auth.users
  add assigned_org_id → organizations
  add score numeric
  add source_channel: web_form | phone | line | ads | import | other
  -- keep existing status inquiry_status for backward compat OR map 1:1

lead_events
  id, inquiry_id, actor_user_id
  event_type: created | assigned | note | status_change | handoff
  payload jsonb, created_at

lead_assignments_history
  id, inquiry_id, from_user_id, to_user_id, reason, created_at
```

Routing rules (config table):

```text
lead_routing_rules
  id, priority
  match jsonb     -- city, listing_type, project_id
  strategy: primary_agent | round_robin_org | owner_first
  active
```

### 7.11 Analytics

```text
analytics_events          -- immutable product telemetry
  id, occurred_at
  actor_user_id nullable
  session_id, locale
  event_name: page_view | listing_view | search | lead_submit | ad_impression | ad_click
  entity_type, entity_id
  props jsonb

analytics_daily_rollups   -- optional materialized summaries
  day, metric, dimensions jsonb, value numeric
```

Admin dashboards read rollups; raw events feed future warehouse export.

### 7.12 Future AI recommendation (interface only)

```text
recommendation_profiles
  user_id, prefs jsonb, updated_at

recommendation_snapshots
  id, user_id, model_version, items jsonb, generated_at

recommendation_feedback
  id, snapshot_id, property_id, action: impression | click | dismiss | enquire
```

No model runtime in V2. Jobs later write snapshots; UI later consumes read API.

### 7.13 Future CRM integration (interface only)

```text
crm_connections
  id, organization_id, provider: hubspot | salesforce | custom
  status, credentials_ref, sync_cursor

crm_sync_outbox
  id, entity_type: lead | deal | contact
  entity_id, payload jsonb, status: pending | sent | failed
```

Leads remain owned by GoThailandHome; CRM is outbound/inbound sync, not source of truth.

---

## 8. Workflows

### 8.1 User registration

```text
Customer self-serve
  Auth sign-up → profiles row → user_roles(customer)

Elevated roles
  Auth sign-up/login
  → role_applications(submitted)
  → Admin review
  → approve: user_roles + agent/developer/owner profile bridge
  → reject: application closed with notes
```

### 8.2 Property publishing

```text
Publisher (agent | owner | developer)
  create/edit property (status=draft, workflow=draft)
  attach media / features / project link
  submit → workflow=submitted
```

Import pipeline path remains:

```text
condo-import → properties with provenance fields
  → may auto-set workflow=approved + status=published
     for trusted sources under admin policy
```

### 8.3 Property approval

```text
Admin (or trusted reviewer role)
  queue: workflow in (submitted, in_review)
  approve → workflow=approved → status=published, published_at=now()
  reject → workflow=rejected, rejection_reason set, status stays draft
  request_changes → workflow=draft (or in_review) + notes in listing_reviews
```

Public pages continue to show only `status=published`.

### 8.4 Co-agent cooperation

```text
Invite → pending participant
Accept → accepted + commission_splits refresh
Revoke → revoked; recalculate splits; open leads reassigned by rule
```

### 8.5 Commission lifecycle

```text
Listing published → projected commission from policy
Deal closed → lock commission + compute split amounts
Invoice platform fee (optional) via billing_invoices
Mark splits payable → paid
```

### 8.6 Ads & featured

```text
Purchase / membership credit
  → campaign or featured_placement pending_payment
  → billing payment succeeded
  → active within schedule
  → impressions/clicks logged
  → ended on schedule or pause
```

### 8.7 Membership & billing

```text
Choose plan → subscription trialing/active
Entitlements enforced at publish / boost / invite time
Invoice per period → payment webhook → active / past_due / cancelled
Grace policy owned by billing service, not UI
```

### 8.8 Lead management

```text
Enquiry form (existing) → inquiries insert
  → lead_events(created)
  → routing rule assigns assigned_to_user_id
  → agent/owner notified (future channel)
  → status transitions logged
  → optional CRM outbox enqueue
```

---

## 9. Authorization model (RLS direction)

Keep current public-read policies for published catalog.

Additive patterns:

| Subject   | Write scope                                              |
| --------- | -------------------------------------------------------- |
| Customer  | own profile; create inquiries                            |
| Agent     | own listings as publisher/participant; assigned leads    |
| Owner     | own properties; approve co-agent invites on own listings |
| Developer | org projects + project-linked listings                   |
| Admin     | all rows; workflows; billing overrides                   |

`is_admin()` remains; extend with `has_role(uid, role)` SQL helper.

---

## 10. API / service boundaries (future)

| Service          | Responsibility                                |
| ---------------- | --------------------------------------------- |
| Catalog read     | Existing Next.js data layer (unchanged pages) |
| Publishing API   | draft/submit listings, media upload           |
| Moderation API   | approve/reject queue                          |
| Lead API         | assign, note, status                          |
| Billing API      | plans, checkout session create, webhooks      |
| Ads API          | campaign CRUD, serve candidates               |
| Analytics ingest | event collector (edge-friendly)               |
| Recommendations  | read snapshots only                           |
| CRM connector    | outbox worker                                 |

Payments, AI, and CRM are **adapters** behind these APIs.

---

## 11. Page strategy (no rewrite)

| Existing surface                              | V2 attachment                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| Home / city / project / property public pages | Keep layout; later inject featured/ads slots via data props only          |
| `/admin`                                      | Extend with approval queue, memberships, ads moderation                   |
| New (later)                                   | `/account`, `/agent`, `/owner`, `/developer` dashboards — additive routes |

**Do not** rebuild existing public pages to unlock marketplace. New workflows ship as new routes + APIs.

---

## 12. Migration sequencing (when implementation starts)

1. `profiles` + `user_roles` + sync with `admin_users`
2. `listing_workflow_status` columns + `listing_reviews`
3. `listing_participants` + commission tables
4. Lead status columns + `lead_events`
5. Membership + billing tables (no provider)
6. Featured placements + ad tables
7. Analytics events
8. AI / CRM interface tables last

Each step ships with RLS + backfill defaults so current public site keeps working.

---

## 13. Open decisions (defer until implementation)

- Single-currency THB only vs multi-currency
- Whether owners can publish without agent
- License verification KYC vendor
- Commission VAT handling
- Soft vs hard entitlement enforcement on free tier

---

## 14. Summary

Architecture V2 extends GoThailandHome into a Thailand Property Marketplace by adding roles, registration/application, publish–approve workflows, co-agent splits, commissions, ads, featured placements, memberships, billing, lead ops, and analytics — while preserving the current Supabase catalog, provenance, admin gate, import pipeline, and public page contracts. Payments, AI recommendations, and CRM are designed as replaceable adapters, not core schema rewrites.
