#!/usr/bin/env node
/**
 * Apply a single SQL migration file via POSTGRES_URL.
 * Usage: node scripts/apply-migration.mjs supabase/migrations/20260714183000_project_content_system.sql
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node scripts/apply-migration.mjs <path-to.sql>");
  process.exit(1);
}

const url =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;
if (!url) {
  console.error("Missing POSTGRES_URL");
  process.exit(1);
}

const sql = readFileSync(resolve(process.cwd(), fileArg), "utf8");
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  console.log(JSON.stringify({ ok: true, applied: fileArg }));
} catch (error) {
  console.error("Migration error:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
