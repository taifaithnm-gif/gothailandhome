/**
 * WEBSITE_QUALITY_SPRINT_02 validation
 * Desktop/Tablet/Mobile × Chromium/WebKit
 */
import { chromium, webkit } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3042";
const OUT = resolve("REPORTS/WEBSITE_QUALITY_SPRINT_02/evidence");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

const results = { base: BASE, browsers: {}, failures: [], summary: {}, bangkok: {} };

function fail(msg) {
  results.failures.push(msg);
  console.error("FAIL:", msg);
}
function ok(msg) {
  console.log("PASS:", msg);
}

async function dismissConsent(page) {
  const banner = page.locator('[data-slot="analytics-consent-banner"]');
  if (await banner.isVisible().catch(() => false)) {
    const buttons = banner.locator("button");
    if ((await buttons.count()) > 0) await buttons.last().click().catch(() => {});
  }
}

async function check(browserName, browser, viewportName, viewport) {
  const key = `${browserName}/${viewportName}`;
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  // Bangkok
  await page.goto(`${BASE}/en/cities/bangkok`, { waitUntil: "networkidle" });
  await dismissConsent(page);
  const bodyText = await page.locator("body").innerText();
  const overviewCount = (
    bodyText.match(
      /Bangkok is Thailand's capital and largest property market/g,
    ) || []
  ).length;
  const districtLinks = await page.locator('[data-slot="city-district-link"]').count();
  const districtToggle = await page.locator('[data-slot="city-district-toggle"]').count();
  const placeholders = await page.locator('[data-slot="branded-media-placeholder"]').count();
  const charCount = bodyText.length;

  if (overviewCount !== 1)
    fail(`${key}: Bangkok overview dup count=${overviewCount}`);
  else ok(`${key}: Bangkok overview once`);
  if (districtLinks > 20 && !districtToggle)
    fail(`${key}: districts uncapped without toggle (${districtLinks})`);
  else ok(`${key}: districts capped/togglable (${districtLinks})`);

  if (viewportName === "desktop" && browserName === "chromium") {
    results.bangkok = {
      charactersAfter: charCount,
      districtLinksInitial: districtLinks,
      placeholders,
      overviewCount,
    };
  }

  await page.screenshot({
    path: resolve(OUT, `${browserName}-${viewportName}-bangkok.png`),
    fullPage: false,
  });

  // Favorites
  await page.goto(`${BASE}/en/favorites`, { waitUntil: "networkidle" });
  await dismissConsent(page);
  const favText = await page.locator("body").innerText();
  const retention =
    (
      favText.match(
        /Favorites are stored only on this device/g,
      ) || []
    ).length;
  if (retention !== 1) fail(`${key}: favorites retention dup=${retention}`);
  else ok(`${key}: favorites retention once`);

  // Contact LINE/WeChat
  await page.goto(`${BASE}/en/contact`, { waitUntil: "networkidle" });
  await dismissConsent(page);
  const lineQr = page.locator('[data-contact-channel="line-qr"]');
  const wechatQr = page.locator('[data-contact-channel="wechat-qr"]');
  const lineLink = page.locator('a[data-contact-channel="line"]');
  const wechatLink = page.locator('a[data-contact-channel="wechat"]');
  if ((await lineQr.count()) < 1) fail(`${key}: LINE QR missing`);
  else ok(`${key}: LINE QR`);
  if ((await wechatQr.count()) < 1) fail(`${key}: WeChat QR missing`);
  else ok(`${key}: WeChat QR`);
  if ((await lineLink.count()) < 1) fail(`${key}: LINE clickable missing`);
  else ok(`${key}: LINE clickable`);
  if ((await wechatLink.count()) < 1) fail(`${key}: WeChat clickable missing`);
  else ok(`${key}: WeChat clickable`);

  await page.screenshot({
    path: resolve(OUT, `${browserName}-${viewportName}-contact.png`),
    fullPage: false,
  });

  // Project (logo fallback contain) + localization sample
  await page.goto(`${BASE}/en/projects/one-bangkok`, {
    waitUntil: "networkidle",
  });
  await dismissConsent(page);
  const containFit = await page.locator('[data-media-fit="contain"]').count();
  const coverFit = await page.locator('[data-media-fit="cover"]').count();
  // one-bangkok may use logo fallback
  ok(`${key}: project media fit contain=${containFit} cover=${coverFit}`);

  await page.goto(`${BASE}/zh/projects/modiz-rhyme-ramkhamhaeng`, {
    waitUntil: "networkidle",
  });
  await dismissConsent(page);
  const zhBody = await page.locator("body").innerText();
  const hasEnFacility =
    /\bSwimming pool\b/.test(zhBody) || /\bFitness \/ gym\b/.test(zhBody);
  const hasZhFacility = /游泳池|健身室|停车|安保/.test(zhBody);
  if (hasEnFacility && !hasZhFacility)
    fail(`${key}: facility tags still English on ZH`);
  else ok(`${key}: ZH facilities localized or absent`);

  // Knowledge → Project journey
  await page.goto(
    `${BASE}/en/knowledge/articles/thailand-property-buying-guide`,
    { waitUntil: "networkidle" },
  );
  await dismissConsent(page);
  const projectLinks = await page
    .locator('[data-slot="knowledge-project-link"]')
    .count();
  const enquiry = page.locator('[data-slot="knowledge-enquiry-cta"]');
  if (projectLinks < 1) fail(`${key}: knowledge project links missing`);
  else ok(`${key}: knowledge→project`);
  if (!(await enquiry.count())) fail(`${key}: knowledge enquiry missing`);
  else ok(`${key}: knowledge→contact CTA`);

  // Properties cards
  await page.goto(`${BASE}/en/properties`, { waitUntil: "networkidle" });
  await dismissConsent(page);
  const cardLinks = await page.locator('[data-card-link]').count();
  const emptyBlocks = await page
    .locator('[data-media-state="unavailable"]')
    .count();
  if (emptyBlocks > 0) fail(`${key}: empty image blocks ${emptyBlocks}`);
  else ok(`${key}: no empty image blocks`);
  ok(`${key}: card links ${cardLinks}`);

  // Internal artifacts
  const allText = await page.locator("body").innerText();
  if (/not yet verified from an approved source/i.test(allText))
    fail(`${key}: internal verification wording`);
  else ok(`${key}: no internal artifacts`);

  results.browsers[key] = {
    overviewCount,
    districtLinks,
    retention,
    containFit,
    projectLinks,
    consoleErrors: consoleErrors.filter(
      (e) => !/favicon|hydration|ResizeObserver/i.test(e),
    ),
  };
  if (results.browsers[key].consoleErrors.length)
    fail(`${key}: console ${results.browsers[key].consoleErrors[0]}`);
  else ok(`${key}: no console errors`);

  await page.close();
}

async function main() {
  for (const [name, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    for (const [vn, vp] of Object.entries(VIEWPORTS)) {
      try {
        await check(name, browser, vn, vp);
      } catch (e) {
        fail(`${name}/${vn}: ${e}`);
      }
    }
    await browser.close();
  }
  results.summary = {
    failures: results.failures.length,
    pass: results.failures.length === 0,
  };
  writeFileSync(
    resolve(OUT, "sprint02-results.json"),
    JSON.stringify(results, null, 2),
  );
  console.log("\nSUMMARY", results.summary, results.bangkok);
  if (results.failures.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
