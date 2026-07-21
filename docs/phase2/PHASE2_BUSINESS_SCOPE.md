# Phase 2 — Business Scope

**Baseline:** `v1.0.0` LIVE
**Status:** Planning only
**Date:** 2026-07-21

---

## 1. Mission

Define what Phase 2 **will**, **will not**, and **may later** deliver so implementation cannot drift into Phase 1 rewrites, Data Factory execution, or ungoverned AI claims.

---

## 2. In scope (authorized themes for future implementation)

### 2.1 Demand / customer

- Customer accounts and authenticated session model
- Customer dashboard (saved items, inquiries, preferences)
- Saved searches with alert eligibility
- Device → account migration path for favorites / compare (opt-in)
- In-app / email / push-ready notification preferences (channels phased)

### 2.2 Lead & CRM

- Lead inbox and status lifecycle for operations staff
- Assignment, SLA timers, notes, outcome codes
- CRM integration adapters (webhook / API sync) — provider selected at M2 gate
- Notification triggers on lead events and saved-search matches

### 2.3 Supply / acquisition

- Property acquisition workflow: submit → enrich → review → approve/reject → publish/unpublish
- Evidence checklist and source attribution requirements
- Partner-facing list-your-property upgrade from Phase 1 form to tracked cases

### 2.4 Partners

- Developer management: profiles, project linkage, inquiry routing, status
- Agent workflow: listing stewardship, lead handoff, viewing coordination notes
- Role-based access for staff / developer / agent personas

### 2.5 Decision tools

- Interactive maps (listing pins, district overlays, filters)
- Mortgage / finance calculators and scenario tools (disclaimer-bound)
- Legal workflow support: guided checklists, document request lists, disclaimer-bound guidance (not legal advice)

### 2.6 AI assists

- Property recommendation (explainable, evidence-bound)
- Investment analysis assistants (scenario framing + forbidden-claim enforcement)
- Human review gates for any AI-generated customer-visible factual claims about listings

### 2.7 Growth

- Analytics taxonomy expansion (funnel, partner, tool, AI events)
- Multilingual growth plan (locale quality, future locales evaluation)
- SEO for new public surfaces

### 2.8 Cross-cutting engineering

- Feature flags, observability, performance budgets, a11y contracts, i18n parity for customer features
- Production release train for Phase 2 increments

---

## 3. Explicitly out of scope (Phase 2 website platform)

| Exclusion | Rationale |
| --- | --- |
| Full website redesign / brand reboot | Protect `v1.0.0` IA and conversion |
| Payments / escrow / marketplace checkout | Separate commercial phase |
| Autonomous listing publish from scrapers | Data Factory + Owner publish gates |
| Windows01 runtime build in this package | Separate Factory roadmap |
| OCR / embedding infrastructure build | Factory / AI infra track |
| Guaranteed ROI, legal advice, credit decisions | Compliance |
| Replacing Phase 1 static knowledge CMS wholesale | Evolve, don’t rip |
| Changing production env vars / Vercel config via this plan | Ops-only under release plan |
| Schema migrations in this planning task | Impact docs only |

---

## 4. Deferred (candidate Phase 2.x / Phase 3)

- Additional locales beyond EN/ZH/TH (evaluate only in M8)
- Native mobile apps
- Full MLS / multi-country catalog
- Automated underwriting / bank integrations (beyond calculator UX)
- End-to-end e-signature closing
- Marketplace commissions & payouts
- Meta Pixel / Google Ads go-live (may attach under analytics if Owner approves separately)

---

## 5. Personas

| Persona | Phase 2 needs |
| --- | --- |
| **Buyer / renter (customer)** | Dashboard, saves, alerts, map, tools, AI assist |
| **Investor** | Investment analysis assist + disclaimers; saved searches |
| **Developer partner** | Project/listing management, lead routing |
| **Agent** | Stewardship, handoff, viewing notes |
| **Ops / CS staff** | Lead inbox, acquisition review, CRM |
| **Admin** | Roles, publish gates, audit |
| **SEO / content editor** | New surface metadata, guides for tools/legal |

---

## 6. Business outcomes (measurable targets — finalize at M0)

| Outcome | Example KPI (Owner to freeze numbers) |
| --- | --- |
| Lead operationalization | % leads with owner + status within SLA |
| Retention | Returning authenticated sessions / saved-search opens |
| Supply quality | % acquisition cases published with complete evidence |
| Partner activation | Active developers / agents with ≥1 managed entity |
| Decision-tool engagement | Map session depth; calculator completions |
| AI usefulness | Click-through on recommended listings; disclaimer ACK rate |
| SEO | Organic landings on new tool/geo surfaces |

---

## 7. Compliance & trust boundaries

- Investment / legal / finance surfaces inherit Phase 1 packages: `G_INVESTMENT_*`, `G_LEGAL_*`, analytics consent.
- AI outputs must not invent prices, titles, yields, ownership eligibility, or visa outcomes.
- CRM / notification data minimization and retention policy required before go-live.
- Customer auth must not expose admin or partner data.

---

## 8. Dependency on Phase 1

Phase 2 **requires** stable:

- Public discovery routes and listing/project/developer/district model
- Lead intake forms and success/error UX
- Consent-gated analytics bootstrap
- EN/ZH/TH dictionary parity pattern
- Production release discipline (`v1.0.0` tag as rollback pin)

---

## 9. Scope freeze rule

After Owner approval of this package, scope changes require an addendum in `docs/phase2/` and risk re-assessment. Silent scope creep is a release blocker.
