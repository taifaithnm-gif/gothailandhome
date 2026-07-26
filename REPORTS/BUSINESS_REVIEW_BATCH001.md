# Business Review — Batch001

**Milestone:** `BUSINESS_REVIEW_BATCH001`  
**Date:** 2026-07-26  
**OVERALL:** `WARNING` (review completed; human-action findings + 1 console reachability defect)  
**Import session:** `sess_p2_fbda6bfdbeb462c00f25f88f` (status `COMMITTED`)  
**Batch:** `BATCH-GTH-20260724-001`  
**Mode:** READ-ONLY business review. No database writes, no code changes, no workflow changes, no approvals, no publishes, no storage uploads, no git commit/push.

**Evidence method:** direct read-only SQL against the Staging DB (session pooler, `BEGIN TRANSACTION READ ONLY` … `ROLLBACK`), plus read-only module-level checks of the Review Console data layer and Reviewer Gate assertions, plus one live HTTP browse attempt against a local dev server (started read-only for this review, stopped afterwards). Working evidence: `.work/business-review/batch001-business-review-data.json`.

---

## Part 1 — Batch001 Data Review

### 1.1 Developers (5) — `DEVELOPER_REVIEW: WARNING`

| # | candidate_id | Source ID | Name | Website | DNS | identity_status | review_state | Verdict |
| - | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | candidate-dev-123aa5c84aef2f8d | `supalai` | บริษัท ศุภาลัย จำกัด (มหาชน) | supalai.com (verified) | ok | UNKNOWN | REVIEW_REQUIRED | PASS |
| 2 | candidate-dev-d17cea58364f6b68 | `ap-thailand-public` | บริษัท เอพี (ไทยแลนด์) จำกัด (มหาชน) | apthai.com (verified) | ok | UNKNOWN | REVIEW_REQUIRED | PASS |
| 3 | candidate-dev-fc7c9b19837a92ac | `sansiri` | บริษัท แสนสิริ จำกัด (มหาชน) | sansiri.com (verified) | ok | UNKNOWN | REVIEW_REQUIRED | PASS |
| 4 | candidate-dev-8418ce1799a40a82 | `infinite-real-estate` | บริษัท อินฟินิท เรียลเอสเตท จำกัด | none | unknown | UNKNOWN | REVIEW_REQUIRED | WARNING |
| 5 | candidate-dev-e0ad945031347d4f | `bundarn` | บริษัท บันดาล จำกัด | none | unknown | UNKNOWN | REVIEW_REQUIRED | WARNING |

- Duplicates: **none** (`normalized_name` group check: 0 groups; `duplicate_group_id` all null).
- Obvious data errors: **none** in names/source IDs. All 5 carry the `UNKNOWN` identity marker as expected (no canonical links exist — verified `canonical_developer_id` is null on all 5).
- Observation (LOW): `normalized_name` strips Thai vowel/tone marks (e.g. `บร ษ ท ศ ภาล ย …`). Deterministic, but may weaken future name-based duplicate matching. No action this milestone.
- Verdict rationale: #1–#3 are well-known listed developers with verified official websites → identity resolution is straightforward human work. #4–#5 have **no official website evidence and unknown DNS** → require research before any canonical link.

### 1.2 Projects (10) — `PROJECT_REVIEW: WARNING`

