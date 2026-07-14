/**
 * FazWaz adapter — crawl / parse / normalize via publicly reachable fazwaz.co.th.
 * www.fazwaz.com is Cloudflare-protected; do NOT attempt to bypass it.
 * Does not modify PropertyHub, LivingInsider, DDproperty, Hipflat, or DotProperty modules.
 */
import { deriveListingIdentity } from "../lib/listing-identity.mjs";

export const SOURCE = "fazwaz";
export const ORIGIN = "https://www.fazwaz.co.th";
export const UA =
  "Mozilla/5.0 (compatible; GoThailandHomeFactory/1.0; +https://gothailandhome.com)";

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function isCloudflareChallenge(html, status) {
  const t = String(html || "");
  const title = t.match(/<title>([^<]+)/i)?.[1] || "";
  // Title-based challenge only — avoid false positives from scripts/CDN asset paths.
  if (/Just a moment/i.test(title)) return true;
  if (/Attention Required!\s*\|\s*Cloudflare/i.test(title)) return true;
  if (status === 403 || status === 503) {
    return (
      /Just a moment/i.test(t) ||
      /cf-browser-verification/i.test(t) ||
      /cdn-cgi\/challenge/i.test(t) ||
      /Attention Required! \| Cloudflare/i.test(t) ||
      true
    );
  }
  return false;
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

export function extractListingIdFromUrl(urlOrPath) {
  const m = String(urlOrPath || "").match(/-u(\d+)(?:\/?$|\?)/i);
  return m ? m[1] : null;
}

export function extractListingRefs(html, preferredTab = null) {
  const out = new Map();
  const patterns = [
    /href="((?:https:\/\/www\.fazwaz\.co\.th)?\/en\/property-sales\/[^"#?\s]+-u\d+)"/gi,
    /href="((?:https:\/\/www\.fazwaz\.co\.th)?\/en\/property-rent\/[^"#?\s]+-u\d+)"/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) {
      let path = m[1];
      if (path.startsWith("http")) path = new URL(path).pathname;
      const id = extractListingIdFromUrl(path);
      if (!id) continue;
      const tab = /property-rent/i.test(path)
        ? "rent"
        : /property-sales/i.test(path)
          ? "sale"
          : preferredTab;
      if (!out.has(id)) out.set(id, { id, path, tab });
    }
  }
  return [...out.values()];
}

