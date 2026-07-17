# Visual Inconsistency List — Phase 12

Enumerated inconsistencies found during the design QA pass. Each entry: location, expected (system) value, actual value, resolution.

Status: **FIXED** (deterministic, corrected) · **FLAG** (documented, needs product decision) · **OUT OF SCOPE** (not a public page).

---

## 1. FIXED — Project lead form bypassed the design system
**File:** `src/components/projects/project-lead-form.tsx` (rendered on `/[lang]/projects/[slug]`)

The only public form hand-rolling its controls instead of using shared primitives.

| Element | Expected (system) | Was | Now |
| --- | --- | --- | --- |
| Text/email/phone inputs | `Input` primitive — `h-10`, `focus-visible:ring-3`, tokenized invalid | raw `<input>` `h-11`, `focus:ring-2` (fires on mouse), no invalid state | `Input` primitive |
| Message field | `Textarea` primitive | raw `<textarea>` `py-3` | `Textarea` primitive |
| Labels | `FieldLabel` inside `Field` | `<label><span>` ad-hoc | `Field` + `FieldLabel` (with `htmlFor`/`id`) |
| Submit button | `Button variant="primary" size="lg"` — `rounded-lg`, `hover:bg-primary/85`, focus-visible ring, disabled opacity | raw `<button>` `rounded-xl`, `hover:bg-[--brand-deep]`, no focus ring | `Button` primitive |
| Status message color | `var(--success)` / `var(--danger)` | `text-emerald-700` / `text-red-600` (off-token) | tokenized |
| Card radius | `--card-radius` (1rem) + base shadow | `rounded-2xl` (≈1.35rem), no base shadow | `rounded-[var(--card-radius)]` + `shadow-[0_1px_0_rgba(6,61,56,.04)]` |

**Behavior preserved:** all `name` attributes, hidden UTM/`gclid`/`fbclid` fields, `data-ads-lead-form`, `data-ads-conversion="lead_submit"`, the conversion-tracking `useEffect`, and pending/success copy are unchanged.

---

## 2. FIXED — Off-token status colors (public)
Covered by §1. `text-emerald-700` / `text-red-600` were the only raw-palette status colors on a public page; both replaced with `--success` / `--danger`.

---

## 3. FIXED — Control-height & focus drift on the project page
Covered by §1. Lead-form inputs were `h-11` with `focus:` (visible on click), diverging from the system standard `h-10` / `focus-visible:ring-3` used by every other public field.

---

## 4. FIXED — Card radius drift on the project lead card
Covered by §1. `rounded-2xl` (≈1.35rem) vs the `--card-radius` (1rem) used by all sibling detail/form cards.

---

## 5. FLAG — `official` evidence badge does not use its own token
**File:** `src/components/ui/badge.tsx`

`tone: official` → `bg-[var(--brand-deep)]` (`#063d38`) while `--evidence-official` (`#0a5c54`) exists and is unused. The other four evidence tones (`verified/portal/derived/unverified`) map to their `--evidence-*` tokens.

**Not changed:** aligning shifts a visible brand/trust color; flagged for product decision.

---

## 6. FLAG — Dead legacy form components (off-system, not rendered)
**Files:** `src/components/listings/hero-search.tsx`, `src/components/search/search-form.tsx`

Neither is imported by any route (`/[lang]/search` is a server redirect to `/properties`). Both use raw controls; `hero-search.tsx` inputs/selects have **no focus indicator at all** and its submit uses `font-semibold` vs the system `font-medium`.

**Not changed:** they render on no public page. **Recommendation:** delete in a follow-up cleanup PR to remove drift risk.

---

## 7. FLAG — Two focus-ring widths by role
**Files:** `field.tsx` / `button.tsx` (`ring-3`) vs header/footer/breadcrumb/cards (`ring-2`).

Consistent within each role (controls vs links). Unifying to a single width is a design choice, not a defect.

---

## 8. OUT OF SCOPE — Admin screens use raw palette
**Files:** `src/app/admin/**`, `src/components/admin/property-form.tsx`

`emerald-50/700`, `red-50/700`, `amber-50/700` instead of status tokens. These are internal (non-public) pages, excluded by the audit scope. Noted for a future internal-tooling pass.

---

## Tally

| Status | Count |
| --- | --- |
| FIXED (deterministic) | 4 (§1–§4, all within the lead-form component) |
| FLAG (product decision / cleanup) | 3 (§5–§7) |
| OUT OF SCOPE | 1 (§8) |

No layout, IA, or functional changes were made.
