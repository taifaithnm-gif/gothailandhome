# RC2_SECURITY_REVIEW

**Date:** 2026-07-16  
**Scope:** Basics only — not a penetration test  
**HEAD:** `e3a5a9a`

## Findings

| Area | Result | Notes |
|------|--------|-------|
| Admin crawl exposure | **PASS** | `robots` Disallow `/admin`; admin metadata `noindex` |
| Admin auth | **PASS*** | Supabase session gating on admin routes (*depth not re-audited) |
| Marketplace lead privacy | **PASS** | Consent required; demand not auto-published; list_property pending review |
| Apple / role confusion | **PASS** | Contact-role invariants; Platform CS ≠ listing agent |
| Secrets in repo | **PASS*** | No intentional commit of `.env` in this gate (*operators must keep `.env.local` local) |
| Lead storage RLS | **ASSUMED** | Anon insert without select (per `leads.ts` comments); ops should re-verify policies before public traffic |
| XSS in JSON-LD | **PASS** | Server-built objects from sourced fields; `JSON.stringify` into script |
| CSRF on server actions | **FRAMEWORK** | Next server actions; no custom token layer claimed |

## Explicit non-claims

- No SOC2 / ISO assessment  
- No dependency CVE sweep as RC2 gate  
- No WAF / CDN security certification  

## Actions

| ID | Pri | Action |
|----|-----|--------|
| S1 | P1 | Re-verify `marketplace_leads` RLS before public marketing push |
| S2 | P2 | Dependency audit in CI |
| S3 | P3 | Formal security review engagement |
