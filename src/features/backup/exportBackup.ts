import { version as appVersion } from "../../../package.json";
import type { LibraryState } from "../library/readingState";
import type { ReaderPreferences } from "../preferences/readerPreferences";
import type { AssistanceHistoryState } from "../review/assistanceHistory";
import type { ImportedBook } from "../import/importedBook";

export type { ReaderPreferences } from "../preferences/readerPreferences";

export type ScottBookBackupData = {
  libraryState: LibraryState;
  preferences: ReaderPreferences;
  assistanceHistory: AssistanceHistoryState;
};

export type ScottBookPortableData = ScottBookBackupData & {
  importedBooks: ImportedBook[];
};

export type ScottBookBackup = {
  format: "scottbook-backup";
  formatVersion: 1 | 2;
  appVersion: string;
  exportedAt: string;
  data: ScottBookPortableData;
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
  data: ScottBookBackupData | ScottBookPortableData,
  exportedAt = new Date().toISOString()
): Promise<ScottBookBackup> {
  const portableData: ScottBookPortableData = "importedBooks" in data
    ? data
    : { ...data, importedBooks: [] };
  const unsigned: UnsignedBackup = {
    format: "scottbook-backup",
    formatVersion: 2,
    appVersion,
    exportedAt,
    data: portableData
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
