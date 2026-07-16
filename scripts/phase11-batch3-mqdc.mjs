#!/usr/bin/env node
/**
 * Phase 11 Batch 3 — MQDC Official Content Factory
 * Official mqdc.com (+ Forestias microsite on mqdc.com) only. No invention.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const extracted = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/content-factory/mqdc_batch3_extracted.json"),
    "utf8",
  ),
);

const CONTACT = "https://mqdc.com/contact";
const SOCIAL = {
  facebook: "https://www.facebook.com/mqdcforallwellbeing/",
  instagram: "https://www.instagram.com/mqdcforallwellbeing/",
  youtube: "https://www.youtube.com/user/MAGNOLIADTGO",
  twitter: "https://x.com/mqdc_official",
  line: "https://line.me/R/ti/p/@MQDC",
  website: "https://www.mqdc.com/",
};

const MQDC_PROJECTS = [
  {
    slug: "the-forestias",
    official_url: "https://mqdc.com/theforestias",
    status_map: {
      selling: "selling",
      under_construction: "selling",
    },
  },
  {
    slug: "whizdom-essence",
    official_url: "https://mqdc.com/whizdom-essence-sukhumvit",
    status_map: { sold_out: "completed", ready_to_move: "completed" },
    floor_count: 50,
  },
];

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
        : "unverified",
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
  download_status,
  rights_note = "hotlink",
  gallery_image_urls = null,
}) {
  return {
    official_url,
    copyright_source,
    downloaded_date: null,
    checksum_sha256: null,
    local_storage_path: null,
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
  const dir = join(ROOT, "content/media/library/projects", slug);
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
  writeFileSync(
    path,
    JSON.stringify(
      {
        ...prev,
        id: `project:${slug}:${role}`,
        class: role === "floor_plans" ? "floor_plan" : role,
        entity_type: "project",
        entity_slug: slug,
        role,
        ...payload,
        verified_at: VERIFIED_AT,
      },
      null,
      2,
    ) + "\n",
  );
}

// --- Developer ---
const devPath = join(ROOT, "content/developers/mqdc/manifest.json");
const dev = JSON.parse(readFileSync(devPath, "utf8"));
dev.social_links = { ...SOCIAL };
dev.facebook_url = SOCIAL.facebook;
dev.instagram_url = SOCIAL.instagram;
dev.youtube_url = SOCIAL.youtube;
dev.official_contact_page = CONTACT;
dev.website = "https://www.mqdc.com/";

for (const [type, url] of [
  ["facebook", SOCIAL.facebook],
  ["instagram", SOCIAL.instagram],
  ["youtube", SOCIAL.youtube],
]) {
  if (!dev.sources.some((s) => s.url === url)) {
    dev.sources.push({ type, name: `MQDC ${type}`, url });
  }
}

dev.field_evidence = dev.field_evidence || {};
dev.field_evidence.official_social_links = {
  field: "official_social_links",
  evidence_class: "OFFICIAL",
  provenance: {
    source_type: "official_developer_contact_page",
    url: CONTACT,
    note: "Footer social icons on mqdc.com contact / about / business",
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
// Keep SET as NOT_APPLICABLE (private company)
dev.company_history = {
  en: "Magnolia Quality Development Corporation Limited (MQDC) — established 1994 (official About).",
  zh: "Magnolia Quality Development Corporation Limited (MQDC) — 成立于 1994 年（官方 About）。",
  th: "บริษัท แมกโนเลีย ควอลิตี้ ดีเวล็อปเม้นต์ คอร์ปอเรชั่น จำกัด (MQDC) — ก่อตั้งปี 2537 (About ทางการ)",
};
dev.developer_master = {
  phase: "11-batch-3",
  verified_at: VERIFIED_AT,
  rule: "official_mqdc_only",
  developer: "mqdc",
};
writeFileSync(devPath, JSON.stringify(dev, null, 2) + "\n");

const projectRows = [];
const mediaRows = [];

for (const cfg of MQDC_PROJECTS) {
  const path = join(ROOT, "content/projects", cfg.slug, "manifest.json");
  const m = JSON.parse(readFileSync(path, "utf8"));
  const ex = extracted[cfg.slug] || {};
  const officialUrl = cfg.official_url;
  const p = m.project || {};

  p.official_website = officialUrl;
  if (!m.sources) m.sources = [];
  if (!m.sources.some((s) => s.url === officialUrl)) {
    m.sources.unshift({
      type: "official_developer",
      name: `${ex.official_name || cfg.slug} official project page`,
      url: officialUrl,
    });
  }

  if (ex.address) {
    p.address = { en: ex.address, zh: ex.address, th: ex.address };
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

  let floors = cfg.floor_count ?? ex.floors ?? null;
  if (floors != null) {
    p.floor_count = floors;
    p.floors = floors;
  }

  let buildings = cfg.building_count ?? ex.buildings ?? null;
  if (buildings != null) {
    p.building_count = buildings;
    p.buildings = buildings;
  }

  if (Array.isArray(ex.facilities) && ex.facilities.length) {
    p.facilities = ex.facilities.map((f) => ({
      key: facilityKey(f.en),
      name: { en: f.en, zh: f.en, th: f.en },
      source: "official_developer",
      source_url: officialUrl,
    }));
  }

  if (ex.official_name) {
    p.description = {
      en: `${ex.official_name} is an MQDC project. Facts on this page are taken from the official MQDC project page (${officialUrl}).`,
      zh: `${ex.official_name} 为 MQDC 项目。本页事实来自 MQDC 官方项目页。`,
      th: `${ex.official_name} เป็นโครงการของ MQDC ข้อมูลในหน้านี้มาจากหน้าโครงการทางการของ MQDC`,
    };
  }

  const copyright = `© Magnolia Quality Development Corporation Limited / ${ex.official_name || cfg.slug}`;
  const galleryUrls = (ex.gallery_urls || []).filter(Boolean);
  const brochureUrl = (ex.brochure_urls || [])[0] || null;
  const hasFloor = Boolean(ex.has_floor_plan_section);

  const media_library = {
    gallery: mediaRecord({
      official_url: officialUrl,
      copyright_source: copyright,
      download_status: galleryUrls.length
        ? "not_downloaded_pending_license"
        : "unverified_no_official_gallery",
      gallery_image_urls: galleryUrls.length ? galleryUrls : null,
    }),
    brochure: brochureUrl
      ? mediaRecord({
          official_url: brochureUrl,
          copyright_source: copyright + " — official brochure",
          download_status: "not_downloaded_pending_license",
        })
      : mediaRecord({
          official_url: officialUrl,
          copyright_source: copyright,
          download_status: "unverified_no_official_pdf",
        }),
    floor_plans: mediaRecord({
      official_url: officialUrl,
      copyright_source: copyright,
      download_status: hasFloor
        ? "not_downloaded_pending_license"
        : "unverified_no_official_plans_published",
      rights_note: "hotlink_section",
    }),
    hero: mediaRecord({
      official_url: officialUrl,
      copyright_source: copyright,
      download_status: (ex.hero_urls || []).length
        ? "not_downloaded_pending_license"
        : "placeholder_pending_official_mirror",
    }),
  };
  m.media_library = media_library;

  const hasGallery = galleryUrls.length > 0;
  const hasBrochure = Boolean(brochureUrl);
  const hasFacilities = (p.facilities || []).length > 0;
  const hasAddress = Boolean(ex.address);
  const hasStatus = Boolean(rawStatus);
  const hasYear = ex.completion_year != null;

  const field_evidence = {
    official_project_page: fe(
      "official_project_page",
      "OFFICIAL",
      officialUrl,
      officialUrl,
    ),
    official_address: fe(
      "official_address",
      hasAddress ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      ex.address || null,
      ex.address_note,
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
        ? "Floor/unit plan section present on official project page"
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
        ? undefined
        : "No single whole-project completion year on official page; packaged value not upgraded",
    ),
    building_count: fe(
      "building_count",
      buildings != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      buildings,
    ),
    floor_count: fe(
      "floor_count",
      floors != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      floors,
      floors === 50 ? "Official Project Information: Number of levels — 50 Storeys" : undefined,
    ),
    total_units: fe(
      "total_units",
      units != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      units,
      ex.units_note,
    ),
  };

  m.field_evidence = field_evidence;
  p.project_master = {
    phase: "11-batch-3",
    verified_at: VERIFIED_AT,
    rule: "official_mqdc_project_pages_only",
    developer: "mqdc",
    field_classifications: Object.fromEntries(
      Object.entries(field_evidence).map(([k, v]) => [k, v.evidence_class]),
    ),
  };
  m.project = p;
  m.content_factory = {
    phase: "11-batch-3",
    developer: "mqdc",
    verified_at: VERIFIED_AT,
  };
  writeFileSync(path, JSON.stringify(m, null, 2) + "\n");

  upsertMediaAsset(cfg.slug, "gallery", {
    official_url: officialUrl,
    copyright_source: copyright,
    download_status: media_library.gallery.download_status,
    rights_note: "hotlink",
    notes: hasGallery
      ? `${galleryUrls.length} official gallery/CMS image URLs registered; binaries not scraped.`
      : "No official gallery URLs registered.",
    ...(galleryUrls.length ? { gallery_image_urls: galleryUrls } : {}),
  });
  upsertMediaAsset(cfg.slug, "hero", {
    official_url: officialUrl,
    copyright_source: copyright,
    download_status: media_library.hero.download_status,
    rights_note: "hotlink",
    notes: "Hero provenance from official MQDC project page (Batch 3).",
  });

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
    address: ex.address || null,
    completion_year: p.completion_year ?? null,
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
  const cls = dev.field_evidence?.[f]?.evidence_class;
  // NOT_APPLICABLE counts as satisfied for private (non-SET) developers
  if (cls === "OFFICIAL" || cls === "NOT_APPLICABLE") devScore += 1;
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
  phase: "11-batch-3",
  developer: "mqdc",
  developer_completeness_pct: developerCompleteness,
  project_avg_completeness_pct: projectAvg,
  combined_mqdc_score_pct:
    Math.round(((developerCompleteness + projectAvg) / 2) * 10) / 10,
  projects: projectRows,
  media: mediaRows,
};
mkdirSync(join(ROOT, "pipelines/factory/content-factory"), { recursive: true });
writeFileSync(
  join(ROOT, "pipelines/factory/content-factory/mqdc_batch3_snapshot.json"),
  JSON.stringify(snapshot, null, 2) + "\n",
);

console.log(
  JSON.stringify(
    {
      developerCompleteness,
      projectAvg,
      combined: snapshot.combined_mqdc_score_pct,
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
