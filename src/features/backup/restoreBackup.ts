import {
  LIBRARY_STATE_BACKUP_STORAGE_KEY,
  LIBRARY_STATE_STORAGE_KEY
} from "../library/readingState";
import {
  READER_ASSISTANCE_SCOPE_STORAGE_KEY,
  READER_CONTENT_WIDTH_STORAGE_KEY,
  READER_FONT_FAMILY_STORAGE_KEY,
  READER_FONT_SIZE_STORAGE_KEY,
  READER_LINE_HEIGHT_STORAGE_KEY,
  READER_THEME_STORAGE_KEY
} from "../preferences/readerPreferences";
import {
  ASSISTANCE_HISTORY_BACKUP_STORAGE_KEY,
  ASSISTANCE_HISTORY_STORAGE_KEY
} from "../review/assistanceHistory";
import { validateLocalDataSnapshot } from "../storage/localDataSnapshot";
import {
  verifyScottBookBackup,
  type ScottBookBackup,
  type ScottBookBackupData
} from "./exportBackup";

export const MAX_BACKUP_FILE_BYTES = 2 * 1024 * 1024;
export const RESTORE_UNDO_STORAGE_KEY = "scottbook.restoreUndo.v1";

export type ScottBookBackupPreview = {
  exportedAt: string;
  appVersion: string;
  favoriteCount: number;
  historyCount: number;
  completedCount: number;
  activeProgressCount: number;
  assistanceItemCount: number;
  theme: ScottBookBackupData["preferences"]["theme"];
  fontSize: number;
  assistanceScope: ScottBookBackupData["preferences"]["assistanceScope"];
  fontFamily: ScottBookBackupData["preferences"]["fontFamily"];
  lineHeight: ScottBookBackupData["preferences"]["lineHeight"];
  contentWidth: ScottBookBackupData["preferences"]["contentWidth"];
};

export type ScottBookBackupParseResult =
  | {
      ok: true;
      backup: ScottBookBackup;
      preview: ScottBookBackupPreview;
    }
  | {
      ok: false;
      code:
        | "invalid-json"
        | "invalid-format"
        | "unsupported-version"
        | "invalid-metadata"
        | "checksum-mismatch"
        | "invalid-data";
      message: string;
    };

export type RestoreTransactionResult =
  | { ok: true; data: ScottBookBackupData }
  | { ok: false; message: string; rollbackSucceeded: boolean };

export type ScottBookRestoreUndo = {
  format: "scottbook-restore-undo";
  formatVersion: 1;
  createdAt: string;
  data: ScottBookBackupData;
};

export type RestoreStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

const TRANSACTION_KEYS = [
  LIBRARY_STATE_STORAGE_KEY,
  LIBRARY_STATE_BACKUP_STORAGE_KEY,
  READER_THEME_STORAGE_KEY,
  READER_FONT_SIZE_STORAGE_KEY,
  READER_ASSISTANCE_SCOPE_STORAGE_KEY,
  READER_FONT_FAMILY_STORAGE_KEY,
  READER_LINE_HEIGHT_STORAGE_KEY,
  READER_CONTENT_WIDTH_STORAGE_KEY,
  ASSISTANCE_HISTORY_STORAGE_KEY,
  ASSISTANCE_HISTORY_BACKUP_STORAGE_KEY,
  RESTORE_UNDO_STORAGE_KEY
] as const;

type TransactionKey = (typeof TRANSACTION_KEYS)[number];
export type RestoreStorageSnapshot = Record<TransactionKey, string | null>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[]
): boolean {
  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  );
}

function isCanonicalIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

export function validateScottBookBackupData(
  value: unknown
): ScottBookBackupData | null {
  return validateLocalDataSnapshot(value);
}

function buildPreview(backup: ScottBookBackup): ScottBookBackupPreview {
  const { libraryState, preferences } = backup.data;
  const historyEntries = Object.values(libraryState.historyByArticle);
  const activeProgressCount = Object.values(
    libraryState.progressByArticle
  ).filter(
    (progress) =>
      progress.progressPercent > 0 &&
      progress.progressPercent < 100 &&
      libraryState.historyByArticle[progress.articleId]?.completedAt === null
  ).length;

  return {
    exportedAt: backup.exportedAt,
    appVersion: backup.appVersion,
    favoriteCount: libraryState.favoriteArticleIds.length,
    historyCount: historyEntries.length,
    completedCount: historyEntries.filter((entry) => entry.completedAt !== null)
      .length,
    activeProgressCount,
    assistanceItemCount: Object.keys(backup.data.assistanceHistory.items).length,
    theme: preferences.theme,
    fontSize: preferences.fontSize,
    assistanceScope: preferences.assistanceScope,
    fontFamily: preferences.fontFamily,
    lineHeight: preferences.lineHeight,
    contentWidth: preferences.contentWidth
  };
}

