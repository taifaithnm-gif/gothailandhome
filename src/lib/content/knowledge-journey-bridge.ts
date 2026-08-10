import {
  getFeaturedLaunchProjects,
  getLaunchAreas,
  type LaunchFeaturedProject,
  type LocalizedString,
} from "@/lib/launch/content-launch-v1";

export type KnowledgeJourneyArea = {
  id: string;
  path: string;
  name: LocalizedString;
};

export type KnowledgeJourneyArticle = {
  slug: string;
  path: string;
  title: LocalizedString;
};

/**
 * Map knowledge articles → specific featured projects (existing corpus only).
 */
const ARTICLE_PROJECT_IDS: Record<string, string[]> = {
  "thailand-property-buying-guide": [
    "life-asoke-rama-9",
    "knightsbridge-prime-sathorn",
    "xt-phayathai",
  ],
  "thailand-condo-guide": [
    "modiz-rhyme-ramkhamhaeng",
    "rhythm-ekkamai",
    "the-line-sukhumvit-101",
  ],
  "thailand-luxury-condo-guide": [
    "life-one-wireless",
    "supalai-oriental-sukhumvit-39",
    "whizdom-essence",
  ],
  "thailand-area-selection-guide": [
    "rhythm-ekkamai",
    "life-ladprao",
    "xt-huai-khwang",
  ],
  "thailand-developer-guide": [
    "life-asoke-rama-9",
    "xt-phayathai",
    "knightsbridge-prime-sathorn",
  ],
  "foreign-ownership-thailand": [
    "the-line-sukhumvit-101",
    "life-one-wireless",
    "modiz-rhyme-ramkhamhaeng",
  ],
  "rental-investment-thailand": [
    "life-ladprao",
    "the-livin-ramkhamhaeng",
    "xt-huai-khwang",
  ],
  "thailand-property-investment-basics": [
    "modiz-rhyme-ramkhamhaeng",
    "life-asoke-rama-9",
    "rhythm-ekkamai",
  ],
  "freehold-vs-leasehold-thailand": [
    "knightsbridge-prime-sathorn",
    "supalai-oriental-sukhumvit-39",
    "whizdom-essence",
  ],
  "family-living-thailand": [
    "whizdom-essence",
    "rhythm-ekkamai",
    "life-ladprao",
  ],
  "thailand-retirement-guide": [
    "life-one-wireless",
    "supalai-oriental-sukhumvit-39",
    "xt-phayathai",
  ],
  "thailand-education-guide": [
    "rhythm-ekkamai",
    "whizdom-essence",
    "life-ladprao",
  ],
  "thailand-healthcare-guide": [
    "life-one-wireless",
    "supalai-oriental-sukhumvit-39",
    "xt-phayathai",
  ],
  "thailand-visa-guide": [
    "life-asoke-rama-9",
    "the-line-sukhumvit-101",
    "knightsbridge-prime-sathorn",
  ],
  "thailand-mortgage-guide": [
    "modiz-rhyme-ramkhamhaeng",
    "the-livin-ramkhamhaeng",
    "xt-huai-khwang",
  ],
  "thailand-property-tax-guide": [
    "life-asoke-rama-9",
    "knightsbridge-prime-sathorn",
    "rhythm-ekkamai",
  ],
};

/** Related city / area paths already published on the platform. */
const ARTICLE_AREA_IDS: Record<string, string[]> = {
  "thailand-area-selection-guide": ["bangkok"],
  "thailand-condo-guide": ["bangkok"],
  "thailand-property-buying-guide": ["bangkok"],
  "thailand-luxury-condo-guide": ["bangkok"],
  "rental-investment-thailand": ["bangkok"],
  "thailand-property-investment-basics": ["bangkok"],
  "family-living-thailand": ["bangkok"],
  "thailand-retirement-guide": ["bangkok", "chiang-mai", "pattaya", "phuket"],
  "thailand-education-guide": ["bangkok"],
  "thailand-healthcare-guide": ["bangkok"],
  "thailand-developer-guide": ["bangkok"],
  "foreign-ownership-thailand": ["bangkok"],
  "freehold-vs-leasehold-thailand": ["bangkok"],
};

