# 04 — API Architecture

**Document ID:** `04_API_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define logical API surfaces for Data Factory operations and future Intelligence services — contracts and boundaries only, no routes or code.

## 2. Components

| API Surface | Audience | Plane |
| --- | --- | --- |
| **Catalog Read API** | Website / BFF | Serving (Supabase client or thin BFF) |
| **Factory Ops API** | CMS/Admin/CLI | Control |
| **Review API** | Reviewers | Control |
| **Import/Export Job API** | Data Ops | Control |
| **Windows01 Worker API** | Internal workers | Execution |
| **Search API** | Website | Serving/Intelligence |
| **Recommend API** | Website | Intelligence |

## 3. Responsibilities

- Expose business contracts as stable interfaces (M1).
- Keep Factory Ops off public internet; admin auth required.
- Idempotent job creation with `batch_id` / `job_id`.
- Never expose service-role to browsers.

## 4. Data Flow

```text
Client → (TLS) → AuthZ gate → domain service → store
CLI/CMS → Ops API → validate/dry-run/apply orchestration
Windows01 workers → localhost/Tailscale Worker API → Work DB/MinIO
Website → Search/Recommend APIs → Serving + Vector (approved corpus)
```

## 5. Dependencies

- Security Architecture; Supabase Auth/RLS
- CMS/Admin architectures consume Ops/Review APIs
- Import/Export pipeline architectures

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Auth failure | 401/403; audit |
| Job conflict | Idempotent replay safe |
| Upstream Supabase timeout | Retry with backoff; mark item failed |
| Worker poison message | DLQ + alert |

## 7. Security Considerations

- mTLS or Tailscale for Execution APIs
- Scope tokens: `review`, `import.apply`, `export`, `read`
- Rate limit public Search/Recommend
- Input validation aligned to M0 validator rule packs (logical)

## 8. Scalability

- Async jobs for import/export/embed
- Read APIs cache published projections
- Separate scaling of worker API vs public search

## 9. Future Expansion

- Public partner export API with Owner approval
- Graph query API (read-only)
- Webhooks for publish events

## 10. Windows01 Integration

Worker API is local to Execution Plane; Control Plane calls it only over private network for job dispatch/status — not for prod catalog writes in pilot.

## 11. Cross References

- M1 contracts `11`–`20`; `05_CMS_ARCHITECTURE.md`, `06_ADMIN_ARCHITECTURE.md`
- `10_IMPORT_PIPELINE_ARCHITECTURE.md`, `17_SECURITY_ARCHITECTURE.md`
