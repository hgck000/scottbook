import type { ScottBookBackupData } from "../backup/exportBackup";
import {
  loadLibraryState,
  tryLoadPrimaryLibraryState,
  validateLibraryStateSnapshot
} from "../library/readingState";
import {
  READER_FONT_SIZE_STORAGE_KEY,
  READER_THEME_STORAGE_KEY,
  isReaderFontSize,
  isReaderPreferences,
  isReaderTheme
} from "../preferences/readerPreferences";
import {
  ASSISTANCE_HISTORY_STORAGE_KEY,
  createEmptyAssistanceHistory,
  loadAssistanceHistory,
  parseAssistanceHistory,
  validateAssistanceHistorySnapshot
} from "../review/assistanceHistory";

type LocalStorageReader = Pick<Storage, "getItem">;

export function validateLocalDataSnapshot(
  value: unknown
): ScottBookBackupData | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const hasAssistanceHistory = Object.hasOwn(candidate, "assistanceHistory");
  if (
    Object.keys(candidate).length !== (hasAssistanceHistory ? 3 : 2) ||
    !Object.hasOwn(candidate, "libraryState") ||
    !Object.hasOwn(candidate, "preferences")
  ) {
    return null;
  }

  const libraryState = validateLibraryStateSnapshot(candidate.libraryState);
  if (!libraryState || !isReaderPreferences(candidate.preferences)) return null;
  const assistanceHistory = hasAssistanceHistory
    ? validateAssistanceHistorySnapshot(candidate.assistanceHistory)
    : createEmptyAssistanceHistory();
  if (!assistanceHistory) return null;

  return {
    libraryState,
    preferences: { ...candidate.preferences },
    assistanceHistory
  };
}

function readPreferences(
  storage: LocalStorageReader
): ScottBookBackupData["preferences"] | null {
  try {
    const theme: unknown = JSON.parse(
      storage.getItem(READER_THEME_STORAGE_KEY) ?? "null"
    );
    const fontSize: unknown = JSON.parse(
      storage.getItem(READER_FONT_SIZE_STORAGE_KEY) ?? "null"
    );
    return isReaderTheme(theme) && isReaderFontSize(fontSize)
      ? { theme, fontSize }
      : null;
  } catch {
    return null;
  }
}

export function loadLocalDataFallback(
  storage: LocalStorageReader
): ScottBookBackupData {
  return {
    libraryState: loadLibraryState(storage),
    preferences: readPreferences(storage) ?? { theme: "paper", fontSize: 25 },
    assistanceHistory: loadAssistanceHistory(storage)
  };
}

/**
 * Returns only a complete primary v0.5 snapshot. Safety/legacy fallbacks are
 * excluded so a damaged localStorage primary cannot overwrite a healthy
 * IndexedDB copy during bootstrap.
 */
export function tryLoadPrimaryLocalData(
  storage: LocalStorageReader
): ScottBookBackupData | null {
  const libraryState = tryLoadPrimaryLibraryState(storage);
  const preferences = readPreferences(storage);
  let assistanceHistory;
  try {
    const serialized = storage.getItem(ASSISTANCE_HISTORY_STORAGE_KEY);
    assistanceHistory =
      serialized === null
        ? createEmptyAssistanceHistory()
        : parseAssistanceHistory(serialized);
  } catch {
    return null;
  }
  return libraryState && preferences && assistanceHistory
    ? { libraryState, preferences, assistanceHistory }
    : null;
}
