# 06 — Media Business Contract

**Document ID:** `06_MEDIA_CONTRACT`  
**Version:** 1.0.0  
**Milestone:** M1 — Business Contracts  
**Status:** Documentation only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the business contract for **Media assets** attached to Catalog and Knowledge entities: what assets the platform manages, rights expectations, and ownership boundaries.

## 2. Business Responsibility

- Represent images/documents with source attribution and roles (hero, cover, gallery, logo, brochure, og).
- Ensure official assets carry rights notes before public use.
- Distinguish durable mirrors from portal hotlinks and from Windows01 evidence blobs.

Does **not** own: parent entity facts, SEO text, or raw harvest HTML (evidence is Ops/Windows01).

## 3. Entity Ownership

| Aspect | Owner |
| --- | --- |
| Asset metadata & package manifests | Data Factory — Catalog/Knowledge as parent dictates |
| Public storage mirrors | Serving Plane (logical) |
| Evidence blobs | Execution Plane (Windows01) when enabled |
| Parent publish decision | Parent entity owner |

**Business key:** `asset_id`

## 4. Inputs

- Source URLs or local files from approved collection
- Rights/attribution notes
- Parent entity business key + role

## 5. Outputs

- Media manifests / asset records
- Public URLs or storage paths for serving
- Quality flags (`media_incomplete`) on parents
- Optional captions for AI Search (approved only)

## 6. Required Attributes

| Attribute | Notes |
| --- | --- |
| `asset_id`, `role` | |
| `source_url` or `storage_path` | ≥ 1 |
| `parent_entity_type`, `parent_business_key` | |
| Attribution / rights note | Required for official logos/brochures |

## 7. Relationships

- Media * → 1 parent (Project, Developer, Listing, Knowledge)
- SEO OG role references Media
- Not a substitute for Evidence objects

## 8. Business Rules

1. No stock photo presented as project photography.
2. No AI-generated fake interiors as project media.
3. Cover required for completeness grade A on public projects/developers.
4. Hotlinks may be non-durable; mirrors preferred for official assets.

## 9. Validation Rules

- Role enum controlled.
- Checksum required when mirrored into factory object store.
- Broken required media → parent quality flag.

## 10. Approval Rules

- Rights acceptance is part of parent review for official assets.
- Media alone cannot publish a parent.

## 11. Lifecycle

Versions with parent package; replacement increments parent `package_version`.

## 12. Future Compatibility

- Video role additive later.
- MinIO evidence ≠ gallery mirror (separate stores).

## 13. Cross References

- M0: `11_MEDIA_STANDARD.md`
- M1: `02_PROJECT_CONTRACT.md`, `03_DEVELOPER_CONTRACT.md`, `05_LISTING_CONTRACT.md`, `13_KNOWLEDGE_CONTRACT.md`, `20_WINDOWS01_RUNTIME_CONTRACT.md`
