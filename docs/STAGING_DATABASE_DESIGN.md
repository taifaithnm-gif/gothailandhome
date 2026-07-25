# Staging Database Design (Import Framework View)

**Status:** Design for Staging Import Framework V1
**Writes in V1:** None (dry-run transaction only)

## Intended staging entities (future)

| Table (logical) | Source entity | Notes |
| --- | --- | --- |
| `staging_import_sessions` | Import Session | session id, batch id, phase, audit fingerprint |
| `staging_developers` | Developer | aliases, UNKNOWN, website, confidence |
| `staging_projects` | Project | developer link, province, slug, route candidate |
| `staging_assets_images` | Image | hash, mime, dims, **mock** storage path |
| `staging_assets_pdfs` | PDF | hash, pages, category |
| `staging_news` | News | source URL, freshness |
| `staging_review_queue` | Review mapper | queue + priority |
| `staging_approval_candidates` | Approval engine | never auto-approved |
| `staging_audit_events` | Audit log | append-only hash chain |

## V1 transaction behavior

`StagingTransaction`:

- `stage(op)` — memory only
- `finalizeDryRun()` — `committed: false`, `applied: 0`
- `commit()` — **throws** `CommitNotImplementedError`

## Storage

Image/PDF `storagePathMock` values are local mock paths only.
`uploadImageToStorage` / `uploadPdfToStorage` throw `StorageUploadBlockedError`.

## Production boundary

This design must never be pointed at Production Supabase project refs.
See `docs/operations/STAGING_POLICY.md`.
