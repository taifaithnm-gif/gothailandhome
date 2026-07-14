import "server-only";

import type { Locale } from "@/config/locales";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { DeveloperRow } from "@/lib/supabase/types";
import { listPublishedProjects, type ProjectView } from "@/lib/data/projects";

export type DeveloperView = {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  legalName: Record<Locale, string>;
  description: Record<Locale, string>;
  seoTitle: Record<Locale, string>;
  seoDescription: Record<Locale, string>;
  website: string | null;
  facebookUrl: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
};

function mapDeveloper(row: DeveloperRow): DeveloperView {
  return {
    id: row.id,
    slug: row.slug,
    name: { en: row.name_en, zh: row.name_zh, th: row.name_th },
    legalName: {
      en: row.legal_name_en ?? row.name_en,
      zh: row.legal_name_zh ?? row.name_zh,
      th: row.legal_name_th ?? row.name_th,
    },
    description: {
      en: row.description_en ?? "",
      zh: row.description_zh ?? "",
      th: row.description_th ?? "",
    },
    seoTitle: {
      en: row.seo_title_en ?? `${row.name_en} | GoThailandHome`,
      zh: row.seo_title_zh ?? `${row.name_zh} | GoThailandHome`,
      th: row.seo_title_th ?? `${row.name_th} | GoThailandHome`,
    },
    seoDescription: {
      en: row.seo_description_en ?? row.description_en ?? "",
      zh: row.seo_description_zh ?? row.description_zh ?? "",
      th: row.seo_description_th ?? row.description_th ?? "",
    },
    website: row.website,
    facebookUrl: row.facebook_url,
    logoUrl: row.logo_url,
    phone: row.phone,
    email: row.email,
  };
}

export async function listPublishedDevelopers(): Promise<DeveloperView[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developers")
    .select("*")
    .eq("is_published", true)
    .order("name_en", { ascending: true });
  if (error) {
    console.error("listPublishedDevelopers", error.message);
    return [];
  }
  return (data as DeveloperRow[]).map(mapDeveloper);
}

export async function getPublishedDeveloperBySlug(
  slug: string,
): Promise<DeveloperView | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("developers")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapDeveloper(data as DeveloperRow);
}

export async function listProjectsForDeveloper(
  developerId: string,
): Promise<ProjectView[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_projects")
    .select("slug")
    .eq("status", "published")
    .eq("developer_id", developerId);
  if (error || !data?.length) return [];
  const slugs = new Set(data.map((row) => row.slug as string));
  const projects = await listPublishedProjects();
  return projects.filter((project) => slugs.has(project.slug));
}
