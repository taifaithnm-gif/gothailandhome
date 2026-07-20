# Content Factory Database Design V1

**Status:** Planning and implementation design only  
**Scope:** Logical future database model for an enterprise Content Factory  
**Current constraint:** Do not change the current production or Alpha RC database schema

---

## 1. Purpose

This document defines the future logical database model for the Content Factory. It is not a migration script and must not be applied during Alpha RC feature freeze.

The database design supports 100+ websites, multiple verticals, multiple languages, source provenance, review governance, versioning, confidence scoring, duplicate detection, and publishing.

---

## 2. Design Rules

1. **Site-independent core:** Sources, entities, facts, media, and reviews live in shared core tables.
2. **Site-specific overlays:** Website behavior is configured through site, taxonomy, publishing, and localization tables.
3. **Provenance everywhere:** Claims, facts, relationships, and media assets reference source evidence.
4. **Append-only history:** Material revisions create new versions rather than overwriting history silently.
5. **Workflow state is explicit:** Review and publication state are queryable and auditable.
6. **Flexible but governed:** JSON fields may hold parser-specific details, but canonical fields must exist for routing, confidence, lifecycle, and ownership.

---

## 3. Logical Domains

```text
Tenant and Site Configuration
Source Registry
Collection and Raw Evidence
Parsed Documents
Entities and Aliases
Facts and Claims
Relationships
Classification and Taxonomy
Content Items
Localization
Media Assets
Review Workflow
Publishing
Versioning and Audit
Confidence and Quality
Duplicate Detection
Lifecycle and Retention
```

---

## 4. Tenant and Site Configuration

### `content_factory_tenants`

Represents an operating company, business unit, or publisher group.

Key fields:

- `id`
- `name`
- `status`
- `default_locale`
- `created_at`
- `updated_at`

### `content_factory_sites`

Represents each website powered by the factory.

Key fields:

- `id`
- `tenant_id`
- `site_code`
- `site_name`
- `primary_domain`
- `vertical`
- `default_locale`
- `supported_locales`
- `status`
- `publishing_adapter`
- `created_at`
- `updated_at`

Examples of future `site_code` values:

- `go_thailand_home`
- `tai_faith_agriculture`
- `malaysia_property_network`
- `badminton_future`
- `trade_lead_future`

### `content_factory_site_policies`

Configures site-specific rules without changing core pipeline code.

Key fields:

- `id`
- `site_id`
- `policy_type`
- `policy_key`
- `policy_value`
- `effective_from`
- `effective_to`
- `status`

Policy types:

- `source_allowance`
- `locale_requirement`
- `review_gate`
- `freshness`
- `media_rights`
- `publishing`
- `brand_voice`
- `legal_disclaimer`

---

## 5. Source Registry

### `cf_sources`

Master table for all approved or proposed sources.

Key fields:

- `id`
- `tenant_id`
- `source_code`
- `source_name`
- `source_type`
- `source_url`
- `owner_name`
- `jurisdiction`
- `default_language`
- `authority_level`
- `rights_policy`
- `collection_policy`
- `refresh_policy`
- `status`
- `notes`
- `created_at`
- `updated_at`

Source types:

- `official_website`
- `developer_website`
- `government_website`
- `rss`
- `pdf`
- `word`
- `excel`
- `image`
- `news`
- `knowledge_article`
- `faq`
- `manual_upload`
- `api`

### `cf_source_site_permissions`

Maps sources to websites that may use them.

Key fields:

- `id`
- `source_id`
- `site_id`
- `allowed_for_collection`
- `allowed_for_publication`
- `allowed_content_types`
- `required_review_level`
- `restriction_notes`

### `cf_source_credentials`

Future secure reference table for approved API or private source access. Store only secret references, never raw secrets.

Key fields:

- `id`
- `source_id`
- `credential_ref`
- `credential_type`
- `status`
- `rotated_at`

---

## 6. Collection and Raw Evidence

### `cf_collection_jobs`

Tracks planned and executed collection runs.

Key fields:

- `id`
- `source_id`
- `site_id`
- `collector_type`
- `collection_mode`
- `requested_by`
- `started_at`
- `finished_at`
- `status`
- `error_summary`
- `config_snapshot`

Collection modes:

- `manual_upload`
- `scheduled_refresh`
- `approved_page_fetch`
- `rss_poll`
- `api_pull`
- `file_import`

### `cf_raw_items`

Stores source payload references and immutable evidence metadata.

Key fields:

- `id`
- `collection_job_id`
- `source_id`
- `source_external_id`
- `canonical_url`
- `content_hash`
- `payload_uri`
- `mime_type`
- `detected_language`
- `collected_at`
- `source_published_at`
- `source_updated_at`
- `rights_snapshot`
- `status`

### `cf_raw_item_versions`

Tracks changes to raw items over time.

Key fields:

- `id`
- `raw_item_id`
- `version_number`
- `content_hash`
- `payload_uri`
- `diff_summary`
- `captured_at`

---

## 7. Parsed Documents

### `cf_parsed_documents`

Stores parser output for each raw item.

Key fields:

