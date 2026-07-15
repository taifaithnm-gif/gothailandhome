import type { Locale } from "@/config/locales";

export type LocalizedText = Record<Locale, string>;

export type ProjectPoi = {
  name: LocalizedText;
  distance?: string;
  note?: LocalizedText;
  source?: string;
};

export type ProjectFacilityZone = {
  zone: LocalizedText;
  items: LocalizedText[];
  source?: string;
};

export type ProjectUnitType = {
  code: string;
  area_sqm: number;
  label: LocalizedText;
  source?: string;
};

export type ProjectFaq = {
  question: LocalizedText;
  answer: LocalizedText;
};

const LOCALES: Locale[] = ["en", "zh", "th"];

function emptyLocalized(): LocalizedText {
  return { en: "", zh: "", th: "" };
}

/**
 * Accept string or {en,zh,th} (partial). Returns null when there is no
 * displayable text in any locale — never invents placeholder place names.
 */
export function coerceLocalizedText(raw: unknown): LocalizedText | null {
  if (raw == null) return null;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    return { en: trimmed, zh: trimmed, th: trimmed };
  }

  if (typeof raw !== "object" || Array.isArray(raw)) return null;

  const obj = raw as Record<string, unknown>;
  const out = emptyLocalized();
  let hasAny = false;

  for (const locale of LOCALES) {
    const value = obj[locale];
    if (typeof value === "string" && value.trim()) {
      out[locale] = value.trim();
      hasAny = true;
    }
  }

  // Some harvested rows use `name` as a nested string field.
  if (!hasAny && typeof obj.name === "string" && obj.name.trim()) {
    const trimmed = obj.name.trim();
    return { en: trimmed, zh: trimmed, th: trimmed };
  }

  return hasAny ? out : null;
}

function hasAnyLocalizedText(text: LocalizedText): boolean {
  return LOCALES.some((locale) => Boolean(text[locale]?.trim()));
}

function displayLocalized(text: LocalizedText, locale: Locale): string {
  return (
    text[locale]?.trim() ||
    text.en?.trim() ||
    text.zh?.trim() ||
    text.th?.trim() ||
    ""
  );
}

function coerceDistance(raw: unknown): string | undefined {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    return `${Math.round(raw)} m`;
  }
  return undefined;
}

/**
 * Normalize one nearby/transport POI. Invalid or nameless entries are omitted
 * (caller filters null). Does not invent place names.
 */
export function normalizePoi(raw: unknown): ProjectPoi | null {
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    // Bare string POI name — keep only if non-empty; do not invent.
    const name = coerceLocalizedText(raw);
    if (!name) return null;
    return { name };
  }

  const obj = raw as Record<string, unknown>;
  const name =
    coerceLocalizedText(obj.name) ??
    coerceLocalizedText({
      en: obj.name_en,
      zh: obj.name_zh,
      th: obj.name_th,
    });

  if (!name || !hasAnyLocalizedText(name)) return null;

  const distance =
    coerceDistance(obj.distance) ?? coerceDistance(obj.distance_m);

  const note = coerceLocalizedText(obj.note) ?? undefined;
  const source = typeof obj.source === "string" ? obj.source : undefined;

  return {
    name,
    ...(distance ? { distance } : {}),
    ...(note && hasAnyLocalizedText(note) ? { note } : {}),
    ...(source ? { source } : {}),
  };
}

export function normalizePois(raw: unknown): ProjectPoi[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizePoi(item))
    .filter((item): item is ProjectPoi => item != null);
}

/**
 * Facilities may be:
 * - zoned: { zone: LocalizedText, items: LocalizedText[] }
 * - flat harvested: { key, name: LocalizedText, source }
 * - incomplete / null entries
 *
 * Flat items become a single zone with an empty zone label (UI hides empty headings).
 * Entries without a usable name are omitted — never fabricated.
 */
export function normalizeFacilities(raw: unknown): ProjectFacilityZone[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const looksZoned = raw.some(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      "zone" in (item as object) &&
      "items" in (item as object),
  );

  if (looksZoned) {
    const zones: ProjectFacilityZone[] = [];
    for (const entry of raw) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const obj = entry as Record<string, unknown>;
      const zone =
        coerceLocalizedText(obj.zone) ??
        emptyLocalized(); /* empty zone = no heading */
      const itemsRaw = Array.isArray(obj.items) ? obj.items : [];
      const items = itemsRaw
        .map((item) => coerceLocalizedText(item))
        .filter((item): item is LocalizedText => item != null);
      if (items.length === 0) continue;
      const source = typeof obj.source === "string" ? obj.source : undefined;
      zones.push({ zone, items, ...(source ? { source } : {}) });
    }
    return zones;
  }

  // Flat list: { key, name } or { name }
  const items: LocalizedText[] = [];
  for (const entry of raw) {
    if (entry == null) continue;
    if (typeof entry === "string") {
      const text = coerceLocalizedText(entry);
      if (text) items.push(text);
      continue;
    }
    if (typeof entry !== "object" || Array.isArray(entry)) continue;
    const obj = entry as Record<string, unknown>;
    const name = coerceLocalizedText(obj.name) ?? coerceLocalizedText(obj);
    if (name) items.push(name);
  }

  if (items.length === 0) return [];
  return [{ zone: emptyLocalized(), items }];
}

export function normalizeUnitTypes(raw: unknown): ProjectUnitType[] {
  if (!Array.isArray(raw)) return [];
  const out: ProjectUnitType[] = [];

  for (const [index, entry] of raw.entries()) {
    if (entry == null) continue;

    if (typeof entry === "string") {
      const label = coerceLocalizedText(entry);
      if (!label) continue;
      out.push({
        code: `unit-${index + 1}`,
        area_sqm: 0,
        label,
      });
      continue;
    }

    if (typeof entry !== "object" || Array.isArray(entry)) continue;
    const obj = entry as Record<string, unknown>;
    const label =
      coerceLocalizedText(obj.label) ??
      coerceLocalizedText(obj.name) ??
      (typeof obj.code === "string" ? coerceLocalizedText(obj.code) : null);
    if (!label) continue;

    const code =
      (typeof obj.code === "string" && obj.code.trim()) ||
      `unit-${index + 1}`;
    const areaRaw = obj.area_sqm ?? obj.areaSqm;
    const area_sqm =
      typeof areaRaw === "number" && Number.isFinite(areaRaw) ? areaRaw : 0;
    const source = typeof obj.source === "string" ? obj.source : undefined;

    out.push({
      code,
      area_sqm,
      label,
      ...(source ? { source } : {}),
    });
  }

  return out;
}

export function normalizeFaqs(raw: unknown): ProjectFaq[] {
  if (!Array.isArray(raw)) return [];
  const out: ProjectFaq[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const obj = entry as Record<string, unknown>;
    const question = coerceLocalizedText(obj.question);
    const answer = coerceLocalizedText(obj.answer);
    if (!question || !answer) continue;
    out.push({ question, answer });
  }
  return out;
}

export function poiDisplayName(poi: ProjectPoi, locale: Locale): string {
  return displayLocalized(poi.name, locale);
}

export function facilityZoneHasHeading(zone: ProjectFacilityZone): boolean {
  return hasAnyLocalizedText(zone.zone);
}
