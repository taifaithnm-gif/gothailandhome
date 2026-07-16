#!/usr/bin/env node
/**
 * Phase 10 Sprint 3 — Project Official Completion (content + matrix only).
 * Upgrades only when official project-page evidence is confirmed. Never invents media.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";

/** Curated official project-specific URLs confirmed 2026-07-16 (developer domains). */
const OFFICIAL_PROJECT_URLS = {
  "ashton-asoke": "https://www.ananda.co.th/en/condominium/ashton-asoke",
  "ideo-q-sukhumvit-36":
    "https://www.ananda.co.th/en/condominium/ideo-q-sukhumvit-36",
  "ideo-mobi-sukhumvit-66":
    "https://www.ananda.co.th/en/condominium/ideo-mobi-sukhumvit-66",
  "life-asoke-rama-9": "https://www.apthai.com/en/condominium/life-asoke-rama-9",
  "life-ladprao": "https://www.apthai.com/en/condominium/life-ladprao",
  "life-one-wireless":
    "https://www.apthai.com/en/condominium/life-one-wireless",
  "rhythm-ekkamai":
    "https://www.apthai.com/en/condominium/rhythm-ekkamai-estate",
  "noble-around-ari": "https://www.noblehome.com/en/condominium/around-ari",
  "supalai-oriental-sukhumvit-39":
    "https://www.supalai.com/en/project/condo/supalai-oriental-sukhumvit-39",
  "xt-phayathai": "https://www.sansiri.com/hotdeal/project/xt-phayathai",
  "the-forestias": "https://www.theforestias.com/",
  "one-bangkok": "https://www.onebangkok.com/en/",
  "the-livin-ramkhamhaeng": "https://www.livinram.com/en",
};

/** Street addresses confirmed on official project pages (not invented). */
const OFFICIAL_ADDRESSES = {
  "noble-around-ari": {
    en: "308/1 Phahonyothin Road, Samsen Nai, Phaya Thai, Bangkok 10400",
    zh: "308/1 Phahonyothin Road, Samsen Nai, Phaya Thai, Bangkok 10400",
    th: "308/1 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400",
    url: "https://www.noblehome.com/en/condominium/around-ari",
  },
};

/** Facilities confirmed listed on official project pages. */
const OFFICIAL_FACILITIES = {
  "supalai-oriental-sukhumvit-39": {
    url: "https://www.supalai.com/en/project/condo/supalai-oriental-sukhumvit-39",
    items: [
      { key: "swimming_pool", en: "Swimming Pool" },
      { key: "fitness", en: "Fitness" },
      { key: "sky_lounge", en: "Sky lounge" },
      { key: "coworking", en: "Co-working space" },
      { key: "garden", en: "Garden / Park" },
      { key: "kids_room", en: "Kid’s Room" },
      { key: "sauna", en: "Sauna" },
      { key: "security", en: "24-hour Security" },
    ],
  },
  "noble-around-ari": {
    url: "https://www.noblehome.com/en/condominium/around-ari",
    items: [
      { key: "lobby_x", en: "LOBBY-X & The Mezzanine Library" },
      { key: "around_garden", en: "Around Garden" },
      { key: "dimensional_pool", en: "Dimensional Pool & Horizontal Gym" },
      { key: "uptown_sky_lounge", en: "Uptown Sky Lounge" },
      { key: "ari_cloud_forest", en: "Ari Cloud Forest" },
    ],
  },
};

async function urlOk(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "GoThailandHomeCredibilityBot/1.0" },
    });
    if (res.ok) return true;
    const res2 = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "GoThailandHomeCredibilityBot/1.0" },
    });
    return res2.ok;
  } catch {
    return false;
  }
}

const matrixPath = join(
  ROOT,
  "pipelines/factory/project-master/completeness_matrix.json",
);
const indexPath = join(
  ROOT,
  "pipelines/factory/project-master/official_source_index.json",
);
const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
const index = JSON.parse(readFileSync(indexPath, "utf8"));
const indexBySlug = Object.fromEntries(index.map((r) => [r.slug, r]));

