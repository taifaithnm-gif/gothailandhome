/**
 * DotProperty adapter — crawl / parse / normalize.
 * Does not touch PropertyHub, LivingInsider, DDproperty, or Hipflat modules.
 * Harvests only publicly accessible pages; never bypasses Cloudflare/CAPTCHA.
 */
import { deriveListingIdentity } from "../lib/listing-identity.mjs";

export const SOURCE = "dotproperty";
export const ORIGIN = "https://www.dotproperty.co.th";
export const UA =
  "Mozilla/5.0 (compatible; GoThailandHomeFactory/1.0; +https://gothailandhome.com)";

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function isCloudflareChallenge(html, status) {
  if (status === 403 || status === 503) return true;
  const t = String(html || "");
  return (
    /Just a moment/i.test(t) ||
    /cf-browser-verification/i.test(t) ||
    /cdn-cgi\/challenge/i.test(t) ||
    /Attention Required! \| Cloudflare/i.test(t)
  );
}

export async function fetchHtml(url, { retries = 3 } = {}) {
  let last = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9,th;q=0.8",
      },
      redirect: "follow",
    });
    const text = await res.text();
    last = {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      text,
      cloudflare: isCloudflareChallenge(text, res.status),
    };
    if (last.cloudflare) return last;
    if (res.status !== 429 && res.status !== 503) return last;
    const wait = 2000 * Math.pow(2, attempt) + Math.floor(Math.random() * 400);
    process.stderr.write(
      `  rate-limit ${res.status} on ${url} — retry in ${wait}ms\n`,
    );
    await sleep(wait);
  }
  return last;
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

/** DotProperty ad id: hex segments after final underscore in /en/ads/..._* */
export function extractListingIdFromUrl(urlOrPath) {
  const s = String(urlOrPath || "");
  const m = s.match(
    /_([a-f0-9]{8,}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{8,})(?:\/?$|\?)/i,
  );
  return m ? m[1].toLowerCase() : null;
}

export function extractListingRefs(html) {
  const out = new Map();
  for (const m of html.matchAll(
    /href="((?:https:\/\/www\.dotproperty\.co\.th)?\/en\/ads\/[^"#?\s]+)"/gi,
  )) {
    const path = m[1].startsWith("http")
      ? new URL(m[1]).pathname
      : m[1];
    const id = extractListingIdFromUrl(path);
    if (id && !out.has(id)) out.set(id, path);
  }
  return [...out.entries()].map(([id, path]) => ({ id, path }));
}

