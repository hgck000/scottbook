import packageMetadata from "../../../package.json";
import type { LibraryState } from "../library/readingState";

export type ReaderPreferences = {
  theme: "paper" | "night";
  fontSize: number;
};

export type ScottBookBackupData = {
  libraryState: LibraryState;
  preferences: ReaderPreferences;
};

export type ScottBookBackup = {
  format: "scottbook-backup";
  formatVersion: 1;
  appVersion: string;
  exportedAt: string;
  data: ScottBookBackupData;
  checksum: {
    algorithm: "SHA-256";
    value: string;
  };
};

type UnsignedBackup = Omit<ScottBookBackup, "checksum">;

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function unsignedBackup(backup: ScottBookBackup): UnsignedBackup {
  return {
    format: backup.format,
    formatVersion: backup.formatVersion,
    appVersion: backup.appVersion,
    exportedAt: backup.exportedAt,
    data: backup.data
  };
}

export async function createScottBookBackup(
  data: ScottBookBackupData,
  exportedAt = new Date().toISOString()
): Promise<ScottBookBackup> {
  const unsigned: UnsignedBackup = {
    format: "scottbook-backup",
    formatVersion: 1,
    appVersion: packageMetadata.version,
    exportedAt,
    data
  };

  return {
    ...unsigned,
    checksum: {
      algorithm: "SHA-256",
      value: await sha256(JSON.stringify(unsigned))
    }
  };
}

export async function verifyScottBookBackup(
  backup: ScottBookBackup
): Promise<boolean> {
  if (backup.checksum.algorithm !== "SHA-256") return false;

  const expected = await sha256(JSON.stringify(unsignedBackup(backup)));
  return expected === backup.checksum.value;
}

export function downloadScottBookBackup(backup: ScottBookBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ScottBook-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
