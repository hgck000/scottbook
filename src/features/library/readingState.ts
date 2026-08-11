import type { BuiltInArticle } from "../../content/types";

export const LIBRARY_STATE_STORAGE_KEY = "scottbook.libraryState.v2";
export const LIBRARY_STATE_BACKUP_STORAGE_KEY =
  "scottbook.libraryState.backup.v2";
export const LEGACY_LIBRARY_STATE_STORAGE_KEY = "scottbook.libraryState.v1";

export type ReadingProgress = {
  articleId: string;
  sentenceId: string;
  progressPercent: number;
  updatedAt: number;
};

export type ReadingHistoryEntry = {
  articleId: string;
  firstOpenedAt: number;
  lastOpenedAt: number;
  openCount: number;
  completedAt: number | null;
};

export type LibraryState = {
  version: 2;
  favoriteArticleIds: string[];
  progressByArticle: Record<string, ReadingProgress>;
  historyByArticle: Record<string, ReadingHistoryEntry>;
  lastOpenedArticleId: string | null;
};

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "getItem" | "setItem">;

export function createEmptyLibraryState(): LibraryState {
  return {
    version: 2,
    favoriteArticleIds: [],
    progressByArticle: {},
    historyByArticle: {},
    lastOpenedArticleId: null
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= 8_640_000_000_000_000
  );
}

function isStorageIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 200 &&
    value !== "__proto__" &&
    value !== "prototype" &&
    value !== "constructor"
  );
}

function isReadingProgress(
  articleId: string,
  value: unknown
): value is ReadingProgress {
  if (!isRecord(value)) return false;

  return (
    isStorageIdentifier(articleId) &&
    value.articleId === articleId &&
    isStorageIdentifier(value.sentenceId) &&
    typeof value.progressPercent === "number" &&
    Number.isInteger(value.progressPercent) &&
    value.progressPercent >= 0 &&
    value.progressPercent <= 100 &&
    isTimestamp(value.updatedAt)
  );
}

function isReadingHistoryEntry(
  articleId: string,
  value: unknown
): value is ReadingHistoryEntry {
  if (!isRecord(value)) return false;

  return (
    isStorageIdentifier(articleId) &&
    value.articleId === articleId &&
    isTimestamp(value.firstOpenedAt) &&
    isTimestamp(value.lastOpenedAt) &&
    typeof value.openCount === "number" &&
    Number.isSafeInteger(value.openCount) &&
    value.openCount >= 1 &&
    (value.completedAt === null || isTimestamp(value.completedAt))
  );
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

/**
 * Validates an external v2 snapshot without repairing or dropping bad fields.
 * Loading local legacy data remains intentionally tolerant; restoring a file
 * must be strict so corrupted signed data can never silently replace good data.
 */
export function validateLibraryStateSnapshot(
  value: unknown
): LibraryState | null {
  if (!isRecord(value) || value.version !== 2) return null;
  if (
    !hasOnlyKeys(value, [
      "version",
      "favoriteArticleIds",
      "progressByArticle",
      "historyByArticle",
      "lastOpenedArticleId"
    ])
  ) {
    return null;
  }

  if (!Array.isArray(value.favoriteArticleIds)) return null;
  const favoriteArticleIds = value.favoriteArticleIds;
  if (
    favoriteArticleIds.some(
      (articleId) => !isStorageIdentifier(articleId)
    ) ||
    new Set(favoriteArticleIds).size !== favoriteArticleIds.length
  ) {
    return null;
  }

  if (!isRecord(value.progressByArticle)) return null;
  const progressByArticle: Record<string, ReadingProgress> = {};
  for (const [articleId, progress] of Object.entries(value.progressByArticle)) {
    if (
      !isReadingProgress(articleId, progress) ||
      !hasOnlyKeys(progress, [
        "articleId",
        "sentenceId",
        "progressPercent",
        "updatedAt"
      ])
    ) {
      return null;
    }
    progressByArticle[articleId] = { ...progress };
  }

  if (!isRecord(value.historyByArticle)) return null;
  const historyByArticle: Record<string, ReadingHistoryEntry> = {};
  for (const [articleId, entry] of Object.entries(value.historyByArticle)) {
    if (
      !isReadingHistoryEntry(articleId, entry) ||
      !hasOnlyKeys(entry, [
        "articleId",
        "firstOpenedAt",
        "lastOpenedAt",
        "openCount",
        "completedAt"
      ])
    ) {
      return null;
    }
    historyByArticle[articleId] = { ...entry };
  }

  if (
    Object.keys(progressByArticle).some(
      (articleId) => historyByArticle[articleId] === undefined
    )
  ) {
    return null;
  }

  if (
    value.lastOpenedArticleId !== null &&
    !isStorageIdentifier(value.lastOpenedArticleId)
  ) {
    return null;
  }

  return {
    version: 2,
    favoriteArticleIds: [...favoriteArticleIds],
    progressByArticle,
    historyByArticle,
    lastOpenedArticleId: value.lastOpenedArticleId
  };
}

function parseFavorites(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value.filter(
        (articleId): articleId is string =>
          isStorageIdentifier(articleId)
      )
    )
  ];
}

