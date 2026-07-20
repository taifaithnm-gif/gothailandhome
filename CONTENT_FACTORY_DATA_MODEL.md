# Content Factory Data Model V1

**Status:** Planning and implementation design only  
**Scope:** Site-independent data contracts for future implementation  
**Current constraint:** Do not modify existing data files, pages, architecture, or database schema

---

## 1. Purpose

This document defines conceptual data objects and contracts for the enterprise Content Factory. The objects are designed to work across real estate, agriculture, badminton, trade leads, news, knowledge, FAQ, media, and future website types.

The model is intentionally independent from any single website.

---

## 2. Object Families

```text
Tenant
Site
Source
Collection Job
Raw Item
Parsed Document
Document Section
Entity
Alias
Fact
Claim
Relationship
Taxonomy
Classification
Content Item
Localization
Media Asset
Review Task
Review Decision
Publish Package
Version
Audit Event
Lifecycle Event
Confidence Score
Duplicate Group
```

---

## 3. Shared Field Conventions

All major objects should support:

```json
{
  "id": "uuid",
  "status": "active",
  "lifecycle_state": "candidate",
  "created_at": "2026-07-17T00:00:00Z",
  "updated_at": "2026-07-17T00:00:00Z",
  "created_by": "system_or_user_id",
  "updated_by": "system_or_user_id",
  "version": 1
}
```

Common status values:

- `draft`
- `active`
- `inactive`
- `blocked`
- `archived`
- `deleted`

Common lifecycle states:

- `registered`
- `collected`
- `parsed`
- `normalized`
- `extracted`
- `reviewed`
- `approved`
- `publish_ready`
- `published`
- `superseded`
- `archived`
- `rejected`
- `quarantined`
- `removed`

---

## 4. Tenant

Represents a business owner or publisher group.

```json
{
  "id": "tenant_001",
  "name": "Example Publishing Group",
  "default_locale": "en",
  "status": "active"
}
```

---

## 5. Site

Represents one website powered by the factory.

```json
{
  "id": "site_001",
  "tenant_id": "tenant_001",
  "site_code": "example_property_site",
  "site_name": "Example Property Site",
  "vertical": "property",
  "primary_domain": "example.com",
  "default_locale": "en",
  "supported_locales": ["en", "zh", "th"],
  "publishing_adapter": "static_package_adapter",
  "status": "active"
}
```

Site policies define source rules, review gates, localization requirements, media rules, and publishing behavior.

---

## 6. Source

Represents an approved or proposed source.

```json
{
  "id": "source_001",
  "tenant_id": "tenant_001",
  "source_code": "official_example_agency",
  "source_name": "Official Example Agency",
  "source_type": "government_website",
  "source_url": "https://example.gov",
  "owner_name": "Example Government Agency",
  "jurisdiction": "TH",
  "default_language": "th",
  "authority_level": "official",
  "rights_policy": "citation_allowed_review_required",
  "collection_policy": {
    "allowed_methods": ["approved_page_fetch", "manual_upload"],
    "requires_human_approval": true,
    "refresh_frequency": "monthly"
  },
  "status": "active"
}
```

Source authority levels:

- `official`
- `government`
- `publisher`
- `partner`
- `community`
- `unknown`

---

## 7. Collection Job

Represents one planned or completed intake run.

```json
{
  "id": "job_001",
  "source_id": "source_001",
  "site_id": "site_001",
  "collector_type": "rss_collector",
  "collection_mode": "scheduled_refresh",
  "status": "completed",
  "started_at": "2026-07-17T00:00:00Z",
  "finished_at": "2026-07-17T00:02:00Z",
  "config_snapshot": {
    "max_items": 50,
    "parser_profile": "news_article"
  }
}
```

---

## 8. Raw Item

Represents immutable collected evidence.

```json
{
  "id": "raw_001",
  "collection_job_id": "job_001",
  "source_id": "source_001",
  "source_external_id": "external-123",
  "canonical_url": "https://example.gov/news/item",
  "content_hash": "sha256:...",
  "payload_uri": "raw/source_001/raw_001.html",
  "mime_type": "text/html",
  "detected_language": "th",
  "collected_at": "2026-07-17T00:00:00Z",
  "source_published_at": "2026-07-16T00:00:00Z",
  "rights_snapshot": {
    "policy": "citation_allowed_review_required",
    "captured_at": "2026-07-17T00:00:00Z"
  },
  "status": "collected"
}
```

