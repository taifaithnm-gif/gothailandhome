# public/contact

## Purpose
Static contact-page assets (maps, QR codes, partner contact graphics) served from the Next.js public directory.

## Allowed files
- Images: `.svg`, `.png`, `.webp`, `.jpg`
- Optional: `.pdf` for printable contact cards
- This `README.md`

## Naming convention
- Lowercase kebab-case: `{purpose}-{variant}.{ext}`
- Examples: `office-map.webp`, `line-qr.png`

## Owner
Frontend / Platform team

## Validation rules
- No secrets, private phone dumps, or personal data files
- Prefer WebP/SVG; keep individual files under 500 KB
- Do not store user-uploaded contact forms here (use `public/uploads/` or storage)

## Future usage
Referenced by contact and about pages; may later sync selected assets from approved media packages.
