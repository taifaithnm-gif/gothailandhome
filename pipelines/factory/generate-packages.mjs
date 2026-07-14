#!/usr/bin/env node
/**
 * Generate Property Factory content packages (districts, developers, projects).
 * Usage: node pipelines/factory/generate-packages.mjs
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { BANGKOK_DISTRICTS, DISTRICT_POIS } from "./lib/bangkok-districts.mjs";
import { DEVELOPERS_W1 } from "./lib/developers-w1.mjs";
import { PROJECTS_W1 } from "./lib/projects-w1.mjs";

const ROOT = resolve(process.cwd());
const COLLECTED = "2026-07-14";

function wikiDistrictUrl(enName) {
  const page = `${enName.replace(/ /g, "_")}_district`;
  return `https://en.wikipedia.org/wiki/${page}`;
}

function buildDistrict(d, nearby) {
  const pois = DISTRICT_POIS[d.slug] || {};
  const wiki = wikiDistrictUrl(d.en);
  return {
    city_slug: "bangkok",
    slug: d.slug,
    name: { en: d.en, zh: d.zh, th: d.th },
    summary: {
      en: `${d.en} is one of the 50 districts (khet) of Bangkok under the Bangkok Metropolitan Administration.`,
      zh: `${d.zh}（${d.en}）为曼谷大都会管理局下辖的50个行政区（เขต）之一。`,
      th: `${d.th} เป็นหนึ่งใน 50 เขตของกรุงเทพมหานครภายใต้การกำกับของกรุงเทพมหานคร`,
    },
    seo: {
      title: {
        en: `${d.en} Bangkok Property | GoThailandHome`,
        zh: `曼谷${d.zh}房产 | GoThailandHome`,
        th: `อสังหาฯ ${d.th} กรุงเทพฯ | GoThailandHome`,
      },
      description: {
        en: `Browse ${d.en} district property pages for Bangkok projects and verified public listings as inventory is imported.`,
        zh: `浏览曼谷${d.zh}区域房产页；项目与公开挂牌随真实导入上线。`,
        th: `ดูหน้าอสังหาฯ เขต${d.th} กรุงเทพฯ โครงการและประกาศจะเพิ่มเมื่อนำเข้าจากแหล่งจริง`,
      },
    },
    publish_ready: true,
    sources: [
      {
        type: "wikipedia",
        name: `Wikipedia — ${d.en} district`,
        url: wiki,
      },
      {
        type: "wikipedia",
        name: "Wikipedia — List of districts of Bangkok",
        url: "https://en.wikipedia.org/wiki/List_of_districts_of_Bangkok",
      },
      {
        type: "bma",
        name: "BMA district GIS portal (50 districts overview)",
        url: "https://district.bangkok.go.th/SEDPortal/50-map-overview/",
      },
    ],
    locale_status: { en: "complete", zh: "complete", th: "complete" },
    metadata: {
      district_code: d.code,
      postal_code: d.postal,
      latitude: d.lat,
      longitude: d.lng,
      khwaeng_count: d.khwaeng,
    },
    transportation: pois.transportation || [],
    schools: pois.schools || [],
    hospitals: pois.hospitals || [],
    shopping: pois.shopping || [],
    investment_summary: {
      en: `${d.en} is an administrative district of Bangkok. This package does not include rental yields, price indices, or inventory counts — those require separately sourced market data.`,
      zh: `${d.zh}为曼谷行政区。本数据包不含租金收益率、价格指数或库存数量——该类指标需另行引用可核对的市场来源。`,
      th: `${d.th}เป็นเขตการปกครองของกรุงเทพฯ แพ็กเกจนี้ไม่มีตัวเลขผลตอบแทนค่าเช่า ดัชนีราคา หรือจำนวนสินค้าคงคลัง — ต้องอ้างอิงแหล่งข้อมูลตลาดที่ตรวจสอบได้แยกต่างหาก`,
    },
    nearby_projects: nearby,
  };
}

function buildDeveloper(dev, projectSlugs) {
  const sources = [
    {
      type: "official_developer",
      name: `${dev.name.en} official website`,
      url: dev.website,
    },
  ];
  if (dev.facebook_url) {
    sources.push({
      type: "facebook",
      name: `${dev.name.en} Facebook`,
      url: dev.facebook_url,
    });
  }
  return {
    slug: dev.slug,
    collected_at: COLLECTED,
    publish_ready: true,
    sources,
    name: dev.name,
    legal_name: dev.legal_name,
    description: {
      en: `${dev.name.en} is a Thailand property developer. Profile fields are taken from the official website listed in sources.`,
      zh: `${dev.name.zh}为泰国房地产开发商。简介字段来自 sources 所列官方网站。`,
      th: `${dev.name.th} เป็นผู้พัฒนาอสังหาริมทรัพย์ในประเทศไทย ข้อมูลโปรไฟล์อ้างอิงจากเว็บไซต์ทางการใน sources`,
    },
    website: dev.website,
    facebook_url: dev.facebook_url,
    google_maps_url: null,
    logo_url: null,
    phone: null,
    email: null,
    seo: {
      title: {
        en: `${dev.name.en} Developer | GoThailandHome`,
        zh: `${dev.name.zh}开发商 | GoThailandHome`,
        th: `ผู้พัฒนา ${dev.name.th} | GoThailandHome`,
      },
      description: {
        en: `Developer profile for ${dev.name.en} and linked Bangkok projects on GoThailandHome.`,
        zh: `${dev.name.zh}开发商简介及关联曼谷项目。`,
        th: `โปรไฟล์ผู้พัฒนา ${dev.name.th} และโครงการในกรุงเทพฯ`,
      },
    },
    locale_status: { en: "complete", zh: "complete", th: "complete" },
    project_slugs: projectSlugs,
  };
}

function buildProject(p, developersBySlug) {
  const dev = developersBySlug.get(p.developer);
  const name = { en: p.en, zh: p.zh, th: p.th };
  const districtName = BANGKOK_DISTRICTS.find((d) => d.slug === p.district);
  return {
    slug: p.slug,
    collected_at: COLLECTED,
    publish_ready: true,
    sources: [
      {
        type: "official_developer",
        name: `${p.en} official / developer page`,
        url: p.source,
      },
    ],
    developer: {
      slug: p.developer,
      name: dev?.name || {
        en: p.developer,
        zh: p.developer,
        th: p.developer,
      },
    },
    location: {
      slug: `${p.district}-bangkok`,
      city_slug: "bangkok",
      district_slug: p.district,
      name: {
        en: districtName?.en || p.district,
        zh: districtName?.zh || p.district,
        th: districtName?.th || p.district,
      },
      city: { en: "Bangkok", zh: "曼谷", th: "กรุงเทพมหานคร" },
      province: { en: "Bangkok", zh: "曼谷", th: "กรุงเทพมหานคร" },
      country_code: "TH",
    },
    project: {
      name,
      description: {
        en: `${p.en} is a real Bangkok project associated with ${dev?.name.en || p.developer}. Details beyond name, district, and official URL are omitted until separately sourced.`,
        zh: `${p.zh}为曼谷真实项目，关联开发商 ${dev?.name.zh || p.developer}。除名称、区域与官方 URL 外，其余细节待另行核对来源后再补全。`,
        th: `${p.th} เป็นโครงการจริงในกรุงเทพฯ ที่เชื่อมกับผู้พัฒนา ${dev?.name.th || p.developer} รายละเอียดนอกเหนือชื่อ เขต และ URL ทางการจะเพิ่มเมื่อมีแหล่งอ้างอิง`,
      },
      address: {
        en: `${districtName?.en || p.district}, Bangkok`,
        zh: `曼谷${districtName?.zh || p.district}`,
        th: `${districtName?.th || p.district} กรุงเทพฯ`,
      },
      postal_code: districtName?.postal || null,
      latitude: p.lat ?? null,
      longitude: p.lng ?? null,
      google_maps_url: null,
      official_website: p.website,
      facebook_url: null,
      completion_year: null,
      transit_tags: p.transit || [],
      seo: {
        title: {
          en: `${p.en} Condo in ${districtName?.en || p.district}, Bangkok | GoThailandHome`,
          zh: `${p.zh}｜曼谷${districtName?.zh || p.district} | GoThailandHome`,
          th: `${p.th} เขต${districtName?.th || p.district} กรุงเทพฯ | GoThailandHome`,
        },
        description: {
          en: `Project page for ${p.en} in ${districtName?.en || p.district}, Bangkok. Sourced from the developer official site.`,
          zh: `${p.zh}项目页（曼谷${districtName?.zh || p.district}），来源为开发商官方站点。`,
          th: `หน้าโครงการ ${p.th} เขต${districtName?.th || p.district} อ้างอิงเว็บไซต์ทางการของผู้พัฒนา`,
        },
      },
    },
  };
}

function main() {
  if (PROJECTS_W1.length !== 50) {
    console.error(`Expected 50 projects, got ${PROJECTS_W1.length}`);
    process.exit(1);
  }
  if (DEVELOPERS_W1.length !== 20) {
    console.error(`Expected 20 developers, got ${DEVELOPERS_W1.length}`);
    process.exit(1);
  }
  if (BANGKOK_DISTRICTS.length !== 50) {
    console.error(`Expected 50 districts, got ${BANGKOK_DISTRICTS.length}`);
    process.exit(1);
  }

  const projectsByDistrict = new Map();
  for (const p of PROJECTS_W1) {
    if (!projectsByDistrict.has(p.district))
      projectsByDistrict.set(p.district, []);
    projectsByDistrict.get(p.district).push(p.slug);
  }

  const districtDir = join(ROOT, "content/areas/bangkok/districts");
  mkdirSync(districtDir, { recursive: true });
  for (const d of BANGKOK_DISTRICTS) {
    const pkg = buildDistrict(d, projectsByDistrict.get(d.slug) || []);
    writeFileSync(
      join(districtDir, `${d.slug}.json`),
      JSON.stringify(pkg, null, 2) + "\n",
    );
  }

  const developersBySlug = new Map(DEVELOPERS_W1.map((d) => [d.slug, d]));
  const projectsByDev = new Map();
  for (const p of PROJECTS_W1) {
    if (!projectsByDev.has(p.developer)) projectsByDev.set(p.developer, []);
    projectsByDev.get(p.developer).push(p.slug);
  }

  for (const dev of DEVELOPERS_W1) {
    const dir = join(ROOT, "content/developers", dev.slug);
    mkdirSync(dir, { recursive: true });
    const manifest = buildDeveloper(dev, projectsByDev.get(dev.slug) || []);
    writeFileSync(
      join(dir, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
  }

  for (const p of PROJECTS_W1) {
    const dir = join(ROOT, "content/projects", p.slug);
    mkdirSync(dir, { recursive: true });
    // Preserve existing Livin package if richer specimen exists
    if (
      p.slug === "the-livin-ramkhamhaeng" &&
      existsSync(join(dir, "manifest.json"))
    ) {
      const existing = JSON.parse(
        readFileSync(join(dir, "manifest.json"), "utf8"),
      );
      if (!existing.location?.city_slug) {
        existing.location = existing.location || {};
        existing.location.city_slug = "bangkok";
        existing.location.district_slug = "bang-kapi";
      }
      existing.publish_ready = true;
      writeFileSync(
        join(dir, "manifest.json"),
        JSON.stringify(existing, null, 2) + "\n",
      );
      continue;
    }
    const manifest = buildProject(p, developersBySlug);
    writeFileSync(
      join(dir, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
  }

  // Glossary
  const glossaryDir = join(ROOT, "content/glossary");
  mkdirSync(glossaryDir, { recursive: true });
  writeFileSync(
    join(glossaryDir, "districts-bangkok.json"),
    JSON.stringify(
      {
        city_slug: "bangkok",
        collected_at: COLLECTED,
        source: "https://en.wikipedia.org/wiki/List_of_districts_of_Bangkok",
        districts: BANGKOK_DISTRICTS.map((d) => ({
          slug: d.slug,
          name: { en: d.en, zh: d.zh, th: d.th },
          postal_code: d.postal,
          district_code: d.code,
        })),
      },
      null,
      2,
    ) + "\n",
  );

  writeFileSync(
    join(glossaryDir, "terms.json"),
    JSON.stringify(
      {
        transit_tags: [
          "bts",
          "mrt",
          "mrt-orange",
          "mrt-yellow",
          "mrt-blue",
          "mrt-purple",
          "mrt-pink",
          "arl",
          "boat",
          "expressway",
        ],
        source_codes: [
          "propertyhub",
          "ddproperty",
          "livinginsider",
          "fazwaz",
          "official_developer",
          "facebook",
          "google_maps",
          "wikipedia",
          "bma",
        ],
      },
      null,
      2,
    ) + "\n",
  );

  writeFileSync(
    join(ROOT, "content/taxonomy/property-types.json"),
    JSON.stringify(
      {
        property_types: ["condo", "house", "villa", "land", "commercial"],
        listing_types: ["sale", "rent"],
      },
      null,
      2,
    ) + "\n",
  );

  console.log(
    JSON.stringify(
      {
        districts: BANGKOK_DISTRICTS.length,
        developers: DEVELOPERS_W1.length,
        projects: PROJECTS_W1.length,
      },
      null,
      2,
    ),
  );
}

main();