---

## 9. Parsed Document

Represents parser output from a raw item.

```json
{
  "id": "doc_001",
  "raw_item_id": "raw_001",
  "parser_type": "html_article_parser",
  "parser_version": "1.0.0",
  "title": "Example Source Title",
  "plain_text": "Extracted text...",
  "structured_content": {
    "headings": [],
    "links": [],
    "tables": []
  },
  "language": "th",
  "parse_confidence": 0.92,
  "parse_status": "parsed"
}
```

---

## 10. Document Section

Represents a citeable section within a document.

```json
{
  "id": "section_001",
  "parsed_document_id": "doc_001",
  "section_index": 1,
  "heading": "Eligibility",
  "body_text": "Section text...",
  "page_number": null,
  "cell_range": null,
  "char_start": 120,
  "char_end": 540,
  "section_hash": "sha256:..."
}
```

---

## 11. Entity

Represents a canonical thing used across websites.

```json
{
  "id": "entity_001",
  "entity_type": "organization",
  "canonical_name": "Example Development Co., Ltd.",
  "canonical_slug": "example-development",
  "primary_language": "en",
  "country_code": "TH",
  "jurisdiction": "TH",
  "status": "active",
  "review_status": "approved"
}
```

Entity types:

- `organization`
- `brand`
- `website`
- `person`
- `product`
- `project`
- `property`
- `location`
- `government_agency`
- `regulation`
- `document`
- `article`
- `faq_topic`
- `sport_event`
- `trade_lead`
- `media_asset`

---

## 12. Alias

Represents a name variant for an entity.

```json
{
  "id": "alias_001",
  "entity_id": "entity_001",
  "alias_text": "Example Dev",
  "language": "en",
  "alias_type": "short_name",
  "source_id": "source_001",
  "confidence_score": 0.88,
  "review_status": "approved"
}
```

Alias types:

- `official_name`
- `legal_name`
- `short_name`
- `local_language_name`
- `translated_name`
- `former_name`
- `misspelling`
- `source_specific_name`

---

## 13. Fact

Represents a source-backed structured value.

```json
{
  "id": "fact_001",
  "entity_id": "entity_001",
  "fact_type": "profile",
  "fact_key": "founded_year",
  "fact_value": 1999,
  "value_type": "integer",
  "unit": null,
  "language": null,
  "valid_from": null,
  "valid_to": null,
  "confidence_score": 0.95,
  "review_status": "approved",
  "evidence": [
    {
      "source_id": "source_001",
      "raw_item_id": "raw_001",
      "document_section_id": "section_001",
      "evidence_quote": "Founded in 1999..."
    }
  ]
}
```

Fact value types:

- `string`
- `localized_text`
- `integer`
- `decimal`
- `boolean`
- `date`
- `datetime`
- `url`
- `json`
- `enum`

---

## 14. Claim

Represents a statement that may be interpretive, time-bound, or review-sensitive.

```json
{
  "id": "claim_001",
  "entity_id": "entity_001",
  "claim_text": "Example organization is a leading provider in its market.",
  "claim_type": "marketing_claim",
  "language": "en",
  "support_level": "source_claimed",
  "confidence_score": 0.62,
  "review_status": "needs_review",
  "evidence": []
}
```

Support levels:

- `directly_verified`
- `source_claimed`
- `cross_source_supported`
- `editorial_interpretation`
- `unsupported`

---

## 15. Relationship

Represents a directional link between entities.

```json
{
  "id": "rel_001",
  "subject_entity_id": "entity_developer",
  "relationship_type": "develops",
  "object_entity_id": "entity_project",
  "direction": "subject_to_object",
  "valid_from": null,
  "valid_to": null,
  "confidence_score": 0.94,
  "review_status": "approved",
  "evidence": [
    {
      "source_id": "source_001",
      "document_section_id": "section_001"
    }
  ]
}
```

