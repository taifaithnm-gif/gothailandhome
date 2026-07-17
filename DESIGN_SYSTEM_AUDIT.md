# Design System Audit — Phase 12

Token- and primitive-level audit of the shared design system. Sources: `src/styles/design-tokens.css`, `src/app/globals.css`, `src/components/ui/*`.

Legend: **OK** = consistent / single source of truth · **FIX** = corrected this pass · **FLAG** = documented, needs product decision.

---

## 1. Typography — OK

Scale defined once in `design-tokens.css` and exposed as `ds-*` utilities in `globals.css`:

| Role | Token | Utility | Line height | Weight source |
| --- | --- | --- | --- | --- |
| Display | `--text-display` `clamp(2rem,…,3rem)` | `.ds-display` | 1.15 | heading font |
| H1 | `--text-h1` `clamp(1.75rem,…,2.25rem)` | `.ds-h1` | 1.2 | heading font |
| H2 | `--text-h2` `clamp(1.375rem,…,1.75rem)` | `.ds-h2` | 1.25 | heading font |
| H3 | `--text-h3` `1.25rem` | `.ds-h3` | 1.3 | heading font |
| Body | `--text-body` `1rem` | `.ds-body` | 1.65 | body font |
| Body-sm | `--text-body-sm` `0.875rem` | `.ds-body-sm` | 1.55 | body font |
| Caption | `--text-caption` `0.75rem` | `.ds-caption` | 1.4, uppercase, +0.04em | body font |

- Headings share one font stack (`--font-display` + CJK/Thai fallbacks) and brand-deep color.
- Hierarchy: `PageShell` renders the single page `h1` via `.ds-h1`; section titles use `.ds-h2/.ds-h3`; card titles use `font-heading text-xl`. No skipped-level violations found on public pages.
- Fluid `clamp()` sizing removes hard breakpoint jumps in headings.

## 2. Spacing — OK

- Vertical rhythm: `.ds-section` → `--section-y-mobile` (2rem) below 640px, `--section-y` `clamp(2.5rem,…,3.5rem)` above.
- Horizontal gutters: `.ds-container` → `--space-4` inline padding, `--space-6` ≥640px, capped at `--container` (72rem).
- Card padding: `.ds-card` → `--card-pad-mobile` (1rem) then `--card-pad` (1.25rem) ≥640px.
- Grid gaps use the Tailwind `gap-*` scale consistently (`gap-2/3/4/6`); index grids use `gap-6`.

## 3. Buttons — OK (after FIX)

Single source: `buttonVariants` cva in `src/components/ui/button.tsx`.

- Variants: `primary/default, secondary, ghost, danger, destructive, outline, link`.
- Sizes: `xs(h-7) · sm(h-8) · default(h-10) · lg(h-11) · icon(size-10) · icon-xs/sm/lg`.
- Radius `rounded-lg`; focus `focus-visible:ring-3 ring-ring/50`; disabled `opacity-50 pointer-events-none`; invalid `aria-invalid` ring; loading handled by callers via `disabled` + `aria-busy`.
- **FIX:** project lead form previously used a raw `<button>` (`rounded-xl`, `hover:bg-[--brand-deep]`, no focus-visible ring). Now `Button variant="primary" size="lg"`.

## 4. Cards & surfaces — OK (after FIX)

- `.ds-card` base: `1px --brand-line` border, `--card-radius` (1rem), white fill, `0 1px 0 rgba(6,61,56,.04)` base shadow.
- Hover convention unified across `ProjectCardShell / DeveloperCardShell / DistrictCardShell / MarketplaceEntryGrid`: `transition duration-300`, `-translate-y-0.5`, `border-[--brand]/40`, `shadow-[var(--shadow-soft)]`.
- `ListingCardShell` uses a slightly stronger hover shadow (`0 18px 40px …`) appropriate to media cards; base radius/border identical.
- **FIX:** project lead form card radius `rounded-2xl` (≈1.35rem via `--radius-2xl`) → `rounded-[var(--card-radius)]` (1rem) + base shadow, matching sibling cards.
- Intentional exceptions (floating glass panels over hero imagery: `home-hero-search`, contact aside, admin login) keep `rounded-2xl` by design — not counted as defects.

