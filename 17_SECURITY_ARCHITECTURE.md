# 17 — Security Architecture

**Document ID:** `17_SECURITY_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define security boundaries across Control, Execution, Serving, and Intelligence planes for the Data Factory: identity, secrets, network, data classification, and AI abuse prevention.

## 2. Components

| Control | Measures |
| --- | --- |
| Identity | Supabase Auth; admin roles; Tailscale identities for Windows01 |
| Secrets | Env/secret managers; never git |
| Network | Public site ≠ factory ports; Tailscale-only ops |
| Data class | Public / internal / evidence / PII |
| AI policy | Assist-only; redaction for cloud LLMs |
| Audit | Append-only security-relevant events |

## 3. Responsibilities

- Enforce M0/M1 governance policies (POL-*).
- Separate Serving public reads from Factory write paths.
- Protect evidence stores and service-role keys.

## 4. Data Flow

```text
User/Admin → AuthN/Z → capability check → action → audit
Windows01 → Tailscale → local services; egress allowlist
Import → Control Plane service role → Supabase
```

## 5. Dependencies

- Admin/CMS/API architectures
- Windows01 P0 egress & ingress decisions
- Backup encryption; Monitoring alerts for auth anomalies

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Key leak | Rotate; revoke; incident |
| Unauthorized apply attempt | Block + audit + alert |
| Ransomware on Windows01 | Wipe/restore; Control Plane authoritative packages |

## 7. Security Considerations

- MFA for Owner/Data Ops
- RLS + storage policies
- Rate limits on public Search
- Forbidden-claim filters on generated text
- PII minimization in factory packages

## 8. Scalability

- Central policy-as-config for capabilities
- Per-plane secret scopes
- Segmented networks as footprint grows

## 9. Future Expansion

- SSO; hardware keys; SIEM sinks
- Formal threat model refresh each phase gate

## 10. Windows01 Integration

Hardened removable node: private ingress, egress allowlist, local secrets, wipe drill; no prod write keys in pilot.

## 11. Cross References

- M0 `19_DATA_GOVERNANCE_STANDARD.md`; M1 `19`/`20`
- `06_ADMIN_ARCHITECTURE.md`, `04_API_ARCHITECTURE.md`, `15_WINDOWS01_RUNTIME_ARCHITECTURE.md`, `18_BACKUP_RECOVERY_ARCHITECTURE.md`
- `V2_DECISION_REGISTER.md` P0s
