# Media Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Status:** Design only — no CDN/pipeline implementation in this phase

Companion: [CONTENT_STANDARD.md](./CONTENT_STANDARD.md), [FIELD_DICTIONARY.md](./FIELD_DICTIONARY.md)

---

## 1. Purpose

Define how all media attached to developers, projects, listings, areas, ads, and FAQs must be named, sized, compressed, attributed, and published so a 1M+ listing library stays performant and legally defensible.

---

## 2. Asset classes

| Class              | Extension allow-list                                 | Typical roles                                        | Public by default     |
| ------------------ | ---------------------------------------------------- | ---------------------------------------------------- | --------------------- |
| Images             | `.jpg` `.jpeg` `.webp` `.png` (prefer WebP delivery) | cover, gallery, amenity, lifestyle, logo, avatar, og | Yes if rights cleared |
| Videos             | `.mp4` `.webm` (H.264/H.265/AV1 per delivery stage)  | project tour, unit tour, promo                       | Yes if rights cleared |
| Floor plans        | `.jpg` `.webp` `.pdf` `.svg`                         | unit plan, typical floor, masterplan crop            | Yes                   |
| Brochures          | `.pdf`                                               | project brochure, price list PDF                     | Yes if licensed       |
| Virtual tour       | URL embed (Matterport / self-host)                   | `virtual_tour`                                       | Yes                   |
| Google Street View | URL / panorama ID                                    | `street_view`                                        | Link-out preferred    |
| Google Maps        | URL / embed coords                                   | map context                                          | Link-out / embed      |

---

## 3. File naming

**Pattern**

```text
{entity_type}/{entity_slug}/{role}/{yyyy}/{mm}/{slug}-{role}-{nn}.{ext}
```

**Examples**

```text
projects/the-livin-ramkhamhaeng/cover/2026/07/the-livin-ramkhamhaeng-cover-01.webp
listings/sale-1br-livin-rk-45sqm/gallery/2026/07/sale-1br-livin-rk-45sqm-gallery-03.webp
developers/risland-thailand/logo/2026/07/risland-thailand-logo-01.png
projects/the-livin-ramkhamhaeng/floorplan/2026/07/the-livin-ramkhamhaeng-floorplan-a-01.webp
projects/the-livin-ramkhamhaeng/brochure/2026/07/the-livin-ramkhamhaeng-brochure-en.pdf
```

**Rules**

- ASCII kebab-case only; no spaces, Thai/Chinese in filenames.
- `nn` is zero-padded 2 digits, stable once published.
- Never overwrite: new digest → new `nn` or version suffix `-v2`.
- Hotlinked sources keep `source_url` even if file not mirrored.

---

## 4. Image sizes (delivery variants)

| Variant          | Max long edge | Typical use       | Aspect                      |
| ---------------- | ------------- | ----------------- | --------------------------- |
| `thumb`          | 320px         | cards, lists      | source preserve             |
| `card`           | 640px         | listing cards     | 4:3 preferred               |
| `gallery`        | 1600px        | lightbox          | source                      |
| `hero`           | 2400px        | project hero      | 16:9 or 3:2                 |
| `og`             | 1200×630      | Open Graph        | fixed crop                  |
| `logo`           | 512px         | developer/company | square/transparent PNG/WebP |
| `avatar`         | 256px         | agent             | square                      |
| `floorplan_web`  | 2000px        | zoomable plan     | source                      |
| `masterplan_web` | 3000px        | masterplan        | source                      |

**Minimum publish thresholds**

| Role                            | Minimum                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Listing cover                   | ≥1200px long edge OR explicit `rights=hotlink` with source page that serves image |
| Listing gallery (verified path) | ≥5 images meeting cover min                                                       |
| Project cover                   | ≥1600px preferred                                                                 |
| Floor plan                      | readable labels at `floorplan_web`                                                |
| OG                              | exactly 1200×630 generated or uploaded                                            |

Reject / soft-fail tiny sales loft photos that fail L3 when marked verified.

---

## 5. Videos