## 5. Colors & badges — OK / FLAG

- Brand: `--brand #0a5c54`, `--brand-deep #063d38`, `--brand-gold #e0b34d`, `--brand-soft`, `--brand-line`.
- Status: `--success #1f7a4d`, `--warning #b7791f`, `--danger #b42318` each with `-soft` / `-foreground` pairs.
- Evidence: `--evidence-official/verified/portal/derived/unverified` drive `Badge` tones + `VerificationBadge`.
- **FIX:** the only off-token public colors (`text-emerald-700` / `text-red-600` in the lead form status line) now use `--success` / `--danger`.
- **FLAG:** `Badge` tone `official` renders `bg-[var(--brand-deep)]` while `--evidence-official (#0a5c54)` exists and is otherwise unused. The other four evidence tones map to their tokens. Aligning would visibly change the badge color, so it is flagged for product decision rather than changed.
- Note (out of scope): admin-only screens (`/admin/*`) still use raw Tailwind palette (`emerald-50`, `red-700`, `amber-50`). Not public — excluded per scope.

## 6. Icons — OK

- Library: `lucide-react` throughout.
- Sizing: inline icons `size-4`, state icons `size-8`, close/nav `size-5`; button auto-sizes svg to `size-4` (`size-3/3.5` for `xs/sm`).
- Decorative icons carry `aria-hidden`; stroke inherits the lucide default (2px) — no ad-hoc stroke overrides found.

## 7. Forms & fields — OK (after FIX)

Single source: `src/components/ui/field.tsx` shared control class — `h-10`, `rounded-xl`, `--brand-line` border, `--brand-soft` fill, `focus-visible:border-[--brand] focus-visible:ring-3 ring-[--brand]/20`, `disabled:opacity-50`, `aria-invalid:border-[--danger]`.

- `FieldLabel` (medium, brand-deep), `FieldHint` (`text-xs stone-500`), `FieldError` (`text-xs --danger`, `role=alert`).
- Marketplace `form-kit` composes these + `FormShell`, `FormField`, `FormSubmitButton`, `FormSuccessState`, `FormFailureBanner`, `ConsentCheckbox`. All four public forms (`find-my-home`, `list-your-property`, `partners/*`, `contact`) consume it.
- Listing filters (`listing-filters.tsx`) and home hero (`home-hero-search.tsx`) consume `Field`/`Input`/`Select`/`Button`.
- **FIX:** project lead form now consumes the same primitives (was the last raw-control form on a public page).

## 8. Focus / interaction conventions — OK / FLAG

- Controls & buttons: `focus-visible:ring-3`.
- Link & card affordances (header, footer, breadcrumb, property card, home cards, marketplace card): `focus-visible:ring-2 ring-[--brand]/30–35`.
- **FLAG:** two ring widths coexist (3 for controls, 2 for links). Each is consistent within its role; unifying to one width is a design choice, not a defect.
- Motion: `transition duration-300` for cards, `transition/transition-all` for buttons/controls; hover lift `-translate-y-0.5`; loader `animate-spin`. No reduced-motion-hostile animations.

## 9. State components — OK

`LoadingState` (`role=status`, spinner + label), `EmptyState` (dashed surface, `ds-h3`), `ErrorState` (`role=alert`, `--danger-soft`) share the `--card-radius` dashed/solid surface pattern.

---

## Summary

| Area | Status |
| --- | --- |
| Typography | OK |
| Spacing | OK |
| Buttons | OK (fixed lead form) |
| Cards | OK (fixed lead form) |
| Colors | OK (fixed lead form) · `official` badge FLAG |
| Icons | OK |
| Forms | OK (fixed lead form) |
| Focus/motion | OK · ring-width FLAG |
| States | OK |

The system has a genuine single source of truth. After the lead-form fix, no public component bypasses it. Two FLAGs are product decisions, not defects.
