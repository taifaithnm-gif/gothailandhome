# Phase 2 — API Impact

**Status:** Planning impact analysis only
**Does NOT authorize:** creating endpoints, changing existing APIs, or deploy
**Baseline:** Phase 1 Next.js server actions / Supabase reads / lead forms
**Date:** 2026-07-21

---

## 1. Purpose

Inventory **planned** API / server-action surfaces for Phase 2 so contracts can be designed before coding. No endpoints are created by this document.

---

## 2. Phase 1 API posture (baseline)

- Public pages: server components + data loaders for catalog
- Mutations: server actions (favorites device-side; marketplace/project leads; admin property CRUD)
- Auth: admin-focused; public account auth limited
- No public REST platform API versioned for partners

---

## 3. Design principles for Phase 2 APIs

1. Prefer **server actions / BFF** for first-party web; introduce versioned HTTP APIs only when partners/CRM need them.
2. AuthZ on every mutating route; deny-by-default.
3. Idempotent writes where retries expected (CRM webhooks, notifications).
4. Rate limits on lead, auth, AI, and map tile proxy endpoints.
5. Never expose PII via public cacheable GETs.
6. Feature-flag gated responses for progressive delivery.
7. Stable error envelopes for ops/CRM.

---

## 4. Planned surface catalog

### 4.1 Identity & customer (M1)

| Surface (logical) | Method style | Auth |
| --- | --- | --- |
| `auth.signIn / signOut / session` | action / provider | public |
| `account.getDashboard` | read | customer |
| `account.listSavedItems` | read | customer |
| `account.upsertSavedItem` | write | customer |
| `account.migrateDeviceState` | write | customer |
| `savedSearch.list/create/update/delete` | CRUD | customer |

### 4.2 Leads, notifications, CRM (M2)

| Surface | Style | Auth |
| --- | --- | --- |
| `lead.create` (extend existing forms) | write | public + optional customer |
| `lead.get / list` (ops) | read | staff |
| `lead.updateStatus / assign / note` | write | staff |
| `notification.preferences` | CRUD | customer |
| `notification.enqueue` (internal) | write | system |
| `crm.pushLead / crm.receiveWebhook` | HTTP | service + signature |
| `crm.health` | read | staff |

### 4.3 Acquisition (M3)

| Surface | Style | Auth |
| --- | --- | --- |
| `acquisition.submit` | write | public/partner |
| `acquisition.list / get` | read | staff/partner scoped |
| `acquisition.transition` (review decisions) | write | staff |
| `acquisition.attachEvidence` | write | staff/partner |
| `acquisition.publishLink` | write | staff |

### 4.4 Developer & agent (M4)

| Surface | Style | Auth |
| --- | --- | --- |
| `developerOrg.*` | CRUD scoped | developer role |
| `agent.stewardship.*` | CRUD scoped | agent role |
| `partner.leadInbox` | read/update | partner roles |

### 4.5 Maps (M5)

| Surface | Style | Auth |
| --- | --- | --- |
| `map.searchListings` (bbox + filters) | read | public |
| `map.getPinDetail` | read | public |
| Tile / geocoder proxy (if needed) | read | public + rate limit |

Must bound result sets; no full-catalog dump.

### 4.6 Finance & legal tools (M6)

| Surface | Style | Auth |
| --- | --- | --- |
| `finance.calculateMortgage` | compute | public |
| `finance.saveScenario` (optional) | write | customer |
| `legal.checklist.get/progress` | read/write | public/customer |

Calculators should be deterministic and server-validatable.

### 4.7 AI (M7)

| Surface | Style | Auth |
| --- | --- | --- |
| `ai.recommend` | read/compute | public/customer |
| `ai.invest.session` | write/read | customer preferred |
| `ai.feedback` | write | public/customer |

Strict timeouts; fallback payloads; audit logging.

### 4.8 Analytics (M8)

| Surface | Style | Auth |
| --- | --- | --- |
| Existing client analytics adapter expansion | client | consent |
| Optional `analytics.serverTrack` | write | system |

---

## 5. Breaking-change policy

- Phase 1 public page data loaders remain stable unless versioned.
- Lead form field additions must be backward compatible.
- Partner HTTP APIs (if introduced) use `/api/v1/...` with explicit versioning.
- Deprecations require changelog + Owner notice.

---

## 6. Security impact checklist (before any implement)

| Topic | Requirement |
| --- | --- |
| CSRF | Retain Next.js server action protections |
| Webhook signatures | Mandatory for CRM |
| Secrets | No secrets in client bundles |
| IDOR | Object-level auth tests for account/ops/partner |
| AI abuse | Quotas + auth where costly |
| File evidence upload | Type/size scanning plan |

---

## 7. Observability

- Request IDs on mutating APIs
- Structured logs without raw secrets/PII dumps
- Metrics: latency, error rate, CRM sync lag, AI fallback rate

---

## 8. Explicit non-actions

- Do not create route handlers in this planning task
- Do not modify existing action signatures now
- Do not publish partner API docs externally until M4 security review

Implementation must reference this impact map and `PHASE2_DATA_MODEL_IMPACT.md` in the same change set when coding begins (future task).
