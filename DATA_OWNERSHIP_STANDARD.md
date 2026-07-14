# Data Ownership Standard V1.0

**Product:** GoThailandHome  
**Version:** 1.0  
**Phase:** 6.5 (planning only)  
**Compatible with:** MASTER_CONTENT_STANDARD · VERIFICATION_STANDARD · Property Factory · PLATFORM_ARCHITECTURE_V2

---

## 1. Purpose

Define **who owns**, **who may edit**, **who is liable for updates**, and **how deletion works** for every content object — critical before marketplace multi-publisher fights and DMCA/PDPA requests.

---

## 2. Ownership classes

| Class                       | Code                     | Meaning                                                                          |
| --------------------------- | ------------------------ | -------------------------------------------------------------------------------- |
| **Official Developer Data** | `official_developer`     | Canonical project/developer fields controlled by Official Developer verification |
| **Developer Submitted**     | `developer_submitted`    | Entered by developer account but not yet (or not) official-canonical             |
| **Agency Submitted**        | `agency_submitted`       | Created/edited under agency org                                                  |
| **Owner Submitted**         | `owner_submitted`        | Created by Verified Owner for own units                                          |
| **Platform Generated**      | `platform_generated`     | GoThailandHome ops/Factory structure, SEO templates, rollups                     |
| **AI Generated**            | `ai_generated`           | Machine-drafted text/media metadata; must be labeled; never sole source of facts |
| **Imported**                | `imported`               | Ingested via Property Factory / partners with provenance                         |
| **Third-party Referenced**  | `third_party_referenced` | Hotlinked or cited external pages; copyright remains with third party            |

A record stores `ownership_class` plus `owner_user_id` / `owner_org_id` / `steward_role`.

---

## 3. Precedence (conflict resolution)

When multiple parties assert facts on the same project/listing:

```text
1. Official Developer Data (verified)
2. Verified Owner (unit-level tenure facts)
3. Verified Agency / Agent (mandate-backed listing offer fields)
4. Imported Platform Verified (source-of-truth for price/availability until claim)
5. Developer Submitted (unverified official)
6. Platform Generated defaults
7. AI Generated (never overrides 1–5 on price, yield, geo, availability)
8. Third-party Referenced (display citations; least authority to overwrite)
```

**Claim workflow:** Agent/Agency may “claim” an Imported listing → Pending verification → transfer stewardship if approved. Developer may claim project shell → Official Developer Data.

---

## 4. Copyright

| Asset                               | Copyright posture                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| Official Developer brochures/photos | Developer (or licensor); platform license to display                                        |
| Agency/Owner photos                 | Publisher; grant platform worldwide display license                                         |
| Imported hotlinks                   | Remain on source CDN; GTH shows with attribution                                            |
| Mirrored media                      | Only with license/ToS; watermark policy MEDIA V1/V2                                         |
| AI text                             | Platform/publisher stewardship; disclose AI assist; publisher accepts liability for publish |
| Platform copy (templates, glossary) | GoThailandHome                                                                              |
| User reviews (future)               | User; license to GTH                                                                        |

Takedown: copyright complainant → Moderator quarantine → remove or counter-notice process (legal policy TBD).

---

## 5. Update responsibility

| Class                   | Primary updater                                    | SLA expectation                                               |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Official Developer Data | Developer account                                  | Material changes (progress, facilities) within 14d of reality |
| Agency / Agent listings | Primary agent / org                                | Price/availability fresh per VERIFICATION/CONTENT freshness   |
| Owner listings          | Owner or appointed agent                           | Same                                                          |
| Imported                | Platform Factory refresh jobs                      | Stale → Hidden/Expired                                        |
| Platform Generated SEO  | System + content ops                               | On entity change                                              |
| AI Generated            | Regenerated only on request; human approve for L3+ | —                                                             |
| Third-party Referenced  | Source site; GTH refresh link health               | On 404 → flag                                                 |

Failure to update after notice may revoke Official/Verified badges.

---

## 6. Field-level stewardship (examples)

| Field group                                | Preferred owner class                           |
| ------------------------------------------ | ----------------------------------------------- |
| Project facilities, masterplan, completion | Official Developer                              |
| Listing price, rent, availability          | Mandate holder (Agent/Owner) or Imported source |
| Commission offer                           | Mandate holder                                  |
| District lifestyle prose                   | Platform Generated / editorial                  |
| Yield %                                    | Sourced only; never AI-sole                     |
| Coords when Official                       | Official Developer; else Imported/Agency        |

---

## 7. Deletion policy

| Request                            | Handling                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| Publisher deletes draft            | Hard delete allowed                                                                 |
| Publisher unpublish                | Hidden / Archived — retain audit                                                    |
| Publisher requests erase published | Soft-delete; SEO redirects; backups per retention                                   |
| PDPA data subject erase            | Remove PII from leads/profiles; listings may anonymize contacts                     |
| Copyright takedown                 | Remove media; listing may survive with placeholders                                 |
| Official Developer leaves          | Official flag removed; data may remain as Platform/Imported with attribution change |
| Fraud                              | Admin hard suppress + retain forensic copy                                          |

**Retention (design defaults):**  
Published lineage 24 months after archive; billing 7 years (accounting); spam leads 90 days; raw analytics 13 months.

Hard delete of inventory with active deals/commissions disputed → block until Admin clears.

---

## 8. AI Generated specifics

- Must set `ai_generated=true` on fields/blob.
- Cannot be sole provenance for: price, rent, yield, occupancy, unit number, legal ownership, stock tickers.
- Allowed: grammar, translation draft, alt text suggestions, description polish.
- Membership quotas gate volume (MEMBERSHIP_STANDARD).

---

## 9. Imported & third-party

- Factory packages retain `source`, `listing_url`, `collected_at`.
- Ownership class starts as `imported` (+ Platform Verified when gated).
- Third-party referenced media: `rights_note=hotlink`; deletion = drop URL, not “steal then delete”.

---

## 10. Alignment

- Content Standard V1.0 provenance fields remain mandatory.
- Verification badges gate Official Developer / Owner / Agency authority.
- Architecture listing_participants express commercial stewardship, not necessarily copyright.

---

_End of Data Ownership Standard V1.0_
