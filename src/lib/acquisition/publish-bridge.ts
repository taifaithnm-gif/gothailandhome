/**
 * P2-035 — Publish bridge mapping (design + helpers).
 * Only maps fields that exist on the acquisition case. Never invents catalog facts.
 */

export type AcquisitionCaseSnapshot = {
  id: string;
  titleHint: string | null;
  propertyType: string | null;
  listingType: string | null;
  priceText: string | null;
  projectName: string | null;
  bedroomsText: string | null;
  bathroomsText: string | null;
  areaText: string | null;
  locale: string;
  submitterName: string | null;
  notes: string | null;
};

export type DraftPropertyBridgeInput = {
  slug: string;
  status: "draft";
  listing_type: "sale" | "rent";
  property_type: "condo" | "house" | "villa" | "land" | "commercial";
  price_thb: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  title_en: string;
  title_zh: string;
  title_th: string;
  summary_en: string;
  summary_zh: string;
  summary_th: string;
  description_en: string;
  description_zh: string;
  description_th: string;
  /** Must be supplied by reviewer — never invented from case alone. */
  location_id: string;
  acquisition_case_id: string;
};

function parsePositiveNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function mapPropertyType(
  raw: string | null,
): "condo" | "house" | "villa" | "land" | "commercial" {
  const v = (raw ?? "").toLowerCase();
  if (v === "house" || v === "villa" || v === "land" || v === "commercial") {
    return v;
  }
  return "condo";
}

function mapListingType(raw: string | null): "sale" | "rent" {
  const v = (raw ?? "").toLowerCase();
  if (v === "rent" || v === "rental") return "rent";
  return "sale";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Build a draft property payload from evidenced case fields + required reviewer location_id.
 * Returns null if required evidenced fields are insufficient (no invention).
 */
export function buildDraftPropertyFromCase(
  caseRow: AcquisitionCaseSnapshot,
  locationId: string,
): DraftPropertyBridgeInput | { error: string } {
  if (!locationId.trim()) {
    return { error: "location_id is required from reviewer — not inferred." };
  }
  const price = parsePositiveNumber(caseRow.priceText);
  if (price == null) {
    return { error: "Cannot publish without stated numeric price." };
  }
  const titleBase =
    caseRow.titleHint?.trim() ||
    caseRow.projectName?.trim() ||
    null;
  if (!titleBase) {
    return { error: "Cannot publish without project/title identity." };
  }

  const titleEn = titleBase.slice(0, 160);
  const summary =
    `Acquisition case ${caseRow.id.slice(0, 8)}. Facts limited to submitter statements.`.slice(
      0,
      280,
    );
  const description = [
    caseRow.notes?.trim() || null,
    caseRow.projectName ? `Project (stated): ${caseRow.projectName}` : null,
    "Published via acquisition bridge as draft/public only after ops confirmation.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    slug: `${slugify(titleEn)}-acq-${caseRow.id.slice(0, 8)}`,
    status: "draft",
    listing_type: mapListingType(caseRow.listingType),
    property_type: mapPropertyType(caseRow.propertyType),
    price_thb: price,
    bedrooms: parsePositiveNumber(caseRow.bedroomsText),
    bathrooms: parsePositiveNumber(caseRow.bathroomsText),
    area_sqm: parsePositiveNumber(caseRow.areaText),
    title_en: titleEn,
    title_zh: titleEn,
    title_th: titleEn,
    summary_en: summary,
    summary_zh: summary,
    summary_th: summary,
    description_en: description,
    description_zh: description,
    description_th: description,
    location_id: locationId.trim(),
    acquisition_case_id: caseRow.id,
  };
}
