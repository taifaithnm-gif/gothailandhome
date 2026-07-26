# Staging Security Model

- Physical project isolation required
- STAGING_* credentials only
- Production hard block before client init
- service_role CLI-only
- Storage upload default OFF
- Atomic commit via RPC (not client multi-insert)
