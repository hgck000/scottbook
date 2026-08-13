import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const windows = process.platform === "win32";
const gradleCommand = windows ? "gradlew.bat" : "./gradlew";
const gradleTasks = ["testDebugUnitTest", "lintDebug", "assembleDebug"];
const result = spawnSync(gradleCommand, gradleTasks, {
  cwd: "android",
  stdio: "inherit",
  shell: windows
});

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(
    `Gradle Android debug verification failed with exit code ${result.status}`
  );
}

const source = join("android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const targetDirectory = "artifacts";
const target = join(
  targetDirectory,
  `ScottBook-v${packageJson.version}-android-debug.apk`
);
mkdirSync(targetDirectory, { recursive: true });
copyFileSync(source, target);
console.log(`Debug APK copied to ${target}`);
