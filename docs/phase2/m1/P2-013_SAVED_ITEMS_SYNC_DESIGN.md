# P2-013 — Saved Items Sync Design

## Rules

1. Device favorites/compare remain authoritative until user opts in.
2. Opt-in “Merge device saves into account” upserts by slug.
3. Conflicts: union by slug; max favorites 50; compare max 4.
4. Device-only users unaffected when `FEATURE_P2_ACCOUNT` is off or unsigned.

## Validation

Device-only path unchanged (Phase 1 favorites/compare tests remain green).
