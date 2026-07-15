#!/usr/bin/env node
/**
 * Live check: published properties with agent_id (expect >= 12).
 * Requires Supabase env + network.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / key");
  process.exit(1);
}

const endpoint = `${url.replace(/\/$/, "")}/rest/v1/properties?select=id&agent_id=not.is.null&status=eq.published`;
const res = await fetch(endpoint, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "count=exact",
    Range: "0-0",
  },
});
const contentRange = res.headers.get("content-range") || "";
const match = /\/(\d+)$/.exec(contentRange);
const count = match ? Number(match[1]) : null;
const payload = { ok: count != null && count >= 12, count, status: res.status, contentRange };
console.log(JSON.stringify(payload, null, 2));
if (!payload.ok) process.exit(1);
