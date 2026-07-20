# G-CONTENT-PUBLIC — Knowledge Article Inventory

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-INV-ARTICLE-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20  
**Updated at:** 2026-07-20

## 1. Purpose

Authoritative list of knowledge articles eligible for public routing after P1-22/P1-23. Engineering must not route slugs absent from this inventory with disposition **Approved**.

## 2. Inventory rules

- One row per slug.
- Disposition values: `Approved` | `Pending` | `Rejected` | `Archived`.
- Path must remain under `content/knowledge/articles/`.
- Locale policy: all three locales `complete` (see Locale Fallback Policy).

## 3. Approved rows

| Slug | Path | Type | Disposition | verified_at | Notes |
| --- | --- | --- | --- | --- | --- |
| `bts-skytrain-overview` | `content/knowledge/articles/bts-skytrain-overview.json` | `knowledge_article` | **Approved** | 2026-07-16 | Official-operator sourced Phase 12 note; EN/ZH/TH complete; citations present. Remains not routable until P1-22/P1-23 implement loader/routes and P1-28 validates. Must display citations + verification date; no invented fares/station counts. |

## 4. Explicit non-members

Any other JSON under `content/knowledge/articles/` not listed above is **not** publicly routable until added here with disposition **Approved**.

## 5. Amendment process

Content Owner updates this table, stamps `Updated at`, and records GCP-D inventory amendment in the Decision Register when adding/removing rows.

## 6. Approval

**APPROVED** under decision **GCP-D-010**.
