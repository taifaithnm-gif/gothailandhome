#!/usr/bin/env node
/**
 * Phase 12 — Daily Content Factory (2026-07-16)
 * Quota: 1 developer · 2 projects · 1 district · 1 knowledge article
 * Official sources only. No feature / UI / deploy.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const VERIFIED_AT = "2026-07-16";
const DAY = "2026-07-16";
const OUT = join(ROOT, "pipelines/factory/daily-content");
mkdirSync(OUT, { recursive: true });
mkdirSync(join(ROOT, "content/knowledge/articles"), { recursive: true });
mkdirSync(join(ROOT, "content/media/library/projects/samyan-mitrtown"), {
  recursive: true,
});
mkdirSync(join(ROOT, "content/media/library/projects/one-bangkok"), {
  recursive: true,
});

const FRASERS_CONTACT = "https://www.frasersproperty.co.th/en/contact-us";
const FRASERS_HOME = "https://www.frasersproperty.co.th/en";
const SET_FPT =
  "https://www.set.or.th/en/market/product/stock/quote/FPT/factsheet";
const ONEBKK = "https://www.onebangkok.com/en/";
const SAMYAN = "https://www.samyan-mitrtown.com/en/";
const SAMYAN_ROOT = "https://www.samyan-mitrtown.com/";
const BTS = "https://www.bts.co.th/eng/index.html";
const SSRU = "https://ssru.ac.th/";
const VAJIRA = "https://www.vajira.ac.th/";
const BMA = "https://district.bangkok.go.th/";

const HQ =
  "No. 193 One Bangkok Tower 5, 7th–8th Floor, Witthayu Road, Lumphini Sub-District, Pathum Wan District, Bangkok 10330, Thailand";

const SOCIAL = {
  website: "https://www.frasersproperty.co.th/",
  facebook: "https://www.facebook.com/FrasersPropertyThailand",
  facebook_residential: "https://www.facebook.com/FrasersPropertyResidential",
  linkedin: "https://www.linkedin.com/company/frasers-property-limited/",
  youtube: "https://www.youtube.com/@fraserspropertythailand",
  instagram: "https://www.instagram.com/frasers_property_home",
};

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

function fe(field, evidence_class, provenance, value) {
  return {
    field,
    evidence_class,
    provenance,
    verified_at: VERIFIED_AT,
    ...(value !== undefined ? { value } : {}),
  };
}

function scoreProject(fieldEvidence) {
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
    if (fieldEvidence[d]?.evidence_class === "OFFICIAL") n += 1;
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
      prev = readJson(path);
    } catch {
      prev = {};
    }
  }
  writeJson(path, {
    ...prev,
    id: `project:${slug}:${role}`,
    class: role === "floor_plans" ? "floor_plan" : role,
    entity_type: "project",
    entity_slug: slug,
    role,
    ...payload,
    verified_at: VERIFIED_AT,
  });
}

// ——— 1. Developer: Frasers Property Thailand ———
const devPath = join(
  ROOT,
  "content/developers/frasers-property-thailand/manifest.json",
);
const dev = readJson(devPath);
const beforeDevOfficial = Object.values(dev.field_evidence || {}).filter(
  (v) => v?.evidence_class === "OFFICIAL",
).length;

dev.official_contact_page = FRASERS_CONTACT;
dev.phone = "0-2483-0000";
dev.contact = {
  ...(dev.contact || {}),
  phone: "0-2483-0000",
  email: null,
};
dev.headquarters = { en: HQ, zh: HQ, th: HQ };
dev.established_year = 1990;
dev.social_links = {
  website: SOCIAL.website,
  facebook: SOCIAL.facebook,
  linkedin: SOCIAL.linkedin,
  youtube: SOCIAL.youtube,
  instagram: SOCIAL.instagram,
};
dev.facebook_url = SOCIAL.facebook;
dev.sources = [
  {
    type: "official_developer",
    name: "Frasers Property Thailand official website",
    url: "https://www.frasersproperty.co.th/",
  },
  {
    type: "official_developer",
    name: "Frasers Property Thailand contact us",
    url: FRASERS_CONTACT,
  },
  {
    type: "other_public_portal",
    name: "SET FPT factsheet",
    url: SET_FPT,
  },
  {
    type: "facebook",
    name: "Frasers Property Thailand Facebook",
    url: SOCIAL.facebook,
  },
];

const profileEn =
  "Frasers Property (Thailand) Public Company Limited (SET: FPT) develops residential, retail, commercial, business park, logistics and industrial properties in Thailand, plus hospitality. Headquarters: One Bangkok Tower 5, Witthayu Road, Pathum Wan, Bangkok (official contact page). Establish date per SET factsheet: 1990.";

dev.description = {
  en: profileEn,
  zh: "Frasers Property (Thailand) Public Company Limited（SET:FPT）在泰国开发住宅、零售、商业、产业与物流等物业并经营酒店业务。总部见官方联系页 One Bangkok Tower 5。SET 成立日：1990。",
  th: "บริษัท เฟรเซอร์ส พร็อพเพอร์ตี้ (ประเทศไทย) จำกัด (มหาชน) (SET:FPT) พัฒนาที่อยู่อาศัย ค้าปลีก พาณิชย์ อุตสาหกรรม และโลจิสติกส์ รวมธุรกิจบริการ ที่อยู่ตามหน้าติดต่อทางการ One Bangkok Tower 5 วันก่อตั้งตาม SET: 1990",
};
dev.company_profile = { ...dev.description };

dev.field_evidence = {
  ...dev.field_evidence,
  headquarters: fe(
    "headquarters",
    "OFFICIAL",
    {
      source_type: "official_developer_contact_page",
      url: FRASERS_CONTACT,
      secondary_url: SET_FPT,
      note: "Street address published on Frasers Property Thailand contact page; matches SET FPT factsheet address.",
    },
    HQ,
  ),
  established_year: fe(
    "established_year",
    "OFFICIAL",
    {
      source_type: "set_factsheet",
      url: SET_FPT,
      note: "SET FPT factsheet Establish Date = 1990.",
    },
    1990,
  ),
  company_profile: fe(
    "company_profile",
    "OFFICIAL",
    {
      source_type: "official_developer_website_and_set_factsheet",
      url: FRASERS_HOME,
      secondary_url: SET_FPT,
      tertiary_url: FRASERS_CONTACT,
    },
    profileEn,
  ),
  corporate_overview: fe(
    "corporate_overview",
    "OFFICIAL",
    {
      source_type: "official_developer_website_and_set_factsheet",
      url: FRASERS_HOME,
      secondary_url: SET_FPT,
    },
    profileEn,
  ),
  official_contact_page: fe(
    "official_contact_page",
    "OFFICIAL",
    {
      source_type: "official_developer_contact_page",
      url: FRASERS_CONTACT,
    },
    FRASERS_CONTACT,
  ),
  official_social_links: fe(
    "official_social_links",
    "OFFICIAL",
    {
      source_type: "official_developer_contact_page_schema",
      url: FRASERS_CONTACT,
      note: "sameAs links from Frasers contact-page Corporation JSON-LD plus Thailand Facebook page already in package.",
    },
    SOCIAL,
  ),
  listed_company_code: fe(
    "listed_company_code",
    "OFFICIAL",
    { source_type: "set_factsheet", url: SET_FPT },
    "SET:FPT",
  ),
};

dev.developer_master = {
  ...(dev.developer_master || {}),
  phase: "12-daily",
  verified_at: VERIFIED_AT,
  daily: DAY,
  rule: "official_developer_contact_plus_set_factsheet_only",
  fields_touched: [
    "headquarters",
    "established_year",
    "company_profile",
    "official_contact_page",
    "official_social_links",
  ],
};

dev.headquarters_provenance = {
  source_type: "official_developer_contact_page",
  url: FRASERS_CONTACT,
  secondary_url: SET_FPT,
  verified_at: VERIFIED_AT,
  evidence_class: "OFFICIAL",
  street_level: true,
};
dev.company_profile_provenance = {
  source_type: "official_developer_website_and_set_factsheet",
  url: FRASERS_HOME,
  secondary_url: SET_FPT,
  verified_at: VERIFIED_AT,
  evidence_class: "OFFICIAL",
};

writeJson(devPath, dev);
const afterDevOfficial = Object.values(dev.field_evidence).filter(
  (v) => v?.evidence_class === "OFFICIAL",
).length;

// ——— 2a. Project: Samyan Mitrtown ———
const samyanPath = join(ROOT, "content/projects/samyan-mitrtown/manifest.json");
const samyan = readJson(samyanPath);
const samyanBefore = scoreProject(samyan.field_evidence || {});

const samyanAddress =
  "944 Rama IV Rd, Wang Mai, Pathum Wan, Bangkok 10330, Thailand";
const samyanGallery = [
  "https://p3.aprimocdn.net/frasersproperty/e560578f-06f6-4252-ba8b-b0c000abab8b/FPT_Samyan%20MItrtown_newyear%202024-01_downloadImageForWeb.Jpg",
];
const samyanFacilities = [
  "Mitrtown Office Tower",
  "Samyan Mitrtownhall",
  "Retail / amenity floors (B1, G, 1–5 directory)",
  "Commercial mixed-use destination",
];

samyan.sources = [
  {
    type: "official_developer",
    name: "Samyan Mitrtown official site (EN)",
    url: SAMYAN,
  },
  {
    type: "official_developer",
    name: "Samyan Mitrtown official site",
    url: SAMYAN_ROOT,
  },
  {
    type: "official_developer",
    name: "Frasers Property Thailand",
    url: "https://www.frasersproperty.co.th/",
  },
];
samyan.project.official_website = SAMYAN;
samyan.project.address = {
  en: samyanAddress,
  zh: samyanAddress,
  th: samyanAddress,
};
samyan.project.description = {
  en: "Samyan Mitrtown is Frasers Property Thailand’s mixed-use destination on Rama IV Road, Pathum Wan (official site: samyan-mitrtown.com). Contact published on site: +66 2 033 8900 · contact@samyan-mitrtown.com.",
  zh: "三岩 Mitrtown 为辉盛地产泰国在帕吞旺拉玛四路的综合项目（官网 samyan-mitrtown.com）。官网联系：+66 2 033 8900 · contact@samyan-mitrtown.com。",
  th: "สามย่าน มิตรทาวน์ เป็นโครงการมิกซ์ยูสของเฟรเซอร์ส พร็อพเพอร์ตี้ ประเทศไทย บนถนนพระราม 4 ปทุมวัน (เว็บไซต์ทางการ samyan-mitrtown.com) ติดต่อตามเว็บไซต์: +66 2 033 8900 · contact@samyan-mitrtown.com",
};
samyan.project.facilities = samyanFacilities.map((name) => ({
  key: name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48),
  name: { en: name, zh: name, th: name },
  source: "samyan_mitrtown_official",
}));
samyan.project.construction_status = "completed";
samyan.project.transit_tags = ["mrt"];
samyan.project.facebook_url = "https://www.facebook.com/SAMYANMITRTOWN";

samyan.field_evidence = {
  official_project_page: fe(
    "official_project_page",
    "OFFICIAL",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "Live official project site (hyphenated domain samyan-mitrtown.com). Prior package URL without hyphen failed in Wave 2.",
    },
    SAMYAN,
  ),
  official_address: fe(
    "official_address",
    "OFFICIAL",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
    },
    samyanAddress,
  ),
  official_gallery: fe(
    "official_gallery",
    "OFFICIAL",
    {
      source_type: "official_developer_cdn",
      url: SAMYAN_ROOT,
      asset_url: samyanGallery[0],
      note: "Hero/gallery still image hosted on Frasers Aprimo CDN linked from Samyan Mitrtown official site.",
    },
    samyanGallery,
  ),
  official_brochure: fe(
    "official_brochure",
    "UNVERIFIED",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "No direct brochure PDF href found on EN homepage capture.",
    },
  ),
  official_floor_plan: fe(
    "official_floor_plan",
    "UNVERIFIED",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "Floor directory labels (B1–5) are retail wayfinding, not downloadable unit floor plans.",
    },
  ),
  official_facilities: fe(
    "official_facilities",
    "OFFICIAL",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "Named components and amenity/directory floors listed on official Samyan Mitrtown navigation.",
    },
    samyanFacilities,
  ),
  project_status: fe(
    "project_status",
    "OFFICIAL",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "Operating mixed-use destination with live contact, directory and events on official site.",
    },
    "completed",
  ),
  completion_year: fe(
    "completion_year",
    "UNVERIFIED",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "Completion year not stated as a single figure on EN homepage capture.",
    },
  ),
  building_count: fe(
    "building_count",
    "UNVERIFIED",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "Multiple named components (Office Tower, Townhall) listed; no authoritative numeric building_count published on capture.",
    },
  ),
  floor_count: fe(
    "floor_count",
    "UNVERIFIED",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "Retail directory floors B1–5 observed; full tower floor_count not published as a single official figure.",
    },
  ),
  total_units: fe(
    "total_units",
    "UNVERIFIED",
    {
      source_type: "official_developer_project_page",
      url: SAMYAN,
      note: "Residential unit totals not published on commercial destination homepage.",
    },
  ),
};

samyan.media_library = {
  ...(samyan.media_library || {}),
  hero: {
    official_url: samyanGallery[0],
    copyright_source: "© Frasers Property Thailand / Samyan Mitrtown",
    downloaded_date: null,
    checksum_sha256: null,
    local_storage_path: null,
    rights_note: "hotlink_pending_license",
    download_status: "hotlink_catalogued",
  },
  gallery: {
    official_url: SAMYAN_ROOT,
    copyright_source: "© Frasers Property Thailand / Samyan Mitrtown",
    downloaded_date: null,
    checksum_sha256: null,
    local_storage_path: null,
    rights_note: "hotlink_pending_license",
    download_status: "hotlink_catalogued",
    gallery_image_urls: samyanGallery,
  },
  brochure: {
    official_url: null,
    copyright_source: "© Frasers Property Thailand / Samyan Mitrtown",
    downloaded_date: null,
    checksum_sha256: null,
    local_storage_path: null,
    rights_note: "unavailable",
    download_status: "unverified_no_official_pdf",
  },
  floor_plans: {
    official_url: SAMYAN,
    copyright_source: "© Frasers Property Thailand / Samyan Mitrtown",
    downloaded_date: null,
    checksum_sha256: null,
    local_storage_path: null,
    rights_note: "directory_only",
    download_status: "unverified_no_official_plans_published",
  },
};

samyan.project_factory = {
  phase: "12-daily",
  verified_at: VERIFIED_AT,
  daily: DAY,
  developer: "frasers-property-thailand",
};
samyan.project_master = {
  ...(samyan.project_master || {}),
  phase: "12-daily",
  verified_at: VERIFIED_AT,
  rule: "official_project_pages_only_for_official_field_upgrades",
};

writeJson(samyanPath, samyan);
upsertMediaAsset("samyan-mitrtown", "gallery", {
  official_url: SAMYAN_ROOT,
  copyright_source: "© Frasers Property Thailand / Samyan Mitrtown",
  gallery_image_urls: samyanGallery,
  rights_note: "hotlink_pending_license",
  download_status: "hotlink_catalogued",
  downloaded_date: null,
  checksum_sha256: null,
  local_storage_path: null,
});
upsertMediaAsset("samyan-mitrtown", "hero", {
  official_url: samyanGallery[0],
  copyright_source: "© Frasers Property Thailand / Samyan Mitrtown",
  rights_note: "hotlink_pending_license",
  download_status: "hotlink_catalogued",
  downloaded_date: null,
  checksum_sha256: null,
  local_storage_path: null,
});
const samyanAfter = scoreProject(samyan.field_evidence);

// ——— 2b. Project: One Bangkok ———
const onePath = join(ROOT, "content/projects/one-bangkok/manifest.json");
const one = readJson(onePath);
const oneBefore = scoreProject(one.field_evidence || {});

const oneGallery = ["https://www.onebangkok.com/en.thumb.800.480.png"];
const oneAddress =
  "Wireless Road, Lumphini, Pathum Wan, Bangkok 10330, Thailand";

one.project.address = {
  en: oneAddress,
  zh: oneAddress,
  th: oneAddress,
};
one.project.official_website = ONEBKK;
if (!one.sources?.some((s) => s.url === ONEBKK)) {
  one.sources = [
    {
      type: "official_developer",
      name: "One Bangkok official site (EN)",
      url: ONEBKK,
    },
    ...(one.sources || []),
  ];
}

one.field_evidence = {
  ...one.field_evidence,
  official_address: fe(
    "official_address",
    "OFFICIAL",
    {
      source_type: "official_developer_project_page",
      url: ONEBKK,
      note: "Contact block on onebangkok.com/en — Wireless Road, Lumphini, Patumwan, Bangkok 10330; +66 (0) 2 483 5555; contactcenter@onebangkok.com.",
    },
    oneAddress,
  ),
  official_gallery: fe(
    "official_gallery",
    "OFFICIAL",
    {
      source_type: "official_developer_project_page",
      url: ONEBKK,
      asset_url: oneGallery[0],
      note: "Official site thumbnail image on onebangkok.com domain.",
    },
    oneGallery,
  ),
  official_project_page: fe(
    "official_project_page",
    "OFFICIAL",
    {
      source_type: "official_developer_project_page",
      url: ONEBKK,
    },
    ONEBKK,
  ),
};

one.media_library = {
  ...(one.media_library || {}),
  gallery: {
    ...(one.media_library?.gallery || {}),
    official_url: ONEBKK,
    copyright_source: "© Frasers Property Thailand / One Bangkok",
    rights_note: "hotlink_pending_license",
    download_status: "hotlink_catalogued",
    gallery_image_urls: oneGallery,
    downloaded_date: null,
    checksum_sha256: null,
    local_storage_path: null,
  },
  hero: {
    ...(one.media_library?.hero || {}),
    official_url: oneGallery[0],
    copyright_source: "© Frasers Property Thailand / One Bangkok",
    rights_note: "hotlink_pending_license",
    download_status: "hotlink_catalogued",
  },
};
one.project_factory = {
  phase: "12-daily",
  verified_at: VERIFIED_AT,
  daily: DAY,
  developer: "frasers-property-thailand",
};

writeJson(onePath, one);
upsertMediaAsset("one-bangkok", "gallery", {
  official_url: ONEBKK,
  copyright_source: "© Frasers Property Thailand / One Bangkok",
  gallery_image_urls: oneGallery,
  rights_note: "hotlink_pending_license",
  download_status: "hotlink_catalogued",
  downloaded_date: null,
  checksum_sha256: null,
  local_storage_path: null,
});
const oneAfter = scoreProject(one.field_evidence);

// ——— 3. District: Dusit ———
const dusitPath = join(ROOT, "content/areas/bangkok/districts/dusit.json");
const dusit = readJson(dusitPath);

dusit.sources = [
  {
    type: "bma",
    name: "Bangkok Metropolitan Administration district portal",
    url: BMA,
  },
  {
    type: "official_institution",
    name: "Suan Sunandha Rajabhat University (official)",
    url: SSRU,
  },
  {
    type: "official_institution",
    name: "Faculty of Medicine Vajira Hospital, Navamindradhiraj University (official)",
    url: VAJIRA,
  },
];

dusit.summary = {
  en: "Dusit is one of the 50 administrative districts (khet) of Bangkok under the Bangkok Metropolitan Administration. This package cites BMA district infrastructure and named institutions verified on their official websites only.",
  zh: "杜思（Dusit）为曼谷大都会管理局（BMA）下辖 50 个行政区之一。本包仅引用 BMA 区划基础设施及可在官方网站核验的机构名称。",
  th: "ดุสิตเป็นหนึ่งใน 50 เขตการปกครองของกรุงเทพมหานครภายใต้ กทม. แพ็กเกจนี้อ้างอิงโครงสร้างเขตของ กทม. และชื่อสถาบันที่ตรวจได้จากเว็บไซต์ทางการเท่านั้น",
};

dusit.schools = [
  {
    name: {
      en: "Suan Sunandha Rajabhat University",
      zh: "苏安苏南达皇家大学",
      th: "มหาวิทยาลัยราชภัฏสวนสุนันทา",
    },
    source_url: SSRU,
  },
];

dusit.hospitals = [
  {
    name: {
      en: "Vajira Hospital (Faculty of Medicine Vajira Hospital, Navamindradhiraj University)",
      zh: "瓦吉拉医院（那瓦敏塔提拉大学瓦吉拉医学院）",
      th: "โรงพยาบาลวชิรพยาบาล คณะแพทยศาสตร์วชิรพยาบาล มหาวิทยาลัยนวมินทราธิราช",
    },
    source_url: VAJIRA,
  },
];

// Remove wiki-only shopping / parks / veterinary noise for this official-only pass
dusit.shopping = [];
dusit.parks = [];
dusit.transportation = [];

dusit.field_evidence = {
  overview: fe(
    "overview",
    "OFFICIAL",
    {
      source_type: "bma_district_portal",
      url: BMA,
      note: "District exists among BMA’s 50-district administrative set; prose limited to administrative identity (no invented lifestyle claims).",
    },
    true,
  ),
  schools: fe(
    "schools",
    "OFFICIAL",
    {
      source_type: "official_institution_website",
      url: SSRU,
    },
    ["Suan Sunandha Rajabhat University"],
  ),
  hospitals: fe(
    "hospitals",
    "OFFICIAL",
    {
      source_type: "official_institution_website",
      url: VAJIRA,
    },
    ["Vajira Hospital"],
  ),
  shopping: fe(
    "shopping",
    "UNVERIFIED",
    {
      source_type: "unavailable_official_poi_list",
      url: BMA,
      note: "Prior Wikipedia shopping corridor removed; no official BMA shopping list captured for Dusit this day.",
    },
  ),
  parks: fe(
    "parks",
    "UNVERIFIED",
    {
      source_type: "unavailable_official_poi_list",
      url: BMA,
      note: "Prior Wikipedia park list removed pending official park-authority URLs.",
    },
  ),
  transportation: fe(
    "transportation",
    "UNVERIFIED",
    {
      source_type: "unavailable_official_station_list",
      url: BTS,
      note: "No Dusit-station list asserted from BTS homepage capture; left empty rather than invent stations.",
    },
  ),
  map: fe(
    "map",
    "PRESENT",
    {
      source_type: "package_centroid_coordinates",
      url: dusit.google_maps_url,
      note: "Package centroid retained; not a new official survey point.",
    },
    dusit.map,
  ),
};

dusit.lifestyle = {
  en: "Administrative Bangkok district. Lifestyle and royal-precinct narratives are omitted until cited from official Thai government or institutional pages.",
  zh: "曼谷行政区。王室/生活方式叙述在未取得泰国官方或机构页面引用前省略。",
  th: "เขตการปกครองของกรุงเทพฯ ยังไม่บรรยายไลฟ์สไตล์/เขตราชการเชิงบรรณาธิการจนกว่าจะมีแหล่งทางการ",
  source_url: BMA,
  verified_at: VERIFIED_AT,
};

dusit.district_master = {
  phase: "12-daily",
  verified_at: VERIFIED_AT,
  daily: DAY,
  rule: "official_institution_and_bma_only_no_wikipedia_poi_promotion",
};
dusit.overview_source = {
  type: "bma_district_portal",
  url: BMA,
  verified_at: VERIFIED_AT,
};

writeJson(dusitPath, dusit);

// ——— 4. Knowledge article: BTS Skytrain ———
const article = {
  slug: "bts-skytrain-overview",
  type: "knowledge_article",
  publish_ready: true,
  collected_at: DAY,
  verified_at: VERIFIED_AT,
  title: {
    en: "BTS Skytrain — official network overview",
    zh: "BTS 空铁——官方网络概览",
    th: "รถไฟฟ้าบีทีเอส — ภาพรวมจากแหล่งทางการ",
  },
  summary: {
    en: "BTS Skytrain is Bangkok’s elevated mass-transit brand operated under the official bts.co.th site. This article records only contact and network labels visible on the English homepage — no invented station counts or fares.",
    zh: "BTS 空铁为曼谷高架捷运品牌，官方站点为 bts.co.th。本文仅记录英文首页可见的联系方式与线路/产品标签，不编造车站数量或票价。",
    th: "รถไฟฟ้าบีทีเอสเป็นระบบขนส่งมวลชนบนทางยกระดับของกรุงเทพฯ เว็บไซต์ทางการ bts.co.th บทความนี้บันทึกเฉพาะข้อมูลติดต่อและป้ายเครือข่ายที่ปรากฏบนหน้าแรกภาษาอังกฤษ ไม่สร้างตัวเลขสถานีหรือค่าโดยสาร",
  },
  body: {
    en: [
      "According to the official BTS Skytrain English homepage (bts.co.th), the public site exposes route-and-fare tools, station/places search, timetables, and network products including Sukhumvit Line, Silom Line, Gold Line, Yellow Line, Pink Line, and BRT Sathorn.",
      "Customer contact numbers published on the same homepage capture include 0 2617 6000 and 0 2617 7341.",
      "This knowledge note does not list individual station inventories, fare tables, or ridership statistics unless those figures appear as explicit structured facts on an official BTS page in a future daily pass.",
    ],
    zh: [
      "依据 BTS 空铁官方英文首页（bts.co.th），站点提供线路与票价工具、车站/地点查询、时刻表，并展示 Sukhumvit、Silom、Gold、Yellow、Pink 线路及 BRT Sathorn 等网络产品标签。",
      "同页公开客服电话包括 0 2617 6000 与 0 2617 7341。",
      "本文不罗列车站清单、票价表或客流统计，除非后续日报在官方页面捕获到明确结构化数据。",
    ],
    th: [
      "ตามหน้าแรกภาษาอังกฤษของ BTS Skytrain (bts.co.th) มีเครื่องมือเส้นทางและค่าโดยสาร ค้นหาสถานี/สถานที่ ตารางเวลา และป้ายเครือข่าย เช่น สายสุขุมวิท สายสีลม สายสีทอง สายสีเหลือง สายสีชมพู และ BRT สาทร",
      "หมายเลขติดต่อที่พบในหน้าเดียวกัน ได้แก่ 0 2617 6000 และ 0 2617 7341",
      "โน้ตนี้ไม่ระบุรายชื่อสถานี ตารางค่าโดยสาร หรือสถิติผู้โดยสาร จนกว่าจะมีตัวเลขชัดเจนจากหน้าทางการในรอบถัดไป",
    ],
  },
  sources: [
    {
      type: "official_operator",
      name: "BTS Skytrain official English homepage",
      url: BTS,
      verified_at: VERIFIED_AT,
    },
  ],
  field_evidence: {
    title: fe(
      "title",
      "OFFICIAL",
      { source_type: "official_operator_website", url: BTS },
      "BTS Skytrain",
    ),
    contact_phones: fe(
      "contact_phones",
      "OFFICIAL",
      { source_type: "official_operator_website", url: BTS },
      ["0 2617 6000", "0 2617 7341"],
    ),
    network_labels: fe(
      "network_labels",
      "OFFICIAL",
      {
        source_type: "official_operator_website",
        url: BTS,
        note: "Line / product labels observed on homepage navigation and route tools.",
      },
      [
        "Sukhumvit Line",
        "Silom Line",
        "Gold Line",
        "Yellow Line",
        "Pink Line",
        "BRT Sathorn",
      ],
    ),
  },
  seo: {
    title: {
      en: "BTS Skytrain Overview | GoThailandHome Knowledge",
      zh: "BTS空铁概览 | GoThailandHome 知识",
      th: "ภาพรวมรถไฟฟ้าบีทีเอส | ความรู้ GoThailandHome",
    },
    description: {
      en: "Official-source notes on Bangkok’s BTS Skytrain homepage: contact numbers and network labels.",
      zh: "基于 BTS 官方首页的曼谷空铁说明：联系电话与线路标签。",
      th: "บันทึกจากหน้าแรกทางการของบีทีเอส: เบอร์ติดต่อและป้ายเครือข่าย",
    },
  },
  locale_status: { en: "complete", zh: "complete", th: "complete" },
  knowledge_factory: {
    phase: "12-daily",
    verified_at: VERIFIED_AT,
    daily: DAY,
  },
};

const articlePath = join(
  ROOT,
  "content/knowledge/articles/bts-skytrain-overview.json",
);
writeJson(articlePath, article);

// Index stub (content only — no UI wiring)
const indexPath = join(ROOT, "content/knowledge/articles/INDEX.json");
let index = { version: 1, updated_at: DAY, articles: [] };
if (existsSync(indexPath)) {
  try {
    index = readJson(indexPath);
  } catch {
    /* keep default */
  }
}
index.updated_at = DAY;
index.articles = [
  ...(index.articles || []).filter((a) => a.slug !== article.slug),
  {
    slug: article.slug,
    path: "content/knowledge/articles/bts-skytrain-overview.json",
    verified_at: VERIFIED_AT,
    title: article.title,
  },
];
writeJson(indexPath, index);

