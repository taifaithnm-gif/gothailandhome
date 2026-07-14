import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { PropertyGrid } from "@/components/property/property-grid";
import { isLocale } from "@/config/locales";
import {
  getPublishedDeveloperBySlug,
  listProjectsForDeveloper,
} from "@/lib/data/developers";
import { listPublishedProperties } from "@/lib/data/properties";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/developers/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const developer = await getPublishedDeveloperBySlug(slug);
  if (!developer) return {};
  return buildPageMetadata({
    locale: lang,
    title: developer.seoTitle[lang],
    description: developer.seoDescription[lang],
    path: `/developers/${slug}`,
  });
}

export default async function DeveloperDetailPage({
  params,
}: PageProps<"/[lang]/developers/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const developer = await getPublishedDeveloperBySlug(slug);
  if (!developer) notFound();

  const [dict, projects, listings] = await Promise.all([
    getDictionary(lang),
    listProjectsForDeveloper(developer.id),
    listPublishedProperties({
      developerSlug: developer.slug,
      verifiedOnly: true,
      sort: "newest",
    }),
  ]);

  return (
    <PageShell
      title={developer.name[lang]}
      subtitle={developer.legalName[lang]}
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
        <aside className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6">
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-[var(--brand-soft)]">
            {developer.logoUrl ? (
              <Image
                src={developer.logoUrl}
                alt={developer.name[lang]}
                fill
                className="object-contain p-3"
                unoptimized
              />
            ) : (
              <span className="font-heading text-2xl text-[var(--brand)]">
                {developer.name[lang].slice(0, 1)}
              </span>
            )}
          </div>
          <p className="text-sm text-stone-700">
            {developer.description[lang]}
          </p>
          <div className="space-y-2 text-sm">
            {developer.website ? (
              <a
                href={developer.website}
                target="_blank"
                rel="noreferrer"
                className="block text-[var(--brand)] hover:underline"
              >
                {dict.developers.website}
              </a>
            ) : null}
            {developer.facebookUrl ? (
              <a
                href={developer.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-[var(--brand)] hover:underline"
              >
                Facebook
              </a>
            ) : null}
            {developer.phone ? <p>{developer.phone}</p> : null}
          </div>
        </aside>

        <div className="space-y-10">
          <section>
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.developers.projects}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={localePath(lang, `/projects/${project.slug}`)}
                    className="block rounded-xl border border-[var(--brand-line)] bg-white p-4 hover:border-[var(--brand)]"
                  >
                    <p className="font-medium text-[var(--brand-deep)]">
                      {project.name[lang]}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                      {project.description[lang]}
                    </p>
                  </Link>
                </li>
              ))}
              {!projects.length ? (
                <li className="text-sm text-stone-500">
                  {dict.cities.emptyProjects}
                </li>
              ) : null}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
              {dict.developers.listings}
            </h2>
            <div className="mt-4">
              <PropertyGrid locale={lang} dict={dict} properties={listings} />
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
