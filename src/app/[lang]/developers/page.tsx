import Link from "next/link";
import { notFound } from "next/navigation";

import { DeveloperHighlightCard } from "@/components/launch/developer-highlight-card";
import { PageShell } from "@/components/layout/page-shell";
import { isLocale } from "@/config/locales";
import { listPublishedDevelopers } from "@/lib/data/developers";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, localePath } from "@/lib/i18n/metadata";
import {
  getFeaturedLaunchProjects,
  getLaunchDevelopers,
} from "@/lib/launch/content-launch-v1";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/developers">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildPageMetadata({
    locale: lang,
    title: dict.meta.developersTitle,
    description: dict.meta.developersDescription,
    path: "/developers",
  });
}

export default async function DevelopersIndexPage({
  params,
}: PageProps<"/[lang]/developers">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, published] = await Promise.all([
    getDictionary(lang),
    listPublishedDevelopers(),
  ]);

  const launchDevelopers = getLaunchDevelopers();
  const launchIds = new Set(launchDevelopers.map((d) => d.developer_id));
  const projectNameBySlug: Record<string, string> = {};
  for (const p of getFeaturedLaunchProjects()) {
    projectNameBySlug[p.project_id] = p.project_name[lang];
  }

  const detailLabel =
    lang === "zh" ? "查看详情" : lang === "th" ? "ดูรายละเอียด" : "View details";
  const projectCountLabel =
    lang === "zh"
      ? "{count} 个已核实项目"
      : lang === "th"
        ? "{count} โครงการที่ตรวจสอบแล้ว"
        : "{count} verified projects";
  const featuredProjectsLabel =
    lang === "zh"
      ? "精选项目"
      : lang === "th"
        ? "โครงการแนะนำ"
        : "Featured projects";

  const extraPublished = published.filter((d) => !launchIds.has(d.slug));

  return (
    <PageShell
      title={dict.developers.title}
      subtitle={dict.developers.subtitle}
    >
      {launchDevelopers.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {launchDevelopers.map((developer) => (
            <li key={developer.developer_id}>
              <DeveloperHighlightCard
                locale={lang}
                developer={developer}
                projectCountLabel={projectCountLabel}
                featuredLabel={featuredProjectsLabel}
                detailLabel={detailLabel}
                projectNames={projectNameBySlug}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {extraPublished.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {extraPublished.map((developer) => (
            <li key={developer.id}>
              <Link
                href={localePath(lang, `/developers/${developer.slug}`)}
                className="block rounded-2xl border border-[var(--brand-line)] bg-white p-6 hover:border-[var(--brand)]"
              >
                <h2 className="font-heading text-xl text-[var(--brand-deep)]">
                  {developer.name[lang]}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                  {developer.description[lang]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {!launchDevelopers.length && !extraPublished.length ? (
        <p className="text-sm text-stone-500">{dict.common.noResults}</p>
      ) : null}
    </PageShell>
  );
}
