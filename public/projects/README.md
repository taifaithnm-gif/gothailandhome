# public/projects

## Purpose
Public static media for property projects (covers, galleries, floor-plan previews).

## Allowed files
- Images: `.webp`, `.jpg`, `.png`, `.svg`
- Optional: short `.mp4` previews if under size policy
- This `README.md`
- Subfolders: `{project-slug}/`

## Naming convention
- Project folders: kebab-case slug matching `content/projects/{slug}`
- Files: `{slot}-{index}.{ext}` e.g. `cover-01.webp`, `gallery-03.webp`, `amenity-pool.webp`

## Owner
Content / Media team

## Validation rules
- Slug must match an existing project package when published
- Follow MEDIA_STANDARD / MEDIA_STANDARD_V2 size and format rules
- Do not store raw import dumps (use `storage/imports/`)

## Future usage
Hot-linked by project and listing pages; may be replaced by CDN paths while keeping this folder as local/dev mirror.