| candidate_id | Name | Developer link | Province (confidence) | Status | review_state |
| --- | --- | --- | --- | --- | --- |
| 36925 | สิรินทร์ ราชพฤกษ์ – สาย 3 | **none** | กรุงเทพ (LOW) | STAGING_CANDIDATE | REVIEW_REQUIRED |
| 36926 | ชอว์น | **none** | กรุงเทพ (LOW) | STAGING_CANDIDATE | REVIEW_REQUIRED |
| 36931 | ลิฟวิ่ง เซนส์ 2 บ้านฉาง-ระยอง | **none** | ระยอง (MEDIUM) | STAGING_CANDIDATE | REVIEW_REQUIRED |
| 36933 | เศรษฐสิริ เกรท วงแหวน–จตุโชติ | sansiri | กรุงเทพ (LOW) | STAGING_CANDIDATE | REVIEW_REQUIRED |
| **36936** | ศุภาลัย ปาล์มวิลล์ อมตะ-บายพาส | supalai | กรุงเทพ (LOW) ⚠ conflict | STAGING_CANDIDATE | **REVIEW_REQUIRED** ✓ |
| 36939 | ดาเวน พระราม 9 | bundarn | กรุงเทพ (LOW) | STAGING_CANDIDATE | REVIEW_REQUIRED |
| 36940 | อภิทาวน์ หัวหิน | ap-thailand-public | หัวหิน (MEDIUM) ⚠ | STAGING_CANDIDATE | REVIEW_REQUIRED |
| 36941 | อภิทาวน์ สระบุรี | ap-thailand-public | สระบุรี (MEDIUM) | STAGING_CANDIDATE | REVIEW_REQUIRED |
| 36942 | เดอะ ซิตี้ บางนา 3 | ap-thailand-public | กรุงเทพ (LOW) | STAGING_CANDIDATE | REVIEW_REQUIRED |
| 36945 | โซลาวา พัทยา | infinite-real-estate | พัทยา (MEDIUM) ⚠ | STAGING_CANDIDATE | REVIEW_REQUIRED |

- **Hard requirement met:** Project 36936 `review_state = REVIEW_REQUIRED`. ✓
- All 10 projects `REVIEW_REQUIRED`; 0 approved/published.
- WARNING findings (human confirmation required, no auto-fix):
  - 3 projects have **no developer linkage** (36925, 36926, 36931).
  - **36940 province "หัวหิน"** — Hua Hin is a district of Prachuap Khiri Khan, not a province.
  - **36945 province "พัทยา"** — Pattaya is a city in Chonburi, not a province.
  - **36936** name indicates อมตะ-บายพาส (Amata–Bypass, Chonburi industrial corridor) but province recorded as กรุงเทพ — the registered `PROVINCE_NAME_CONFLICT` is legitimate and needs human resolution.
  - 6 provinces at LOW confidence (36925, 36926, 36933, 36936, 36939, 36942).
- Observation (LOW): `staging_projects.province_conflict = false` for 36936 even though a conflict candidate row exists (conflict is tracked in `staging_conflict_candidates` targeting `review_item/36936`); flag inconsistency worth noting for a later engineering milestone.
- Brand-consistency spot checks look plausible: เศรษฐสิริ (Setthasiri) → Sansiri ✓; เดอะ ซิตี้ (The City) → AP ✓; ศุภาลัย → Supalai ✓.

### 1.3 Assets (9) — `ASSET_REVIEW: PASS`

| Check | Result |
| --- | --- |
| File paths | 9/9 `images/<sha-prefix>.jpg`, consistent naming | 
| Hash | 9/9 sha256 present; candidate_id/filename = sha256 prefix (consistent); 0 duplicate hashes |
| MIME | 9/9 `image/jpeg`, width/height/file_size present |
| Project linkage | 9/9 linked to existing batch projects (`linkage_status = PASS`): 36941 ×1, 36942 ×4, 36945 ×4 |
| Orphans | **0** |
| Storage | 9/9 `storage_status = PLANNED`, `storage_object_id` null (0 uploads) ✓ |

Coverage note (feeds Business Risk, not an asset-integrity failure): only **3 of 10** projects have images; 31 `IMAGE_FETCH_FAILED` review items explain the gap.

### 1.4 PDFs (5) — `PDF_REVIEW: WARNING`

| candidate_id | Category | Source | Linked project | Hash |
| --- | --- | --- | --- | --- |
| 13566d72… | brochure | sansiri.com (Burasiri Ratchaphruek 345) | **null** | OK |
| 13c2c15a… | floor_plan | sansiri.com (The Line Phahonyothin Park) | **null** | OK |
| 3137ec40… | brochure | AP S3 (`o77site`, Via Ari) | **null** | OK |
| 3fb67cce… | company_profile | sansiri.com (company profile) | **null** | OK |
| 44b2040c… | brochure | sansiri.com (dcondo tann) | **null** | OK |

