# Areas

Bangkok district packages: `content/areas/bangkok/districts/<slug>.json`

## Validation

- Exactly one package per Bangkok khet (50)
- metadata.postal_code + sourced coords from Wikipedia/BMA list
- transportation/schools/hospitals/shopping arrays may be empty unless sourced
- investment_summary must not invent % yields
- nearby_projects lists only imported factory project slugs
