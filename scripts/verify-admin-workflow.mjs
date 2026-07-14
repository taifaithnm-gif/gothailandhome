#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let value = line.slice(i + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const service =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const email = process.env.ADMIN_EMAIL || "admin@gothailandhome.com";
const password = process.env.ADMIN_PASSWORD || "GoThailandHomeAdmin!2026";

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { count } = await admin
  .from("properties")
  .select("*", { count: "exact", head: true })
  .eq("status", "published");

console.log("published_count", count);

const userClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: loginError } = await userClient.auth.signInWithPassword({
  email,
  password,
});
if (loginError) throw new Error(loginError.message);

const slug = `phase3-verify-${Date.now()}`;
const { data: created, error: createError } = await userClient
  .from("properties")
  .insert({
    slug,
    status: "draft",
    listing_type: "sale",
    property_type: "condo",
    location_id: "11111111-1111-4111-8111-111111111101",
    price_thb: 4999999,
    title_en: "Phase 3 Verification Condo",
    title_zh: "第三阶段验证公寓",
    title_th: "คอนโดตรวจสอบเฟส 3",
    summary_en: "Created by Phase 3 verification workflow.",
    summary_zh: "由第三阶段验证流程创建。",
    summary_th: "สร้างโดยเวิร์กโฟลว์ตรวจสอบเฟส 3",
    description_en: "Temporary verification listing.",
    description_zh: "临时验证房源。",
    description_th: "ประกาศตรวจสอบชั่วคราว",
    featured: false,
  })
  .select("id, slug, status")
  .single();

if (createError) throw new Error(createError.message);
console.log("created", created);

const { data: updated, error: updateError } = await userClient
  .from("properties")
  .update({
    status: "published",
    published_at: new Date().toISOString(),
    title_en: "Phase 3 Verification Condo (Published)",
  })
  .eq("id", created.id)
  .select("id, slug, status, title_en")
  .single();

if (updateError) throw new Error(updateError.message);
console.log("published", updated);

const bytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const path = `${created.id}/verify.png`;
const { error: uploadError } = await userClient.storage
  .from("property-media")
  .upload(path, bytes, { contentType: "image/png", upsert: true });
if (uploadError) throw new Error(uploadError.message);

const {
  data: { publicUrl },
} = userClient.storage.from("property-media").getPublicUrl(path);

const { error: mediaError } = await userClient.from("property_media").insert({
  property_id: created.id,
  storage_path: path,
  public_url: publicUrl,
  is_cover: true,
  sort_order: 0,
  alt_en: "Verification image",
});
if (mediaError) throw new Error(mediaError.message);

console.log(
  JSON.stringify(
    {
      ok: true,
      publishedCountBeforeCreate: count,
      propertyId: created.id,
      slug,
      coverUrl: publicUrl,
    },
    null,
    2,
  ),
);
