#!/usr/bin/env node
/**
 * Phase 11 Batch 2 — Sansiri Official Content Factory
 * Official Sansiri project pages + SET / contact only. No invention.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const extracted = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/content-factory/sansiri_batch2_extracted.json"),
    "utf8",
  ),
);

const CONTACT = "https://www.sansiri.com/en/contact/";
const SOCIAL = {
  facebook: "https://www.facebook.com/sansirifamily",
  instagram: "https://www.instagram.com/sansiriplc/",
  youtube: "https://www.youtube.com/user/sansiritv",
  twitter: "https://x.com/SansiriPLC",
  tiktok: "https://www.tiktok.com/@sansiriplc",
  line: "https://line.me/R/ti/p/%40sansiriplc",
  website: "https://www.sansiri.com/",
};

const SANSIRI_PROJECTS = [
  {
    slug: "xt-phayathai",
    official_url: "https://www.sansiri.com/en/condominium/xt-phayathai/",
    status_map: { ready_to_move: "completed", sold_out: "completed" },
    building_count: 2, // Tower A + Tower B on official Project Type
    floor_count: 41, // Tower A 41 stories
  },
  {
    slug: "xt-huai-khwang",
    official_url: "https://www.sansiri.com/en/condominium/xt-huaikhwang/",
    status_map: { ready_to_move: "completed", sold_out: "completed" },
    building_count: 2, // 2 Towers
    floor_count: 43, // Tower A 43-storey
  },
  {
    slug: "the-line-sukhumvit-101",
    official_url: "https://www.sansiri.com/en/condominium/theline-sukhumvit101/",
    status_map: { ready_to_move: "completed", sold_out: "completed" },
    building_count: 1, // 37 Storey Residential Building
    floor_count: 37,
  },
  {
    slug: "the-base-sukhumvit-77",
    official_url:
      "https://www.sansiri.com/en/condominium/the-base-park-east-sukhumvit77/",
    status_map: { ready_to_move: "completed", sold_out: "completed" },
    // Project Details blank on official page (sold-out legacy)
  },
  {
    slug: "condo-u-sukhumvit-62-1",
    official_url: null, // no dedicated official project page found
    status_map: {},
  },
];

function cleanGallery(urls) {
  return (urls || [])
    .map((u) => (u.startsWith("//") ? `https:${u}` : u))
    .filter(
      (u) =>
        u &&
        !/close-btn|facilityprojectcategory|poicategory|assets_inter\/images\/btn/i.test(
          u,
        ),
    );
}

function cleanAddress(addr) {
  if (!addr) return null;
  const s = String(addr)
    .replace(/&nbsp;/g, " ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s || s.length < 8) return null;
  return s;
}

function facilityKey(name) {
  return String(name || "facility")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

function fe(field, evidence_class, url, value, note) {
  return {
    field,
    evidence_class,
    provenance: {
      source_type: url
        ? "official_developer_project_page"
        : "unverified_no_official_project_page",
      ...(url ? { url } : {}),
      ...(note ? { note } : {}),
    },
    verified_at: VERIFIED_AT,
    ...(value !== undefined ? { value } : {}),
  };
}

function mediaRecord({
  official_url,
  copyright_source,
  local_storage_path = null,
  checksum_sha256 = null,
  downloaded_date = null,
  download_status,
  rights_note = "hotlink",
  gallery_image_urls = null,
}) {
  return {
    official_url,
    copyright_source,
    downloaded_date,
    checksum_sha256,
    local_storage_path,
    rights_note,
    download_status,
    ...(gallery_image_urls ? { gallery_image_urls } : {}),
  };
}

function scoreProject(feMap) {
  const dims = [
    "official_gallery",
    "official_brochure",
    "official_floor_plan",
    "official_facilities",
    "official_address",
    "completion_year",
    "project_status",
    "building_count",
    "floor_count",
    "total_units",
  ];
  let n = 0;
  for (const d of dims) {
    if (feMap[d]?.evidence_class === "OFFICIAL") n += 1;
  }
  return Math.round((n / dims.length) * 1000) / 10;
}

function upsertMediaAsset(slug, role, payload) {
  const dir = join(
    ROOT,
    "content/media/library/projects",
    slug,
  );
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${role}.asset.json`);
  let prev = {};
  if (existsSync(path)) {
    try {
      prev = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      prev = {};
    }
  }
  const next = {
    ...prev,
    id: `project:${slug}:${role}`,
    class: role === "floor_plans" ? "floor_plan" : role,
    entity_type: "project",
    entity_slug: slug,
    role,
    ...payload,
    verified_at: VERIFIED_AT,
  };
  writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
}

// --- Developer enrich ---
const devPath = join(ROOT, "content/developers/sansiri/manifest.json");
const dev = JSON.parse(readFileSync(devPath, "utf8"));
dev.social_links = { ...SOCIAL };
dev.facebook_url = SOCIAL.facebook;
dev.instagram_url = SOCIAL.instagram;
dev.youtube_url = SOCIAL.youtube;
dev.official_contact_page = CONTACT;
dev.website = "https://www.sansiri.com/";

for (const [type, url] of [
  ["facebook", SOCIAL.facebook],
  ["instagram", SOCIAL.instagram],
  ["youtube", SOCIAL.youtube],
]) {
  if (!dev.sources.some((s) => s.url === url)) {
    dev.sources.push({
      type,
      name: `Sansiri ${type}`,
      url,
    });
  }
}

dev.field_evidence = dev.field_evidence || {};
dev.field_evidence.official_social_links = {
  field: "official_social_links",
  evidence_class: "OFFICIAL",
  provenance: {
    source_type: "official_developer_contact_page",
    url: CONTACT,
    note: "Footer social icons on official EN contact + homepage",
  },
  verified_at: VERIFIED_AT,
  value: SOCIAL,
};
dev.field_evidence.official_contact_page = {
  field: "official_contact_page",
  evidence_class: "OFFICIAL",
  provenance: {
    source_type: "official_developer_website",
    url: CONTACT,
  },
  verified_at: VERIFIED_AT,
  value: CONTACT,
};
dev.company_history = {
  en: "Sansiri Public Company Limited — established since 1984 (Annual Report 2024); SET ticker SIRI.",
  zh: "Sansiri Public Company Limited — 成立于 1984 年（年度报告 2024）；SET 代码 SIRI。",
  th: "บริษัท แสนสิริ จำกัด (มหาชน) — ก่อตั้งตั้งแต่ปี 2527 (รายงานประจำปี 2024); SET ชื่อย่อ SIRI",
};
dev.developer_master = {
  phase: "11-batch-2",
  verified_at: VERIFIED_AT,
  rule: "official_sansiri_and_set_only",
  developer: "sansiri",
};
writeFileSync(devPath, JSON.stringify(dev, null, 2) + "\n");

const projectRows = [];
const mediaRows = [];

for (const cfg of SANSIRI_PROJECTS) {
  const path = join(ROOT, "content/projects", cfg.slug, "manifest.json");
  const m = JSON.parse(readFileSync(path, "utf8"));
  const ex = extracted[cfg.slug] || {};
  const officialUrl = cfg.official_url;
  const p = m.project || {};

  if (officialUrl) {
    p.official_website = officialUrl;
    if (!m.sources) m.sources = [];
    if (!m.sources.some((s) => s.url === officialUrl)) {
      m.sources.unshift({
        type: "official_developer",
        name: `${ex.official_name || cfg.slug} official project page`,
        url: officialUrl,
      });
    }
  }

  const addrEn = cleanAddress(ex.address);
  if (addrEn) {
    p.address = { en: addrEn, zh: addrEn, th: addrEn };
  }

  const rawStatuses = Array.isArray(ex.status) ? ex.status : [];
  const rawStatus = rawStatuses[0] || null;
  let mapped = p.construction_status;
  for (const s of rawStatuses) {
    if (cfg.status_map?.[s]) {
      mapped = cfg.status_map[s];
      break;
    }
  }
  if (mapped) p.construction_status = mapped;

  let units = ex.units ?? null;
  if (units != null) {
    p.total_units = units;
    p.unit_count = units;
  }

  let floors = cfg.floor_count ?? null;
  if (floors != null) {
    p.floor_count = floors;
    p.floors = floors;
  }

  let buildings = cfg.building_count ?? null;
  if (buildings != null) {
    p.building_count = buildings;
    p.buildings = buildings;
  }

  if (ex.completion_year != null) {
    p.completion_year = ex.completion_year;
  }

  if (Array.isArray(ex.facilities) && ex.facilities.length && officialUrl) {
    p.facilities = ex.facilities.map((f) => ({
      key: facilityKey(f.en),
      name: { en: f.en, zh: f.en, th: f.en },
      source: "official_developer",
      source_url: officialUrl,
    }));
  }

  if (ex.official_name && officialUrl) {
    p.description = {
      en: `${ex.official_name} is a Sansiri condominium project. Facts on this page are taken from the official Sansiri project page (${officialUrl}).`,
      zh: `${ex.official_name} 为 Sansiri 公寓项目。本页事实来自 Sansiri 官方项目页。`,
      th: `${ex.official_name} เป็นโครงการคอนโดของ แสนสิริ ข้อมูลในหน้านี้มาจากหน้าโครงการทางการของแสนสิริ`,
    };
  } else if (cfg.slug === "condo-u-sukhumvit-62-1") {
    p.description = {
      en: "CONDO U Sukhumvit 62-1 is listed under Sansiri in the GoThailandHome catalog. A dedicated official Sansiri project page was not found during Phase 11 Batch 2 verification; fields remain UNVERIFIED.",
      zh: "CONDO U Sukhumvit 62-1 在目录中归属 Sansiri。Phase 11 Batch 2 未找到独立官方项目页；字段保持 UNVERIFIED。",
      th: "CONDO U Sukhumvit 62-1 อยู่ในแคตตาล็อกภายใต้แสนสิริ ไม่พบหน้าโครงการทางการแยกต่างหากใน Batch 2 — ฟิลด์ยังเป็น UNVERIFIED",
    };
  }

  const copyright = `© Sansiri Public Company Limited / ${ex.official_name || cfg.slug}`;
  const galleryUrls = cleanGallery(ex.gallery_urls);
  const brochureUrl = (ex.brochure_urls || [])[0] || null;
  const hasFloor =
    Boolean(ex.has_floor_plan_section) &&
    Boolean(officialUrl) &&
    cfg.slug !== "the-base-sukhumvit-77" &&
    cfg.slug !== "condo-u-sukhumvit-62-1";

  const media_library = {
    gallery: mediaRecord({
      official_url: officialUrl || "https://www.sansiri.com/",
      copyright_source: copyright,
      download_status: galleryUrls.length
        ? "not_downloaded_pending_license"
        : "unverified_no_official_gallery",
      gallery_image_urls: galleryUrls.length ? galleryUrls : null,
    }),
    brochure: brochureUrl
      ? mediaRecord({
          official_url: brochureUrl,
          copyright_source: copyright + " — official brochure PDF",
          download_status: "not_downloaded_pending_license",
        })
      : mediaRecord({
          official_url: officialUrl || "https://www.sansiri.com/",
          copyright_source: copyright,
          download_status: "unverified_no_official_pdf",
        }),
    floor_plans: mediaRecord({
      official_url: officialUrl || "https://www.sansiri.com/",
      copyright_source: copyright,
      download_status: hasFloor
        ? "not_downloaded_pending_license"
        : "unverified_no_official_plans_published",
      rights_note: "hotlink_section",
    }),
    hero: mediaRecord({
      official_url: officialUrl || "https://www.sansiri.com/",
      copyright_source: copyright,
      download_status: (ex.hero_urls || []).length
        ? "not_downloaded_pending_license"
        : "placeholder_pending_official_mirror",
    }),
  };
  m.media_library = media_library;

  const hasGallery = galleryUrls.length > 0;
  const hasBrochure = Boolean(brochureUrl);
  const hasFacilities = Boolean(officialUrl) && (p.facilities || []).length > 0;
  const hasAddress = Boolean(addrEn);
  const hasStatus = Boolean(rawStatus);
  const hasYear = ex.completion_year != null;

  const field_evidence = {
    official_project_page: fe(
      "official_project_page",
      officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      officialUrl,
      officialUrl
        ? undefined
        : "No dedicated official Sansiri project page found (404 / absent from current index)",
    ),
    official_address: fe(
      "official_address",
      hasAddress ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      addrEn || p.address?.en || null,
      hasAddress
        ? undefined
        : "Location blank or missing on official page; packaged address not upgraded",
    ),
    official_gallery: fe(
      "official_gallery",
      hasGallery ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      hasGallery ? `${galleryUrls.length} gallery URLs on official page` : null,
      "Image binaries not mirrored pending license; URLs registered",
    ),
    official_brochure: fe(
      "official_brochure",
      hasBrochure ? "OFFICIAL" : "UNVERIFIED",
      brochureUrl || officialUrl,
      brochureUrl,
    ),
    official_floor_plan: fe(
      "official_floor_plan",
      hasFloor ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      hasFloor
        ? "Unit/floor plan section present on official project page (hotlink; binaries not mirrored)"
        : null,
    ),
    official_facilities: fe(
      "official_facilities",
      hasFacilities ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      hasFacilities ? (p.facilities || []).map((x) => x.name?.en) : null,
    ),
    project_status: fe(
      "project_status",
      hasStatus ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      rawStatuses.length ? rawStatuses : p.construction_status,
    ),
    completion_year: fe(
      "completion_year",
      hasYear ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      hasYear ? ex.completion_year : (p.completion_year ?? null),
      hasYear
        ? "Official Project Details Completion field"
        : "Completion year not published on official page; packaged value not upgraded",
    ),
    building_count: fe(
      "building_count",
      buildings != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      buildings,
      buildings != null
        ? `From official Project Type: ${ex.project_type || ""}`
        : undefined,
    ),
    floor_count: fe(
      "floor_count",
      floors != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      floors,
      floors != null
        ? `From official Project Type: ${ex.project_type || ""}`
        : undefined,
    ),
    total_units: fe(
      "total_units",
      units != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      units,
    ),
  };

  m.field_evidence = field_evidence;
  p.project_master = {
    phase: "11-batch-2",
    verified_at: VERIFIED_AT,
    rule: "official_sansiri_project_pages_only",
    developer: "sansiri",
    field_classifications: Object.fromEntries(
      Object.entries(field_evidence).map(([k, v]) => [k, v.evidence_class]),
    ),
  };
  m.project = p;
  m.content_factory = {
    phase: "11-batch-2",
    developer: "sansiri",
    verified_at: VERIFIED_AT,
  };
  writeFileSync(path, JSON.stringify(m, null, 2) + "\n");

  upsertMediaAsset(cfg.slug, "gallery", {
    official_url: officialUrl || "https://www.sansiri.com/",
    copyright_source: copyright,
    download_status: media_library.gallery.download_status,
    rights_note: "hotlink",
    notes: hasGallery
      ? `${galleryUrls.length} official gallery image URLs registered; binaries not scraped.`
      : "No official gallery URLs on verified project page.",
    ...(galleryUrls.length ? { gallery_image_urls: galleryUrls } : {}),
  });
  upsertMediaAsset(cfg.slug, "hero", {
    official_url: officialUrl || "https://www.sansiri.com/",
    copyright_source: copyright,
    download_status: media_library.hero.download_status,
    rights_note: "hotlink",
    notes: "Hero provenance from official Sansiri project page (Batch 2).",
  });
  if (brochureUrl) {
    upsertMediaAsset(cfg.slug, "brochure", {
      official_url: brochureUrl,
      copyright_source: copyright + " — official brochure PDF",
      download_status: "not_downloaded_pending_license",
      rights_note: "hotlink",
      notes: "Official brochure PDF URL registered; binary not mirrored pending license.",
    });
  }

  const completeness = scoreProject(field_evidence);
  projectRows.push({
    slug: cfg.slug,
    official_url: officialUrl,
    status: rawStatuses,
    mapped_status: p.construction_status,
    units,
    floors,
    buildings,
    facilities: (p.facilities || []).length,
    gallery_urls: galleryUrls.length,
    brochure: Boolean(brochureUrl),
    address: addrEn || null,
    completion_year: hasYear ? ex.completion_year : (p.completion_year ?? null),
    completion_year_class: hasYear ? "OFFICIAL" : "UNVERIFIED",
    completeness_pct: completeness,
    field_evidence: Object.fromEntries(
      Object.entries(field_evidence).map(([k, v]) => [k, v.evidence_class]),
    ),
  });
  mediaRows.push({
    slug: cfg.slug,
    gallery: media_library.gallery,
    brochure: media_library.brochure,
    floor_plans: media_library.floor_plans,
    hero: media_library.hero,
  });
}

// Fix base address pollution in extracted snapshot
if (extracted["the-base-sukhumvit-77"]) {
  extracted["the-base-sukhumvit-77"].address = null;
  writeFileSync(
    join(ROOT, "pipelines/factory/content-factory/sansiri_batch2_extracted.json"),
    JSON.stringify(extracted, null, 2) + "\n",
  );
}

const devFields = [
  "official_logo",
  "favicon",
  "company_profile",
  "company_history",
  "headquarters",
  "established_year",
  "official_website",
  "listed_company_code",
  "official_contact_page",
  "official_social_links",
];
let devScore = 0;
for (const f of devFields) {
  if (dev.field_evidence?.[f]?.evidence_class === "OFFICIAL") devScore += 1;
}
const developerCompleteness =
  Math.round((devScore / devFields.length) * 1000) / 10;
const projectAvg =
  Math.round(
    (projectRows.reduce((a, r) => a + r.completeness_pct, 0) /
      projectRows.length) *
      10,
  ) / 10;

const snapshot = {
  verified_at: VERIFIED_AT,
  phase: "11-batch-2",
  developer: "sansiri",
  developer_completeness_pct: developerCompleteness,
  project_avg_completeness_pct: projectAvg,
  combined_sansiri_score_pct:
    Math.round(((developerCompleteness + projectAvg) / 2) * 10) / 10,
  projects: projectRows,
  media: mediaRows,
};
mkdirSync(join(ROOT, "pipelines/factory/content-factory"), { recursive: true });
writeFileSync(
  join(ROOT, "pipelines/factory/content-factory/sansiri_batch2_snapshot.json"),
  JSON.stringify(snapshot, null, 2) + "\n",
);

console.log(
  JSON.stringify(
    {
      developerCompleteness,
      projectAvg,
      combined: snapshot.combined_sansiri_score_pct,
      projects: projectRows.map((r) => ({
        slug: r.slug,
        pct: r.completeness_pct,
        fe: r.field_evidence,
      })),
    },
    null,
    2,
  ),
);
