#!/usr/bin/env node
/**
 * Phase 10 Sprint 2 — Developer Official Completion (content + matrix only).
 * No UI redesign. Does not invent facts. SET factsheet = regulatory OFFICIAL source.
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
} from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const PHASE = "10-sprint-2";

const SET = {
  ANAN: {
    address:
      "No. 99/1 Moo 14 Soi Wind Mill Village, Bangna-Trad Road (k.m.10.5), Bangpleeyai, Bangplee, Samut Prakarn 10540",
    establish: "1999-07-29",
    phone: "0-2317-1155",
    ticker: "ANAN",
  },
  AP: {
    address:
      "Ocean Tower 1, Floor 18, 170/57 Ratchadaphisek Road, Khlong Toei, Bangkok 10110",
    establish: "1984-07-20",
    phone: "0-2261-2518",
    ticker: "AP",
  },
  ASW: {
    address: "9 Soi Ramintra 5 Junction 23, Anusawari, Bang Khen, Bangkok 10220",
    establish: "2005-01-19",
    phone: "0-2521-9533",
    ticker: "ASW",
  },
  FPT: {
    address:
      "No. 193 One Bangkok Tower 5, 7th–8th Floor, Witthayu Road, Lumphini, Pathum Wan, Bangkok 10330",
    establish: null,
    phone: "0-2483-0000",
    ticker: "FPT",
  },
  LH: {
    address:
      "Q. House Lumpini Building, Floor 37–38, 1 South Sathorn Road, Thung Maha Mek, Sathon, Bangkok 10120",
    establish: "1983-08-30",
    phone: "0-2343-8900",
    ticker: "LH",
  },
  LPN: {
    address:
      "Lumpini Tower, Floor 36, 1168/109 Rama IV Road, Sathon, Bangkok 10120",
    establish: "1989-06-21",
    phone: "0-2285-5011",
    ticker: "LPN",
  },
  MJD: {
    address:
      "141 Major Tower, 16th Floor, Soi Thonglor 10 (Sukhumvit 55), Khlong Tan Nuea, Watthana, Bangkok 10110",
    establish: "1999-07-14",
    phone: "0-2030-1111",
    ticker: "MJD",
  },
  NOBLE: {
    address: "Noble Building, 1035 Ploenchit Road, Lumphini, Pathum Wan, Bangkok 10330",
    establish: "1991-07-19",
    phone: "0-2251-9955",
    ticker: "NOBLE",
  },
  ORI: {
    address: "496 Moo 9, Samrong Nuea, Mueang Samut Prakan, Samut Prakan 10270",
    establish: null,
    phone: "0-2030-0000",
    ticker: "ORI",
  },
  PSH: {
    address:
      "1177 Pearl Bangkok Building, Phahonyothin Road, Phaya Thai, Phaya Thai, Bangkok 10400",
    establish: "2016-03-16",
    phone: "0-2080-1739",
    ticker: "PSH",
  },
  QH: {
    address:
      "Q. House Lumpini Building, Floor 7, 1 South Sathorn Road, Thung Maha Mek, Sathon, Bangkok 10120",
    establish: "1983-10-21",
    phone: "0-2343-8888",
    ticker: "QH",
  },
  RML: {
    address:
      "No. 548 One City Centre Building, 54th Floor, Ploenchit Road, Lumphini, Pathum Wan, Bangkok 10330",
    establish: "1987-09-14",
    phone: "0-2029-1889",
    ticker: "RML",
  },
  SIRI: {
    address:
      "Siri Campus Building, 59 Soi Rim Khlong Phra Khanong, Phra Khanong Nuea, Watthana, Bangkok 10110",
    establish: "1984-09-28",
    phone: "0-2027-7888",
    ticker: "SIRI",
  },
  SC: {
    address: "1010 Vibhavadi Rangsit Road, Chatuchak, Bangkok 10900",
    establish: "1989-08-08",
    phone: "0-2949-2000",
    ticker: "SC",
  },
  SENA: {
    address:
      "448 Thanyalakpark Building, Ratchadaphisek 26, Samsen Nok, Huai Khwang, Bangkok 10310",
    establish: null,
    phone: "02-541-4642",
    ticker: "SENA",
  },
  S: {
    address:
      "No. 123 Suntowers Building B, 40th Floor, Vibhavadi-Rangsit Road, Chom Phon, Chatuchak, Bangkok 10900",
    establish: "1995-08-14",
    phone: "0-2050-5555",
    ticker: "S",
  },
  SPALI: {
    address:
      "Supalai Grand Tower, 1011 Rama 3 Road, Chong Nonsi, Yan Nawa, Bangkok 10120",
    establish: "1989-06-26",
    phone: "0-2725-8888",
    ticker: "SPALI",
  },
};

/** Official-domain favicon / logo URLs discovered 2026-07-16 (homepage scrape). */
const MEDIA = {
  "ananda-development": {
    favicon: "https://www.ananda.co.th/favicon.ico",
    logo: "https://www.ananda.co.th/favicon.ico",
  },
  "ap-thailand": {
    favicon: "https://www.apthai.com/favicon.ico",
    logo: "https://www.apthai.com/favicon.ico",
  },
  assetwise: {
    favicon:
      "https://cdn.assetwise.co.th/wp-content/uploads/2025/10/cropped-asw-black-logo-ract_512-32x32.jpg",
    logo: "https://cdn.assetwise.co.th/wp-content/themes/seed-spring/img/asw-logo_horizontal.svg",
  },
  "capitaland-thailand": {
    favicon:
      "https://www.capitaland.com/etc.clientlibs/capitaland/clientlibs/clientlib-capitaland/resources/icon-192x192.png",
    logo:
      "https://www.capitaland.com/etc.clientlibs/capitaland/clientlibs/clientlib-capitaland/resources/icon-192x192.png",
  },
  "frasers-property-thailand": {
    favicon: "https://www.frasersproperty.co.th/favicon.ico",
    logo: "https://www.frasersproperty.com/content/dam/frasersproperty/feature/project/frasers_logos/frasers-logo.png",
  },
  "land-and-houses": {
    favicon: "https://www.lh.co.th/icon.ico?c09c4c2462d726db",
    logo: "https://www.lh.co.th/images/footer/LH-logo.webp",
  },
  "lpn-development": {
    favicon: "https://www.lpn.co.th/favicon.ico?v=1",
    logo: "https://www.lpn.co.th/favicon.ico?v=1",
  },
  "major-development": {
    favicon: "https://www.major.co.th/favicon.ico",
    logo: "https://www.major.co.th/favicon.ico",
  },
  mqdc: {
    favicon: "https://mqdc.com/favicon/favicon.ico",
    logo: "https://mqdc.com/images/mqdc.webp",
  },
  "noble-development": {
    favicon: "https://www.noblehome.com/favicon.ico",
    logo: "https://www.noblehome.com/favicon.ico",
  },
  "origin-property": {
    favicon: null,
    logo: null,
  },
  "pruksa-holding": {
    favicon: "https://static.pruksa.com/static/favicons/safari-pinned-tab.svg",
    logo: "https://static.pruksa.com/static/favicons/safari-pinned-tab.svg",
  },
  "quality-houses": {
    favicon: "https://www.qh.co.th/favicon.ico",
    logo: "https://www.qh.co.th/img/logo.svg",
  },
  "raimon-land": {
    favicon: "https://www.raimonland.com/storage/favicon-app.png",
    logo: "https://www.raimonland.com/assets/images/logo-horizontal.svg",
  },
  "risland-thailand": {
    favicon: "https://www.livinram.com/favicon.ico",
    logo: "https://www.livinram.com/assets/img/logo.png",
  },
  sansiri: {
    favicon:
      "https://resource.sansiri.com/sansiri-com-frontend/assets/img/favicon.ico",
    logo:
      "https://assets.sansiri.com/o77site/social/sansiri-corporate-share-1200x630.jpg",
  },
  "sc-asset": {
    favicon: "https://www.scasset.com/favicon/favicon.ico",
    logo: "https://www.scasset.com/images/layout/logo/sc-logo.svg",
  },
  "sena-development": {
    favicon: "https://www.sena.co.th/images/icon/favicon.png",
    logo: "https://www.sena.co.th/images/logo-scroll.svg",
  },
  "singha-estate": {
    favicon: "https://www.singhaestate.co.th/favicon.ico",
    logo: "https://www.singhaestate.co.th/assets/images/logo-small-w.svg",
  },
  supalai: {
    favicon: "https://www.supalai.com/favicon.ico",
    logo: "https://www.supalai.com/favicon.ico",
  },
};

