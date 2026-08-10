import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Map portal-controlled facility tags (often English in all locales) to
 * visitor-facing dictionary strings. Developer-branded proper names pass through.
 */
export function localizeFacilityLabel(
  dict: Dictionary,
  raw: string | null | undefined,
): string {
  const value = raw?.trim() ?? "";
  if (!value) return "";

  const tags = dict.facilityTags as Record<string, string> | undefined;
  const categories = dict.facilityCategories as Record<string, string> | undefined;

  const normalized = value
    .toLowerCase()
    .replace(/[/_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tagAliases: Record<string, string> = {
    "swimming pool": "swimmingPool",
    pool: "swimmingPool",
    "fitness gym": "fitnessGym",
    "fitness / gym": "fitnessGym",
    fitness: "fitnessGym",
    gym: "fitnessGym",
    parking: "parking",
    "24h security": "security24h",
    "24 hour security": "security24h",
    "24-hour security": "security24h",
    security: "security24h",
    "garden courtyard": "gardenCourtyard",
    "garden / courtyard": "gardenCourtyard",
    garden: "gardenCourtyard",
    courtyard: "gardenCourtyard",
    jacuzzi: "jacuzzi",
    elevator: "elevator",
    lift: "elevator",
    cctv: "cctv",
    "keycard access": "keycardAccess",
    keycard: "keycardAccess",
    "key card access": "keycardAccess",
    sauna: "sauna",
    "co working": "coworking",
    "co-working": "coworking",
    coworking: "coworking",
  };

  const tagKey = tagAliases[normalized];
  if (tagKey && tags?.[tagKey]?.trim()) {
    return tags[tagKey];
  }

  const categoryAliases: Record<string, string> = {
    retail: "retail",
    "retail destinations": "retail",
    hospitality: "hospitality",
    workplace: "workplace",
    workplaces: "workplace",
    "green & open spaces": "greenOpenSpaces",
    "green and open spaces": "greenOpenSpaces",
    "green open spaces": "greenOpenSpaces",
    amenities: "amenities",
    facility: "amenities",
    facilities: "amenities",
    recreation: "recreation",
    lifestyle: "lifestyle",
    parking: "parking",
    security: "security",
    fitness: "fitness",
    pool: "pool",
    swimming: "pool",
    "swimming pool": "pool",
  };

  const categoryKey = categoryAliases[normalized];
  if (
    categoryKey &&
    categories?.[categoryKey] &&
    typeof categories[categoryKey] === "string" &&
    categories[categoryKey].trim()
  ) {
    return categories[categoryKey];
  }

  return value;
}
