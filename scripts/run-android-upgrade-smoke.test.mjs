import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assertSafeUpgradePreflight,
  parseAaptBadging,
  parseInstalledPackagePaths,
  parseUpgradeArguments,
  validateFreshBackup
} from "./run-android-upgrade-smoke.mjs";

function backupText({
  appVersion = "0.28.0",
  exportedAt = "2026-08-13T10:00:00.000Z",
  data = { libraryState: {}, preferences: {}, assistanceHistory: {} }
} = {}) {
  const unsigned = {
    format: "scottbook-backup",
    formatVersion: 1,
    appVersion,
    exportedAt,
    data
  };
  return JSON.stringify({
    ...unsigned,
    checksum: {
      algorithm: "SHA-256",
      value: createHash("sha256")
        .update(JSON.stringify(unsigned))
        .digest("hex")
    }
  });
}

const installed = {
  versionName: "0.28.0",
  versionCode: 28,
  requestsInternet: false
};
const candidate = {
  appId: "io.github.hgck000.scottbook",
  versionName: "0.30.0",
  versionCode: 30,
  requestsInternet: false
};
const fingerprint = "AB".repeat(32);

describe("Android signed upgrade smoke", () => {
  it("requires one candidate APK and an explicit backup", () => {
    expect(
      parseUpgradeArguments([
        "C:\\Builds\\ScottBook v0.30.apk",
        "--backup",
        "C:\\Backups\\ScottBook.json",
        "--serial",
        "DEVICE-01"
      ])
    ).toEqual({
      apk: "C:\\Builds\\ScottBook v0.30.apk",
      backup: "C:\\Backups\\ScottBook.json",
      serial: "DEVICE-01",
      evidenceDirectory: null
    });
    expect(() => parseUpgradeArguments(["candidate.apk"])).toThrow("--backup");
  });

  it("accepts a fresh ScottBook backup with a valid checksum", () => {
    expect(
      validateFreshBackup(
        backupText(),
        new Date("2026-08-13T10:30:00.000Z")
      )
    ).toMatchObject({
      appVersion: "0.28.0",
      exportedAt: "2026-08-13T10:00:00.000Z"
    });
  });

  it("rejects changed or stale backups", () => {
    const changed = JSON.parse(backupText());
    changed.data.preferences.theme = "oled";
    expect(() =>
      validateFreshBackup(
        JSON.stringify(changed),
        new Date("2026-08-13T10:30:00.000Z")
      )
    ).toThrow("Checksum");
    expect(() =>
      validateFreshBackup(
        backupText(),
        new Date("2026-08-14T10:00:01.000Z")
      )
    ).toThrow("quá 24 giờ");
  });

  it("reads candidate identity, version, and Internet permission from aapt", () => {
    const output = [
      "package: name='io.github.hgck000.scottbook' versionCode='30' versionName='0.30.0'",
      "sdkVersion:'24'",
      "uses-permission: name='android.permission.VIBRATE'"
    ].join("\n");
    expect(parseAaptBadging(output)).toEqual(candidate);
    expect(
      parseAaptBadging(`${output}\nuses-permission: name='android.permission.INTERNET'`)
        .requestsInternet
    ).toBe(true);
  });

  it("selects the installed base APK from Android package paths", () => {
    expect(
      parseInstalledPackagePaths(
        "package:/data/app/example/base.apk\npackage:/data/app/example/split_config.apk\n"
      )
    ).toEqual([
      "/data/app/example/base.apk",
      "/data/app/example/split_config.apk"
    ]);
  });

  it("passes only a higher same-certificate offline ScottBook candidate", () => {
    expect(() =>
      assertSafeUpgradePreflight({
        backup: { appVersion: "0.28.0" },
        installed,
        candidate,
        installedFingerprint: fingerprint,
        candidateFingerprint: fingerprint,
        expectedOwnerFingerprint: fingerprint
      })
    ).not.toThrow();
  });

  it("stops before install for a changed certificate or non-incremented version", () => {
    expect(() =>
      assertSafeUpgradePreflight({
        backup: { appVersion: "0.28.0" },
        installed,
        candidate,
        installedFingerprint: fingerprint,
        candidateFingerprint: "CD".repeat(32),
        expectedOwnerFingerprint: null
      })
    ).toThrow("chứng thư candidate khác");
    expect(() =>
      assertSafeUpgradePreflight({
        backup: { appVersion: "0.28.0" },
        installed,
        candidate: { ...candidate, versionCode: 28 },
        installedFingerprint: fingerprint,
        candidateFingerprint: fingerprint,
        expectedOwnerFingerprint: null
      })
    ).toThrow("phải lớn hơn");
  });

  it("contains no ADB uninstall or data-clear command", () => {
    const source = readFileSync("scripts/run-android-upgrade-smoke.mjs", "utf8");
    expect(source).not.toMatch(/runAdb\([^\n]+\["uninstall"/u);
    expect(source).not.toMatch(/"pm",\s*"clear"/u);
  });
});