- Hashes: 5/5 sha256 present and consistent with candidate_id/filename; 0 duplicate hashes. MIME 5/5 `application/pdf`, page counts present. Storage 5/5 `PLANNED`, 0 uploads.
- **WARNING:** all 5 PDFs have `project_candidate_id = null` (orphaned relative to the batch), and the projects they reference (Burasiri Ratchaphruek 345, The Line Phahonyothin Park, Via Ari, dcondo tann) are **not among the 10 batch projects**. Business value within this batch is unclear — human decision needed (keep as developer-level documents, link later, or reject).

### 1.5 News (10) — `NEWS_REVIEW: WARNING`

| Check | Result |
| --- | --- |
| Titles | 10/10 present, plausible, market-level Thai property news |
| Sources | Reputable domains: bangkokpost.com ×4, nationthailand.com ×3, thepattayanews.com, iqiglobal.com, realestateasia.com |
| URLs | 10/10 well-formed; 0 duplicate URLs |
| Dates | **`published_at` null on 10/10** (only `captured_at` 2026-07-24); matches the 10 `MISSING_PUBLISHED_DATE` review items |
| Project / developer linkage | **0/10 linked** (all `project_candidate_id` and `developer_candidate_id` null) |
| States | 10/10 `REVIEW_REQUIRED`, confidence MEDIUM, none published (hard CHECK forbids `PUBLISHED`) |

### 1.6 Review Items (63) — `REVIEW_ITEM_SUMMARY`

By rule (mapped_reason):

| Rule | Count |
| --- | --- |
| REVIEW_REQUIRED | 62 |
| CONFLICT | 1 |

By source reason (business-level rule):

| Source reason | Count | Severity |
| --- | --- | --- |
| IMAGE_FETCH_FAILED | 31 | medium |
| PROVINCE_LOW_CONFIDENCE | 12 (6 project-target + 6 review_item-target mirrors) | medium |
| MISSING_PUBLISHED_DATE | 10 | medium |
| UNKNOWN_DEVELOPER | 9 (5 developer-target high + 4 project-target medium) | high / medium |
| PROVINCE_NAME_CONFLICT | 1 | high |
| **Total** | **63** | |

By severity:

| Severity | Count |
| --- | --- |
| medium | 57 |
| high | 6 |

By target (entity_type):

| Target | Count |
| --- | --- |
| review_item | 38 |
| news | 10 |
| project | 10 |
| developer | 5 |

All 63 items: `blocking = true`, `suggested_action` = HUMAN_REVIEW (62) / RESOLVE_CONFLICT (1), `reviewer_id`/`decision`/`reviewed_at` = **null on all** (0 decisions recorded — confirms nothing was reviewed/approved).

Observation (LOW): the 6 `PROVINCE_LOW_CONFIDENCE` projects appear twice (once as `project` target, once as `review_item` target) — by design of the import mapping, but reviewers should expect the duplication.

### 1.7 Conflict (1) — `CONFLICT_SUMMARY: CONFIRMED`

| Field | Value |
| --- | --- |
| Target | Project **36936** (ศุภาลัย ปาล์มวิลล์ อมตะ-บายพาส) |
| Conflict type | `PROVINCE_NAME_CONFLICT` ✓ |
| Severity | high |
| Conflict `review_state` | `CONFLICT` (table CHECK enforces this) |
| Project 36936 `review_state` | `REVIEW_REQUIRED` ✓ |
| Review required | YES — human must decide province (name suggests Chonburi/Amata; record says กรุงเทพ) |
| Evidence | https://www.terrabkk.com/projects/show/36936 |

---

## Part 2 — UNKNOWN Developers (5) — `UNKNOWN_DEVELOPER_SUMMARY`

Canonical developer links in DB: **0** (verified). None were created during this review.

