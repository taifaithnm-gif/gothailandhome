import "server-only";

import type { Locale } from "@/config/locales";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { CityRow, DistrictRow } from "@/lib/supabase/types";

export type CityView = {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  summary: Record<Locale, string>;
  seoTitle: Record<Locale, string>;
  seoDescription: Record<Locale, string>;
};

export type DistrictView = CityView & {
  cityId: string;
  citySlug: string;
  cityName: Record<Locale, string>;
};

function mapCity(row: CityRow): CityView {
  return {
    id: row.id,
    slug: row.slug,
    name: { en: row.name_en, zh: row.name_zh, th: row.name_th },
    summary: {
      en: row.summary_en ?? "",
      zh: row.summary_zh ?? "",
      th: row.summary_th ?? "",
    },
    seoTitle: {
      en: row.seo_title_en ?? row.name_en,
      zh: row.seo_title_zh ?? row.name_zh,
      th: row.seo_title_th ?? row.name_th,
    },
    seoDescription: {
      en: row.seo_description_en ?? row.summary_en ?? "",
      zh: row.seo_description_zh ?? row.summary_zh ?? "",
      th: row.seo_description_th ?? row.summary_th ?? "",
    },
  };
}

function mapDistrict(
  row: DistrictRow & { cities?: CityRow | null },
): DistrictView {
  const city = row.cities;
  return {
    id: row.id,
    slug: row.slug,
    cityId: row.city_id,
    citySlug: city?.slug ?? "",
    cityName: city
      ? { en: city.name_en, zh: city.name_zh, th: city.name_th }
      : { en: "", zh: "", th: "" },
    name: { en: row.name_en, zh: row.name_zh, th: row.name_th },
    summary: {
      en: row.summary_en ?? "",
      zh: row.summary_zh ?? "",
      th: row.summary_th ?? "",
    },
    seoTitle: {
      en: row.seo_title_en ?? row.name_en,
      zh: row.seo_title_zh ?? row.name_zh,
      th: row.seo_title_th ?? row.name_th,
    },
    seoDescription: {
      en: row.seo_description_en ?? row.summary_en ?? "",
      zh: row.seo_description_zh ?? row.summary_zh ?? "",
      th: row.seo_description_th ?? row.summary_th ?? "",
    },
  };
}

export async function listCities(): Promise<CityView[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("listCities", error.message);
    return [];
  }
  return (data as CityRow[]).map(mapCity);
}

export async function getCityBySlug(slug: string): Promise<CityView | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapCity(data as CityRow);
}

export async function listDistrictsByCity(
  cityId: string,
): Promise<DistrictView[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("districts")
    .select("*, cities (*)")
    .eq("city_id", cityId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("listDistrictsByCity", error.message);
    return [];
  }
  return (data as (DistrictRow & { cities: CityRow | null })[]).map(
    mapDistrict,
  );
}

export async function listDistricts(): Promise<DistrictView[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("districts")
    .select("*, cities (*)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("listDistricts", error.message);
    return [];
  }
  return (data as (DistrictRow & { cities: CityRow | null })[]).map(
    mapDistrict,
  );
}

export async function getDistrictBySlug(
  slug: string,
): Promise<DistrictView | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("districts")
    .select("*, cities (*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapDistrict(data as DistrictRow & { cities: CityRow | null });
}
