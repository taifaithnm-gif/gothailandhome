# Content Factory Implementation Plan V1

**Status:** Planning and implementation design only  
**Phase:** Alpha RC / Feature Freeze  
**Current constraint:** Stop after documentation. Do not implement, deploy, commit, push, crawl, collect data, modify pages, or change schema.

---

## 1. Purpose

This document defines a future implementation plan for the enterprise Content Factory. It is designed for phased delivery after review approval and after Alpha RC constraints are lifted.

The plan supports 100+ future websites through reusable platform services and site configuration.

---

## 2. Current Phase Position

Current task output is documentation only:

- `CONTENT_FACTORY_ARCHITECTURE.md`
- `CONTENT_FACTORY_DATABASE.md`
- `CONTENT_FACTORY_PIPELINE.md`
- `CONTENT_FACTORY_REVIEW_WORKFLOW.md`
- `CONTENT_FACTORY_DATA_MODEL.md`
- `CONTENT_FACTORY_IMPLEMENTATION_PLAN.md`

No implementation should begin until these documents are reviewed and approved.

---

## 3. Implementation Strategy

Build the Content Factory in layers:

```text
Foundation
  -> Source Governance
  -> Evidence Store
  -> Parsing Framework
  -> Normalization Framework
  -> Knowledge Layer
  -> Review Layer
  -> Localization Layer
  -> Media Layer
  -> Publishing Layer
  -> Multi-Site Operations
```

Each layer should be independently testable, versioned, and reversible.

---

## 4. Phase 0: Review and Approval

Goal:

- Validate architecture before any code or schema work.

Tasks:

- Review all six V1 documents.
- Confirm business priorities across initial websites.
- Confirm first pilot vertical.
- Confirm source policy and rights posture.
- Confirm whether implementation belongs inside current app, a separate service, or a separate repository.
- Identify compliance requirements.
- Approve or revise logical database model.

Deliverables:

- Approved architecture baseline
- Pilot scope decision
- Risk register
- Implementation owner decision

Exit criteria:

- Written approval to proceed beyond documentation
- Clear permission for schema proposal or no-schema prototype

---

## 5. Phase 1: Foundation Prototype

Goal:

- Build a no-crawler, no-production-impact prototype using manual sample inputs only.

Allowed future inputs:

- Manually provided sample HTML
- Manually provided PDF
- Manually provided Word document
- Manually provided Excel file
- Manually provided image
- Manually provided RSS fixture

Core work:

- Define package interfaces.
- Create source registry prototype.
- Create raw item fixture store.
- Create parser interface.
- Create normalized document interface.
- Create audit event interface.
- Create local-only tests.

Not included:

- Crawling
- Scheduled collection
- Production database writes
- Website publishing
- UI changes

Exit criteria:

- Sample fixtures can move from source registration to parsed document output.
- Every object has provenance and version metadata.
- Prototype can be discarded without production impact.

---

## 6. Phase 2: Source Registry and Policy Engine

Goal:

- Create the governed source inventory.

Core work:

- Implement source types.
- Implement source-site permissions.
- Implement collection policy checks.
- Implement rights policy fields.
- Implement source status workflow.
- Implement audit log for source changes.
- Implement validation tests.

Key decisions:

- Storage engine
- Secret management for future APIs
- Reviewer role model
- Source approval authority

Exit criteria:

- No collection job can be created for an unapproved source.
- Source policy can explain whether a source may be collected, parsed, translated, and published.

---

## 7. Phase 3: Evidence Store and Parser Framework

Goal:

- Preserve raw evidence and produce parser output across supported document types.

Core work:

- Raw item storage abstraction
- Content hash and versioning
- Parser plugin interface
- HTML parser
- RSS parser
- PDF parser
- Word parser
- Excel parser
- Image metadata parser
- OCR handoff interface
- Parser confidence scoring
- Parser error handling

Exit criteria:

- Each parser produces a normalized parsed document object.
- Sections can be cited by facts and review tasks.
- Parser failures route to technical or intake review.

---

## 8. Phase 4: Normalization Framework

