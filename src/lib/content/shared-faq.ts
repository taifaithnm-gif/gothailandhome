import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "@/config/locales";
import type { LocalizedText } from "@/lib/content/types";
import { fillTemplate } from "@/lib/i18n/metadata";

export type SharedFaqItem = {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
};

function asString(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

function coerceText(raw: unknown): LocalizedText | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const en = asString(obj.en);
  const zh = asString(obj.zh);
  const th = asString(obj.th);
  if (!en || !zh || !th) return null;
  return { en, zh, th };
}

/**
 * Reusable FAQ library loader. Entries are templates whose placeholders
 * (e.g. {area}, {city}, {developer}) are filled per page so every page shows
 * FAQ text scoped to its own entity. Process answers only — no market
 * statistics or invented facts.
 */
function readFaqLibrary(relPath: string): SharedFaqItem[] {
  const path = join(process.cwd(), relPath);
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      entries?: unknown;
    };
    if (!Array.isArray(raw.entries)) return [];
    const out: SharedFaqItem[] = [];
    for (const item of raw.entries) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      const id = asString(obj.id);
      const question = coerceText(obj.question);
      const answer = coerceText(obj.answer);
      if (!id || !question || !answer) continue;
      out.push({ id, question, answer });
    }
    return out;
  } catch {
    return [];
  }
}

function renderFaq(
  items: SharedFaqItem[],
  locale: Locale,
  vars: Record<string, string>,
): { question: string; answer: string }[] {
  return items.map((item) => ({
    question: fillTemplate(item.question[locale] || item.question.en, vars),
    answer: fillTemplate(item.answer[locale] || item.answer.en, vars),
  }));
}

/** District/area FAQ — supports {area} and {city} placeholders. */
export function areaFaqForLocale(
  locale: Locale,
  vars: { area: string; city: string },
): { question: string; answer: string }[] {
  return renderFaq(readFaqLibrary("content/areas/faq-library.json"), locale, vars);
}

/** Developer FAQ — supports {developer} placeholder. */
export function developerFaqForLocale(
  locale: Locale,
  vars: { developer: string },
): { question: string; answer: string }[] {
  return renderFaq(
    readFaqLibrary("content/developers/faq-library.json"),
    locale,
    vars,
  );
}
