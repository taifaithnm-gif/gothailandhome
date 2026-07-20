# 11 — Media Standard

**Document ID:** `11_MEDIA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define how images and documents are referenced, attributed, stored, and linked to Catalog and Knowledge entities without inventing assets.

## 2. Scope

Media manifests, asset metadata, cover/gallery roles, rights notes, and object-store pointers (Supabase Storage today; MinIO evidence on Windows01 later). Not frontend image component design.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Media asset** | One file or remote URL with metadata. |
| **Cover** | Primary image for cards/hubs. |
| **Gallery** | Ordered additional images. |
| **Mirror** | Factory-stored copy of a remote asset. |
| **Rights note** | License/source attribution for official assets. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Asset id | `asset_<slug>_<role>_<n>` or content-addressed hash |
| Roles | `hero` \| `cover` \| `gallery` \| `logo` \| `brochure` \| `og` |
| Library path (existing) | `content/media/library/...` |
| Manifest | `media.manifest.json` / `*.asset.json` |

## 5. Required Fields

| Field | Type | Notes |
| --- | --- | --- |
| `asset_id` | string | Stable within package |
| `role` | enum | Controlled |
| `source_url` or `storage_path` | string | At least one |
| `attribution` / source note | string | Required for official logos/brochures |
| `parent_entity_type` | enum | |
| `parent_business_key` | string | |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `public_url` | Serving URL |
| `mime_type` | |
| `width` / `height` | |
| `checksum` | File hash |
| `is_cover` | boolean |
| `sort_order` | integer |
| `captured_at` | datetime |
| `rights` | `public` \| `official_with_permission` \| `portal_hotlink` \| `unknown` |
| `alt_text` | I18nString for accessibility |

## 7. Validation Rules

1. Cover required for completeness grade A on projects/developers when public.  
2. Hotlinked portal images must retain `source_url` and may be non-durable.  
3. Official logos require rights note before `publish_ready` on developer hubs.  
4. No stock photo substitution presented as project photography.  
5. Checksum required when mirrored into factory object store.  
6. Broken required media flags `media_incomplete`.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| MED-Q1 | Prefer mirrored official assets for durability |
| MED-Q2 | Gallery order is explicit, not filesystem order |
| MED-Q3 | OG/hero should exist for indexable projects |
| MED-Q4 | AI-generated fake interiors forbidden as project media |
| MED-Q5 | Evidence captures (HTML/PDF) are not gallery media unless explicitly promoted |

## 9. Lifecycle

Assets version with parent package. Replacing cover increments `package_version`. On delist/archive, public URLs may be retained for audit but removed from public galleries per policy.

## 10. Examples

```json
{
  "entity_type": "media_asset",
  "asset_id": "asset_ashton-asoke_hero_1",
  "role": "hero",
  "parent_entity_type": "project",
  "parent_business_key": "ashton-asoke",
  "source_url": "https://example.invalid/hero.jpg",
  "storage_path": "property-media/projects/ashton-asoke/hero.jpg",
  "is_cover": true,
  "rights": "official_with_permission",
  "attribution": "Ananda official project media",
  "checksum": "sha256:…"
}
```

## 11. Future Compatibility

- Windows01 MinIO stores evidence blobs separately from public gallery mirrors.  
- Video assets may add `role: video` later without breaking image roles.  
- AI search may use alt/captions from approved assets only.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Projects / developers / listings | `04`, `05`, `07` |
| Metadata | `10_METADATA_STANDARD.md` |
| Existing schema | `pipelines/factory/schemas/media.manifest.json` |
| Import | `16_IMPORT_EXPORT_STANDARD.md` |
