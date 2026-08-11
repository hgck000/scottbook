import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

function fail(message) {
  throw new Error(`Release verification failed: ${message}`);
}

function normalizeBasePath(value) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "/") return "/";
  if (trimmed.includes("..") || /[\\:?#\s]/.test(trimmed)) {
    fail("SCOTTBOOK_BASE_PATH must be a safe URL path");
  }
  const path = trimmed.replace(/^\/+|\/+$/g, "");
  return path ? `/${path}/` : "/";
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const expectedBase = normalizeBasePath(process.env.SCOTTBOOK_BASE_PATH);
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const manifest = readJson("dist/manifest.webmanifest");
const indexHtml = readFileSync("dist/index.html", "utf8");
const serviceWorker = readFileSync("dist/sw.js", "utf8");

if (packageLock.version !== packageJson.version) {
  fail("package-lock version does not match package.json");
}
if (packageLock.packages?.[""]?.version !== packageJson.version) {
  fail("root package-lock entry has a different app version");
}
if (manifest.id !== expectedBase) fail(`manifest id must be ${expectedBase}`);
if (manifest.start_url !== expectedBase) {
  fail(`manifest start_url must be ${expectedBase}`);
}
if (manifest.scope !== expectedBase) {
  fail(`manifest scope must be ${expectedBase}`);
}
if (manifest.display !== "standalone" || manifest.lang !== "vi") {
  fail("manifest must stay standalone and Vietnamese-first");
}

const iconPurposes = new Set();
for (const icon of manifest.icons ?? []) {
  if (!icon.src.startsWith(expectedBase)) {
    fail(`icon URL escapes the deployment base: ${icon.src}`);
  }
  const relativePath = icon.src.slice(expectedBase.length);
  if (!relativePath || !existsSync(join("dist", relativePath))) {
    fail(`manifest icon is missing from dist: ${icon.src}`);
  }
  iconPurposes.add(icon.purpose);
}
if (!iconPurposes.has("any") || !iconPurposes.has("maskable")) {
  fail("manifest needs both any and maskable icons");
}

if (!indexHtml.includes('http-equiv="Content-Security-Policy"')) {
  fail("production HTML is missing its Content-Security-Policy");
}
if (!indexHtml.includes(`${expectedBase}manifest.webmanifest`)) {
  fail("manifest link does not use the selected deployment base");
}
if (!serviceWorker.includes("precacheAndRoute")) {
  fail("generated service worker has no precache route");
}
if (!serviceWorker.includes(`${expectedBase}index.html`)) {
  fail("service worker navigation fallback does not match the deployment base");
}

const productionAssets = readdirSync("dist/assets").filter((name) =>
  /\.(?:css|js)$/.test(name)
);
if (productionAssets.length < 2) fail("production JS/CSS assets are missing");
for (const name of productionAssets) {
  const source = readFileSync(join("dist/assets", name), "utf8");
  if (/fake-indexeddb|vitest|@playwright\/test/.test(source)) {
    fail(`test-only dependency leaked into ${basename(name)}`);
  }
}

console.log(
  `Release artifact verified for ScottBook ${packageJson.version} at base ${expectedBase}.`
);
