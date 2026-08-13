import { existsSync, readFileSync } from "node:fs";

function fail(message) {
  throw new Error(`Android project verification failed: ${message}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const packageJson = readJson("package.json");
const copiedConfig = readJson(
  "android/app/src/main/assets/capacitor.config.json"
);
const gradle = readFileSync("android/app/build.gradle", "utf8");
const capacitorBuild = readFileSync(
  "android/app/capacitor.build.gradle",
  "utf8"
);
const capacitorSettings = readFileSync(
  "android/capacitor.settings.gradle",
  "utf8"
);
const manifest = readFileSync(
  "android/app/src/main/AndroidManifest.xml",
  "utf8"
);

if (!existsSync("android/app/src/main/assets/public/index.html")) {
  fail("Capacitor did not copy the native web entrypoint");
}
if (
  copiedConfig.appId !== "io.github.hgck000.scottbook" ||
  copiedConfig.appName !== "ScottBook" ||
  copiedConfig.webDir !== "dist"
) {
  fail("copied Capacitor identity or web directory is incorrect");
}
if (copiedConfig.server?.url || copiedConfig.server?.cleartext) {
  fail("copied native config points at a remote or cleartext server");
}
if (manifest.includes("android.permission.INTERNET")) {
  fail("offline Android baseline must not request Internet permission");
}
if (!manifest.includes('android:allowBackup="false"')) {
  fail("Android cloud backup must remain disabled for device-only data");
}
if (!gradle.includes("versionCode 30")) {
  fail("Android versionCode must be 30");
}
if (!gradle.includes(`versionName \"${packageJson.version}\"`)) {
  fail(`Android versionName must be ${packageJson.version}`);
}
for (const signingKey of [
  "SCOTTBOOK_ANDROID_KEYSTORE_PATH",
  "SCOTTBOOK_ANDROID_KEYSTORE_PASSWORD",
  "SCOTTBOOK_ANDROID_KEY_ALIAS",
  "SCOTTBOOK_ANDROID_KEY_PASSWORD"
]) {
  if (!gradle.includes(signingKey)) {
    fail(`release signing guard is missing ${signingKey}`);
  }
}
if (
  !gradle.includes("Refusing to build an unsigned ScottBook release") ||
  !gradle.includes("release keystore must remain outside the repository")
) {
  fail("release signing must fail closed and keep its key outside Git");
}
if (
  !capacitorBuild.includes("implementation project(':capacitor-app')") ||
  !capacitorSettings.includes("include ':capacitor-app'")
) {
  fail("Capacitor App plugin must be synced for Android Back handling");
}

console.log(
  `Android project verified for ${copiedConfig.appId} ${packageJson.version}: bundled assets, no server URL.`
);