const knowledgeReadme = join(ROOT, "content/knowledge/README.md");
if (!existsSync(dirname(knowledgeReadme))) {
  mkdirSync(dirname(knowledgeReadme), { recursive: true });
}
writeFileSync(
  knowledgeReadme,
  `# Knowledge

Phase 12 Daily Content Factory stores official-source knowledge articles under \`articles/\`.

| File | Purpose |
|------|---------|
| \`articles/*.json\` | Sourced knowledge notes (EN/ZH/TH) with \`field_evidence\` |
| \`articles/INDEX.json\` | Manifest of published article slugs |

Rules: official operator / government / developer sources only; no fabrication; verification timestamps required.
`,
);

// ——— Reports + snapshot ———
const snapshot = {
  phase: "12-daily",
  day: DAY,
  verified_at: VERIFIED_AT,
  policy: "official_sources_only",
  quota: {
    developer: "frasers-property-thailand",
    projects: ["samyan-mitrtown", "one-bangkok"],
    district: "dusit",
    knowledge_article: "bts-skytrain-overview",
  },
  scores: {
    developer_field_evidence_official: {
      before: beforeDevOfficial,
      after: afterDevOfficial,
    },
    samyan_mitrtown_pct: { before: samyanBefore, after: samyanAfter },
    one_bangkok_pct: { before: oneBefore, after: oneAfter },
  },
  sources_used: [
    FRASERS_CONTACT,
    FRASERS_HOME,
    SET_FPT,
    SAMYAN,
    ONEBKK,
    BMA,
    SSRU,
    VAJIRA,
    BTS,
  ],
  skips: [
    {
      item: "capitaland-thailand / ascott-embassy-sathorn",
      reason:
        "capitaland.com/th/* soft-lands to 404; Ascott brand URLs 403/404 — deferred.",
    },
    {
      item: "land-and-houses THE ROOM project detail metrics",
      reason:
        "lh.co.th project URLs return thin SPA shells (title/OG = LH generic; localhost OG image) without publishable unit/floor facts.",
    },
    {
      item: "dusit transit stations / parks",
      reason:
        "No official station or park-authority list captured this day; emptied wiki-only POIs rather than fabricate.",
    },
  ],
};

