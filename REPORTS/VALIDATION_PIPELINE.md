# VALIDATION_PIPELINE

## Layers

1. **Contract** — batchId, schemaVersion, entity id uniqueness, count warnings
2. **Schema** — required fields (e.g. news.sourceUrl)
3. **Hash** — 64-char hex for images/PDFs
4. **Province** — 77 provinces + aliases (Pattaya, Hua Hin, …)
5. **Developer** — UNKNOWN, DNS failure, website, evidence
6. **Evidence** — missing / unsafe path / bad hash

## Entry point

`runValidationEngine(batch)` → `{ ok, issues, counts }`

## CLI

`npm run staging:validate`
