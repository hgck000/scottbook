import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const APP_ID = "io.github.hgck000.scottbook";
export const MAIN_ACTIVITY = `${APP_ID}/.MainActivity`;

export function parseConnectedDevices(output) {
  return output
    .split(/\r?\n/u)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial = "", state = "unknown", ...details] = line.split(/\s+/u);
      return { serial, state, details: details.join(" ") };
    });
}

export function chooseDevice(devices, requestedSerial) {
  if (requestedSerial) {
    const requested = devices.find((device) => device.serial === requestedSerial);
    if (!requested) {
      throw new Error(`Không tìm thấy thiết bị ADB đã chọn: ${requestedSerial}`);
    }
    if (requested.state !== "device") {
      throw new Error(
        `Thiết bị ${requestedSerial} đang ở trạng thái ${requested.state}; hãy mở khóa máy và chấp nhận USB debugging.`
      );
    }
    return requested;
  }

  const ready = devices.filter((device) => device.state === "device");
  if (ready.length === 0) {
    const blocked = devices.map((device) => device.state).join(", ");
    throw new Error(
      blocked
        ? `Chưa có thiết bị ADB sẵn sàng; trạng thái hiện có: ${blocked}.`
        : "Chưa thấy điện thoại Android qua ADB."
    );
  }
  if (ready.length > 1) {
    throw new Error(
      "Có nhiều điện thoại/emulator đang kết nối; dùng --serial để chọn đúng thiết bị."
    );
  }
  return ready[0];
}

export function parsePackageMetadata(output) {
  return {
    versionName: output.match(/\bversionName=([^\s]+)/u)?.[1] ?? null,
    versionCode:
      Number.parseInt(output.match(/\bversionCode=(\d+)/u)?.[1] ?? "", 10) ||
      null,
    requestsInternet: /android\.permission\.INTERNET/u.test(output)
  };
}

export function hasResumedScottBookActivity(output) {
  return new RegExp(
    `(?:mResumedActivity:|topResumedActivity=|ResumedActivity:)[^\\n]*${APP_ID.replaceAll(".", "\\.")}\\/.MainActivity`,
    "u"
  ).test(output);
}

export function formatInstallFailure(output) {
  if (/INSTALL_FAILED_UPDATE_INCOMPATIBLE/u.test(output)) {
    return [
      "Android từ chối cài đè vì chữ ký APK khác bản đang có.",
      "ScottBook không tự gỡ app vì thao tác đó có thể xóa dữ liệu local.",
      "Hãy xuất backup JSON trước khi tự quyết định gỡ bản debug cũ."
    ].join(" ");
  }
  return `ADB không cài được APK: ${output.trim() || "không có thông báo"}`;
}

export function findLatestDebugApk(directory) {
  if (!existsSync(directory)) return null;
  const candidates = readdirSync(directory)
    .filter((name) => /^ScottBook-v.+-android-debug\.apk$/u.test(name))
    .map((name) => ({ path: join(directory, name), time: statSync(join(directory, name)).mtimeMs }))
    .sort((left, right) => right.time - left.time);
  return candidates[0]?.path ?? null;
}

export function parseArguments(argumentsList) {
  const options = { apk: null, serial: null, evidenceDirectory: null };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--serial") {
      const value = argumentsList[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--serial cần một mã thiết bị ADB.");
      }
      options.serial = value;
      index += 1;
    } else if (argument === "--evidence-dir") {
      const value = argumentsList[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--evidence-dir cần một thư mục đích.");
      }
      options.evidenceDirectory = value;
      index += 1;
    } else if (argument.startsWith("--")) {
      throw new Error(`Tùy chọn không hỗ trợ: ${argument}`);
    } else if (options.apk) {
      throw new Error("Chỉ được truyền một đường dẫn APK.");
    } else {
      options.apk = argument;
    }
  }
  return options;
}

