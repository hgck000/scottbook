import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

function fail(message) {
  throw new Error(`Android web verification failed: ${message}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const capacitorConfig = readFileSync("capacitor.config.ts", "utf8");
const indexHtml = readFileSync("dist/index.html", "utf8");

if (packageLock.version !== packageJson.version) {
  fail("package-lock version does not match package.json");
}
if (packageLock.packages?.[""]?.version !== packageJson.version) {
  fail("root package-lock entry has a different app version");
}
if (!capacitorConfig.includes('appId: "io.github.hgck000.scottbook"')) {
  fail("Capacitor app ID changed unexpectedly");
}
if (!capacitorConfig.includes('appName: "ScottBook"')) {
  fail("Capacitor app name changed unexpectedly");
}
if (!capacitorConfig.includes('webDir: "dist"')) {
  fail("Capacitor webDir must remain dist");
}
if (/\burl\s*:|allowNavigation\s*:|cleartext\s*:\s*true/.test(capacitorConfig)) {
  fail("native production config must not load a remote or cleartext server");
}
if (!indexHtml.includes('http-equiv="Content-Security-Policy"')) {
  fail("native HTML is missing its Content-Security-Policy");
}
if (/rel="manifest"/.test(indexHtml)) {
  fail("native HTML must not advertise browser installation");
}
if (existsSync("dist/manifest.webmanifest") || existsSync("dist/sw.js")) {
  fail("browser manifest or service worker leaked into the native bundle");
}

const productionAssets = readdirSync("dist/assets").filter((name) =>
  /\.(?:css|js)$/.test(name)
);
if (productionAssets.length < 2) fail("native JS/CSS assets are missing");
for (const name of productionAssets) {
  const source = readFileSync(join("dist/assets", name), "utf8");
  if (/fake-indexeddb|vitest|@playwright\/test/.test(source)) {
    fail(`test-only dependency leaked into ${basename(name)}`);
  }
}

console.log(
  `Android web bundle verified for ScottBook ${packageJson.version}: local assets only, no service worker.`
);
