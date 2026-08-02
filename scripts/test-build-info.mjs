#!/usr/bin/env node
/**
 * Contract test for immutable build identification (/api/build-info).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function ok(msg) {
  console.log(`PASS: ${msg}`);
}

function check(name, fn) {
  try {
    fn();
    ok(name);
  } catch (error) {
    console.error(`FAIL: ${name} — ${error.message}`);
    process.exitCode = 1;
  }
}

check("build-info: modules and route exist", () => {
  for (const file of [
    "src/lib/build-info/resolve.ts",
    "src/lib/build-info/index.ts",
    "src/app/api/build-info/route.ts",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("build-info: next.config bakes BUILD_* env", () => {
  const cfg = read("next.config.ts");
  assert.match(cfg, /BUILD_COMMIT_SHA/);
  assert.match(cfg, /BUILD_TIME/);
  assert.match(cfg, /BUILD_VERSION/);
  assert.match(cfg, /env:\s*\{/);
});

check("build-info: route is GET JSON no-store", () => {
  const route = read("src/app/api/build-info/route.ts");
  assert.match(route, /export async function GET/);
  assert.match(route, /getBuildInfo/);
  assert.match(route, /NextResponse\.json/);
  assert.match(route, /no-store/);
  assert.ok(!route.includes(".tsx"), "route must not be a UI module");
});

check("build-info: getBuildInfo uses static process.env.BUILD_* reads", () => {
  const src = read("src/lib/build-info/index.ts");
  assert.match(src, /process\.env\.BUILD_COMMIT_SHA/);
  assert.match(src, /process\.env\.BUILD_TIME/);
  assert.match(src, /process\.env\.BUILD_VERSION/);
});

check("build-info: resolve priority and shape", async () => {
  const mod = await import(
    pathToFileURL(resolve(root, "src/lib/build-info/resolve.ts")).href
  );
  const info = mod.resolveBuildInfo(
    {
      BUILD_COMMIT_SHA: "abc123def",
      BUILD_TIME: "2026-08-02T03:00:00.000Z",
      BUILD_VERSION: "1.2.3",
    },
    {
      packageVersion: "0.1.0",
      deploymentEnvironment: "preview",
      now: () => "SHOULD_NOT_USE",
    },
  );
  assert.deepEqual(info, {
    version: "1.2.3",
    build_time: "2026-08-02T03:00:00.000Z",
    commit_sha: "abc123def",
    deployment_environment: "preview",
  });

  const fallback = mod.resolveBuildInfo(
    {},
    {
      packageVersion: "0.1.0",
      deploymentEnvironment: "development",
      now: () => "2026-01-01T00:00:00.000Z",
    },
  );
  assert.equal(fallback.version, "0.1.0");
  assert.equal(fallback.build_time, "2026-01-01T00:00:00.000Z");
  assert.equal(fallback.commit_sha, null);
  assert.equal(fallback.deployment_environment, "development");

  assert.equal(
    mod.resolveCommitSha({ GIT_COMMIT_SHA: "from-git", GITHUB_SHA: "from-gh" }),
    "from-git",
  );
  assert.equal(
    mod.resolveCommitSha({
      VERCEL_GIT_COMMIT_SHA: "from-vercel",
      GITHUB_SHA: "from-gh",
    }),
    "from-vercel",
  );
});

if (!process.exitCode) {
  console.log("All build-info checks passed.");
}
