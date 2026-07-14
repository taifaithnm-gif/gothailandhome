# SEO Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Status:** Design only

Locale prefix: `/en` · `/zh` · `/th`  
Production host: `https://www.gothailandhome.com`

---

## 1. URL rules

### 1.1 Structure

```text
/{lang}/{entity}/{slug}
/{lang}/{entity}/{parent}/{slug}   # only when hierarchical clarity requires it
```

| Entity           | Canonical pattern                     |
| ---------------- | ------------------------------------- |
| Home             | `/{lang}`                             |
| Property list    | `/{lang}/properties`                  |
| Listing detail   | `/{lang}/properties/{listing-slug}`   |
| Projects index   | `/{lang}/projects`                    |
| Project detail   | `/{lang}/projects/{project-slug}`     |
| Developers index | `/{lang}/developers`                  |
| Developer detail | `/{lang}/developers/{developer-slug}` |
| Cities index     | `/{lang}/cities`                      |
| City             | `/{lang}/cities/{city-slug}`          |
| Districts index  | `/{lang}/districts`                   |
| District         | `/{lang}/districts/{district-slug}`   |
| Area (future)    | `/{lang}/areas/{area-slug}`           |
| Agent (future)   | `/{lang}/agents/{agent-slug}`         |
| Company (future) | `/{lang}/companies/{company-slug}`    |

### 1.2 Hard rules

- Always include locale segment.
- ASCII kebab-case slugs only.
- No querystring for canonical page identity (filters may use `?` but are `noindex` or self-canonical to clean list).
- Trailing slash: choose one sitewide convention and stick (prefer **no** trailing slash).
- Never put price or bedroom count in URL if it will change; use stable unit/project identity instead.
- 301 old→new on slug change; keep redirect map ≥24 months.

### 1.3 Indexable vs noindex

| Surface                                       | Robots                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| Published entity page                         | index,follow                                                            |
| Draft/pending/rejected                        | noindex                                                                 |
| Filtered SERP with many facets applied        | noindex or canonicalize to base list                                    |
| Internal admin                                | noindex                                                                 |
| Thin district with 0 public projects+listings | noindex until content exists **or** publish editorial-only L1 carefully |

---

## 2. Slug rules

| Rule                | Spec                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| Charset             | `[a-z0-9-]`                                                           |
| Length              | 3–80                                                                  |
| Uniqueness          | Global per entity type; listing slugs globally unique                 |
| Immortality         | Prefer never change; if change → redirect                             |
| Collision strategy  | append `-2`, `-3` or short hash                                       |
| Listing slug recipe | `{listing-type}-{beds}br-{project-short}-{area}sqm` (+ disambiguator) |
| Project             | brand + location keyword when needed                                  |
| Forbidden           | `admin`, `api`, `login`, pure numbers, Unicode                        |

Thai/Chinese names live in `name` fields, **not** in slugs.

---

## 3. Title rules

### 3.1 Soft length

- Desktop SERP soft max ~55–60 characters (varies by script).
- ZH/TH may be shorter in char count but similar pixel width — use locale-aware soft caps in validators.

### 3.2 Templates (must match real facts)

| Entity       | EN template                                     |
| ------------ | ----------------------------------------------- |
| Listing sale | `{beds}BR {type} for Sale in {project/district} | GoThailandHome` |
| Listing rent | `{beds}BR {type} for Rent in {project/district} | GoThailandHome` |
| Project      | `{Project Name} Condo in {District}, Bangkok    | GoThailandHome` |
| Developer    | `{Developer} — Thailand Property Projects       | GoThailandHome` |
| City         | `Property in {City}                             | Buy & Rent      | GoThailandHome` |
| District     | `{District}, {City} Property Guide              | GoThailandHome` |

### 3.3 Forbidden in titles

- Fake “best”, “#1”, invented prices.
- ALL CAPS shouting.
- Duplicate titles across many listings — disambiguate with unit/size/source id fragment only when needed.

---

## 4. Description rules

