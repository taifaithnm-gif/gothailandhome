#!/usr/bin/env node
/**
 * Applies migration + seed SQL to the linked Supabase project using POSTGRES_URL.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

function loadEnvLocal() {
  try {
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
  } catch {
    // ignore
  }
}

loadEnvLocal();

const url =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;
if (!url) {
  console.error("Missing POSTGRES_URL");
  process.exit(1);
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@gothailandhome.com";
const adminPassword = process.env.ADMIN_PASSWORD || "GoThailandHomeAdmin!2026";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260714120000_init_property_foundation.sql",
  ),
  "utf8",
);
const seed = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected to Postgres");

try {
  console.log("Applying migration...");
  await client.query(migration);
  console.log("Applying seed...");
  await client.query(seed);
  console.log("Schema + seed applied");
} catch (error) {
  console.error("SQL apply error:", error.message);
  // Continue to admin bootstrap if schema may already exist
}

await client.end();

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL/service key for admin bootstrap");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("Ensuring admin auth user...");
const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
let user = listed.data?.users?.find((u) => u.email === adminEmail);

if (!user) {
  const created = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });
  if (created.error) {
    throw new Error(created.error.message);
  }
  user = created.data.user;
} else {
  await supabase.auth.admin.updateUserById(user.id, {
    password: adminPassword,
    email_confirm: true,
  });
}

const adminClient = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await adminClient.connect();
await adminClient.query(
  `insert into public.admin_users (user_id, email, full_name)
   values ($1, $2, $3)
   on conflict (user_id) do update set email = excluded.email`,
  [user.id, adminEmail, "GoThailandHome Admin"],
);
await adminClient.end();

console.log(
  JSON.stringify(
    {
      ok: true,
      adminEmail,
      projectUrl: supabaseUrl,
    },
    null,
    2,
  ),
);
