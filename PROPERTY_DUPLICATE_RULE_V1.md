# Property Duplicate Rule V1

**Status:** Sprint 1 frozen deterministic rule; no implementation  
**Scope:** Bangkok new condominium project records, maximum 100

## Principle

Duplicate detection may block or route records; it may not silently merge them. Every uncertain match requires a human decision. Embeddings and semantic/vector matching are deferred.

## Project identity

The canonical project identity uses source-backed:

1. approved source and source external ID where available;
2. normalized developer name;
3. normalized project name;
4. Bangkok location (district/subdistrict/address components when available);
5. canonical approved source URL/access point.

No single fuzzy name match is sufficient to merge projects.

## Name normalization

Normalization must be deterministic, versioned, and preserve originals:

- Unicode normalize;
- trim leading/trailing whitespace;
- collapse repeated internal whitespace;
- case-fold Latin characters;
- normalize punctuation and separators;
- preserve Thai text and meaningful numerals;
- apply an approved, versioned legal-suffix rule to developer names;
- do not translate, transliterate, remove project phases/towers, or expand abbreviations unless a later explicit rule is approved;
- record every transformation and normalization-rule version.

Different phases, towers, buildings, or branded subprojects remain separate unless source evidence and human review establish one canonical project.

## Match classes

| Class | Deterministic condition | System action | Human requirement |
| --- | --- | --- | --- |
| Exact raw duplicate | Same source ID and payload/content hash | Do not create another raw canonical candidate; record no-change/duplicate event | Audit only unless conflict exists |
| Exact source identity | Same approved source ID and non-null source external ID | Link to existing candidate/version, never create a second canonical project silently | Human review if material values conflict |
| Exact canonical URL | Same approved canonical project URL/access point | Flag as exact source duplicate | Human confirms version/update behavior |
| Strong project candidate | Same normalized developer + normalized project name + same Bangkok district/subdistrict | Create duplicate group; block package inclusion | Human must merge, keep separate, or request evidence |
| Ambiguous project candidate | Name/developer/location partly agree or phase/tower information differs | Create uncertain duplicate group | Human decision mandatory; no auto-merge |
| Non-duplicate | Deterministic identity differs with sufficient evidence | Keep separate | Reviewer may confirm |

## External ID rules

- Preserve external IDs exactly as source values.
- External ID uniqueness is scoped to source.
- The same external ID from different sources is not an automatic match.
- A changed/reused external ID with conflicting project evidence is quarantined for human review.
- Missing external ID is `null`, never synthesized.

## Developer matching

- Compare original and normalized names.
- An approved alias may support a candidate match but cannot cause an automatic merge.
- Different legal entities with similar branding remain separate.
- Developer mismatch blocks automatic identity even when project names match.

## Human review

For every duplicate group, the reviewer records:

- group and member IDs/versions;
- compared identity fields and evidence;
- decision: `merge`, `keep_separate`, `false_positive`, or `needs_more_evidence`;
- selected canonical record when merging;
- reason/comment, reviewer reference, and timestamp;
- treatment of aliases, versions, and all member evidence.

`needs_more_evidence` blocks approval and package inclusion.

## Merge prohibition

- No uncertain duplicate may be automatically merged.
- No merge may delete or overwrite member evidence, original values, versions, aliases, or decisions.
- No merge occurs on text similarity, AI recommendation, shared marketing language, geography alone, developer alone, or project name alone.
- No embedding/vector decision is allowed in V1.
- A merge correction creates a new immutable decision/version; it does not rewrite history.

## Testable Sprint 1 thresholds

- Seeded exact duplicates by content hash, canonical URL, and source external ID must be detected with 100% recall.
- Seeded normalized developer + project + Bangkok location candidates must be grouped with an explainable match reason.
- 100% of duplicate groups must have an immutable human decision before package inclusion.
- Zero uncertain groups may reach `approved` or `publish_ready`.
- All evidence from merged members must remain traceable.