function parseProgressByArticle(
  value: unknown
): Record<string, ReadingProgress> {
  const progressByArticle: Record<string, ReadingProgress> = {};
  if (!isRecord(value)) return progressByArticle;

  for (const [articleId, progress] of Object.entries(value)) {
    if (
      isStorageIdentifier(articleId) &&
      isReadingProgress(articleId, progress)
    ) {
      progressByArticle[articleId] = progress;
    }
  }

  return progressByArticle;
}

function parseHistoryByArticle(
  value: unknown
): Record<string, ReadingHistoryEntry> {
  const historyByArticle: Record<string, ReadingHistoryEntry> = {};
  if (!isRecord(value)) return historyByArticle;

  for (const [articleId, entry] of Object.entries(value)) {
    if (
      isStorageIdentifier(articleId) &&
      isReadingHistoryEntry(articleId, entry)
    ) {
      historyByArticle[articleId] = entry;
    }
  }

  return historyByArticle;
}

function historyFromProgress(
  progressByArticle: Record<string, ReadingProgress>
): Record<string, ReadingHistoryEntry> {
  return Object.fromEntries(
    Object.values(progressByArticle).map((progress) => [
      progress.articleId,
      {
        articleId: progress.articleId,
        firstOpenedAt: progress.updatedAt,
        lastOpenedAt: progress.updatedAt,
        openCount: 1,
        completedAt:
          progress.progressPercent === 100 ? progress.updatedAt : null
      }
    ])
  );
}

function tryParseLibraryState(serialized: string | null): LibraryState | null {
  if (serialized === null) return null;

  try {
    const candidate: unknown = JSON.parse(serialized);
    if (!isRecord(candidate)) return null;

    const favoriteArticleIds = parseFavorites(candidate.favoriteArticleIds);
    const progressByArticle = parseProgressByArticle(candidate.progressByArticle);

    if (candidate.version === 1) {
      return {
        version: 2,
        favoriteArticleIds,
        progressByArticle,
        historyByArticle: historyFromProgress(progressByArticle),
        lastOpenedArticleId:
          typeof candidate.lastOpenedArticleId === "string"
            ? candidate.lastOpenedArticleId
            : null
      };
    }

    if (candidate.version !== 2) return null;

    const historyByArticle = parseHistoryByArticle(candidate.historyByArticle);
    const fallbackHistory = historyFromProgress(progressByArticle);
    for (const [articleId, entry] of Object.entries(fallbackHistory)) {
      historyByArticle[articleId] ??= entry;
    }

    return {
      version: 2,
      favoriteArticleIds,
      progressByArticle,
      historyByArticle,
      lastOpenedArticleId:
        typeof candidate.lastOpenedArticleId === "string"
          ? candidate.lastOpenedArticleId
          : null
    };
  } catch {
    return null;
  }
}

export function parseLibraryState(serialized: string | null): LibraryState {
  return tryParseLibraryState(serialized) ?? createEmptyLibraryState();
}

