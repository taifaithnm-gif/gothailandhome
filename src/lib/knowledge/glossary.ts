import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "@/config/locales";
import {
  coerceLocalizedText,
  type LocalizedText,
} from "@/lib/projects/normalize-project-content";

export type GlossaryTerm = {
  code: string;
  name: LocalizedText;
};

export type GlossarySection = {
  id: string;
  terms: GlossaryTerm[];
};

export type BangkokDistrictGlossaryRow = {
  slug: string;
  name: LocalizedText;
  postalCode: string | null;
  districtCode: number | null;
};

const SECTION_IDS = [
  "transit_tags",
  "facilities",
  "schools",
  "hospitals",
  "shopping",
  "property_types",
] as const;

function asString(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

function asNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  return null;
}

function readJson(relativePath: string): unknown {
  const path = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Controlled vocabulary names only — no invented POI facts. */
export function getGlossarySections(): GlossarySection[] {
  const raw = readJson("content/glossary/terms.json") as Record<string, unknown>;
  const sections: GlossarySection[] = [];

  for (const id of SECTION_IDS) {
    const list = raw[id];
    if (!Array.isArray(list)) continue;
    const terms: GlossaryTerm[] = [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      const code = asString(obj.code);
      const name = coerceLocalizedText(obj.name);
      if (!code || !name) continue;
      terms.push({ code, name });
    }
    if (terms.length) sections.push({ id, terms });
  }

  return sections;
}

export function getBangkokDistrictGlossary(): BangkokDistrictGlossaryRow[] {
  const raw = readJson("content/glossary/districts-bangkok.json") as {
    districts?: unknown;
  };
  if (!Array.isArray(raw.districts)) return [];

  const out: BangkokDistrictGlossaryRow[] = [];
  for (const item of raw.districts) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const slug = asString(obj.slug);
    const name = coerceLocalizedText(obj.name);
    if (!slug || !name) continue;
    out.push({
      slug,
      name,
      postalCode: asString(obj.postal_code),
      districtCode: asNumber(obj.district_code),
    });
  }
  return out;
}

export function termLabel(term: GlossaryTerm, locale: Locale): string {
  return term.name[locale] || term.name.en || term.name.th || term.name.zh || term.code;
}
