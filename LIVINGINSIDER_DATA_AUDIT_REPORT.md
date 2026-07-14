# LIVINGINSIDER_DATA_AUDIT_REPORT

**Date:** 2026-07-14  
**Scope:** All **316** LivingInsider package listings  
**Evidence:** `pipelines/factory/livinginsider/_runs/post-import-li-audit.json`

## Totals

| Metric | Count |
|--------|------:|
| Listings audited | 316 |
| Duplicate `source_listing_id` groups | 0 |
| Duplicate normalized URL groups | 0 |
| Duplicate raw `listing_url` groups | 0 |
| Issue flags | **0** |

## Checks

| Check | Result |
|-------|--------|
| Duplicate source listing IDs | None |
| Duplicate normalized URLs | None |
| Invalid / non-positive price | None |
| Invalid / zero area (when present) | None |
| Missing project relation | None |
| Missing provenance (`source`, URL, ref, updated) | None |
| Missing identity fields (sid / norm URL / fingerprint) | None |
| Malformed verification / lifecycle status | None |
| District mismatch vs project manifest | None |

## Package ↔ DB identity

Source identity field mismatches between package and DB: **0**  
(See reconciliation report for match counts.)

## Action

No records deleted or rewritten in this audit. Dataset passes Wave-1 post-import DQ gates.
