# Content Factory Architecture V1

**Status:** Planning and implementation design only  
**Phase:** Alpha RC / Feature Freeze  
**Scope:** Enterprise AI Content Factory architecture for 100+ future websites  
**Out of scope:** UI redesign, existing page changes, database migration, deployment, crawling, data collection

---

## 1. Purpose

The Content Factory is a reusable enterprise content system for collecting approved source material, normalizing it into site-independent knowledge objects, extracting facts and relationships, routing evidence through review, and publishing approved content packages to many websites.

The design must later support:

- GoThailandHome
- TAI FAITH Agriculture
- Malaysia Property Network
- Future Badminton Website
- Future Trade Lead Platform
- Additional future properties without redesigning the pipeline

This document defines the top-level architecture. Supporting documents define the logical database, pipeline, review workflow, data model, and implementation plan.

---

## 2. Core Principles

1. **Reusable by default:** No source, entity, field, workflow, or pipeline stage is hard-coded to one website.
2. **Source-first:** Content starts from registered sources and carries provenance through every transformation.
3. **Human-governed:** AI may assist extraction, classification, translation, summarization, and deduplication, but approval remains workflow-controlled.
4. **No fabrication:** Missing facts remain unknown. Confidence scoring cannot convert unknown facts into publishable facts.
5. **Multi-tenant, multi-site:** One factory can serve many brands, domains, markets, languages, and verticals.
6. **Evidence-preserving:** Every published claim should trace to one or more source records, reviewer actions, or approved editorial overrides.
7. **Composable publishing:** The factory produces approved content packages; websites decide how to render them.
8. **Lifecycle-aware:** Content has freshness, expiry, supersession, archival, takedown, and version history.

---

## 3. System Boundaries

### Included

- Source registry
- Source permissions and collection policy
- Collector architecture
- Document and media intake
- Normalization pipeline
- Knowledge extraction
- Entity recognition
- Relationship mapping
- Classification
- Review workflow
- Publishing workflow
- Multi-language pipeline
- Media pipeline
- Version control
- Confidence scoring
- Duplicate detection
- Content lifecycle management

### Excluded From This Phase

- Building collectors
- Running scrapers or crawlers
- Collecting new data
- Modifying current pages
- Modifying current database schema
- Deploying services
- Committing or pushing changes

---

## 4. High-Level Architecture

```text
Source Registry
  -> Collection Jobs
  -> Raw Source Store
  -> Document Parser Layer
  -> Normalization Pipeline
  -> Knowledge Extraction
  -> Entity Recognition
  -> Relationship Mapping
  -> Classification
  -> Quality, Confidence, Duplicate Checks
  -> Review Workflow
  -> Translation and Localization
  -> Media Processing
  -> Versioned Content Packages
  -> Publishing Workflow
  -> Website Adapters
```

The architecture separates raw evidence, normalized facts, reviewed knowledge, and site-specific publication output.

---

## 5. Major Components

### 5.1 Source Registry

The Source Registry is the master inventory of approved sources. A source is anything the factory may ingest or reference.

Supported source classes:

- Official websites
- Developer websites
- Government websites
- RSS feeds
- PDF files
- Word documents
- Excel spreadsheets
- Images
- News sources
- Knowledge articles
- FAQ pages
- Manual editorial uploads

Each source defines ownership, source type, allowed collection method, language, jurisdiction, refresh policy, rights policy, extraction profile, and publication restrictions.

### 5.2 Collector Layer

Collectors retrieve or receive content from registered sources only.

Collector families:

- Web page collector for explicitly approved pages and sitemaps
- RSS collector for feed entries
- File collector for PDF, Word, Excel, image, CSV, and structured uploads
- API collector for future official APIs
- Manual upload collector for editorial intake
- Email or mailbox collector for future approved inbound documents

Collectors do not decide truth. They capture source material, metadata, timestamps, hashes, and collection logs.

### 5.3 Raw Source Store

The Raw Source Store preserves source payloads and metadata before transformation.

Stored items:

- Original content payload or canonical reference
- Source ID and collection job ID
- Retrieval timestamp
- Content hash
- File metadata
- MIME type
- Language hints
- Rights flags
- Parser status
- Error logs

### 5.4 Parsing and Normalization

The parser layer converts raw payloads into normalized intermediate records.

Parser responsibilities:

- HTML text extraction
- RSS item extraction
- PDF text and layout extraction
- Word text extraction
- Excel sheet and table extraction
- Image metadata and OCR handoff
- File hash calculation
- Language detection
- Boilerplate removal
- Section segmentation

Normalization converts parser output into consistent fields, units, dates, currencies, names, geographies, and references.

### 5.5 Knowledge Extraction

Knowledge Extraction converts normalized records into candidate knowledge units.

Knowledge unit examples:

- Fact
- Claim
- Definition
- FAQ pair
- News event
- Product attribute
- Property attribute
- Organization profile
- Person profile
- Location profile
- Regulation summary
- Market insight
- Media asset

Each candidate includes evidence references, extraction method, model or rule version, confidence score, and review status.

### 5.6 Entity Recognition

Entity Recognition identifies reusable entities across sites and verticals.

Core entity families:

