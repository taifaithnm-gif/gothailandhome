# 06 — Admin Architecture

**Document ID:** `06_ADMIN_ARCHITECTURE`  
**Version:** 1.0.0  
**Milestone:** M2 — Platform Architecture  
**Status:** Architecture only — no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define **Admin** architecture for identity, roles, and privileged operations spanning existing property admin and future Data Factory CMS — without implementing UI.

## 2. Components

| Component | Role |
| --- | --- |
| Admin identity | Supabase Auth + `admin_users` |
| Role map | `owner`, `data_ops`, `reviewer`, `admin_catalog` (manual listing CRUD), `readonly_audit` |
| Privilege gate | Capability tokens / claims for Ops APIs |
| Existing `/admin` property CRUD | Narrow catalog manual path (legacy/minimal) |
| Factory Admin | Hosts CMS surfaces (`05`) |

## 3. Responsibilities

- Enforce M1/M0 governance role matrix.
- Separate Platform agent activation from Catalog publish authority.
- Provide break-glass Owner capabilities with audit.

## 4. Data Flow

```text
Login → Auth → role resolution → capability check → Admin/CMS action → Audit Log
```

## 5. Dependencies

- Security Architecture; Supabase Auth
- CMS Architecture; Audit via Monitoring/Audit designs
- M1 Agent/Customer remain Platform-owned (not Factory Admin by default)

## 6. Failure Handling

| Failure | Response |
| --- | --- |
| Missing role | Deny + audit |
| Role change mid-session | Revalidate claims |
| Compromised admin | Revoke refresh; rotate keys; incident |

## 7. Security Considerations

- MFA recommended for Owner/Data Ops
- Short-lived sessions for apply/publish
- Principle of least privilege
- AI agents never receive `publish` or `review.approve` capabilities

## 8. Scalability

- Central capability registry
- Delegate reviewer seats without sharing Owner credentials

## 9. Future Expansion

- SSO/SAML for staff
- Four-eyes for publish
- Marketplace admin modules isolated from Factory capabilities

## 10. Windows01 Integration

No direct admin UI on Windows01 public ports; ops SSH/Tailscale only. Admin actions that dispatch Windows01 jobs go through Control Plane APIs.

## 11. Cross References

- M0 `19_DATA_GOVERNANCE_STANDARD.md`; M1 `17`/`18`/`07`
- `05_CMS_ARCHITECTURE.md`, `17_SECURITY_ARCHITECTURE.md`, `04_API_ARCHITECTURE.md`