| Source ID | candidate_id | Linked projects | Blast radius | Manual handling advised |
| --- | --- | --- | --- | --- |
| `supalai` | candidate-dev-123aa5c84aef2f8d | 36936 | 1 project — and it is the conflict project | **YES** — listed PCL, website verified; straightforward canonical link, but resolve together with the 36936 province conflict |
| `ap-thailand-public` | candidate-dev-d17cea58364f6b68 | 36940, 36941, 36942 | 3 projects + 5 images (largest impact in batch) | **YES** — listed PCL, website verified; highest-leverage link |
| `sansiri` | candidate-dev-fc7c9b19837a92ac | 36933 | 1 project; 4 unlinked sansiri.com PDFs are plausibly related | **YES** — listed PCL, website verified; also decide PDF ownership |
| `infinite-real-estate` | candidate-dev-8418ce1799a40a82 | 36945 | 1 project + 4 images | **YES** — no official website evidence; requires identity research first |
| `bundarn` | candidate-dev-e0ad945031347d4f | 36939 | 1 project | **YES** — no official website evidence; requires identity research first |

No canonical links were auto-created (prohibited); `canonical_developer_id` remains null everywhere. ✓

---

## Part 3 — Review Queue — `REVIEW_QUEUE`

| Queue bucket | Count | Definition used |
| --- | --- | --- |
| Review Required | **62** | review items in `REVIEW_REQUIRED` |
| Conflict | **1** | review items in `CONFLICT` (project 36936) |
| Ready | **14** | entities at the allowed ceiling `READY_FOR_APPROVAL` (9 assets + 5 PDFs) — *not* approved |
| Blocked | **63** | review items with `blocking = true` (100% of queue blocks approval progression) |
| Approved / Ready-for-production / Published | **0** | forbidden states — verified 0 across all entity tables |

Dashboard reading: the entire batch is parked at the human-review stage. Nothing can progress until the 63 blocking items receive human decisions; the approval/publish stages remain empty and gated.

---

## Part 4 — Review Console — `REVIEW_CONSOLE: FAIL` (reachability)

Route: `/internal/review/windows01/batches/BATCH-GTH-20260724-001`, flag `FEATURE_GOTH_REVIEW_CONSOLE=true`, local dev server (read-only page; approve/publish/delete intentionally absent).

| Capability | Result | Evidence |
| --- | --- | --- |
| 浏览 (Browse) | **FAIL** | Live HTTP test: `GET /internal/...` → **307** to `/{locale}/internal/...` (locale proxy in `src/proxy.ts` does not exempt `/internal`), and `/en|zh/internal/...` → **404** (route lives outside the `[locale]` segment). The console page is unreachable in a real browser. |
| 搜索 (Search) | PASS | Data-layer check: query `36936` → 3 rows; `UNKNOWN` over developers → 5 |
| 筛选 (Filter) | PASS | `REVIEW_REQUIRED` → 62; `CONFLICT` → 1; severity high → 6, medium → 57 |
| 分页 (Pagination) | PASS | pageSize 20: page1 = 20, page2 = 20, page4 = 3, total 63 |
| 详情页 (Detail) | PASS | Row payload carries evidence, sourceReason/mappedReason, suggestedAction, blocking, reviewState (View Evidence / Source Metadata implemented) |
| 排序 (Sort) | WARNING | No interactive sort control in the client; ordering is deterministic bundle order only (verified stable across runs) |
| 性能 (Performance) | PASS | Bundle load 3.3 ms; search+filter+pagination pass 0.2 ms at 63 rows (trivial at this scale) |

Note: the previous milestone's console verification was performed at the data/CLI level, which passes; the HTTP reachability defect is a **new finding of this business review**. No fix was applied (code changes prohibited this milestone).

---

## Part 5 — Reviewer Gate — `REVIEWER_GATE: PASS`

Re-verified via read-only assertion calls (no DB access needed) + DB state:

