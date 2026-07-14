# MEDIA_REPORT

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Policy:** download only media the source licenses for reuse — no scraped copyrighted galleries

## Present media assets (real, verified on disk)

| Asset class | Count | Location | Status |
|-------------|------:|----------|--------|
| Developer logos (SVG) | 20 | `public/developers/<slug>/logo.svg` | ✅ real, one per developer |
| Contact QR images (PNG) | 2 | `public/contact/apple-line.png`, `apple-wechat.png` | ✅ real |
| Supabase `property_media` rows | 1 | DB | seed row from earlier phase |

## Explicit placeholders (NOT real media — do not publish as source imagery)

| File | Nature |
|------|--------|
| `public/projects/the-livin-ramkhamhaeng/hero-placeholder.svg` | Placeholder hero |
| `public/og/projects/the-livin-ramkhamhaeng.svg` | Generated OG card |
| `public/og/projects/placeholder.svg` | Fallback OG card |

These are named `*placeholder*` deliberately and are rendered only as fallbacks.
No placeholder is counted as a harvested project photo.

## Gap — project galleries (STEP 4 not yet fulfilled)

STEP 4 requires organized media per **Developer / Project / Facilities / Location /
Floorplan**. Only the Developer tier (logos) is populated. Project galleries,
facility photos, location imagery, brochures and floor plans are **not** harvested,
because:

- PropertyHub listing photos are third-party agent uploads without a reuse licence
  — importing them would violate the "reusable media allowed by the source" rule.
- Official developer galleries require per-developer licence confirmation before
  bulk download.

Rather than fill the gap with scraped or placeholder imagery, the media tier is
left at logos-only and documented here. The `media.manifest.json` schema
(`entity_type`, `entity_slug`, `items`) and the `public/{projects,cities,districts,
og,banners}` directory tree are already in place to receive licence-clean assets
when a source is cleared.

## Recommended next media actions

1. Confirm reuse terms with each of the 20 developers' official media/press pages.
2. Harvest only cleared official galleries into `content/media/<entity>/` +
   `public/projects/<slug>/`, described by a `media.manifest.json` per entity.
3. Generate per-project OG cards from real hero images once available.

## Validation

`media.manifest.json` schema is available and wired into `validatePath`. No media
manifests were produced this milestone (logos are referenced from developer
packages), so there are 0 media-manifest validation targets and 0 failures.
