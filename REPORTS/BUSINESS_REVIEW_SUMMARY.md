# Business Review Summary — Batch001

**Milestone:** `BUSINESS_REVIEW_BATCH001` · **Date:** 2026-07-26 · **OVERALL:** `WARNING`  
**Session:** `sess_p2_fbda6bfdbeb462c00f25f88f` · **Batch:** `BATCH-GTH-20260724-001` · **Mode:** read-only (no DB writes, no code changes, no approvals/publishes/uploads, no git)

Full detail: `REPORTS/BUSINESS_REVIEW_BATCH001.md`

## Verdicts

| Area | Verdict | One-line reason |
| --- | --- | --- |
| Developers (5) | WARNING | 3 verified listed developers PASS; 2 (infinite-real-estate, bundarn) lack website/DNS evidence; all 5 UNKNOWN, 0 canonical links |
| Projects (10) | WARNING | 36936 = REVIEW_REQUIRED ✓; but 3 projects lack developers, 2 province values are not provinces (หัวหิน, พัทยา), 6 provinces LOW confidence |
| Assets (9) | PASS | Paths/hash/MIME/linkage all clean, 0 orphans, 0 dup hashes, 0 uploads — but only 3/10 projects have images |
| PDFs (5) | WARNING | Hashes/sources clean, but all 5 unlinked and reference projects outside this batch |
| News (10) | WARNING | Reputable sources, valid URLs, but 10/10 missing published date and 0/10 linked to projects/developers |
| Review items (63) | — | 62 REVIEW_REQUIRED + 1 CONFLICT; 57 medium + 6 high; all blocking; 0 decisions recorded |
| Conflict (1) | CONFIRMED | Project 36936 `PROVINCE_NAME_CONFLICT` (high), review required |
| Review Queue | — | Review Required 62 · Conflict 1 · Ready 14 (READY_FOR_APPROVAL ceiling) · Blocked 63 · Approved/Published 0 |
| Review Console | **FAIL** | Unreachable over HTTP: `/internal/...` gets 307-redirected by the locale proxy to `/{locale}/internal/...` → 404. Search/filter/pagination/detail/performance PASS at data layer; sort WARNING (no control) |
| Reviewer Gate | PASS | Approve/Publish/Production all blocked (11/11 assertions throw); 0 forbidden states in DB; production UNCHANGED |

## Top risks (human confirmation required — nothing auto-modified)

- **HIGH:** 5 UNKNOWN developers (0 canonical links) · 36936 province conflict (record says กรุงเทพ, name says Amata/Chonburi) · Review Console unreachable in a browser (blocks the human review workflow).
- **MEDIUM:** 31 failed image fetches → 7/10 projects have no media · 5 PDFs irrelevant to batch as-is · 10 news without dates/linkage · 3 developer-less projects · 2 invalid province values.
- **LOW:** Thai-vowel-stripping in normalized names · summary.json count mismatch (known) · `province_conflict` flag not set on 36936 · duplicated province items across targets · no console sort control.

## Blockers

1. Review Console HTTP reachability (H3) — one-line proxy exemption needed in a future milestone (not fixed now; code changes prohibited).
2. 63 blocking review items awaiting human decisions; approval pipeline is intentionally empty and gated.

## Next recommended action

Fix the `/internal` locale-proxy exemption in a small approved engineering milestone, then run the human review pass in the console: resolve the 5 developer identities (start with Supalai/AP/Sansiri), rule on the 36936 province conflict, and decide the image/PDF/news dispositions. No approval or publish until those human decisions land.
