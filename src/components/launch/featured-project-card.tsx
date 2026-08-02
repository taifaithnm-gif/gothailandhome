import Image from "next/image";
import Link from "next/link";

import { NoImagePlaceholder } from "@/components/ui/no-image";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/config/locales";
import {
  getProjectHeroImage,
  projectPriceDisplay,
  projectSummary,
  type LaunchFeaturedProject,
} from "@/lib/launch/content-launch-v1";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

type FeaturedProjectCardProps = {
  locale: Locale;
  project: LaunchFeaturedProject;
  detailLabel: string;
  priority?: boolean;
};

export function FeaturedProjectCard({
  locale,
  project,
  detailLabel,
  priority = false,
}: FeaturedProjectCardProps) {
  const hero = getProjectHeroImage(project.project_id);
  const price = projectPriceDisplay(project, locale);
  const summary = projectSummary(project, locale);
  const href = localePath(locale, `/projects/${project.project_id}`);

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white shadow-[var(--shadow-soft)]"
      data-launch-project={project.project_id}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--brand-deep)]">
        {hero.src ? (
          <Image
            src={hero.src}
            alt={hero.alt[locale]}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <NoImagePlaceholder
            label={hero.alt[locale]}
            propertyType="condo"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="ds-caption text-[var(--brand)]">
          {project.developer_name[locale]}
        </p>
        <h3 className="font-heading text-xl text-[var(--brand-deep)]">
          {project.project_name[locale]}
        </h3>
        <p className="text-sm text-stone-600">
          {project.area_name[locale]} · {project.city[locale]}
        </p>
        <p className="text-xs tracking-wide text-stone-500 uppercase">
          {project.property_type}
        </p>
        <p
          className={cn(
            "text-sm font-medium",
            price.isFallback
              ? "text-stone-600"
              : "text-[var(--brand-deep)]",
          )}
          data-price-fallback={price.isFallback ? "true" : "false"}
        >
          {price.text}
        </p>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">
          {summary}
        </p>
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "mt-2 self-start",
          )}
          data-home-cta={`project-${project.project_id}`}
        >
          {detailLabel}
        </Link>
      </div>
    </article>
  );
}