| Gate check | Result |
| --- | --- |
| `STAGING_REVIEWER_GATE_ENABLED` | true |
| `STAGING_COMMIT_ENABLED` / `STAGING_STORAGE_UPLOAD_ENABLED` | false / false |
| `assertApproverActionBlocked(APPROVE / PUBLISH / REJECT)` | throws `InvalidReviewStateError` — **BLOCKED** |
| `assertAutomationCannotApproveOrPublish(APPROVED / PUBLISHED / READY_FOR_PRODUCTION)` | throws — **BLOCKED** |
| `assertAutomationAllowed(APPROVED / PUBLISHED)` | throws `ForbiddenAutomationStateError` — **BLOCKED** |
| `assertReviewMutationAllowed(APPROVED / PUBLISHED / READY_FOR_PRODUCTION)` | throws — **BLOCKED** |
| DB: entities/review items in APPROVED / READY_FOR_PRODUCTION / PUBLISHED | **0** |
| DB: review decisions recorded (`reviewer_id`/`decision`/`reviewed_at`) | **0** |
| DB: storage objects | **0** (all storage_status `PLANNED`) |
| Session flags | `production_allowed = false`, `storage_write_allowed = false` |

Approve / Publish / Production: **all blocked**. Production: **UNCHANGED**.

---

## Part 6 — Business Risks — `BUSINESS_RISKS`

All items require **human confirmation**; nothing was auto-modified.

### HIGH

| # | Risk | Impact | Human action needed |
| - | --- | --- | --- |
| H1 | 5 developers unresolved (`UNKNOWN`), 0 canonical links | Every project in the batch ultimately depends on developer identity; approval cannot proceed safely | Human canonical-link decision per developer (3 easy: Supalai/AP/Sansiri; 2 need research: infinite-real-estate, bundarn) |
| H2 | Project 36936 `PROVINCE_NAME_CONFLICT` (record: กรุงเทพ; name indicates อมตะ-บายพาส / Chonburi corridor) | Wrong province would misfile the listing and its SEO/geo pages | Human resolves province with source evidence (terrabkk page) |
| H3 | Review Console unreachable over HTTP (locale proxy redirect → 404) | Human reviewers cannot use the console in a browser — blocks the review workflow this batch is waiting on | Approve a one-line proxy exemption for `/internal` in a future engineering milestone (no change made now) |

### MEDIUM

| # | Risk | Impact | Human action needed |
| - | --- | --- | --- |
| M1 | 31 of ~40 image fetches failed → only 3/10 projects have images | 7 projects would go to approval with zero media | Decide re-fetch vs. accept-without-media per project |
| M2 | All 5 PDFs unlinked; referenced projects are not in this batch | PDFs contribute no value to Batch001 as-is | Decide keep-as-developer-docs / link-later / reject |
| M3 | All 10 news items lack `published_at` and have no project/developer linkage | Freshness and relevance cannot be asserted; publication risk if ever approved as-is | Human supplies/verifies dates; decide linkage or keep as market-news pool |
| M4 | 3 projects without developer (36925, 36926, 36931) | Orphan projects cannot be attributed or approved safely | Human identifies developers or defers these projects |
| M5 | Province values "หัวหิน" (36940), "พัทยา" (36945) are not provinces | Geo taxonomy pollution if committed to production later | Human corrects to ประจวบคีรีขันธ์ / ชลบุรี during review workflow |

### LOW

| # | Risk | Note |
| - | --- | --- |
| L1 | `normalized_name` strips Thai vowel/tone marks | May weaken duplicate matching quality later; monitor |
| L2 | `summary.json.totalReviewItems = 38` vs authoritative 63 | Known non-authoritative metadata (documented in activation report) |
| L3 | `staging_projects.province_conflict = false` for 36936 despite existing conflict row | Flag inconsistency; conflict is still fully tracked in the conflict table |
| L4 | 6 PROVINCE_LOW_CONFIDENCE items duplicated across `project` and `review_item` targets | By design; reviewers should expect double entries |
| L5 | No interactive sort in Review Console | Acceptable at 63 rows; revisit for larger batches |

---

## Non-goals honored this milestone

| Action | Status |
| --- | --- |
| Approval / Publish / Production / Deploy | NOT_EXECUTED |
| Storage upload | NOT_EXECUTED (0 objects) |
| Database writes | NONE (all SQL inside `BEGIN TRANSACTION READ ONLY` → `ROLLBACK`) |
| Business data / Review Item / Conflict / Canonical Link modification | NONE |
| Code / workflow changes | NONE (working scripts live only in gitignored `.work/business-review/`) |
| git commit / push | NOT_EXECUTED |
