#!/usr/bin/env node
/**
 * Phase 11 Batch 1 — AP Thailand Official Content Factory
 * Official AP project pages + SET factsheet / contact only. No invention.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const extracted = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/content-factory/ap_batch1_extracted.json"),
    "utf8",
  ),
);

const AP_PROJECTS = [
  {
    slug: "rhythm-ekkamai",
    official_url: "https://www.apthai.com/en/condominium/rhythm-ekkamai-estate",
    status_map: { ready_to_move: "completed", sold_out: "completed" },
  },
  {
    slug: "life-asoke-rama-9",
    official_url: "https://www.apthai.com/en/condominium/life-asoke-rama-9",
    status_map: { sold_out: "completed" },
    building_count: 2, // Tower A + Tower B labels on official floor-plan UI
    floor_count: 42, // "42nd Facility Floor" on official page
    district_slug: "ratchathewi", // official address: Makkasan, Rat Thewi
  },
  {
    slug: "life-ladprao",
    official_url: "https://www.apthai.com/en/condominium/life-ladprao",
    status_map: { sold_out: "completed" },
    building_count: 2, // Tower A + Tower B
    floor_count: 46, // "46th-floorplan" titles on official page
  },
  {
    slug: "life-one-wireless",
    official_url: "https://www.apthai.com/en/condominium/life-1-wireless",
    status_map: { sold_out: "completed" },
  },
  {
    slug: "aspire-sathorn-taksin",
    official_url:
      "https://www.apthai.com/en/condominium/aspire-sathorn-taksin-priva",
    status_map: { coming_soon: "selling", new_project: "selling" },
    district_slug: "chom-thong", // official address: Chom Thong District
  },
];

function abs(u) {
  if (!u) return null;
  if (u.startsWith("//")) return `https:${u}`;
  return u;
}

function parseUnits(factsheets) {
  for (const fs of factsheets || []) {
    const typ = String(fs.type || fs.title || "");
    const desc = String(fs.description || "");
    if (typ.includes("total_unit") && !typ.includes("remark")) {
      const m = desc.replace(/,/g, "").match(/(\d+)/);
      if (m) return Number(m[1]);
    }
  }
  return null;
}

function parseFloors(factsheets) {
  for (const fs of factsheets || []) {
    const typ = String(fs.type || fs.title || "");
    const desc = String(fs.description || "");
    if (typ.includes("num_floor") || typ === "floors") {
      const m = desc.replace(/,/g, "").match(/(\d+)/);
      if (m) return Number(m[1]);
    }
  }
  return null;
}

function fe(field, evidence_class, url, value, note) {
  return {
    field,
    evidence_class,
    provenance: {
      source_type: "official_developer_project_page",
      url,
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

function facilityKey(name) {
  return String(name || "facility")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
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

// --- Developer enrich ---
const devPath = join(ROOT, "content/developers/ap-thailand/manifest.json");
const dev = JSON.parse(readFileSync(devPath, "utf8"));
dev.social_links = {
  facebook: "https://www.facebook.com/APthai",
  instagram: "https://www.instagram.com/ap_thai",
  youtube: "https://www.youtube.com/user/apciti",
  tiktok: "https://www.tiktok.com/@apthai",
  website: "https://www.apthai.com/",
};
dev.facebook_url = "https://www.facebook.com/APthai";
dev.instagram_url = "https://www.instagram.com/ap_thai";
dev.youtube_url = "https://www.youtube.com/user/apciti";
dev.official_contact_page = "https://www.apthai.com/en/contact";
if (!dev.sources.some((s) => s.url === "https://www.instagram.com/ap_thai")) {
  dev.sources.push({
    type: "instagram",
    name: "AP Thailand Instagram",
    url: "https://www.instagram.com/ap_thai",
  });
}
if (!dev.sources.some((s) => s.url === "https://www.youtube.com/user/apciti")) {
  dev.sources.push({
    type: "youtube",
    name: "AP Thailand YouTube",
    url: "https://www.youtube.com/user/apciti",
  });
}
dev.field_evidence = dev.field_evidence || {};
dev.field_evidence.official_social_links = {
  field: "official_social_links",
  evidence_class: "OFFICIAL",
  provenance: {
    source_type: "official_developer_contact_page",
    url: "https://www.apthai.com/en/contact",
  },
  verified_at: VERIFIED_AT,
  value: dev.social_links,
};
dev.field_evidence.official_contact_page = {
  field: "official_contact_page",
  evidence_class: "OFFICIAL",
  provenance: {
    source_type: "official_developer_website",
    url: "https://www.apthai.com/en/contact",
  },
  verified_at: VERIFIED_AT,
  value: "https://www.apthai.com/en/contact",
};
dev.company_history = {
  en: "AP (Thailand) Public Company Limited — SET establish date 20/07/1984 (ticker AP).",
  zh: "AP (Thailand) Public Company Limited — SET 成立日 1984-07-20（代码 AP）。",
  th: "บริษัท เอพี (ไทยแลนด์) จำกัด (มหาชน) — วันก่อตั้งตาม SET 20/07/1984 (ชื่อย่อ AP)",
};
dev.developer_master = {
  phase: "11-batch-1",
  verified_at: VERIFIED_AT,
  rule: "official_apthai_and_set_only",
  developer: "ap-thailand",
};
writeFileSync(devPath, JSON.stringify(dev, null, 2) + "\n");

const projectRows = [];
const mediaRows = [];

for (const cfg of AP_PROJECTS) {
  const path = join(ROOT, "content/projects", cfg.slug, "manifest.json");
  const m = JSON.parse(readFileSync(path, "utf8"));
  const ex = extracted[cfg.slug] || {};
  const officialUrl = cfg.official_url;
  const p = m.project || {};

  // official website
  p.official_website = officialUrl;
  if (!m.sources) m.sources = [];
  if (!m.sources.some((s) => s.url === officialUrl)) {
    m.sources.unshift({
      type: "official_developer",
      name: `${ex.official_name || cfg.slug} official project page`,
      url: officialUrl,
    });
  }

  // address
  const addrEn = ex.address_fields?.address || p.address?.en;
  if (addrEn) {
    p.address = {
      en: addrEn,
      zh: addrEn,
      th: addrEn,
    };
  }
  if (cfg.district_slug) {
    m.location = m.location || {};
    m.location.district_slug = cfg.district_slug;
    if (cfg.district_slug === "ratchathewi") {
      m.location.slug = "ratchathewi-bangkok";
      m.location.name = {
        en: "Ratchathewi",
        zh: "拉差贴威",
        th: "ราชเทวี",
      };
    }
    if (cfg.district_slug === "chom-thong") {
      m.location.slug = "chom-thong-bangkok";
      m.location.name = {
        en: "Chom Thong",
        zh: "宗通",
        th: "จอมทอง",
      };
    }
  }

  // status
  const rawStatus = ex.status;
  const mapped =
    (rawStatus && cfg.status_map?.[rawStatus]) ||
    (rawStatus === "sold_out" || rawStatus === "ready_to_move"
      ? "completed"
      : rawStatus === "coming_soon"
        ? "selling"
        : p.construction_status);
  if (mapped) p.construction_status = mapped;

  // units / floors / buildings
  let units = parseUnits(ex.factsheets);
  if (cfg.slug === "rhythm-ekkamai") {
    // FAQ on official page: 1 building, 33 floors, 303 units
    units = 303;
  }
  if (units != null) {
    p.total_units = units;
    p.unit_count = units;
  }
  let floors = parseFloors(ex.factsheets);
  if (cfg.slug === "rhythm-ekkamai") floors = 33; // official FAQ text
  if (cfg.floor_count != null) floors = cfg.floor_count;
  if (floors != null) {
    p.floor_count = floors;
    p.floors = floors;
  }
  let buildings = cfg.building_count ?? null;
  if (cfg.slug === "rhythm-ekkamai") buildings = 1;
  if (buildings != null) {
    p.building_count = buildings;
    p.buildings = buildings;
  }

  // facilities from official page (replace portal-only when we have official list)
  if (Array.isArray(ex.facilities) && ex.facilities.length) {
    p.facilities = ex.facilities.map((f) => ({
      key: facilityKey(f.en),
      name: { en: f.en, zh: f.en, th: f.en },
      source: "official_developer",
      source_url: officialUrl,
      ...(f.description
        ? {
            description: {
              en: f.description,
              zh: f.description,
              th: f.description,
            },
          }
        : {}),
    }));
  }

  // completion_year: only keep if already present; do not invent from portal for OFFICIAL class
  // Leave numeric value if present but classify honestly below.

  // description refresh (honest)
  if (ex.official_name) {
    p.description = {
      en: `${ex.official_name} is an AP Thailand condominium project. Facts on this page are taken from the official AP project page (${officialUrl}).`,
      zh: `${ex.official_name} 为 AP Thailand 公寓项目。本页事实来自 AP 官方项目页。`,
      th: `${ex.official_name} เป็นโครงการคอนโดของ เอพี ไทยแลนด์ ข้อมูลในหน้านี้มาจากหน้าโครงการทางการของ AP`,
    };
  }

  // media library
  const copyright = `© AP (Thailand) Public Company Limited / ${ex.official_name || cfg.slug}`;
  const galleryUrls = (ex.gallery_urls || []).map(abs).filter(Boolean);
  const brochureUrl = abs((ex.brochure_urls || [])[0]) || null;

  const media_library = {
    gallery: mediaRecord({
      official_url: officialUrl,
      copyright_source: copyright,
      download_status: galleryUrls.length
        ? "not_downloaded_pending_license"
        : "not_downloaded_pending_license",
      gallery_image_urls: galleryUrls.length ? galleryUrls : null,
    }),
    brochure: brochureUrl
      ? mediaRecord({
          official_url: brochureUrl,
          copyright_source: copyright + " — official brochure PDF",
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
      download_status:
        cfg.slug === "aspire-sathorn-taksin"
          ? "unverified_no_official_plans_published"
          : "not_downloaded_pending_license",
      rights_note: "hotlink_section",
    }),
    hero: mediaRecord({
      official_url: officialUrl,
      copyright_source: copyright,
      download_status: "placeholder_pending_official_mirror",
    }),
  };

  // Keep existing mirrored Rhythm brochure checksum if present
  if (
    cfg.slug === "rhythm-ekkamai" &&
    m.media_library?.brochure?.checksum_sha256
  ) {
    media_library.brochure = {
      ...media_library.brochure,
      ...m.media_library.brochure,
      official_url: brochureUrl || m.media_library.brochure.official_url,
      download_status: "downloaded",
    };
  }

  m.media_library = media_library;

  // field evidence
  const hasGallery = galleryUrls.length > 0;
  const hasBrochure = Boolean(brochureUrl);
  const hasFacilities = (p.facilities || []).length > 0;
  const hasAddress = Boolean(p.address?.en);
  const hasStatus = Boolean(rawStatus);
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
      p.address?.en,
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
      cfg.slug === "aspire-sathorn-taksin" ? "UNVERIFIED" : "OFFICIAL",
      officialUrl,
      cfg.slug === "aspire-sathorn-taksin"
        ? null
        : "Floor/unit plan section present on official project page (hotlink; binaries not mirrored)",
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
      rawStatus || p.construction_status,
    ),
    completion_year: fe(
      "completion_year",
      "UNVERIFIED",
      officialUrl,
      p.completion_year ?? null,
      "Completion calendar year not stated as a clear factsheet field on the official page payload; retained packaged value is not upgraded to OFFICIAL",
    ),
    building_count: fe(
      "building_count",
      buildings != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      buildings,
      buildings != null && cfg.building_count
        ? "Inferred from named Tower A/B labels on official floor-plan UI"
        : buildings === 1
          ? "Official FAQ: 1 building"
          : undefined,
    ),
    floor_count: fe(
      "floor_count",
      floors != null ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      floors,
      cfg.slug === "rhythm-ekkamai"
        ? "Official FAQ: 33 floors (factsheet num_floor also lists 32)"
        : cfg.floor_count
          ? "From highest named floor label on official floor-plan UI"
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
    phase: "11-batch-1",
    verified_at: VERIFIED_AT,
    rule: "official_apthai_project_pages_only",
    developer: "ap-thailand",
    field_classifications: Object.fromEntries(
      Object.entries(field_evidence).map(([k, v]) => [k, v.evidence_class]),
    ),
  };
  m.project = p;
  m.content_factory = {
    phase: "11-batch-1",
    developer: "ap-thailand",
    verified_at: VERIFIED_AT,
  };

  writeFileSync(path, JSON.stringify(m, null, 2) + "\n");

  const completeness = scoreProject(field_evidence);
  projectRows.push({
    slug: cfg.slug,
    official_url: officialUrl,
    status: rawStatus || null,
    mapped_status: p.construction_status,
    units,
    floors,
    buildings,
    facilities: (p.facilities || []).length,
    gallery_urls: galleryUrls.length,
    brochure: Boolean(brochureUrl),
    address: p.address?.en || null,
    completion_year: p.completion_year ?? null,
    completion_year_class: "UNVERIFIED",
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
  if (dev.field_evidence?.[f]?.evidence_class === "OFFICIAL") devScore += 1;
}
const developerCompleteness = Math.round((devScore / devFields.length) * 1000) / 10;
const projectAvg =
  Math.round(
    (projectRows.reduce((a, r) => a + r.completeness_pct, 0) /
      projectRows.length) *
      10,
  ) / 10;

const snapshot = {
  verified_at: VERIFIED_AT,
  phase: "11-batch-1",
  developer: "ap-thailand",
  developer_completeness_pct: developerCompleteness,
  project_avg_completeness_pct: projectAvg,
  combined_ap_score_pct:
    Math.round(((developerCompleteness + projectAvg) / 2) * 10) / 10,
  projects: projectRows,
  media: mediaRows,
};
mkdirSync(join(ROOT, "pipelines/factory/content-factory"), { recursive: true });
writeFileSync(
  join(ROOT, "pipelines/factory/content-factory/ap_batch1_snapshot.json"),
  JSON.stringify(snapshot, null, 2) + "\n",
);

console.log(
  JSON.stringify(
    {
      developerCompleteness,
      projectAvg,
      combined: snapshot.combined_ap_score_pct,
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