const projectDir = join(ROOT, "content/projects");
const slugs = readdirSync(projectDir).filter((d) =>
  existsSync(join(projectDir, d, "manifest.json")),
);

const snapshot = [];
let urlUpgrades = 0;
let addressUpgrades = 0;
let facilityUpgrades = 0;

for (const slug of slugs) {
  const manifestPath = join(projectDir, slug, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const row = matrix.projects.find((p) => p.slug === slug);
  if (!row) continue;

  const candidate = OFFICIAL_PROJECT_URLS[slug];
  let officialUrl =
    manifest.project?.official_website ||
    indexBySlug[slug]?.official_project_url ||
    null;

  if (candidate) {
    const ok = await urlOk(candidate);
    console.error(`${slug}: probe ${ok ? "OK" : "FAIL"} ${candidate}`);
    if (ok) {
      officialUrl = candidate;
      if (manifest.project) manifest.project.official_website = candidate;
      // ensure sources include this URL
      const sources = Array.isArray(manifest.sources) ? manifest.sources : [];
      if (!sources.some((s) => s.url === candidate)) {
        sources.unshift({
          type: "official_developer",
          name: `${slug} official project page`,
          url: candidate,
        });
        manifest.sources = sources;
      }
      if (indexBySlug[slug]) {
        indexBySlug[slug].official_project_url = candidate;
        const os = indexBySlug[slug].official_sources || [];
        if (!os.some((s) => s.url === candidate)) {
          os.unshift({
            name: `${slug} official project page`,
            url: candidate,
            type: "official_developer",
          });
          indexBySlug[slug].official_sources = os;
        }
      }
      row.C_official_project_url = "OFFICIAL";
      urlUpgrades += 1;
    }
  }

  if (OFFICIAL_ADDRESSES[slug] && manifest.project) {
    const addr = OFFICIAL_ADDRESSES[slug];
    manifest.project.address = {
      en: addr.en,
      zh: addr.zh,
      th: addr.th,
    };
    row.C_full_address = "OFFICIAL";
    addressUpgrades += 1;
  }

  if (OFFICIAL_FACILITIES[slug] && manifest.project) {
    const fac = OFFICIAL_FACILITIES[slug];
    const mapped = fac.items.map((item) => ({
      key: item.key,
      name: { en: item.en, zh: item.en, th: item.en },
      source: "official_developer",
      source_url: fac.url,
    }));
    manifest.project.facilities_official = mapped;
    // Prefer official list for primary facilities when upgrading.
    manifest.project.facilities = mapped;
    row.C_official_facilities = "OFFICIAL";
    facilityUpgrades += 1;
  }

  // Keep embedded project_master classifications in sync when present.
  if (manifest.project_master?.classifications) {
    const c = manifest.project_master.classifications;
    c.official_project_url = row.C_official_project_url;
    c.full_address = row.C_full_address;
    c.official_facilities = row.C_official_facilities;
    c.official_gallery_source = row.C_official_gallery_source;
    c.official_brochure = row.C_official_brochure;
    c.official_floor_plans = row.C_official_floor_plans;
  }

  // field_evidence from matrix (honest — no invented gallery/brochure/plans)
  const field_evidence = {
    official_project_page: {
      field: "official_project_page",
      evidence_class: row.C_official_project_url,
      provenance: {
        source_type: "official_developer_website",
        url: officialUrl,
      },
      verified_at: VERIFIED_AT,
      value: officialUrl,
    },
    official_address: {
      field: "official_address",
      evidence_class: row.C_full_address,
      provenance: {
        source_type:
          row.C_full_address === "OFFICIAL"
            ? "official_developer_website"
            : row.C_full_address === "VERIFIED_PORTAL"
              ? "verified_portal"
              : "unavailable",
        url:
          OFFICIAL_ADDRESSES[slug]?.url ||
          officialUrl ||
          null,
      },
      verified_at: VERIFIED_AT,
      value: manifest.project?.address?.en || null,
    },
    official_gallery: {
      field: "official_gallery",
      evidence_class: row.C_official_gallery_source,
      provenance: {
        source_type:
          row.C_official_gallery_source === "OFFICIAL"
            ? "official_developer_website"
            : "unavailable",
        url: officialUrl,
      },
      verified_at: VERIFIED_AT,
      value: null,
      note:
        row.C_official_gallery_source === "OFFICIAL"
          ? "Already classified OFFICIAL in project master matrix."
          : "No rights-cleared official gallery harvested this sprint.",
    },
    official_brochure: {
      field: "official_brochure",
      evidence_class: row.C_official_brochure,
      provenance: {
        source_type:
          row.C_official_brochure === "OFFICIAL"
            ? "official_developer_website"
            : "unavailable",
        url: officialUrl,
      },
      verified_at: VERIFIED_AT,
      value: null,
    },
    official_floor_plan: {
      field: "official_floor_plan",
      evidence_class: row.C_official_floor_plans,
      provenance: {
        source_type:
          row.C_official_floor_plans === "OFFICIAL"
            ? "official_developer_website"
            : "unavailable",
        url: officialUrl,
      },
      verified_at: VERIFIED_AT,
      value: null,
    },
    official_facilities: {
      field: "official_facilities",
      evidence_class: row.C_official_facilities,
      provenance: {
        source_type:
          row.C_official_facilities === "OFFICIAL"
            ? "official_developer_website"
            : row.C_official_facilities === "VERIFIED_PORTAL"
              ? "verified_portal"
              : "unavailable",
        url: OFFICIAL_FACILITIES[slug]?.url || officialUrl || null,
      },
      verified_at: VERIFIED_AT,
      value: OFFICIAL_FACILITIES[slug]?.items?.map((i) => i.en) || null,
    },
  };

  manifest.field_evidence = field_evidence;
  manifest.project_master = {
    ...(manifest.project_master || {}),
    phase: "10-sprint-3",
    verified_at: VERIFIED_AT,
    rule: "official_project_pages_only_for_official_field_upgrades",
    sprint: "phase10-sprint-3",
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  // score
  const fields = [
    "official_project_page",
    "official_address",
    "official_gallery",
    "official_brochure",
    "official_floor_plan",
    "official_facilities",
  ];
  let sum = 0;
  for (const f of fields) {
    const cls = field_evidence[f].evidence_class;
    if (cls === "OFFICIAL") sum += 1;
    else if (cls === "VERIFIED_PORTAL") sum += 0.5;
  }
  const pct = Math.round((sum / fields.length) * 1000) / 10;
  snapshot.push({
    slug,
    official_url: officialUrl,
    ...Object.fromEntries(
      fields.map((f) => [f, field_evidence[f].evidence_class]),
    ),
    completeness_pct: pct,
  });
}

writeFileSync(matrixPath, JSON.stringify(matrix, null, 2) + "\n");
writeFileSync(indexPath, JSON.stringify(Object.values(indexBySlug), null, 2) + "\n");

const avg =
  Math.round(
    (snapshot.reduce((a, r) => a + r.completeness_pct, 0) / snapshot.length) *
      10,
  ) / 10;

writeFileSync(
  join(ROOT, "pipelines/factory/project-master/sprint3_field_snapshot.json"),
  JSON.stringify(
    {
      verified_at: VERIFIED_AT,
      avg_completeness_pct: avg,
      url_upgrades: urlUpgrades,
      address_upgrades: addressUpgrades,
      facility_upgrades: facilityUpgrades,
      rows: snapshot.sort(
        (a, b) =>
          b.completeness_pct - a.completeness_pct ||
          a.slug.localeCompare(b.slug),
      ),
    },
    null,
    2,
  ) + "\n",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      n: snapshot.length,
      avg,
      urlUpgrades,
      addressUpgrades,
      facilityUpgrades,
      official_gallery: snapshot.filter((r) => r.official_gallery === "OFFICIAL")
        .length,
      official_brochure: snapshot.filter(
        (r) => r.official_brochure === "OFFICIAL",
      ).length,
    },
    null,
    2,
  ),
);
