# RC2_MARKETPLACE_VALIDATION

**Date:** 2026-07-16  
**HEAD:** `e3a5a9a`  
**Rule:** Do not exaggerate implementation status.

## Shared stack

| Layer | Path | Status |
|-------|------|--------|
| Validation | `src/lib/marketplace/form-validation.ts` | Shared codes; tested |
| Form kit | `src/components/marketplace/form-kit.tsx` | Loading / failure / shell |
| Actions | `src/app/[lang]/marketplace/actions.ts` | Server actions → redirect |
| Storage | `src/lib/marketplace/leads.ts` → `marketplace_leads` | Insert when Supabase env present |
| Success / error | `/[lang]/leads/success`, `/leads/error` | noindex; mode `stored` \| `placeholder` |

**Not implemented:** CRM assignment workflows, email/SMS automation, partner ops dashboards, payment.

## Per-form classification

Definitions used here:

- **production-connected** — writes to live `marketplace_leads` when env is configured  
- **placeholder** — accepted UX path with reference when storage is unavailable (`mode=placeholder`)  
- **frontend-only** — UI + validation only (no durable store)  
- **backend-ready** — DB table + insert path exist; ops tooling incomplete  

| Form | Route / entry | production-connected | placeholder | frontend-only | backend-ready | Notes |
|------|---------------|:--------------------:|:-----------:|:-------------:|:-------------:|-------|
| Find My Home | `/[lang]/find-my-home` | **Conditional** | **Yes (fallback)** | No | **Yes** | Private demand; never published |
| List Your Property | `/[lang]/list-your-property` | **Conditional** | **Yes (fallback)** | No | **Yes** | Forces `pending_review`; no auto-publish |
| Viewing Request | Listing contact card | **Conditional** | **Yes (fallback)** | No | **Yes** | Tied to property when provided |
| Developer Partnership | `/[lang]/partners/developers` | **Conditional** | **Yes (fallback)** | No | **Yes** | Pending until human review |
| Agency Partnership | `/[lang]/partners/agencies` | **Conditional** | **Yes (fallback)** | No | **Yes** | Pending until human review |

**Honest summary:** All five are **frontend-complete + backend-ready**, with **production-connected storage when Supabase is configured**, and an intentional **placeholder success path** otherwise. None are CRM-complete or “production ops connected.”

## Gates

| Gate | Result |
|------|--------|
| `test:marketplace-forms` | PASS |
| `test:lead-foundation` | PASS |
| Apple not hardcoded as form owner | PASS |
| Success pages claim no CRM email | PASS (copy + tests) |
