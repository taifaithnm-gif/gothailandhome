#!/usr/bin/env node
/**
 * Bangkok M2 wave harvest from PropertyHub (public pages → DATA_STANDARD DTOs).
 * Usage:
 *   node pipelines/factory/harvest-propertyhub-wave1.mjs [--projects=N] [--per-type=N] [--dry-run]
 *
 * Respects: no fabrication — only fields present on PropertyHub __NEXT_DATA__.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const TODAY = new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipExisting = args.includes("--skip-existing");
const onlyArg = args.find((a) => a.startsWith("--only="));
const onlySet = onlyArg
  ? new Set(onlyArg.split("=")[1].split(",").filter(Boolean))
  : null;
const perType = Number(
  (args.find((a) => a.startsWith("--per-type=")) || "--per-type=5").split("=")[1],
);
const projectLimit = Number(
  (
    args.find((a) => a.startsWith("--projects=")) || "--projects=50"
  ).split("=")[1],
);

const UA =
  "Mozilla/5.0 (compatible; GoThailandHomeFactory/1.0; +https://gothailandhome.com)";

const PRIORITY_DISTRICTS = new Set([
  "watthana",
  "huai-khwang",
  "din-daeng",
  "bang-kapi",
  "khlong-toei",
  "phaya-thai",
  "ratchathewi",
  "phra-khanong",
  "suan-luang",
  "bang-na",
  "sathon",
  "bang-rak",
  "pathum-wan",
  "chatuchak",
  "lat-phrao",
]);

/** Known PropertyHub slug overrides when our package slug differs. */
const PH_SLUG_OVERRIDE = {
  "xt-huai-khwang": "xt-huaikwang",
  "xt-phayathai": "xt-phayathai",
  "condo-u-sukhumvit-62-1": "condo-u-sukhumvit-62",
  "the-room-sukhumvit-62": "the-room-sukhumvit-62",
  "the-room-sathorn-taksin": "the-room-sathorn-taksin",
  "knightsbridge-prime-sathorn": "knightsbridge-prime-sathorn",
  "knightbridge-collage-ramkhamhaeng": "knightbridge-collage-ramkhamhaeng",
  "origin-plug-play-sukhumvit-101": "origin-plug-play-project-sukhumvit-101",
  "lumpini-ville-phahol-saphanmai": "lumpini-ville-phahol-saphanmai",
  "ascott-embassy-sathorn": "ascott-embassy-sathorn",
  "one-bangkok": "one-bangkok",
  "samyan-mitrtown": "samyan-mitrtown",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) return { ok: false, status: res.status, text: "" };
  return { ok: true, status: res.status, text: await res.text(), finalUrl: res.url };
}

function extractNextData(html) {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s,
  );
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function extractListingHrefs(html) {
  const set = new Set();
  const re = /href="(\/en\/listings\/[^"#?\s]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    set.add(m[1]);
  }
  return [...set];
}

function i18nTriple(en, zh = "", th = "") {
  return {
    en: en || "",
    zh: zh || en || "",
    th: th || en || "",
  };
}

function facilityList(facilities = {}) {
  const map = {
    pool: "Swimming pool",
    fitness: "Fitness / gym",
    parking: "Parking",
    security: "24h security",
    park: "Garden / courtyard",
    library: "Library",
    sauna: "Sauna",
    steam: "Steam",
    jacuzzi: "Jacuzzi",
    lift: "Elevator",
    cctv: "CCTV",
    keycard: "Keycard access",
    motorcycleParking: "Motorcycle parking",
    evCharger: "EV charging",
    meetingRoom: "Meeting room",
    laundry: "Laundry",
  };
  const out = [];
  for (const [k, label] of Object.entries(map)) {
    if (facilities[k]) {
      out.push({
        key: k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
        name: i18nTriple(label),
        source: "propertyhub",
      });
    }
  }
  return out;
}

function zonesToNearby(zones, type) {
  const arr = zones?.[type] || [];
  return arr.slice(0, 8).map((z) => ({
    name: i18nTriple(z.name),
    distance_m: typeof z.distance === "number" ? z.distance : null,
    slug: z.slug || null,
    source: "propertyhub",
  }));
}

function transitTagsFromZones(zones) {
  const tags = new Set();
  for (const z of zones?.MASS_TRANSIT || zones?.TRANSPORT || []) {
    const n = String(z.name || "").toUpperCase();
    if (n.includes("BTS")) tags.add("bts");
    if (n.includes("MRT")) tags.add("mrt");
    if (n.includes("ARL") || n.includes("AIRPORT")) tags.add("arl");
    if (n.includes("YELLOW")) tags.add("mrt-yellow");
    if (n.includes("BLUE")) tags.add("mrt-blue");
    if (n.includes("ORANGE")) tags.add("mrt-orange");
    if (n.includes("PURPLE")) tags.add("mrt-purple");
    if (n.includes("PINK")) tags.add("mrt-pink");
  }
  return [...tags];
}

