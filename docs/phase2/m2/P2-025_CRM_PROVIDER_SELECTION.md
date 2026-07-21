# P2-025 — CRM Provider Selection

**Decision (Phase 2A):** Provider-agnostic **HTTPS webhook** adapter (`CRM_WEBHOOK_URL` + optional `CRM_WEBHOOK_SECRET`).
Maps to HubSpot/Salesforce/custom middleware without hardcoding a vendor SDK.

Commercial Owner approval: webhook mode accepted for MVP; vendor lock deferred.