export function listingDetailUrl(id, path = null) {
  if (path) {
    if (path.startsWith("http")) return path;
    return `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  }
  return `${ORIGIN}/en/property-sales/listing-u${id}`;
}

function i18nTriple(en, zh = "", th = "") {
  return { en: en || "", zh: zh || en || "", th: th || en || "" };
}

function parseDataLayer(html) {
  const m = html.match(
    /dataLayer\.push\(\s*(\{[^)]*event\s*:\s*['"]property_view['"][\s\S]*?\})\s*\)/,
  );
  if (!m) return null;
  try {
    // dataLayer objects may use unquoted keys — normalize lightly
    const raw = m[1]
      .replace(/(['"])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":')
      .replace(/'/g, '"');
    return JSON.parse(raw);
  } catch {
    // fallback field extract
    const price = Number(m[1].match(/price\s*:\s*([0-9.]+)/)?.[1]);
    const listingType = m[1].match(/listing_type\s*:\s*['"](sale|rent)['"]/i)?.[1];
    const currency = m[1].match(/currency\s*:\s*['"]([A-Z]+)['"]/)?.[1];
    return {
      price: Number.isFinite(price) ? price : null,
      listing_type: listingType || null,
      currency: currency || null,
    };
  }
}

export function parseDetailHtml(html, listingId, pageUrl) {
  if (isCloudflareChallenge(html, 200)) {
    return { blocked: true, listing_id: String(listingId) };
  }
  const title =
    html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ||
    null;
  const dl = parseDataLayer(html) || {};
  let price = Number(dl.price);
  if (!(price > 0) && title) {
    const tm = title.match(/฿\s*([\d,]+)/);
    if (tm) price = Number(tm[1].replace(/,/g, ""));
  }
  const currency = dl.currency || "THB";
  let listingType = dl.listing_type || null;
  if (!listingType) {
    if (/for\s*rent|property-rent/i.test(`${title}\n${pageUrl}`))
      listingType = "rent";
    else if (/for\s*sale|property-sales/i.test(`${title}\n${pageUrl}`))
      listingType = "sale";
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const bedrooms =
    Number(title?.match(/(\d+)\s*Bedroom/i)?.[1]) ||
    Number(text.match(/(\d+)\s*Bed(?:room)?s?\b/i)?.[1]) ||
    null;
  const bathrooms =
    Number(text.match(/(\d+)\s*Bath(?:room)?s?\b/i)?.[1]) || null;
  const area =
    Number(text.match(/([\d.]+)\s*SqM/i)?.[1]) ||
    Number(text.match(/([\d.]+)\s*sq\.?\s*m/i)?.[1]) ||
    null;
  const floor =
    text.match(/(?:Floor|ชั้น)\s*[#:.]?\s*(\d{1,3})/i)?.[1] || null;

  return {
    blocked: false,
    listing_id: String(listingId),
    price_thb: Number.isFinite(price) && price > 0 ? price : null,
    currency,
    listing_type: listingType,
    bedrooms: Number.isFinite(bedrooms) ? bedrooms : null,
    bathrooms: Number.isFinite(bathrooms) ? bathrooms : null,
    area_sqm: Number.isFinite(area) && area > 0 ? area : null,
    floor_label: floor,
    title,
    description:
      html.match(
        /property="og:description"[^>]*content="([^"]+)"/i,
      )?.[1] || null,
    listing_url: pageUrl || listingDetailUrl(listingId),
    source_updated_hint: null,
  };
}

export function toListingDto(raw, ctx) {
  if (!raw || raw.blocked) return null;
  if (!raw.listing_id) return null;
  if (!(raw.price_thb > 0)) return null;
  if (!raw.listing_type) return null;
  if (!raw.listing_url || !/^https?:\/\//i.test(raw.listing_url)) return null;
  if (!ctx.project_slug) return null;
  if (raw.currency && String(raw.currency).toUpperCase() !== "THB") return null;
  // Essential property fields: require bedrooms or area
  if (raw.bedrooms == null && !(raw.area_sqm > 0)) return null;

  const today = new Date().toISOString().slice(0, 10);
  const price = raw.price_thb;
  const beds = raw.bedrooms;
  const area = raw.area_sqm;
  const titleEn =
    raw.title ||
    `${ctx.project_slug} listing ${raw.listing_id} (${raw.listing_type})`;

  const base = {
    external_ref: `fazwaz-${raw.listing_id}`,
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
      `${raw.listing_type === "sale" ? "Sale" : "Rent"}: ${beds ?? "?"}BR, ${area ?? "?"} sq.m., ${price.toLocaleString("en-US")} THB. Source FazWaz #${raw.listing_id}.`,
      `${raw.listing_type === "sale" ? "出售" : "出租"}：${beds ?? "?"}卧，${area ?? "?"}㎡，${price.toLocaleString("en-US")} 泰铢。来源 FazWaz #${raw.listing_id}。`,
      `${raw.listing_type === "sale" ? "ขาย" : "เช่า"}: ${beds ?? "?"} นอน ${area ?? "?"} ตร.ม. ราคา ${price.toLocaleString("en-US")} บาท (FazWaz #${raw.listing_id})`,
    ),
    description: i18nTriple(
      raw.description
        ? String(raw.description).slice(0, 1200)
        : `Normalized from FazWaz listing ${raw.listing_id} on fazwaz.co.th. Price from public detail dataLayer/title.`,
      `来自 FazWaz 挂牌 ${raw.listing_id}（fazwaz.co.th 公开页）。`,
      `แปลงจากประกาศ FazWaz ${raw.listing_id} บน fazwaz.co.th`,
    ),
    featured: false,
    source: SOURCE,
    listing_url: raw.listing_url,
    source_updated_at: today,
    collected_at: today,
    source_captured_at: today,
    verification_status: "verified",
    publish_ready: true,
    listing_lifecycle_status: "active",
    images: [],
  };

  const identity = deriveListingIdentity(base);
  return {
    ...base,
    ...identity,
    source_listing_id: String(raw.listing_id),
  };
}
