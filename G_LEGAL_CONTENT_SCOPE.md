# G-LEGAL — Legal Content Scope

**Gate:** G-LEGAL  
**Document ID:** GLEG-SCOPE-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20  
**Owner:** Qualified Legal Reviewer (Phase 1 website static content)

## 1. Purpose

Defines the only legal-related public content Phase 1 may publish after G-LEGAL clears.

## 2. In scope

| Surface | Route | Content type |
| --- | --- | --- |
| Legal information guide | `/[lang]/knowledge/legal` | `legal_guide` |

Approved topics for the Phase 1 guide:

1. Jurisdiction statement: Kingdom of Thailand
2. High-level foreign-ownership concepts for condominiums (informational only)
3. Distinction between informational content and personalized legal advice
4. Pointer to consult qualified Thai legal counsel
5. Platform role boundaries (not a law firm; not a listing agent)

## 3. Out of scope

- Personalized legal advice or eligibility determinations for a specific buyer
- Visa, tax, or inheritance planning guidance
- Drafting or reviewing contracts
- Unsigned or unversioned copy
- Claims about specific projects' legal compliance

## 4. Filesystem scope

```
content/guides/legal/
```

Loader may read **only** this tree for `legal_guide` documents.

## 5. Locale requirement

All three locales (`en`, `zh`, `th`) must be complete before the guide is routable.

## 6. Approval

**APPROVED** under `G_LEGAL_OWNER_DECISION_REGISTER.md` decision **GLEG-D-001**.
