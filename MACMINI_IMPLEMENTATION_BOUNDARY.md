# Mac mini Website Implementation Boundary

**Device:** Mac mini only  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Current authorization:** Audit/backlog only; no code changes authorized by this document  
**Production posture:** Alpha RC Feature Freeze remains active

## Boundary decision

The website codebase can be developed and verified on the Mac mini without Windows 01.
Windows 01 is a future isolated Content Factory execution candidate, not a website build,
preview, test, release, database, or hosting dependency.

**Mac mini website work:** technically available, but code changes require a later explicit
Owner authorization because this audit itself is read-only and Feature Freeze is active.

## Systems boundary

```text
Mac mini website boundary
  - Next.js source and UI components
  - Local typecheck, lint, unit/structural tests
  - Local mock/fixture route validation
  - Static content structure
  - SEO, accessibility, responsive and image work
  - Documentation and release-readiness evidence

                         no direct dependency
                                  |
                                  X

Windows 01 future boundary
  - Scheduler / queue / collector / parser / validator
  - Evidence storage / runtime state / monitoring / backup
  - Approved live source collection after G1/G4/G5

Production boundary (separate)
  - Supabase production data/schema
  - Live deployment and release credentials
  - Automated publication
```

## Safe Mac mini categories after later authorization

| Category | Allowed scope | Required guardrail |
| --- | --- | --- |
| Existing frontend bug fixes | Correct evidenced defects in current routes/components | No new live-data dependency; regression tests |
| Test repair and coverage | Update stale invariants; add non-network structural/unit tests | Do not change data merely to make a test pass without contract review |
| Responsive corrections | Mobile/tablet layout, overflow, spacing, navigation | Preserve current design system and route behavior |
| Accessibility corrections | Semantics, labels, focus, keyboard, contrast, reduced motion | Add automated evidence where possible |
| SEO corrections | Metadata, canonical, alternates, JSON-LD, sitemap, robots | No live publication or Search Console action |
| Static content structure | Route shells and evidence-safe, approved static copy structure | No invented facts or legal/investment claims |
| UI stabilization | Shared components, loading/error/empty states | No broad redesign during freeze |
| Mock-data verification | Local fixtures and current packaged/mock content only | No collector, source connection, or production mutation |
| Build hardening | Typecheck, lint, test, local production build | Build artifacts remain local and uncommitted |
| Image performance | `next/image`, sizing, loading strategy, local asset validation | Rights/evidence retained; no unapproved remote scraping |
| Existing route validation | Local route matrix against mock/approved existing data | No production write or crawler |
| Documentation corrections | Accurate runbooks/audit evidence | Do not alter frozen Sprint 0–4 standards without separate task |

## Work available now in principle

These workstreams have no Windows 01 dependency:

1. Repair the failing developer-center test/metadata contract.
2. Restore full local engineering gate health.
3. Add branded route error/loading boundaries.
4. Correct sitemap completeness without collecting new data.
5. Correct locale `<html lang>` semantics.
6. Expand accessibility checks and fix evidenced issues.
7. Validate responsive layouts across existing routes.
8. Improve existing image loading/sizing and local asset behavior.
9. Add route/metadata regression coverage.
10. Stabilize existing forms and mock/local failure behavior.
11. Structure legal/investment content routes only after approved copy/business scope.
12. Improve current static knowledge navigation without live sources.

“Available” means technically independent of Windows 01. It does not override the current
read-only task or Feature Freeze.

## Explicit exclusions

The following are outside the Mac mini website execution boundary for this phase:

- Live property collection or source discovery
- Collector, parser, OCR, embedding, queue, worker, scheduler, validator, evidence-store,
  monitoring, backup, or other runtime service implementation
- Windows 01 path creation, installation, configuration, deployment, or testing
- Automated publishing or direct Content Factory-to-website writes
- Production database creation, migration, provisioning, seeding, or mutation
- Production Supabase data cleanup
- Connection to unapproved live data sources
- Project-specific AI backend, AI recommendations, or semantic search
- CRM/email automation
- Production deployment, preview-environment creation, or release credential changes
- Analytics vendor/property creation, paid campaign activation, GSC/Bing verification, or
  other external operator actions

## Dependency classification

| Work family | Windows 01 dependency | Other dependency |
| --- | --- | --- |
| Frontend UI/accessibility/responsive fixes | None | Owner code-change authorization |
| Local test/build hardening | None | Owner code-change authorization |
| SEO code/sitemap/robots/canonical | None | Owner code-change authorization; production verification later |
| Static knowledge structure | None | Approved content/business scope |
| Comparison/favorites/map product features | None technically | Product decision; not Alpha RC requirement |
| Basic existing admin UI stabilization | None | Production DB writes prohibited; use local/mock only |
| Sprint 2 review interface implementation | Future runtime/storage decision | G2/G3, roles, implementation charter |
| Live property ingestion | Yes for approved target runtime | G1/G4/G5 and legal approval |
| Automated publication | Runtime + package boundary | G6, rollback rehearsal, freeze lift |
| AI backend/OCR/embeddings | Excluded/deferred | Separate Owner decisions |

## Stop conditions for future Mac mini code work

Stop immediately if proposed work:

1. Requires a production database/schema change.
2. Reads from or writes to an unapproved live property source.
3. Introduces collectors, parsers, OCR, embeddings, queues, workers, or runtime services.
4. Creates an automated publish path.
5. Requires Windows 01 access or modification.
6. Alters frozen Sprint 0–4 planning documents.
7. Invents property, developer, investment, legal, evidence, or contact claims.
8. Requires production deployment during Feature Freeze.
9. Changes existing data to hide an integrity/test failure without deciding the contract.
10. Expands beyond existing Alpha RC scope without a business decision.

## Future authorization levels

| Level | Scope | Current decision |
| --- | --- | --- |
| M0 | Read-only audit, diagnostics, backlog | **GO** |
| M1 | Local website fixes/tests using existing data/fixtures | **CONDITIONAL GO** — needs explicit Owner code-change authorization |
| M2 | Local production build and route server validation | **CONDITIONAL GO** — after M1 and clean tests; no deploy |
| M3 | Preview deployment | **NO-GO** — no config/authorization |
| M4 | Production deployment | **NO-GO** — Feature Freeze/business gate |
| W1 | Windows 01 runtime/deployment/live ingestion | **NO-GO** — G1/G3/G4/G5 open |

## Final boundary

Mac mini website stabilization is separable from Windows 01 and should be managed as a
frontend/repository workstream. Content Factory/runtime readiness remains a different gate.
No action in the Mac mini backlog authorizes live data, production mutation, or deployment.
