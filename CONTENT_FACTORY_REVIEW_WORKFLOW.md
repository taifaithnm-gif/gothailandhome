# Content Factory Review Workflow V1

**Status:** Planning and implementation design only  
**Scope:** Future enterprise content governance workflow  
**Current constraint:** No implementation, deployment, data collection, or current page changes

---

## 1. Purpose

The Review Workflow governs how candidate content becomes approved, localized, publishable, published, refreshed, corrected, rejected, or archived.

The workflow must support many websites, many verticals, mixed source types, AI-assisted extraction, human review, media rights review, and multilingual publication.

---

## 2. Workflow Principles

1. **Evidence before approval:** Reviewers approve claims against evidence, not against generated text alone.
2. **Risk-based routing:** Higher risk content receives stricter review.
3. **Separation of duties:** Fact approval, language approval, media approval, legal approval, and publishing approval can be separate tasks.
4. **Auditable decisions:** Every decision stores reviewer, timestamp, reason, and target version.
5. **No silent overwrite:** Corrections create new versions and may reopen review.
6. **Site policy controls gates:** Each website can require different review levels.
7. **AI assists, humans govern:** AI may propose, score, summarize, and flag, but policy decides where human approval is required.

---

## 3. Standard Workflow States

```text
candidate
intake_review
needs_enrichment
fact_review
entity_review
relationship_review
duplicate_review
media_review
language_review
compliance_review
approved
localization_ready
publish_review
publish_ready
published
refresh_required
superseded
archived
```

Exception states:

```text
rejected
quarantined
blocked
expired
takedown_pending
removed
```

---

## 4. Review Roles

### Intake Reviewer

Checks source registration, collection policy, file quality, parser status, and basic relevance.

### Fact Reviewer

Verifies extracted facts, claims, structured attributes, and source evidence.

### Entity Reviewer

Approves new entities, aliases, merges, and identity resolution.

### Relationship Reviewer

Approves relationships between entities, such as ownership, location, product category, or source verification.

### Duplicate Reviewer

Resolves exact and soft duplicates.

### Media Reviewer

Approves rights, relevance, quality, alt text, caption, and safe publication.

### Language Reviewer

Approves translations, glossary use, localization quality, and language-specific factual consistency.

### Compliance Reviewer

Reviews legal, government, medical, financial, safety, regulated, or rights-sensitive material.

### Publisher

Approves final package readiness and releases content to a website adapter.

### Admin

Manages workflow policy, roles, escalation, and exceptional overrides.

---

## 5. Review Levels

### L0: Blocked

Cannot publish. Used for prohibited source, rights failure, high-risk unresolved conflict, or takedown.

### L1: Draft

Candidate content exists but is incomplete or unreviewed.

### L2: Reviewed

Basic facts, source, and duplicates checked. Suitable for low-risk internal use or low-risk sites if policy allows.

### L3: Approved

Human-reviewed facts, entities, relationships, media, and required locales are approved.

### L4: Compliance Approved

High-risk or regulated content receives legal/compliance approval before publication.

### L5: Publisher Certified

Final package approved for a specific website and channel.

---

## 6. Risk Classes

### Low Risk

Examples:

- General FAQ
- Public product feature list
- Sports article
- Basic company profile from official website

Default review:

- Intake review
- Fact review if confidence below threshold
- Language review for non-default locales

### Medium Risk

Examples:

- Property project facts
- Agriculture product claims
- Market article
- Government program summary
- Trade lead classification

Default review:

- Intake review
- Fact review
- Entity review
- Duplicate review
- Language review
- Media review if media is used

### High Risk

Examples:

- Legal or regulatory interpretation
- Health, safety, chemical, financial, or compliance-sensitive claims
- Government source summaries
- Price, ownership, availability, or official status claims
- Content with copyright or takedown risk

Default review:

- Intake review
- Fact review
- Compliance review
- Language review
- Media rights review
- Publisher certification

---

## 7. Workflow Entry Points

Content can enter review from:

- New collection job
- Manual upload
- Parser failure
- Low confidence extraction
- New entity candidate
- Duplicate group creation
- Source conflict
- Translation draft
- Media rights review
- Refresh job
- Takedown request
- Reviewer correction
- Publisher rejection

---

## 8. Intake Review

Purpose:

- Confirm that the source and item are allowed to enter the factory.

Checklist:

- Source is registered.
- Source type is correct.
- Collection method is allowed.
- Rights policy is known.
- File or page is readable.
- Parser output exists or failure is explainable.
- Item is relevant to at least one site or vertical.
- No obvious prohibited content.

Outcomes:

- Approve intake
- Request enrichment
- Route to parser fix
- Quarantine
- Reject

---

## 9. Fact Review

Purpose:

- Verify candidate facts and claims against evidence.

Checklist:

- Evidence exists.
- Evidence quote or section reference supports the fact.
- Value, unit, date, and language are correct.
- Source authority is appropriate.
- Conflicts are resolved or disclosed.
- Missing values are not invented.
- AI summary does not add unsupported claims.

Outcomes:

- Approve fact
- Edit normalized value
- Mark unknown
- Request more evidence
- Flag conflict
- Reject fact

---

## 10. Entity Review

Purpose:

- Maintain clean canonical entities across all sites.

Checklist:

- Entity type is correct.
- Canonical name is source-backed.
- Slug is stable and site-independent.
- Alias belongs to the entity.
- Entity is not a duplicate.
- Jurisdiction and language are correct.
- Source evidence supports identity.