Goal:

- Convert parsed content into consistent, site-independent normalized records.

Core work:

- Text cleanup
- Language normalization
- Date normalization
- Unit normalization
- Currency normalization
- URL normalization
- Address and location normalization
- Slug generation
- Table normalization
- Boilerplate removal

Exit criteria:

- Normalization preserves original values and normalized values.
- Missing values remain missing.
- Rules are configurable by vertical and site where needed.

---

## 9. Phase 5: Knowledge Extraction

Goal:

- Extract candidate facts, claims, FAQs, entities, and relationships with evidence references.

Core work:

- Extraction task model
- Rule-based extractors
- Table mappers
- Entity mention extraction
- FAQ extraction
- Article outline extraction
- Claim extraction
- AI-assisted extraction interface
- Extraction version tracking
- Evidence linking

Exit criteria:

- Candidate knowledge objects include source evidence.
- Extraction method and version are recorded.
- Low-confidence extraction routes to review.

---

## 10. Phase 6: Entity Registry and Resolution

Goal:

- Create canonical shared entities for 100+ websites.

Core work:

- Entity types and aliases
- Entity evidence links
- Exact match rules
- Alias match rules
- URL match rules
- Structured identity keys
- Merge and split workflow
- Entity duplicate detection
- Entity review tasks

Exit criteria:

- New candidate entities can be approved, merged, rejected, or aliased.
- Canonical entities can be reused across websites.

---

## 11. Phase 7: Relationship Mapping

Goal:

- Link entities into a reusable knowledge graph.

Core work:

- Relationship types
- Relationship evidence
- Relationship confidence
- Validity periods
- Relationship review
- Conflict detection
- Relationship duplicate detection

Exit criteria:

- Relationships are directional, evidence-backed, and reviewable.
- Websites can consume relationships without custom extraction logic.

---

## 12. Phase 8: Classification and Taxonomy

Goal:

- Route content to websites, topics, audiences, risk classes, and publishing channels.

Core work:

- Taxonomy definitions
- Site taxonomy overlays
- Rule classifiers
- AI-assisted classifiers
- Classification review
- Topic hierarchy management
- Risk classification

Exit criteria:

- Content can be classified for more than one website.
- Site eligibility is controlled by policy, not by hard-coded logic.

---

## 13. Phase 9: Confidence, Quality, and Duplicate Systems

Goal:

- Provide explainable trust and duplicate controls.

Core work:

- Confidence scoring service
- Quality scoring service
- Exact duplicate detection
- Soft duplicate detection
- Media perceptual hash matching
- Duplicate group workflow
- Conflict detection
- Score history

Exit criteria:

- Scores include explainable breakdowns.
- Duplicate groups are reviewable.
- Blocking conflicts prevent publication.

---

## 14. Phase 10: Review Workflow Engine

Goal:

- Implement review tasks, decisions, escalation, and workflow gates.

Core work:

- Review task queue
- Review checklist definitions
- Review decisions
- Role permissions
- Escalation rules
- SLA tracking
- Audit log
- Reopen logic

Exit criteria:

- Required review gates block publish readiness until complete.
- All decisions are immutable and auditable.

---

## 15. Phase 11: Multi-Language Pipeline

Goal:

- Support multilingual content for all sites with glossary and translation memory.

Core work:

- Locale policy per site
- Glossary terms
- Translation memory
- Protected terms
- Translation draft interface
- Locale QA rules
- Language review workflow
- SEO localization

Exit criteria:

- Localized content preserves facts across languages.
- Required locales are enforced per site.
- Translation quality is reviewable and versioned.

---

## 16. Phase 12: Media Pipeline

Goal:

- Process images and future media safely and reuse them across sites.

Core work:

- Media asset registry
- Hashing and perceptual hash
- Metadata extraction
- Rights policy enforcement
- Derivative generation
- Alt text drafts
- Caption workflow
- Media review
- Asset linking

Exit criteria:

- Media cannot publish without rights approval.
- Duplicates are detected.
- Site adapters can request approved derivatives.

---

## 17. Phase 13: Publishing Layer

