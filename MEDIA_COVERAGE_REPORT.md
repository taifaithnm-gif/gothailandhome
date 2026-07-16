# MEDIA_COVERAGE_REPORT

**Milestone:** Phase 11 Media Factory Wave 1  
**Date:** 2026-07-16  
**Universe:** 20 developers · 50 projects

## Coverage scoreboard

| Dimension | Before (Sprint 4 V2) | After Wave 1 | Notes |
|-----------|---------------------:|-------------:|-------|
| Developer logos mirrored | 100% | **100%** | 4 upgraded off favicon |
| Project heroes (binary) | 0% | **26%** (13/50) | From official gallery CDNs |
| Galleries (binary subset) | hotlink only | **26%** (13/50) | ≤8 images / project |
| Brochures (PDF binary) | 2% | **22%** (11/50) | All known official PDFs |
| Floor plans (binary) | ~0% | **2%** (1/50) | Modiz CDN plans only |

**Equal-weight 5-dimension average (binary-focused):**  
`(100 + 26 + 26 + 22 + 2) / 5 = **35.2%**`  
(Sprint 4 V2 mixed registration+binary scored 46.8% with heroes “registered” at 100% but 0% binary — Wave 1 is harsher/honest on binaries.)

## Registration vs binary

| Class | Registered URL | Binary + checksum |
|-------|---------------:|------------------:|
| Logos | 20 | **20** |
| Heroes | 50 | **13** |
| Galleries | ~26 pages / 13 URL sets | **13** |
| Brochures | ~12 | **11** |
| Floor plans | ~9 page sections | **1** |

## Why coverage is capped

1. Most heroes still point at **project HTML pages**, not image files.  
2. Galleries often expose a UI section without a machine-readable URL list.  
3. Floor plans are usually interactive sections — no direct asset URL.  
4. Brochure “Download” controls without a stable PDF href stay skipped.

## Per-priority progress

### 1. Logos — COMPLETE
All 20 developers have mirrored logos with checksum.

### 2–3. Heroes / galleries — PARTIAL
13 projects with curated `gallery_image_urls` (or Modiz CDN harvest) now have binaries.

### 4. Brochures — PARTIAL
11/11 known official PDF URLs downloaded successfully (0 failures).

### 5. Floor plans — MINIMAL
Only Modiz exposed direct plan images on the official CDN.
