# Content Factory Pipeline V1

**Status:** Planning and implementation design only  
**Scope:** Future reusable pipeline for 100+ websites  
**Current constraint:** Do not run collectors, crawl websites, collect data, deploy, or modify current pages

---

## 1. Purpose

This document defines the end-to-end Content Factory pipeline from registered source to published content package. It is reusable across property, agriculture, badminton, trade lead, news, FAQ, and knowledge article websites.

---

## 2. Pipeline Overview

```text
1. Source Registration
2. Collection Planning
3. Collection Execution
4. Raw Evidence Storage
5. Parsing
6. Normalization
7. Knowledge Extraction
8. Entity Recognition
9. Entity Resolution
10. Relationship Mapping
11. Classification
12. Confidence Scoring
13. Duplicate Detection
14. Review Routing
15. Human Review
16. Localization
17. Media Processing
18. Package Assembly
19. Publishing Approval
20. Publication Handoff
21. Monitoring and Refresh
22. Archive or Supersession
```

Each stage writes status, evidence, version, and error records so the pipeline can be audited and resumed.

---

## 3. Stage 1: Source Registration

Source Registration creates or updates approved source records before any collection happens.

Inputs:

- Source URL, file, feed, API, or manual upload channel
- Source owner
- Source type
- Intended websites
- Rights and usage notes
- Allowed collection method
- Refresh policy
- Languages
- Jurisdiction

Outputs:

- Registered source
- Site permission mapping
- Collection policy
- Extraction profile
- Review requirements

Hard gates:

- No unregistered source can be collected.
- No source can be published to a site without source-site permission.
- Restricted sources require compliance review before activation.

---

## 4. Stage 2: Collection Planning

Collection Planning creates jobs from approved sources and site needs.

Planner inputs:

- Source refresh policy
- Site content requirements
- Last collection timestamp
- Change frequency
- Source priority
- Manual reviewer request

Job types:

- Manual upload job
- RSS poll job
- Approved page fetch job
- API pull job
- File import job
- Scheduled refresh job

Outputs:

- Collection job
- Collector config snapshot
- Expected parser profile
- Rate and permission constraints

---

## 5. Stage 3: Collection Execution

Collectors retrieve or receive content according to the approved method.

Collector rules:

- Capture original payload or canonical reference.
- Record timestamps, source IDs, content hashes, and errors.
- Do not infer truth.
- Do not publish.
- Do not bypass source policy.
- Do not collect from sources outside the approved job.

Supported collector families:

- Web page collector
- RSS collector
- PDF collector
- Word collector
- Excel collector
- Image collector
- API collector
- Manual upload collector

Outputs:

- Raw item
- Raw item version
- Collection logs
- Failure records

---

## 6. Stage 4: Raw Evidence Storage

Raw evidence storage preserves source material for traceability.

Stored metadata:

- Source ID
- Job ID
- Canonical URL or file reference
- Content hash
- MIME type
- Detected language
- Source published date
- Source updated date
- Collection timestamp
- Rights snapshot
- Payload URI

Hard gates:

- If a payload cannot be stored or referenced, extraction cannot proceed.
- If rights status is blocked, the item enters quarantine.

---

## 7. Stage 5: Parsing

Parsing converts source payloads into structured intermediate documents.

Parser outputs:

- Plain text
- Structured sections
- Tables
- Metadata
- Document title
- Language detection
- Page, cell, or character references
- Parser confidence

Parser profiles:

- HTML article parser
- HTML product parser
- RSS item parser
- PDF text parser
- PDF layout parser
- Word document parser
- Excel workbook parser
- Image metadata parser
- OCR handoff profile

Error handling:

- Parser failed: route to technical review.
- Low parser confidence: route to intake review.
- Empty content: quarantine unless source is media-only.

---

## 8. Stage 6: Normalization

Normalization converts parsed output into consistent, site-independent fields.

Normalization tasks:

- Trim and clean text
- Remove boilerplate
- Normalize dates
- Normalize units
- Normalize currencies
- Normalize phone, email, address, and URL formats
- Normalize language codes
- Normalize country and jurisdiction codes
- Generate stable slugs
- Split sections and tables into extractable units

Rules:

- Preserve original value alongside normalized value.
- Do not invent missing values.
- Use site-specific formatting only at publishing time.

---

## 9. Stage 7: Knowledge Extraction

Knowledge Extraction creates candidate facts, claims, FAQs, article outlines, entity mentions, media captions, and summaries.

Extraction methods:

- Deterministic rules
- Pattern matchers
- Table mappers
- Named entity recognition
- AI-assisted extraction
- Reviewer-created facts

Candidate output fields:

- Candidate type
- Text or structured value
- Source evidence reference
- Extraction method
- Extraction version
- Confidence score
- Language
- Review status

Extraction must separate:

- Direct source quotes
- Structured facts
- Interpretive summaries
- Editorial notes
- AI-generated drafts

---

## 10. Stage 8: Entity Recognition

Entity Recognition identifies candidate entities from normalized text and structured records.

Recognition signals:

- Names
- Aliases
- URLs
- Government identifiers
- Location fields
- Product codes
- Project names
- Organization names
- Image metadata
- Existing canonical entity matches

Outputs:

- Candidate entity
- Entity mention
- Alias proposal
- Evidence link
- Confidence score

---

## 11. Stage 9: Entity Resolution

Entity Resolution maps candidate entities to canonical entities.

Resolution methods:

- Exact canonical slug match
- Source external ID match
- Official URL match
- Alias match
- Structured identity key
- Geographic proximity
- Embedding similarity
- Reviewer merge decision

Outcomes:

- Attach to existing entity
- Create new canonical entity
- Create alias
- Flag conflict
- Route for review

Hard gates:

- High-impact entities such as government agencies, legal organizations, property projects, and product brands require review before public use unless already trusted.

---

## 12. Stage 10: Relationship Mapping

Relationship Mapping connects entities and content.

Relationship extraction examples:

- Developer develops project
- Government agency publishes regulation
- Brand owns product
- Product belongs to crop category
- Article references location
- FAQ answers topic
- Image depicts project
- Trade lead requests product category

Relationship fields:

- Subject entity
- Relationship type
- Object entity
- Evidence
- Validity period
- Confidence
- Review status

---

## 13. Stage 11: Classification

Classification assigns taxonomy and routing metadata.

Classification dimensions:

- Target site eligibility
- Vertical
- Content type
- Topic
- Intent
- Audience
- Jurisdiction
- Risk level
- Freshness requirement
- Required review level

Methods:

- Source rules
- Taxonomy rules
- AI classifier
- Reviewer correction

---

## 14. Stage 12: Confidence Scoring

Confidence scoring runs on facts, entities, relationships, content items, media, translations, and packages.

Default score components:

- Source authority: 20
- Evidence clarity: 15
- Extraction confidence: 15
- Cross-source agreement: 15
- Recency: 10
- Completeness: 10
- Conflict status: 10
- Reviewer validation: 5

Bands:

- `90-100`: High confidence
- `75-89`: Good confidence
- `60-74`: Review recommended
- `40-59`: Hold for enrichment
- `0-39`: Block or reject risk

Rules:

- Confidence is advisory unless site policy defines a hard threshold.
- Any unresolved critical conflict blocks publication.
- Reviewer approval may raise workflow status, but score history remains auditable.

---

## 15. Stage 13: Duplicate Detection

Duplicate detection runs before review and before publication.

Duplicate scopes:

- Raw item
- Parsed document
- Entity
- Fact
- Relationship
- FAQ
- Article
- Media asset
- Publish package

Detection methods:

- Content hash
- Canonical URL
- External source ID
- Normalized title
- Text similarity
- Structured identity keys
- Entity alias overlap
- Embedding similarity
- Image perceptual hash

Outcomes:

- Exact duplicate: merge or upsert
- Soft duplicate: create duplicate group
- Conflict duplicate: route to review
- False positive: reviewer dismissal saved as training signal

---

## 16. Stage 14: Review Routing

Review Routing converts pipeline signals into review tasks.

Routing inputs:

- Content type
- Source authority
- Confidence score
- Duplicate status
- Risk class
- Missing required fields
- Translation status
- Media rights status
- Site policy

Review task types:

- Intake review
- Fact review
- Entity review
- Relationship review
- Duplicate review
- Language review
- Media rights review
- Legal/compliance review
- Publishing review

