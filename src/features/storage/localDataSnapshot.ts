import type { ScottBookBackupData } from "../backup/exportBackup";
import {
  loadLibraryState,
  tryLoadPrimaryLibraryState,
  validateLibraryStateSnapshot
} from "../library/readingState";
import {
  DEFAULT_READER_PREFERENCES,
  READER_ASSISTANCE_SCOPE_STORAGE_KEY,
  READER_CONTENT_WIDTH_STORAGE_KEY,
  READER_FONT_FAMILY_STORAGE_KEY,
  READER_FONT_SIZE_STORAGE_KEY,
  READER_LINE_HEIGHT_STORAGE_KEY,
  READER_THEME_STORAGE_KEY,
  isReaderContentWidth,
  isReaderFontFamily,
  isReaderFontSize,
  isReaderLineHeight,
  isReaderTheme,
  validateReaderPreferences
} from "../preferences/readerPreferences";
import { isReaderAssistanceScope } from "../reader/readerScope";
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
  const preferences = validateReaderPreferences(candidate.preferences);
  if (!libraryState || !preferences) return null;
  const assistanceHistory = hasAssistanceHistory
    ? validateAssistanceHistorySnapshot(candidate.assistanceHistory)
    : createEmptyAssistanceHistory();
  if (!assistanceHistory) return null;

  return {
    libraryState,
    preferences,
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
    const rawScope = storage.getItem(READER_ASSISTANCE_SCOPE_STORAGE_KEY);
    const assistanceScope: unknown =
      rawScope === null
        ? DEFAULT_READER_PREFERENCES.assistanceScope
        : JSON.parse(rawScope);
    const rawFontFamily = storage.getItem(READER_FONT_FAMILY_STORAGE_KEY);
    const fontFamily: unknown =
      rawFontFamily === null
        ? DEFAULT_READER_PREFERENCES.fontFamily
        : JSON.parse(rawFontFamily);
    const rawLineHeight = storage.getItem(READER_LINE_HEIGHT_STORAGE_KEY);
    const lineHeight: unknown =
      rawLineHeight === null
        ? DEFAULT_READER_PREFERENCES.lineHeight
        : JSON.parse(rawLineHeight);
    const rawContentWidth = storage.getItem(READER_CONTENT_WIDTH_STORAGE_KEY);
    const contentWidth: unknown =
      rawContentWidth === null
        ? DEFAULT_READER_PREFERENCES.contentWidth
        : JSON.parse(rawContentWidth);
    return isReaderTheme(theme) &&
      isReaderFontSize(fontSize) &&
      isReaderAssistanceScope(assistanceScope) &&
      isReaderFontFamily(fontFamily) &&
      isReaderLineHeight(lineHeight) &&
      isReaderContentWidth(contentWidth)
      ? {
          theme,
          fontSize,
          assistanceScope,
          fontFamily,
          lineHeight,
          contentWidth
        }
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
    preferences: readPreferences(storage) ?? DEFAULT_READER_PREFERENCES,
    assistanceHistory: loadAssistanceHistory(storage)
  };
}

/**
 * Returns only a complete primary snapshot. Safety/legacy fallbacks are
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
