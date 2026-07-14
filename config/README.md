# Contact configuration

Editable platform contact directory for GoThailandHome.

## File

`config/contacts.json`

Public pages load this file via `src/lib/config/contacts.ts`.

## Fields (per contact)

| Field          | Type                             |
| -------------- | -------------------------------- |
| `id`           | Stable key                       |
| `name`         | Display name                     |
| `role`         | i18n `{ en, zh, th }`            |
| `languages`    | Locale codes, e.g. `["en","zh"]` |
| `phone`        | String or null                   |
| `whatsapp`     | String or null                   |
| `line`         | LINE ID or null                  |
| `wechat`       | WeChat ID or null                |
| `email`        | String or null                   |
| `availability` | i18n hours/note                  |
| `active`       | Publish flag                     |
| `sort_order`   | Display order                    |

## Editing without code changes

1. Edit `config/contacts.json` (or future admin UI writing the same file / table).
2. Redeploy or hot-reload as applicable — no page component changes required.

Future admin should update this configuration only; do not hardcode contacts in React pages.
