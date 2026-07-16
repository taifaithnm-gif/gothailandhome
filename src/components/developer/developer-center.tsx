import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import {
  AiConcierge,
  PlatformCustomerSuccess,
} from "@/components/marketplace/contact-blocks";
import { PropertyGrid } from "@/components/property/property-grid";
import { Badge, VerificationBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeveloperCardShell, SurfaceCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import type { Locale } from "@/config/locales";
import type { DeveloperView } from "@/lib/data/developers";
import type { ProjectView } from "@/lib/data/projects";
import type { PropertyView } from "@/lib/data/properties";
import {
  DEVELOPER_LISTING_PREVIEW_SIZE,
  DEVELOPER_PROJECT_PREVIEW_SIZE,
  evidenceLabelKey,
  hasVerifiedOfficialLogo,
  mayPresentFact,
  presentationClassFor,
  toVerificationLevel,
  type DeveloperEvidenceRow,
  type DeveloperPresentationClass,
} from "@/lib/developers/evidence";
import type { DeveloperPackageFacts } from "@/lib/developers/package-facts";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fillTemplate, localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

function evidenceLabel(
  dict: Dictionary,
  cls: DeveloperPresentationClass,
): string {
  return dict.developers[evidenceLabelKey(cls)];
}

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4" aria-labelledby={`${id}-heading`}>
      <div>
        <h2 id={`${id}-heading`} className="ds-h2 text-2xl sm:text-3xl">
          {title}
        </h2>
        {note ? <p className="mt-1 text-sm text-stone-500">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FactCell({
  label,
  value,
  cls,
  dict,
}: {
  label: string;
  value: string | null | undefined;
  cls: DeveloperPresentationClass;
  dict: Dictionary;
}) {
  const show =
    mayPresentFact(cls) && value != null && String(value).trim() !== "";
  return (
    <div className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3">
      <dt className="ds-caption text-stone-500">{label}</dt>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <dd className="text-sm font-medium text-[var(--brand-deep)]">
          {show ? value : dict.developers.unavailable}
        </dd>
        <VerificationBadge
          level={toVerificationLevel(cls)}
          label={evidenceLabel(dict, cls)}
        />
      </div>
    </div>
  );
}

function NeutralDeveloperMark({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const initial = (name.trim().slice(0, 1) || "?").toUpperCase();
  return (
    <div
      className="flex aspect-square w-full max-w-[10rem] flex-col items-center justify-center gap-2 rounded-[var(--card-radius)] bg-[linear-gradient(145deg,#0f4f49_0%,#1a6b63_48%,#c4a035_140%)] text-white"
      role="img"
      aria-label={label}
      data-slot="developer-logo-placeholder"
    >
      <span className="font-heading text-4xl">{initial}</span>
      <span className="px-3 text-center text-[10px] tracking-wide uppercase opacity-80">
        {label}
      </span>
    </div>
  );
}

export type DeveloperCenterProps = {
  locale: Locale;
  dict: Dictionary;
  developer: DeveloperView;
  evidence: DeveloperEvidenceRow | null;
  packageFacts: DeveloperPackageFacts;
  projects: ProjectView[];
  listingCountByProject: Map<string, number>;
  saleItems: PropertyView[];
  saleTotal: number;
  rentItems: PropertyView[];
  rentTotal: number;
  related: DeveloperView[];
};

export function DeveloperCenter({
  locale,
  dict,
  developer,
  evidence,
  packageFacts,
  projects,
  listingCountByProject,
  saleItems,
  saleTotal,
  rentItems,
  rentTotal,
  related,
}: DeveloperCenterProps) {
  const d = dict.developers;
  const developerSlug = developer.slug;

  const nameCls = presentationClassFor(evidence, "official_name");
  const websiteCls = presentationClassFor(evidence, "official_website");
  const profileCls = presentationClassFor(evidence, "company_profile");
  const yearCls = presentationClassFor(evidence, "established_year");
  const hqCls = presentationClassFor(evidence, "headquarters");
  const completedCls = presentationClassFor(evidence, "completed_projects");
  const activeCls = presentationClassFor(evidence, "active_projects");
  const logoOfficial = hasVerifiedOfficialLogo(evidence);

  const displayName = developer.name[locale] || developer.name.en;
  const profileText =
    mayPresentFact(profileCls) && packageFacts.companyProfile
      ? packageFacts.companyProfile[locale] ||
        packageFacts.companyProfile.en ||
        developer.description[locale]
      : mayPresentFact(profileCls)
        ? developer.description[locale] || developer.description.en
        : null;

  const yearValue =
    mayPresentFact(yearCls) && packageFacts.establishedYear != null
      ? String(packageFacts.establishedYear)
      : null;

  const hqValue =
    mayPresentFact(hqCls) && packageFacts.headquarters
      ? packageFacts.headquarters[locale] ||
        packageFacts.headquarters.en ||
        null
      : null;

  const website =
    mayPresentFact(websiteCls) && developer.website
      ? developer.website
      : null;

  const irSources = packageFacts.sources.filter(
    (s) =>
      s.type === "official_developer" ||
      /about|ir|set|factsheet|investor/i.test(s.name + s.url),
  );

  const withListings = projects.filter(
    (p) => (listingCountByProject.get(p.slug) ?? 0) > 0,
  );
  const withoutListings = projects.filter(
    (p) => (listingCountByProject.get(p.slug) ?? 0) === 0,
  );

  function renderListingBlock(
    title: string,
    items: PropertyView[],
    total: number,
    listingType: "sale" | "rent",
  ) {
    const href = localePath(
      locale,
      `/properties?developer=${encodeURIComponent(developerSlug)}&listing_type=${listingType}`,
    );
    return (
      <div data-slot={`developer-listings-${listingType}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {title}
          </h3>
          <p className="text-sm text-stone-600">
            {fillTemplate(d.listingsCount, { count: String(total) })}
          </p>
        </div>
        {items.length ? (
          <div className="mt-4">
            <PropertyGrid
              locale={locale}
              dict={dict}
              properties={items}
              imagePriorityCount={0}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-500">{d.listingsEmpty}</p>
        )}
        {total > DEVELOPER_LISTING_PREVIEW_SIZE || total > 0 ? (
          <Link
            href={href}
            className="mt-4 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
          >
            {d.listingsViewAll}
          </Link>
        ) : null}
      </div>
    );
  }

  function renderProjectGroup(title: string, items: ProjectView[]) {
    const preview = items.slice(0, DEVELOPER_PROJECT_PREVIEW_SIZE);
    if (!preview.length) {
      return (
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {title}
          </h3>
          <p className="mt-2 text-sm text-stone-500">{d.unavailable}</p>
        </div>
      );
    }
    return (
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
          {title}{" "}
          <span className="font-normal normal-case text-stone-500">
            ({items.length})
          </span>
        </h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {preview.map((project) => (
            <li key={project.id}>
              <Link
                href={localePath(locale, `/projects/${project.slug}`)}
                className="block rounded-xl border border-[var(--brand-line)] bg-white p-4 hover:border-[var(--brand)]"
              >
                <p className="font-medium text-[var(--brand-deep)]">
                  {project.name[locale] || project.name.en}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {d.projectsViewProject}
                  {(listingCountByProject.get(project.slug) ?? 0) > 0
                    ? ` · ${listingCountByProject.get(project.slug)} listings`
                    : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div data-slot="developer-center" className="bg-[var(--brand-canvas)]">
      {/* Hero */}
      <section
        className="border-b border-[var(--brand-line)]"
        data-slot="developer-hero"
      >
        <div className="ds-container grid gap-8 py-10 sm:py-14 lg:grid-cols-[auto_1fr] lg:items-center">
          <div>
            {logoOfficial &&
            (packageFacts.officialLogoUrl || developer.logoUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={packageFacts.officialLogoUrl || developer.logoUrl || ""}
                alt={displayName}
                width={160}
                height={160}
                className="h-40 w-40 rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white object-contain p-3"
                data-slot="developer-logo-official"
              />
            ) : (
              <NeutralDeveloperMark name={displayName} label={d.logoMissing} />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{d.centerEyebrow}</Badge>
              <VerificationBadge
                level={toVerificationLevel(nameCls)}
                label={evidenceLabel(dict, nameCls)}
              />
            </div>
            <h1 className="font-heading mt-3 text-4xl text-[var(--brand-deep)] sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-2 text-lg text-stone-600">
              {mayPresentFact(nameCls)
                ? developer.legalName[locale] || developer.legalName.en
                : d.unavailable}
            </p>
            {profileText ? (
              <p className="mt-4 max-w-2xl text-sm text-stone-700 sm:text-base">
                {profileText}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  {d.website}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              ) : null}
              <Link
                href={localePath(locale, "/partners/developers")}
                className={buttonVariants({ variant: "primary" })}
              >
                {d.contactPartnershipCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="ds-container grid gap-12 py-12 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-14">
          <Section id="overview" title={d.overview} note={d.overviewNote}>
            <SurfaceCard className="p-4!" tone="soft">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--brand-deep)]">
                  {d.factoryLinked}
                </h3>
                <VerificationBadge
                  level="derived"
                  label={d.evidenceFactory}
                />
              </div>
              <p className="mt-2 text-sm text-stone-600">{d.factoryLinkedNote}</p>
              <p className="mt-3 text-sm text-[var(--brand-deep)]">
                {projects.length} {d.projectsOnPlatform.toLowerCase()}
                {" · "}
                {withListings.length} {d.projectsWithListings.toLowerCase()}
                {" · "}
                {saleTotal + rentTotal} {d.listings.toLowerCase()}
              </p>
            </SurfaceCard>
          </Section>

          <Section
            id="projects"
            title={d.projectsOnPlatform}
            note={d.projectsDisclaimer}
          >
            <div className="space-y-8">
              {renderProjectGroup(d.projectsWithListings, withListings)}
              {renderProjectGroup(d.projectsWithoutListings, withoutListings)}
            </div>
          </Section>

          <Section
            id="listings"
            title={d.currentListings}
            note={d.listingsNote}
          >
            <div className="space-y-10">
              {renderListingBlock(
                d.listingsSale,
                saleItems,
                saleTotal,
                "sale",
              )}
              {renderListingBlock(
                d.listingsRent,
                rentItems,
                rentTotal,
                "rent",
              )}
            </div>
          </Section>

          <Section id="company" title={d.company} note={d.companyNote}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <FactCell
                label={d.legalName}
                value={
                  mayPresentFact(nameCls)
                    ? developer.legalName[locale] || developer.legalName.en
                    : null
                }
                cls={nameCls}
                dict={dict}
              />
              <FactCell
                label={d.established}
                value={yearValue}
                cls={yearCls}
                dict={dict}
              />
              <FactCell
                label={d.headquarters}
                value={hqValue}
                cls={hqCls}
                dict={dict}
              />
              <FactCell
                label={d.completedProjects}
                value={
                  mayPresentFact(completedCls)
                    ? String(
                        evidence?.completed_n ??
                          packageFacts.completedProjects.length,
                      )
                    : null
                }
                cls={completedCls}
                dict={dict}
              />
              <FactCell
                label={d.activeProjects}
                value={
                  mayPresentFact(activeCls)
                    ? String(
                        evidence?.active_n ??
                          packageFacts.activeProjects.length,
                      )
                    : null
                }
                cls={activeCls}
                dict={dict}
              />
            </dl>
            <div className="mt-4">
              <p className="ds-caption text-stone-500">{d.companyHistory}</p>
              <p className="mt-1 text-sm text-stone-600">
                {profileCls === "OFFICIAL" && profileText
                  ? profileText
                  : d.unavailable}
              </p>
            </div>
          </Section>

          <Section
            id="official-website"
            title={d.officialWebsite}
            note={d.officialWebsiteNote}
          >
            {website ? (
              <SurfaceCard className="flex flex-col gap-3 p-5! sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--brand-deep)]">
                    {website}
                  </p>
                  <VerificationBadge
                    level={toVerificationLevel(websiteCls)}
                    label={evidenceLabel(dict, websiteCls)}
                  />
                </div>
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "shrink-0",
                  )}
                >
                  {d.openWebsite}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </SurfaceCard>
            ) : (
              <EmptyState title={d.unavailable} description={d.websiteMissing} />
            )}
          </Section>

          <Section
            id="verification"
            title={d.verification}
            note={d.verificationNote}
          >
            <ul className="space-y-3 text-sm text-stone-700">
              {irSources.length || packageFacts.listedCompany?.profileUrl ? (
                <li>
                  <span className="font-medium">{d.irSource}: </span>
                  <ul className="mt-1 space-y-1">
                    {packageFacts.listedCompany?.profileUrl ? (
                      <li>
                        <a
                          href={packageFacts.listedCompany.profileUrl}
                          className="text-[var(--brand)] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {[
                            packageFacts.listedCompany.exchange,
                            packageFacts.listedCompany.ticker,
                          ]
                            .filter(Boolean)
                            .join(" ") ||
                            packageFacts.listedCompany.profileUrl}
                        </a>
                      </li>
                    ) : null}
                    {irSources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          className="text-[var(--brand)] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li>
                  <span className="font-medium">{d.irSource}: </span>
                  {d.unavailable}
                </li>
              )}
              <li>
                <span className="font-medium">{d.lastVerified}: </span>
                {packageFacts.verifiedAt || d.unavailable}
              </li>
              <li>
                <span className="font-medium">{d.logoStatus}: </span>
                {logoOfficial
                  ? d.evidenceOfficial
                  : packageFacts.logoStatus || d.logoMissing}
              </li>
            </ul>
            <ul className="mt-6 flex flex-wrap gap-2">
              {(
                [
                  "OFFICIAL",
                  "PARTIAL",
                  "FACTORY_LINKED",
                  "UNVERIFIED",
                ] as DeveloperPresentationClass[]
              ).map((cls) => (
                <li key={cls} className="flex items-center gap-2 text-sm">
                  <VerificationBadge
                    level={toVerificationLevel(cls)}
                    label={evidenceLabel(dict, cls)}
                  />
                  <span className="text-stone-600">
                    {evidenceLabel(dict, cls)}
                  </span>
                </li>
              ))}
            </ul>
            <SurfaceCard className="mt-6 p-5!" tone="dashed">
              <p className="text-sm font-medium text-[var(--brand-deep)]">
                {d.trustTitle}
              </p>
              <p className="mt-2 text-sm text-stone-700">{d.trustBody}</p>
            </SurfaceCard>
          </Section>

          <Section
            id="partnership"
            title={d.partnershipTitle}
            note={d.partnershipBody}
          >
            <div className="flex flex-wrap gap-3">
              <Link
                href={localePath(locale, "/partners/developers")}
                className={buttonVariants({ variant: "primary" })}
              >
                {d.contactPartnershipCta}
              </Link>
              <Link
                href={localePath(locale, "/partners/developers")}
                className={buttonVariants({ variant: "secondary" })}
              >
                {d.profileClaim}
              </Link>
              <Link
                href={localePath(locale, "/partners/developers")}
                className={buttonVariants({ variant: "secondary" })}
              >
                {d.projectSubmission}
              </Link>
            </div>
          </Section>

          <Section
            id="related-developers"
            title={d.relatedDevelopers}
            note={d.similarNote}
          >
            {related.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((item) => (
                  <DeveloperCardShell key={item.slug}>
                    <Link
                      href={localePath(locale, `/developers/${item.slug}`)}
                      className="font-medium text-[var(--brand-deep)] hover:underline"
                    >
                      {item.name[locale] || item.name.en}
                    </Link>
                    <p className="text-sm text-stone-600">
                      {item.legalName[locale] || item.legalName.en}
                    </p>
                  </DeveloperCardShell>
                ))}
              </div>
            ) : (
              <EmptyState
                title={d.unavailable}
                description={d.relatedDevelopersEmpty}
              />
            )}
          </Section>

          <Section
            id="platform-support"
            title={d.contactPlatform}
            note={d.contactPlatformNote}
          >
            <SurfaceCard className="space-y-4 p-5!">
              <PlatformCustomerSuccess locale={locale} dict={dict} />
              <AiConcierge dict={dict} />
            </SurfaceCard>
          </Section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <SurfaceCard className="p-5!" data-slot="contact-official">
            <h2 className="ds-h3 text-xl">{d.contactOfficial}</h2>
            {website || developer.phone || developer.email ? (
              <div className="mt-3 space-y-2 text-sm text-stone-700">
                <p className="font-medium text-[var(--brand-deep)]">
                  {displayName}
                </p>
                {website ? (
                  <a
                    href={website}
                    className="inline-flex items-center gap-1 text-[var(--brand)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.website}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                ) : null}
                {developer.phone ? <p>{developer.phone}</p> : null}
                {developer.email ? <p>{developer.email}</p> : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-stone-600">
                {d.contactOfficialMissing}
              </p>
            )}
          </SurfaceCard>

          <SurfaceCard className="p-5!" data-slot="contact-partnership">
            <h2 className="ds-h3 text-xl">{d.contactPartnership}</h2>
            <p className="mt-2 text-sm text-stone-600">
              {d.contactPartnershipBody}
            </p>
            <Link
              href={localePath(locale, "/partners/developers")}
              className="mt-4 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
            >
              {d.contactPartnershipCta}
            </Link>
          </SurfaceCard>
        </aside>
      </div>
    </div>
  );
}
