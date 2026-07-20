# Responsive verification artifacts (P1-03)

## Agreed viewport matrix

| ID | Width (CSS px) | Intent |
| --- | ---: | --- |
| `mobile` | 375 | Single-column layouts, mobile nav chrome, ≥44px touch targets on primary chrome |
| `tablet` | 768 | Mid grids (`sm`/`md`), footer columns |
| `desktop` | 1280 | Primary nav, multi-column detail / marketplace layouts (`lg`/`xl`) |

Core public routes match the Phase 1 accessibility baseline set (home, properties,
property detail, projects, project/developer/district detail, marketplace,
find-my-home, contact, knowledge).

## Screenshot / evidence path policy

Optional local visual evidence (not required for CI structural checks):

```text
artifacts/responsive/{routeId}/{viewportId}.png
```

Examples:

```text
artifacts/responsive/home/mobile.png
artifacts/responsive/properties/tablet.png
artifacts/responsive/property-detail/desktop.png
```

Capture guidance when producing evidence (P1-34 or manual review):

1. Use the agreed widths above (375 / 768 / 1280).
2. Record horizontal overflow, clipped controls, or unusable target sizes with
   route ID + viewport ID in the filename path.
3. Do not commit binary captures by default — PNG/WebP under this tree are
   gitignored; keep this README and any text manifests tracked.
4. Structural contracts are enforced by `npm run test:responsive` without a
   browser or live network.

## Automated gate

```bash
npm run test:responsive
```

Failures report `route:` + `viewport:` + `selector:` context for overflow,
clipped-control, and target-size contract breaks.
