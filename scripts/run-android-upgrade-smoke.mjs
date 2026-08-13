import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  findAapt,
  inspectApkCertificate,
  normalizeCertificateFingerprint,
  runAndroidTool
} from "./build-android-release.mjs";
import {
  APP_ID,
  MAIN_ACTIVITY,
  chooseDevice,
  commandResult,
  formatInstallFailure,
  hasResumedScottBookActivity,
  parseConnectedDevices,
  parsePackageMetadata,
  readProperty,
  resolveAdbPath,
  runAdb,
  timestampForPath,
  wait
} from "./run-android-device-smoke.mjs";

const MAX_BACKUP_AGE_MS = 24 * 60 * 60 * 1_000;

export function parseUpgradeArguments(argumentsList) {
  const options = {
    apk: null,
    backup: null,
    serial: null,
    evidenceDirectory: null
  };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (["--backup", "--serial", "--evidence-dir"].includes(argument)) {
      const value = argumentsList[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} cần một giá trị.`);
      }
      if (argument === "--backup") options.backup = value;
      if (argument === "--serial") options.serial = value;
      if (argument === "--evidence-dir") options.evidenceDirectory = value;
      index += 1;
    } else if (argument.startsWith("--")) {
      throw new Error(`Tùy chọn không hỗ trợ: ${argument}`);
    } else if (options.apk) {
      throw new Error("Chỉ được truyền một APK candidate.");
    } else {
      options.apk = argument;
    }
  }
  if (!options.apk) throw new Error("Cần đường dẫn APK candidate.");
  if (!options.backup) {
    throw new Error(
      "Cần --backup trỏ tới bản sao JSON mới xuất trước khi nâng cấp."
    );
  }
  return options;
}

function hasOnlyKeys(value, expectedKeys) {
  const keys = Object.keys(value).sort();
  return (
    keys.length === expectedKeys.length &&
    expectedKeys.slice().sort().every((key, index) => key === keys[index])
  );
}

export function validateFreshBackup(backupText, now = new Date()) {
  let backup;
  try {
    backup = JSON.parse(backupText);
  } catch {
    throw new Error("Backup không phải JSON hợp lệ.");
  }
  if (
    !backup ||
    typeof backup !== "object" ||
    !hasOnlyKeys(backup, [
      "format",
      "formatVersion",
      "appVersion",
      "exportedAt",
      "data",
      "checksum"
    ]) ||
    backup.format !== "scottbook-backup" ||
    backup.formatVersion !== 1 ||
    typeof backup.appVersion !== "string" ||
    typeof backup.exportedAt !== "string" ||
    !backup.data ||
    typeof backup.data !== "object" ||
    !backup.checksum ||
    typeof backup.checksum !== "object" ||
    !hasOnlyKeys(backup.checksum, ["algorithm", "value"]) ||
    backup.checksum.algorithm !== "SHA-256" ||
    !/^[a-f0-9]{64}$/u.test(backup.checksum.value)
  ) {
    throw new Error("Backup không đúng schema ScottBook v1.");
  }

  const unsigned = {
    format: backup.format,
    formatVersion: backup.formatVersion,
    appVersion: backup.appVersion,
    exportedAt: backup.exportedAt,
    data: backup.data
  };
  const expectedChecksum = createHash("sha256")
    .update(JSON.stringify(unsigned))
    .digest("hex");
  if (expectedChecksum !== backup.checksum.value) {
    throw new Error("Checksum backup không khớp; không được dùng để nâng cấp.");
  }

  const exportedAt = new Date(backup.exportedAt);
  const age = now.getTime() - exportedAt.getTime();
  if (!Number.isFinite(exportedAt.getTime()) || age < -5 * 60 * 1_000) {
    throw new Error("Thời điểm xuất backup không hợp lệ.");
  }
  if (age > MAX_BACKUP_AGE_MS) {
    throw new Error("Backup đã quá 24 giờ; hãy xuất một bản JSON mới.");
  }
  return {
    appVersion: backup.appVersion,
    exportedAt: backup.exportedAt,
    checksum: backup.checksum.value
  };
}

export function parseAaptBadging(output) {
  const packageLine = output.match(
    /^package:\s+name='([^']+)'\s+versionCode='(\d+)'\s+versionName='([^']+)'/mu
  );
  if (!packageLine) {
    throw new Error("aapt không đọc được package/version từ APK candidate.");
  }
  return {
    appId: packageLine[1],
    versionCode: Number.parseInt(packageLine[2], 10),
    versionName: packageLine[3],
    requestsInternet: /uses-permission:\s+name='android\.permission\.INTERNET'/u.test(
      output
    )
  };
}

export function parseInstalledPackagePaths(output) {
  return output
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("package:"))
    .map((line) => line.slice("package:".length))
    .filter(Boolean);
}

export function assertSafeUpgradePreflight({
  backup,
  installed,
  candidate,
  installedFingerprint,
  candidateFingerprint,
  expectedOwnerFingerprint
}) {
  const failures = [];
  if (candidate.appId !== APP_ID) {
    failures.push(`APK candidate dùng app ID ${candidate.appId}`);
  }
  if (!installed.versionCode || !installed.versionName) {
    failures.push("không đọc được phiên bản ScottBook đang cài");
  }
  if (candidate.versionCode <= (installed.versionCode ?? 0)) {
    failures.push(
      `versionCode candidate ${candidate.versionCode} phải lớn hơn bản đang cài ${installed.versionCode}`
    );
  }
  if (candidate.requestsInternet) {
    failures.push("APK candidate yêu cầu quyền Internet");
  }
  if (installed.requestsInternet) {
    failures.push("ScottBook đang cài có quyền Internet ngoài hợp đồng offline");
  }
  if (backup.appVersion !== installed.versionName) {
    failures.push(
      `backup thuộc app ${backup.appVersion}, khác bản đang cài ${installed.versionName}`
    );
  }
  if (candidateFingerprint !== installedFingerprint) {
    failures.push("chứng thư candidate khác chứng thư app đang cài");
  }
  if (
    expectedOwnerFingerprint &&
    (candidateFingerprint !== expectedOwnerFingerprint ||
      installedFingerprint !== expectedOwnerFingerprint)
  ) {
    failures.push("chứng thư không khớp fingerprint chủ sở hữu đã cấu hình");
  }
  if (failures.length > 0) {
    throw new Error(
      `Dừng trước khi cài; preflight nâng cấp không đạt: ${failures.join("; ")}.`
    );
  }
}

function markdownReport(report) {
  const checks = Object.entries(report.checks)
    .map(([name, passed]) => `- [${passed ? "x" : " "}] ${name}`)
    .join("\n");
  return `# ScottBook Android signed-upgrade report\n\n` +
    `Generated: ${report.generatedAt}\n\n` +
    `- Device: ${report.device.manufacturer} ${report.device.model}\n` +
    `- Android: ${report.device.androidVersion} (API ${report.device.sdk})\n` +
    `- Upgrade: ${report.before.versionName} (${report.before.versionCode}) → ` +
      `${report.after.versionName} (${report.after.versionCode})\n` +
    `- Candidate: ${report.candidate.apkFile}\n` +
    `- Backup: ${report.backup.file} · ${report.backup.exportedAt}\n` +
    `- Certificate SHA-256: ${report.candidate.certificateSha256}\n\n` +
    `## Automated checks\n\n${checks}\n\n` +
    `## Manual data-retention checks\n\n` +
    `- [ ] The previous theme, text settings, and assistance scope remain.\n` +
    `- [ ] Favorites and reading position remain.\n` +
    `- [ ] Review history and known/pinned state remain.\n` +
    `- [ ] Airplane-mode reopen and pinyin/Hán-Việt/meaning still work.\n` +
    `- [ ] The external JSON backup remains available.\n\n` +
    `The ADB serial, backup contents, and private signing material are excluded.\n`;
}

export function runAndroidUpgradeSmoke({
  argumentsList = process.argv.slice(2),
  environment = process.env,
  now = new Date()
} = {}) {
  const options = parseUpgradeArguments(argumentsList);
  const apkPath = resolve(options.apk);
  const backupPath = resolve(options.backup);
  if (!existsSync(apkPath) || !apkPath.endsWith(".apk")) {
    throw new Error(`Không tìm thấy APK candidate hợp lệ: ${apkPath}`);
  }
  if (!existsSync(backupPath) || !backupPath.endsWith(".json")) {
    throw new Error(`Không tìm thấy backup JSON: ${backupPath}`);
  }
  const backup = validateFreshBackup(readFileSync(backupPath, "utf8"), now);

  const candidateBadging = runAndroidTool(
    findAapt(environment),
    ["dump", "badging", apkPath],
    { capture: true, environment }
  );
  const candidate = parseAaptBadging(candidateBadging.stdout);
  const candidateFingerprint = inspectApkCertificate(apkPath, environment);
  const expectedOwnerFingerprint = environment.SCOTTBOOK_ANDROID_CERT_SHA256
    ? normalizeCertificateFingerprint(
        environment.SCOTTBOOK_ANDROID_CERT_SHA256
      )
    : null;

  const adb = resolveAdbPath(environment);
  commandResult(adb, ["start-server"]);
  const device = chooseDevice(
    parseConnectedDevices(commandResult(adb, ["devices", "-l"]).stdout),
    options.serial
  );
  const installedDump = runAdb(adb, device.serial, [
    "shell",
    "dumpsys",
    "package",
    APP_ID
  ]).stdout;
  const installed = parsePackageMetadata(installedDump);
  const installedPaths = parseInstalledPackagePaths(
    runAdb(adb, device.serial, ["shell", "pm", "path", APP_ID]).stdout
  );
  const installedBaseApk =
    installedPaths.find((path) => path.endsWith("/base.apk")) ??
    installedPaths[0];
  if (!installedBaseApk) {
    throw new Error("ScottBook chưa được cài trên thiết bị; đây không phải upgrade.");
  }

  const temporaryDirectory = mkdtempSync(join(tmpdir(), "scottbook-upgrade-"));
  let installedFingerprint;
  try {
    const localInstalledApk = join(temporaryDirectory, "installed-base.apk");
    runAdb(adb, device.serial, ["pull", installedBaseApk, localInstalledApk]);
    installedFingerprint = inspectApkCertificate(
      localInstalledApk,
      environment
    );
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }

  assertSafeUpgradePreflight({
    backup,
    installed,
    candidate,
    installedFingerprint,
    candidateFingerprint,
    expectedOwnerFingerprint
  });

  const install = runAdb(adb, device.serial, ["install", "-r", apkPath], {
    allowFailure: true
  });
  const installOutput = `${install.stdout ?? ""}\n${install.stderr ?? ""}`;
  if (install.status !== 0) throw new Error(formatInstallFailure(installOutput));

  const launch = runAdb(adb, device.serial, [
    "shell",
    "am",
    "start",
    "-W",
    "-S",
    "-n",
    MAIN_ACTIVITY
  ]).stdout;
  let pid = "";
  for (let attempt = 0; attempt < 10 && !pid; attempt += 1) {
    pid = runAdb(adb, device.serial, ["shell", "pidof", APP_ID], {
      allowFailure: true
    }).stdout.trim();
    if (!pid) wait(500);
  }
  wait(1_500);

  const afterDump = runAdb(adb, device.serial, [
    "shell",
    "dumpsys",
    "package",
    APP_ID
  ]).stdout;
  const after = parsePackageMetadata(afterDump);
  const activityDump = runAdb(adb, device.serial, [
    "shell",
    "dumpsys",
    "activity",
    "activities"
  ]).stdout;
  const windowDumpPath = "/sdcard/scottbook-upgrade-window.xml";
  const windowDumpResult = runAdb(adb, device.serial, [
    "shell",
    "uiautomator",
    "dump",
    windowDumpPath
  ], { allowFailure: true });
  const windowDump =
    windowDumpResult.status === 0
      ? runAdb(adb, device.serial, ["exec-out", "cat", windowDumpPath], {
          allowFailure: true
        }).stdout
      : "";
  runAdb(adb, device.serial, ["shell", "rm", "-f", windowDumpPath], {
    allowFailure: true
  });
  const screenshot = runAdb(adb, device.serial, [
    "exec-out",
    "screencap",
    "-p"
  ], { binary: true }).stdout;

  const evidenceDirectory = resolve(
    options.evidenceDirectory ??
      join("artifacts", `android-upgrade-${timestampForPath(now)}`)
  );
  mkdirSync(evidenceDirectory, { recursive: true });
  writeFileSync(join(evidenceDirectory, "scottbook-after-upgrade.png"), screenshot);

  const report = {
    format: "scottbook-android-signed-upgrade",
    formatVersion: 1,
    generatedAt: now.toISOString(),
    device: {
      manufacturer: readProperty(adb, device.serial, "ro.product.manufacturer"),
      model: readProperty(adb, device.serial, "ro.product.model"),
      androidVersion: readProperty(adb, device.serial, "ro.build.version.release"),
      sdk: readProperty(adb, device.serial, "ro.build.version.sdk")
    },
    before: {
      versionName: installed.versionName,
      versionCode: installed.versionCode
    },
    after: {
      versionName: after.versionName,
      versionCode: after.versionCode
    },
    candidate: {
      apkFile: basename(apkPath),
      certificateSha256: candidateFingerprint
    },
    backup: {
      file: basename(backupPath),
      exportedAt: backup.exportedAt,
      checksum: backup.checksum
    },
    checks: {
      "Backup schema, checksum, version, and freshness passed": true,
      "Candidate package ID is ScottBook": candidate.appId === APP_ID,
      "Candidate versionCode is higher than installed versionCode":
        candidate.versionCode > installed.versionCode,
      "Candidate and installed certificate SHA-256 match":
        candidateFingerprint === installedFingerprint,
      "ADB used install -r without uninstall or data clear":
        /Success/u.test(installOutput),
      "Installed version matches candidate":
        after.versionCode === candidate.versionCode &&
        after.versionName === candidate.versionName,
      "Installed APK does not request Internet permission":
        !after.requestsInternet,
      "MainActivity launch completed": /Status:\s+ok/u.test(launch),
      "ScottBook process is running": Boolean(pid),
      "ScottBook is the resumed foreground activity":
        hasResumedScottBookActivity(activityDump),
      "ScottBook content is exposed to Android accessibility":
        /ScottBook|Thư viện|Đừng dịch vội/u.test(windowDump),
      "After-upgrade screenshot is a non-empty PNG":
        Buffer.isBuffer(screenshot) &&
        screenshot.length > 8 &&
        screenshot.subarray(0, 8).equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        )
    }
  };
  writeFileSync(
    join(evidenceDirectory, "android-upgrade-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(
    join(evidenceDirectory, "android-upgrade-report.md"),
    markdownReport(report),
    "utf8"
  );

  const failedChecks = Object.entries(report.checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  if (failedChecks.length > 0) {
    throw new Error(
      `Upgrade đã cài nhưng hậu kiểm thất bại: ${failedChecks.join("; ")}. Dùng backup đã xác minh; không tự uninstall. Bằng chứng: ${evidenceDirectory}`
    );
  }
  return { report, evidenceDirectory };
}

const launchedDirectly =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (launchedDirectly) {
  try {
    const result = runAndroidUpgradeSmoke();
    console.log("Android signed upgrade smoke passed.");
    console.log(`Evidence: ${result.evidenceDirectory}`);
    console.log("Hoàn tất các ô giữ dữ liệu trong android-upgrade-report.md.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
