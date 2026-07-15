# AGENT_ID_RECONCILIATION_REPORT

**Date:** 2026-07-15  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main` @ `c363284d0d30090733a035e654ce21b98ee70148`  
**Freeze tag:** `platform-alpha-data-freeze-v1` (local peel `8cd3595…`, remote tag object `ac8be78…`)  
**Mode:** Read-only investigation — **no backfill executed**

## Baseline print

| Check | Value |
|-------|--------|
| Repository root | `/Users/jun/AI-Workspace/Projects/GoThailandHome` |
| Branch | `main` |
| HEAD | `c363284d0d30090733a035e654ce21b98ee70148` |
| Origin | `git@github.com:taifaithnm-gif/gothailandhome.git` |
| Working tree (start) | clean |
| Freeze tag | present locally and on origin |

## Executive finding

The “12 properties with `agent_id`” were **never lost as relations**. They remain linked to the two demo agents from `supabase/seed.sql`. They were deliberately moved to **`status = 'draft'`** by Phase 5 migration SQL so placeholder inventory would not appear as public Alpha stock.

| Count type | Value | Environment / filter |
|------------|------:|----------------------|
| Freeze-era doc row | **12** | Aggregate: any `properties.agent_id IS NOT NULL` (status-agnostic) |
| P0 live check | **0** | `status = published` AND `agent_id IS NOT NULL` |
| Live any status | **12** | Supabase service-role (2026-07-15) |
| Live draft + agent | **12** | all 12 seed slugs |
| Imported listings with agent | **0** | `source IS NOT NULL` |

Evidence: `pipelines/factory/overnight/_runs/agent-id-recon.json`

## 1. Where each count came from

| Source of “12” | Environment | How counted |
|----------------|-------------|-------------|
| `DATA_INTEGRITY_REPORT.md` (freeze-era / retained row) | Generated report over live Supabase at freeze | `agent_id` non-null among ~1331 properties (12 + 1319 null) |
| `ALPHA_READINESS_REPORT.md` | Same freeze snapshot | “12/1331” |
| P0 `CONTACT_SAFETY_VALIDATION_REPORT.md` / `check-agent-relations.mjs` | Supabase production | **Published-only** filter → 0 |
| Repository packages | `content/projects/**/listings*.json` | **0** agent fields (schema has no agent key) |
| Frontend query | `listPublishedProperties*` | Only published (+ often verified) → never shows the 12 drafts |
| Local DB | Same Supabase project as env | Same live results |

## 2. Do the 12 historical relations still exist?

| Location | Present? | Notes |
|----------|----------|-------|
| Live `properties` | **Yes** | All 12 seed UUIDs/slugs, `agent_id` set, `status=draft` |
| Live `agents` | **Yes** | `anya-chen`, `somchai-wong` (2 rows) |
| Git `supabase/seed.sql` | **Yes** | Introduced in foundation seed commit |
| Migration artifacts | **Yes** | `20260714190000_platform_geography.sql` drafts placeholders |
| Source listing packages | **No** | No agent fields on PH/LI/DP/FZ imports |
| `config/contacts.json` | N/A | Platform CS only (Apple / Khun ICE) — not listing agents |

### Exact 12 records

| Property UUID | Slug | Agent | Live status |
|---------------|------|-------|-------------|
| `…555501` | `bangkok-riverside-condo` | Anya Chen | draft |
| `…555502` | `phuket-pool-villa` | Somchai Wong | draft |
| `…555503` | `chiang-mai-garden-house` | Anya | draft |
| `…555504` | `hua-hin-beach-house` | Somchai | draft |
| `…555505` | `pattaya-sea-view-condo` | Anya | draft |
| `…555506` | `bangkok-sukhumvit-condo` | Anya | draft |
| `…555507` | `silom-office-floor` | Anya | draft |
| `…555508` | `bangtao-land-plot` | Somchai | draft |
| `…555509` | `riverside-family-condo` | Anya | draft |
| `…555510` | `phuket-hillside-villa-rent` | Somchai | draft |
| `…555511` | `chiang-mai-cafe-commercial` | Anya | draft |
| `…555512` | `hua-hin-land-near-golf` | Somchai | draft |

Agents: `3333…301` Anya (`anya@gothailandhome.com`), `3333…302` Somchai (`somchai@gothailandhome.com`).

## 3. Root cause classification

| Hypothesis | Result |
|------------|--------|
| Data deletion of agent links | **No** — links intact |
| Field rename | **No** |
| Relationship-table change | **No** (still `properties.agent_id`) |
| Environment mismatch | **Partial** — docs vs published-only query |
| Importer clears agent_id | **No** — importers omit the field |
| **Intentional unpublish of placeholders** | **Yes** |
| Stale documentation | **Yes** — freeze row did not clarify “draft seed demos” |

Causal SQL (`supabase/migrations/20260714190000_platform_geography.sql`):

```sql
-- Hide Phase 3 placeholder inventory from the public platform (no invented stock)
update public.properties
set status = 'draft'
where listing_url is null
  and (source is null or source = '');
```

`updated_at` on all 12 drafts: `2026-07-14T11:33:22.972431+00:00` (consistent batch).

## 4–5. Candidate verification (no restore)

| Candidate | Listing identity | Agent identity | Source of contact | Evidence | Safe to restore as public? |
|-----------|------------------|----------------|-------------------|----------|------------------------------|
| 12 seed demos | Deterministic seed UUIDs | Demo GTH emails | Seed only | `supabase/seed.sql` | **No for Alpha public** — placeholders |
| Any imported listing | Packages n=1315 | None | None in packs | Listing JSON / importers | **Cannot invent** |

## Conclusion

Discrepancy = **query semantics + intentional draft of demo stock**, not accidental wipe of agent relations. Public Alpha inventory (verified sourced listings) still has **0** real listing-agent links. That is a product coverage gap, not a restore-of-seed problem.
