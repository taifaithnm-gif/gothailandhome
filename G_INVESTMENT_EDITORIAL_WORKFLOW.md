# G-INVESTMENT — Editorial Workflow

**Gate:** G-INVESTMENT  
**Document ID:** GINV-WORKFLOW-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Human editorial workflow for investment guide copy changes.

## 2. Roles

| Role | Responsibility |
| --- | --- |
| Content Owner | Scope, inventory, route enablement |
| Qualified Investment Reviewer | Exact copy, disclaimer, forbidden-claim scan, version bump |
| Engineering | Loader, route, P1-28 validation only — **cannot approve copy** |

AI agents **must not** clear G-INVESTMENT or approve investment guide copy.

## 3. Status transitions

```
draft → in_review → approved → (live when gate + inventory allow)
                 ↘ rejected
approved → archived (rollback)
```

Only `approved` guides listed in `G_INVESTMENT_INVENTORY.md` are routable.

## 4. Change control

1. Edit JSON under `content/guides/investment/`
2. Bump `version` on material copy change
3. Update `reviewed_at`
4. Qualified Investment Reviewer sign-off recorded in decision register amendment
5. P1-28 editorial validation must pass before merge consideration

## 5. Review cadence

- **90 days** maximum since `reviewed_at`
- Immediate re-review if disclaimer, forbidden-claim policy, or platform process facts change

## 6. Approval

**APPROVED** under decision **GINV-D-007**.
