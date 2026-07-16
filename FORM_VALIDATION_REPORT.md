# FORM_VALIDATION_REPORT

**Phase:** 9 — M1 Marketplace Foundation  
**Date:** 2026-07-16  
**Suite:** `npm run test:marketplace-forms`

## Result

**PASS**

## Shared validators (`src/lib/marketplace/form-validation.ts`)

| Rule | Code | Applies to |
|------|------|------------|
| Name + phone or email | `name_and_contact_required` | Find My Home, List Your Property, Viewing |
| Consent | `consent_required` | All entry forms |
| Invalid email format | `invalid_email` | When email provided |
| Company + rep + channel | `company_contact_required` | Developer Partnership |
| Agency + rep + channel | `agency_contact_required` | Agency Partnership |
| Project required | `project_required` | List Your Property |
| Price required | `price_required` | List Your Property |
| Authorization | `authorization_required` | List Your Property |

## UI state contract (all five entry forms)

| State | Mechanism |
|-------|-----------|
| Validation failure | `errorCode` → `resolveMarketplaceError` → `FormFailureBanner` |
| Loading | `FormSubmitButton` `pending` / `aria-busy` |
| Success | `FormSuccessState` + reference + `nextSteps` |
| Placeholder accept | `mode: "placeholder"` with reference (no email/CRM) |

## Multilingual

Dictionary keys present in **en**, **zh**, **th**:

- `marketplace.errors.*` (including `generic`, contact, partnership, list, email)
- `marketplace.successTitle`
- `marketplace.referenceLabel`
- `marketplace.nextSteps`

## Mobile

- Form kit uses responsive grid (`sm:grid-cols-2`) and full-width submit on small screens.
- Viewing form uses compact shell padding for property sidebar context.

## Apple guard

Test asserts five entry forms + `form-kit` do **not** contain the string `Apple`.

## Command evidence

```
npm run test:marketplace-forms → {"ok":true}
```
