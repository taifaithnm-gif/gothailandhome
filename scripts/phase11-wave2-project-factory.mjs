#!/usr/bin/env node
/**
 * Phase 11 Project Factory Wave 2
 * Developers: AssetWise → Origin → SC Asset → Frasers → Land & Houses → Major
 * Official pages only. Unknown remains UNVERIFIED. No invention.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const PHASE = "11-wave-2";

const FIELDS = [
  "official_gallery",
  "official_brochure",
  "official_floor_plan",
  "official_facilities",
  "official_address",
  "project_status",
  "completion_year",
  "building_count",
  "floor_count",
  "total_units",
];

/** Curated OFFICIAL facts — only values confirmed on official project pages. */
const EXTRACTED = {
  // —— AssetWise ——
  "modiz-rhyme-ramkhamhaeng": {
    developer: "assetwise",
    official_url: "https://assetwise.co.th/en/condominium/modiz-rhyme/",
    official_name: "Modiz Rhyme Ramkhamhaeng",
    address: "Ramkhamhaeng Road, Bangkok",
    status: "ready_to_move",
    mapped_status: "completed",
    buildings: 1,
    floors: 30,
    units: 546,
    facilities: [
      "Haven Lounge",
      "Fitness",
      "Swimming Pool",
      "Co-working",
      "Garden",
    ],
    gallery_urls: [],
    brochure_url:
      "https://cdn.assetwise.co.th/wp-content/uploads/2023/10/Page-Modiz-Rhyme-Brochure.pdf",
    has_gallery: true,
    has_floor_plan: true,
    has_brochure: true,
    completion_year: null,
    note: "Wave 2 re-verify: completion year still not stated as a clear year on official page (prior Batch 6 retained).",
  },
  "kave-town-space": {
    developer: "assetwise",
    official_url: null,
    official_name: "KAVE Town Space",
    note: "No dedicated AssetWise project page (404). Not equated to KAVE Town Island/Colony.",
  },

  // —— Origin ——
  "knightsbridge-prime-sathorn": {
    developer: "origin-property",
    official_url:
      "https://en.origin.co.th/condominium/knightsbridge-prime-sathorn/",
    official_name: "KnightsBridge Prime Sathorn",
    address:
      "Near Sathorn Road / BRT Arkarn Song-Khro, Bangkok (450m from Sathorn Road; 650m from BTS Chong Nonsi)",
    status: "ready_to_move",
    mapped_status: "completed",
    buildings: 1,
    floors: 43,
    units: 726,
    facilities: [
      "Lobby",
      "Mailbox",
      "Swimming Pool",
      "Fitness room",
      "Library room",
      "Jogging Track",
      "Green Park",
      "Auto-parking 70%",
      "24hours CCTV",
      "Key card access control",
      "24hours security guard",
    ],
    gallery_urls: [
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541692-1-2.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541701-1-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541711-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541721-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541730-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541745-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541759-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541768-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541778-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541788-1-1.jpg",
      "https://en.origin.co.th/wp-content/uploads/2019/04/1474541797-1.jpg",
    ],
    brochure_url:
      "https://en.origin.co.th/wp-content/uploads/2019/04/KNB-Prime-Sathorn-A4-.pdf",
    has_gallery: true,
    has_floor_plan: true,
    has_brochure: true,
    completion_year: null,
    note: "FACTSHEET: 1 high-rise (43 floors), 726 units. Overview 100%. Completion year not stated.",
  },
  "knightbridge-collage-ramkhamhaeng": {
    developer: "origin-property",
    official_url:
      "https://origin.co.th/condominium/knightsbridge-collage-ramkhamhaeng/",
    official_name: "KnightsBridge Collage Ramkhamhaeng",
    address: "Ramkhamhaeng area, Bangkok (near MRT Hua Mak / Yellow Line Lam Sali)",
    status: "ready_to_move",
    mapped_status: "completed",
    buildings: 1,
    floors: 25,
    units: 682,
    facilities: [
      "Lobby",
      "Mailbox",
      "Co-working space & Library",
      "Co-kitchen & Co-pantry space",
      "Pool in the park",
      "Health Club",
      "Sky Jogging Track",
      "Access Card Control",
      "CCTV 24 hours",
      "24-hour security",
    ],
    gallery_urls: [
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2667.jpg",
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2696.jpg",
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2702.jpg",
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2758.jpg",
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2762.jpg",
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2808-1.jpg",
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2801.jpg",
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2793-retouch.jpg",
      "https://origin.co.th/wp-content/uploads/2019/04/DSC2787.jpg",
    ],
    brochure_url:
      "https://origin.co.th/wp-content/uploads/2019/04/E-Brochure-KNB-Collage-RamKhamhaeng-small.pdf",
    has_gallery: true,
    has_floor_plan: true,
    has_brochure: true,
    completion_year: null,
    note: "Official Thai page: อาคาร 25 ชั้น 1 อาคาร / 682 ยูนิต. Unit plan section present. Completion year not stated.",
  },
  "origin-plug-play-sukhumvit-101": {
    developer: "origin-property",
    official_url: null,
    official_name: "Origin Plug & Play Sukhumvit 101",
    note: "No Origin official project page for Sukhumvit 101 Plug & Play (404). Brand has other Plug & Play sites (e.g. Ramkhamhaeng) — not substituted.",
  },

  // —— SC Asset catalog slots / Singha Estate official project pages for THE ESSE ——
  // Catalog developer_slug remains sc-asset; provenance URL is Singha Estate residential (actual official publisher).
  "the-esse-asoke": {
    developer: "sc-asset",
    official_url:
      "https://residential.singhaestate.co.th/en/condominium/the-esse/asoke",
    official_publisher: "singha-estate",
    official_name: "THE ESSE Asoke",
    address: "Asoke Montri Road / Sukhumvit, Bangkok (prime Asoke plot)",
    status: "sold_out",
    mapped_status: "completed",
    buildings: 1,
    floors: 55,
    units: 419,
    facilities: [
      "Amenities (official Amenities section)",
      "Services (official Services section)",
      "Gallery facilities visuals",
    ],
    gallery_urls: [],
    brochure_url: null,
    has_gallery: true,
    has_floor_plan: true,
    has_brochure: false,
    completion_year: null,
    note: "Singha Estate official residential page: 55-storey, 419 units. Sold Out on brand index. Catalog lists sc-asset — publisher conflict noted; facts from Singha official project page only. Completion year / brochure PDF URL not captured.",
  },
  "the-esse-sukhumvit-36": {
    developer: "sc-asset",
    official_url:
      "https://residential.singhaestate.co.th/en/condominium/the-esse/sukhumvit36",
    official_publisher: "singha-estate",
    official_name: "THE ESSE Sukhumvit 36",
    address:
      "Sukhumvit Road, Bangkok — 20 meters from BTS Thonglor Station",
    status: "ready_to_move",
    mapped_status: "completed",
    buildings: 1,
    floors: 43,
    units: 338,
    facilities: [
      "Amenities (official Amenities section)",
      "Services (official Services section)",
    ],
    gallery_urls: [],
    brochure_url: null,
    has_gallery: true,
    has_floor_plan: true,
    has_brochure: true,
    completion_year: null,
    note: "Singha Estate official: 43-storey, 338 units. Download Brochure control present (no direct PDF URL captured). Completion year not stated on Project Details.",
  },
  "vyva-thonglor": {
    developer: "sc-asset",
    official_url: null,
    official_name: "Vyva Thonglor",
    note: "No dedicated official SC Asset / brand project page found for Vyva Thonglor.",
  },

  // —— Frasers ——
  "one-bangkok": {
    developer: "frasers-property-thailand",
    official_url: "https://www.onebangkok.com/en/",
    secondary_url: "https://www.frasersproperty.com/th/one-bangkok",
    official_name: "One Bangkok",
    address:
      "Wireless Road, Lumphini, Pathum Wan, Bangkok 10330 (corner of Wireless and Rama 4 Roads)",
    status: "selling",
    mapped_status: "under_construction",
    buildings: 3,
    floors: null,
    units: null,
    facilities: [
      "Retail destinations",
      "Premium office towers",
      "Luxury and lifestyle hotels",
      "Upscale residential towers",
      "Arts and culture",
      "Public realm / green space",
    ],
    gallery_urls: [],
    brochure_url: null,
    has_gallery: false,
    has_floor_plan: false,
    has_brochure: false,
    completion_year: null,
    note: "District master plan: three upscale residential towers (Frasers / One Bangkok official). Per-tower floor/unit totals and completion year not published as a single condo factsheet. Residences pages (ONE89 / EI8HTEEN SEVEN) are branded shells without unit totals in Wave 2 capture.",
  },
  "samyan-mitrtown": {
    developer: "frasers-property-thailand",
    official_url: null,
    official_name: "Samyan Mitrtown",
    note: "Prior URL https://www.samyanmitrtown.com/ did not resolve in Wave 2 (connection failure). No replacement official DETAIL page confirmed.",
  },

  // —— Land & Houses ——
  "the-room-sathorn-taksin": {
    developer: "land-and-houses",
    official_url: null,
    candidate_url: "https://www.lh.co.th/en/the-room/the-room-sathorn-taksin",
    official_name: "THE ROOM Sathorn-Taksin",
    note: "Candidate LH URL https://www.lh.co.th/en/the-room/the-room-sathorn-taksin returns HTTP 200 and routes projectSlug, but Project Information is client-fetched / privacy-shell — no OFFICIAL DETAIL facts extractable. Treated as no usable official project page (soft-land). Ten fields UNVERIFIED.",
  },
  "the-room-sukhumvit-62": {
    developer: "land-and-houses",
    official_url: null,
    candidate_url: "https://www.lh.co.th/en/the-room/the-room-sukhumvit-62",
    official_name: "THE ROOM Sukhumvit 62",
    note: "Candidate LH URL https://www.lh.co.th/en/the-room/the-room-sukhumvit-62 returns HTTP 200 but DETAIL payload not extractable (SSR shell). Treated as no usable official project page. Ten fields UNVERIFIED.",
  },

  // —— Major ——
  "m-jive-sathorn-lumphini": {
    developer: "major-development",
    official_url: null,
    official_name: "M Jive Sathorn-Lumphini",
    note: "major.co.th project paths redirect/empty; UAT project pages unreachable. No live official DETAIL page confirmed.",
  },
  "m-silom": {
    developer: "major-development",
    official_url: null,
    official_name: "M Silom",
    note: "No live official Major project DETAIL page confirmed for M Silom.",
  },
  "maestro-03-ratchada-rama-9": {
    developer: "major-development",
    official_url: null,
    official_name: "Maestro 03 Ratchada-Rama 9",
    note: "Historical major.co.th/th/project/maestro03 redirects; no live official DETAIL page confirmed. Portal counts not used.",
  },
};

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

