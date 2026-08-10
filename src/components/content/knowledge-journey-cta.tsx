import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import {
  getKnowledgeBridgeArticles,
  getKnowledgeBridgeAreas,
  getKnowledgeBridgeProjects,
} from "@/lib/content/knowledge-journey-bridge";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

type KnowledgeJourneyCtaProps = {
  locale: Locale;
  dict: Dictionary;
  articleSlug: string;
  relatedLinks?: { path: string; label: string }[];
};

/**
 * Buyer-journey bridge: Knowledge → projects / areas / knowledge → enquiry.
 * Uses existing featured projects and published city pages — no new datasets.
 */
export function KnowledgeJourneyCta({
  locale,
  dict,
  articleSlug,
  relatedLinks = [],
}: KnowledgeJourneyCtaProps) {
  const k = dict.knowledge;
  const projects = getKnowledgeBridgeProjects(articleSlug);
  const areas = getKnowledgeBridgeAreas(articleSlug);
  const articles = getKnowledgeBridgeArticles(articleSlug, relatedLinks);

  return (
    <SurfaceCard
      className="space-y-5 p-5!"
      data-slot="knowledge-journey-cta"
    >
      <div className="space-y-1">
        <h2 className="ds-h3 text-lg text-[var(--brand-deep)]">
          {k.journeyTitle}
        </h2>
        <p className="text-sm text-stone-600">{k.journeyBody}</p>
      </div>

      {projects.length ? (
        <div className="space-y-2" data-slot="knowledge-journey-projects">
          <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {k.journeyRelatedProjects}
          </h3>
          <ul className="space-y-3">
            {projects.map((project) => {
              const name =
                project.project_name[locale] || project.project_name.en;
              const area = project.area_name[locale] || project.area_name.en;
              const developer =
                project.developer_name[locale] || project.developer_name.en;
              return (
                <li key={project.project_id}>
                  <Link
                    href={localePath(
                      locale,
                      `/projects/${project.project_id}`,
                    )}
                    className="group block rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3 transition-colors hover:border-[var(--brand)]/40"
                    data-slot="knowledge-project-link"
                    data-project-id={project.project_id}
                  >
                    <span className="text-sm font-medium text-[var(--brand-deep)] group-hover:text-[var(--brand)]">
                      {name}
                    </span>
                    <span className="mt-0.5 block text-xs text-stone-500">
                      {developer}
                      {area ? ` · ${area}` : ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {areas.length ? (
        <div className="space-y-2" data-slot="knowledge-journey-areas">
          <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {k.journeyRelatedAreas}
          </h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {areas.map((area) => (
              <li key={area.id}>
                <Link
                  href={localePath(locale, area.path)}
                  className="text-sm font-medium text-[var(--brand)] underline-offset-2 hover:underline"
                  data-slot="knowledge-area-link"
                  data-area-id={area.id}
                >
                  {area.name[locale] || area.name.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {articles.length ? (
        <div className="space-y-2" data-slot="knowledge-journey-knowledge">
          <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {k.journeyRelatedKnowledge}
          </h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={localePath(locale, article.path)}
                  className="text-sm font-medium text-[var(--brand)] underline-offset-2 hover:underline"
                  data-slot="knowledge-related-link"
                  data-article-slug={article.slug}
                >
                  {article.title[locale] || article.title.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href={localePath(locale, "/contact")}
          className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
          data-slot="knowledge-enquiry-cta"
        >
          {k.journeyCta}
        </Link>
      </div>
    </SurfaceCard>
  );
}
