# G-CONTENT-PUBLIC — Blog Inventory

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-INV-BLOG-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20  
**Updated at:** 2026-07-20

## 1. Purpose

Authoritative list of editorial/blog posts eligible for public routing after P1-22/P1-24.

## 2. Phase 1 disposition

**Empty inventory — Approved.**

No blog posts are approved for public routing at gate clearance.

| Slug | Path | Disposition | Notes |
| --- | --- | --- | --- |
| — | — | — | No rows |

## 3. Engineering implications (P1-24)

- Blog index and detail routes may be implemented.
- Index must render a localized **empty state** when inventory has zero Approved rows.
- Detail must 404 for all slugs until a row is Approved here.
- Blog UI must remain distinguished from knowledge/reference guides (labels, IA, copy).
- Filesystem directory `content/blog/posts/` may be created empty at implementation time.

## 4. Ownership

Content Owner owns blog inventory and author attribution policy. Each future row must include author, published_at, updated_at, and locale policy flag.

## 5. Amendment process

Add Approved rows only after Editorial Workflow pass. Update this file and Decision Register.

## 6. Approval

**APPROVED** under decision **GCP-D-011** (empty inventory is an intentional, valid approval).
