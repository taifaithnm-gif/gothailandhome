import Link from "next/link";

import {
  AI_RECOMMEND_DISCLAIMER,
  explainReasons,
  recommendSimilarL0,
  type RecommendCandidate,
} from "@/lib/ai/recommend-l0";
import { getAiProviderMode } from "@/lib/ai/investment-assist";
import { isPhase2AiEnabled } from "@/lib/feature-flags";
import { localePath } from "@/lib/i18n/metadata";
import type { Locale } from "@/config/locales";

type Props = {
  locale: Locale;
  seed: RecommendCandidate;
  pool: RecommendCandidate[];
  title: string;
};

export function SimilarListingsRail({ locale, seed, pool, title }: Props) {
  const mode = getAiProviderMode(isPhase2AiEnabled());
  if (mode === "disabled") return null;

  const hits = recommendSimilarL0(seed, pool, 4);
  if (hits.length === 0) return null;

  return (
    <section className="mt-10" aria-label={title}>
      <h2 className="font-heading text-2xl">{title}</h2>
      <p className="mt-1 text-xs text-stone-500">{AI_RECOMMEND_DISCLAIMER}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {hits.map((hit) => (
          <li
            key={hit.candidate.slug}
            className="rounded-xl border border-[var(--brand-line)] bg-white p-3"
          >
            <Link
              className="font-medium underline"
              href={localePath(locale, `/properties/${hit.candidate.slug}`)}
            >
              {hit.candidate.titleEn}
            </Link>
            <p className="mt-1 text-xs text-stone-500">
              Why: {explainReasons(hit.reasons)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
