# Content Sprint C — Build Report

Date: 2026-07-26

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | PASS (exit 0) |
| Lint | `npm run lint` | PASS — 0 errors, 4 pre-existing warnings in `scripts/rotate-staging-secrets.mjs` (unrelated to this sprint, untouched) |
| Production build | `npm run build` | PASS — all routes compiled, static + SSG + dynamic families intact |
| Full test suite | `npm run test` | PASS — 0 failures across all suites |

## Notable build output

- `/robots.txt` prerendered static; `/sitemap.xml` dynamic.
- No new build warnings introduced.
- No route structure changes: all new content renders through existing dynamic routes (`/[lang]/knowledge/articles/[slug]`, `/[lang]/cities/[slug]`, `/[lang]/districts/[slug]`, `/[lang]/developers/[slug]`, `/[lang]/projects/[slug]`).

## Fixes applied during QC

1. `test:route-metadata` initially failed after the robots.ts locale-prefix change because the contract test asserts literal `"/admin"` / `"/admin/"` strings. Rewrote `PRIVATE_BASES` to enumerate trailing-slash variants literally while still generating locale-prefixed entries. Re-run: PASS.
2. Content link scan found `luxury-condos-thailand` referenced in 2 files where the implemented slug is `thailand-luxury-condo-guide`. Fixed both. Re-scan: clean.
3. Reverted an incidental timestamp churn in `staging/import/CLI-MOCK-BATCH.preview.txt` caused by a dry-run test regenerating its artifact.