writeJson(join(OUT, `${DAY}_snapshot.json`), snapshot);

const report = `# DAILY_CONTENT_REPORT

**Milestone:** Phase 12 — Daily Content Factory  
**Day:** ${DAY}  
**Policy:** Official sources only · evidence + provenance + verification timestamp  
**Script:** \`scripts/phase12-daily-content-2026-07-16.mjs\`  
**Snapshot:** \`pipelines/factory/daily-content/${DAY}_snapshot.json\`

## Quota completion

| Slot | Target | Result |
|------|--------|--------|
| 1 Developer | Frasers Property Thailand | **Done** — contact page, SET establish year 1990, HQ + social refreshed |
| 2 Projects | Samyan Mitrtown · One Bangkok | **Done** — Samyan ${samyanBefore}% → **${samyanAfter}%**; One Bangkok ${oneBefore}% → **${oneAfter}%** |
| 1 District | Dusit | **Done** — BMA + SSRU + Vajira official; wiki-only POIs removed |
| 1 Knowledge article | \`bts-skytrain-overview\` | **Done** — from bts.co.th homepage only |

## Developer — \`frasers-property-thailand\`

| Field | Class | Source |
|-------|-------|--------|
| headquarters | OFFICIAL | ${FRASERS_CONTACT} (+ SET confirm) |
| established_year | OFFICIAL | ${SET_FPT} → **1990** |
| official_contact_page | OFFICIAL | ${FRASERS_CONTACT} |
| company_profile / overview | OFFICIAL | home + SET + contact |
| official_social_links | OFFICIAL | contact-page JSON-LD sameAs + Thailand Facebook |
| listed_company_code | OFFICIAL | SET:FPT |

Official \`field_evidence\` count: **${beforeDevOfficial} → ${afterDevOfficial}**

## Projects

### \`samyan-mitrtown\` (${samyanBefore}% → ${samyanAfter}%)

- Official site recovered: **${SAMYAN}** (prior non-hyphen domain failed in Wave 2).
- OFFICIAL: project page, address (\`${samyanAddress}\`), gallery CDN still, facilities (Office Tower / Townhall / B1–5 directory), operating status.
- UNVERIFIED (documented): brochure PDF, unit floor plans, building_count, floor_count, total_units, completion_year.

### \`one-bangkok\` (${oneBefore}% → ${oneAfter}%)

- Re-verified ${ONEBKK}.
- Upgraded **official_gallery** via \`en.thumb.800.480.png\` on official domain; address contact block re-stamped.

## District — \`dusit\`

- Sources limited to **BMA**, **SSRU** (\`${SSRU}\`), **Vajira** (\`${VAJIRA}\`).
- Removed Wikipedia-only shopping/parks/veterinary entries.
- Transit left empty (no official Dusit station list in today’s BTS homepage capture).

## Knowledge — \`bts-skytrain-overview\`

- Path: \`content/knowledge/articles/bts-skytrain-overview.json\`
- OFFICIAL phones: 0 2617 6000, 0 2617 7341
- OFFICIAL network labels observed on homepage: Sukhumvit, Silom, Gold, Yellow, Pink, BRT Sathorn
- No invented fares, station counts, or ridership.

## Skips (documented)

${snapshot.skips.map((s) => `- **${s.item}:** ${s.reason}`).join("\n")}

## Stop condition

Daily quota filled. No UI / feature / deploy changes. Waiting for next daily run.
`;

writeFileSync(join(ROOT, "DAILY_CONTENT_REPORT.md"), report);

console.log(
  JSON.stringify(
    {
      ok: true,
      day: DAY,
      developer_official: [beforeDevOfficial, afterDevOfficial],
      samyan: [samyanBefore, samyanAfter],
      one_bangkok: [oneBefore, oneAfter],
      article: article.slug,
    },
    null,
    2,
  ),
);
