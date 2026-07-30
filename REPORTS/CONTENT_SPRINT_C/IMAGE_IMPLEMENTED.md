# Content Sprint C — Image Implementation

No images were downloaded, per constraints. Work focused on verifying and preparing the image infrastructure.

## Verified existing infrastructure (meets requirements)

- All media renders through `next/image` (`ListingMediaFrame`, `ListingGallery`, project hero, developer logo) — zero raw `<img>` tags in `src/`.
- Alt text: every image receives a meaningful accessible name (listing title, project name, developer name); decorative gallery thumbnails correctly use `alt=""` with `aria-label` on the control.
- Lazy loading: non-priority media uses `loading="lazy"`; LCP media uses `fetchPriority="high"` (contract-tested by `test:seo-performance`).
- Responsive: `sizes` attributes are set on all frames (e.g. `(max-width: 640px) 100vw, ... 420px`).
- CLS: media containers use fixed `aspect-ratio: 16/10` with min-heights, and thumbnails declare explicit `width`/`height` — no layout shift on load or error.
- Failure handling: broken URLs fall back to the neutral `NoImagePlaceholder` (no fake interiors), preserving the reserved box.

## New structure for future local images

- Each city package (`content/cities/*.json`) declares an `image_slots` array with slot id, localized description, and suggested dimensions — a ready insertion point for future licensed/owned photography without layout changes.
- `imageObjectSchema` utility added so future images can emit `ImageObject` structured data with width/height/caption.
- Project schema now wraps the primary photo in an `ImageObject`, improving image indexing for pages that already have approved media.
