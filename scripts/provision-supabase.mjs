#!/usr/bin/env node
/**
 * Provisions a remote Supabase project for GoThailandHome using SUPABASE_ACCESS_TOKEN.
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/provision-supabase.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const adminEmail = process.env.ADMIN_EMAIL || "admin@gothailandhome.com";
const adminPassword = process.env.ADMIN_PASSWORD || "GoThailandHomeAdmin!2026";
const orgId = process.env.SUPABASE_ORG_ID;
const projectName = process.env.SUPABASE_PROJECT_NAME || "gothailandhome";
const dbPass =
  process.env.SUPABASE_DB_PASSWORD ||
  `Gth${Math.random().toString(36).slice(2)}${Date.now().toString(36)}!Aa1`;
const region = process.env.SUPABASE_REGION || "ap-southeast-1";

if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN is required");
  process.exit(1);
}

const api = async (path, init = {}) => {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(
      `${init.method || "GET"} ${path} -> ${res.status}: ${text}`,
    );
  }
  return json;
};

const root = resolve(process.cwd());
const migration = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260714120000_init_property_foundation.sql",
  ),
  "utf8",
);
const seed = readFileSync(resolve(root, "supabase/seed.sql"), "utf8");

const orgs = await api("/organizations");
const org = orgId ? orgs.find((item) => item.id === orgId) : orgs[0];
if (!org) {
  throw new Error("No Supabase organization available for this access token.");
}

console.log(`Using org: ${org.name} (${org.id})`);

let projects = await api(`/projects`);
let project = projects.find((item) => item.name === projectName);

if (!project) {
  console.log("Creating Supabase project...");
  project = await api("/projects", {
    method: "POST",
    body: JSON.stringify({
      name: projectName,
      organization_id: org.id,
      region,
      db_pass: dbPass,
    }),
  });
} else {
  console.log(`Reusing existing project ${project.id}`);
}

const projectRef = project.id;
console.log(`Waiting for project ${projectRef}...`);

for (let i = 0; i < 60; i += 1) {
  const status = await api(`/projects/${projectRef}`);
  if (
    status.status === "ACTIVE_HEALTHY" ||
    status.status === "ACTIVE_UNHEALTHY"
  ) {
    project = status;
    break;
  }
  await new Promise((r) => setTimeout(r, 5000));
  if (i === 59) throw new Error(`Project not ready: ${status.status}`);
}

const keys = await api(`/projects/${projectRef}/api-keys`);
const anon = keys.find((k) => k.name === "anon" || k.tags?.includes("anon"));
const service = keys.find(
  (k) => k.name === "service_role" || k.tags?.includes("service_role"),
);
if (!anon?.api_key || !service?.api_key) {
  throw new Error("Failed to load API keys");
}

const url = `https://${projectRef}.supabase.co`;

async function runSql(query) {
  const res = await fetch(`${url}/postgres/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${service.api_key}`,
      apikey: service.api_key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    // Fallback to management database query endpoint
    return api(`/projects/${projectRef}/database/query`, {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }
  return res.json();
}

try {
  console.log("Applying migration SQL...");
  await runSql(migration);
  console.log("Applying seed SQL...");
  await runSql(seed);
} catch (error) {
  console.warn(
    "SQL apply via API failed, trying mgmt query endpoint message:",
    error.message,
  );
  await api(`/projects/${projectRef}/database/query`, {
    method: "POST",
    body: JSON.stringify({ query: migration }),
  });
  await api(`/projects/${projectRef}/database/query`, {
    method: "POST",
    body: JSON.stringify({ query: seed }),
  });
}

console.log("Creating admin auth user...");
const createUserRes = await fetch(`${url}/auth/v1/admin/users`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${service.api_key}`,
    apikey: service.api_key,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  }),
});
const createUserJson = await createUserRes.json();
if (
  !createUserRes.ok &&
  !String(createUserJson?.msg || "").includes("already")
) {
  // continue if exists
  const listRes = await fetch(
    `${url}/auth/v1/admin/users?page=1&per_page=200`,
    {
      headers: {
        Authorization: `Bearer ${service.api_key}`,
        apikey: service.api_key,
      },
    },
  );
  const listJson = await listRes.json();
  const existing = (listJson.users || []).find((u) => u.email === adminEmail);
  if (!existing) {
    throw new Error(
      `Admin user create failed: ${JSON.stringify(createUserJson)}`,
    );
  }
  createUserJson.id = existing.id;
}

const userId = createUserJson.id;
await api(`/projects/${projectRef}/database/query`, {
  method: "POST",
  body: JSON.stringify({
    query: `insert into public.admin_users (user_id, email, full_name)
 values ('${userId}', '${adminEmail}', 'GoThailandHome Admin')
 on conflict (user_id) do update set email = excluded.email;`,
  }),
});

const envLocal = `NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon.api_key}
SUPABASE_SERVICE_ROLE_KEY=${service.api_key}
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${adminPassword}
`;

writeFileSync(resolve(root, ".env.local"), envLocal);
console.log("Wrote .env.local");
console.log(
  JSON.stringify(
    {
      projectRef,
      url,
      adminEmail,
      adminPasswordSet: true,
    },
    null,
    2,
  ),
);
