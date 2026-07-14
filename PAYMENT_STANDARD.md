# Payment Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 (planning only)  
**Compatible with:** PLATFORM_ARCHITECTURE_V2 §7.9 provider-agnostic billing

---

## 1. Purpose

Plan future money movement for memberships, ads, featured boosts, and (later) optional fees. **No PSP integration in this phase.** Domain features talk only to `billing_*` abstractions.

---

## 2. Supported providers (future)

| Provider          | Code            | Strength              | Primary use                          |
| ----------------- | --------------- | --------------------- | ------------------------------------ |
| **Stripe**        | `stripe`        | Cards international   | Memberships, invoices                |
| **Omise**         | `omise`         | Thailand-local        | Cards, PromptPay rail                |
| **PromptPay**     | `promptpay`     | QR/instant THB        | One-off invoices via Omise or direct |
| **Bank Transfer** | `bank_transfer` | Manual reconcile      | Enterprise, large ads                |
| **Alipay**        | `alipay`        | CN buyers/advertisers | Future wallet                        |
| **WeChat Pay**    | `wechat_pay`    | CN                    | Future wallet                        |
| Manual / comp     | `manual`        | Ops                   | Credits, refunds, VIP                |

Multiple providers may coexist per `billing_customers.provider`.

---

## 3. Billable products

| Purpose code       | Examples                                     |
| ------------------ | -------------------------------------------- |
| `membership`       | Agent Pro, Agency Pro, Developer, Enterprise |
| `featured_boost`   | Featured placement packs                     |
| `ad_campaign`      | CPC/CPM/flat ads                             |
| `credit_pack`      | Ad/featured credits                          |
| `verification_fee` | Optional future                              |
| `commission_fee`   | Optional platform fee on deals (future)      |

Currency default **THB**. Foreign display FX is cosmetic until multi-currency invoices exist.

---

## 4. Invoices

Architecture `billing_invoices`:

| Status          | Meaning          |
| --------------- | ---------------- |
| `draft`         | Internal         |
| `open`          | Awaiting payment |
| `paid`          | Settled          |
| `void`          | Cancelled        |
| `uncollectible` | Written off      |

Fields: amount_thb, issued_at, due_at, paid_at, line items (plan/campaign refs), buyer org/user, tax line placeholder (VAT policy TBD).

PDF generation = future ops tool.

---

## 5. Subscriptions

Map to `membership_subscriptions`:

| State       | Entitlements                                 |
| ----------- | -------------------------------------------- |
| `trialing`  | Full plan features timed                     |
| `active`    | Paid current                                 |
| `past_due`  | Soft grace (e.g. 7d) then freeze publish/ads |
| `cancelled` | Ends at period end                           |
| `expired`   | Entitlements off                             |

Proration, annual discount, seats add-ons = Enterprise/Agency rules later.

---

## 6. Payments & refunds

`billing_payments.status`: `pending` \| `succeeded` \| `failed` \| `refunded`

| Refund case                                | Policy (business default)                       |
| ------------------------------------------ | ----------------------------------------------- |
| Duplicate charge                           | Full refund                                     |
| Service unused within 24h of sub start     | Pro-rate or full — Admin discretion             |
| Ad campaign rejected creative before start | Full                                            |
| Mid-campaign advertiser cancel             | Unused days credit; no cash unless law requires |
| Chargeback                                 | Suspend entitlements; Admin case                |

Refunds always audited; provider refund id stored.

---

## 7. Channel-specific notes

| Rail                | Notes                                                        |
| ------------------- | ------------------------------------------------------------ |
| PromptPay           | Invoice QR; mark paid on webhook or manual match             |
| Bank Transfer       | Requires slip upload + Moderator/Admin confirm               |
| Alipay / WeChat Pay | KYC/merchant onboarding; CNY settlement → THB books TBD      |
| Stripe / Omise      | Webhooks → `billing_webhook_events` idempotent by `event_id` |

---

## 8. Security & compliance principles

- No raw card data on GoThailandHome servers.
- Providers tokenized only.
- Webhook signatures verified.
- Least privilege: billing admin role separate when possible.
- PDPA: invoice emails minimal PII.

---

## 9. Entitlement provisioning

Payment success → provision membership/credits/campaign `pending_payment`→active.  
Payment fail → no provision.  
Refund/chargeback → revoke or clawback credits; campaigns paused.

---

## 10. Non-goals

No Stripe keys, no checkout UI, no ledger double-entry implementation in Phase 6.5.

---

_End of Payment Standard V1.0_
