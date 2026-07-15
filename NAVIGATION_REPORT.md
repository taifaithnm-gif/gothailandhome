# NAVIGATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8 — Alpha UI Foundation

## Desktop

- Sticky brand header with primary link row (browse + marketplace + company)
- Language switcher (EN / ZH / TH)
- Uses `.ds-container` for alignment with page shell

## Mobile

- Hamburger menu (`lg` breakpoint) with **grouped** sections:
  - Browse
  - Marketplace
  - Company
- Language switches retained in drawer
- `aria-expanded` / `aria-controls="mobile-nav"` preserved

## Footer

- Brand + Explore + Company columns
- Same `.ds-container` rhythm

## Breadcrumb

- Shared `Breadcrumb` component with `aria-label="Breadcrumb"`
- Wired into `PageShell` via optional `breadcrumbs` prop (opt-in; pages can adopt without homepage redesign)

## Non-goals

- No IA cut of routes in this milestone (product backlog A8 remains for later)
- Homepage hero structure unchanged