function scoreFe(feMap) {
  let n = 0;
  const detail = {};
  for (const f of FIELDS) {
    const cls = feMap[f]?.evidence_class || "UNVERIFIED";
    detail[f] = cls;
    if (cls === "OFFICIAL") n += 1;
  }
  return { pct: Math.round((n / FIELDS.length) * 1000) / 10, detail, ok: n };
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
        ...payload,
        updated_at: VERIFIED_AT,
        phase: PHASE,
      },
      null,
      2,
    ) + "\n",
  );
}

const projectRows = [];
const byDev = {};

for (const [slug, ex] of Object.entries(EXTRACTED)) {
  const path = join(ROOT, "content/projects", slug, "manifest.json");
  if (!existsSync(path)) {
    console.warn("MISSING package", slug);
    continue;
  }
  const m = JSON.parse(readFileSync(path, "utf8"));
  const p = m.project || {};
  const officialUrl = ex.official_url || null;
  const publisherNote = ex.official_publisher
    ? `Official publisher site: ${ex.official_publisher} (catalog developer_slug=${ex.developer}).`
    : undefined;

  if (officialUrl) {
    p.official_website = officialUrl;
    if (!m.sources) m.sources = [];
    if (!m.sources.some((s) => s.url === officialUrl)) {
      m.sources.unshift({
        type: "official_developer",
        name: `${ex.official_name || slug} official project page`,
        url: officialUrl,
      });
    }
  }

  if (ex.address && officialUrl) {
    p.address = { en: ex.address, zh: ex.address, th: ex.address };
  }
  if (ex.mapped_status) p.construction_status = ex.mapped_status;
  if (ex.units != null) {
    p.total_units = ex.units;
    p.unit_count = ex.units;
  }
  if (ex.floors != null) {
    p.floor_count = ex.floors;
    p.floors = ex.floors;
  }
  if (ex.buildings != null) {
    p.building_count = ex.buildings;
    p.buildings = ex.buildings;
  }
  if (Array.isArray(ex.facilities) && ex.facilities.length && officialUrl) {
    p.facilities = ex.facilities.map((name) => ({
      key: facilityKey(name),
      name: { en: name, zh: name, th: name },
      source: "official_developer",
      source_url: officialUrl,
    }));
  }

  const copyright = `© ${ex.official_publisher || ex.developer} / ${ex.official_name || slug}`;
  const galleryUrls = (ex.gallery_urls || []).filter(Boolean);
  const brochureUrl = ex.brochure_url || null;
  const hasFloor = Boolean(ex.has_floor_plan) && Boolean(officialUrl);
  const hasGallery = Boolean(ex.has_gallery) && Boolean(officialUrl);
  const hasBrochure = Boolean(ex.has_brochure || brochureUrl) && Boolean(officialUrl);

  m.media_library = {
    ...(m.media_library || {}),
    gallery: mediaRecord({
      official_url: officialUrl || m.developer?.website || null,
      copyright_source: copyright,
      download_status: hasGallery
        ? galleryUrls.length
          ? "not_downloaded_pending_license"
          : "official_section_hotlink_pending_license"
        : "unverified_no_official_gallery",
      gallery_image_urls: galleryUrls.length ? galleryUrls : undefined,
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
          download_status: hasBrochure
            ? "official_download_control_pending_license"
            : "unverified_no_official_pdf",
        }),
    floor_plans: mediaRecord({
      official_url: officialUrl,
      copyright_source: copyright,
      download_status: hasFloor
        ? "not_downloaded_pending_license"
        : "unverified_no_official_plans_published",
      rights_note: "hotlink_section",
    }),
  };

  if (hasGallery) {
    upsertMediaAsset(slug, "gallery", {
      official_url: officialUrl,
      download_status: m.media_library.gallery.download_status,
      gallery_image_urls: galleryUrls,
    });
  }
  if (brochureUrl || hasBrochure) {
    upsertMediaAsset(slug, "brochure", {
      official_url: brochureUrl || officialUrl,
      download_status: m.media_library.brochure.download_status,
    });
  }
  if (hasFloor) {
    upsertMediaAsset(slug, "floor_plans", {
      official_url: officialUrl,
      download_status: "not_downloaded_pending_license",
    });
  }

  const note = [ex.note, publisherNote].filter(Boolean).join(" ");

  const field_evidence = {
    ...(m.field_evidence || {}),
    official_project_page: fe(
      "official_project_page",
      officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      officialUrl,
      note,
    ),
    official_gallery: fe(
      "official_gallery",
      hasGallery ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      hasGallery
        ? galleryUrls.length
          ? `${galleryUrls.length} gallery URLs (hotlink)`
          : "Official gallery section present"
        : undefined,
      note,
    ),
    official_brochure: fe(
      "official_brochure",
      hasBrochure ? "OFFICIAL" : "UNVERIFIED",
      brochureUrl || officialUrl,
      brochureUrl || (hasBrochure ? "Download Brochure control on official page" : undefined),
      note,
    ),
    official_floor_plan: fe(
      "official_floor_plan",
      hasFloor ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      hasFloor ? "Official floor / unit plan section" : undefined,
      note,
    ),
    official_facilities: fe(
      "official_facilities",
      Array.isArray(ex.facilities) && ex.facilities.length && officialUrl
        ? "OFFICIAL"
        : "UNVERIFIED",
      officialUrl,
      ex.facilities,
      note,
    ),
    official_address: fe(
      "official_address",
      ex.address && officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      ex.address,
      note,
    ),
    project_status: fe(
      "project_status",
      ex.status && officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      ex.mapped_status || ex.status,
      note,
    ),
    completion_year: fe(
      "completion_year",
      ex.completion_year != null && officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      ex.completion_year ?? undefined,
      note || "Completion year not clearly published on official page",
    ),
    building_count: fe(
      "building_count",
      ex.buildings != null && officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      ex.buildings ?? undefined,
      note,
    ),
    floor_count: fe(
      "floor_count",
      ex.floors != null && officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      ex.floors ?? undefined,
      note,
    ),
    total_units: fe(
      "total_units",
      ex.units != null && officialUrl ? "OFFICIAL" : "UNVERIFIED",
      officialUrl,
      ex.units ?? undefined,
      note,
    ),
  };

  m.field_evidence = field_evidence;
  m.project = p;
  m.project_factory = {
    ...(m.project_factory || {}),
    phase: PHASE,
    verified_at: VERIFIED_AT,
    wave: 2,
    developer: ex.developer,
  };
  writeFileSync(path, JSON.stringify(m, null, 2) + "\n");

  const scored = scoreFe(field_evidence);
  const row = {
    slug,
    developer: ex.developer,
    official_url: officialUrl,
    completeness_pct: scored.pct,
    field_evidence: scored.detail,
    note: ex.note || null,
    official_publisher: ex.official_publisher || null,
  };
  projectRows.push(row);
  byDev[ex.developer] ||= [];
  byDev[ex.developer].push(row);
  console.log(
    `${scored.pct}%`.padStart(5),
    slug,
    officialUrl ? "← official" : "← none",
  );
}

