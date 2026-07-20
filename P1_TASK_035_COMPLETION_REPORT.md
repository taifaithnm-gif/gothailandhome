# Phase 1 Task 035 Completion Report

**Task ID:** P1-35  
**Objective:** Performance and media budget pass

## Files modified

- `scripts/test-performance-budget.mjs`
- `package.json`

## Functional changes

- Enforced local budgets: paged properties listing (no full-catalog SSR), bounded LCP `fetchPriority`, bounded sitemap property inventory, default page size.
- Rejected unsupported performance marketing claims on homepage.
- Documented Turbopack NFT glossary/content-loader residual as accepted non-blocking risk.
- Did not broaden image remote configuration or change source data.

## Quality gates

- `npm run typecheck` ✅ PASS
- `npm run lint` ✅ PASS
- `npm test` ✅ PASS (includes `test:performance-budget`)
- `npm run build` ✅ PASS

## Notes

- NFT warning remains accepted residual (G-RELEASE risk register R1). No deploy/commit/push.
