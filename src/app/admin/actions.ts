"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  ListingType,
  PropertyStatus,
  PropertyType,
} from "@/lib/supabase/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function numOrNull(value: FormDataEntryValue | null) {
  if (value == null || String(value).trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?error=unauthorized");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

function propertyPayloadFromForm(formData: FormData, userId: string) {
  const titleEn = String(formData.get("title_en") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as PropertyStatus;
  const listingType = String(
    formData.get("listing_type") ?? "sale",
  ) as ListingType;
  const propertyType = String(
    formData.get("property_type") ?? "condo",
  ) as PropertyType;

  return {
    slug: slugInput || slugify(titleEn),
    status,
    listing_type: listingType,
    property_type: propertyType,
    project_id: String(formData.get("project_id") ?? "") || null,
    location_id: String(formData.get("location_id") ?? ""),
    agent_id: String(formData.get("agent_id") ?? "") || null,
    price_thb: Number(formData.get("price_thb") ?? 0),
    bedrooms: numOrNull(formData.get("bedrooms")),
    bathrooms: numOrNull(formData.get("bathrooms")),
    area_sqm: numOrNull(formData.get("area_sqm")),
    land_area_sqm: numOrNull(formData.get("land_area_sqm")),
    title_en: titleEn,
    title_zh: String(formData.get("title_zh") ?? "").trim(),
    title_th: String(formData.get("title_th") ?? "").trim(),
    summary_en: String(formData.get("summary_en") ?? "").trim(),
    summary_zh: String(formData.get("summary_zh") ?? "").trim(),
    summary_th: String(formData.get("summary_th") ?? "").trim(),
    description_en: String(formData.get("description_en") ?? "").trim(),
    description_zh: String(formData.get("description_zh") ?? "").trim(),
    description_th: String(formData.get("description_th") ?? "").trim(),
    featured: formData.get("featured") === "on",
    published_at: status === "published" ? new Date().toISOString() : null,
    created_by: userId,
  };
}

export async function createProperty(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const payload = propertyPayloadFromForm(formData, user.id);

  if (!payload.location_id || !payload.title_en) {
    redirect("/admin/properties/new?error=missing-fields");
  }

  const { data, error } = await supabase
    .from("properties")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      `/admin/properties/new?error=${encodeURIComponent(error?.message ?? "create-failed")}`,
    );
  }

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    await uploadPropertyImage(data.id, image, true);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin/properties/${data.id}/edit?created=1`);
}

export async function updateProperty(propertyId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const payload = propertyPayloadFromForm(formData, user.id);
  const { created_by, ...updatePayload } = payload;
  void created_by;

  const { error } = await supabase
    .from("properties")
    .update(updatePayload)
    .eq("id", propertyId);

  if (error) {
    redirect(
      `/admin/properties/${propertyId}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    await uploadPropertyImage(propertyId, image, true);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  redirect(`/admin/properties/${propertyId}/edit?saved=1`);
}

export async function uploadPropertyImage(
  propertyId: string,
  file: File,
  asCover = false,
) {
  const { supabase } = await requireAdmin();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${propertyId}/${Date.now()}-${slugify(file.name)}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("property-media")
    .upload(path, arrayBuffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("property-media").getPublicUrl(path);

  if (asCover) {
    await supabase
      .from("property_media")
      .update({ is_cover: false })
      .eq("property_id", propertyId);
  }

  const { error } = await supabase.from("property_media").insert({
    property_id: propertyId,
    storage_path: path,
    public_url: publicUrl,
    sort_order: 0,
    is_cover: asCover,
    alt_en: file.name,
  });

  if (error) {
    throw new Error(error.message);
  }
}
