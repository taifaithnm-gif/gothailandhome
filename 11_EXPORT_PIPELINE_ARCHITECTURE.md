# 11 — Export Pipeline Architecture

**Document ID:** `11_EXPORT_PIPELINE_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define the **Export Pipeline** for producing hashed artifacts from approved versions for site ingest, backup review, partner handoff, or second-site publish.

## 2. Components

| Component | Role |
| --- | --- |
| Selector | Entity keys / wave / publish_event pin |
| Serializer | Canonical package envelope |
| Hasher | Artifact + batch hashes |
| Destination adapters | `gth_fs`, `backup`, `site_2`, `partner` |
| Receipt ledger | Delivery status |
| Redactor | Strip secrets/PII |

## 3. Responsibilities

- Implement M1 Export Job Contract.
- Default export only approved/publish_ready/published versions.
- Bind multi-site at export (`site_id`), not by forking catalog truth.

## 4. Data Flow

```text
Selection → load approved versions → serialize → hash
  → approve (if required) → deliver → receipt + audit
```

## 5. Dependencies

- Versioning/Metadata standards
- Publish Workflow for gated exports
- Storage for artifact placement
- Knowledge Contract for content exports

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Hash mismatch on assemble | Abort deliver |
| Destination failure | Retry; mark failed; no partial silent success |
| Redaction rule miss | Block partner destinations |

## 7. Security Considerations

- Destination allowlist
- Signed artifacts for partners
- No evidence raw dumps in public exports

## 8. Scalability

- Incremental exports by publish_event
- Parallel serialize per entity_type
- Retention/expiry on artifact storage

## 9. Future Expansion

- Streaming export; webhook notify destinations
- CRM lead extracts as Platform-owned adapter

## 10. Windows01 Integration

May stage candidate export bundles locally for review copy; authoritative export approval and GTH site ingest remain Control Plane.

## 11. Cross References

- M1 `16_EXPORT_JOB_CONTRACT.md`; M0 `16_IMPORT_EXPORT_STANDARD.md`
- `10_IMPORT_PIPELINE_ARCHITECTURE.md`, `03_STORAGE_ARCHITECTURE.md`, `13_KNOWLEDGE` via M1 knowledge contract
