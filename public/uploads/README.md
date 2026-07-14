# public/uploads

## Purpose

Reserved public path for lightweight, non-sensitive static uploads used in local/dev or explicitly allow-listed public files.

## Allowed files

- Images and documents explicitly approved for public serving
- This `README.md`
- Prefer empty in production repos; real uploads should use object storage

## Naming convention

- `{yyyy}/{mm}/{uuid-or-slug}.{ext}` to avoid collisions
- Never use original filenames that contain PII

## Owner

Platform / Backend team

## Validation rules

- Do not commit user PII, contracts, or secrets
- Production uploads should prefer Supabase Storage / CDN over git-tracked files
- Virus/content-type checks required before publish when pipeline exists

## Future usage

Dev mirror and rare static exceptions; primary upload pipeline targets managed storage.
