/**
 * LivingInsider adapter — crawl / parse / normalize.
 * Does not touch PropertyHub harvest modules.
 */
import { createHash } from "node:crypto";
import { deriveListingIdentity } from "../lib/listing-identity.mjs";

export const SOURCE = "livinginsider";
export const UA =
  "Mozilla/5.0 (compatible; GoThailandHomeFactory/1.0; +https://gothailandhome.com)";

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchHtml(url, { retries = 4 } = {}) {
  let last = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    const text = await res.text();
    last = {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      text,
    };
    if (res.status !== 429 && res.status !== 503) return last;
    const wait = 2000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
    process.stderr.write(
      `  rate-limit ${res.status} on ${url} — retry in ${wait}ms\n`,
    );
    await sleep(wait);
  }
  return last;
}

export function extractDetailIds(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\/detail_en\/[^"'?\s]+-(\d{5,})/g)) {
    ids.add(m[1]);
  }
  for (const m of html.matchAll(/\/re\/en_(\d{5,})/g)) {
    ids.add(m[1]);
  }
  return [...ids];
}

export function extractLdJson(html) {
  const out = [];
  for (const m of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {
      /* ignore */
    }
  }
  return out;
}

export function extractLivingInsiderListingId(urlOrRef) {
  const s = String(urlOrRef || "");
  const re = s.match(/(?:en_|LV|livinginsider-)(\d{5,})/i);
  if (re) return re[1];
  const trail = s.match(/-(\d{5,})(?:\/?$|\?)/);
  return trail ? trail[1] : null;
}

export function parseListingType(html, product) {
  // Prefer scoped title/description — never whole HTML (nav links say เช่า/ขาย everywhere).
  const scoped = `${product?.name || ""}\n${product?.description || ""}`;
  const price = Number(product?.offers?.price);

  const hasSale =
    /for\s*sale|ขาย|buysell|forsale/i.test(scoped) ||
    /condo\s+for\s+sale/i.test(scoped);
  const hasRent =
    /for\s*rent|ให้เช่า|rental\s*price|เช่าถูก|for\s*rent/i.test(scoped) ||
    /condo\s+for\s+rent/i.test(scoped);

  // Explicit sale in title/description wins when not primarily rent-only
  if (hasSale && !hasRent) return "sale";
  if (hasRent && !hasSale) return "rent";
  if (hasSale && hasRent) {
    // Dual listings: use price band (monthly rent vs purchase)
    if (price > 0 && price < 200000) return "rent";
    if (price >= 200000) return "sale";
  }

  // Price-band fallback (sourced Offer price only)
  if (price > 0 && price < 200000) return "rent";
  if (price >= 200000) return "sale";

  // Last resort: check detail URL slug only
  const url = String(product?.offers?.url || "");
  if (/for-sale|forsale|ขาย/i.test(url)) return "sale";
  if (/for-rent|forrent|เช่า/i.test(url)) return "rent";
  return null;
}

export function parseSpecsFromText(...parts) {
  const text = parts.filter(Boolean).join("\n");
  const beds =
    text.match(/(\d+)\s*(?:bedrooms?|beds?|นอน|ห้องนอน)/i)?.[1] ??
    text.match(/🛏️\s*(\d+)/)?.[1] ??
    null;
  const baths =
    text.match(/(\d+)\s*(?:bathrooms?|baths?|น้ำ|ห้องน้ำ)/i)?.[1] ?? null;
  const area =
    text.match(/([\d]+(?:\.\d+)?)\s*(?:sq\.?\s*m\.?|sqm|ตร\.?\s*ม)/i)?.[1] ??
    null;
  const floor =
    text.match(/(?:floor|ชั้น)\s*[.:]?\s*(\d{1,3})/i)?.[1] ?? null;
  return {
    bedrooms: beds == null ? null : Number(beds),
    bathrooms: baths == null ? null : Number(baths),
    area_sqm: area == null ? null : Number(area),
    floor_label: floor,
  };
}

/**
 * Parse a LivingInsider detail HTML into a raw structured object (not yet DTO).
 */
export function parseDetailHtml(html, listingId) {
  const ld = extractLdJson(html);
  const product = ld.find((x) => x?.["@type"] === "Product") || null;
  const crumbs = ld.find((x) => x?.["@type"] === "BreadcrumbList") || null;
  const price = Number(product?.offers?.price);
  const currency = product?.offers?.priceCurrency || "THB";
  const listingType = parseListingType(html, product);
  const specs = parseSpecsFromText(product?.description, product?.name, html);
  const projectCrumb = (crumbs?.itemListElement || []).find((x) =>
    String(x?.item || "").includes("living_project"),
  );
  const projectName = projectCrumb?.name || null;
  const projectUrl = projectCrumb?.item || null;
  const canonical =
    product?.offers?.url ||
    `https://www.livinginsider.com/re/en_${listingId}`;
  const updated =
    product?.offers?.priceValidUntil ||
    html.match(/Created\s+(\d{1,2}\/\d{1,2}\/\d{4})/i)?.[1] ||
    null;

  return {
    listing_id: String(listingId),
    product,
    price_thb: Number.isFinite(price) && price > 0 ? price : null,
    currency,
    listing_type: listingType,
    ...specs,
    title: product?.name || null,
    description: product?.description || null,
    listing_url: canonical,
    project_name: projectName,
    project_url: projectUrl,
    image: product?.image || null,
    sku: product?.sku || null,
    source_updated_hint: updated,
    availability: product?.offers?.availability || null,
  };
}

