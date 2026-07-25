# Duplicate Engine

**Source:** `src/lib/staging-import/duplicate-check.ts`

## Scope

Unified duplicate detection for:

- Developer (id, name, alias, slug, website URL)
- Project (id, name, slug, developer+name composite)
- Image (id, content hash)
- PDF (id, content hash)
- News (id, source URL)
- Similarity (project name token overlap — advisory)

## Output

Every hit uses:

```ts
action: "WOULD_SKIP_DUPLICATE"
```

## Forbidden

- Auto merge
- Auto approve of the surviving record
- Silent overwrite

## Seeding existing site data

```ts
engine.seedExisting({
  developerSlugs: [...],
  projectSlugs: [...],
  imageHashes: [...],
  pdfHashes: [...],
  newsUrls: [...],
});
```

Used to compare inbound batch entities against known site identities without writing anything.
