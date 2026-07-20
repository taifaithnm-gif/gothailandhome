/**
 * P1-09 — Property card presentation helpers.
 * Only surface sourced values; missing fields stay explicitly unknown.
 * No new source fields and no invented facts.
 */

export type LocalizedName = { en: string; zh?: string; th?: string };

export function sourcedText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function displayCardValue(
  value: string | number | null | undefined,
  unknown: string,
): string {
  if (value == null) return unknown;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : unknown;
  }
  if (typeof value === "number" && !Number.isFinite(value)) return unknown;
  return String(value);
}

/** Bedroom 0 is a sourced studio; null/undefined remain unknown. */
export function formatCardBedrooms(
  bedrooms: number | null | undefined,
  studioLabel: string,
  unknown: string,
): string {
  if (bedrooms == null || !Number.isFinite(bedrooms)) return unknown;
  if (bedrooms === 0) return studioLabel;
  return String(bedrooms);
}

export function formatCardArea(
  areaSqm: number | null | undefined,
  landAreaSqm: number | null | undefined,
  sqmLabel: string,
  unknown: string,
): string {
  if (areaSqm != null && Number.isFinite(areaSqm)) {
    return `${areaSqm} ${sqmLabel}`;
  }
  if (landAreaSqm != null && Number.isFinite(landAreaSqm)) {
    return `${landAreaSqm} ${sqmLabel}`;
  }
  return unknown;
}

export function cardLocationLabel(
  districtName: LocalizedName | null | undefined,
  location: LocalizedName | null | undefined,
  locale: keyof LocalizedName,
): string | null {
  const district =
    sourcedText(districtName?.[locale]) || sourcedText(districtName?.en);
  if (district) return district;
  return sourcedText(location?.[locale]) || sourcedText(location?.en);
}

export function cardProjectLabel(
  projectSlug: string | null | undefined,
  projectName: LocalizedName | null | undefined,
  locale: keyof LocalizedName,
): string | null {
  if (!sourcedText(projectSlug)) return null;
  return (
    sourcedText(projectName?.[locale]) || sourcedText(projectName?.en) || null
  );
}

export function isSourcedPrice(priceThb: number | null | undefined): boolean {
  return priceThb != null && Number.isFinite(priceThb) && priceThb > 0;
}

export function cardMediaAlt(
  title: string,
  typeLabel: string,
  locationLabel: string | null,
): string {
  const bits = [sourcedText(title), sourcedText(typeLabel), locationLabel].filter(
    Boolean,
  );
  return bits.join(" · ");
}

export function cardTransitLabels(
  tags: string[] | null | undefined,
  labels: { bts: string; mrt: string },
): string[] {
  if (!tags?.length) return [];
  const out: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();
    if (tag === "bts") out.push(labels.bts);
    else if (tag === "mrt") out.push(labels.mrt);
    else if (sourcedText(raw)) out.push(raw.trim());
  }
  return out;
}