export function commandResult(command, argumentsList, options = {}) {
  const result = spawnSync(command, argumentsList, {
    encoding: options.binary ? null : "utf8",
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !options.allowFailure) {
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : result.stderr;
    const stdout = Buffer.isBuffer(result.stdout)
      ? result.stdout.toString("utf8")
      : result.stdout;
    throw new Error(
      `${basename(command)} ${argumentsList.join(" ")} thất bại: ${(stderr || stdout || "không có thông báo").trim()}`
    );
  }
  return result;
}

export function resolveAdbPath(environment) {
  if (environment.SCOTTBOOK_ADB_PATH) {
    return resolve(environment.SCOTTBOOK_ADB_PATH);
  }
  const sdkRoot = environment.ANDROID_SDK_ROOT || environment.ANDROID_HOME;
  if (sdkRoot) {
    const candidate = join(
      sdkRoot,
      "platform-tools",
      process.platform === "win32" ? "adb.exe" : "adb"
    );
    if (existsSync(candidate)) return candidate;
  }
  return process.platform === "win32" ? "adb.exe" : "adb";
}

function adbArguments(serial, argumentsList) {
  return serial ? ["-s", serial, ...argumentsList] : argumentsList;
}

export function runAdb(adb, serial, argumentsList, options) {
  return commandResult(adb, adbArguments(serial, argumentsList), options);
}

export function readProperty(adb, serial, property) {
  return runAdb(adb, serial, ["shell", "getprop", property]).stdout.trim();
}

export function timestampForPath(date) {
  return date.toISOString().replace(/[:.]/gu, "-");
}

export function wait(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function markdownReport(report) {
  const checks = Object.entries(report.checks)
    .map(([name, passed]) => `- [${passed ? "x" : " "}] ${name}`)
    .join("\n");
  return `# ScottBook Android device smoke report\n\n` +
    `Generated: ${report.generatedAt}\n\n` +
    `- Device: ${report.device.manufacturer} ${report.device.model}\n` +
    `- Android: ${report.device.androidVersion} (API ${report.device.sdk})\n` +
    `- App: ${report.app.versionName} (code ${report.app.versionCode})\n` +
    `- APK: ${report.apkFile}\n\n` +
    `## Automated checks\n\n${checks}\n\n` +
    `## Manual checks still required\n\n` +
    `- [ ] Turn on airplane mode, force-stop, and reopen ScottBook.\n` +
    `- [ ] Reveal pinyin, Hán-Việt, and meaning in Reader.\n` +
    `- [ ] Confirm opaque toolbar/footer and compact 字 / 词 / 句 selector.\n` +
    `- [ ] Confirm Android Back closes each open Reader surface before navigating.\n` +
    `- [ ] Confirm preferences, favorite, and reading position survive reopen.\n\n` +
    `The device serial is intentionally excluded from this report.\n`;
}

export function runAndroidDeviceSmoke({
  argumentsList = process.argv.slice(2),
  environment = process.env,
  now = new Date()
} = {}) {
  const options = parseArguments(argumentsList);
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const defaultApk = findLatestDebugApk(resolve("artifacts"));
  const apkPath = resolve(options.apk ?? defaultApk ?? "");
  if (!options.apk && !defaultApk) {
    throw new Error(
      "Chưa có APK debug trong artifacts. Chạy npm run android:build:debug trước."
    );
  }
  if (!existsSync(apkPath) || !apkPath.endsWith(".apk")) {
    throw new Error(`Không tìm thấy APK hợp lệ: ${apkPath}`);
  }

  const adb = resolveAdbPath(environment);
  commandResult(adb, ["start-server"]);
  const devicesOutput = commandResult(adb, ["devices", "-l"]).stdout;
  const device = chooseDevice(
    parseConnectedDevices(devicesOutput),
    options.serial
  );

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
  const packageDump = runAdb(adb, device.serial, [
    "shell",
    "dumpsys",
    "package",
    APP_ID
  ]).stdout;
  const activityDump = runAdb(adb, device.serial, [
    "shell",
    "dumpsys",
    "activity",
    "activities"
  ]).stdout;
  const windowDumpPath = "/sdcard/scottbook-device-smoke-window.xml";
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
  const packageMetadata = parsePackageMetadata(packageDump);
  const screenshot = runAdb(adb, device.serial, [
    "exec-out",
    "screencap",
    "-p"
  ], { binary: true }).stdout;
  const logcat = runAdb(adb, device.serial, [
    "logcat",
    "-d",
    "-t",
    "400",
    "--pid",
    pid
  ], { allowFailure: true }).stdout;

  const evidenceDirectory = resolve(
    options.evidenceDirectory ??
      join("artifacts", `android-device-smoke-${timestampForPath(now)}`)
  );
  mkdirSync(evidenceDirectory, { recursive: true });
  const screenshotPath = join(evidenceDirectory, "scottbook-launch.png");
  const logcatPath = join(evidenceDirectory, "scottbook-logcat.txt");
  const jsonPath = join(evidenceDirectory, "device-smoke-report.json");
  const markdownPath = join(evidenceDirectory, "device-smoke-report.md");
  writeFileSync(screenshotPath, screenshot);
  writeFileSync(logcatPath, logcat || "No app-scoped logcat output captured.\n");

  const report = {
    format: "scottbook-android-device-smoke",
    formatVersion: 1,
    generatedAt: now.toISOString(),
    device: {
      manufacturer: readProperty(adb, device.serial, "ro.product.manufacturer"),
      model: readProperty(adb, device.serial, "ro.product.model"),
      androidVersion: readProperty(adb, device.serial, "ro.build.version.release"),
      sdk: readProperty(adb, device.serial, "ro.build.version.sdk")
    },
    app: {
      appId: APP_ID,
      versionName: packageMetadata.versionName,
      versionCode: packageMetadata.versionCode
    },
    apkFile: basename(apkPath),
    checks: {
      "ADB used install -r without uninstalling ScottBook": /Success/u.test(installOutput),
      "MainActivity launch completed": /Status:\s+ok/u.test(launch),
      "ScottBook process is running": Boolean(pid),
      "ScottBook is the resumed foreground activity":
        hasResumedScottBookActivity(activityDump),
      "ScottBook content is exposed to Android accessibility":
        /ScottBook|Thư viện|Đừng dịch vội/u.test(windowDump),
      "Installed app version matches package.json":
        packageMetadata.versionName === packageJson.version,
      "Installed APK does not request Internet permission":
        !packageMetadata.requestsInternet,
      "Launch screenshot is a non-empty PNG":
        Buffer.isBuffer(screenshot) &&
        screenshot.length > 8 &&
        screenshot.subarray(0, 8).equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        )
    }
  };
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(markdownPath, markdownReport(report), "utf8");

  const failedChecks = Object.entries(report.checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  if (failedChecks.length > 0) {
    throw new Error(
      `Android device smoke có kiểm tra thất bại: ${failedChecks.join("; ")}. Bằng chứng: ${evidenceDirectory}`
    );
  }

  return { report, evidenceDirectory };
}

const launchedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (launchedDirectly) {
  try {
    const result = runAndroidDeviceSmoke();
    console.log("Android device smoke passed.");
    console.log(`Evidence: ${result.evidenceDirectory}`);
    console.log("Hoàn tất các ô kiểm tra thủ công trong device-smoke-report.md.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
