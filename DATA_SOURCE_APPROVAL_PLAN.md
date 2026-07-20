# Data Source Approval Plan

**Phase:** Implementation Preparation — Readiness Assessment  
**Date:** 2026-07-18  
**Status:** Planning only — **no live sources nominated or accessed**  
**Authority:** D-006–D-007; `PROPERTY_SOURCE_STANDARD_V1.md`; source approval template; G1

## Purpose

Define how V1 will nominate, assess, approve, and prioritize up to **two** data sources for the Bangkok new-condominium pilot. This plan does **not** select live URLs, developers, or projects.

## Hard limits

| Rule | Value |
| --- | --- |
| Maximum sources | 2 |
| Preferred count | 1 if sufficient for 5–10 projects + evidence |
| Geography | Bangkok |
| Category | New condominium projects only |
| Collection before G1 | Prohibited |
| Prohibited types | Aggregators, UGC, social, forums, copied catalogs, login/paywall/CAPTCHA-bypass sources, broad crawlers |

---

## Candidate source classes (not live nominations)

Candidates must be chosen later from these classes only. No specific live property/developer is named here.

| Priority | Candidate class | Typical use | Quality tier intent |
| --- | --- | --- | --- |
| P1 | Official developer website (public project pages) | Project identity, attributes, as-of dates | Q1 preferred |
| P1 | Owner-authorized structured file (CSV/XLSX/JSON) supplied with written permission | Deterministic fields + clear rights | Q1 preferred |
| P2 | Official / government page for location or status corroboration | Corroboration only when needed | Q2 optional second source |
| P2 | Owner-authorized PDF/text brochure with stable citation | Fallback when HTML insufficient | Q2 conditional |
| P3 | Image-only / scanned brochure | Only if unavoidable | Requires D-020 OCR + G4 — discouraged |
| EXCL | Aggregators, portals of scraped listings, agent UGC, social posts | — | Prohibited (Q4) |

**Current live nomination count:** **0**

---

## Approval process (G1)

One completed form per candidate source. Completing the form does not authorize collection.

```text
1. Owner or designee nominates candidate class + concrete source identity
2. Complete CONTENT_FACTORY_V1_SOURCE_APPROVAL_TEMPLATE.md
3. Run legal/compliance checks (below)
4. Run technical/evidence feasibility checks
5. Score mandatory rejection criteria (any REJECT = ineligible)
6. Human Owner records G1: APPROVED / APPROVED WITH CONDITIONS / REJECTED
7. Approved source ID entered into pilot manifest (G5) before any collect
8. Re-validate approval before refresh or method change
```

### Process roles

| Step | Authority |
| --- | --- |
| Nomination | Human Owner or designee |
| Rights/ToS/robots review | Human reviewer (not AI) |
| Technical feasibility | Technical proposer |
| Final G1 decision | Human Owner only |
| Collection authorization | Separate — requires G5 + applicable G4 |

---

## Legal / compliance checks

Every candidate must record PASS / FAIL / UNCLEAR for:

| Check | Pass condition | Fail / unclear action |
| --- | --- | --- |
| Ownership clarity | Publisher/operator identifiable | Reject |
| Access basis | Public lawful access or documented owner authorization | Reject |
| Terms of use | Collection, retention, quotation, publication allowed or conditionally allowed with controls | Reject if prohibited/unclear |
| Robots / API restrictions | Proposed method allowed | Reject if prohibited/unclear |
| No bypass | No CAPTCHA bypass, login evasion, credential sharing, or access-control circumvention | Reject |
| Attribution | Clear attribution path for publication package | Reject if missing |
| Personal data | None expected or incidental and controllable | Reject if material uncontrolled PII |
| Copyright / database rights | Retention and citation posture acceptable | Reject if high risk/unclear |
| Takedown path | Contact/process known | Conditional — require before publish |
| Cross-border / regulated claims | Pilot review capacity adequate | Reject or narrow fields |
| Credential need | If auth required: secret-ref only; rotation defined | Block until IB-009 closed |

UNCLEAR on any mandatory rights item equals **REJECT** until clarified. AI may assist research; AI may not approve.

---

## Technical / evidence checks (with legal)

| Check | Requirement |
| --- | --- |
| Stability | Access stable enough for pilot refresh |
| Format | Prefer HTML, CSV/XLSX, text PDF |
| Evidence retention | Immutable payload/snapshot/reference + SHA-256 possible |
| Citeable locations | Page/section/row/cell/quote for publishable fields |
| Volume | Enough for 5–10 projects without broad crawl |
| OCR need | Prefer none; justify if required |
| Parser complexity | Prefer low/medium; high needs Owner note |
| Rate limits | Documented and respected |

---

## Priority order for selection

When multiple candidates exist, select in this order:

1. **Single Q1 official developer or owner-authorized file** that covers ≥5 Bangkok new condominium projects with evidence retention  
2. **Add one Q2 official/government corroboration source** only if required fields/rights need it  
3. **Reject** any third source (hard ceiling)  
4. **Prefer manual upload / owner-authorized file** when it yields clearer permission than automated fetch  
5. **Deprioritize** any source needing OCR, brittle browser automation, or unstable structure  
6. **Never prioritize** volume over rights, attribution, or evidence integrity  

### Decision matrix (summary)

| If… | Then… |
| --- | --- |
| One Q1 source covers pilot | Approve 1 source; do not add second |
| Q1 lacks corroboration for a required claim | Consider one Q2 only |
| Candidate fails any mandatory rejection criterion | Reject; nominate alternative |
| Only aggregators available | Stop; do not invent sources; escalate to Owner |
| Image-only unavoidable | Separate D-020 + G4 path or exclude source |

---

## Outputs required before collection

1. 1–2 completed source approval forms with G1 Owner decision  
2. Rights snapshots retained  
3. Allowed method recorded (manual upload / approved fetch / file import / approved API)  
4. Endpoint list for future egress allowlist (Windows)  
5. Source IDs referenced in signed G5 manifest  

## Current readiness

| Item | Status |
| --- | --- |
| Approval plan | Complete (this document) |
| Live candidates named | None |
| G1 approvals | 0 / ≤2 |
| Collection authorization | **NO-GO** |
