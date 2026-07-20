#!/usr/bin/env node
/**
 * Fix listing_url values that fail AJV "uri" format (unencoded unicode, emojis, etc.)
 * Prefer canonical ASCII URL: https://propertyhub.in.th/en/listings/{id}
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const projectsDir = "content/projects";
let fixed = 0;
let removed = 0;
let total = 0;

for (const d of readdirSync(projectsDir)) {
  const f = join(projectsDir, d, "listings.json");
  if (!existsSync(f)) continue;
  const L = JSON.parse(readFileSync(f, "utf8"));
  const cleaned = [];
  for (const l of L.listings || []) {
    total++;
    if (!l.listing_url || typeof l.listing_url !== "string") {
      removed++;
      continue;
    }
    const id = String(l.external_ref || "").replace(/^propertyhub-/, "");
    // If URL has non-ASCII or spaces or fails URL parse, canonicalize
    let needsFix = /[^\x00-\x7F]/.test(l.listing_url) || /\s/.test(l.listing_url);
    try {
      new URL(l.listing_url);
    } catch {
      needsFix = true;
    }
    if (needsFix) {
      if (!id) {
        removed++;
        continue;
      }
      l.listing_url = `https://propertyhub.in.th/en/listings/${id}`;
      fixed++;
    } else {
      // Still ensure properly encoded pathname
      try {
        const u = new URL(l.listing_url);
        u.pathname =
          "/" +
          u.pathname
            .split("/")
            .filter(Boolean)
            .map((seg) => {
              try {
                return encodeURIComponent(decodeURIComponent(seg));
              } catch {
                return encodeURIComponent(seg);
              }
            })
            .join("/");
        const encoded = u.toString();
        if (encoded !== l.listing_url) {
          l.listing_url = encoded;
          fixed++;
        }
      } catch {
        if (id) {
          l.listing_url = `https://propertyhub.in.th/en/listings/${id}`;
          fixed++;
        } else {
          removed++;
          continue;
        }
      }
    }
    cleaned.push(l);
  }
  L.listings = cleaned;
  writeFileSync(f, JSON.stringify(L, null, 2) + "\n");
}
console.log(JSON.stringify({ total, fixed, removed }, null, 2));
