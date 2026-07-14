import type { Locale } from "@/config/locales";

export type PropertyType = "condo" | "house" | "villa" | "townhouse";

export type Property = {
  id: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  priceThb: number;
  featured?: boolean;
  title: Record<Locale, string>;
  location: Record<Locale, string>;
  summary: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const properties: Property[] = [
  {
    id: "bangkok-riverside-condo",
    type: "condo",
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 78,
    priceThb: 8900000,
    featured: true,
    title: {
      en: "Riverside Condo with City View",
      zh: "河景城市景观公寓",
      th: "คอนโดริมน้ำวิวเมือง",
    },
    location: {
      en: "Riverside, Bangkok",
      zh: "曼谷河畔",
      th: "ริมน้ำ กรุงเทพฯ",
    },
    summary: {
      en: "Modern 2-bedroom condo near BTS with river views.",
      zh: "紧邻 BTS 的现代化两居室公寓，享有河景。",
      th: "คอนโด 2 ห้องนอนทันสมัยใกล้ BTS พร้อมวิวแม่น้ำ",
    },
    description: {
      en: "Placeholder listing for a riverside condominium in Bangkok. Includes balcony views, shared facilities, and convenient transit access. Details are sample content for MVP preview only.",
      zh: "曼谷河畔公寓占位房源。含阳台景观、公共配套与便捷交通。内容仅为 MVP 占位信息。",
      th: "ประกาศตัวอย่างคอนโดริมน้ำในกรุงเทพฯ มีวิวระเบียง สิ่งอำนวยความสะดวก และเดินทางสะดวก ข้อมูลนี้ใช้สำหรับ MVP เท่านั้น",
    },
  },
  {
    id: "phuket-pool-villa",
    type: "villa",
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 220,
    priceThb: 18500000,
    featured: true,
    title: {
      en: "Pool Villa Near the Beach",
      zh: "近海滩私人泳池别墅",
      th: "พูลวิลล่าใกล้ชายหาด",
    },
    location: {
      en: "Cherngtalay, Phuket",
      zh: "普吉岛诚泰莱",
      th: "เชิงทะเล ภูเก็ต",
    },
    summary: {
      en: "Private pool villa with tropical garden and guest pavilion.",
      zh: "带私人泳池、热带花园与客房的别墅。",
      th: "วิลล่าสระว่ายน้ำส่วนตัวพร้อมสวนเขตร้อนและศาลาแขก",
    },
    description: {
      en: "Placeholder listing for a Phuket villa lifestyle property. Ideal for long-stay or holiday use. All details are fictional placeholders.",
      zh: "普吉别墅生活方式占位房源，适合长住或度假。所有信息均为虚构占位内容。",
      th: "ประกาศตัวอย่างวิลล่าภูเก็ตสำหรับพักระยะยาวหรือวันหยุด รายละเอียดทั้งหมดเป็นข้อมูลตัวอย่าง",
    },
  },
  {
    id: "chiang-mai-townhouse",
    type: "townhouse",
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 160,
    priceThb: 6200000,
    featured: true,
    title: {
      en: "Quiet Townhouse in Old City Area",
      zh: "古城附近安静联排别墅",
      th: "ทาวน์เฮาส์เงียบใกล้ย่านเมืองเก่า",
    },
    location: {
      en: "Nimman, Chiang Mai",
      zh: "清迈宁曼",
      th: "นิมมาน เชียงใหม่",
    },
    summary: {
      en: "Family-friendly townhouse close to cafes and schools.",
      zh: "靠近咖啡馆与学校的家庭友好型联排别墅。",
      th: "ทาวน์เฮาส์เหมาะกับครอบครัวใกล้คาเฟ่และโรงเรียน",
    },
    description: {
      en: "Placeholder townhouse listing in Chiang Mai with parking and a compact courtyard. Sample content only.",
      zh: "清迈联排别墅占位房源，含车位与小庭院。仅作示例内容。",
      th: "ประกาศตัวอย่างทาวน์เฮาส์เชียงใหม่พร้อมที่จอดรถและลานเล็ก เนื้อหาตัวอย่างเท่านั้น",
    },
  },
  {
    id: "hua-hin-beach-house",
    type: "house",
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 240,
    priceThb: 12800000,
    title: {
      en: "Beach House for Weekend Escapes",
      zh: "周末度假海滩别墅",
      th: "บ้านใกล้หาดสำหรับวันหยุดสุดสัปดาห์",
    },
    location: {
      en: "Hua Hin, Prachuap Khiri Khan",
      zh: "华欣，巴蜀府",
      th: "หัวหิน ประจวบคีรีขันธ์",
    },
    summary: {
      en: "Spacious house within short drive of the shoreline.",
      zh: "离海岸车程较短的宽敞别墅。",
      th: "บ้านกว้างขวางขับรถไม่ไกลจากชายฝั่ง",
    },
    description: {
      en: "Placeholder beach-adjacent house listing with outdoor dining space and garden. For MVP demonstration only.",
      zh: "近海滩别墅占位房源，含户外用餐区与花园。仅用于 MVP 演示。",
      th: "ประกาศตัวอย่างบ้านใกล้หาดพร้อมพื้นที่รับประทานอาหารกลางแจ้งและสวน สำหรับสาธิต MVP เท่านั้น",
    },
  },
  {
    id: "pattaya-sea-view-condo",
    type: "condo",
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 45,
    priceThb: 3900000,
    title: {
      en: "Sea-View Studio Condo",
      zh: "海景开间公寓",
      th: "คอนโดสตูดิโอวิวทะเล",
    },
    location: {
      en: "Wongamat, Pattaya",
      zh: "芭提雅翁阿玛",
      th: "วงศ์อมาตย์ พัทยา",
    },
    summary: {
      en: "Compact investment condo with balcony sea breeze.",
      zh: "紧凑型投资公寓，阳台可享海风。",
      th: "คอนโดลงทุนขนาดกะทัดรัดพร้อมระเบียงรับลมทะเล",
    },
    description: {
      en: "Placeholder investment-oriented condo listing in Pattaya. Sample pricing and features only.",
      zh: "芭提雅投资型公寓占位房源。价格与配置均为示例。",
      th: "ประกาศตัวอย่างคอนโดลงทุนในพัทยา ราคาและคุณสมบัติเป็นตัวอย่างเท่านั้น",
    },
  },
  {
    id: "bangkok-sukhumvit-condo",
    type: "condo",
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 52,
    priceThb: 7100000,
    title: {
      en: "Sukhumvit Transit Condo",
      zh: "素坤逸交通便利公寓",
      th: "คอนโดสุขุมวิทใกล้รถไฟฟ้า",
    },
    location: {
      en: "Sukhumvit, Bangkok",
      zh: "曼谷素坤逸",
      th: "สุขุมวิท กรุงเทพฯ",
    },
    summary: {
      en: "One-bedroom condo beside shopping and transit links.",
      zh: "紧邻购物与交通枢纽的一居室公寓。",
      th: "คอนโด 1 ห้องนอนใกล้อาคารช้อปปิ้งและการเดินทาง",
    },
    description: {
      en: "Placeholder condo listing for Bangkok's Sukhumvit corridor. Content is fictional and non-transactional.",
      zh: "曼谷素坤逸走廊公寓占位房源。内容为虚构，不构成交易信息。",
      th: "ประกาศตัวอย่างคอนโดย่านสุขุมวิท กรุงเทพฯ เป็นเนื้อหาสมมติ ไม่ใช่ข้อมูลการซื้อขายจริง",
    },
  },
];

export function getPropertyById(id: string): Property | undefined {
  return properties.find((property) => property.id === id);
}

export function getFeaturedProperties(): Property[] {
  return properties.filter((property) => property.featured);
}

export function searchProperties(params: {
  query?: string;
  location?: string;
  type?: string;
}): Property[] {
  const query = params.query?.trim().toLowerCase() ?? "";
  const location = params.location?.trim().toLowerCase() ?? "";
  const type = params.type?.trim().toLowerCase() ?? "";

  return properties.filter((property) => {
    const matchesType = !type || type === "all" || property.type === type;
    const haystack = [
      property.id,
      property.type,
      ...Object.values(property.title),
      ...Object.values(property.location),
      ...Object.values(property.summary),
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    const matchesLocation =
      !location ||
      Object.values(property.location).some((value) =>
        value.toLowerCase().includes(location),
      );

    return matchesType && matchesQuery && matchesLocation;
  });
}

export function formatPrice(priceThb: number, locale: Locale): string {
  const numberLocale =
    locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-US";

  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(priceThb);
}
