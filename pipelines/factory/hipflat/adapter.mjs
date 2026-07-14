/**
 * Hipflat adapter — crawl / parse / normalize.
 * Does not touch PropertyHub, LivingInsider, or DDproperty modules.
 *
 * Note: www.hipflat.co.th / www.hipflat.com are Cloudflare-protected from
 * many automated environments; harvest records blockers and never fabricates listings.
 * Do NOT attempt to bypass Cloudflare.
 */
import { deriveListingIdentity } from "../lib/listing-identity.mjs";

export const SOURCE = "hipflat";
export const ORIGIN = "https://www.hipflat.co.th";
export const UA =
  "Mozilla/5.0 (compatible; GoThailandHomeFactory/1.0; +https://gothailandhome.com)";

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function isCloudflareChallenge(html, status) {
  if (status === 403 || status === 503) {
    const t = String(html || "");
    if (
      /Just a moment/i.test(t) ||
      /cf-browser-verification/i.test(t) ||
      /cdn-cgi\/challenge/i.test(t) ||
      /Attention Required! \| Cloudflare/i.test(t) ||
      status === 403
    )
      return true;
  }
  const t = String(html || "");
  return (
    /Just a moment/i.test(t) ||
    /cf-browser-verification/i.test(t) ||
    /cdn-cgi\/challenge/i.test(t) ||
    /Attention Required! \| Cloudflare/i.test(t)
  );
}