---

## 16. Taxonomy and Classification

Taxonomy term:

```json
{
  "id": "term_001",
  "taxonomy_code": "content_type",
  "term_code": "faq",
  "label": {
    "en": "FAQ",
    "zh": "常见问题",
    "th": "คำถามที่พบบ่อย"
  },
  "parent_term_id": null,
  "status": "active"
}
```

Classification:

```json
{
  "id": "class_001",
  "target_type": "content_item",
  "target_id": "content_001",
  "taxonomy_term_id": "term_001",
  "classification_method": "rule",
  "confidence_score": 0.98,
  "review_status": "approved"
}
```

---

## 17. Content Item

Represents an editorial object assembled from facts, claims, entities, relationships, and media.

```json
{
  "id": "content_001",
  "tenant_id": "tenant_001",
  "content_type": "knowledge_article",
  "canonical_title": "Example Knowledge Article",
  "canonical_slug": "example-knowledge-article",
  "primary_entity_id": "entity_001",
  "summary": "Canonical summary before localization.",
  "body_structured": {
    "blocks": [
      {
        "type": "paragraph",
        "text": "Source-backed paragraph.",
        "evidence_ids": ["section_001"]
      }
    ]
  },
  "source_ids": ["source_001"],
  "confidence_score": 0.84,
  "quality_score": 88,
  "review_status": "approved",
  "lifecycle_state": "approved"
}
```

Content types:

- `knowledge_article`
- `faq`
- `news`
- `entity_profile`
- `product_profile`
- `property_profile`
- `regulation_summary`
- `market_insight`
- `media_gallery`
- `trade_lead`

---

## 18. FAQ Item

FAQ can be represented as a content item with structured body.

```json
{
  "content_type": "faq",
  "canonical_title": "Can foreign buyers own property?",
  "body_structured": {
    "question": {
      "en": "Can foreign buyers own property?"
    },
    "answer": {
      "en": "Answer must be source-backed or approved editorial guidance."
    },
    "topic_entity_id": "entity_topic_001",
    "evidence_ids": ["section_001"]
  },
  "risk_class": "high",
  "review_status": "compliance_review"
}
```

---

## 19. Localization

Represents localized fields for a target object.

```json
{
  "id": "loc_001",
  "target_type": "content_item",
  "target_id": "content_001",
  "locale": "zh",
  "field_name": "title",
  "localized_value": "示例知识文章",
  "translation_method": "translation_memory_ai_assist",
  "glossary_version_id": "glossary_v1",
  "quality_score": 91,
  "review_status": "approved"
}
```

Translation methods:

- `source_language`
- `human_translation`
- `translation_memory`
- `ai_assist`
- `ai_assist_human_reviewed`
- `glossary_only`

---

## 20. Media Asset

Represents images and future media assets.

```json
{
  "id": "media_001",
  "source_id": "source_001",
  "raw_item_id": "raw_001",
  "asset_type": "image",
  "file_uri": "media/original/media_001.jpg",
  "original_url": "https://example.com/image.jpg",
  "content_hash": "sha256:...",
  "perceptual_hash": "phash:...",
  "mime_type": "image/jpeg",
  "width": 1600,
  "height": 900,
  "rights_status": "approved_for_site_use",
  "license_summary": "Official source image, approved by policy.",
  "alt_text": {
    "en": "Exterior view of example project."
  },
  "review_status": "approved"
}
```

Rights statuses:

- `unknown`
- `internal_only`
- `approved_for_site_use`
- `approved_with_attribution`
- `blocked`
- `takedown_pending`
- `removed`

---

## 21. Review Task

Represents work assigned to a reviewer.

```json
{
  "id": "task_001",
  "target_type": "content_item",
  "target_id": "content_001",
  "review_type": "fact_review",
  "priority": "medium",
  "assigned_to": "reviewer_001",
  "status": "open",
  "due_at": "2026-07-19T00:00:00Z"
}
```

---

## 22. Review Decision

Represents an immutable review decision.

