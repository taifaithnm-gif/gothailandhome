# Developers

Developer Factory V1 knowledge base packages.

## Layout

```text
content/developers/
  DEVELOPER_INDEX.json
  DEVELOPER_DIRECTORY.md
  <slug>/
    README.md          # compliance metadata
    manifest.json      # structured package
    profile.md         # markdown knowledge base
public/developers/<slug>/
  logo.svg
  logo.meta.json
```

## Validation

```bash
npm run factory:validate -- --developers
```

## Rules

- Official website and/or SET factsheet sources required
- No fabricated establish years, tickers, contacts, or market portfolios
- Project city buckets use **imported factory packages only**
