# Changelog — Phase 2 (Release Candidate)

All notable Phase 2 changes relative to Phase 1 `v1.0.0`.

## [Phase 2 RC] — 2026-07-21

### Added
- Feature flag framework (`FEATURE_P2_*`, defaults OFF)
- Customer account surfaces and saved search/items sync contracts
- Admin ops lead inbox and acquisition reviewer console
- Notification prefs/outbox and CRM webhook adapter
- Partner portal with developer/agent RBAC and invites
- Map MVP + district deep links (OSM, evidenced coordinates only)
- Tools hub: mortgage calculator, legal checklist, investment assist
- L0 AI similar-listings rail and AI policy/kill switch
- Expanded analytics event helpers (consent + expansion flag)
- Additive SQL migrations for Phase 2A and 2B
- Phase 2 planning docs, milestone reports, and RC package under `REPORTS/` / `RELEASES/Phase2/`
- Contract tests: `test:phase2-*`

### Changed
- Marketplace lead capture optionally links customer user / acquisition when flags ON
- Property detail can show AI similar rail when AI flag ON
- Sitemap conditionally includes map/tools when flags ON
- Robots disallow `/account` and `/partners/app`
- Dictionaries EN/ZH/TH extended for account/map/tools

### Security
- RLS policies for new customer/ops/partner/acquisition tables
- Partner permission checks on portal actions
- Acquisition intake rate limit (email/hour)

### Known
- Optional tasks P2-090–P2-094 deferred
- L1/L2 vector recommendations deferred
- Production flag enablement and version tag are Owner decisions

### Migration
- `20260721100000_phase2a_customer_ops.sql`
- `20260721120000_phase2b_acquisition_partners.sql`
