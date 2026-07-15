# DESIGN_SYSTEM_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8 — Alpha UI Foundation

## Scope

Production UI foundation tokens and primitives. Existing page content was not redesigned (homepage untouched beyond shared header/footer/container utilities).

## Typography

| Token / class | Role |
|---------------|------|
| `--text-display` / `.ds-display` | Brand / hero display |
| `--text-h1` / `.ds-h1` | Page titles |
| `--text-h2` / `.ds-h2` | Section titles |
| `--text-h3` / `.ds-h3` | Card / block titles |
| `--text-body` / `.ds-body` | Body |
| `--text-body-sm` / `.ds-body-sm` | Supporting |
| `--text-caption` / `.ds-caption` | Labels / captions |

Fonts remain Plus Jakarta + Noto SC + Noto Thai stack for multilingual consistency (`font-heading` / `--font-body`).

## Spacing

| Token | Use |
|-------|-----|
| `--space-1` … `--space-16` | Scale |
| `--container` + `.ds-container` | Max width + gutters |
| `--section-y` / `--section-y-mobile` + `.ds-section` | Section vertical rhythm |
| `--card-pad` / `--card-pad-mobile` | Card padding |

## Color

| Token | Role |
|-------|------|
| `--brand` / `--primary` | Primary |
| `--secondary` | Secondary surfaces |
| `--success*` | Success |
| `--warning*` | Warning |
| `--danger*` | Danger |
| `--evidence-*` | Official / verified / portal / derived / unverified badges |

## Components delivered

- Buttons: `primary`, `secondary`, `ghost`, `danger` (+ legacy aliases)
- Forms: `Field`, `Input`, `Select`, `Textarea`, `FieldError`
- Cards: `SurfaceCard`, `ListingCardShell`, `ProjectCardShell`, `DeveloperCardShell`, `DistrictCardShell`
- Badges: `VerificationBadge`, `SourceBadge`
- States: `LoadingState`, `EmptyState`, `ErrorState`
- `Breadcrumb`
- `NoImagePlaceholder` (re-export of `ListingMediaFrame`)

Files: `src/styles/design-tokens.css`, `src/app/globals.css`, `src/components/ui/*`