```json
{
  "id": "decision_001",
  "review_task_id": "task_001",
  "decision": "approved",
  "reason_code": "approved_source_backed",
  "comment": "All facts verified against official source section.",
  "reviewer_id": "reviewer_001",
  "target_version": 3,
  "decided_at": "2026-07-17T00:00:00Z"
}
```

---

## 23. Publish Package

Represents versioned output for a website adapter.

```json
{
  "id": "package_001",
  "site_id": "site_001",
  "content_item_id": "content_001",
  "package_type": "knowledge_article",
  "package_version": 1,
  "package_payload": {
    "slug": "example-knowledge-article",
    "locales": {
      "en": {
        "title": "Example Knowledge Article",
        "summary": "Example summary."
      }
    },
    "citations": [
      {
        "source_name": "Official Example Agency",
        "url": "https://example.gov/news/item"
      }
    ]
  },
  "content_hash": "sha256:...",
  "status": "publish_ready"
}
```

---

## 24. Confidence Score

Represents explainable scoring for a target object.

```json
{
  "id": "score_001",
  "target_type": "fact",
  "target_id": "fact_001",
  "score": 92,
  "score_band": "high",
  "score_breakdown": {
    "source_authority": 20,
    "evidence_clarity": 14,
    "extraction_confidence": 14,
    "cross_source_agreement": 12,
    "recency": 10,
    "completeness": 9,
    "conflict_status": 10,
    "reviewer_validation": 3
  },
  "scoring_version": "1.0.0",
  "scored_at": "2026-07-17T00:00:00Z"
}
```

---

## 25. Duplicate Group

Represents exact or likely duplicates.

```json
{
  "id": "dup_001",
  "duplicate_type": "entity",
  "canonical_target_type": "entity",
  "canonical_target_id": "entity_001",
  "status": "pending_review",
  "members": [
    {
      "target_type": "entity",
      "target_id": "entity_001",
      "match_method": "canonical_url",
      "match_score": 1.0,
      "resolution_status": "canonical"
    },
    {
      "target_type": "entity",
      "target_id": "entity_002",
      "match_method": "alias_similarity",
      "match_score": 0.91,
      "resolution_status": "pending"
    }
  ]
}
```

---

## 26. Version

Represents immutable object history.

```json
{
  "id": "version_001",
  "object_type": "content_item",
  "object_id": "content_001",
  "version_number": 3,
  "change_type": "review_edit",
  "changed_by": "reviewer_001",
  "change_summary": "Corrected source-backed date.",
  "object_snapshot": {},
  "created_at": "2026-07-17T00:00:00Z"
}
```

---

## 27. Audit Event

Represents operational or security events.

```json
{
  "id": "audit_001",
  "actor_id": "reviewer_001",
  "actor_type": "user",
  "event_type": "review_decision_created",
  "object_type": "review_decision",
  "object_id": "decision_001",
  "event_payload": {
    "decision": "approved"
  },
  "created_at": "2026-07-17T00:00:00Z"
}
```

---

## 28. Lifecycle Event

Represents state movement.

```json
{
  "id": "life_001",
  "target_type": "content_item",
  "target_id": "content_001",
  "from_state": "approved",
  "to_state": "publish_ready",
  "reason_code": "publishing_checks_passed",
  "actor_id": "publisher_001",
  "created_at": "2026-07-17T00:00:00Z"
}
```

---

## 29. Cross-Website Reuse Pattern

A single canonical entity can support many sites:

```json
{
  "entity_id": "entity_product_001",
  "canonical_name": "Example Irrigation Product",
  "usable_by_sites": [
    "tai_faith_agriculture",
    "trade_lead_future"
  ],
  "site_overlays": {
    "tai_faith_agriculture": {
      "required_locales": ["en", "zh", "th"],
      "review_level": "L3"
    },
    "trade_lead_future": {
      "required_locales": ["en"],
      "review_level": "L2"
    }
  }
}
```

Core facts remain shared; site overlays control presentation, review requirements, localization, and publishing.

---

## 30. Model Boundaries

The data model does not define:

- Website page components
- Current production table migrations
- UI layout
- Scraping behavior
- Deployment topology
- Final storage engine

Those decisions require later implementation review.