- Organization
- Brand
- Website
- Person
- Product
- Project
- Property
- Location
- Government agency
- Regulation
- Document
- Article
- FAQ topic
- Sport event
- Trade lead
- Media asset

Entity Recognition produces candidate entities and aliases. Entity resolution decides whether a candidate maps to an existing entity or creates a new canonical entity.

### 5.7 Relationship Mapping

Relationship Mapping links entities, facts, documents, and content items.

Relationship examples:

- Organization owns brand
- Developer develops project
- Project located in district
- Product belongs to category
- Regulation applies to jurisdiction
- Article references organization
- FAQ answers topic
- Image depicts product or location
- Government source verifies claim
- Trade lead requests product

Relationships carry direction, evidence, confidence, validity period, and review status.

### 5.8 Content Classification

Classification assigns each knowledge object to reusable categories.

Classification dimensions:

- Website target eligibility
- Vertical
- Entity type
- Content type
- Topic taxonomy
- Intent
- Audience
- Language
- Jurisdiction
- Freshness requirement
- Risk class
- Review priority
- Publishability

### 5.9 Review Workflow

Review Workflow controls approval, rejection, escalation, and publication readiness.

Reviewer roles:

- Intake reviewer
- Fact reviewer
- Language reviewer
- Media reviewer
- Legal/compliance reviewer
- Publisher
- Admin

Workflow is covered in `CONTENT_FACTORY_REVIEW_WORKFLOW.md`.

### 5.10 Publishing Workflow

Publishing creates versioned content packages for websites. The factory does not require websites to share UI or page architecture.

Publishing output types:

- Knowledge article package
- FAQ package
- Entity profile package
- News package
- Product package
- Property package
- Media package
- Glossary package
- Taxonomy package
- Site feed package

Each website consumes approved packages through its own adapter.

### 5.11 Multi-Language Pipeline

The Multi-Language Pipeline manages source language, translation memory, glossary terms, localized drafts, locale review, and publication parity.

Core languages should be configurable per website. The factory must not assume only EN, ZH, and TH.

### 5.12 Media Pipeline

The Media Pipeline handles images and future media types through rights-aware intake, fingerprinting, metadata extraction, derivative generation, alt text assistance, review, and publication.

### 5.13 Version Control

All material changes produce immutable versions.

Versioned objects:

- Source records
- Parsed documents
- Extracted facts
- Entities
- Relationships
- Content items
- Translations
- Media assets
- Review decisions
- Published packages

### 5.14 Confidence Score

Confidence scoring estimates reliability of candidate content. It does not replace approval.

Signal groups:

- Source authority
- Evidence quality
- Extraction certainty
- Cross-source agreement
- Recency
- Completeness
- Conflict status
- Reviewer validation
- Duplicate risk
- Media rights confidence

### 5.15 Duplicate Detection

Duplicate detection runs across raw payloads, files, entities, facts, articles, FAQs, media, and published packages.

Methods:

- Exact hash match
- Canonical URL match
- Source external ID match
- Normalized title and text similarity
- Entity alias match
- Structured key match
- Embedding similarity
- Image perceptual hash
- Relationship overlap

### 5.16 Content Lifecycle

Lifecycle states govern every content item from intake to archival.

Standard lifecycle:

```text
registered -> collected -> parsed -> normalized -> extracted -> reviewed -> approved -> localized -> publish_ready -> published -> refreshed -> superseded -> archived
```

Exception states:

```text
blocked -> rejected -> quarantined -> takedown_pending -> removed -> expired
```

---

## 6. Multi-Site Operating Model

The factory uses shared core services and site-level configuration.

Shared services:

- Source Registry
- Collector framework
- Parser framework
- Normalization rules
- Entity registry
- Taxonomy engine
- Review workflow engine
- Translation memory
- Media processing
- Version store
- Audit log

Site configuration:

- Allowed source types
- Target languages
- Content types
- Taxonomies
- Required fields
- Review gates
- Publishing adapter
- Brand voice rules
- Legal disclaimers
- Freshness policy
- Media policy

This permits 100+ future websites without cloning the content pipeline.

---

## 7. Security, Rights, and Compliance

The factory must support:

- Source permission tracking
- Collection policy enforcement
- Robots and terms review fields for future web collection
- Media rights classification
- Takedown workflow
- Audit logs
- Reviewer attribution
- PII detection for future sources
- Jurisdiction-aware publishing restrictions
- Data retention policies

No collection should run unless the source is registered and approved for the intended collection method.

---

## 8. Non-Goals

The Content Factory is not:

- A crawler-first system
- A UI redesign system
- A database migration plan for the current Alpha RC
- A page rendering architecture
- A replacement for human review
- A permission bypass for restricted content
- A one-site content script

---

## 9. Success Criteria

V1 design is successful when it can describe how to add a new website by configuration, not by rewriting the platform.

Minimum future capabilities:

- Add a new site with target languages and taxonomies
- Register approved sources
- Ingest mixed document types
- Extract candidate knowledge with provenance
- Resolve shared entities across websites
- Route content through review
- Publish versioned packages
- Refresh or archive stale content
- Explain confidence, duplicates, and source lineage
