import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  findApksigner,
  normalizeCertificateFingerprint,
  parseApksignerFingerprint,
  readSigningConfiguration,
  resolveExternalKeystore
} from "./build-android-release.mjs";

const temporaryDirectories = [];

function temporaryDirectory() {
  const directory = mkdtempSync(join(tmpdir(), "scottbook-signing-test-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("Android release signing", () => {
  it("normalizes a public SHA-256 certificate fingerprint", () => {
    const raw = "AA:".repeat(31) + "AA";
    expect(normalizeCertificateFingerprint(raw)).toBe("AA".repeat(32));
    expect(() => normalizeCertificateFingerprint("1234")).toThrow("64");
  });

  it("fails closed when any signing value is missing", () => {
    expect(() => readSigningConfiguration({})).toThrow(
      "Không tạo APK release chưa ký"
    );
  });

  it("accepts a complete owner-held signing configuration", () => {
    expect(
      readSigningConfiguration({
        SCOTTBOOK_ANDROID_KEYSTORE_PATH: "/outside/scottbook.jks",
        SCOTTBOOK_ANDROID_KEYSTORE_PASSWORD: "store-secret",
        SCOTTBOOK_ANDROID_KEY_ALIAS: "scottbook",
        SCOTTBOOK_ANDROID_KEY_PASSWORD: "key-secret",
        SCOTTBOOK_ANDROID_CERT_SHA256: "ab".repeat(32)
      })
    ).toEqual({
      keystorePath: "/outside/scottbook.jks",
      expectedFingerprint: "AB".repeat(32)
    });
  });

  it("rejects keystores stored anywhere inside the repository", () => {
    const repository = temporaryDirectory();
    const keystore = join(repository, "private", "release.jks");
    mkdirSync(join(repository, "private"));
    writeFileSync(keystore, "not-a-real-key");
    expect(() => resolveExternalKeystore(keystore, repository)).toThrow(
      "nằm ngoài repository"
    );
  });

  it("accepts a keystore outside the repository", () => {
    const parent = temporaryDirectory();
    const repository = join(parent, "repo");
    const keystore = join(parent, "release.jks");
    mkdirSync(repository);
    writeFileSync(keystore, "not-a-real-key");
    expect(resolveExternalKeystore(keystore, repository)).toBe(
      realpathSync(keystore)
    );
  });

  it("selects the newest Android SDK apksigner", () => {
    const sdk = temporaryDirectory();
    for (const version of ["35.0.0", "36.0.0", "36.0.1"]) {
      const directory = join(sdk, "build-tools", version);
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        join(
          directory,
          process.platform === "win32" ? "apksigner.bat" : "apksigner"
        ),
        ""
      );
    }
    expect(findApksigner({ ANDROID_SDK_ROOT: sdk })).toContain("36.0.1");
  });

  it("reads the signer certificate digest from apksigner output", () => {
    expect(
      parseApksignerFingerprint(
        `Verifies\nSigner #1 certificate SHA-256 digest: ${"cd".repeat(32)}`
      )
    ).toBe("CD".repeat(32));
  });

  it("keeps GitHub release signing manual and removes the temporary key", () => {
    const workflow = readFileSync(
      ".github/workflows/android-release.yml",
      "utf8"
    );
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/\n\s+push:/u);
    expect(workflow).toContain("if: ${{ always() }}");
    expect(workflow).toContain('rm -f "$RUNNER_TEMP/scottbook-release.jks"');
    expect(workflow).not.toContain("echo $KEYSTORE_BASE64");
  });
});
