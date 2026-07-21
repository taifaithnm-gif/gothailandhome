# Phase 2 Staging Checklist

**Date:** 2026-07-21
**Audience:** Owner / release operator
**Do not skip order.**

---

## 0. Preconditions

- [ ] Engineering RC reports reviewed
- [ ] Staging Supabase project selected (not production unless intentional)
- [ ] Staging Vercel/env project selected
- [ ] Backup / snapshot available for staging DB

## 1. Migration order (apply exactly once)

1. [ ] Confirm Phase 1 migrations already applied
2. [ ] Apply `supabase/migrations/20260721100000_phase2a_customer_ops.sql`
3. [ ] Apply `supabase/migrations/20260721120000_phase2b_acquisition_partners.sql`
4. [ ] Verify tables exist: `customer_*`, `notification_outbox`, `crm_sync_deliveries`, `acquisition_*`, `partner_*`
5. [ ] Verify RLS enabled on new tables

**Do not enable feature flags before step 1–5 succeed.**

## 2. Feature flag enable sequence (staging)

Enable trains one at a time; smoke after each:

| Step | Flags | Smoke |
| --- | --- | --- |
| T1 | `FEATURE_P2_ACCOUNT` (+ `NEXT_PUBLIC_…`) | `/en/account/sign-in`, saved, searches |
| T2 | `FEATURE_P2_OPS_LEADS` | `/admin/ops/leads` |
| T3 | `FEATURE_P2_NOTIFICATIONS` | prefs page; outbox row optional |
| T4 | `FEATURE_P2_CRM_SYNC` + `CRM_WEBHOOK_*` | delivery log / dry webhook |
| T5 | `FEATURE_P2_ACQUISITION` (+ public mirror) | list-your-property → case; `/admin/ops/acquisition` |
| T6 | `FEATURE_P2_PARTNER_PORTAL` (+ public mirror) | seed org+invite; `/partners/app` |
| T7 | `FEATURE_P2_MAP` (+ public mirror) | `/en/map`, district deep link |
| T8 | `FEATURE_P2_TOOLS` (+ public mirror) | `/en/tools`, mortgage, legal |
| T9 | `FEATURE_P2_AI` (+ public mirror); kill switch OFF | property similar rail; investment assist |
| T10 | `FEATURE_P2_ANALYTICS_EXPANSION` | consent-on event firing only |

Rebuild/redeploy when changing `NEXT_PUBLIC_*` values.

## 3. Smoke test (staging URL)

- [ ] Phase 1 home / properties / inquiry still work with all new flags OFF
- [ ] After each train: targeted smoke above
- [ ] EN/ZH/TH locale switch on tools/map
- [ ] Mobile + desktop pass for tools/map/account
- [ ] robots still disallow admin/account/partners/app

## 4. Monitoring

- [ ] Error tracking (Vercel/runtime logs) during each train
- [ ] Supabase auth error rate
- [ ] Acquisition insert rate / rate-limit messages
- [ ] Notification outbox pending depth (if notifications ON)
- [ ] CRM delivery failures (if CRM ON)

## 5. Rollback (staging)

1. [ ] Set all `FEATURE_P2_*` / `NEXT_PUBLIC_FEATURE_P2_*` to false/absent
2. [ ] Redeploy if public flags were baked
3. [ ] Leave tables in place (preferred)
4. [ ] Optional: disable kill-needed AI via `FEATURE_P2_AI_KILL_SWITCH=true`

## 6. Known issues to accept before GO

See `REPORTS/PHASE2_RELEASE_READINESS.md` P2/P3 list.
