# Developer Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Status:** Design only

A **Developer** is the brand/legal entity delivering one or more projects. Public developer hubs target **L2** with at least one published project preferred.

---

## 1. Company profile

| Field               | Description     | Type        | Req | Validation | Example            | Translation | Source   | Editable | Searchable | Indexable |
| ------------------- | --------------- | ----------- | --- | ---------- | ------------------ | ----------- | -------- | -------- | ---------- | --------- |
| `id`                | UUID            | uuid        | Y   |            |                    | none        | system   | none     | N          | Y         |
| `slug`              | URL key         | slug        | Y   | unique     | `risland-thailand` | none        | required | admin    | Y          | Y         |
| `name`              | Brand name      | i18n_string | Y   |            | RISLAND Thailand   | i18n        | required | admin    | Y          | Y         |
| `legal_name`        | Registered name | i18n_string | C   |            | … Co., Ltd.        | i18n        | optional | admin    | Y          | Y         |
| `description`       | Profile         | i18n_text   | C   | L2 body    |                    | i18n        | optional | admin    | Y          | N         |
| `logo_url`          | Logo            | url         | C   | MEDIA logo |                    | none        | optional | admin    | N          | N         |
| `phone`             | HQ/contact      | phone       | N   | E.164      |                    | none        | optional | admin    | N          | N         |
| `email`             | Public contact  | email       | N   |            |                    | none        | optional | admin    | N          | N         |
| `address`           | Office address  | i18n_text   | N   |            |                    | i18n        | optional | admin    | Y          | N         |
| `founded_year`      |                 | int         | N   | 1800–2100  | 2016               | none        | optional | admin    | Y          | Y         |
| `headquarters_city` |                 | string/slug | N   |            | Bangkok            | none        | optional | admin    | Y          | Y         |
| `is_published`      |                 | bool        | Y   |            | true               | none        | system   | admin    | N          | Y         |
| `sources`           |                 | json        | Y   | ≥1         |                    | none        | required | admin    | N          | N         |

---

## 2. History

| Field        | Description       | Type      | Req | Validation                  | Example | Translation | Source   | Editable | Searchable | Indexable |
| ------------ | ----------------- | --------- | --- | --------------------------- | ------- | ----------- | -------- | -------- | ---------- | --------- |
| `history`    | Narrative history | i18n_text | N   | dated claims need source    |         | i18n        | optional | admin    | Y          | N         |
| `milestones` | Timeline          | json[]    | N   | `{year, title, source_url}` |         | i18n title  | optional | admin    | Y          | N         |

No unverifiable “largest developer in Thailand” claims without citation.

---

## 3. Projects

| Field                    | Description     | Type     | Req | Validation                | Example | Translation | Source   | Editable | Searchable | Indexable |
| ------------------------ | --------------- | -------- | --- | ------------------------- | ------- | ----------- | -------- | -------- | ---------- | --------- |
| `project_slugs`          | Linked projects | string[] | C   | derived from DB preferred |         | none        | derived  | system   | Y          | Y         |
| `project_count`          | Denorm count    | int      | N   |                           | 12      | none        | derived  | system   | N          | Y         |
| `featured_project_slugs` | Hub highlights  | string[] | N   | ⊆ projects                |         | none        | optional | admin    | N          | N         |

Developer page lists published projects only. Do not invent project names not in inventory.

---

## 4. Financial status

| Field                   | Description     | Type      | Req | Validation       | Example | Translation | Source           | Editable | Searchable | Indexable |
| ----------------------- | --------------- | --------- | --- | ---------------- | ------- | ----------- | ---------------- | -------- | ---------- | --------- |
| `financial_status_note` | Public note     | i18n_text | N   | must cite filing |         | i18n        | optional         | admin    | N          | N         |
| `financial_source_url`  | IR / filing     | url       | C   | required if note |         | none        | required if note | admin    | N          | N         |
| `financial_as_of`       |                 | date      | C   | if note          |         | none        | optional         | admin    | N          | N         |
| `revenue_thb`           | Optional metric | money_thb | N   | + source         |         | none        | optional         | admin    | N          | Y         |
| `financial_disclaimer`  |                 | i18n_text | C   | if any metric    |         | i18n        | system           | admin    | N          | N         |

