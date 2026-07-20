# G-CONTENT-PUBLIC — Public Content Types

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-TYPES-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20  
**Owner:** Content Owner (Phase 1 website static content)

## 1. Purpose

Defines the only content types the Phase 1 static content product may load, validate, and route. P1-22 must reject any other type.

## 2. Approved content types

| Type id | Label | Primary routes (Phase 1) | Inventory authority | Copy gate |
| --- | --- | --- | --- | --- |
| `knowledge_article` | Knowledge / reference article | `/[lang]/knowledge/articles/[slug]` | `G_CONTENT_PUBLIC_ARTICLE_INVENTORY.md` | G-CONTENT-PUBLIC |
| `blog_post` | Editorial / blog post | `/[lang]/blog`, `/[lang]/blog/[slug]` | `G_CONTENT_PUBLIC_BLOG_INVENTORY.md` | G-CONTENT-PUBLIC |
| `faq_entry` | Platform / process FAQ item | `/[lang]/faq` (aggregated) | `G_CONTENT_PUBLIC_FAQ_INVENTORY.md` | G-CONTENT-PUBLIC |
| `investment_guide` | Educational investment guidance | Localized investment guide route (P1-25) | Separate inventory under G-INVESTMENT | **G-INVESTMENT** |
| `legal_guide` | Informational legal / foreign-ownership guidance | Localized legal guide route (P1-26) | Separate inventory under G-LEGAL | **G-LEGAL** |

## 3. Type distinctions (mandatory)

| Type | Is | Is not |
| --- | --- | --- |
| `knowledge_article` | Evidence-backed reference / operator-or-government sourced explainer | Marketing blog; yield advice; personalized counsel |
| `blog_post` | Editorial narrative with author/date/update labels | Evidence matrix substitute; listing inventory; legal advice |
| `faq_entry` | Short Q&A for platform/process/property-process topics | Free-form legal or investment advice; invented yields |
| `investment_guide` | Qualified educational guidance only after G-INVESTMENT | Calculator; unsupported return claims |
| `legal_guide` | Qualified informational guidance only after G-LEGAL | Personalized legal advice; unsigned copy |

## 4. Filesystem scope (binding for P1-22)

Approved content directories (loader may read **only** these trees):

```
content/knowledge/articles/
content/blog/posts/          # may be created empty at P1-24
content/faq/                 # may be created empty/skeleton at P1-27
content/guides/investment/   # gated by G-INVESTMENT; not routable until that gate clears
content/guides/legal/        # gated by G-LEGAL; not routable until that gate clears
```

Out of scope for the static public loader: `content/projects/`, `content/developers/`, `content/areas/`, `content/media/`, listing harvest JSON, Windows01 paths, and any path outside the approved trees.

## 5. Required identity fields (all types)

Every public static document must carry:

| Field | Rule |
| --- | --- |
| `slug` | Unique within type; URL-safe `[a-z0-9-]+` |
| `type` | Exact type id from §2 |
| `status` | From `G_CONTENT_PUBLIC_STATUS_VOCABULARY.md` |
| `locale_status` | Per `en` / `zh` / `th` completeness |
| `title` | Localized object |
| `owner` | Content Owner id or role label per Ownership Policy |
| `reviewed_at` | ISO date of last human editorial review |
| `citations` or `sources` | Per Source Attribution + Evidence Requirements |

Type-specific extras are defined in inventories and enforced by P1-22/P1-28.

## 6. Explicit exclusions

The following are **not** G-CONTENT-PUBLIC content types:

- Property listings, project packages, developer profiles, district packages
- Marketplace lead payloads
- Admin CMS drafts outside approved trees
- AI-generated unverified text
- Syndicated third-party articles without Owner inventory amendment

## 7. Approval

**APPROVED** under `G_CONTENT_PUBLIC_OWNER_DECISION_REGISTER.md` decision **GCP-D-001**.
