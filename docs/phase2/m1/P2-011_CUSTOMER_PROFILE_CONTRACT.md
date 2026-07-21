# P2-011 — Customer Profile Contract

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| user_id | uuid | yes | PK = auth.users.id |
| email | text | no | From auth; minimal PII |
| display_name | text | no | Optional |
| preferred_locale | text | yes | en/zh/th |

Maps to `PHASE2_DATA_MODEL_IMPACT.md` `customer_profile`.
**PII minimization:** No national ID, no passport, no address in M1.