Never present unaudited rumor as fact. Prefer link-out to SET/IR pages over restating numbers.

---

## 5. Stock exchange

| Field               | Description       | Type        | Req | Validation              | Example | Translation | Source   | Editable | Searchable | Indexable |
| ------------------- | ----------------- | ----------- | --- | ----------------------- | ------- | ----------- | -------- | -------- | ---------- | --------- |
| `stock_exchange`    | Exchange          | enum/string | N   | SET\|mai\|foreign\|none | `SET`   | none        | optional | admin    | Y          | Y         |
| `stock_ticker`      | Symbol            | string      | C   | if exchange             | `PS`    | none        | optional | admin    | Y          | Y         |
| `stock_profile_url` | Official quote/IR | url         | C   | if listed               |         | none        | optional | admin    | N          | N         |
| `is_listed`         |                   | bool        | N   | derived                 | true    | none        | derived  | system   | N          | Y         |

Parent/group listing vs Thailand subsidiary: document which legal entity is listed in `legal_name` / note.

---

## 6. Website

| Field              | Description   | Type | Req | Validation                             | Example | Translation | Source    | Editable | Searchable | Indexable |
| ------------------ | ------------- | ---- | --- | -------------------------------------- | ------- | ----------- | --------- | -------- | ---------- | --------- |
| `website`          | Official site | url  | C   | http(s); ≥1 of website/facebook for L2 |         | none        | required* | admin    | Y          | N         |
| `website_verified` | Ops checked   | bool | N   |                                        | true    | none        | system    | admin    | N          | N         |

---

## 7. Facebook

| Field          | Description   | Type | Req | Validation   | Example | Translation | Source   | Editable | Searchable | Indexable |
| -------------- | ------------- | ---- | --- | ------------ | ------- | ----------- | -------- | -------- | ---------- | --------- |
| `facebook_url` | Official page | url  | C   | facebook.com |         | none        | optional | admin    | N          | N         |

Prefer official page over fan groups.

---

## 8. Google Maps

| Field                    | Description      | Type    | Req | Validation | Example | Translation | Source   | Editable | Searchable | Indexable |
| ------------------------ | ---------------- | ------- | --- | ---------- | ------- | ----------- | -------- | -------- | ---------- | --------- |
| `google_maps_url`        | HQ / brand place | url     | N   |            |         | none        | optional | admin    | N          | N         |
| `latitude` / `longitude` | Office point     | decimal | N   | pair       |         | none        | optional | admin    | N          | Y         |

---

## 9. Awards

| Field    | Description | Type   | Req | Validation           | Example | Translation | Source   | Editable | Searchable | Indexable |
| -------- | ----------- | ------ | --- | -------------------- | ------- | ----------- | -------- | -------- | ---------- | --------- |
| `awards` | List        | json[] | N   | year+name+source_url |         | i18n name   | optional | admin    | Y          | N         |

Award item shape:

```json
{
  "year": 2023,
  "name": { "en": "…", "zh": "…", "th": "…" },
  "issuer": "…",
  "source_url": "https://…"
}
```

No award without `source_url` on public pages.

---

## 10. SEO & media

| Field             | Req                      |
| ----------------- | ------------------------ |
| `seo_title`       | Y                        |
| `seo_description` | Y                        |
| `og_image_url`    | C — logo or project hero |
| Logo MEDIA rules  | C for polished L2        |

Internal links: all published projects; city hubs where active.

---

## 11. Compliance checklist

- [ ] Unique slug + i18n name
- [ ] ≥1 source
- [ ] Website and/or Facebook
- [ ] Financial/stock claims cited
- [ ] Awards cited
- [ ] No invented project portfolio
- [ ] Publish flag intentional

---

_End of Developer Standard V1.0_