/** Fallback related knowledge when an article has few internal links. */
const ARTICLE_RELATED_KNOWLEDGE: Record<string, string[]> = {
  "thailand-property-buying-guide": [
    "foreign-ownership-thailand",
    "thailand-condo-guide",
    "thailand-property-transfer-guide",
  ],
  "thailand-condo-guide": [
    "foreign-ownership-thailand",
    "freehold-vs-leasehold-thailand",
    "thailand-property-buying-guide",
  ],
  "foreign-ownership-thailand": [
    "thailand-property-buying-guide",
    "freehold-vs-leasehold-thailand",
    "thailand-visa-guide",
  ],
  "rental-investment-thailand": [
    "thailand-property-investment-basics",
    "thailand-property-tax-guide",
    "thailand-condo-guide",
  ],
  "thailand-property-investment-basics": [
    "rental-investment-thailand",
    "thailand-area-selection-guide",
    "thailand-developer-guide",
  ],
  "family-living-thailand": [
    "thailand-education-guide",
    "thailand-healthcare-guide",
    "thailand-area-selection-guide",
  ],
  "thailand-retirement-guide": [
    "thailand-healthcare-guide",
    "thailand-visa-guide",
    "thailand-area-selection-guide",
  ],
  "thailand-developer-guide": [
    "thailand-condo-guide",
    "thailand-property-buying-guide",
    "thailand-area-selection-guide",
  ],
  "thailand-area-selection-guide": [
    "thailand-condo-guide",
    "family-living-thailand",
    "thailand-property-investment-basics",
  ],
  "freehold-vs-leasehold-thailand": [
    "foreign-ownership-thailand",
    "thailand-condo-guide",
    "thailand-property-buying-guide",
  ],
  "thailand-luxury-condo-guide": [
    "thailand-condo-guide",
    "thailand-area-selection-guide",
    "thailand-developer-guide",
  ],
  "thailand-visa-guide": [
    "foreign-ownership-thailand",
    "thailand-retirement-guide",
    "thailand-property-buying-guide",
  ],
  "thailand-mortgage-guide": [
    "thailand-property-buying-guide",
    "thailand-property-tax-guide",
    "thailand-condo-guide",
  ],
  "thailand-property-tax-guide": [
    "thailand-property-buying-guide",
    "thailand-land-building-tax",
    "rental-investment-thailand",
  ],
  "thailand-education-guide": [
    "family-living-thailand",
    "thailand-area-selection-guide",
    "thailand-healthcare-guide",
  ],
  "thailand-healthcare-guide": [
    "thailand-retirement-guide",
    "family-living-thailand",
    "thailand-area-selection-guide",
  ],
};

const DEFAULT_RELATED_KNOWLEDGE = [
  "thailand-property-buying-guide",
  "foreign-ownership-thailand",
  "thailand-condo-guide",
];

const MAX_PROJECTS = 3;
const MAX_AREAS = 3;
const MAX_KNOWLEDGE = 3;

const KNOWLEDGE_TITLES: Record<string, LocalizedString> = {
  "thailand-property-buying-guide": {
    en: "How to buy property in Thailand",
    zh: "外国人泰国购房全流程指南",
    th: "วิธีซื้ออสังหาริมทรัพย์ในประเทศไทย",
  },
  "foreign-ownership-thailand": {
    en: "Foreign property ownership in Thailand",
    zh: "泰国外国人产权规则",
    th: "การถือครองอสังหาริมทรัพย์ของชาวต่างชาติในไทย",
  },
  "thailand-condo-guide": {
    en: "Buying a condo in Thailand",
    zh: "在泰国买公寓",
    th: "ซื้อคอนโดในประเทศไทย",
  },
  "freehold-vs-leasehold-thailand": {
    en: "Freehold vs leasehold in Thailand",
    zh: "泰国永久产权与租赁权对比",
    th: "ฟรีโฮลด์กับสิทธิการเช่าในไทย",
  },
  "thailand-property-transfer-guide": {
    en: "Ownership transfer process",
    zh: "产权过户流程",
    th: "ขั้นตอนการโอนกรรมสิทธิ์",
  },
  "thailand-property-tax-guide": {
    en: "Taxes and fees when buying",
    zh: "购房税费",
    th: "ภาษีและค่าธรรมเนียมเมื่อซื้อ",
  },
  "thailand-land-building-tax": {
    en: "Land and building tax",
    zh: "土地与建筑税",
    th: "ภาษีที่ดินและสิ่งปลูกสร้าง",
  },
  "rental-investment-thailand": {
    en: "Renting out property in Thailand",
    zh: "在泰国出租房产",
    th: "การปล่อยเช่าอสังหาริมทรัพย์ในไทย",
  },
  "thailand-property-investment-basics": {
    en: "Property investment basics",
    zh: "泰国房产投资基础",
    th: "พื้นฐานการลงทุนอสังหาริมทรัพย์",
  },
  "thailand-area-selection-guide": {
    en: "How to choose where to buy",
    zh: "如何选择在泰国哪里买房",
    th: "จะเลือกซื้อที่ไหนในประเทศไทย",
  },
  "thailand-developer-guide": {
    en: "How to evaluate a developer",
    zh: "如何评估开发商",
    th: "วิธีประเมินผู้พัฒนา",
  },
  "family-living-thailand": {
    en: "Family living in Thailand",
    zh: "泰国家庭生活",
    th: "ชีวิตครอบครัวในประเทศไทย",
  },
  "thailand-retirement-guide": {
    en: "Retirement in Thailand",
    zh: "在泰国退休置业",
    th: "เกษียณในประเทศไทย",
  },
  "thailand-education-guide": {
    en: "International schools in Thailand",
    zh: "泰国国际学校指南",
    th: "โรงเรียนนานาชาติในประเทศไทย",
  },
  "thailand-healthcare-guide": {
    en: "Healthcare in Thailand",
    zh: "泰国医疗指南",
    th: "การดูแลสุขภาพในประเทศไทย",
  },
  "thailand-visa-guide": {
    en: "Visas for property buyers",
    zh: "购房相关签证",
    th: "วีซ่าสำหรับผู้ซื้ออสังหาริมทรัพย์",
  },
  "thailand-mortgage-guide": {
    en: "Mortgage options in Thailand",
    zh: "泰国房贷指南",
    th: "สินเชื่อที่อยู่อาศัยในไทย",
  },
  "thailand-luxury-condo-guide": {
    en: "Luxury condos in Thailand",
    zh: "泰国豪华公寓指南",
    th: "คอนโดหรูในประเทศไทย",
  },
};

