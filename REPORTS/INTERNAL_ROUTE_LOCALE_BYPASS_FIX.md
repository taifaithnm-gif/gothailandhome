# INTERNAL_ROUTE_LOCALE_BYPASS_FIX

**Milestone:** `FIX_INTERNAL_ROUTE_LOCALE_BYPASS`  
**Date:** 2026-07-26  
**Overall:** PASS  
**Final acceptance:** COMPLETE

## ROOT_CAUSE

`src/proxy.ts` 的 locale redirect 未豁免 `/internal` 路由。Review Console 位于 `[lang]` segment 之外，因此 `/internal/*` 被重定向到 `/en/internal/*` 后 404。

## FILES_CHANGED

本里程碑触达文件（允许范围）：

- `src/proxy.ts` — 在既有 locale exclusion list 中加入 `/internal` exact + prefix bypass
- `scripts/test-proxy-locale-bypass.mjs` — proxy locale bypass 回归测试
- `package.json` — 仅新增 `test:proxy-locale` 脚本（工作区另有既有未提交 staging 脚本改动，非本里程碑引入）
- `REPORTS/INTERNAL_ROUTE_LOCALE_BYPASS_FIX.md` — 本报告

未修改：数据库、Review Items、Conflicts、Canonical Links、Batch001 数据、Phase2 Artifact、Staging RPC、migrations、RLS、Reviewer Gate、Approval/Publish、Storage、Production、Deploy；未执行 Git Commit / Push / Tag。

## ROUTE_BEFORE

`proxy()` 执行顺序：

1. Bypass `_next` / `api` / `admin` / `auth` / `partners/app` / dotted assets / robots / sitemap
2. 若 pathname 已有 `/en|zh|th` 前缀 → continue
3. 否则 redirect 到 `/{preferredLocale}{pathname}`

问题链路：

```
GET /internal/review/windows01/batches/BATCH-GTH-20260724-001
  → locale redirect 307
  → /en/internal/review/windows01/batches/BATCH-GTH-20260724-001
  → 404
```

## ROUTE_AFTER

在既有 exclusion block 前增加：

```ts
const isInternalRoute =
  pathname === "/internal" || pathname.startsWith("/internal/");
```

并接入原 exclusion list（`return;` continue，不跳过其他既有 bypass）。

```
GET /internal/*
  → early continue（无 locale redirect / rewrite）
  → App Router /internal/... → 200
```

`/en/internal/*` 不新增兼容 rewrite，保持非正式路径 → 404。

## HTTP_BEFORE

| Request | Result |
| --- | --- |
| `GET /internal/.../BATCH-GTH-20260724-001` | 307 → `/en/internal/...` |
| `GET /en/internal/...` | 404 |

## HTTP_AFTER

| Request | Result |
| --- | --- |
| `GET /internal/review/windows01/batches/BATCH-GTH-20260724-001` | **200**, redirect count **0** |
| `GET /en/internal/review/windows01/batches/BATCH-GTH-20260724-001` | **404** |

Dev server：`FEATURE_GOTH_REVIEW_CONSOLE=true APP_DEPLOY_ENV=development npm run dev`，验证后停止，**exit 0**。

## PROXY_TESTS

`npm run test:proxy-locale` → **14/14 PASS**

覆盖：`/internal`、`/internal/`、Review Console batch path、`/en|/zh|/th`、无 locale 公开路径默认 redirect、`/api/*`、静态资源、`/en/internal` 无兼容 rewrite、accept-language 不影响 `/internal`。

## BROWSER_VERIFICATION

| Check | Result |
| --- | --- |
| URL | `/internal/review/windows01/batches/BATCH-GTH-20260724-001` |
| HTTP | 200 |
| Locale redirect | NONE |
| `/en/internal/...` | 404 |
| Title | Goth Batch Human Review Console |
| Batch ID | BATCH-GTH-20260724-001 |
| Fatal runtime error | None |
| Dev server shutdown | PASS (exit 0) |

## REVIEW_CONSOLE_VERIFICATION

| Capability | Result |
| --- | --- |
| Review items (tab pager) | **63** (`Page 1 / 4 (63 rows)`) |
| Conflicts tab | **1** (`Page 1 / 1 (1 rows)`) |
| Projects tab | **10** |
| Search | PASS |
| Filter | PASS |
| Pagination | PASS (`Page 2 / 4 (63 rows)`) |
| Detail View (`View Evidence`) | PASS |
| Sorting | **WARNING_NOT_IMPLEMENTED**（本轮不开发） |

数据层复核（`.work/review-console/BATCH-GTH-20260724-001/`）：review-items=63, conflicts=1, projects=10, `storageUploads=0`, `approvals=0`, `published=0`, `productionSafe=true`。

## REVIEWER_GATE_VERIFICATION

| Check | Result |
| --- | --- |
| `assertApproverActionBlocked(APPROVE)` | BLOCKED |
| `assertApproverActionBlocked(READY_FOR_PRODUCTION)` | BLOCKED |
| `assertAutomationCannotApproveOrPublish(APPROVED/PUBLISHED/READY_FOR_PRODUCTION)` | BLOCKED |
| `assertReviewMutationAllowed(APPROVED/PUBLISHED/READY_FOR_PRODUCTION)` | BLOCKED |
| `assertReviewMutationAllowed(REVIEW_REQUIRED)` | allowed |
| Console Approve/Publish controls | absent（preview-only / no-op） |
| `/internal` bypass 对 gate 的影响 | 无（仅 locale proxy） |

**REVIEWER_GATE: PASS** · **APPROVAL: BLOCKED** · **PUBLISH: BLOCKED**

## PRODUCTION_ISOLATION

| Check | Result |
| --- | --- |
| Production | **UNCHANGED** |
| Deploy | NOT_EXECUTED |
| Storage uploads | **0** |
| DB / RPC / migrations / RLS / Batch001 data | 未修改 |
| Review Console production hard-block | 仍由 feature flag 阻断 |

## TEST_RESULTS

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS（0 errors；既有 unrelated warnings in `rotate-staging-secrets.mjs`） |
| `npm run build` | PASS（含 `/internal/review/windows01/batches/[batchId]`） |
| `npm run test:architecture-freeze` | 35/35 PASS |
| `npm run test:staging-db-implementation` | 146/146 PASS |
| `npm run test:proxy-locale` | 14/14 PASS |
| `git diff --check` | PASS |

**Tests:** 195 / 195 passed

## SCOPE_CHECK

本里程碑 intentional edits：

- `src/proxy.ts` (+5 lines bypass)
- `scripts/test-proxy-locale-bypass.mjs` (new)
- `package.json` (`test:proxy-locale` only for this milestone)
- `REPORTS/INTERNAL_ROUTE_LOCALE_BYPASS_FIX.md` (new)

工作区另有既有未提交文件（staging DB / Batch001 reports 等），非本里程碑改动，未在本轮触碰。

## UNRESOLVED_ITEMS

1. Sorting control 仍未实现（`WARNING_NOT_IMPLEMENTED`）。
2. Summary card `totalReviewItems: 38` 与 review-items 长度 63 的既有 metadata drift（out of scope）。
3. 人工审核决策工作流尚未开始。

## BLOCKERS

NONE

## NEXT_RECOMMENDED_ACTION

`MANUAL_REVIEW_DECISION_WORKFLOW_DESIGN`
