# MEDIA_LIBRARY_REPORT

**Milestone:** Phase 10 Sprint 4 — Official Media Library
**Date:** 2026-07-16
**Baseline HEAD:** `72df022`
**Policy:** Official developer/project sources only. No portal screenshots. No copyrighted gallery binary scrape without license permission.

## What was completed

| Asset class | Action | Result |
|-------------|--------|-------:|
| Developer logos | Mirrored official identity assets → `content/media/library/developers/*/logo.*` + `public/developers/*/official-logo.*` | **20/20** |
| Favicons | Mirrored (or remapped to official logo asset when favicon empty/404) | **20/20** |
| Brochures | Mirrored verified official PDF (Rhythm Ekkamai) | **1** downloaded |
| Project galleries | Registered official gallery/page URLs as hotlinks | **12** |
| Floor plans | Registered official plan-section URLs as hotlinks | **4** |
| Hero images | Registered official project URL; placeholders retained pending license | **50** registered / **0** binary replacements |

## Required record fields

Every catalog asset includes: `official_url`, `copyright_source`, `downloaded_date`, `checksum_sha256`, `local_storage_path` (null when hotlink-only).

Downloaded assets with checksum + local path: **41**.

## Catalog

- Master catalog: `content/media/library/catalog.json`
- Snapshot: `pipelines/factory/media-library/sprint4_media_snapshot.json`
- Per-asset sidecars under `content/media/library/{developers,projects}/`

## Download status counts

| Status | Count |
|--------|------:|
| downloaded | 41 |
| not_downloaded_pending_license | 16 |
| placeholder_pending_official_mirror | 50 |

## Honesty notes

1. **Placeholders not fully replaced for heroes/galleries/floor-plan binaries** — official *sources* are registered; image/PDF binaries beyond the one AP brochure require license clearance.
2. Local `logo.svg` glyphs remain as non-trademark fallbacks; delivery prefers `official-logo.*` cache.
3. Empty HTTP 200 favicon bodies were rejected (Risland remapped to official logo PNG; Raimon favicon remapped to official logo SVG).
