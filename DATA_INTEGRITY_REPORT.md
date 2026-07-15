# Data Integrity Report (Platform Alpha Freeze)

**Date:** 2026-07-15  
**Commit:** `8cd3595f98407ed49c566846e8f4ff02c4289bea`  
**Tag:** `platform-alpha-data-freeze-v1`

## Authority baseline (frozen)

| Metric | Value | Gate |
|--------|------:|------|
| PropertyHub | 617 | PASS |
| LivingInsider | 316 | PASS |
| DotProperty | 192 | PASS |
| FazWaz | 190 | PASS |
| Total source listing records | **1,315** | PASS |
| Developers (content master) | **20** | PASS |
| Projects (content folders) | **50** | PASS |
| Listing integrity script | ok | PASS |
| Listing files byte-dirty vs HEAD | 0 | PASS |

## Supabase reconciliation (read-only)

| Table | Count | Notes |
|-------|------:|-------|
| `property_listing_sources` | 1,315 | Matches freeze |
| `properties` | 1,331 | Superset; freeze authority remains source packages |
| `developers` | 23 | Content master 20 + 3 stubs (e.g. Andaman Homes, Northern Estate, Sathorn Living) |
| `property_projects` | 52 | Content folders 50 + 2 extra rows |
| `agents` | 2 | Coverage thin |
| properties with `agent_id` | 12 | 1319 null |
| `cities` | 6 | |
| `districts` | 56 | |
| `marketplace_leads` | 0 | Tables exist |
| `marketplace_lead_activities` | 0 | Tables exist |

## Contact integrity

- Apple `contact_role` = `platform_customer_success` only.
- Contact-role invariant tests PASS.
- Live listing UI does not assign Apple as listing owner.

## What was not modified

- No harvest
- No schema changes
- No Supabase data writes during audit
- No listing price / provenance / fingerprint edits

## Unexpected deltas?

**No unexpected source-count drift.**  
DB supersets (properties 1331, developers 23, projects 52) are documented operational deltas, not package harvest changes. They are **P2 cleanup** items after alpha stabilisation, not freeze blockers.