---

## 17. Stage 15: Human Review

Reviewers approve, reject, request changes, merge duplicates, resolve conflicts, or quarantine content.

Review outputs:

- Decision
- Reason code
- Comment
- Reviewer ID
- Timestamp
- Updated workflow state
- Version snapshot

No content reaches `publish_ready` without satisfying required review gates.

---

## 18. Stage 16: Localization

Localization prepares content for each target language.

Localization sequence:

1. Detect source language.
2. Apply glossary and protected terms.
3. Match translation memory.
4. Translate missing segments.
5. Validate numbers, names, units, dates, and links.
6. Run locale QA.
7. Route low-confidence or high-risk translations to language review.

Rules:

- Proper nouns remain source-backed.
- Numbers and facts must remain invariant across locales.
- Machine translation drafts are not final until policy gates pass.
- Each website defines required locales.

---

## 19. Stage 17: Media Processing

Media Processing prepares assets for safe use.

Steps:

1. Register asset.
2. Compute content hash and perceptual hash.
3. Extract metadata.
4. Check rights policy.
5. Detect duplicates.
6. Generate derivatives.
7. Produce alt text draft if allowed.
8. Route for media review.
9. Attach to entities or content items.

Hard gates:

- Unknown or blocked rights status prevents publication.
- Unsafe or irrelevant media enters quarantine.
- Duplicate media is linked rather than re-imported.

---

## 20. Stage 18: Package Assembly

Package Assembly creates site-ready output from approved canonical content.

Package types:

- Entity profile package
- Knowledge article package
- FAQ package
- News package
- Product package
- Property package
- Media package
- Taxonomy package
- Site feed package

Package contents:

- Canonical object ID
- Site ID
- Locale payloads
- SEO fields
- Source citations
- Media links
- Taxonomy labels
- Confidence and quality summary
- Package version
- Content hash

---

## 21. Stage 19: Publishing Approval

Publishing Approval verifies final package readiness.

Checks:

- Required review tasks complete
- Required locales complete
- Required media rights approved
- No blocking duplicates
- No unresolved conflicts
- Site policy satisfied
- Freshness within policy
- Package hash generated

Outcomes:

- Approve for publication
- Hold for revision
- Reject
- Archive

---

## 22. Stage 20: Publication Handoff

The Content Factory hands approved packages to website adapters.

Adapter responsibilities:

- Transform package into site-specific content format
- Preserve package ID and version
- Preserve source citations where required
- Report publish success or failure
- Avoid changing canonical factory content

The factory does not prescribe page design.

---

## 23. Stage 21: Monitoring and Refresh

Monitoring tracks freshness, source changes, publication errors, and takedown requests.

Signals:

- Source changed
- Source removed
- Content expired
- Source conflict detected
- Package publish failed
- Reviewer reopened issue
- Takedown request received

Refresh actions:

- Recollect approved source
- Reparse changed content
- Re-score confidence
- Reopen review
- Supersede package
- Archive stale content

---

## 24. Stage 22: Archive or Supersession

Content should not disappear silently.

Archive triggers:

- Source unavailable beyond retention policy
- Content expired
- Entity merged
- Duplicate resolved
- Takedown approved
- Legal hold completed
- Website no longer uses content type

Supersession triggers:

- Newer source version
- Updated official fact
- Reviewer correction
- Translation correction
- Media rights change

---

## 25. Pipeline Observability

Every stage should emit:

- Stage status
- Start and finish timestamps
- Actor or system ID
- Input object IDs
- Output object IDs
- Error code
- Retry count
- Version number
- Confidence and quality changes

Dashboards should show:

- Source health
- Queue backlog
- Parser failures
- Review backlog
- Duplicate groups
- Publish readiness
- Stale content
- Takedown status

---

## 26. Failure Handling

Standard failure states:

- `blocked_by_policy`
- `collection_failed`
- `parse_failed`
- `normalization_failed`
- `low_confidence`
- `duplicate_pending`
- `conflict_pending`
- `review_rejected`
- `translation_failed`
- `media_rights_blocked`
- `publish_failed`

Retries should be idempotent. Reprocessing should create new versions and retain prior audit history.