- `id`
- `raw_item_id`
- `parser_type`
- `parser_version`
- `title`
- `plain_text`
- `structured_content`
- `tables_json`
- `layout_json`
- `language`
- `parse_confidence`
- `parse_status`
- `parsed_at`

### `cf_document_sections`

Stores reusable sections for extraction and citation.

Key fields:

- `id`
- `parsed_document_id`
- `section_index`
- `heading`
- `body_text`
- `page_number`
- `cell_range`
- `char_start`
- `char_end`
- `section_hash`

---

## 8. Entities and Aliases

### `cf_entities`

Canonical cross-site entity registry.

Key fields:

- `id`
- `entity_type`
- `canonical_name`
- `canonical_slug`
- `primary_language`
- `country_code`
- `jurisdiction`
- `status`
- `created_from_evidence_id`
- `created_at`
- `updated_at`

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

### `cf_entity_aliases`

Maps names, spellings, translations, abbreviations, and source-specific labels to canonical entities.

Key fields:

- `id`
- `entity_id`
- `alias_text`
- `language`
- `alias_type`
- `source_id`
- `confidence_score`
- `status`

### `cf_entity_evidence`

Links entities to supporting document sections or raw items.

Key fields:

- `id`
- `entity_id`
- `raw_item_id`
- `document_section_id`
- `evidence_type`
- `confidence_score`
- `created_at`

---

## 9. Facts and Claims

### `cf_facts`

Canonical factual statements extracted or reviewed from sources.

Key fields:

- `id`
- `entity_id`
- `fact_type`
- `fact_key`
- `fact_value`
- `value_type`
- `unit`
- `language`
- `valid_from`
- `valid_to`
- `confidence_score`
- `review_status`
- `lifecycle_state`
- `created_at`
- `updated_at`

### `cf_fact_evidence`

Maps facts to evidence.

Key fields:

- `id`
- `fact_id`
- `raw_item_id`
- `document_section_id`
- `source_id`
- `evidence_quote`
- `evidence_url`
- `evidence_hash`
- `evidence_weight`

### `cf_claim_conflicts`

Tracks conflicting facts from different sources or versions.

Key fields:

- `id`
- `entity_id`
- `fact_key`
- `conflict_summary`
- `candidate_fact_ids`
- `resolution_status`
- `resolved_fact_id`
- `resolved_by`
- `resolved_at`

---

## 10. Relationships

### `cf_relationships`

Links entities to other entities.

Key fields:

- `id`
- `subject_entity_id`
- `relationship_type`
- `object_entity_id`
- `direction`
- `valid_from`
- `valid_to`
- `confidence_score`
- `review_status`
- `lifecycle_state`

Relationship types:

- `owns`
- `develops`
- `located_in`
- `belongs_to_category`
- `references`
- `answers_topic`
- `depicts`
- `verifies`
- `supersedes`
- `competes_with`
- `requests`
- `supplies`

### `cf_relationship_evidence`

Maps relationships to supporting evidence.

Key fields:

- `id`
- `relationship_id`
- `raw_item_id`
- `document_section_id`
- `source_id`
- `evidence_quote`

---

## 11. Classification and Taxonomy

### `cf_taxonomies`

Defines reusable taxonomy sets.

Key fields:

- `id`
- `tenant_id`
- `taxonomy_code`
- `name`
- `scope`
- `status`

### `cf_taxonomy_terms`

Stores categories, topics, intents, audiences, and vertical terms.

Key fields:

- `id`
- `taxonomy_id`
- `parent_term_id`
- `term_code`
- `label`
- `language`
- `sort_order`
- `status`

### `cf_classifications`

Assigns taxonomy terms to entities, facts, relationships, or content items.

Key fields:

- `id`
- `target_type`
- `target_id`
- `taxonomy_term_id`
- `classification_method`
- `confidence_score`
- `review_status`

---

## 12. Content Items

### `cf_content_items`

Canonical editorial objects assembled from facts, entities, and source material.

Key fields:

- `id`
- `tenant_id`
- `content_type`
- `canonical_title`
- `canonical_slug`
- `primary_entity_id`
- `summary`
- `body_structured`
- `status`
- `lifecycle_state`
- `confidence_score`
- `quality_score`
- `created_at`
- `updated_at`

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

### `cf_content_item_sources`

Maps content items to sources and evidence.

Key fields:

- `id`
- `content_item_id`
- `source_id`
- `raw_item_id`
- `document_section_id`
- `usage_type`

---

## 13. Localization

### `cf_localizations`

Stores localized fields for content, entities, facts, taxonomy terms, and media metadata.

Key fields:

- `id`
- `target_type`
- `target_id`
- `locale`
- `field_name`
- `localized_value`
- `translation_method`
- `translation_memory_match_id`
- `glossary_version_id`
- `review_status`
- `quality_score`
- `updated_at`

### `cf_glossary_terms`

Shared controlled vocabulary.

Key fields:

- `id`
- `tenant_id`
- `term_key`
- `source_locale`
- `source_text`
- `target_locale`
- `target_text`
- `domain`
- `status`

