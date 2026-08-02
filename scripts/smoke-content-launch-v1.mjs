#!/usr/bin/env node
/**
 * CONTENT_LAUNCH_V1 browser smoke — Chromium + WebKit.
 * Checks EN/ZH/TH homepage, project detail, developer, knowledge,
 * broken images, broken internal links, empty public sections.
 */
import { chromium, webkit } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.BASE_URL || "http://127.0.0.1:3011";
const outDir = join(
  process.cwd(),
  "REPORTS",
  "CONTENT_LAUNCH_V1",
  "evidence",
);
mkdirSync(outDir, { recursive: true });

const locales = ["en", "zh", "th"];
const sampleProject = "modiz-rhyme-ramkhamhaeng";
const sampleDeveloper = "sansiri";

const routes = [
  ...locales.map((l) => `/${l}`),
  ...locales.map((l) => `/${l}/projects/${sampleProject}`),
  ...locales.map((l) => `/${l}/developers/${sampleDeveloper}`),
  ...locales.map((l) => `/${l}/knowledge`),
  ...locales.map((l) => `/${l}/cities/bangkok`),
];

const browserSpecs = [
  { name: "chromium", launcher: chromium },
  { name: "webkit", launcher: webkit },
];

async function inspectPage(page) {
  // Scroll so lazy media enters the viewport before measuring.
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  return page.evaluate(async () => {
    const imgs = [...document.querySelectorAll("img")].filter(
      (img) => img.src && !img.src.startsWith("data:"),
    );
    await Promise.all(
      imgs.map(
        (img) =>
          img.complete ||
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 2500);
          }),
      ),
    );

    const brokenImages = [];
    for (const img of imgs) {
      const src = img.currentSrc || img.src;
      if (!(img.complete && img.naturalWidth > 0)) {
        // Confirm via fetch — lazy decode can leave naturalWidth 0 briefly.
        try {
          const res = await fetch(src, { method: "GET" });
          if (!res.ok) brokenImages.push({ src, alt: img.alt || "", status: res.status });
        } catch {
          brokenImages.push({ src, alt: img.alt || "", status: "fetch-failed" });
        }
      }
    }
    const anchors = [...document.querySelectorAll("a[href]")];
    const internal = anchors
      .map((a) => a.getAttribute("href") || "")
      .filter(
        (h) =>
          h.startsWith("/") &&
          !h.startsWith("//") &&
          !h.startsWith("/#") &&
          !h.includes("mailto:") &&
          !h.includes("tel:"),
      );

    const emptySections = [...document.querySelectorAll("[data-home-section]")]
      .filter((section) => {
        const text = (section.innerText || "").replace(/\s+/g, " ").trim();
        const hasCards =
          section.querySelectorAll(
            "[data-launch-project],[data-launch-developer],[data-launch-knowledge],img,a",
          ).length > 0;
        return text.length < 8 && !hasCards;
      })
      .map((s) => s.getAttribute("data-home-section"));

    const projectCount = document.querySelectorAll(
      "[data-launch-project]",
    ).length;
    const developerCount = document.querySelectorAll(
      "[data-launch-developer]",
    ).length;
    const knowledgeCount = document.querySelectorAll(
      "[data-launch-knowledge]",
    ).length;

    const body = (document.body?.innerText || "").slice(0, 1200);
    return {
      title: document.title,
      htmlId: document.documentElement.id,
      brokenImages,
      internalLinkCount: internal.length,
      internalLinks: internal.slice(0, 80),
      emptySections,
      projectCount,
      developerCount,
      knowledgeCount,
      body,
      hasContactPriceFallback: /Contact for latest price|请联系获取最新价格|ติดต่อสอบถามราคาล่าสุด/i.test(
        body,
      ),
    };
  });
}

async function checkInternalLinks(page, links, locale) {
  const broken = [];
  const unique = [...new Set(links)].slice(0, 40);
  for (const href of unique) {
    // Skip query-only / hash routes for HEAD cost
    const path = href.split("?")[0].split("#")[0];
    if (!path || path === "/") continue;
    // Only check same-locale app routes relevant to launch
    if (
      !path.startsWith(`/${locale}/`) &&
      path !== `/${locale}` &&
      !["/en", "/zh", "/th"].includes(path)
    ) {
      continue;
    }
    try {
      const res = await page.request.get(new URL(path, base).toString(), {
        maxRedirects: 5,
        timeout: 20000,
      });
      if (res.status() >= 400) {
        broken.push({ href: path, status: res.status() });
      }
    } catch (err) {
      broken.push({ href: path, error: String(err?.message || err) });
    }
  }
  return broken;
}