function mapsUrl(lat, lng) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function listingDto({ listing, href, projectSlug, developerSlug, districtSlug, transitTags }) {
  const id = listing.id;
  const sale = listing.price?.forSale?.price;
  const rentRaw = listing.price?.forRent?.monthly;
  const rent =
    typeof rentRaw === "number"
      ? rentRaw
      : rentRaw && typeof rentRaw === "object"
        ? rentRaw.price
        : null;
  const isSale = listing.postType === "FOR_SALE";
  const price = isSale ? sale : rent;
  if (!(price > 0)) return null;

  const beds = listing.roomInformation?.numberOfBed ?? null;
  const baths = listing.roomInformation?.numberOfBath ?? null;
  const area = listing.roomInformation?.roomArea ?? null;
  const floor = listing.roomInformation?.onFloor ?? null;
  const titleEn = listing.title || `${projectSlug} listing ${id}`;
  const url = `https://propertyhub.in.th${href.startsWith("/") ? href : `/${href}`}`;
  const captured = TODAY;
  const updated = (listing.updatedAt || listing.refreshedAt || "").slice(0, 10) || captured;

  return {
    external_ref: `propertyhub-${id}`,
    listing_type: isSale ? "sale" : "rent",
    property_type: "condo",
    price_thb: price,
    bedrooms: beds,
    bathrooms: baths,
    area_sqm: area,
    floor_label: floor == null ? null : String(floor),
    building_label: listing.roomInformation?.building || null,
    project_slug: projectSlug,
    developer_slug: developerSlug,
    city_slug: "bangkok",
    district_slug: districtSlug,
    transit_tags: transitTags,
    title: i18nTriple(titleEn),
    summary: i18nTriple(
      `${isSale ? "Sale" : "Rent"}: ${beds ?? "?"}BR, ${area ?? "?"} sq.m., ${price.toLocaleString("en-US")} THB. Source PropertyHub #${id}.`,
      `${isSale ? "出售" : "出租"}：${beds ?? "?"}卧，${area ?? "?"}㎡，${price.toLocaleString("en-US")} 泰铢。来源 PropertyHub #${id}。`,
      `${isSale ? "ขาย" : "เช่า"}: ${beds ?? "?"} นอน ${area ?? "?"} ตร.ม. ราคา ${price.toLocaleString("en-US")} บาท (PropertyHub #${id})`,
    ),
    description: i18nTriple(
      `Normalized from PropertyHub listing ${id}. Specs and price from detail __NEXT_DATA__. Availability subject to source page.`,
      `来自 PropertyHub 挂牌 ${id}。规格与价格取自详情页 JSON；是否可售/可租以来源页为准。`,
      `แปลงจากประกาศ PropertyHub ${id} สเปกและราคาจากหน้าต้นทาง สถานะให้ยึดแหล่งต้นทาง`,
    ),
    featured: false,
    source: "propertyhub",
    listing_url: url,
    source_updated_at: updated,
    collected_at: captured,
    source_captured_at: captured,
    verification_status: "verified",
    publish_ready: true,
    latitude: listing.project?.location?.lat ?? null,
    longitude: listing.project?.location?.lng ?? null,
    source_listing_id: String(id),
    normalized_source_url: `https://propertyhub.in.th/en/listings/${id}`,
    source_url_hash: createHash("sha256")
      .update(`https://propertyhub.in.th/en/listings/${id}`)
      .digest("hex"),
    // Identity fingerprint: source + id (never title-only)
    duplicate_fingerprint: createHash("sha256")
      .update(`id|propertyhub|${id}`)
      .digest("hex"),
    soft_match_fingerprint: createHash("sha256")
      .update(
        [
          "soft",
          projectSlug,
          isSale ? "sale" : "rent",
          beds == null ? "" : String(beds),
          area == null ? "" : String(Math.round(Number(area) * 10) / 10),
          floor == null ? "" : String(floor),
        ].join("|"),
      )
      .digest("hex"),
    listing_lifecycle_status: "active",
  };
}