const order = [
  "assetwise",
  "origin-property",
  "sc-asset",
  "frasers-property-thailand",
  "land-and-houses",
  "major-development",
];

const summary = {
  phase: PHASE,
  verified_at: VERIFIED_AT,
  objective: "Raise project completeness from Wave 1 mean 54.5% toward 80%",
  project_count: projectRows.length,
  wave2_mean_pct:
    Math.round(
      (projectRows.reduce((a, r) => a + r.completeness_pct, 0) /
        projectRows.length) *
        10,
    ) / 10,
  by_developer: Object.fromEntries(
    order.map((d) => {
      const list = byDev[d] || [];
      const avg = list.length
        ? Math.round(
            (list.reduce((a, r) => a + r.completeness_pct, 0) / list.length) *
              10,
          ) / 10
        : 0;
      return [d, { avg_pct: avg, projects: list }];
    }),
  ),
  projects: projectRows,
};

mkdirSync(join(ROOT, "pipelines/factory/content-factory"), { recursive: true });
writeFileSync(
  join(ROOT, "pipelines/factory/content-factory/wave2_extracted.json"),
  JSON.stringify(EXTRACTED, null, 2) + "\n",
);
writeFileSync(
  join(ROOT, "pipelines/factory/content-factory/wave2_snapshot.json"),
  JSON.stringify(summary, null, 2) + "\n",
);

console.log("\nWave 2 mean:", summary.wave2_mean_pct);
for (const d of order) {
  console.log(d, summary.by_developer[d].avg_pct);
}
