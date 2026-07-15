# DATA_INTEGRITY_REPORT

## Listing package integrity

| Check | Result |
|-------|--------|
| Listing files dirty | **0** |
| PropertyHub | **617** |
| LivingInsider | **316** |
| DotProperty | **192** |
| FazWaz | **190** |
| Total | **1,315** |
| Project classifications | unchanged |
| Adapters | unchanged |

## Database

| Check | Result |
|-------|--------|
| Phase 8 migration applied | PASS |
| `marketplace_leads` present | PASS |
| `marketplace_lead_activities` present | PASS |
| Existing `properties` table retained | PASS |
| `property_listing_sources` retained | PASS |

## Safety

- No edits to `content/projects/*/listings*.json`
- Owner submissions do not write into published properties
- Demand leads are private (`payload.private=true`)
