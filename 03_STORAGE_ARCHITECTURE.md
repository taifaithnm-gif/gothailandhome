# 03 — Storage Architecture

**Document ID:** `03_STORAGE_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define object storage layout for **public media mirrors**, **package artifacts**, and **evidence blobs**, separating durable serving assets from Windows01 evidence.

## 2. Components

| Store | Contents |
| --- | --- |
| Supabase Storage | Property/project/developer public media |
| Git `content/` + `content/media/library` | Package manifests & asset metadata |
| Windows01 MinIO (future) | Raw HTML/PDF/image evidence, job artifacts |
| Export artifact bucket/dir | Hashed publish/export packages |

## 3. Responsibilities

- Media Contract roles (hero/cover/gallery/logo/og/brochure)
- Checksums on mirrored blobs
- Evidence retention distinct from gallery
- No secrets in object paths/metadata

## 4. Data Flow

```text
Capture (Windows01) → evidence bucket (hash)
  → package media refs (source_url / storage_path)
  → optional mirror to Supabase Storage on publish/import
  → website CDN/public URL
```

## 5. Dependencies

- M0 Media Standard; M1 Media Contract
- Supabase Architecture; Windows01 Runtime
- Backup/Recovery for buckets

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Hotlink dead | Flag `media_incomplete`; keep source_url |
| Mirror checksum mismatch | Reject mirror; retain evidence |
| MinIO unavailable | Pause capture; packages without new evidence |
| Storage quota | Backpressure harvest; alert monitoring |

## 7. Security Considerations

- Public buckets only for approved public media
- Evidence buckets private; Tailscale-only access on Windows01
- Signed URLs for private evidence review
- Rights metadata required for official logos

## 8. Scalability

- Content-addressed evidence keys reduce duplication
- Lifecycle policies: hot evidence → cold archive
- Gallery mirrors sized by publish-ready entities first

## 9. Future Expansion

- Video assets; multi-site media namespaces
- Object Lock / erasure policy after Owner P0 decisions
- Image derivative pipeline (not M2 build)

## 10. Windows01 Integration

MinIO is the evidence/object plane for Execution; Control Plane stores package pointers; Serving uses Supabase Storage for public mirrors.

## 11. Cross References

- M0 `11_MEDIA_STANDARD.md`; M1 `06_MEDIA_CONTRACT.md`
- `15_WINDOWS01_RUNTIME_ARCHITECTURE.md`, `18_BACKUP_RECOVERY_ARCHITECTURE.md`
- Existing `WINDOWS01_RUNTIME_ARCHITECTURE.md` (design input)
