import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/config/locales";
import {
  developerProfile,
  getDeveloperLogoSrc,
  type LaunchDeveloper,
} from "@/lib/launch/content-launch-v1";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

type DeveloperHighlightCardProps = {
  locale: Locale;
  developer: LaunchDeveloper;
  projectCountLabel: string;
  featuredLabel: string;
  detailLabel: string;
  projectNames: Record<string, string>;
};

export function DeveloperHighlightCard({
  locale,
  developer,
  projectCountLabel,
  featuredLabel,
  detailLabel,
  projectNames,
}: DeveloperHighlightCardProps) {
  const logoSrc = getDeveloperLogoSrc(developer);
  const profile = developerProfile(developer, locale);
  const href = localePath(locale, `/developers/${developer.developer_id}`);
  const featured = developer.featured_projects.slice(0, 3);

  return (
    <article
      className="flex h-full flex-col gap-4 rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-5 shadow-[var(--shadow-soft)]"
      data-launch-developer={developer.developer_id}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--brand-line)] bg-[var(--brand-soft)]">
          {logoSrc ? (
            // Native img: SVG marks must not go through next/image (optimizer 400).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain p-1.5"
              loading="lazy"
            />
          ) : (
            <span
              className="font-heading text-lg text-[var(--brand-deep)]"
              aria-hidden
            >
              {developer.developer_name[locale].slice(0, 1)}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-heading text-xl text-[var(--brand-deep)]">
            {developer.developer_name[locale]}
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            {projectCountLabel.replace(
              "{count}",
              String(developer.project_count),
            )}
          </p>
        </div>
      </div>
      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-stone-600">
        {profile}
      </p>
      {featured.length ? (
        <div>
          <p className="ds-caption text-stone-500">{featuredLabel}</p>
          <ul className="mt-1 space-y-0.5 text-sm text-stone-700">
            {featured.map((slug) => (
              <li key={slug} className="truncate">
                {projectNames[slug] || slug}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "self-start",
        )}
        data-home-cta={`developer-${developer.developer_id}`}
      >
        {detailLabel}
      </Link>
    </article>
  );
}