function enrichManifest(manifest, listingSample, phProjectUrl) {
  const p = listingSample.project || {};
  const info = p.projectInfo || {};
  const lat = p.location?.lat ?? null;
  const lng = p.location?.lng ?? null;
  const zones = listingSample.nearbyZones || {};
  const year = info.completedYear && info.completedYear !== "-"
    ? Number(info.completedYear)
    : null;

  if (!manifest.sources) manifest.sources = [];
  if (!manifest.sources.some((s) => s.url === phProjectUrl)) {
    manifest.sources.push({
      type: "propertyhub",
      name: "PropertyHub project page",
      url: phProjectUrl,
    });
  }

  const project = manifest.project || {};
  project.completion_year = project.completion_year || year;
  project.construction_status =
    project.construction_status ||
    (year && year <= new Date().getFullYear() ? "completed" : "unknown");
  if (lat != null && lng != null) {
    project.latitude = lat;
    project.longitude = lng;
    project.google_maps_url =
      project.google_maps_url || mapsUrl(lat, lng);
  }
  if (p.facilities) {
    project.facilities = facilityList(p.facilities);
  }
  const tags = transitTagsFromZones(zones);
  if (tags.length) {
    project.transit_tags = [...new Set([...(project.transit_tags || []), ...tags])];
  }
  project.nearby_schools = zonesToNearby(zones, "SCHOOL");
  project.nearby_hospitals = zonesToNearby(zones, "HOSPITAL");
  project.nearby_malls = zonesToNearby(zones, "SHOPPING");
  project.nearby_shopping = project.nearby_malls;

  // SEO from real name + district (derived metadata, not invented facts)
  const name = project.name || {};
  const district = manifest.location?.name?.en || "Bangkok";
  project.seo = project.seo || {
    title: i18nTriple(
      `${name.en || manifest.slug} Condo in ${district}, Bangkok | GoThailandHome`,
      `${name.zh || name.en || manifest.slug}｜${manifest.location?.name?.zh || "曼谷"} | GoThailandHome`,
      `${name.th || name.en || manifest.slug} ${manifest.location?.name?.th || "กรุงเทพฯ"} | GoThailandHome`,
    ),
    description: i18nTriple(
      `Project page for ${name.en || manifest.slug} in ${district}, Bangkok. Specs enriched from PropertyHub public project data.`,
      `${name.zh || name.en}项目页（${manifest.location?.name?.zh || "曼谷"}），规格来自 PropertyHub 公开项目数据。`,
      `หน้าโครงการ ${name.th || name.en} อ้างอิงข้อมูลสาธารณะ PropertyHub`,
    ),
  };

  // Minimal sourced FAQ (facts already in package / PropertyHub projectInfo only)
  if (!Array.isArray(project.faq) || project.faq.length === 0) {
    const faq = [];
    if (year) {
      faq.push({
        question: i18nTriple(
          "When was the project completed?",
          "项目何时完工？",
          "โครงการเสร็จเมื่อใด?",
        ),
        answer: i18nTriple(
          `PropertyHub lists completion year as ${year}.`,
          `PropertyHub 记载完工年份为 ${year}。`,
          `PropertyHub ระบุปีที่แล้วเสร็จเป็น ${year}`,
        ),
      });
    }
    if (info.totalUnits) {
      faq.push({
        question: i18nTriple(
          "How many units are in the project?",
          "项目共有多少套？",
          "โครงการมีกี่ยูนิต?",
        ),
        answer: i18nTriple(
          `PropertyHub lists ${info.totalUnits} total units.`,
          `PropertyHub 记载总套数为 ${info.totalUnits}。`,
          `PropertyHub ระบุจำนวนยูนิตทั้งหมด ${info.totalUnits}`,
        ),
      });
    }
    if (faq.length) project.faq = faq;
  }

  if (!project.facebook_url && manifest.developer?.facebook_url) {
    project.facebook_url = manifest.developer.facebook_url;
  }
  // Keep official_website if already set; else leave null (do not invent)

  manifest.project = project;
  manifest.collected_at = TODAY;
  return manifest;
}