export async function fetchHtml(url, { retries = 2 } = {}) {
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

export function extractNextData(html) {
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

/**
 * Extract Hipflat ad ids (alphanumeric hashes) from HTML / JSON blobs.
 */
export function extractListingRefs(html) {
  const out = new Map(); // id -> path
  const patterns = [
    /href="(\/ads\/([a-z0-9]{16,}))"/gi,
    /href="(https:\/\/www\.hipflat\.(?:co\.th|com)\/ads\/([a-z0-9]{16,}))"/gi,
    /"id"\s*:\s*"([a-z0-9]{16,})"/gi,
    /"slug"\s*:\s*"([a-z0-9]{16,})"/gi,
    /\/ads\/([a-z0-9]{16,})/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) {
      const id = m[2] || m[1];
      const path = m[2] ? m[1] : `/ads/${id}`;
      if (/^[a-z0-9]{16,}$/i.test(String(id))) {
        if (!out.has(String(id))) out.set(String(id), path.startsWith("http") ? path : path);
      }
    }
  }
  return [...out.entries()].map(([id, path]) => ({ id, path }));
}

export function buildSearchUrls(nameEn) {
  const q = encodeURIComponent(String(nameEn || "").trim());
  return {
    sale: `${ORIGIN}/en/search/sale/bangkok/condo?q=${q}`,
    rent: `${ORIGIN}/en/search/rent/bangkok/condo?q=${q}`,
  };
}

export function listingDetailUrl(id, path = null) {
  if (path) {
    if (path.startsWith("http")) return path;
    return `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return `${ORIGIN}/ads/${id}`;
}

function i18nTriple(en, zh = "", th = "") {
  return { en: en || "", zh: zh || en || "", th: th || en || "" };
}

export function parseListingType(product, nextListing, pageUrl) {
  const scoped = [
    product?.name,
    product?.description,
    nextListing?.title,
    nextListing?.transactionType,
    nextListing?.offerType,
    pageUrl,
  ]
    .filter(Boolean)
    .join("\n");
  const price = Number(
    product?.offers?.price ?? nextListing?.price?.value ?? nextListing?.price,
  );
  const hasSale = /for\s*sale|ขาย|\/sale\b|transaction.?sale/i.test(scoped);
  const hasRent = /for\s*rent|ให้เช่า|\/rent\b|transaction.?rent/i.test(scoped);
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

export function parseSpecs(...parts) {
  const text = parts.filter(Boolean).join("\n");
  const beds =
    text.match(/(\d+)\s*(?:bedrooms?|beds?|นอน|ห้องนอน)/i)?.[1] ?? null;
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
 * Parse detail HTML into raw record. Returns blocked flag if challenge/unparseable.
 */
export function parseDetailHtml(html, listingId, pageUrl) {
  if (isCloudflareChallenge(html, 200)) {
    return { blocked: true, listing_id: String(listingId) };
  }
  const ld = extractLdJson(html);
  const product =
    ld.find(
      (x) =>
        x?.["@type"] === "Product" ||
        x?.["@type"] === "Apartment" ||
        x?.["@type"] === "Residence" ||
        x?.["@type"] === "RealEstateListing",
    ) || null;
  const next = extractNextData(html);
  const nextListing =
    next?.props?.pageProps?.listing ||
    next?.props?.pageProps?.ad ||
    next?.props?.pageProps?.property ||
    next?.props?.pageProps?.data?.listing ||
    null;

  const price = Number(
    product?.offers?.price ??
      nextListing?.price?.value ??
      nextListing?.price ??
      nextListing?.priceValue,
  );
  const currency =
    product?.offers?.priceCurrency ||
    nextListing?.price?.currency ||
    nextListing?.currency ||
    "THB";
  const listingType = parseListingType(product, nextListing, pageUrl);
  const specs = parseSpecs(
    product?.description,
    product?.name,
    nextListing?.title,
    nextListing?.description,
    html.slice(0, 8000),
  );
  if (nextListing?.bedrooms != null) specs.bedrooms = Number(nextListing.bedrooms);
  if (nextListing?.bathrooms != null)
    specs.bathrooms = Number(nextListing.bathrooms);
  if (nextListing?.floorArea?.value != null)
    specs.area_sqm = Number(nextListing.floorArea.value);
  if (nextListing?.size != null && specs.area_sqm == null)
    specs.area_sqm = Number(nextListing.size);
  if (nextListing?.floorLevel != null)
    specs.floor_label = String(nextListing.floorLevel);
  if (nextListing?.floor != null && !specs.floor_label)
    specs.floor_label = String(nextListing.floor);

  const title =
    product?.name || nextListing?.title || nextListing?.headline || null;
  const description =
    product?.description || nextListing?.description || null;
  const updated =
    nextListing?.updatedAt ||
    nextListing?.lastPostedDate ||
    product?.offers?.priceValidUntil ||
    null;

  return {
    blocked: false,
    listing_id: String(listingId),
    price_thb: Number.isFinite(price) && price > 0 ? price : null,
    currency,
    listing_type: listingType,
    ...specs,
    title,
    description,
    listing_url: pageUrl || listingDetailUrl(listingId),
    source_updated_hint: updated,
    image: product?.image || nextListing?.coverImageUrl || null,
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

  const price = raw.price_thb;
  const beds = raw.bedrooms;
  const area = raw.area_sqm;
  const titleEn =
    raw.title ||
    `${ctx.project_slug} listing ${raw.listing_id} (${raw.listing_type})`;

  const base = {
    external_ref: `hipflat-${raw.listing_id}`,
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
      `${raw.listing_type === "sale" ? "Sale" : "Rent"}: ${beds ?? "?"}BR, ${area ?? "?"} sq.m., ${price.toLocaleString("en-US")} THB. Source Hipflat #${raw.listing_id}.`,
      `${raw.listing_type === "sale" ? "出售" : "出租"}：${beds ?? "?"}卧，${area ?? "?"}㎡，${price.toLocaleString("en-US")} 泰铢。来源 Hipflat #${raw.listing_id}。`,
      `${raw.listing_type === "sale" ? "ขาย" : "เช่า"}: ${beds ?? "?"} นอน ${area ?? "?"} ตร.ม. ราคา ${price.toLocaleString("en-US")} บาท (Hipflat #${raw.listing_id})`,
    ),
    description: i18nTriple(
      `Normalized from Hipflat listing ${raw.listing_id}. Specs/price from public detail (ld+json / __NEXT_DATA__). Availability subject to source.`,
      `来自 Hipflat 挂牌 ${raw.listing_id}。规格与价格取自公开详情页；是否可售/可租以来源页为准。`,
      `แปลงจากประกาศ Hipflat ${raw.listing_id} ยึดข้อมูลจากหน้าต้นทาง`,
    ),
    featured: false,
    source: SOURCE,
    listing_url: listingDetailUrl(raw.listing_id),
    source_updated_at: sourceUpdated,
    collected_at: today,
    source_captured_at: today,
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
