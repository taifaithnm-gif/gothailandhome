# Design QA Report — Phase 12

**Scope:** Design-system consistency audit across every public page. Consistency only — no redesign, no feature work, no deployment.
**Role:** Senior design QA engineer.
**Date:** 2026-07-17
**Reference system:** `src/styles/design-tokens.css`, `src/app/globals.css` (`ds-*` utilities), `src/components/ui/*` primitives.

---

## 1. Method

The product is built on a single design-token layer plus a small set of shared primitives:

- **Tokens** — color (`--brand`, `--brand-deep`, `--success`, `--warning`, `--danger`, `--evidence-*`), typography scale (`--text-display` → `--text-caption`), spacing scale (`--space-*`), layout (`--container`, `--section-y`, `--card-pad`, `--card-radius`, `--shadow-soft`).
- **Typography utilities** — `.ds-display / .ds-h1 / .ds-h2 / .ds-h3 / .ds-body / .ds-body-sm / .ds-caption`.
- **Layout utilities** — `.ds-container`, `.ds-section`, `.ds-card`.
- **Primitives** — `Button` (cva), `Field / FieldLabel / FieldHint / FieldError / Input / Select / Textarea`, `Badge / VerificationBadge / SourceBadge`, `SurfaceCard / ListingCardShell / ProjectCardShell / DeveloperCardShell / DistrictCardShell`, `LoadingState / EmptyState / ErrorState`, `Breadcrumb`, `ListingMediaFrame`.

Each public surface was audited against these definitions. A defect is counted as **deterministic** only when a component diverges from an existing token/primitive that governs the same visual role elsewhere. Layout, IA, and content decisions were treated as out of scope.

---

## 2. Pages audited

| Surface | Route(s) | Verdict |
| --- | --- | --- |
| Homepage | `/[lang]` | Consistent |
| Properties (index/search) | `/[lang]/properties`, `/[lang]/buy`, `/[lang]/rent` | Consistent |
| Listing detail | `/[lang]/properties/[id]` | Consistent |
| Project detail | `/[lang]/projects/[slug]` | **Fixed** (lead form) |
| Projects index | `/[lang]/projects` | Consistent |
| Developer detail / index | `/[lang]/developers/[slug]`, `/[lang]/developers` | Consistent |
| District / city | `/[lang]/districts/[slug]`, `/[lang]/cities/[slug]`, `/[lang]/cities` | Consistent |
| Knowledge | `/[lang]/knowledge`, `/knowledge/glossary`, `/knowledge/bangkok-districts` | Consistent |
| Marketplace | `/[lang]/marketplace` | Consistent |
| Forms | `/find-my-home`, `/list-your-property`, `/partners/*`, `/contact`, project lead | **Fixed** (project lead) |
| Navigation | `site-header` (desktop/tablet/mobile) | Consistent |
| Footer | `site-footer` | Consistent |

---

## 3. Headline findings

**The product is highly consistent.** All list/detail cards, index grids, filters, and the four marketplace forms already route through shared primitives and tokens. One public component had drifted off-system, plus a handful of non-blocking observations.

### Fixed in this pass (deterministic)

1. **Project lead form (`src/components/projects/project-lead-form.tsx`)** re-based onto the design system. It was the only public form hand-rolling its controls. See `VISUAL_INCONSISTENCY_LIST.md` §1 for the exact before/after.
   - Inputs/textarea → `Input` / `Textarea` primitives (control height `h-11 → h-10`, focus `focus:ring-2 → focus-visible:ring-3`, invalid state now tokenized).
   - Submit → `Button variant="primary" size="lg"` (radius `rounded-xl → rounded-lg`, hover `hover:bg-[--brand-deep] → hover:bg-primary/85`, gains standard focus-visible ring + disabled treatment).
   - Status message colors `text-emerald-700 / text-red-600` → `var(--success) / var(--danger)`.
   - Card radius `rounded-2xl` (≈1.35rem) → `rounded-[var(--card-radius)]` (1rem) + soft base shadow, matching sibling form/detail cards.
   - Behavior preserved: all `name`, hidden UTM/click-id fields, `data-ads-lead-form`, `data-ads-conversion`, analytics `useEffect`, and success/pending copy are unchanged.

### Flagged, not changed (require product sign-off — value/brand decisions)

- **`official` evidence badge** uses `bg-[var(--brand-deep)]` while a dedicated `--evidence-official` token exists and is unused. Aligning would shift the badge color, so it is documented rather than changed. (`DESIGN_SYSTEM_AUDIT.md` §5)
- **Dead legacy components** `src/components/listings/hero-search.tsx` and `src/components/search/search-form.tsx` are not imported by any route (`/search` is a redirect). They carry off-system controls (no focus ring at all on `hero-search`). Recommended for deletion; left untouched because they render on no public page. (`VISUAL_INCONSISTENCY_LIST.md` §6)
- **Focus-ring width convention** is split: primitives use `ring-3`, link/card affordances use `ring-2`. Internally consistent per role; unifying is a design decision. (`DESIGN_SYSTEM_AUDIT.md` §8)

---

## 4. Category verdicts

| Category | Verdict | Notes |
| --- | --- | --- |
| Typography | Pass | Single `ds-*` scale; clamp-based fluid headings; hierarchy intact. |
| Spacing | Pass | `.ds-section` / `.ds-container` / `.ds-card` centralize section, gutter, and card padding incl. mobile. |
| Buttons | Pass (after fix) | One `cva` source; project lead submit now uses it. |
| Cards | Pass (after fix) | `--card-radius` token everywhere after lead-form fix; media frame ratio uniform. |
| Colors | Pass | Token-driven; only off-token public colors were in the lead form (now fixed). Admin (non-public) still uses raw palette — out of scope. |
| Icons | Pass | `lucide-react`, `size-4/5` conventions, `aria-hidden` on decorative icons. |
| Images | Pass | `ListingMediaFrame` enforces `aspect-[16/10]` + `object-cover` + typed placeholder. |
| Forms | Pass (after fix) | All public forms now on `Field`/`Input`/`Button`. |
| Tables | Pass | No data tables; comparable data uses `<dl>` grids with consistent alignment. |
| Navigation | Pass | Header/footer localized, focus states present, mobile drawer labeled. |
| Animations | Pass | Uniform `transition duration-300`, `-translate-y-0.5` hover lift, `animate-spin` loader. |
| Accessibility | Pass | Landmarks, labeled controls, visible focus, `role=status/alert` on state components. |
| Responsive | Pass | See `RESPONSIVE_DESIGN_REPORT.md`. |

---

## 5. Validation

- `npx tsc --noEmit` — clean.
- `npx eslint src/components/projects/project-lead-form.tsx` — clean.
- `npm run test:ui-foundation` — all PASS (tokens, buttons, nav, footer, breadcrumb, contact separation).

---

## 6. Outcome

One deterministic public-page inconsistency found and fixed (project lead form). Remaining observations are documented as product decisions or dead-code cleanup. Layouts, IA, and functionality unchanged. Ready for CEO Product Review.