async function smoke(browserName, launcher, route) {
  const locale = route.split("/")[1] || "en";
  const result = {
    browser: browserName,
    route,
    url: `${base}${route}`,
    httpStatus: null,
    pageErrors: [],
    consoleErrors: [],
    brokenImages: [],
    brokenLinks: [],
    emptySections: [],
    projectCount: 0,
    developerCount: 0,
    knowledgeCount: 0,
    isNextGlobalError: false,
  };

  const browser = await launcher.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    page.on("pageerror", (err) => result.pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") result.consoleErrors.push(msg.text());
    });

    const response = await page.goto(result.url, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    result.httpStatus = response?.status() ?? null;
    await page.waitForTimeout(800);

    const info = await inspectPage(page);
    result.title = info.title;
    result.brokenImages = info.brokenImages;
    result.emptySections = info.emptySections;
    result.projectCount = info.projectCount;
    result.developerCount = info.developerCount;
    result.knowledgeCount = info.knowledgeCount;
    result.isNextGlobalError =
      info.htmlId === "__next_error__" ||
      /This page couldn.?t load/i.test(info.body || "");

    if (route === `/${locale}`) {
      result.brokenLinks = await checkInternalLinks(
        page,
        info.internalLinks,
        locale,
      );
    }

    const shot = `${browserName}${route.replace(/\//g, "_") || "_root"}.png`;
    await page.screenshot({
      path: join(outDir, shot),
      fullPage: false,
    });

    // Mobile viewport spot-check on homepage only
    if (route === `/${locale}` && browserName === "chromium") {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: join(outDir, `mobile_${locale}.png`),
      });
    }

    await context.close();
  } finally {
    await browser.close();
  }
  return result;
}

const all = [];
let failed = 0;

for (const b of browserSpecs) {
  for (const route of routes) {
    try {
      const r = await smoke(b.name, b.launcher, route);
      all.push(r);
      const locale = route.split("/")[1];
      const home = route === `/${locale}`;
      const problems = [];
      if (r.isNextGlobalError) problems.push("global-error");
      if ((r.httpStatus || 500) >= 400) problems.push(`http-${r.httpStatus}`);
      if (r.pageErrors.length) problems.push("page-errors");
      if (r.brokenImages.length) problems.push(`broken-images:${r.brokenImages.length}`);
      if (r.brokenLinks.length) problems.push(`broken-links:${r.brokenLinks.length}`);
      if (home && r.emptySections.length) {
        problems.push(`empty-sections:${r.emptySections.join(",")}`);
      }
      if (home && r.projectCount !== 12) {
        problems.push(`projects=${r.projectCount}`);
      }
      if (home && r.developerCount !== 10) {
        problems.push(`developers=${r.developerCount}`);
      }
      if (home && r.knowledgeCount < 6) {
        problems.push(`knowledge=${r.knowledgeCount}`);
      }
      if (route.endsWith("/knowledge") && r.knowledgeCount !== 21) {
        problems.push(`knowledge-hub=${r.knowledgeCount}`);
      }

      const status = problems.length ? "FAIL" : "PASS";
      if (problems.length) failed += 1;
      console.log(
        `${status} ${b.name} ${route} http=${r.httpStatus} projects=${r.projectCount} developers=${r.developerCount} knowledge=${r.knowledgeCount} brokenImg=${r.brokenImages.length} brokenLink=${r.brokenLinks.length}`,
      );
      if (problems.length) console.log("  ", problems.join(" | "));
      if (r.pageErrors.length) console.log("  pageErrors", r.pageErrors.slice(0, 3));
      if (r.brokenImages.length) {
        console.log("  brokenImages", r.brokenImages.slice(0, 5));
      }
    } catch (err) {
      failed += 1;
      all.push({ browser: b.name, route, fatal: String(err?.stack || err) });
      console.log(`FAIL ${b.name} ${route} fatal=${err}`);
    }
  }
}

const summary = {
  base,
  failed,
  total: all.length,
  brokenImages: all.reduce((n, r) => n + (r.brokenImages?.length || 0), 0),
  brokenLinks: all.reduce((n, r) => n + (r.brokenLinks?.length || 0), 0),
  chromiumPass: all
    .filter((r) => r.browser === "chromium")
    .every((r) => !r.fatal && !r.isNextGlobalError && (r.httpStatus || 500) < 400 && !(r.pageErrors?.length)),
  webkitPass: all
    .filter((r) => r.browser === "webkit")
    .every((r) => !r.fatal && !r.isNextGlobalError && (r.httpStatus || 500) < 400 && !(r.pageErrors?.length)),
  results: all,
};

writeFileSync(join(outDir, "smoke-results.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ failed: summary.failed, brokenImages: summary.brokenImages, brokenLinks: summary.brokenLinks, chromiumPass: summary.chromiumPass, webkitPass: summary.webkitPass }, null, 2));

assert.equal(failed, 0, `smoke failed ${failed} cases`);
console.log("CONTENT_LAUNCH_V1 smoke PASS");
