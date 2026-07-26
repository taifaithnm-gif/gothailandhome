# Staging Review API Contract

Path: `/api/internal/staging/review/[candidateId]`  
Auth required. Feature flag default false. Production disabled.  
Optimistic concurrency via `version`.  
Forbidden states: APPROVED / READY_FOR_PRODUCTION / PUBLISHED.

No anonymous write endpoints in this milestone.