export function tryLoadPrimaryLibraryState(
  storage: StorageReader
): LibraryState | null {
  try {
    return tryParseLibraryState(storage.getItem(LIBRARY_STATE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function loadLibraryState(storage: StorageReader): LibraryState {
  try {
    const current = tryParseLibraryState(
      storage.getItem(LIBRARY_STATE_STORAGE_KEY)
    );
    if (current) return current;

    const backup = tryParseLibraryState(
      storage.getItem(LIBRARY_STATE_BACKUP_STORAGE_KEY)
    );
    if (backup) return backup;

    return (
      tryParseLibraryState(
        storage.getItem(LEGACY_LIBRARY_STATE_STORAGE_KEY)
      ) ?? createEmptyLibraryState()
    );
  } catch {
    return createEmptyLibraryState();
  }
}

export function persistLibraryState(
  storage: StorageWriter,
  state: LibraryState
): boolean {
  try {
    const currentSerialized = storage.getItem(LIBRARY_STATE_STORAGE_KEY);
    if (currentSerialized && tryParseLibraryState(currentSerialized)) {
      try {
        storage.setItem(
          LIBRARY_STATE_BACKUP_STORAGE_KEY,
          currentSerialized
        );
      } catch {
        // A failed safety copy must not block the newer valid state.
      }
    }

    storage.setItem(LIBRARY_STATE_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function createHistoryEntry(
  articleId: string,
  openedAt: number
): ReadingHistoryEntry {
  return {
    articleId,
    firstOpenedAt: openedAt,
    lastOpenedAt: openedAt,
    openCount: 1,
    completedAt: null
  };
}

export function markArticleOpened(
  state: LibraryState,
  articleId: string,
  openedAt: number
): LibraryState {
  const existing = state.historyByArticle[articleId];
  const historyEntry = existing
    ? {
        ...existing,
        lastOpenedAt: Math.max(existing.lastOpenedAt, openedAt),
        openCount: existing.openCount + 1
      }
    : createHistoryEntry(articleId, openedAt);

  return {
    ...state,
    lastOpenedArticleId: articleId,
    historyByArticle: {
      ...state.historyByArticle,
      [articleId]: historyEntry
    }
  };
}

export function toggleFavoriteArticle(
  state: LibraryState,
  articleId: string
): LibraryState {
  const isFavorite = state.favoriteArticleIds.includes(articleId);

  return {
    ...state,
    favoriteArticleIds: isFavorite
      ? state.favoriteArticleIds.filter((candidate) => candidate !== articleId)
      : [...state.favoriteArticleIds, articleId]
  };
}

export function updateReadingProgress(
  state: LibraryState,
  progress: ReadingProgress
): LibraryState {
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(progress.progressPercent))
  );
  const normalizedProgress = { ...progress, progressPercent };
  const existingProgress = state.progressByArticle[progress.articleId];
  const existingHistory = state.historyByArticle[progress.articleId];
  const historyEntry = existingHistory
    ? {
        ...existingHistory,
        lastOpenedAt: Math.max(existingHistory.lastOpenedAt, progress.updatedAt),
        completedAt:
          existingHistory.completedAt ??
          (progressPercent === 100 ? progress.updatedAt : null)
      }
    : {
        ...createHistoryEntry(progress.articleId, progress.updatedAt),
        completedAt: progressPercent === 100 ? progress.updatedAt : null
      };

  const progressUnchanged =
    existingProgress?.sentenceId === progress.sentenceId &&
    existingProgress.progressPercent === progressPercent;
  const historyUnchanged =
    existingHistory?.lastOpenedAt === historyEntry.lastOpenedAt &&
    existingHistory.completedAt === historyEntry.completedAt;
  if (
    progressUnchanged &&
    historyUnchanged &&
    state.lastOpenedArticleId === progress.articleId
  ) {
    return state;
  }

  return {
    ...state,
    lastOpenedArticleId: progress.articleId,
    progressByArticle: {
      ...state.progressByArticle,
      [progress.articleId]: normalizedProgress
    },
    historyByArticle: {
      ...state.historyByArticle,
      [progress.articleId]: historyEntry
    }
  };
}

export function markArticleCompleted(
  state: LibraryState,
  articleId: string,
  lastSentenceId: string,
  completedAt: number
): LibraryState {
  return updateReadingProgress(state, {
    articleId,
    sentenceId: lastSentenceId,
    progressPercent: 100,
    updatedAt: completedAt
  });
}

export function resetArticleProgress(
  state: LibraryState,
  articleId: string
): LibraryState {
  const existingProgress = state.progressByArticle[articleId];
  const existingHistory = state.historyByArticle[articleId];
  if (
    !existingProgress &&
    !existingHistory?.completedAt &&
    state.lastOpenedArticleId !== articleId
  ) {
    return state;
  }

  const progressByArticle = { ...state.progressByArticle };
  delete progressByArticle[articleId];

  const historyByArticle = existingHistory
    ? {
        ...state.historyByArticle,
        [articleId]: { ...existingHistory, completedAt: null }
      }
    : state.historyByArticle;

  const nextLastOpenedArticleId =
    state.lastOpenedArticleId === articleId
      ? Object.values(historyByArticle)
          .filter((entry) => progressByArticle[entry.articleId])
          .sort((left, right) => right.lastOpenedAt - left.lastOpenedAt)[0]
          ?.articleId ?? null
      : state.lastOpenedArticleId;

  return {
    ...state,
    progressByArticle,
    historyByArticle,
    lastOpenedArticleId: nextLastOpenedArticleId
  };
}

export function getArticleSentenceIds(article: BuiltInArticle): string[] {
  return article.paragraphs.flatMap((paragraph) =>
    paragraph.sentences.map((sentence) => sentence.id)
  );
}

export function getSentenceProgressPercent(
  sentenceIds: readonly string[],
  sentenceId: string
): number {
  const sentenceIndex = sentenceIds.indexOf(sentenceId);
  if (sentenceIndex < 0 || sentenceIds.length === 0) return 0;

  return Math.round(((sentenceIndex + 1) / sentenceIds.length) * 100);
}
