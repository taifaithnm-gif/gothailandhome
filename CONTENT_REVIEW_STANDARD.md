# Content Review Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Status:** Design only — workflow architecture, not product AI features

Defines how content is scored, screened, and approved before public indexation at marketplace scale.

---

## 1. Goals

- Keep fake, duplicate, and stale listings out of the public corpus.
- Enforce photo and provenance minimums by compliance level (L0–L4).
- Combine **rules**, **AI assist**, and **human review** without blocking honest inventory.
- Produce an auditable approval trail for 1M+ listings.

---

## 2. Quality score (0–100)

### 2.1 Components (weights — design defaults)

| Component    | Weight | Signals                                           |
| ------------ | ------ | ------------------------------------------------- |
| Completeness | 25     | Required fields for entity type + L-level         |
| Media        | 20     | Cover, count, resolution, rights                  |
| Provenance   | 20     | source, listing_url, timestamps, sources[]        |
| Consistency  | 15     | Price vs comps band, geo vs address, beds vs area |
| Freshness    | 10     | `source_updated_at` age vs policy                 |
| Locale       | 10     | en/zh/th coverage vs target                       |

**Bands**

| Score  | Meaning     | Publish default                  |
| ------ | ----------- | -------------------------------- |
| 90–100 | Excellent   | Auto-eligible L3 if gates pass   |
| 75–89  | Good        | Auto-eligible with soft warnings |
| 60–74  | Fair        | Human review recommended         |
| 40–59  | Poor        | Hold / enrich                    |
| 0–39   | Reject-risk | Block public                     |

Scores are **advisory** unless a hard gate fails (Section 8).

### 2.2 Storage

`quality_score` (int), `quality_breakdown` (json), `quality_scored_at` (datetime). Recompute on import and on material edit.

---

## 3. Required photos

| Entity / path       | Minimum                                          |
| ------------------- | ------------------------------------------------ |
| Listing L2 public   | 1 cover meeting MEDIA min edge                   |
| Listing L3 verified | Cover + ≥4 gallery (≥5 total)                    |
| Listing L4 featured | ≥8 images + floor plan preferred                 |
| Project L2          | ≥1 cover; gallery ≥3 recommended                 |
| Developer L2        | Logo recommended; not blocking if name+source OK |
| Ads                 | Creative per MEDIA/Ad spec                       |

Fail → cannot enter target L-level; may remain draft/L1.

---

## 4. Duplicate rules

### 4.1 Exact / hard duplicates

| Key                                | Action                          |
| ---------------------------------- | ------------------------------- |
| Same `(source, source_listing_id)` | Upsert — not a new listing      |
| Same canonical `listing_url`       | Merge / reject duplicate create |
| Same `external_ref`                | Reject second identity          |

### 4.2 Soft duplicates (same unit, multi-source)

Signals: same `project_slug` + unit_number / near-identical beds+area+floor + price within ε + geo within ~50m.

| Outcome        | Rule                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| Cluster        | Link as `duplicate_group_id`                                             |
| Public display | Prefer highest verification + freshest source                            |
| SEO            | One primary indexable URL; others `noindex` or redirect policy           |
| Agents         | Allow multi-source until marketplace ownership rules exist; label source |

### 4.3 Cross-type

Sale vs rent of same unit = **not** duplicates; optional `unit_identity_key` link.

---

## 5. Fake listing detection

### 5.1 Hard fails (block)

- Broken or non-property `listing_url` after fetch policy
- Price `≤0` or absurd outliers beyond hard ceiling (ops-configured)
- Stock / watermark images known in blocklist
- Copy matching known scam templates (phone/LINE in wrong fields, “WhatsApp only transfer”)
- Coordinates in ocean / wrong country
- Claimed “BTS 1 minute” with distance_meters > threshold without source

### 5.2 Soft flags (review)

- Price > Nσ from district+type+beds median
- Area vs bedroom physical impossibility (e.g. 8sqm / 3BR)
- Image perceptual hash matches many unrelated listings
- Title language mix spam / keyword stuffing
- Source page “sold/rented” while we mark available
- Owner/agent contact mismatch patterns

### 5.3 Trust inputs

- `is_verified_listing` / verification_status
- Publisher reputation score (future)
- Manual confirmations

---

## 6. Price validation

| Check                  | Rule                                                      |
| ---------------------- | --------------------------------------------------------- |
| Presence               | sale→`price_thb`; rent→`rent_thb`                         |
| Positive               | > 0                                                       |
| Currency               | THB only V1                                               |
| Band                   | Soft flag outside district percentile band (configurable) |
| Change velocity        | >X% jump since last source snapshot → review              |
| Rent vs sale confusion | Rent amounts in sale field → fail                         |
| Commission             | If public, pct 0–100; private default OK                  |

