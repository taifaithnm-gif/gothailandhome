#!/usr/bin/env node
/**
 * P1-11 — Property gallery and media-resilience contracts.
 *
 * Offline checks only: approved URL boundary, next/image dimensions/sizes/
 * priority, keyboard gallery behavior, labeled fallbacks, and fixed geometry.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  approvedListingMediaUrl,
  isApprovedListingMediaUrl,
} from "../src/lib/property/listing-media.ts";

const root = process.cwd();
const files = {
  gallery: "src/components/property/listing-gallery.tsx",
  frame: "src/components/property/listing-media-frame.tsx",
  fallback: "src/components/ui/no-image.tsx",
  boundary: "src/lib/property/listing-media.ts",
  detail: "src/app/[lang]/properties/[id]/page.tsx",
  config: "next.config.ts",
};

function read(path) {
  return readFileSync(resolve(root, path), "utf8");
}

function check(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name} — ${error.message}`);
    process.exitCode = 1;
  }
}

check("media:required scoped files exist", () => {
  for (const path of Object.values(files)) {
    assert.ok(existsSync(resolve(root, path)), path);
  }
});

check("media:approved URL boundary fails closed", () => {
  assert.equal(isApprovedListingMediaUrl("/media/listing.webp"), true);
  assert.equal(
    isApprovedListingMediaUrl(
      "https://project.supabase.co/storage/v1/object/public/listings/a.webp",
    ),
    true,
  );
  for (const value of [
    null,
    "",
    "//evil.example/image.jpg",
    "http://project.supabase.co/storage/v1/object/public/a.jpg",
    "https://supabase.co/storage/v1/object/public/a.jpg",
    "https://project.supabase.co/private/a.jpg",
    "https://example.com/a.jpg",
    "data:image/png;base64,AA==",
    "blob:https://example.com/id",
  ]) {
    assert.equal(isApprovedListingMediaUrl(value), false, String(value));
    assert.equal(approvedListingMediaUrl(value), null, String(value));
  }
});

check("media:frame uses next/image with stable responsive geometry", () => {
  const frame = read(files.frame);
  assert.ok(frame.includes('import Image from "next/image"'));
  assert.ok(frame.includes("fill"));
  assert.ok(frame.includes("sizes={sizes}"));
  assert.ok(frame.includes("preload={priority}"));
  assert.ok(frame.includes("fetchPriority"));
  assert.ok(frame.includes("aspect-[16/10]"));
  assert.ok(frame.includes('style={{ aspectRatio: "16 / 10" }}'));
  assert.ok(frame.includes("onError={() => setFailedUrl(approvedUrl)}"));
  assert.ok(frame.includes("approvedListingMediaUrl"));
  assert.ok(!frame.includes("<img"), "raw img removed from media frame");
});

check("media:gallery is keyboard operable and fixed-size", () => {
  const gallery = read(files.gallery);
  for (const needle of [
    '"ArrowRight"',
    '"ArrowLeft"',
    '"ArrowDown"',
    '"ArrowUp"',
    '"Home"',
    '"End"',
    "event.preventDefault()",
    "thumbnailRefs.current[nextIndex]?.focus()",
    'aria-current={i === index ? "true" : undefined}',
    "aria-controls=",
    "overflow-x-auto",
    "h-[70px] w-[112px]",
    'sizes="112px"',
    'sizes="(max-width: 1024px) 100vw, 58vw"',
  ]) {
    assert.ok(gallery.includes(needle), needle);
  }
  assert.ok(!gallery.includes("<img"), "raw gallery thumbnails removed");
});

check("media:broken and missing images share labeled neutral fallback", () => {
  const frame = read(files.frame);
  const gallery = read(files.gallery);
  const fallback = read(files.fallback);
  assert.ok(frame.includes("NoImagePlaceholder"));
  assert.ok(frame.includes("data-media-state"));
  assert.ok(gallery.includes("failedThumbnails"));
  assert.ok(gallery.includes("NoImagePlaceholder"));
  assert.ok(fallback.includes('role={decorative ? undefined : "img"}'));
  assert.ok(fallback.includes("aria-label={decorative ? undefined : label}"));
  assert.ok(fallback.includes('data-slot="no-image-placeholder"'));
  assert.ok(fallback.includes("never substitutes stock"));
});

check("media:detail route still owns approved gallery and trust model", () => {
  const detail = read(files.detail);
  assert.ok(detail.includes("<ListingGallery"));
  assert.ok(detail.includes("listingFreshnessStatus"));
  assert.ok(detail.includes("listingSchema"));
  assert.ok(detail.includes("breadcrumbListSchema"));
});

check("media:production image configuration is not broadened", () => {
  const config = read(files.config);
  assert.ok(config.includes('hostname: "*.supabase.co"'));
  assert.ok(
    config.includes('pathname: "/storage/v1/object/public/**"'),
  );
  assert.ok(!config.includes("unoptimized"));
  assert.ok(!config.includes("dangerouslyAllowSVG"));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
