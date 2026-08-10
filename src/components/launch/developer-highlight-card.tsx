import Link from "next/link";

import type { Locale } from "@/config/locales";
import {
  developerProfile,
  getDeveloperLogoSrc,
  type LaunchDeveloper,
} from "@/lib/launch/content-launch-v1";
import { localePath } from "@/lib/i18n/metadata";

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
  const name = developer.developer_name[locale];

  return (
    <Link
      href={href}
      className="flex h-full flex-col gap-4 rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-5 shadow-[var(--shadow-soft)] transition outline-none hover:border-[var(--brand)]/40 focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
      data-launch-developer={developer.developer_id}
      data-card-link="developer"
      data-home-cta={`developer-${developer.developer_id}`}
      aria-label={`${detailLabel}: ${name}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--brand-line)] bg-[var(--brand-soft)]">
          {logoSrc ? (
            // Native img: SVG marks must not go through next/image (optimizer 400).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt={`${name} logo`}
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
              {name.slice(0, 1)}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-heading text-xl text-[var(--brand-deep)]">
            {name}
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
            {featured.map((slug) => {
              const projectName = projectNames[slug];
              if (!projectName) return null;
              return (
                <li key={slug} className="truncate">
                  {projectName}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <span className="inline-flex self-start rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 py-1.5 text-sm font-medium text-[var(--brand-deep)]">
        {detailLabel}
      </span>
    </Link>
  );
}