export function getBackupFileSizeError(fileSize: number): string | null {
  if (!Number.isFinite(fileSize) || fileSize < 0) {
    return "Không đọc được kích thước file đã chọn.";
  }
  if (fileSize > MAX_BACKUP_FILE_BYTES) {
    return "File vượt quá giới hạn 2 MB của bản sao ScottBook.";
  }
  return null;
}

export async function parseScottBookBackupText(
  serialized: string
): Promise<ScottBookBackupParseResult> {
  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized);
  } catch {
    return {
      ok: false,
      code: "invalid-json",
      message: "File không phải JSON hợp lệ."
    };
  }

  if (!isRecord(candidate) || candidate.format !== "scottbook-backup") {
    return {
      ok: false,
      code: "invalid-format",
      message: "Đây không phải bản sao JSON do ScottBook tạo."
    };
  }

  if (candidate.formatVersion !== 1) {
    return {
      ok: false,
      code: "unsupported-version",
      message: "Phiên bản bản sao này chưa được ScottBook hiện tại hỗ trợ."
    };
  }

  if (
    !hasOnlyKeys(candidate, [
      "format",
      "formatVersion",
      "appVersion",
      "exportedAt",
      "data",
      "checksum"
    ]) ||
    typeof candidate.appVersion !== "string" ||
    candidate.appVersion.length === 0 ||
    candidate.appVersion.length > 64 ||
    !isCanonicalIsoDate(candidate.exportedAt) ||
    !isRecord(candidate.checksum) ||
    !hasOnlyKeys(candidate.checksum, ["algorithm", "value"]) ||
    candidate.checksum.algorithm !== "SHA-256" ||
    typeof candidate.checksum.value !== "string" ||
    !/^[a-f0-9]{64}$/.test(candidate.checksum.value)
  ) {
    return {
      ok: false,
      code: "invalid-metadata",
      message: "Thông tin định dạng hoặc checksum trong file không hợp lệ."
    };
  }

  const untrustedBackup = candidate as unknown as ScottBookBackup;
  if (!(await verifyScottBookBackup(untrustedBackup))) {
    return {
      ok: false,
      code: "checksum-mismatch",
      message: "Checksum không khớp: file có thể đã bị sửa hoặc bị hỏng."
    };
  }

  const data = validateScottBookBackupData(candidate.data);
  if (!data) {
    return {
      ok: false,
      code: "invalid-data",
      message: "Dữ liệu bên trong bản sao không đúng cấu trúc an toàn."
    };
  }

  const backup: ScottBookBackup = {
    format: "scottbook-backup",
    formatVersion: 1,
    appVersion: candidate.appVersion,
    exportedAt: candidate.exportedAt,
    data,
    checksum: {
      algorithm: "SHA-256",
      value: candidate.checksum.value
    }
  };

  return { ok: true, backup, preview: buildPreview(backup) };
}

export function captureRestoreStorageSnapshot(
  storage: RestoreStorage
): RestoreStorageSnapshot {
  return Object.fromEntries(
    TRANSACTION_KEYS.map((key) => [key, storage.getItem(key)])
  ) as RestoreStorageSnapshot;
}

export function restoreCapturedStorageSnapshot(
  storage: RestoreStorage,
  snapshot: RestoreStorageSnapshot
): boolean {
  let succeeded = true;
  for (const key of TRANSACTION_KEYS) {
    try {
      const value = snapshot[key];
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    } catch {
      succeeded = false;
    }
  }
  return succeeded;
}

export function writeScottBookDataBundle(
  storage: RestoreStorage,
  target: ScottBookBackupData,
  safetyCopy: ScottBookBackupData
): void {
  storage.setItem(
    LIBRARY_STATE_BACKUP_STORAGE_KEY,
    JSON.stringify(safetyCopy.libraryState)
  );
  storage.setItem(
    ASSISTANCE_HISTORY_BACKUP_STORAGE_KEY,
    JSON.stringify(safetyCopy.assistanceHistory)
  );
  storage.setItem(
    READER_THEME_STORAGE_KEY,
    JSON.stringify(target.preferences.theme)
  );
  storage.setItem(
    READER_FONT_SIZE_STORAGE_KEY,
    JSON.stringify(target.preferences.fontSize)
  );
  storage.setItem(
    READER_ASSISTANCE_SCOPE_STORAGE_KEY,
    JSON.stringify(target.preferences.assistanceScope)
  );
  storage.setItem(
    READER_FONT_FAMILY_STORAGE_KEY,
    JSON.stringify(target.preferences.fontFamily)
  );
  storage.setItem(
    READER_LINE_HEIGHT_STORAGE_KEY,
    JSON.stringify(target.preferences.lineHeight)
  );
  storage.setItem(
    READER_CONTENT_WIDTH_STORAGE_KEY,
    JSON.stringify(target.preferences.contentWidth)
  );
  storage.setItem(
    ASSISTANCE_HISTORY_STORAGE_KEY,
    JSON.stringify(target.assistanceHistory)
  );
  // The main reading record is written last so it stays untouched if an
  // earlier preparatory write fails.
  storage.setItem(
    LIBRARY_STATE_STORAGE_KEY,
    JSON.stringify(target.libraryState)
  );
}