async function harvestProject(dirName) {
  const dir = join(ROOT, "content/projects", dirName);
  const manifestPath = join(dir, "manifest.json");
  if (!existsSync(manifestPath)) return null;
  const listingsPath = join(dir, "listings.json");
  if (skipExisting && existsSync(listingsPath)) {
    const existing = JSON.parse(readFileSync(listingsPath, "utf8"));
    const n = (existing.listings || []).length;
    if (n > 0) {
      return {
        slug: dirName,
        status: "skipped",
        reason: "listings.json already present",
        listings: n,
      };
    }
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const district = manifest.location?.district_slug;
  const slug = manifest.slug || dirName;
  const phSlug = PH_SLUG_OVERRIDE[slug] || slug;
  const phProjectUrl = `https://propertyhub.in.th/en/projects/${phSlug}`;

  const salePage = await fetchText(`${phProjectUrl}/for-sale`);
  await sleep(250);
  const rentPage = await fetchText(`${phProjectUrl}/for-rent`);
  await sleep(250);

  if (!salePage.ok && !rentPage.ok) {
    return {
      slug,
      district,
      status: "skip",
      reason: `project pages HTTP ${salePage.status}/${rentPage.status}`,
      listings: 0,
    };
  }

  const saleHrefs = salePage.ok
    ? extractListingHrefs(salePage.text).slice(0, perType)
    : [];
  const rentHrefs = rentPage.ok
    ? extractListingHrefs(rentPage.text).slice(0, perType)
    : [];

  const listings = [];
  let sampleListing = null;
  const transitTags = [...(manifest.project?.transit_tags || [])];

  for (const hrefs of [saleHrefs, rentHrefs]) {
    for (const href of hrefs) {
      const detail = await fetchText(`https://propertyhub.in.th${href}`);
      await sleep(200);
      if (!detail.ok) continue;
      const next = extractNextData(detail.text);
      const listing = next?.props?.pageProps?.listing;
      if (!listing) continue;
      if (!sampleListing) sampleListing = listing;
      const tags = [
        ...new Set([
          ...transitTags,
          ...transitTagsFromZones(listing.nearbyZones || {}),
        ]),
      ];
      const dto = listingDto({
        listing,
        href,
        projectSlug: slug,
        developerSlug: manifest.developer?.slug,
        districtSlug: district,
        transitTags: tags,
      });
      if (dto) listings.push(dto);
    }
  }

  if (!listings.length) {
    return {
      slug,
      district,
      status: "empty",
      reason: "no priced listings parsed",
      listings: 0,
    };
  }

  if (!dryRun) {
    if (sampleListing) {
      const enriched = enrichManifest(manifest, sampleListing, phProjectUrl);
      // Pull facebook from developer package if present
      const devPath = join(
        ROOT,
        "content/developers",
        enriched.developer?.slug || "",
        "manifest.json",
      );
      if (existsSync(devPath)) {
        const d = JSON.parse(readFileSync(devPath, "utf8"));
        if (d.facebook_url) {
          enriched.project.facebook_url =
            enriched.project.facebook_url || d.facebook_url;
        }
        if (d.website && !enriched.project.official_website) {
          enriched.project.official_website = d.website;
        }
      }
      writeFileSync(manifestPath, `${JSON.stringify(enriched, null, 2)}\n`);
    }

    const listingsPkg = {
      project_slug: slug,
      collected_at: TODAY,
      source: "propertyhub",
      notes:
        "Harvested from PropertyHub public listing detail __NEXT_DATA__. verification_status=verified only when price present on detail page.",
      listings,
    };
    writeFileSync(
      join(dir, "listings.json"),
      `${JSON.stringify(listingsPkg, null, 2)}\n`,
    );
  }

  return {
    slug,
    district,
    status: "ok",
    priority: PRIORITY_DISTRICTS.has(district),
    listings: listings.length,
    sale: listings.filter((l) => l.listing_type === "sale").length,
    rent: listings.filter((l) => l.listing_type === "rent").length,
  };
}

async function main() {
  let dirs = readdirSync(join(ROOT, "content/projects"))
    .filter((d) => existsSync(join(ROOT, "content/projects", d, "manifest.json")))
    .sort((a, b) => {
      const ma = JSON.parse(
        readFileSync(join(ROOT, "content/projects", a, "manifest.json"), "utf8"),
      );
      const mb = JSON.parse(
        readFileSync(join(ROOT, "content/projects", b, "manifest.json"), "utf8"),
      );
      const pa = PRIORITY_DISTRICTS.has(ma.location?.district_slug) ? 0 : 1;
      const pb = PRIORITY_DISTRICTS.has(mb.location?.district_slug) ? 0 : 1;
      return pa - pb || a.localeCompare(b);
    });
  if (onlySet) dirs = dirs.filter((d) => onlySet.has(d));
  dirs = dirs.slice(0, projectLimit);

  const results = [];
  for (const dir of dirs) {
    process.stderr.write(`Harvest ${dir}...\n`);
    try {
      const r = await harvestProject(dir);
      results.push(r);
      process.stderr.write(
        `  → ${r.status} listings=${r.listings} ${r.reason || ""}\n`,
      );
    } catch (e) {
      results.push({ slug: dir, status: "error", reason: e.message, listings: 0 });
      process.stderr.write(`  → error ${e.message}\n`);
    }
  }

  const summary = {
    collected_at: TODAY,
    dry_run: dryRun,
    per_type: perType,
    projects: results.length,
    ok: results.filter((r) => r.status === "ok").length,
    listings_total: results.reduce((s, r) => s + (r.listings || 0), 0),
    results,
  };

  const outDir = join(ROOT, "content/listings/batches");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${TODAY.replace(/-/g, "")}-propertyhub-bkk-wave1-summary.json`);
  writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
