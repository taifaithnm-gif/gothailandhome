#!/usr/bin/env node
/**
 * Phase 11 Batch 4 — Supalai Official Content Factory
 * Official supalai.com only. No invention.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const extracted = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/content-factory/supalai_batch4_extracted.json"),
    "utf8",
  ),
);

const CONTACT = "https://www.supalai.com/en/contact";
const SOCIAL = {
  facebook: "https://www.facebook.com/Supalai",
  youtube: "https://www.youtube.com/channel/UC5bwXG3-6YC23xt3qw-sKww",
  website: "https://www.supalai.com/",
};

const PROJECTS = [
  {
    slug: "supalai-oriental-sukhumvit-39",
    official_url:
      "https://www.supalai.com/en/project/condo/supalai-oriental-sukhumvit-39",
    status_map: { ready_to_move: "completed", sold_out: "completed" },
  },
  { slug: "supalai-elite-phayathai", official_url: null, status_map: {} },
  {
    slug: "supalai-lite-sathorn-charoenrat",
    official_url: null,
    status_map: {},
  },
  { slug: "supalai-veranda-rama-9", official_url: null, status_map: {} },
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
        : "unverified_no_official_project_page",
      ...(url ? { url } : {}),
      ...(note ? { note } : {}),
    },
    verified_at: VERIFIED_AT,
    ...(value !== undefined ? { value } : {}),
  };
}

function mediaRecord(opts) {
  return {
    official_url: opts.official_url,
    copyright_source: opts.copyright_source,
    downloaded_date: null,
    checksum_sha256: null,
    local_storage_path: null,
    rights_note: opts.rights_note || "hotlink",
    download_status: opts.download_status,
    ...(opts.gallery_image_urls
      ? { gallery_image_urls: opts.gallery_image_urls }
      : {}),
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

const devPath = join(ROOT, "content/developers/supalai/manifest.json");
const dev = JSON.parse(readFileSync(devPath, "utf8"));
dev.social_links = { ...SOCIAL };
dev.facebook_url = SOCIAL.facebook;
dev.youtube_url = SOCIAL.youtube;
dev.official_contact_page = CONTACT;
dev.website = "https://www.supalai.com/";
if (!dev.sources.some((s) => s.url === SOCIAL.youtube)) {
  dev.sources.push({
    type: "youtube",
    name: "Supalai YouTube",
    url: SOCIAL.youtube,
  });
}
dev.field_evidence = dev.field_evidence || {};
dev.field_evidence.official_social_links = {
  field: "official_social_links",
  evidence_class: "OFFICIAL",
  provenance: {
    source_type: "official_developer_website",
    url: CONTACT,
    note: "Facebook from official package social; YouTube channel linked from official site chrome",
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
  en: "Supalai Public Company Limited — SET:SPALI. Company history retained from official About / SET materials.",
  zh: "Supalai Public Company Limited — SET:SPALI。公司历史来自官方 About / SET。",
  th: "บริษัท ศุภาลัย จำกัด (มหาชน) — SET:SPALI ประวัติอ้างอิง About / SET ทางการ",
};
dev.developer_master = {
  phase: "11-batch-4",
  verified_at: VERIFIED_AT,
  rule: "official_supalai_and_set_only",
  developer: "supalai",
};
writeFileSync(devPath, JSON.stringify(dev, null, 2) + "\n");

const projectRows = [];
const mediaRows = [];

for (const cfg of PROJECTS) {
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

  if (ex.address) {
    p.address = { en: ex.address, zh: ex.address, th: ex.address };
  }

  const rawStatuses = Array.isArray(ex.status) ? ex.status : [];
  let mapped = p.construction_status;
  for (const s of rawStatuses) {
    if (cfg.status_map?.[s]) {
      mapped = cfg.status_map[s];
      break;
    }
  }
  if (mapped) p.construction_status = mapped;

  const units = ex.units ?? null;
  if (units != null) {
    p.total_units = units;
    p.unit_count = units;
  }
  const floors = ex.floors ?? null;
  if (floors != null) {
    p.floor_count = floors;
    p.floors = floors;
  }
  const buildings = ex.buildings ?? null;
  if (buildings != null) {
    p.building_count = buildings;
    p.buildings = buildings;
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
      en: `${ex.official_name} is a Supalai condominium project. Facts on this page are taken from the official Supalai project page (${officialUrl}).`,
      zh: `${ex.official_name} 为 Supalai 公寓项目。本页事实来自 Supalai 官方项目页。`,
      th: `${ex.official_name} เป็นโครงการคอนโดของศุภาลัย ข้อมูลในหน้านี้มาจากหน้าโครงการทางการของศุภาลัย`,
    };
  } else if (!officialUrl) {
    p.description = {
      en: `${ex.official_name || cfg.slug} is listed under Supalai in the GoThailandHome catalog. A dedicated official Supalai project page was not found during Phase 11 Batch 4; fields remain UNVERIFIED.`,
      zh: `${ex.official_name || cfg.slug} 在目录中归属 Supalai。Batch 4 未找到独立官方项目页；字段保持 UNVERIFIED。`,
      th: `${ex.official_name || cfg.slug} อยู่ในแคตตาล็อกภายใต้ศุภาลัย — ไม่พบหน้าโครงการทางการใน Batch 4`,
    };
  }

  const copyright = `© Supalai Public Company Limited / ${ex.official_name || cfg.slug}`;
  const galleryUrls = (ex.gallery_urls || []).filter(Boolean);
  const brochureUrl = (ex.brochure_urls || [])[0] || null;
  const hasFloor = Boolean(ex.has_floor_plan_section) && Boolean(officialUrl);

  const media_library = {
    gallery: mediaRecord({
      official_url: officialUrl || "https://www.supalai.com/",
      copyright_source: copyright,
      download_status: galleryUrls.length
        ? "not_downloaded_pending_license"
        : "unverified_no_official_gallery",
      gallery_image_urls: galleryUrls.length ? galleryUrls : null,
    }),
    brochure: brochureUrl
      ? mediaRecord({
          official_url: brochureUrl,
          copyright_source: copyright + " — official e-brochure PDF",
          download_status: "not_downloaded_pending_license",
        })
      : mediaRecord({
          official_url: officialUrl || "https://www.supalai.com/",
          copyright_source: copyright,
          download_status: "unverified_no_official_pdf",
        }),
    floor_plans: mediaRecord({
      official_url: officialUrl || "https://www.supalai.com/",
      copyright_source: copyright,
      download_status: hasFloor
        ? "not_downloaded_pending_license"
        : "unverified_no_official_plans_published",
      rights_note: "hotlink_section",
      ...(ex.floor_plan_urls?.length
        ? { gallery_image_urls: ex.floor_plan_urls }
        : {}),
    }),
    hero: mediaRecord({
      official_url: officialUrl || "https://www.supalai.com/",
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
  const hasAddress = Boolean(ex.address);
  const hasStatus = rawStatuses.length > 0;
  const hasYear = ex.completion_year != null;

  const field_evidence = {
    official_project_page: fe(
      "official_project_page",
      officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      officialUrl,
      officialUrl ? undefined : ex.note,
    ),
    official_address: fe(
      "official_address",
      hasAddress ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      ex.address || p.address?.en || null,
      hasAddress
        ? "Official project identity / location branding on project page"
        : undefined,
    ),
    official_gallery: fe(
      "official_gallery",
      hasGallery ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      hasGallery ? `${galleryUrls.length} gallery URLs` : null,
      "Binaries not mirrored pending license",
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
        ? `${(ex.floor_plan_urls || []).length} official floor-plan asset URLs`
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
        : "Completion calendar year not stated on official Project Info; packaged value not upgraded",
    ),
    building_count: fe(
      "building_count",
      buildings != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      buildings,
      ex.buildings_note,
    ),
    floor_count: fe(
      "floor_count",
      floors != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      floors,
      ex.floors_note,
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
    phase: "11-batch-4",
    verified_at: VERIFIED_AT,
    rule: "official_supalai_project_pages_only",
    developer: "supalai",
    field_classifications: Object.fromEntries(
      Object.entries(field_evidence).map(([k, v]) => [k, v.evidence_class]),
    ),
  };
  m.project = p;
  m.content_factory = {
    phase: "11-batch-4",
    developer: "supalai",
    verified_at: VERIFIED_AT,
  };
  writeFileSync(path, JSON.stringify(m, null, 2) + "\n");

  upsertMediaAsset(cfg.slug, "gallery", {
    official_url: officialUrl || "https://www.supalai.com/",
    copyright_source: copyright,
    download_status: media_library.gallery.download_status,
    rights_note: "hotlink",
    notes: hasGallery
      ? `${galleryUrls.length} official gallery URLs registered`
      : "No official gallery (no project page or empty)",
    ...(galleryUrls.length ? { gallery_image_urls: galleryUrls } : {}),
  });
  upsertMediaAsset(cfg.slug, "hero", {
    official_url: officialUrl || "https://www.supalai.com/",
    copyright_source: copyright,
    download_status: media_library.hero.download_status,
    rights_note: "hotlink",
    notes: "Batch 4 hero provenance",
  });
  if (brochureUrl) {
    upsertMediaAsset(cfg.slug, "brochure", {
      official_url: brochureUrl,
      copyright_source: copyright + " — official e-brochure PDF",
      download_status: "not_downloaded_pending_license",
      rights_note: "hotlink",
      notes: "Official e-brochure PDF URL registered",
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
  phase: "11-batch-4",
  developer: "supalai",
  developer_completeness_pct: developerCompleteness,
  project_avg_completeness_pct: projectAvg,
  combined_supalai_score_pct:
    Math.round(((developerCompleteness + projectAvg) / 2) * 10) / 10,
  projects: projectRows,
  media: mediaRows,
};
mkdirSync(join(ROOT, "pipelines/factory/content-factory"), { recursive: true });
writeFileSync(
  join(ROOT, "pipelines/factory/content-factory/supalai_batch4_snapshot.json"),
  JSON.stringify(snapshot, null, 2) + "\n",
);

console.log(
  JSON.stringify(
    {
      developerCompleteness,
      projectAvg,
      combined: snapshot.combined_supalai_score_pct,
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