function failedTransaction(
  storage: RestoreStorage,
  snapshot: RestoreStorageSnapshot
): RestoreTransactionResult {
  const rollbackSucceeded = restoreCapturedStorageSnapshot(storage, snapshot);
  return {
    ok: false,
    rollbackSucceeded,
    message: rollbackSucceeded
      ? "Không thể ghi bản sao; dữ liệu trước đó đã được giữ nguyên."
      : "Trình duyệt chặn lưu trữ và không thể hoàn tác đầy đủ. Hãy tải lại app trước khi tiếp tục."
  };
}

export function applyScottBookRestore(
  storage: RestoreStorage,
  currentData: ScottBookBackupData,
  restoredData: ScottBookBackupData,
  createdAt = new Date().toISOString()
): RestoreTransactionResult {
  const safeCurrentData = validateScottBookBackupData(currentData);
  const safeRestoredData = validateScottBookBackupData(restoredData);
  if (!safeCurrentData || !safeRestoredData || !isCanonicalIsoDate(createdAt)) {
    return {
      ok: false,
      rollbackSucceeded: true,
      message: "Dữ liệu khôi phục không vượt qua kiểm tra an toàn."
    };
  }

  let snapshot: RestoreStorageSnapshot;
  try {
    snapshot = captureRestoreStorageSnapshot(storage);
  } catch {
    return {
      ok: false,
      rollbackSucceeded: true,
      message: "Trình duyệt không cho ScottBook đọc vùng lưu trữ local."
    };
  }

  try {
    const undoRecord: ScottBookRestoreUndo = {
      format: "scottbook-restore-undo",
      formatVersion: 1,
      createdAt,
      data: safeCurrentData
    };
    storage.setItem(RESTORE_UNDO_STORAGE_KEY, JSON.stringify(undoRecord));
    writeScottBookDataBundle(storage, safeRestoredData, safeCurrentData);
    return { ok: true, data: safeRestoredData };
  } catch {
    return failedTransaction(storage, snapshot);
  }
}

function parseUndoRecord(serialized: string | null): ScottBookRestoreUndo | null {
  if (serialized === null) return null;

  try {
    const candidate: unknown = JSON.parse(serialized);
    if (
      !isRecord(candidate) ||
      !hasOnlyKeys(candidate, [
        "format",
        "formatVersion",
        "createdAt",
        "data"
      ]) ||
      candidate.format !== "scottbook-restore-undo" ||
      candidate.formatVersion !== 1 ||
      !isCanonicalIsoDate(candidate.createdAt)
    ) {
      return null;
    }

    const data = validateScottBookBackupData(candidate.data);
    return data
      ? {
          format: "scottbook-restore-undo",
          formatVersion: 1,
          createdAt: candidate.createdAt,
          data
        }
      : null;
  } catch {
    return null;
  }
}

export function loadScottBookRestoreUndo(
  storage: Pick<Storage, "getItem">
): ScottBookRestoreUndo | null {
  try {
    return parseUndoRecord(storage.getItem(RESTORE_UNDO_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function undoLastScottBookRestore(
  storage: RestoreStorage,
  currentData: ScottBookBackupData
): RestoreTransactionResult {
  const safeCurrentData = validateScottBookBackupData(currentData);
  if (!safeCurrentData) {
    return {
      ok: false,
      rollbackSucceeded: true,
      message: "Không còn bản khôi phục hợp lệ để hoàn tác."
    };
  }

  let snapshot: RestoreStorageSnapshot;
  try {
    snapshot = captureRestoreStorageSnapshot(storage);
  } catch {
    return {
      ok: false,
      rollbackSucceeded: true,
      message: "Trình duyệt không cho ScottBook đọc vùng lưu trữ local."
    };
  }

  const undoRecord = parseUndoRecord(snapshot[RESTORE_UNDO_STORAGE_KEY]);
  if (!undoRecord) {
    return {
      ok: false,
      rollbackSucceeded: true,
      message: "Không còn bản khôi phục hợp lệ để hoàn tác."
    };
  }

  try {
    writeScottBookDataBundle(storage, undoRecord.data, safeCurrentData);
    storage.removeItem(RESTORE_UNDO_STORAGE_KEY);
    return { ok: true, data: undoRecord.data };
  } catch {
    return failedTransaction(storage, snapshot);
  }
}