export function listingDetailUrl(id, path = null) {
  if (path) {
    if (path.startsWith("http")) return path;
    return `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return `${ORIGIN}/en/ads/${id}`;
}

function i18nTriple(en, zh = "", th = "") {
  return { en: en || "", zh: zh || en || "", th: th || en || "" };
}

export function parseListingType(listing, pageUrl) {
  const scoped = [
    listing?.name,
    listing?.mainEntity?.name,
    listing?.mainEntity?.description,
    pageUrl,
  ]
    .filter(Boolean)
    .join("\n");
  const price = Number(listing?.mainEntity?.offers?.price);
  const hasSale = /for\s*sale|ขาย|\/condos-for-sale|transactionType=sale/i.test(
    scoped,
  );
  const hasRent = /for\s*rent|ให้เช่า|\/condos-for-rent|transactionType=rent/i.test(
    scoped,
  );
  if (hasSale && !hasRent) return "sale";
  if (hasRent && !hasSale) return "rent";
  if (hasSale && hasRent) {
    if (price > 0 && price < 200000) return "rent";
    if (price >= 200000) return "sale";
  }
  if (price > 0 && price < 200000) return "rent";
  if (price >= 200000) return "sale";
  return null;
}

export function parseDetailHtml(html, listingId, pageUrl) {
  if (isCloudflareChallenge(html, 200)) {
    return { blocked: true, listing_id: String(listingId) };
  }
  const ld = extractLdJson(html);
  const listing =
    ld.find((x) => x?.["@type"] === "RealEstateListing") || null;
  const entity = listing?.mainEntity || null;
  if (!listing || !entity) {
    return {
      blocked: false,
      listing_id: String(listingId),
      price_thb: null,
      listing_type: null,
      title: null,
      description: null,
      parse_error: "missing_realestate_listing_ldjson",
    };
  }

  const price = Number(entity?.offers?.price);
  const currency = entity?.offers?.priceCurrency || "THB";
  const listingType = parseListingType(listing, pageUrl);
  const area = Number(entity?.floorSize?.value);
  const bedrooms =
    entity?.numberOfBedrooms == null ? null : Number(entity.numberOfBedrooms);
  const bathrooms =
    entity?.numberOfBathroomsTotal == null
      ? null
      : Number(entity.numberOfBathroomsTotal);

  let floor_label = null;
  const desc = String(entity?.description || listing?.name || "");
  const floorMatch = desc.match(
    /(?:on the|floor)\s+(\d{1,3})(?:st|nd|rd|th)?\s*floor/i,
  );
  if (floorMatch) floor_label = floorMatch[1];

  const updated =
    entity?.offers?.priceValidUntil ||
    listing?.datePosted ||
    null;

  const image = Array.isArray(entity?.image)
    ? entity.image[0]
    : entity?.image || listing?.image || null;

  return {
    blocked: false,
    listing_id: String(listingId),
    price_thb: Number.isFinite(price) && price > 0 ? price : null,
    currency,
    listing_type: listingType,
    bedrooms: Number.isFinite(bedrooms) ? bedrooms : null,
    bathrooms: Number.isFinite(bathrooms) ? bathrooms : null,
    area_sqm: Number.isFinite(area) && area > 0 ? area : null,
    floor_label,
    title: entity?.name || listing?.name || null,
    description: entity?.description || null,
    listing_url: listing?.url || pageUrl || listingDetailUrl(listingId),
    source_updated_hint: updated || listing?.datePosted || null,
    image,
    availability: entity?.offers?.availability || null,
  };
}

export function toListingDto(raw, ctx) {
  if (!raw || raw.blocked) return null;
  if (!raw.listing_id) return null;
  if (!(raw.price_thb > 0)) return null;
  if (!raw.listing_type) return null;
  if (raw.currency && String(raw.currency).toUpperCase() !== "THB") return null;

  const today = new Date().toISOString().slice(0, 10);
  let sourceUpdated = today;
  if (raw.source_updated_hint) {
    const s = String(raw.source_updated_hint);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) sourceUpdated = s.slice(0, 10);
  }

  // Preserve availability as lifecycle hint when present
  let lifecycle = "active";
  const avail = String(raw.availability || "");
  if (/SoldOut|OutOfStock|Discontinued/i.test(avail)) lifecycle = "delisted";

  const price = raw.price_thb;
  const beds = raw.bedrooms;
  const area = raw.area_sqm;
  const titleEn =
    raw.title ||
    `${ctx.project_slug} listing ${raw.listing_id} (${raw.listing_type})`;

  const base = {
    external_ref: `dotproperty-${raw.listing_id}`,
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
      `${raw.listing_type === "sale" ? "Sale" : "Rent"}: ${beds ?? "?"}BR, ${area ?? "?"} sq.m., ${price.toLocaleString("en-US")} THB. Source DotProperty #${raw.listing_id}.`,
      `${raw.listing_type === "sale" ? "出售" : "出租"}：${beds ?? "?"}卧，${area ?? "?"}㎡，${price.toLocaleString("en-US")} 泰铢。来源 DotProperty #${raw.listing_id}。`,
      `${raw.listing_type === "sale" ? "ขาย" : "เช่า"}: ${beds ?? "?"} นอน ${area ?? "?"} ตร.ม. ราคา ${price.toLocaleString("en-US")} บาท (DotProperty #${raw.listing_id})`,
    ),
    description: i18nTriple(
      raw.description
        ? String(raw.description).slice(0, 1200)
        : `Normalized from DotProperty listing ${raw.listing_id}. Specs/price from public RealEstateListing ld+json. Availability subject to source.`,
      `来自 DotProperty 挂牌 ${raw.listing_id}。规格与价格取自公开详情页 ld+json。`,
      `แปลงจากประกาศ DotProperty ${raw.listing_id} ยึดข้อมูลจากหน้าต้นทาง`,
    ),
    featured: false,
    source: SOURCE,
    listing_url: raw.listing_url || listingDetailUrl(raw.listing_id),
    source_updated_at: sourceUpdated,
    collected_at: today,
    source_captured_at: today,
    verification_status: "verified",
    publish_ready: true,
    listing_lifecycle_status: lifecycle,
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