Never “fix” price with AI inventions — only flag or unpublish.

---

## 7. Source validation

| Check                     | Rule                                               |
| ------------------------- | -------------------------------------------------- |
| `source` present          | Required public listings                           |
| `listing_url`             | Valid URL; host allow-list preferred               |
| Reachability              | Periodic HEAD/GET; on persistent fail → stale      |
| `source_updated_at`       | Required; not in future                            |
| `collected_at`            | Required on import                                 |
| Rights for media          | hotlink\|mirrored\|licensed — not `unknown` on L2+ |
| Project/developer sources | ≥1 official or cited URL                           |

Stale policy (design default): unverified >90 days or verified >60 days without refresh → `stale` flag → demote/noindex per ops.

---

## 8. AI review

**Architecture slot only** — not a shipped product feature in Phase 6.

| Task                 | AI role                   | Human                            |
| -------------------- | ------------------------- | -------------------------------- |
| Locale grammar       | Suggest fixes             | Approve before overwrite         |
| Duplicate clustering | Propose groups            | Confirm merges                   |
| Scam text            | Score risk                | Confirm block                    |
| Image quality        | Blur/porn/logo spam score | Confirm                          |
| Category extract     | beds/area from text       | Diff against structured fields   |
| Translation          | Draft zh/th               | Native or trained review for L3+ |

**Hard rule:** AI must not invent prices, yields, unit numbers, or availability. Suggestions are patches against sourced fields only.

Outputs: `ai_review_status` (`pass`\|`flag`\|`fail`), `ai_review_notes`, `ai_reviewed_at`.

---

## 9. Human review

| Queue                  | Trigger                             |
| ---------------------- | ----------------------------------- |
| New publisher          | First N listings                    |
| Score < 75             | Or hard soft-flag count ≥ threshold |
| Fake/dup flags         | Always                              |
| Financial/yield claims | Always                              |
| Featured L4            | Always                              |
| Ads                    | Always                              |
| Appeal                 | Rejected publishers                 |

Reviewer actions: approve, reject (reason code), request changes, merge duplicate, mark verified, mark stale.

Record: `reviewed_by`, `reviewed_at`, `review_notes`, `rejection_codes[]`.

---

## 10. Approval workflow

```text
draft
  → validate(schema + MEDIA + SEO soft)
  → score
  → AI assist (optional)
  → pending_review (if gates require)
  → approved | rejected | changes_requested
  → published (is_published=true, indexable)
  → stale / unpublished / archived
```

### 10.1 States

| State               | Public?                       | Index?        |
| ------------------- | ----------------------------- | ------------- |
| `draft`             | N                             | N             |
| `pending_review`    | N                             | N             |
| `changes_requested` | N                             | N             |
| `approved`          | if also published flag        | Y if !noindex |
| `rejected`          | N                             | N             |
| `published`         | Y                             | Y             |
| `unpublished`       | N                             | N             |
| `stale`             | optional soft banner / demote | often noindex |

### 10.2 Roles (architecture)

| Role            | Can                                     |
| --------------- | --------------------------------------- |
| Importer/system | create draft, upsert by external_ref    |
| Publisher       | edit own draft, submit                  |
| Reviewer        | approve/reject queues                   |
| Admin           | override, verify badge, force unpublish |

### 10.3 SLA (design targets)

| Path                 | Target               |
| -------------------- | -------------------- |
| Clean auto L3 import | minutes (pipeline)   |
| Flagged human queue  | &lt; 24–48h business |
| Scam hard fail       | immediate block      |

---

## 11. Rejection reason codes (controlled list)

`missing_source` · `broken_source` · `insufficient_media` · `duplicate` · `price_invalid` · `geo_invalid` · `rights_unclear` · `fake_signals` · `policy_violation` · `stale` · `other`

Every rejection stores ≥1 code + free-text note.

---

## 12. Audit

Immutable event log (design): `entity_type`, `entity_id`, `from_state`, `to_state`, `actor`, `at`, `payload`.

Retention: ≥24 months for compliance disputes.

---

## 13. Compliance checklist (go-live for a batch)

- [ ] Quality scores computed
- [ ] Photo minima enforced for L-level
- [ ] Dup keys unique; soft clusters labeled
- [ ] Fake hard fails blocked
- [ ] Price/source gates green
- [ ] AI suggestions not auto-committed on L3+ without policy
- [ ] Human queue empty or SLA ok for featured
- [ ] Approval states consistent with `is_published`

---

_End of Content Review Standard V1.0_
