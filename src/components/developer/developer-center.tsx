import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import {
  AiConcierge,
  PlatformCustomerSuccess,
} from "@/components/marketplace/contact-blocks";
import { PropertyGrid } from "@/components/property/property-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeveloperCardShell, SurfaceCard } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import type { DeveloperView } from "@/lib/data/developers";
import type { ProjectView } from "@/lib/data/projects";
import type { PropertyView } from "@/lib/data/properties";
import {
  DEVELOPER_LISTING_PREVIEW_SIZE,
  DEVELOPER_PROJECT_PREVIEW_SIZE,
  mayPresentFact,
  presentationClassFor,
  type DeveloperEvidenceRow,
  type DeveloperPresentationClass,
} from "@/lib/developers/evidence";
import {
  getDeveloperLogoPresentation,
} from "@/lib/developers/logo-presentation";
import type { DeveloperPackageFacts } from "@/lib/developers/package-facts";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fillTemplate, localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

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
}: {
  label: string;
  value: string | null | undefined;
  cls: DeveloperPresentationClass;
  dict?: Dictionary;
  field?: keyof Dictionary["developers"]["unavailableByField"];
}) {
  const show =
    mayPresentFact(cls) && value != null && String(value).trim() !== "";
  if (!show) return null;
  return (
    <div className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3">
      <dt className="ds-caption text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[var(--brand-deep)]">
        {value}
      </dd>
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
      data-slot="branded-media-placeholder"
    >
      <span className="font-heading text-4xl">{initial}</span>
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
  /** Rendered FAQ must stay identical to the FAQPage schema emitted by the page. */
  faqs?: { question: string; answer: string }[];
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
  faqs = [],
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
  const logo = getDeveloperLogoPresentation(developer.slug);

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

  const withListings = projects.filter(
    (p) => (listingCountByProject.get(p.slug) ?? 0) > 0,
  );
  const withoutListings = projects.filter(
    (p) => (listingCountByProject.get(p.slug) ?? 0) === 0,
  );

  const sectionLinks: Array<{ id: string; label: string }> = [
    { id: "overview", label: d.overview },
    { id: "projects", label: d.projectsOnPlatform },
    { id: "listings", label: d.currentListings },
    { id: "company", label: d.company },
    { id: "official-website", label: d.officialWebsite },
    { id: "partnership", label: d.partnershipTitle },
    ...(faqs.length ? [{ id: "faq", label: d.faqTitle }] : []),
    { id: "related-developers", label: d.relatedDevelopers },
    { id: "platform-support", label: d.contactPlatform },
  ];

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
              properties={items.slice(0, DEVELOPER_LISTING_PREVIEW_SIZE)}
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
      return null;
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
            {logo.canPresentOfficialMark && logo.displaySrc ? (
              <div
                className="relative h-40 w-40 overflow-hidden rounded-[var(--card-radius)] border border-[var(--brand-line)] bg-white p-3"
                data-slot="developer-logo-official"
                data-logo-status={logo.status}
              >
                <Image
                  src={logo.displaySrc}
                  alt={displayName}
                  width={160}
                  height={160}
                  className="h-full w-full object-contain"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div data-logo-status={logo.status}>
                <NeutralDeveloperMark
                  name={displayName}
                  label={displayName}
                />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{d.centerEyebrow}</Badge>
            </div>
            <h1 className="font-heading mt-3 text-4xl text-[var(--brand-deep)] sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-2 text-lg text-stone-600">
              {mayPresentFact(nameCls) ? developer.legalName[locale] || developer.legalName.en : null}
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

      <nav
        className="border-b border-[var(--brand-line)] bg-white/70"
        aria-label={d.sectionNav}
        data-slot="developer-section-nav"
      >
        <div className="ds-container flex gap-2 overflow-x-auto py-3">
          {sectionLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-[var(--brand-deep)] transition hover:bg-[var(--brand-soft)]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="ds-container grid gap-12 py-12 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-14">
          <Section id="overview" title={d.overview} note={d.overviewNote}>
            <SurfaceCard className="p-4!" tone="soft">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--brand-deep)]">
                  {d.factoryLinked}
                </h3>
              </div>
              <p className="mt-2 text-sm text-stone-600">{d.factoryLinkedNote}</p>
              <p
                className="mt-2 text-sm font-medium text-[var(--brand-deep)]"
                data-slot="developer-portfolio-subset"
              >
                {d.portfolioSubsetNote}
              </p>
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
            note={`${d.projectsDisclaimer} ${d.portfolioSubsetNote}`}
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
              {profileCls === "OFFICIAL" && profileText ? (
                <p className="mt-1 text-sm text-stone-600">{profileText}</p>
              ) : null}
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
            ) : null}
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

          {/* FAQ — visible entries mirror the FAQPage schema emitted by the page */}
          {faqs.length ? (
            <Section id="faq" title={d.faqTitle} note={d.faqNote}>
              <div className="space-y-2" data-slot="developer-faq">
                {faqs.map((item, index) => (
                  <details
                    key={`developer-faq-${index}`}
                    className="rounded-xl border border-[var(--brand-line)] bg-white px-4 py-3"
                  >
                    <summary className="cursor-pointer text-sm font-medium text-[var(--brand-deep)]">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-stone-700">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
              <div
                className="flex flex-wrap gap-x-5 gap-y-2 pt-1"
                data-slot="developer-knowledge-links"
              >
                <Link
                  href={localePath(
                    locale,
                    "/knowledge/articles/thailand-developer-guide",
                  )}
                  className="text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  {dict.contentLinks.developerGuide}
                </Link>
                <Link
                  href={localePath(
                    locale,
                    "/knowledge/articles/thailand-property-buying-guide",
                  )}
                  className="text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  {dict.contentLinks.buyingGuide}
                </Link>
                <Link
                  href={localePath(
                    locale,
                    "/knowledge/articles/foreign-ownership-thailand",
                  )}
                  className="text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  {dict.contentLinks.foreignOwnership}
                </Link>
              </div>
            </Section>
          ) : null}

          <Section
            id="related-developers"
            title={d.relatedDevelopers}
            note={d.similarNote}
          >
            {related.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {related.slice(0, 4).map((item) => {
                  const href = localePath(locale, `/developers/${item.slug}`);
                  const name = item.name[locale] || item.name.en;
                  const legal = item.legalName[locale] || item.legalName.en;
                  return (
                    <DeveloperCardShell key={item.slug} className="relative">
                      <Link
                        href={href}
                        className="absolute inset-0 z-0 rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
                        aria-label={name}
                        data-card-link="developer"
                      />
                      <p className="relative font-medium text-[var(--brand-deep)] pointer-events-none">
                        {name}
                      </p>
                      {legal ? (
                        <p className="relative text-sm text-stone-600 pointer-events-none">
                          {legal}
                        </p>
                      ) : null}
                    </DeveloperCardShell>
                  );
                })}
              </div>
            ) : null}
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
