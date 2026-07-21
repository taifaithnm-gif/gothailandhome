# P2-010 — Auth Provider & Threat Model

**Decision:** Continue **Supabase Auth** for customers (same project as admin).
**Customer rule:** Authenticated user **without** `admin_users` row.

## Threat model (summary)

| Threat | Mitigation |
| --- | --- |
| Customer escalates to admin | Admin routes require `admin_users`; customers redirected |
| Open redirect via `next` | `sanitizeNextPath` |
| Session fixation | Supabase SSR cookie exchange |
| Enumerate emails | Generic sign-in messages |
| CSRF on actions | Next.js server actions |

**Validation:** Security review sign-off recorded for Phase 2A kickoff.
