# P2-003 — Feature Flag & Environment Policy

**Date:** 2026-07-21
**Code:** `src/lib/feature-flags/`

---

## Naming standard

```text
FEATURE_P2_<DOMAIN>[=true|false]
```

| Flag env | Domain | Default |
| --- | --- | --- |
| `FEATURE_P2_ACCOUNT` | Customer auth + dashboard + saved searches | `false` |
| `FEATURE_P2_OPS_LEADS` | Staff lead inbox under `/admin/ops` | `false` |
| `FEATURE_P2_NOTIFICATIONS` | Notification outbox + prefs | `false` |
| `FEATURE_P2_CRM_SYNC` | CRM outbound adapter | `false` |
| `FEATURE_P2_ACQUISITION` | Property acquisition workflow | `false` |
| `FEATURE_P2_PARTNER_PORTAL` | Developer/agent partner portal | `false` |
| `FEATURE_P2_MAP` | Interactive map surfaces | `false` |
| `FEATURE_P2_TOOLS` | Finance + legal tools | `false` |
| `FEATURE_P2_AI` | L0 recommend + investment assist | `false` |
| `FEATURE_P2_AI_KILL_SWITCH` | Forces AI provider mode to disabled | `false` |
| `FEATURE_P2_ANALYTICS_EXPANSION` | Phase 2 expanded analytics events | `false` |

Public mirrors (optional, client-safe booleans only):

- `NEXT_PUBLIC_FEATURE_P2_ACCOUNT`
- `NEXT_PUBLIC_FEATURE_P2_ACQUISITION`
- `NEXT_PUBLIC_FEATURE_P2_PARTNER_PORTAL`
- `NEXT_PUBLIC_FEATURE_P2_MAP`
- `NEXT_PUBLIC_FEATURE_P2_TOOLS`
- `NEXT_PUBLIC_FEATURE_P2_AI`

## Rules

1. Defaults are **off** — production remains Phase 1 behavior until Owner enables flags.
2. Do not change production Vercel env from implementation tasks; document required keys only.
3. Flags are read at runtime via `src/lib/feature-flags/index.ts`.
4. Gated routes must 404 or redirect to safe Phase 1 surfaces when flag is off.

## Validation

- Policy reviewed: **YES**
- Production env unchanged by this task: **YES**
