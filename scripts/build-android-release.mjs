import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync
} from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SIGNING_ENVIRONMENT_KEYS = [
  "SCOTTBOOK_ANDROID_KEYSTORE_PATH",
  "SCOTTBOOK_ANDROID_KEYSTORE_PASSWORD",
  "SCOTTBOOK_ANDROID_KEY_ALIAS",
  "SCOTTBOOK_ANDROID_KEY_PASSWORD",
  "SCOTTBOOK_ANDROID_CERT_SHA256"
];

export function normalizeCertificateFingerprint(value) {
  const fingerprint = value.replace(/[:\s]/gu, "").toUpperCase();
  if (!/^[0-9A-F]{64}$/u.test(fingerprint)) {
    throw new Error(
      "SCOTTBOOK_ANDROID_CERT_SHA256 phải là fingerprint SHA-256 gồm 64 ký tự hex."
    );
  }
  return fingerprint;
}

export function readSigningConfiguration(environment = process.env) {
  const missing = SIGNING_ENVIRONMENT_KEYS.filter(
    (key) => !environment[key]?.trim()
  );
  if (missing.length > 0) {
    throw new Error(
      `Thiếu cấu hình ký Android: ${missing.join(", ")}. Không tạo APK release chưa ký.`
    );
  }
  return {
    keystorePath: environment.SCOTTBOOK_ANDROID_KEYSTORE_PATH,
    expectedFingerprint: normalizeCertificateFingerprint(
      environment.SCOTTBOOK_ANDROID_CERT_SHA256
    )
  };
}

export function resolveExternalKeystore(keystorePath, repositoryRoot) {
  const resolvedKeystore = realpathSync(resolve(keystorePath));
  if (!statSync(resolvedKeystore).isFile()) {
    throw new Error("Đường dẫn keystore không trỏ tới một tệp.");
  }
  const resolvedRepository = realpathSync(resolve(repositoryRoot));
  const repositoryRelativePath = relative(
    resolvedRepository,
    resolvedKeystore
  );
  if (
    repositoryRelativePath === "" ||
    (!repositoryRelativePath.startsWith("..") &&
      !isAbsolute(repositoryRelativePath))
  ) {
    throw new Error(
      "Keystore release phải nằm ngoài repository ScottBook và không được đưa vào git am."
    );
  }
  return resolvedKeystore;
}

function compareBuildToolVersions(left, right) {
  const parse = (value) =>
    value.split(/[.-]/u).map((part) => Number.parseInt(part, 10) || 0);
  const leftParts = parse(left);
  const rightParts = parse(right);
  for (
    let index = 0;
    index < Math.max(leftParts.length, rightParts.length);
    index += 1
  ) {
    const difference = (rightParts[index] ?? 0) - (leftParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export function findApksigner(environment = process.env) {
  if (environment.SCOTTBOOK_APKSIGNER_PATH) {
    const configured = resolve(environment.SCOTTBOOK_APKSIGNER_PATH);
    if (!existsSync(configured)) {
      throw new Error(`Không tìm thấy apksigner: ${configured}`);
    }
    return configured;
  }

  const sdkRoot = environment.ANDROID_SDK_ROOT || environment.ANDROID_HOME;
  if (sdkRoot) {
    const buildToolsDirectory = join(sdkRoot, "build-tools");
    if (existsSync(buildToolsDirectory)) {
      const executable =
        process.platform === "win32" ? "apksigner.bat" : "apksigner";
      for (const version of readdirSync(buildToolsDirectory).sort(
        compareBuildToolVersions
      )) {
        const candidate = join(buildToolsDirectory, version, executable);
        if (existsSync(candidate)) return candidate;
      }
    }
  }
  return process.platform === "win32" ? "apksigner.bat" : "apksigner";
}

export function parseApksignerFingerprint(output) {
  const match = output.match(
    /Signer #1 certificate SHA-256 digest:\s*([0-9a-f:]+)/iu
  );
  if (!match?.[1]) {
    throw new Error("apksigner không trả về fingerprint SHA-256 của chứng thư.");
  }
  return normalizeCertificateFingerprint(match[1]);
}

function run(command, argumentsList, options = {}) {
  const result = spawnSync(command, argumentsList, {
    cwd: options.cwd,
    encoding: "utf8",
    env: options.environment,
    shell: process.platform === "win32",
    stdio: options.capture ? "pipe" : "inherit"
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = options.capture
      ? (result.stderr || result.stdout || "không có thông báo").trim()
      : `exit code ${result.status}`;
    throw new Error(`${basename(command)} thất bại: ${detail}`);
  }
  return result;
}

function sha256File(filePath) {
  return createHash("sha256")
    .update(readFileSync(filePath))
    .digest("hex")
    .toUpperCase();
}

export function buildSignedAndroidRelease({
  environment = process.env,
  repositoryRoot = process.cwd(),
  now = new Date()
} = {}) {
  const signing = readSigningConfiguration(environment);
  resolveExternalKeystore(signing.keystorePath, repositoryRoot);

  const packageJson = JSON.parse(
    readFileSync(join(repositoryRoot, "package.json"), "utf8")
  );
  const windows = process.platform === "win32";
  const gradleCommand = windows ? "gradlew.bat" : "./gradlew";
  run(
    gradleCommand,
    ["testReleaseUnitTest", "lintRelease", "assembleRelease"],
    {
      cwd: join(repositoryRoot, "android"),
      environment
    }
  );

  const source = join(
    repositoryRoot,
    "android",
    "app",
    "build",
    "outputs",
    "apk",
    "release",
    "app-release.apk"
  );
  if (!existsSync(source)) {
    throw new Error("Gradle hoàn tất nhưng không tạo app-release.apk.");
  }

  const apksigner = findApksigner(environment);
  const verification = run(
    apksigner,
    ["verify", "--verbose", "--print-certs", source],
    { capture: true, environment }
  );
  const actualFingerprint = parseApksignerFingerprint(
    `${verification.stdout}\n${verification.stderr}`
  );
  if (actualFingerprint !== signing.expectedFingerprint) {
    throw new Error(
      `Fingerprint APK không khớp khóa chủ sở hữu. Mong đợi ${signing.expectedFingerprint}, nhận ${actualFingerprint}.`
    );
  }

  const artifactDirectory = join(repositoryRoot, "artifacts");
  mkdirSync(artifactDirectory, { recursive: true });
  const artifactName = `ScottBook-v${packageJson.version}-android-release.apk`;
  const target = join(artifactDirectory, artifactName);
  copyFileSync(source, target);

  const reportPath = join(
    artifactDirectory,
    `ScottBook-v${packageJson.version}-android-release-signing.json`
  );
  writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        format: "scottbook-android-release-signing",
        formatVersion: 1,
        generatedAt: now.toISOString(),
        appVersion: packageJson.version,
        apkFile: artifactName,
        apkSha256: sha256File(target),
        certificateSha256: actualFingerprint
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Signed release APK copied to ${target}`);
  console.log(`Certificate SHA-256: ${actualFingerprint}`);
  console.log(`Signing report: ${reportPath}`);
  return { target, reportPath, certificateSha256: actualFingerprint };
}

const launchedDirectly =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (launchedDirectly) {
  try {
    buildSignedAndroidRelease();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
