import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isPhase2AccountEnabled } from "@/lib/feature-flags";
import {
  parseSavedSearchFilters,
  type SavedSearchAlertFrequency,
  type SavedSearchFilters,
} from "@/lib/account/saved-search";

export type CustomerProfile = {
  userId: string;
  displayName: string | null;
  preferredLocale: string;
  email: string | null;
};

export type SavedItemRow = {
  id: string;
  kind: "favorite" | "compare";
  propertyId: string | null;
  propertySlug: string | null;
  createdAt: string;
};

export type SavedSearchRow = {
  id: string;
  name: string;
  locale: string;
  filters: SavedSearchFilters;
  alertFrequency: SavedSearchAlertFrequency;
  createdAt: string;
  updatedAt: string;
};

export async function ensureCustomerProfile(input: {
  userId: string;
  email: string | null;
  preferredLocale?: string;
}): Promise<CustomerProfile | null> {
  if (!isPhase2AccountEnabled()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_profiles")
    .upsert(
      {
        user_id: input.userId,
        email: input.email,
        preferred_locale: input.preferredLocale ?? "en",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("user_id, display_name, preferred_locale, email")
    .maybeSingle();

  if (error || !data) return null;
  return {
    userId: data.user_id,
    displayName: data.display_name,
    preferredLocale: data.preferred_locale,
    email: data.email,
  };
}

export async function listSavedItems(
  userId: string,
): Promise<SavedItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_saved_items")
    .select("id, kind, property_id, property_slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    kind: row.kind as "favorite" | "compare",
    propertyId: row.property_id,
    propertySlug: row.property_slug,
    createdAt: row.created_at,
  }));
}

export async function upsertSavedItem(input: {
  userId: string;
  kind: "favorite" | "compare";
  propertyId?: string | null;
  propertySlug?: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!input.propertyId && !input.propertySlug) {
    return { ok: false, message: "Property identifier required." };
  }
  const supabase = await createClient();
  let query = supabase
    .from("customer_saved_items")
    .select("id")
    .eq("user_id", input.userId)
    .eq("kind", input.kind);
  if (input.propertySlug) {
    query = query.eq("property_slug", input.propertySlug);
  } else if (input.propertyId) {
    query = query.eq("property_id", input.propertyId);
  }
  const { data: existing } = await query.maybeSingle();
  if (existing?.id) {
    const { error } = await supabase
      .from("customer_saved_items")
      .update({
        property_id: input.propertyId ?? null,
        property_slug: input.propertySlug ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("user_id", input.userId);
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  }
  const { error } = await supabase.from("customer_saved_items").insert({
    user_id: input.userId,
    kind: input.kind,
    property_id: input.propertyId ?? null,
    property_slug: input.propertySlug ?? null,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteSavedItem(input: {
  userId: string;
  id: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_saved_items")
    .delete()
    .eq("user_id", input.userId)
    .eq("id", input.id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function listSavedSearches(
  userId: string,
): Promise<SavedSearchRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_saved_searches")
    .select(
      "id, name, locale, filters, alert_frequency, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    locale: row.locale,
    filters: parseSavedSearchFilters(row.filters),
    alertFrequency: row.alert_frequency as SavedSearchAlertFrequency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createSavedSearch(input: {
  userId: string;
  name: string;
  locale: string;
  filters: SavedSearchFilters;
  alertFrequency?: SavedSearchAlertFrequency;
}): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const name = input.name.trim().slice(0, 80);
  if (!name) return { ok: false, message: "Name is required." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_saved_searches")
    .insert({
      user_id: input.userId,
      name,
      locale: input.locale,
      filters: parseSavedSearchFilters(input.filters),
      alert_frequency: input.alertFrequency ?? "off",
    })
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return { ok: false, message: error?.message ?? "Create failed." };
  }
  return { ok: true, id: data.id };
}

export async function updateSavedSearch(input: {
  userId: string;
  id: string;
  name?: string;
  filters?: SavedSearchFilters;
  alertFrequency?: SavedSearchAlertFrequency;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_saved_searches")
    .update({
      ...(input.name != null ? { name: input.name.trim().slice(0, 80) } : {}),
      ...(input.filters
        ? { filters: parseSavedSearchFilters(input.filters) }
        : {}),
      ...(input.alertFrequency
        ? { alert_frequency: input.alertFrequency }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", input.userId)
    .eq("id", input.id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteSavedSearch(input: {
  userId: string;
  id: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_saved_searches")
    .delete()
    .eq("user_id", input.userId)
    .eq("id", input.id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