- Soft length 120–160 Latin characters; adjust for ZH/TH.
- Must include: entity identity + location + CTA to browse/inquire.
- Must not invent yield, occupancy, or availability.
- Prefer numbers that are on-page and verified.

Example:

> Verified 1-bedroom condo at The Livin Ramkhamhaeng in Bang Kapi, Bangkok. See photos, price, and inquire on GoThailandHome.

---

## 5. Open Graph

| Tag                   | Rule                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| `og:title`            | Match or shorten document title (no need for brand suffix if space-tight)     |
| `og:description`      | Match meta description                                                        |
| `og:image`            | 1200×630 absolute HTTPS URL                                                   |
| `og:url`              | Absolute canonical URL                                                        |
| `og:type`             | `website` or `article` for guides; real-estate if supported by product choice |
| `og:locale`           | `en_US` / `zh_CN` / `th_TH`                                                   |
| `og:locale:alternate` | other langs                                                                   |

Twitter Card: `summary_large_image` aligned with OG.

---

## 6. Schema.org

Emit JSON-LD only for **published** public pages. Never mark Up unavailable inventory as `InStock`.

| Page          | Primary types                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Listing       | `RealEstateListing` + `Apartment`/`House`/`Product` as appropriate; `Offer` with price+currency THB when known |
| Project       | `ApartmentComplex` or `Residence`                                                                              |
| Developer     | `Organization` / `RealEstateAgent` carefully                                                                   |
| City/District | `Place` + `AdministrativeArea`                                                                                 |
| FAQ blocks    | `FAQPage` (questions must be visible on page)                                                                  |
| Breadcrumbs   | `BreadcrumbList`                                                                                               |
| Site          | `WebSite` + `Organization` on home                                                                             |

**Offer rules**

- `priceCurrency`: `THB`
- `availability`: map from `availability_status` conservatively (`InStock` only when available; else `SoldOut`/`OutOfStock`/`PreOrder` with care)
- Include `url` = canonical

**Prohibited**

- Fake AggregateRating
- Fake review counts
- Schema for unpublished pages

---

## 7. Canonical

- One absolute canonical per localized page.
- Hreflang set:
  - `en` → `/en/...`
  - `zh` → `/zh/...`
  - `th` → `/th/...`
  - `x-default` → `/en/...` (platform default)
- Self-referencing canonicals.
- Paginated lists: canonical to page 1 **or** rel prev/next policy documented consistently — prefer self-canonical + noindex for deep facet pages.

---

## 8. Internal links

| From               | Must link to                                         |
| ------------------ | ---------------------------------------------------- |
| Listing            | Project (if any), District, City, Developer (if any) |
| Project            | Developer, District, City, related listings          |
| District           | City, featured projects                              |
| Developer          | Projects list                                        |
| Breadcrumb parents | Always                                               |

Avoid orphan entities: every public node has ≥1 inbound from an index or parent.

Link text: descriptive (project/district name), not “click here”.

---

## 9. Breadcrumb

Pattern examples:

```text
Home > Properties > {Listing title}
Home > Projects > {Project}
Home > Developers > {Developer}
Home > Cities > Bangkok > Bang Kapi
```

Names match UI locale. Schema BreadcrumbList positions start at 1.

---

## 10. FAQ Schema

- Only FAQs marked `schema_eligible=true` and visible in HTML.
- Each Q/A in `FAQPage.mainEntity` as `Question`/`Answer`.
- Max soft recommend 8–12 FAQs per page.
- Answers must not contain banned investment promises.

---

## 11. Sitemap & robots (architecture)

- Split sitemaps by entity at scale (`listings-1.xml`, `projects.xml`, …).
- Only `approved`+`published`+`!noindex`.
- Lastmod = `updated_at`.
- Hreflang via xhtml:link in sitemap where supported.

---

## 12. Quality gates for SEO publish

- Unique title per locale URL
- Description present
- Canonical + hreflang valid
- OG image exists or fallback brand OG
- Breadcrumb parents resolve
- Zero fabricated Offer prices

---

_End of SEO Standard V1.0_
