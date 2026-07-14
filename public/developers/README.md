# public/developers

## Purpose

Public, static media for developer (publisher) brand assets referenced by the frontend.

## Allowed files

- Images: `.svg`, `.png`, `.webp`, `.jpg`
- This `README.md`
- Optional subfolders: `{developer-slug}/`

## Naming convention

- Developer folders: lowercase kebab-case slug matching content manifest (`sansiri`, `ananda-development`)
- Files: `{developer-slug}-{asset}.{ext}` or inside slug folder: `logo.svg`, `cover.webp`

## Owner

Content / Media team

## Validation rules

- Must correspond to a known developer slug in `content/developers/`
- No unverified or scraped watermarks without rights clearance
- Prefer curated exports from the media pipeline over ad-hoc dumps

## Future usage

Served on developer profile pages and listing cards; fed by Media Standard V2 pipeline.