### `cf_translation_memory`

Stores approved translation segments.

Key fields:

- `id`
- `source_locale`
- `target_locale`
- `source_hash`
- `source_text`
- `target_text`
- `domain`
- `approved_by`
- `approved_at`

---

## 14. Media Assets

### `cf_media_assets`

Stores canonical media records.

Key fields:

- `id`
- `source_id`
- `raw_item_id`
- `asset_type`
- `file_uri`
- `original_url`
- `content_hash`
- `perceptual_hash`
- `mime_type`
- `width`
- `height`
- `duration_seconds`
- `rights_status`
- `license_summary`
- `alt_text_status`
- `review_status`
- `lifecycle_state`

### `cf_media_derivatives`

Stores generated renditions.

Key fields:

- `id`
- `media_asset_id`
- `derivative_type`
- `file_uri`
- `width`
- `height`
- `format`
- `quality`
- `created_at`

### `cf_media_links`

Associates media assets with entities, content items, or facts.

Key fields:

- `id`
- `media_asset_id`
- `target_type`
- `target_id`
- `usage_role`
- `sort_order`
- `caption`
- `review_status`

---

## 15. Review Workflow

### `cf_review_tasks`

Work queue for human review.

Key fields:

- `id`
- `target_type`
- `target_id`
- `review_type`
- `priority`
- `assigned_to`
- `status`
- `due_at`
- `created_at`
- `completed_at`

### `cf_review_decisions`

Immutable review decision log.

Key fields:

- `id`
- `review_task_id`
- `decision`
- `reason_code`
- `comment`
- `reviewer_id`
- `decided_at`

### `cf_review_checklists`

Reusable checklist definitions.

Key fields:

- `id`
- `site_id`
- `content_type`
- `review_type`
- `checklist_json`
- `status`

---

## 16. Publishing

### `cf_publication_channels`

Defines destinations such as websites, feeds, or future APIs.

Key fields:

- `id`
- `site_id`
- `channel_type`
- `channel_code`
- `adapter_config`
- `status`

### `cf_publish_packages`

Versioned output prepared for website adapters.

Key fields:

- `id`
- `site_id`
- `content_item_id`
- `package_type`
- `package_version`
- `package_payload`
- `content_hash`
- `status`
- `created_at`
- `published_at`

### `cf_publish_events`

Audit trail for publication.

Key fields:

- `id`
- `publish_package_id`
- `event_type`
- `actor_id`
- `event_at`
- `event_payload`

---

## 17. Versioning and Audit

### `cf_object_versions`

Generic immutable version history for core objects.

Key fields:

- `id`
- `object_type`
- `object_id`
- `version_number`
- `change_type`
- `changed_by`
- `change_summary`
- `object_snapshot`
- `created_at`

### `cf_audit_events`

Security and operational audit log.

Key fields:

- `id`
- `actor_id`
- `actor_type`
- `event_type`
- `object_type`
- `object_id`
- `event_payload`
- `created_at`

---

## 18. Confidence, Quality, and Duplicates

### `cf_confidence_scores`

Stores explainable confidence calculations.

Key fields:

- `id`
- `target_type`
- `target_id`
- `score`
- `score_band`
- `score_breakdown`
- `scoring_version`
- `scored_at`

### `cf_quality_scores`

Stores publishability quality scores.

Key fields:

- `id`
- `target_type`
- `target_id`
- `score`
- `score_breakdown`
- `gate_failures`
- `scoring_version`
- `scored_at`

### `cf_duplicate_groups`

Represents groups of likely duplicate objects.

Key fields:

- `id`
- `duplicate_type`
- `canonical_target_type`
- `canonical_target_id`
- `status`
- `created_at`

### `cf_duplicate_members`

Members of duplicate groups.

Key fields:

- `id`
- `duplicate_group_id`
- `target_type`
- `target_id`
- `match_method`
- `match_score`
- `resolution_status`

---

## 19. Lifecycle and Retention

### `cf_lifecycle_events`

Tracks state changes.

Key fields:

- `id`
- `target_type`
- `target_id`
- `from_state`
- `to_state`
- `reason_code`
- `actor_id`
- `created_at`

### `cf_retention_policies`

Defines archival and deletion policy by source, site, jurisdiction, or content type.

Key fields:

- `id`
- `scope_type`
- `scope_id`
- `retention_rule`
- `archive_after_days`
- `delete_after_days`
- `legal_hold_allowed`
- `status`

---

## 20. Recommended Indexes

Future implementation should prioritize indexes for:

- `site_code`
- `source_code`
- `source_type`
- `canonical_url`
- `content_hash`
- `perceptual_hash`
- `entity_type + canonical_slug`
- `alias_text + language`
- `fact_key + entity_id`
- `relationship_type + subject_entity_id + object_entity_id`
- `target_type + target_id`
- `review_status`
- `lifecycle_state`
- `package_version`

---

## 21. Migration Position

This is a future logical design. Any implementation must begin with a separate migration proposal, impact assessment, rollback plan, and review approval. Nothing in this document authorizes schema changes during Alpha RC feature freeze.
