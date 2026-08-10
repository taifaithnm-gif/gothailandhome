import Image from "next/image";
import Link from "next/link";

import { NoImagePlaceholder } from "@/components/ui/no-image";
import type { Locale } from "@/config/locales";
import { getProjectHeroImage,
  projectPriceDisplay,
  projectSummary,
  type LaunchFeaturedProject,
} from "@/lib/launch/content-launch-v1";
import { resolvePresentationImage } from "@/lib/media/presentation-image";
import { localePath, propertyTypeLabel } from "@/lib/i18n/metadata";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/utils";

type FeaturedProjectCardProps = {
  locale: Locale;
  project: LaunchFeaturedProject;
  detailLabel: string;
  dict?: Dictionary;
  priority?: boolean;
};

export function FeaturedProjectCard({
  locale,
  project,
  detailLabel,
  dict,
  priority = false,
}: FeaturedProjectCardProps) {
  const hero = getProjectHeroImage(project.project_id);
  const presentation = resolvePresentationImage({
    primarySrc: hero.src,
    projectSlug: project.project_id,
    projectTitle: project.project_name.en,
    developerSlug: project.developer_id,
    areaSlug: project.area_id || null,
  });
  const src = presentation.src;
  const logoFallback = presentation.kind === "developer";
  const price = projectPriceDisplay(project, locale);
  const summary = projectSummary(project, locale);
  const href = localePath(locale, `/projects/${project.project_id}`);
  const title = project.project_name[locale];
  const typeLabel = dict
    ? propertyTypeLabel(dict, project.property_type)
    : project.property_type;

  return (
    <Link
      href={href}
      className="flex h-full flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white shadow-[var(--shadow-soft)] transition outline-none hover:border-[var(--brand)]/40 focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
      data-launch-project={project.project_id}
      data-card-link="project"
      data-home-cta={`project-${project.project_id}`}
      aria-label={`${detailLabel}: ${title}`}
    >
      <div
        className="relative aspect-[16/10] overflow-hidden bg-[var(--brand-soft)]"
        data-media-fit={src ? (logoFallback ? "contain" : "cover") : undefined}
      >
        {src ? (
          <Image
            src={src}
            alt={hero.alt[locale]}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={
              logoFallback ? "object-contain p-6" : "object-cover"
            }
            priority={priority}
          />
        ) : (
          <NoImagePlaceholder
            label={hero.alt[locale] || title}
            propertyType="condo"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="ds-caption text-[var(--brand)]">
          {project.developer_name[locale]}
        </p>
        <h3 className="font-heading text-xl text-[var(--brand-deep)]">
          {title}
        </h3>
        <p className="text-sm text-stone-600">
          {project.area_name[locale]} · {project.city[locale]}
        </p>
        <p className="text-xs tracking-wide text-stone-500 uppercase">
          {typeLabel}
        </p>
        <p
          className={cn(
            "text-sm font-medium",
            price.isFallback
              ? "text-stone-600"
              : "text-[var(--brand-deep)]",
          )}
        >
          {price.text}
        </p>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">
          {summary}
        </p>
        <span className="mt-2 inline-flex self-start rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 py-1.5 text-sm font-medium text-[var(--brand-deep)]">
          {detailLabel}
        </span>
      </div>
    </Link>
  );
}
