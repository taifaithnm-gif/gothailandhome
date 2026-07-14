# content/districts

## Purpose
Canonical structured packages for district entities (geography, SEO, relations to city/areas).

## Allowed files
- JSON packages per district: `{district-slug}.json` or `{district-slug}/manifest.json`
- This `README.md`
- Supporting locale fragments only if schema allows

## Naming convention
- Slug: lowercase kebab-case Thai district romanization (`khlong-toei`, `watthana`)
- Must align with AREA_STANDARD / glossary district keys

## Owner
Content / Data team

## Validation rules
- Must pass factory / DATA_STANDARD validators before apply
- Required: slug, city relation, name (en/zh/th), sources when factual claims are present
- No fabricated market stats

## Future usage
Import pipeline target for district pages; may absorb or cross-link packages currently under `content/areas/*/districts/`.
