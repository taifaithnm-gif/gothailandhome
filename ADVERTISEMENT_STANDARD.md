# Advertisement Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 (planning only)  
**Compatible with:** PLATFORM_ARCHITECTURE_V2 §7.6–7.7 · MEMBERSHIP_STANDARD credits · CONTENT_STANDARD Advertisement

---

## 1. Purpose

Define future advertising products, targeting, billing models, and moderation — without implementing ad serving UI.

---

## 2. Product catalog

| Product                | Code                 | Placement                              | Default billing       |
| ---------------------- | -------------------- | -------------------------------------- | --------------------- |
| **Homepage Featured**  | `homepage_featured`  | Home hero/slot region                  | Flat period / credits |
| **City Featured**      | `city_featured`      | City hub                               | Flat / credits        |
| **District Featured**  | `district_featured`  | District hub                           | Flat / credits        |
| **Project Featured**   | `project_featured`   | Project page modules                   | Flat / credits        |
| **Developer Featured** | `developer_featured` | Developer hub / directory              | Flat / credits        |
| **Search Sponsored**   | `search_sponsored`   | Search/results inject                  | Flat or CPC future    |
| **Banner**             | `banner`             | Reserved IAB-like slots                | CPM future / flat     |
| **Premium Listing**    | `premium_listing`    | Listing detail highlight + card chrome | Flat / credits        |
| **Priority Ranking**   | `priority_ranking`   | Boost in eligible SERP sorts           | Flat period or CPC    |

Membership **Featured listing credits** map primarily to Homepage/City/Search/Project featured channels (Architecture `featured_placements`).

---

## 3. Product rules

### 3.1 Homepage Featured

- Max concurrent slots: ops-configured (e.g. 6).
- Creative + linked entity (listing/project/developer).
- No fake “sold out” overlays.

### 3.2 City / District Featured

- Targeting must match `city_slug` / `district_slug`.
- Entity should be geo-relevant or flagged as brand campaign.

### 3.3 Project / Developer Featured

- Advertiser must own or be appointed on entity, unless Admin-run house ads.

### 3.4 Search Sponsored

- Injected with `Sponsored` label (never disguised as organic).
- Match filters: geo, listing_type, price band optional.

### 3.5 Banner

- Size variants per MEDIA_STANDARD_V2 ad creatives.
- Third-party advertisers allowed with Brand safety review.

### 3.6 Premium Listing

- Visual treatment on card + detail; does not alter factual ranking signals except explicit boost product.

### 3.7 Priority Ranking

- Multiplicative or slot boost within filtered result sets.
- Always secondary to hard filters (city, beds, etc.).
- Organic relevance floor: boosted item must still match query constraints.

---

## 4. Future CPC / CPM support

| Model       | Code                           | Meter              | When        |
| ----------- | ------------------------------ | ------------------ | ----------- |
| Flat period | `flat_period`                  | start/end dates    | V1 products |
| Credits     | `credits`                      | membership wallet  | V1          |
| **CPM**     | `cpm`                          | impressions / 1000 | Future      |
| **CPC**     | `cpc`                          | clicks             | Future      |
| Daily cap   | `budget_thb` + `daily_cap_thb` | pacing             | Future      |

Architecture already allows `billing_model: cpm | cpc | flat_period`. Impression/click facts: `ad_impressions` / `ad_clicks`.

**Fraud:** click flooding → campaign pause + Admin review.

---

## 5. Campaign lifecycle

```text
draft → pending_payment → pending_moderation → active → paused → ended
                        ↘ rejected
```

Creatives: `moderation_status` pending | approved | rejected (Architecture).

---

## 6. Targeting schema (business)

```json
{
  "city_slugs": ["bangkok"],
  "district_slugs": ["bang-kapi"],
  "listing_types": ["sale", "rent"],
  "property_types": ["condo"],
  "project_slugs": [],
  "locales": ["en", "zh", "th"],
  "schedule": { "starts_at": "…", "ends_at": "…" }
}
```

---

## 7. Eligibility by role

| Product                    | Agent            | Agency    | Developer | Owner   | Admin house |
| -------------------------- | ---------------- | --------- | --------- | ------- | ----------- |
| Homepage Featured          | Y (credits/paid) | Y         | Y         | limited | Y           |
| City/District              | Y                | Y         | Y         | limited | Y           |
| Project/Developer Featured | appointed        | appointed | Y         | N       | Y           |
| Search Sponsored           | Y                | Y         | Y         | limited | Y           |
| Banner                     | N default        | Y         | Y         | N       | Y           |
| Premium / Priority         | Y                | Y         | Y         | Y       | Y           |

Requires active membership entitlements or invoice payment (PAYMENT_STANDARD).

---

## 8. Creative & brand safety

- Follow MEDIA_STANDARD_V2.
- No misleading price, guaranteed yield, or competitor trademark abuse.
- Moderators use CONTENT_REVIEW spirit.
- Political/adult ads prohibited.

---

## 9. Reporting

Advertisers see impressions, clicks, CTR, spend (when CPM/CPC live), leads attributed with UTM/`campaign_id`. Analytics tier from membership may limit history depth.

---

## 10. Non-goals this phase

No homepage slot implementation, no auction engine, no UI.

---

_End of Advertisement Standard V1.0_
