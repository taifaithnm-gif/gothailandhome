# Media Standard V2.0

**Product:** GoThailandHome  
**Version:** 2.0  
**Phase:** 6.5 (planning only)  
**Relationship:** Extends [MEDIA_STANDARD.md](./MEDIA_STANDARD.md) (Content Standard V1.0). Where conflict, **V2 wins for new asset classes**; V1 naming/size/rights/watermark baselines remain in force unless superseded below.

---

## 1. Purpose

Define business/quality rules for rich media used in marketplace selling: photos through TikTok and Matterport — without implementing encoders or CDN jobs here.

---

## 2. Asset class catalog

| Class            | Code                     | Container / source                | Primary roles                        |
| ---------------- | ------------------------ | --------------------------------- | ------------------------------------ |
| **Photos**       | `photo`                  | JPEG/WebP/PNG                     | cover, gallery, amenity, lifestyle   |
| **Videos**       | `video`                  | MP4/WebM                          | unit_tour, project_tour, promo       |
| **Drone**        | `drone`                  | MP4 + stills                      | aerial_exterior, site_context        |
| **360°**         | ` Equirect` / `photo360` | JPEG equirectangular / player URL | room_360, lobby_360                  |
| **Virtual Tour** | `virtual_tour`           | Embed URL                         | full_tour                            |
| **Matterport**   | `matterport`             | Matterport space URL/ID           | matterport_space                     |
| **YouTube**      | `youtube`                | YouTube URL/ID                    | youtube_video                        |
| **TikTok**       | `tiktok`                 | TikTok URL/ID                     | tiktok_clip                          |
| **Floor Plans**  | `floorplan`              | PDF/SVG/WebP                      | unit_plan, typical_floor, masterplan |
| **Brochures**    | `brochure`               | PDF                               | project_brochure, price_list         |

All public assets still require V1 **rights_note** + **source_url** when third-party.

---

## 3. Photos

| Rule               | Spec                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| Min for L3 listing | ≥5 (unchanged from V1)                                                    |
| Preferred order    | Cover → living → kitchen → beds → baths → view → building                 |
| Forbidden          | Stolen portal watermarks presented as own; porn; misleading CGI unlabeled |
| CGI/render         | Allowed if `media_kind=cgi` and labeled in UI                             |
| Drone stills       | Tag `drone` even if photo file                                            |

Sizes/thumbs/compression → MEDIA_STANDARD V1 §4–13.

---

## 4. Videos

| Rule                 | Spec                                                   |
| -------------------- | ------------------------------------------------------ |
| Max duration listing | 3 min soft                                             |
| Max duration project | 8 min soft                                             |
| Resolution           | Deliver 1080p max default; 4K source archived optional |
| Poster               | Required                                               |
| Audio                | Autoplay muted only                                    |
| Captions             | Optional VTT en/zh/th                                  |

---

## 5. Drone

| Rule            | Spec                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Compliance      | Operator responsible for Thai aviation / building rules — platform stores attestation checkbox |
| Stabilization   | Prefer stabilized footage                                                                      |
| Altitude claims | Do not invent “near BTS” from aerial alone                                                     |
| Privacy         | Avoid identifiable faces/vehicle plates in publish derivatives when feasible                   |
| Pairing         | Link to project lat/lng                                                                        |

Role: `aerial_exterior` \| `aerial_site`.

---

## 6. 360°

| Rule     | Spec                                                             |
| -------- | ---------------------------------------------------------------- |
| Format   | Equirectangular ≥4K long edge preferred **or** hosted player URL |
| Rooms    | Tag room type                                                    |
| Hotspots | Optional future; not required V2                                 |
| Fallback | Flat photo gallery if player fails                               |

---

## 7. Virtual Tour (generic)

| Field          | Req                                                   |
| -------------- | ----------------------------------------------------- |
| `provider`     | matterport \| kuula \| cloudpano \| custom \| unknown |
| `embed_url`    | Y if public                                           |
| `fallback_url` | Recommended                                           |
| `rights_note`  | Y                                                     |

Must be live tour — not screenshot slideshow labeled as VT.

---

## 8. Matterport

| Field                        | Spec                                                  |
| ---------------------------- | ----------------------------------------------------- |
| `matterport_space_id` or URL | Y                                                     |
| `provider`                   | `matterport`                                          |
| Branding                     | Honor Matterport ToS; no unauthorized scrape of tiles |
| Sync                         | Optional `last_synced_at`                             |

Prefer official embed. Mirror only with license.

---

## 9. YouTube

| Rule            | Spec                                                   |
| --------------- | ------------------------------------------------------ |
| URL             | youtube.com / youtu.be only                            |
| Ownership       | Channel must be advertiser/developer/agent or licensed |
| Unlisted/public | Public or unlisted OK; private not usable              |
| Preview         | Use oEmbed thumbnail; store `youtube_video_id`         |
| Dual-host       | Optional: also store MP4 for hero — credits bandwidth  |

Do not re-upload copyrighted developer promos without permission.

---

## 10. TikTok

| Rule       | Spec                                                                 |
| ---------- | -------------------------------------------------------------------- |
| URL        | tiktok.com canonical                                                 |
| Use        | Short promo / Reels-style discovery                                  |
| Embed      | Per TikTok embed ToS; fallback link-out if embed blocked             |
| Moderation | Same brand safety as ads; no music-rights unknown clips for paid ads |

Store `tiktok_video_id` when parseable.

---

## 11. Floor plans

V1 rules apply, plus:

- Tag `plan_type`: unit \| typical \| masterplan \| site.
- Vector/PDF preferred for download; WebP for zoom.
- Dimension text language may be TH-only; do not invent m².

---

## 12. Brochures

V1 PDF rules apply, plus:

- Locale suffix `-en` `-zh` `-th`.
- Version date in metadata `brochure_version`.
- Official Developer Data ownership preferred for primary brochure.

---

## 13. Naming extension (V2)

```text
{entity}/{slug}/{role}/{yyyy}/{mm}/{slug}-{role}-{kind}-{nn}.{ext}
```

`kind` examples: `photo`, `drone`, `yt`, `mp`, `fp`.

YouTube/TikTok/Matterport may be **URL-only records** without mirrored files; `url` = canonical external.

---

## 14. Membership / ad usage

| Media                    | Free                 | Pro+ |
| ------------------------ | -------------------- | ---- |
| Photos                   | Y (caps)             | Y    |
| Video                    | 1 listing            | More |
| Drone / 360 / Matterport | N on Free            | Y    |
| YT / TikTok links        | Y                    | Y    |
| Brochure upload          | Project-linked roles | Y    |

Entitlement counts reference MEMBERSHIP_STANDARD (implementation later).

---

## 15. Moderation hooks

AI assist may flag blur/porn/logo spam (CONTENT_REVIEW). Human required for L4 Featured and all paid ads creatives.

---

## 16. Supersession note

| Topic                                       | Authority               |
| ------------------------------------------- | ----------------------- |
| Core sizes, watermark, compression, hotlink | MEDIA_STANDARD V1       |
| Drone, 360, Matterport, YT, TikTok          | **This V2**             |
| SEO OG image                                | SEO_STANDARD (1200×630) |

---

_End of Media Standard V2.0_
