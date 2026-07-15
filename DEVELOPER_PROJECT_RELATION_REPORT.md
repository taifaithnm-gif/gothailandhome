# DEVELOPER_PROJECT_RELATION_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.6 — Developer Detail Alpha

## Relation source

Published `property_projects.developer_id` / developer slug filter via `listPublishedProjects({ developerSlug })`.  
Package `project_slugs` / completed / active arrays are presentation aides only — **relations were not rewritten**.

## UI grouping

| Group | Rule |
|-------|------|
| Projects with active listings | Platform project with `listPublishedPropertiesPaged` total &gt; 0 |
| Projects without current listings | total === 0 |
| Completed / active counts | From Developer Master matrix + package lists, labelled OFFICIAL or FACTORY_LINKED |

## Disclaimer

Copy states these are projects **on GoThailandHome**, not the developer’s complete official portfolio.

## Baseline counts preserved

- Developers: **20**
- Projects: **50**

## Overall

# PASS — Relations presentation-only
