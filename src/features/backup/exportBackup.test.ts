import { describe, expect, it } from "vitest";
import { createEmptyLibraryState } from "../library/readingState";
import {
  createScottBookBackup,
  verifyScottBookBackup,
  type ScottBookBackup
} from "./exportBackup";

describe("ScottBook JSON backup", () => {
  it("includes versioned data and a verifiable SHA-256 checksum", async () => {
    const backup = await createScottBookBackup(
      {
        libraryState: createEmptyLibraryState(),
        preferences: { theme: "night", fontSize: 29 }
      },
      "2026-08-11T02:00:00.000Z"
    );

    expect(backup.format).toBe("scottbook-backup");
    expect(backup.formatVersion).toBe(1);
    expect(backup.appVersion).toBe("0.4.0");
    expect(backup.exportedAt).toBe("2026-08-11T02:00:00.000Z");
    expect(backup.data.preferences).toEqual({ theme: "night", fontSize: 29 });
    expect(backup.checksum).toEqual({
      algorithm: "SHA-256",
      value: expect.stringMatching(/^[a-f0-9]{64}$/)
    });
    await expect(verifyScottBookBackup(backup)).resolves.toBe(true);
  });

  it("detects a backup changed after its checksum was created", async () => {
    const backup = await createScottBookBackup({
      libraryState: createEmptyLibraryState(),
      preferences: { theme: "paper", fontSize: 25 }
    });
    const tampered: ScottBookBackup = {
      ...backup,
      data: {
        ...backup.data,
        preferences: { ...backup.data.preferences, fontSize: 38 }
      }
    };

    await expect(verifyScottBookBackup(tampered)).resolves.toBe(false);
  });
});
