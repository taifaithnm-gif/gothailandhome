# Commission Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 (planning only)  
**Compatible with:** PLATFORM_ARCHITECTURE_V2 §7.5, §8.5 · PROPERTY_DATA_STANDARD commission fields

---

## 1. Purpose

Define how listing exclusivity and commission are declared, split, and progressed — without implementing payouts in this phase.

**Money:** THB. Rates are gross buyer/seller-side as disclosed per deal side (Thailand practice varies by segment — disclosure required).

---

## 2. Listing mandate types

| Type             | Code               | Meaning                                           |
| ---------------- | ------------------ | ------------------------------------------------- |
| **Exclusive**    | `exclusive`        | Single primary agent/agency authorized for period |
| **Open Listing** | `open`             | Multiple agents may market; seller may also sell  |
| **Co-Agent**     | `co_agent_enabled` | Flag: primary accepts cooperating agents          |

Exclusive and Open are **mandate** modes. Co-Agent is an **overlay** (available on both, more common on Open/Exclusive with consent).

| Field                                   | Req               |
| --------------------------------------- | ----------------- |
| `mandate_type`                          | exclusive \| open |
| `mandate_starts_at` / `mandate_ends_at` | C for exclusive   |
| `co_agent_allowed`                      | bool              |
| `exclusivity_documentation_url`         | optional proof    |

---

## 3. Commission offer modes

| Mode                | Code         | Meaning                                                            |
| ------------------- | ------------ | ------------------------------------------------------------------ |
| **Full Commission** | `full`       | Offering side pays full advertised rate to procuring cause         |
| **Half Commission** | `half`       | Offering cooperates at half of total (typical co-broke short-hand) |
| **Negotiable**      | `negotiable` | Rate/split to be agreed; show band or “negotiable” publicly        |
| **Fixed Amount**    | `fixed`      | THB amount instead of %                                            |
| **Percent**         | `percent`    | `commission_pct` of closed price/rent contract value               |

Public display respects `commission_visibility`: `private` \| `partner` \| `public` (PROPERTY_DATA_STANDARD). Default **private** for browsing SEO pages; partner portal sees offer mode.

---

## 4. Commission % and amounts

| Field                   | Validation                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| `gross_rate_percent`    | 0–100; typical sale 2–5% segment-dependent — not enforced as law |
| `commission_amount_thb` | ≥0 if fixed                                                      |
| `commission_basis`      | `sale_price` \| `annual_rent` \| `monthly_rent` \| `other`       |
| `offer_mode`            | full \| half \| negotiable \| custom                             |
| `currency`              | THB                                                              |

**Half Commission interpretation (platform default):** if gross listed 3% full, half co-broke = 1.5% to cooperating agent unless split table overrides.

---

## 5. Commission split

Architecture: `listing_commissions` + `commission_splits`.

| Rule          | Spec                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------- |
| Split sum     | Accepted participants’ `split_percent` must sum to 100% when status `locked`                |
| Beneficiaries | Users and/or orgs                                                                           |
| Primary       | Default share from mandate; co-agents get agreed %                                          |
| Platform fee  | Optional future `platform_fee_percent` — separate line, not from agent disclosure confusion |
| Dispute       | `disputed` split status freezes payout progression                                          |

Example:

```text
Gross 3% of sale
Primary agency 60% · Co-agent 40%
→ amounts filled when deal.closed_price_thb known
```

---

## 6. Co-Agent workflow (business)

1. Primary (or Owner/Developer rep) enables `co_agent_allowed`.
2. Invite co-agent with proposed `split_percent`.
3. Invitee accepts / declines.
4. On accept → `listing_participants` + draft `commission_splits`.
5. Lead routing may include co-agents per Agency rules.
6. On deal reserved/closed → commission moves `projected` → `locked`.
7. Invoice/paid states are billing-phase (PAYMENT_STANDARD).

Exclusive mandate: inviting outside co-agents still allowed if mandating party consents.

---

## 7. Commission lifecycle (workflow)

```text
projected  →  locked  →  invoiced  →  paid
                ↓
              void / disputed
```

| Status      | Meaning                         |
| ----------- | ------------------------------- |
| `projected` | Listed offer; deal not closed   |
| `locked`    | Deal terms fixed; splits frozen |
| `invoiced`  | Billing document issued         |
| `paid`      | Settled                         |
| `void`      | Cancelled deal / mandate end    |
| `disputed`  | Hold                            |

Triggers align with Architecture deals: `reserved` \| `closed` \| `cancelled`.

---

## 8. Visibility & compliance

- Never invent commission on imported Property Factory listings — default `unknown` / private.
- Misleading “0% always” marketing forbidden without policy review.
- Half/Full labels must match numeric fields when both present.
- Moderator may hide public commission badges if abusive.

---

## 9. Role rights

| Role           | Set commission on listing    | Lock on deal                     | Mark paid |
| -------------- | ---------------------------- | -------------------------------- | --------- |
| Agent / Agency | Y (own)                      | Y with counterparty ack (future) | N         |
| Owner          | Y on own                     | with agent ack                   | N         |
| Developer      | Y on project policy defaults | —                                | N         |
| Admin          | Y                            | Y                                | Y         |

---

_End of Commission Standard V1.0_
