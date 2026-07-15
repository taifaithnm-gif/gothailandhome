#!/usr/bin/env node
/**
 * Read-only P0 Supabase reconciliation (no listing mutations).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1);
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const { count: withAgent } = await admin
  .from("properties")
  .select("*", { count: "exact", head: true })
  .not("agent_id", "is", null)
  .eq("status", "published");
const { count: published } = await admin
  .from("properties")
  .select("*", { count: "exact", head: true })
  .eq("status", "published");
const { count: verified } = await admin
  .from("properties")
  .select("*", { count: "exact", head: true })
  .eq("status", "published")
  .eq("is_verified_listing", true);

const sources = {};
for (const s of [
  "propertyhub",
  "livinginsider",
  "dotproperty",
  "fazwaz",
  "ddproperty",
  "hipflat",
]) {
  const { count } = await admin
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("source", s);
  sources[s] = count;
}

const { count: developers } = await admin
  .from("developers")
  .select("*", { count: "exact", head: true });
const { count: projects } = await admin
  .from("property_projects")
  .select("*", { count: "exact", head: true })
  .eq("status", "published");

const html = await (await fetch("http://127.0.0.1:3000/en/properties")).text();
const ids = [...html.matchAll(/\/en\/properties\/([a-z0-9-]+)/g)].map(
  (m) => m[1],
);
const unique = [...new Set(ids.filter((id) => id && id !== "new"))];

const out = {
  measured_at: new Date().toISOString(),
  withAgent,
  published,
  verified,
  sources,
  developers,
  projects,
  properties_page: {
    html_bytes: Buffer.byteLength(html),
    unique_property_links: unique.length,
  },
};

mkdirSync(resolve(process.cwd(), "pipelines/factory/overnight/_runs"), {
  recursive: true,
});
writeFileSync(
  resolve(
    process.cwd(),
    "pipelines/factory/overnight/_runs/p0-supabase-reconcile.json",
  ),
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
