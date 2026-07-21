"use server";

import { redirect } from "next/navigation";

import {
  createSavedSearch,
  deleteSavedItem,
  deleteSavedSearch,
  ensureCustomerProfile,
  updateSavedSearch,
  upsertSavedItem,
} from "@/lib/account/customer";
import { parseSavedSearchFilters } from "@/lib/account/saved-search";
import { getOptionalCustomer, isAdminUserId } from "@/lib/auth/customer";
import { sanitizeNextPath } from "@/lib/auth/safe-next";
import { isPhase2AccountEnabled } from "@/lib/feature-flags";
import type { FavoriteRef } from "@/lib/favorites";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function customerSignIn(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!isPhase2AccountEnabled()) return { error: "Account feature disabled." };

  const email = formString(formData, "email").trim();
  const password = formString(formData, "password");
  const lang = formString(formData, "lang") || "en";
  const next = sanitizeNextPath(formString(formData, "next"), `/${lang}/account`);

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { error: "Sign-in failed. Check your credentials." };
  }
  if (await isAdminUserId(data.user.id)) {
    await supabase.auth.signOut();
    return {
      error: "Staff accounts must use the admin login. Customer sign-in only.",
    };
  }

  await ensureCustomerProfile({
    userId: data.user.id,
    email: data.user.email ?? email,
    preferredLocale: lang,
  });
  redirect(next);
}

export async function customerSignUp(
  _prev: { error?: string; message?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; message?: string }> {
  if (!isPhase2AccountEnabled()) return { error: "Account feature disabled." };

  const email = formString(formData, "email").trim();
  const password = formString(formData, "password");
  const lang = formString(formData, "lang") || "en";

  if (!email || password.length < 8) {
    return { error: "Use a valid email and password (8+ characters)." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gothailandhome.com"}/auth/callback?next=/${lang}/account`,
    },
  });
  if (error) return { error: error.message };
  if (data.user) {
    await ensureCustomerProfile({
      userId: data.user.id,
      email,
      preferredLocale: lang,
    });
  }
  return {
    message:
      "Account created. Check your email if confirmation is required, then sign in.",
  };
}

export async function customerSignOut(formData: FormData) {
  const lang = formString(formData, "lang") || "en";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${lang}`);
}

export async function migrateDeviceFavoritesAction(formData: FormData) {
  if (!isPhase2AccountEnabled()) return;
  const customer = await getOptionalCustomer();
  if (!customer) return;

  const raw = formString(formData, "itemsJson");
  let items: FavoriteRef[] = [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) items = parsed as FavoriteRef[];
  } catch {
    return;
  }

  for (const item of items.slice(0, 50)) {
    await upsertSavedItem({
      userId: customer.userId,
      kind: "favorite",
      propertyId: item.id ?? null,
      propertySlug: item.slug ?? null,
    });
  }
}

export async function createSavedSearchAction(formData: FormData) {
  const customer = await getOptionalCustomer();
  if (!customer) return;
  const lang = formString(formData, "lang") || "en";
  const name = formString(formData, "name");
  const filtersRaw = formString(formData, "filtersJson") || "{}";
  let filters = {};
  try {
    filters = JSON.parse(filtersRaw) as Record<string, unknown>;
  } catch {
    filters = {};
  }
  await createSavedSearch({
    userId: customer.userId,
    name,
    locale: lang,
    filters: parseSavedSearchFilters(filters),
    alertFrequency: (formString(formData, "alertFrequency") ||
      "off") as "off" | "instant" | "daily" | "weekly",
  });
  redirect(`/${lang}/account/searches`);
}

export async function deleteSavedSearchAction(formData: FormData) {
  const customer = await getOptionalCustomer();
  if (!customer) return;
  const lang = formString(formData, "lang") || "en";
  await deleteSavedSearch({
    userId: customer.userId,
    id: formString(formData, "id"),
  });
  redirect(`/${lang}/account/searches`);
}

export async function updateSavedSearchAlertAction(formData: FormData) {
  const customer = await getOptionalCustomer();
  if (!customer) return;
  const lang = formString(formData, "lang") || "en";
  await updateSavedSearch({
    userId: customer.userId,
    id: formString(formData, "id"),
    alertFrequency: (formString(formData, "alertFrequency") ||
      "off") as "off" | "instant" | "daily" | "weekly",
  });
  redirect(`/${lang}/account/searches`);
}

export async function deleteSavedItemAction(formData: FormData) {
  const customer = await getOptionalCustomer();
  if (!customer) return;
  const lang = formString(formData, "lang") || "en";
  await deleteSavedItem({
    userId: customer.userId,
    id: formString(formData, "id"),
  });
  redirect(`/${lang}/account/saved`);
}
