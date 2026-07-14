# public/avatars

## Purpose
Default and curated avatar images for agents, admins, and placeholder users.

## Allowed files
- Images: `.webp`, `.png`, `.jpg`
- This `README.md`

## Naming convention
- `default-{style}.{ext}`, `agent-placeholder-{n}.{ext}`, or `{role}-avatar.{ext}`
- Examples: `default-circle.webp`, `agent-placeholder-01.png`

## Owner
Frontend / Platform team

## Validation rules
- No real user PII portraits unless explicitly licensed and approved
- Square crops preferred (1:1)
- Keep under 200 KB each

## Future usage
Fallbacks for profile UI; user-uploaded avatars will live in storage/CDN, not necessarily here.
