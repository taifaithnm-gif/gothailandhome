# CONTACT_PRESENTATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.4 — Listing Detail Alpha

## Separation model

Listing Detail Contact is split into two labeled blocks:

### A — Listing Contact

- Component: `ListingContact`
- Shows Owner / Agent / Agency / Developer Sales Team **only when** an evidence-backed `agent_id` resolves to an agent row
- When missing: honest empty copy from dictionary (`listingContactMissing`)
- Never invents phone, name, LINE, or agency details
- Never renders Apple or platform CS inside this block

### B — Platform Support

- Label: Platform support  
- Note: Platform Customer Success and AI Concierge help only — never listing owner/agent  
- Components: `PlatformCustomerSuccess` (includes Apple) + `AiConcierge`
- Escalation CTA remains “Ask GoThailandHome to help contact the source”

### Request Viewing

Separate card with `ViewingRequestForm` (marketplace lead). Not presented as listing-agent contact.

## Invariants

| Check | Result |
|-------|--------|
| Contact-role tests | PASS |
| Apple = `platform_customer_success` | PASS |
| Card documents non-substitution policy | PASS |
| UI hardcodes Apple as listing agent | No |

## Baseline context

No sourced listing currently has an evidence-backed agent contact in live DB for Alpha. Listing Contact therefore typically shows the honest missing state; Platform Support remains available for assistance.
