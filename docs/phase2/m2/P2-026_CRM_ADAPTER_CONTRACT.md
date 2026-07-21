# P2-026 — CRM Adapter Contract

- Outbound: `pushLeadToCrm` → signed JSON body
- Inbound signature verify: `verifyCrmWebhookSignature`
- Persistence: `crm_sync_deliveries` with dead-letter status
- Lag: oldest pending `created_at`
- Idempotency key: `external_id` = marketplace lead UUID