Outcomes:

- Approve entity
- Merge with existing entity
- Create alias
- Split incorrect merge
- Reject entity
- Request more evidence

---

## 11. Relationship Review

Purpose:

- Verify that relationships between entities are accurate and useful.

Checklist:

- Subject and object entities are correct.
- Relationship type is valid.
- Direction is correct.
- Evidence supports relationship.
- Validity period is known or intentionally blank.
- Relationship does not duplicate existing canonical link.

Outcomes:

- Approve relationship
- Edit relationship type
- Change direction
- Add validity dates
- Merge duplicate relationship
- Reject relationship

---

## 12. Duplicate Review

Purpose:

- Prevent duplicate entities, duplicate articles, duplicate FAQs, duplicate media, and duplicate publish packages.

Checklist:

- Compare exact hashes and canonical URLs.
- Compare aliases and normalized names.
- Compare structured keys.
- Compare text similarity.
- Compare image perceptual hash where relevant.
- Select canonical record.
- Preserve evidence from duplicate members.

Outcomes:

- Confirm duplicate and merge
- Link as related but not duplicate
- Mark false positive
- Keep separate with explanation
- Quarantine suspicious duplicate

---

## 13. Media Review

Purpose:

- Ensure media is safe, relevant, and rights-approved.

Checklist:

- Rights status allows intended use.
- Source and asset owner are recorded.
- Asset is relevant to target entity or content item.
- No prohibited watermark or unsafe content.
- Image quality meets site policy.
- Alt text is accurate and non-fabricated.
- Caption is source-backed or editorially approved.
- Duplicate media is linked instead of reimported.

Outcomes:

- Approve media
- Approve for internal use only
- Request replacement
- Edit caption or alt text
- Quarantine
- Reject

---

## 14. Language Review

Purpose:

- Ensure translations preserve meaning, facts, and site tone.

Checklist:

- Protected terms and official names are preserved.
- Numbers, units, dates, prices, and locations match source language.
- Glossary terms are applied.
- Translation memory conflicts are resolved.
- Locale SEO fields are accurate.
- Content does not add unsupported claims.
- Tone matches site policy.

Outcomes:

- Approve locale
- Request translation edit
- Lock protected term
- Update glossary
- Update translation memory
- Reject locale

---

## 15. Compliance Review

Purpose:

- Handle legal, regulatory, rights, safety, and sensitive content.

Compliance triggers:

- Government or regulatory interpretation
- Legal obligations or policy claims
- Agriculture chemical or safety claims
- Financial, price, investment, ownership, or availability claims
- Health or safety statements
- Copyright risk
- Takedown request
- Jurisdiction conflict

Outcomes:

- Approve compliance
- Require disclaimer
- Restrict to specific site or jurisdiction
- Require source citation
- Quarantine
- Reject

---

## 16. Publishing Review

Purpose:

- Certify that a package is ready for a specific website and channel.

Checklist:

- Required content fields complete.
- Required locales complete.
- Required review levels complete.
- Media rights approved.
- No blocking duplicate groups.
- No unresolved critical conflicts.
- Confidence and quality thresholds satisfied.
- Package version and hash created.
- Site policy satisfied.
- Freshness within policy.

Outcomes:

- Approve publish package
- Hold for revision
- Return to review queue
- Schedule future publish
- Reject package

---

## 17. Escalation Rules

Escalate when:

- Confidence score is below site threshold.
- Source conflict involves official or government source.
- Duplicate group has no clear canonical record.
- Rights status is unknown.
- Translation changes meaning of regulated content.
- Reviewer and AI disagree on a high-risk claim.
- Takedown request is received.
- Publication package fails adapter validation.

Escalation targets:

- Senior editor
- Compliance reviewer
- Legal reviewer
- Site owner
- Admin

---

## 18. Decision Codes

Standard approval codes:

- `approved_source_backed`
- `approved_editorial`
- `approved_with_disclaimer`
- `approved_low_risk`
- `approved_after_merge`

Standard hold codes:

- `needs_source`
- `needs_better_evidence`
- `needs_translation_review`
- `needs_media_rights`
- `needs_duplicate_resolution`
- `needs_compliance`

Standard rejection codes:

- `unsupported_claim`
- `source_not_allowed`
- `rights_blocked`
- `duplicate_rejected`
- `out_of_scope`
- `unsafe_or_prohibited`
- `takedown_approved`

---

## 19. Review SLAs

Default future SLA targets:

- Intake review: 1 business day
- Fact review: 2 business days
- Language review: 2 business days
- Media review: 2 business days
- Duplicate review: 2 business days
- Compliance review: 5 business days
- Publishing review: 1 business day
- Takedown triage: same business day

Each website may define stricter or looser SLAs.

---

## 20. Audit Requirements

Every review decision must store:

- Target object type and ID
- Target version
- Reviewer ID
- Role
- Decision
- Reason code
- Comment
- Timestamp
- Before and after workflow state
- Evidence references viewed or attached

Audit history must remain available after content is archived or superseded.

---

## 21. Reopening Review

Published content returns to review when:

- Source changes materially
- Official source contradicts current content
- Duplicate discovered
- Media rights change
- Translation error reported
- Takedown request received
- Entity merge affects content
- Confidence score drops below threshold
- Site policy changes

Reopened content may remain published, be hidden, or be quarantined depending on risk policy.