Goal:

- Produce versioned content packages for website adapters.

Core work:

- Publish package schema
- Package assembler
- Site adapter interface
- Publish readiness checks
- Package versioning
- Publish events
- Failure reporting
- Rollback or supersession path

Exit criteria:

- Content Factory can produce approved packages without controlling website UI.
- Websites can consume packages independently.

---

## 18. Phase 14: Pilot Website Integration

Goal:

- Integrate one pilot website without redesigning pages or changing unrelated architecture.

Pilot selection criteria:

- Clear source policy
- Limited content types
- Limited languages
- Low compliance risk
- Review team available
- Easy rollback

Candidate pilot options:

- Knowledge articles only
- FAQ only
- Entity profiles only
- Media library only

Exit criteria:

- One site consumes approved packages through an adapter.
- No direct factory dependency leaks into page UI.
- Pilot metrics are collected.

---

## 19. Phase 15: Multi-Site Scale-Up

Goal:

- Expand from one pilot to many websites through configuration.

Core work:

- Site onboarding template
- Source onboarding template
- Taxonomy import/export
- Review policy templates
- Locale policy templates
- Adapter templates
- Operational dashboards
- Backlog management

Exit criteria:

- A new website can be added by configuration and adapter setup.
- Shared entities, sources, media, glossary, and translation memory are reused.

---

## 20. Testing Strategy

Test layers:

- Unit tests for parsers and normalizers
- Contract tests for data objects
- Policy tests for source permissions
- Workflow tests for review gates
- Duplicate detection tests
- Localization invariance tests
- Media rights tests
- Publishing package validation tests
- Regression tests for versioning and audit

Fixture strategy:

- Use manually approved sample files.
- Avoid live crawling in early phases.
- Store expected outputs.
- Include malformed and low-confidence samples.

---

## 21. Operational Metrics

Track:

- Sources registered
- Sources approved
- Collection success rate
- Parser failure rate
- Extraction confidence distribution
- Duplicate group count
- Review backlog
- Review SLA breach count
- Translation backlog
- Media rights backlog
- Publish-ready packages
- Published packages
- Reopened content
- Takedown requests
- Archived content

---

## 22. Security and Compliance Workstream

Required before production use:

- Role-based access model
- Secret reference storage
- Audit log retention
- Source rights policy review
- Takedown workflow
- PII detection policy
- Jurisdiction restrictions
- Backup and retention policy
- Legal review for collection methods
- AI usage disclosure policy where required

---

## 23. Architecture Decision Points

Before implementation, decide:

- Same repository or separate Content Factory repository
- Same database or dedicated factory database
- Queue system
- Object storage provider
- Search and vector index strategy
- Workflow engine approach
- AI provider abstraction
- Translation provider abstraction
- Media processing provider
- Adapter contract for current and future websites
- Observability platform

---

## 24. Suggested MVP Scope

Recommended MVP after review approval:

- Manual source registration
- Manual file upload fixtures
- Raw evidence storage
- PDF, Word, Excel, image metadata, and RSS fixture parsing
- Normalized document objects
- Entity and fact candidates
- Basic review tasks
- Confidence scoring v1
- Duplicate detection v1
- Locale glossary v1
- Publish package JSON output

Defer:

- Crawling
- Scheduling
- Production publishing
- Automated legal compliance
- Large-scale entity graph automation
- Advanced AI rewrite flows

---

## 25. Risks

Key risks:

- Source rights ambiguity
- Over-reliance on AI extraction
- Duplicate entity fragmentation
- Translation drift
- Media copyright exposure
- Review backlog at scale
- Schema coupling to one website
- Premature publishing before governance is ready
- Crawler misuse or accidental collection outside policy

Mitigations:

- Source registry gates
- Evidence-backed extraction
- Human review for risk classes
- Versioned decisions
- Rights status gates
- Site-independent data model
- No-crawler MVP
- Clear publishing adapter boundary

---

## 26. Stop Point

The current work stops at documentation. The next action is human review of these six documents. Implementation should not begin until explicitly approved.