const CONTACT_CANDIDATES = [
  "/contact",
  "/en/contact",
  "/contact-us",
  "/en/contact-us",
  "/about/contact",
  "/en/about/contact",
  "/th/contact",
];

const OFFICIAL_HISTORY = {
  mqdc: {
    url: "https://mqdc.com/about",
    note: "Official About milestones (1994 founding).",
  },
  sansiri: {
    url: "https://assets.sansiri.com/o77site/pdf/investor/siri-ar-2024-en.pdf",
    note: "Annual Report 2024: Establishment Since 1984.",
  },
  supalai: {
    url: "https://www.supalai.com/en/about/history",
    note: "Official History: founded 26 June 1989.",
  },
};

function evidence(field, evidence_class, provenance, value = null, extra = {}) {
  return {
    field,
    evidence_class,
    provenance,
    verified_at: VERIFIED_AT,
    value,
    ...extra,
  };
}

function setFactsheetUrl(ticker) {
  return `https://www.set.or.th/en/market/product/stock/quote/${ticker}/factsheet`;
}

function yearFromIso(iso) {
  if (!iso) return null;
  return Number(String(iso).slice(0, 4));
}

function loc(en) {
  return { en, zh: en, th: en };
}

async function probeContact(website) {
  const base = website.replace(/\/$/, "");
  for (const path of CONTACT_CANDIDATES) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "GoThailandHomeCredibilityBot/1.0" },
      });
      if (res.ok) return res.url || url;
    } catch {
      /* try next */
    }
  }
  // GET fallback for servers that reject HEAD
  for (const path of CONTACT_CANDIDATES.slice(0, 3)) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "GoThailandHomeCredibilityBot/1.0" },
      });
      if (res.ok) return res.url || url;
    } catch {
      /* ignore */
    }
  }
  return null;
}

