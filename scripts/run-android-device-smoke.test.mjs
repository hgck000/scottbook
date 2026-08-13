import { describe, expect, it } from "vitest";
import {
  chooseDevice,
  formatInstallFailure,
  hasResumedScottBookActivity,
  parseArguments,
  parseConnectedDevices,
  parsePackageMetadata
} from "./run-android-device-smoke.mjs";

describe("Android device smoke runner", () => {
  it("parses ready, unauthorized, and offline ADB devices", () => {
    expect(
      parseConnectedDevices(
        "List of devices attached\nSERIAL-A device product:test model:Phone\nSERIAL-B unauthorized\nSERIAL-C offline\n"
      )
    ).toEqual([
      { serial: "SERIAL-A", state: "device", details: "product:test model:Phone" },
      { serial: "SERIAL-B", state: "unauthorized", details: "" },
      { serial: "SERIAL-C", state: "offline", details: "" }
    ]);
  });

  it("requires an explicit serial when several ready devices exist", () => {
    const devices = [
      { serial: "A", state: "device", details: "" },
      { serial: "B", state: "device", details: "" }
    ];
    expect(() => chooseDevice(devices)).toThrow("--serial");
    expect(chooseDevice(devices, "B").serial).toBe("B");
  });

  it("rejects unauthorized requested devices without guessing", () => {
    expect(() =>
      chooseDevice([{ serial: "A", state: "unauthorized", details: "" }], "A")
    ).toThrow("USB debugging");
  });

  it("reads installed version and the effective Internet permission", () => {
    expect(
      parsePackageMetadata(
        "versionCode=28 minSdk=24 targetSdk=36\nversionName=0.28.0\nrequested permissions:\n  android.permission.VIBRATE"
      )
    ).toEqual({ versionName: "0.28.0", versionCode: 28, requestsInternet: false });
    expect(
      parsePackageMetadata("versionCode=28\nversionName=0.28.0\nandroid.permission.INTERNET")
        .requestsInternet
    ).toBe(true);
  });

  it("requires ScottBook MainActivity on the actual resumed-activity line", () => {
    expect(
      hasResumedScottBookActivity(
        "mResumedActivity: ActivityRecord{abc io.github.hgck000.scottbook/.MainActivity t42}"
      )
    ).toBe(true);
    expect(
      hasResumedScottBookActivity(
        "topResumedActivity=ActivityRecord{abc io.github.hgck000.scottbook/.MainActivity t42}"
      )
    ).toBe(true);
    expect(
      hasResumedScottBookActivity(
        "ActivityRecord{old io.github.hgck000.scottbook/.MainActivity}\n" +
          "mResumedActivity: ActivityRecord{new com.android.settings/.Settings}"
      )
    ).toBe(false);
  });

  it("parses paths and device selection without shell interpolation", () => {
    expect(
      parseArguments([
        "C:\\Builds\\ScottBook test.apk",
        "--serial",
        "DEVICE-01",
        "--evidence-dir",
        "C:\\Evidence"
      ])
    ).toEqual({
      apk: "C:\\Builds\\ScottBook test.apk",
      serial: "DEVICE-01",
      evidenceDirectory: "C:\\Evidence"
    });
  });

  it("never recommends automatic uninstall on a signature mismatch", () => {
    const message = formatInstallFailure("INSTALL_FAILED_UPDATE_INCOMPATIBLE");
    expect(message).toContain("không tự gỡ app");
    expect(message).toContain("backup JSON");
  });
});
