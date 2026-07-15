# CONTACT_BACKFILL_PLAN

**Date:** 2026-07-15  
**Status:** Proposed plan only — **no data written**  
**Depends on:** [AGENT_ID_RECONCILIATION_REPORT.md](AGENT_ID_RECONCILIATION_REPORT.md)

## Decision summary

| Action | Decision |
|--------|----------|
| Re-publish 12 seed demos as public contact examples | **Reject for Alpha** |
| Restore `agent_id` links on the 12 drafts | **Not needed** — links already exist |
| Backfill `agent_id` onto imported PH/LI/DP/FZ listings from branding text | **Reject** — insufficient evidence; policy forbids inference |
| Assign Apple / platform CS as listing agents | **Forbidden** |
| New evidenced contact pipeline | **Deferred** — requires source fields + ops process |

## Classification of known candidates

| Candidate set | Class | Rationale |
|---------------|-------|-----------|
| Seed 12 demo property↔agent pairs | **INVALID_RELATION** for public Alpha inventory | Intentionally unpublished placeholders; contacts are GoThailandHome demo emails, not source brokers |
| Seed pairs kept as draft admin fixtures | **SAFE_TO_RESTORE** only as *seed replay into empty envs* | Exact SQL in repo; not a marketplace backfill |
| Infer agent from “PropertyScout” / portal branding in description | **INSUFFICIENT_EVIDENCE** | Names/phones often hidden; no structured agent id in packages |
| Use Apple as fallback listing contact | **INVALID_RELATION** | `platform_customer_success` only |
| Admin-assigned agent after verified source contact capture | **NEEDS_MANUAL_REVIEW** | Possible future path with audit trail |

## Rules (unchanged)

- Never assign Apple as agent, owner, agency, or developer contact  
- Do not infer agent from source branding alone  
- Do not use platform support as listing-contact fallback  
- Do not change schema in this workstream  

## If a future evidenced backfill is approved

1. Capture structured `listing_contact_*` or broker identity from source pages into packages (new fields — may need schema later).  
2. Create/verify `agents` rows with real identifiers (not platform CS).  
3. Admin or scripted update **only** when evidence URL + contact match.  
4. Regression: contact-role tests + `agent_id` published count by source.  

**Stop condition met:** stop before writing data — **no SAFE_TO_RESTORE public listing relations** for the 1,315 imported records.