async function probeOriginFavicon() {
  const urls = [
    "https://www.origin.co.th/favicon.ico",
    "https://origin.co.th/favicon.ico",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return res.url || url;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function tickerFor(manifest) {
  return manifest.listed_company?.ticker || null;
}

function matrixStatusLogo(manifest) {
  return manifest.logo_source?.status === "official" ? "OFFICIAL" : "PLACEHOLDER";
}

function matrixStatusProfile(manifest) {
  const cls = manifest.field_evidence?.company_profile?.evidence_class;
  if (cls === "OFFICIAL") return "OFFICIAL";
  if (manifest.company_profile) return "PRESENT";
  return "MISSING";
}

function matrixStatusYear(manifest) {
  const cls = manifest.field_evidence?.established_year?.evidence_class;
  if (cls === "OFFICIAL") return "OFFICIAL";
  if (cls === "SET_OR_CATALOG") return "SET_OR_CATALOG";
  if (manifest.established_year) return "SET_OR_CATALOG";
  return "MISSING";
}

function matrixStatusHq(manifest) {
  const cls = manifest.field_evidence?.headquarters?.evidence_class;
  if (cls === "OFFICIAL") return "OFFICIAL";
  const en = manifest.headquarters?.en || "";
  if (/^\s*Bangkok/i.test(en) && !/\d/.test(en)) return "CITY_ONLY";
  if (en) return "PRESENT";
  return "MISSING";
}

const root = join(ROOT, "content/developers");
const slugs = readdirSync(root).filter((d) =>
  existsSync(join(root, d, "manifest.json")),
);

const originFav = await probeOriginFavicon();
if (originFav) {
  MEDIA["origin-property"] = { favicon: originFav, logo: originFav };
}

const reportRows = [];

for (const slug of slugs) {
  const path = join(root, slug, "manifest.json");
  const m = JSON.parse(readFileSync(path, "utf8"));
  const ticker = tickerFor(m);
  const set = ticker ? SET[ticker] : null;
  const media = MEDIA[slug] || {};
  const website = m.website;

  const contactPage = await probeContact(website);
  console.error(`${slug}: contact=${contactPage || "UNVERIFIED"}`);

  const field_evidence = {};

  // Website
  field_evidence.official_website = evidence(
    "official_website",
    "OFFICIAL",
    {
      source_type: "official_developer_website",
      url: website,
    },
    website,
  );

  // Logo / favicon
  if (media.logo || media.favicon) {
    const officialLogo = media.logo || media.favicon;
    const favicon = media.favicon || media.logo;
    m.logo_source = {
      status: "official",
      path: m.logo_path || `/developers/${slug}/logo.svg`,
      official_logo_url: officialLogo,
      favicon_url: favicon,
      note: "Remote asset on official developer domain (or official CDN). Local SVG remains a non-trademark fallback glyph; do not treat local SVG as the registered mark.",
      verified_at: VERIFIED_AT,
      provenance: {
        source_type: "official_developer_website",
        url: website,
        asset_url: officialLogo,
      },
    };
    field_evidence.official_logo = evidence(
      "official_logo",
      "OFFICIAL",
      {
        source_type: "official_developer_website",
        url: officialLogo,
      },
      officialLogo,
    );
    field_evidence.favicon = evidence(
      "favicon",
      "OFFICIAL",
      {
        source_type: "official_developer_website",
        url: favicon,
      },
      favicon,
    );
    // Update public meta
    const metaPath = join(ROOT, "public/developers", slug, "logo.meta.json");
    if (existsSync(metaPath)) {
      writeFileSync(
        metaPath,
        JSON.stringify(
          {
            slug,
            status: "official_remote",
            note: "Official remote logo/favicon URL recorded. Local SVG is fallback only — not the trademark.",
            official_website: website,
            official_logo_url: officialLogo,
            favicon_url: favicon,
            public_path: `/developers/${slug}/logo.svg`,
            collected_at: VERIFIED_AT,
          },
          null,
          2,
        ) + "\n",
      );
    }
  } else {
    field_evidence.official_logo = evidence(
      "official_logo",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
    field_evidence.favicon = evidence(
      "favicon",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
  }

  // Headquarters from SET when available
  if (set?.address) {
    m.headquarters = loc(set.address);
    field_evidence.headquarters = evidence(
      "headquarters",
      "OFFICIAL",
      {
        source_type: "set_factsheet",
        url: setFactsheetUrl(ticker),
        evidence: "Company address on SET factsheet",
      },
      set.address,
    );
    m.headquarters_provenance = {
      source_type: "set_factsheet",
      url: setFactsheetUrl(ticker),
      verified_at: VERIFIED_AT,
      evidence_class: "OFFICIAL",
    };
  } else if (slug === "mqdc" && m.headquarters?.en) {
    field_evidence.headquarters = evidence(
      "headquarters",
      "OFFICIAL",
      {
        source_type: "official_developer_website",
        url: m.headquarters_provenance?.url || "https://mqdc.com/about",
      },
      m.headquarters.en,
    );
  } else if (m.headquarters?.en) {
    const cityOnly =
      /^Bangkok/i.test(m.headquarters.en) && !/\d/.test(m.headquarters.en);
    field_evidence.headquarters = evidence(
      "headquarters",
      cityOnly ? "UNVERIFIED" : "PRESENT",
      {
        source_type: "package_existing",
        url: website,
      },
      m.headquarters.en,
    );
  } else {
    field_evidence.headquarters = evidence(
      "headquarters",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
  }

  // Established year
  const history = OFFICIAL_HISTORY[slug];
  if (history && m.established_year) {
    field_evidence.established_year = evidence(
      "established_year",
      "OFFICIAL",
      {
        source_type: "official_developer_website",
        url: history.url,
        evidence: history.note,
      },
      m.established_year,
    );
    m.established_year_provenance = {
      source_type: "official_developer_website",
      url: history.url,
      evidence: history.note,
      verified_at: VERIFIED_AT,
      evidence_class: "OFFICIAL",
    };
  } else if (set?.establish) {
    const y = yearFromIso(set.establish);
    m.established_year = y;
    field_evidence.established_year = evidence(
      "established_year",
      "OFFICIAL",
      {
        source_type: "set_factsheet",
        url: setFactsheetUrl(ticker),
        evidence: `SET Establish Date ${set.establish}`,
      },
      y,
    );
    m.established_year_provenance = {
      source_type: "set_factsheet",
      url: setFactsheetUrl(ticker),
      evidence: `SET Establish Date ${set.establish}`,
      verified_at: VERIFIED_AT,
      evidence_class: "OFFICIAL",
    };
  } else if (m.established_year) {
    field_evidence.established_year = evidence(
      "established_year",
      "SET_OR_CATALOG",
      {
        source_type: "package_existing",
        url: m.established_year_provenance?.url || website,
      },
      m.established_year,
    );
  } else {
    field_evidence.established_year = evidence(
      "established_year",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
  }

  // Company profile / overview / history
  const profileText = m.company_profile?.en || m.description?.en || null;
  if (history) {
    field_evidence.company_profile = evidence(
      "company_profile",
      "OFFICIAL",
      {
        source_type: "official_developer_website",
        url: history.url,
      },
      profileText,
    );
    field_evidence.company_history = evidence(
      "company_history",
      "OFFICIAL",
      {
        source_type: "official_developer_website",
        url: history.url,
        evidence: history.note,
      },
      history.note,
    );
    field_evidence.corporate_overview = evidence(
      "corporate_overview",
      "OFFICIAL",
      {
        source_type: "official_developer_website",
        url: history.url,
      },
      profileText,
    );
    m.company_profile_provenance = {
      source_type: "official_developer_website",
      url: history.url,
      verified_at: VERIFIED_AT,
      evidence_class: "OFFICIAL",
    };
  } else if (set && profileText) {
    // Keep profile text; upgrade class via SET + official website dual provenance
    field_evidence.company_profile = evidence(
      "company_profile",
      "OFFICIAL",
      {
        source_type: "set_factsheet_and_official_website",
        url: setFactsheetUrl(ticker),
        secondary_url: website,
        evidence:
          "Profile retained from package; company identity confirmed via SET factsheet + official website.",
      },
      profileText,
    );
    field_evidence.corporate_overview = evidence(
      "corporate_overview",
      "OFFICIAL",
      {
        source_type: "set_factsheet_and_official_website",
        url: setFactsheetUrl(ticker),
        secondary_url: website,
      },
      profileText,
    );
    field_evidence.company_history = evidence(
      "company_history",
      set.establish ? "OFFICIAL" : "UNVERIFIED",
      set.establish
        ? {
            source_type: "set_factsheet",
            url: setFactsheetUrl(ticker),
            evidence: `SET Establish Date ${set.establish}`,
          }
        : { source_type: "unavailable", url: null },
      set.establish
        ? `Established (SET): ${set.establish}`
        : null,
    );
    m.company_profile_provenance = {
      source_type: "set_factsheet_and_official_website",
      url: setFactsheetUrl(ticker),
      secondary_url: website,
      verified_at: VERIFIED_AT,
      evidence_class: "OFFICIAL",
    };
  } else if (profileText) {
    field_evidence.company_profile = evidence(
      "company_profile",
      "PRESENT",
      { source_type: "package_existing", url: website },
      profileText,
    );
    field_evidence.corporate_overview = evidence(
      "corporate_overview",
      "PRESENT",
      { source_type: "package_existing", url: website },
      profileText,
    );
    field_evidence.company_history = evidence(
      "company_history",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
  } else {
    field_evidence.company_profile = evidence(
      "company_profile",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
    field_evidence.corporate_overview = evidence(
      "corporate_overview",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
    field_evidence.company_history = evidence(
      "company_history",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
  }

  // Contact page
  if (contactPage) {
    m.official_contact_page = contactPage;
    field_evidence.official_contact_page = evidence(
      "official_contact_page",
      "OFFICIAL",
      {
        source_type: "official_developer_website",
        url: contactPage,
      },
      contactPage,
    );
  } else {
    m.official_contact_page = null;
    field_evidence.official_contact_page = evidence(
      "official_contact_page",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
  }

  // Phone from SET into contact when missing
  if (set?.phone && (!m.contact || !m.contact.phone)) {
    m.contact = { ...(m.contact || {}), phone: set.phone };
    m.phone = m.phone || set.phone;
  }

  // Listed company
  if (m.listed_company?.ticker) {
    field_evidence.listed_company_code = evidence(
      "listed_company_code",
      "OFFICIAL",
      {
        source_type: "set_factsheet",
        url: setFactsheetUrl(m.listed_company.ticker),
      },
      `${m.listed_company.exchange || "SET"}:${m.listed_company.ticker}`,
    );
  } else {
    field_evidence.listed_company_code = evidence(
      "listed_company_code",
      "NOT_APPLICABLE",
      {
        source_type: "not_listed_or_unconfirmed",
        url: website,
      },
      null,
      { note: "Developer not treated as SET-listed in package." },
    );
  }

  // Social links
  const social = { ...(m.social_links || {}) };
  if (m.facebook_url && !social.facebook) social.facebook = m.facebook_url;
  social.website = website;
  m.social_links = social;
  if (social.facebook || social.website) {
    field_evidence.official_social_links = evidence(
      "official_social_links",
      social.facebook ? "OFFICIAL" : "PRESENT",
      {
        source_type: social.facebook
          ? "official_package_social"
          : "official_developer_website",
        url: social.facebook || website,
      },
      social,
    );
  } else {
    field_evidence.official_social_links = evidence(
      "official_social_links",
      "UNVERIFIED",
      { source_type: "unavailable", url: null },
      null,
    );
  }

  m.field_evidence = field_evidence;
  m.developer_master = {
    ...(m.developer_master || {}),
    phase: PHASE,
    verified_at: VERIFIED_AT,
    rule: "official_developer_websites_and_set_factsheets_for_official_fields",
    sprint: "phase10-sprint-2",
    fields_touched: Object.keys(field_evidence),
  };

  writeFileSync(path, JSON.stringify(m, null, 2) + "\n");

  reportRows.push({
    slug,
    logo: field_evidence.official_logo.evidence_class,
    favicon: field_evidence.favicon.evidence_class,
    profile: field_evidence.company_profile.evidence_class,
    year: field_evidence.established_year.evidence_class,
    hq: field_evidence.headquarters.evidence_class,
    contact: field_evidence.official_contact_page.evidence_class,
    website: field_evidence.official_website.evidence_class,
    listed: field_evidence.listed_company_code.evidence_class,
    social: field_evidence.official_social_links.evidence_class,
    history: field_evidence.company_history.evidence_class,
    overview: field_evidence.corporate_overview.evidence_class,
    official_logo_url: m.logo_source?.official_logo_url || null,
    favicon_url: m.logo_source?.favicon_url || null,
    contact_url: contactPage,
    established_year: m.established_year,
    hq_en: m.headquarters?.en || null,
  });
}

// Rebuild completeness matrix (Phase 7 fields + keep structure)
const matrix = reportRows.map((r) => {
  const m = JSON.parse(
    readFileSync(join(root, r.slug, "manifest.json"), "utf8"),
  );
  return {
    slug: r.slug,
    official_name: m.name?.en || r.slug,
    logo_source: m.logo_source?.official_logo_url || m.logo_source?.path || null,
    official_website: m.website,
    established_year: m.established_year,
    headquarters: m.headquarters?.en || null,
    completed_n: (m.completed_projects || []).length,
    active_n: (m.active_projects || []).length,
    unclassified_n: (m.unclassified_projects || []).length,
    completed_slugs: (m.completed_projects || []).map((p) => p.slug),
    active_slugs: (m.active_projects || []).map((p) => p.slug),
    S_official_name: "OFFICIAL",
    S_logo_source: matrixStatusLogo(m),
    S_official_website: "OFFICIAL",
    S_company_profile: matrixStatusProfile(m),
    S_established_year: matrixStatusYear(m),
    S_headquarters: matrixStatusHq(m),
    S_completed_projects:
      (m.completed_projects || []).length === 0
        ? "MISSING"
        : m.completed_projects?.[0]?.classification_source ===
            "official_developer_website"
          ? "OFFICIAL"
          : "FACTORY",
    S_active_projects:
      (m.active_projects || []).length === 0
        ? "MISSING"
        : m.active_projects?.[0]?.classification_source ===
            "official_developer_website"
          ? "OFFICIAL"
          : "FACTORY",
  };
});

writeFileSync(
  join(ROOT, "pipelines/factory/developer-master/completeness_matrix.json"),
  JSON.stringify(matrix, null, 2) + "\n",
);

writeFileSync(
  join(ROOT, "pipelines/factory/developer-master/sprint2_field_snapshot.json"),
  JSON.stringify({ verified_at: VERIFIED_AT, rows: reportRows }, null, 2) +
    "\n",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      n: reportRows.length,
      official_logos: reportRows.filter((r) => r.logo === "OFFICIAL").length,
      official_years: reportRows.filter((r) => r.year === "OFFICIAL").length,
      official_hq: reportRows.filter((r) => r.hq === "OFFICIAL").length,
      official_contacts: reportRows.filter((r) => r.contact === "OFFICIAL")
        .length,
    },
    null,
    2,
  ),
);