function i18nTriple(en, zh = "", th = "") {
  return {
    en: en || "",
    zh: zh || en || "",
    th: th || en || "",
  };
}

/**
 * Map parsed LivingInsider detail → Property Factory listing DTO.
 * Returns null when required provenance/price fields are missing (not fabricated).
 */
export function toListingDto(raw, ctx) {
  if (!raw?.listing_id) return null;
  if (!(raw.price_thb > 0)) return null;
  if (!raw.listing_type) return null;
  if (raw.currency && raw.currency !== "THB") return null;

  const today = new Date().toISOString().slice(0, 10);
  let sourceUpdated = today;
  if (raw.source_updated_hint) {
    const dmy = String(raw.source_updated_hint).match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    );
    if (dmy) {
      sourceUpdated = `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    } else if (/^\d{4}-\d{2}-\d{2}/.test(raw.source_updated_hint)) {
      sourceUpdated = raw.source_updated_hint.slice(0, 10);
    }
  }

  const titleEn =
    raw.title ||
    `${ctx.project_slug} listing ${raw.listing_id} (${raw.listing_type})`;
  const price = raw.price_thb;
  const beds = raw.bedrooms;
  const area = raw.area_sqm;

  const base = {
    external_ref: `livinginsider-${raw.listing_id}`,
    listing_type: raw.listing_type,
    property_type: "condo",
    price_thb: price,
    bedrooms: beds,
    bathrooms: raw.bathrooms,
    area_sqm: area,
    floor_label: raw.floor_label,
    building_label: null,
    project_slug: ctx.project_slug,
    developer_slug: ctx.developer_slug,
    city_slug: "bangkok",
    district_slug: ctx.district_slug,
    transit_tags: ctx.transit_tags || [],
    title: i18nTriple(titleEn),
    summary: i18nTriple(
      `${raw.listing_type === "sale" ? "Sale" : "Rent"}: ${beds ?? "?"}BR, ${area ?? "?"} sq.m., ${price.toLocaleString("en-US")} THB. Source LivingInsider #${raw.listing_id}.`,
      `${raw.listing_type === "sale" ? "出售" : "出租"}：${beds ?? "?"}卧，${area ?? "?"}㎡，${price.toLocaleString("en-US")} 泰铢。来源 LivingInsider #${raw.listing_id}。`,
      `${raw.listing_type === "sale" ? "ขาย" : "เช่า"}: ${beds ?? "?"} นอน ${area ?? "?"} ตร.ม. ราคา ${price.toLocaleString("en-US")} บาท (LivingInsider #${raw.listing_id})`,
    ),
    description: i18nTriple(
      `Normalized from LivingInsider listing ${raw.listing_id}. Specs/price from public detail ld+json + page text. Availability subject to source.`,
      `来自 LivingInsider 挂牌 ${raw.listing_id}。规格与价格取自公开详情页；是否可售/可租以来源页为准。`,
      `แปลงจากประกาศ LivingInsider ${raw.listing_id} ยึดข้อมูลจากหน้าต้นทาง`,
    ),
    featured: false,
    source: SOURCE,
    listing_url: `https://www.livinginsider.com/re/en_${raw.listing_id}`,
    source_updated_at: sourceUpdated,
    collected_at: today,
    source_captured_at: today,
    // Rule-verified from reachable sourced price + id (factory allow-list)
    verification_status: "verified",
    publish_ready: true,
    listing_lifecycle_status: "active",
    images: raw.image
      ? [
          {
            url: raw.image,
            role: "cover",
            source: SOURCE,
            rights_note: "hotlink",
          },
        ]
      : [],
  };

  const identity = deriveListingIdentity(base);
  return {
    ...base,
    ...identity,
    source_listing_id: String(raw.listing_id),
  };
}

export function softMatchKey(listing) {
  return createHash("sha256")
    .update(
      [
        "soft",
        String(listing.project_slug || "").toLowerCase(),
        String(listing.listing_type || "").toLowerCase(),
        listing.bedrooms == null ? "" : String(listing.bedrooms),
        listing.area_sqm == null
          ? ""
          : String(Math.round(Number(listing.area_sqm) * 10) / 10),
        listing.floor_label == null ? "" : String(listing.floor_label).trim(),
      ].join("|"),
    )
    .digest("hex");
}