export function getKnowledgeBridgeProjects(
  articleSlug: string,
): LaunchFeaturedProject[] {
  const featured = getFeaturedLaunchProjects();
  const byId = new Map(featured.map((p) => [p.project_id, p]));
  const preferred = ARTICLE_PROJECT_IDS[articleSlug] ?? [];
  const picked: LaunchFeaturedProject[] = [];

  for (const id of preferred) {
    const project = byId.get(id);
    if (project) picked.push(project);
    if (picked.length >= MAX_PROJECTS) return picked;
  }

  for (const project of featured) {
    if (picked.some((p) => p.project_id === project.project_id)) continue;
    picked.push(project);
    if (picked.length >= MAX_PROJECTS) break;
  }

  return picked;
}

export function getKnowledgeBridgeAreas(
  articleSlug: string,
): KnowledgeJourneyArea[] {
  const areas = getLaunchAreas();
  const byId = new Map(areas.map((a) => [a.area_id, a]));
  const preferred = ARTICLE_AREA_IDS[articleSlug] ?? ["bangkok"];
  const picked: KnowledgeJourneyArea[] = [];

  for (const id of preferred) {
    const area = byId.get(id);
    if (!area) continue;
    picked.push({
      id: area.area_id,
      path: `/cities/${area.area_id}`,
      name: area.area_name,
    });
    if (picked.length >= MAX_AREAS) break;
  }

  if (!picked.length) {
    const bangkok = byId.get("bangkok");
    if (bangkok) {
      picked.push({
        id: bangkok.area_id,
        path: `/cities/${bangkok.area_id}`,
        name: bangkok.area_name,
      });
    }
  }

  return picked;
}

/**
 * Prefer article-authored related knowledge links; fall back to curated map.
 */
export function getKnowledgeBridgeArticles(
  articleSlug: string,
  relatedLinks: { path: string; label: string }[] = [],
): KnowledgeJourneyArticle[] {
  const picked: KnowledgeJourneyArticle[] = [];
  const seen = new Set<string>([articleSlug]);

  for (const link of relatedLinks) {
    const match = link.path.match(/^\/knowledge\/articles\/([^/?#]+)/);
    if (!match) continue;
    const slug = match[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    const title = KNOWLEDGE_TITLES[slug] ?? {
      en: link.label,
      zh: link.label,
      th: link.label,
    };
    picked.push({
      slug,
      path: `/knowledge/articles/${slug}`,
      title,
    });
    if (picked.length >= MAX_KNOWLEDGE) return picked;
  }

  const fallback =
    ARTICLE_RELATED_KNOWLEDGE[articleSlug] ?? DEFAULT_RELATED_KNOWLEDGE;
  for (const slug of fallback) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    const title = KNOWLEDGE_TITLES[slug];
    if (!title) continue;
    picked.push({
      slug,
      path: `/knowledge/articles/${slug}`,
      title,
    });
    if (picked.length >= MAX_KNOWLEDGE) break;
  }

  return picked;
}