| Rule                       | Spec                                     |
| -------------------------- | ---------------------------------------- |
| Container                  | MP4 (H.264) primary; WebM optional       |
| Max upload (design target) | 200 MB raw; delivery encode ≤1080p       |
| Duration soft max          | 3 minutes for listing; 8 minutes project |
| Poster                     | Required JPEG/WebP `poster` role         |
| Captions                   | Optional VTT en/zh/th                    |
| Autoplay                   | Muted only; never autoplay with sound    |

Metadata: `duration_sec`, `width`, `height`, `source_url`, `rights_note`.

---

## 6. Floor plans

- Prefer vector/PDF original + WebP raster for web.
- Unit floor plans must declare `unit_key` or layout code when known.
- Watermark: light GTH logo bottom-right on mirrored plans if license requires brand; never obscure scale bar or room labels.
- If plan text is only Thai, add English layout notes in listing/project copy — do not invent dimensions.

---

## 7. Brochures

- PDF only for downloadables; virus-scan gate (ops).
- Max 50 MB preferred; split if larger.
- Language tagged: `-en` `-zh` `-th` in filename when single-locale.
- Link from project page; never replace official developer brochure with unauthorized redistribute if license forbids.

---

## 8. Virtual tour

| Field          | Required                           |
| -------------- | ---------------------------------- |
| `provider`     | matterport\|kuula\|custom\|unknown |
| `embed_url`    | Y if public                        |
| `fallback_url` | recommended                        |
| `rights_note`  | Y                                  |

No screenshot farm pretending to be a live tour.

---

## 9. Google Street View

Preferred: outbound link / official embed parameters — do not scrape panoramas.

Fields: `street_view_url`, `heading`, `pitch`, `fov` (optional).

---

## 10. Google Maps

| Usage             | Spec                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Entity location   | `latitude`+`longitude` and/or `google_maps_url`                                          |
| Static map images | Only via Maps Platform licensed usage (future); do not hotlink ephemeral tiles illegally |
| Embed             | Official iframe params; lat/lng must match entity                                        |

Mismatch between published address and lat/lng > ~200m → review flag.

---

## 11. Watermark rules

| Situation                          | Rule                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------- |
| Hotlinked third-party              | No GTH watermark over foreign CDN (respect host); badge “Source: …” on UI |
| Mirrored under license             | Optional subtle GTH mark ≤80px, opacity ≤35%, margin ≥16px                |
| Stolen-report claim                | Quarantine asset; remove from public gallery                              |
| Floor plans with proprietary marks | Keep original marks; do not cover with GTH                                |
| Ads                                | No watermark that breaks advertiser creative agreement                    |

Never watermark over faces of people in lifestyle shots in a degrading way; crop discretion left to reviewers.

---

## 12. Compression rules

| Type              | Target                                            |
| ----------------- | ------------------------------------------------- |
| JPEG/WebP gallery | 70–82 quality; sRGB                               |
| PNG logos         | lossless / optiPNG                                |
| Hero              | WebP quality ~75–80                               |
| Floor plans       | Prefer higher quality (≥85) or PNG for sharpness  |
| PDF               | as-is; compressed only if text remains searchable |

Strip EXIF GPS from public derivatives (privacy) unless editorial intentionally keeps project site geotag with approval.

---

## 13. Thumbnail rules

- Generated from cover or first gallery image.
- Center-weighted crop to 4:3 for cards unless square logo/avatar.
- Never upscale beyond source resolution.
- Listing without usable thumb → cannot enter L3 verified path.

---

## 14. Rights & provenance (mandatory on every public asset)

```json
{
  "rights_note": "hotlink|mirrored|licensed|unknown",
  "source_url": "https://…",
  "license_ref": "optional contract id",
  "collected_at": "ISO-8601"
}
```

`unknown` may exist in draft only — not public L2+.

---

## 15. CDN / storage path design (architecture)

```text
cdn.gothailandhome.com/media/{entity}/{slug}/{role}/{variant}/{filename}
```

Future: signed URLs for paid brochure exclusives; public cache for thumbs/cards/gallery.

---

## 16. Compliance checklist

- [ ] Naming pattern followed
- [ ] Role set correctly
- [ ] Size variant set present or on-demand profile defined
- [ ] Alt i18n for images
- [ ] Rights + source present
- [ ] Watermark policy applied
- [ ] Video has poster
- [ ] Floorplan labels legible

---

_End of Media Standard V1.0_
