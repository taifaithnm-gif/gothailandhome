import type { Locale } from "@/config/locales";

export type SlimNamedOption = {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  citySlug?: string;
};

/** Drop district values that do not belong to the selected city. */
export function resolveDistrictForCity(
  city: string,
  district: string,
  districts: SlimNamedOption[],
): string {
  if (!district) return "";
  const match = districts.find((item) => item.slug === district);
  if (!match) return "";
  if (city && match.citySlug && match.citySlug !== city) return "";
  return district;
}
