# P2-005 — Security & Privacy Review Plan (M1–M7)

**Date:** 2026-07-21

---

## Checklist (must pass before GA of each domain)

### Identity / account (M1)

- [ ] Customer session cannot access `/admin` without `admin_users` row
- [ ] IDOR: user A cannot read/write user B saved items/searches
- [ ] Auth callback `next` is path-relative only (no open redirect)
- [ ] Account routes `noindex`

### Leads / ops (M2)

- [ ] Only `is_admin()` staff read/update leads
- [ ] Lead detail IDOR covered by admin gate
- [ ] Audit events for status/assign changes
- [ ] PII minimized in logs

### Notifications (M2)

- [ ] Prefs respected before send
- [ ] No PII in client analytics payloads
- [ ] Outbox retention bounded

### CRM (M2)

- [ ] Webhook signatures verified
- [ ] Secrets server-only
- [ ] Idempotent external keys
- [ ] Dead-letter path

### AI (M7 — prefight)

- [ ] Prompt redaction of CRM notes
- [ ] Forbidden-claim scanner
- [ ] Kill switch

### Retention

| Data | Draft retention |
| --- | --- |
| Leads | Owner policy (default 24 months ops) |
| Notification outbox | 30 days after terminal state |
| AI logs | ≤ 30 days redacted |
| Auth | Provider defaults |

## Validation

- IDOR, webhooks, retention covered: **YES**
