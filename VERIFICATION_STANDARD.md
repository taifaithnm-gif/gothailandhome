# Verification Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 (planning only)  
**Compatible with:** USER_ROLE_STANDARD · CONTENT_REVIEW_STANDARD · DATA_OWNERSHIP_STANDARD · Architecture `role_applications`

---

## 1. Purpose

Define trust badges and verification lifecycle for publishers and listings **before** marketplace implementation. Distinct from listing `is_verified_listing` (content provenance) — this standard covers **identity / organization verification**.

---

## 2. Verification levels

| Level                  | Code                 | Applies to            | Badge meaning                                                                               |
| ---------------------- | -------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| **Official Developer** | `official_developer` | Developer brand       | Platform confirmed operator of the public developer entity; may own Official Developer Data |
| **Verified Agency**    | `verified_agency`    | Organization (agency) | Company docs reviewed; allowed Agency Pro publishing at full trust                          |
| **Verified Agent**     | `verified_agent`     | Agent profile         | Identity + (license or Agency affiliation) reviewed                                         |
| **Verified Owner**     | `verified_owner`     | Owner profile         | Ownership evidence reviewed for claimed units                                               |
| **Platform Verified**  | `platform_verified`  | Listing or project    | Ops/content path confirmed (Factory L3+, source checks) — not personal KYC                  |
| **Pending**            | `pending`            | Any subject           | Submitted; under review                                                                     |
| **Rejected**           | `rejected`           | Any subject           | Failed; reason codes set                                                                    |
| **Expired**            | `expired`            | Any subject           | Validity window ended; re-verify required                                                   |

A subject may hold **entity verification** (agent/agency/…) and listings may separately be **Platform Verified**.

---

## 3. Relationship to listing flags

| Flag                                              | Meaning                          |
| ------------------------------------------------- | -------------------------------- |
| `is_verified_listing` / listing Platform Verified | Content/source path trusted      |
| Agent Verified badge                              | Publisher identity trusted       |
| Both                                              | Highest consumer trust for cards |

Unverified agents may still publish under Free caps with stricter review.

---

## 4. Required documents

### 4.1 Official Developer

| Document                                              | Required |
| ----------------------------------------------------- | -------- |
| Company affidavit / letter linking applicant to brand | Y        |
| Thai company registration (or foreign equiv.)         | Y        |
| Official domain email or IR/website proof             | Y        |
| ID of authorized representative                       | Y        |
| Optional: SET/IR link if claiming listed status       | C        |

### 4.2 Verified Agency

| Document                                          | Required                 |
| ------------------------------------------------- | ------------------------ |
| Company registration                              | Y                        |
| Tax ID                                            | Y                        |
| Office address proof                              | C                        |
| Authorized person ID                              | Y                        |
| Brokerage license (if legally required for model) | C by jurisdiction policy |
| Website / Facebook official page                  | C                        |

### 4.3 Verified Agent

| Document                                              | Required     |
| ----------------------------------------------------- | ------------ |
| Government photo ID                                   | Y            |
| Selfie / liveness (future)                            | C            |
| Broker license number **or** Agency membership letter | Y (one path) |
| Mobile number OTP                                     | Y            |
| Profile photo                                         | C            |

### 4.4 Verified Owner

| Document                                                                      | Required                                        |
| ----------------------------------------------------------------------------- | ----------------------------------------------- |
| Government photo ID                                                           | Y                                               |
| Title deed / chanote excerpt **or** condo juristic letter / purchase contract | Y (redact sensitive numbers for storage policy) |
| Proof unit matches listing (address/unit)                                     | Y                                               |
| If corporate owner: company docs + authority                                  | C                                               |

### 4.5 Platform Verified (listing/project)

| Evidence                                                                       | Required |
| ------------------------------------------------------------------------------ | -------- |
| Working `listing_url` + source timestamp **or** Official Developer attestation | Y        |
| Media rights clear                                                             | Y        |
| Content Review L3 gates                                                        | Y        |
| Geo/price sanity                                                               | Y        |

Documents stored as private encrypted refs — never public URLs.

---

## 5. Verification workflow

```text
Unverified
  → submit application + documents
  → Pending
  → Moderator/Admin review (+ optional AI doc classify)
  → Official Developer | Verified Agency | Verified Agent | Verified Owner
      OR Rejected (codes) OR request_changes
  → periodic revalidation
  → Expired → Pending (resubmit)
```

**SLA:** Agent/Agency ≤ 3 business days; Official Developer ≤ 5; Owner unit ≤ 3; Platform Verified listing batch per Factory ops.

**Revocation:** Fraud, ToS breach, chargeback patterns → Admin sets Rejected/Suspended; badges removed immediately.

---

## 6. Validity & expiry

| Level                     | Default validity                                       |
| ------------------------- | ------------------------------------------------------ |
| Verified Agent / Agency   | 12 months                                              |
| Official Developer        | 24 months or until company change                      |
| Verified Owner            | Per unit; ends on Sold transfer or 24 months           |
| Platform Verified listing | Tied to freshness policy (e.g. 60 days source refresh) |

Expired subjects lose badge; publishing may soft-cap to Free until renewed.

---

## 7. Rejection reason codes

`docs_illegible` · `docs_mismatch` · `license_invalid` · `company_mismatch` · `ownership_unproven` · `suspected_fraud` · `duplicate_identity` · `other`

---

## 8. Permissions unlocked (business)

| Level              | Unlocks                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| Verified Agent     | Agent Pro purchase; higher auto-approve eligibility; badge             |
| Verified Agency    | Agency Pro; org badge; bulk seats                                      |
| Official Developer | Official data ownership; Developer plan tools; claim disputes priority |
| Verified Owner     | Publish own units without agent; owner badge                           |
| Platform Verified  | Trust UI on listing; eligible for Featured home (policy)               |

---

## 9. Non-goals

- No payment of verification fees specified as mandatory
- No specific KYC vendor locked
- No UI mockups

---

_End of Verification Standard V1.0_
