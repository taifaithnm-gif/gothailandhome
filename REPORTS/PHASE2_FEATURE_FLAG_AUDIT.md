# Phase 2 Feature Flag Audit

**Date:** 2026-07-21
**Code:** `src/lib/feature-flags/index.ts`
**Policy:** `docs/phase2/m0/P2-003_FEATURE_FLAG_POLICY.md`
**Result:** **PASS**

---

## Inventory

| Flag | Default | Public mirror | Domain |
| --- | --- | --- | --- |
| `FEATURE_P2_ACCOUNT` | OFF | `NEXT_PUBLIC_FEATURE_P2_ACCOUNT` | Customer auth/dashboard/saved |
| `FEATURE_P2_OPS_LEADS` | OFF | — | Admin lead inbox |
| `FEATURE_P2_NOTIFICATIONS` | OFF | — | Outbox + prefs |
| `FEATURE_P2_CRM_SYNC` | OFF | — | CRM webhook adapter |
| `FEATURE_P2_ACQUISITION` | OFF | `NEXT_PUBLIC_FEATURE_P2_ACQUISITION` | Acquisition cases |
| `FEATURE_P2_PARTNER_PORTAL` | OFF | `NEXT_PUBLIC_FEATURE_P2_PARTNER_PORTAL` | Partner app |
| `FEATURE_P2_MAP` | OFF | `NEXT_PUBLIC_FEATURE_P2_MAP` | Map surfaces |
| `FEATURE_P2_TOOLS` | OFF | `NEXT_PUBLIC_FEATURE_P2_TOOLS` | Finance/legal/tools hub |
| `FEATURE_P2_AI` | OFF | `NEXT_PUBLIC_FEATURE_P2_AI` | L0 recommend + invest assist |
| `FEATURE_P2_AI_KILL_SWITCH` | OFF | — | Forces AI mode `disabled` |
| `FEATURE_P2_ANALYTICS_EXPANSION` | OFF | — | Expanded event helpers |

## Defaults verified

- `test:phase2-feature-flags` PASS — all product flags false when unset.
- `.env.example` documents all flags as `false`.

## Dependencies

| Flag | Depends on |
| --- | --- |
| ACCOUNT | Migration 2A + auth |
| OPS_LEADS | Migration 2A |
| NOTIFICATIONS | Migration 2A; optional Resend |
| CRM_SYNC | Migration 2A; `CRM_WEBHOOK_*` |
| ACQUISITION | Migration 2B; optional ACCOUNT link |
| PARTNER_PORTAL | Migration 2B; seeded org/invite |
| MAP | No new migration; project coordinates |
| TOOLS | No new migration |
| AI | TOOLS helpful for invest assist; kill switch independent |
| ANALYTICS_EXPANSION | Consent adapter; no schema |

## Activation order (staging/prod)

T1 ACCOUNT → T2 OPS_LEADS → T3 NOTIFICATIONS → T4 CRM_SYNC → T5 ACQUISITION → T6 PARTNER_PORTAL → T7 MAP → T8 TOOLS → T9 AI → T10 ANALYTICS_EXPANSION

## Rollback order

Reverse of activation (T10→T1), or **all flags OFF** immediately. Prefer kill switch for AI-only emergency.

## Unused / temporary flags

| Flag | Classification |
| --- | --- |
| `FEATURE_P2_AI_KILL_SWITCH` | Safety switch (intentional, not product surface) |
| Optional P2-090–094 | Not flags; excluded residuals |

No unused product flags detected. No temporary debug flags in code.

## Decision

**PASS**
