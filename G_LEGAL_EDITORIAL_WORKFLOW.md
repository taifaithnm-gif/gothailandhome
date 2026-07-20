# G-LEGAL — Editorial Workflow

**Gate:** G-LEGAL  
**Document ID:** GLEG-WORKFLOW-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Human editorial workflow for legal guide copy changes.

## 2. Roles

| Role | Responsibility |
| --- | --- |
| Content Owner | Scope, inventory, route enablement |
| Qualified Legal Reviewer | Exact copy, disclaimer, citations, version bump |
| Engineering | Loader, route, P1-28 validation — **cannot approve legal copy** |

AI agents **must not** clear G-LEGAL or approve legal guide copy.

## 3. Status transitions

```
draft → in_review → approved → (live when gate + inventory allow)
                 ↘ rejected
approved → archived
```

## 4. Change control

1. Edit JSON under `content/guides/legal/`
2. Bump `version` on material copy change
3. Update `reviewed_at`
4. Qualified Legal Reviewer sign-off
5. P1-28 must pass

## 5. Review cadence

- **90 days** maximum since `reviewed_at`
- Immediate re-review if laws cited change or disclaimer policy updates

## 6. Approval

**APPROVED** under decision **GLEG-D-007**.
