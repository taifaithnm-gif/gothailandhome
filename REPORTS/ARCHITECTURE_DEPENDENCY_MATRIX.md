# Architecture Dependency Matrix

| From \ To | windows01 | adapters | staging-import | review-console | staging-db | supabase |
| --- | --- | --- | --- | --- | --- | --- |
| windows01 | — | NO | NO | NO | NO | NO |
| adapters | YES (public/API + sealed) | — | types only | NO | NO | NO |
| staging-import core | NO (version string alignment only) | NO reverse | — | NO | NO | NO |
| review-console | NO | NO | NO | — | NO | NO |
| staging-db | NO | NO | NO | NO | — | NO |
| app/internal | NO | NO | NO | YES (public) | NO | NO |

**Circular dependencies:** 0
**Verdict:** PASS
