import type { BuiltInArticle } from "../../content/types";

export const LIBRARY_STATE_STORAGE_KEY = "scottbook.libraryState.v1";

export type ReadingProgress = {
  articleId: string;
  sentenceId: string;
  progressPercent: number;
  updatedAt: number;
};

export type LibraryState = {
  version: 1;
  favoriteArticleIds: string[];
  progressByArticle: Record<string, ReadingProgress>;
  lastOpenedArticleId: string | null;
};

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

export function createEmptyLibraryState(): LibraryState {
  return {
    version: 1,
    favoriteArticleIds: [],
    progressByArticle: {},
    lastOpenedArticleId: null
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReadingProgress(
  articleId: string,
  value: unknown
): value is ReadingProgress {
  if (!isRecord(value)) return false;

  return (
    value.articleId === articleId &&
    typeof value.sentenceId === "string" &&
    value.sentenceId.length > 0 &&
    typeof value.progressPercent === "number" &&
    Number.isInteger(value.progressPercent) &&
    value.progressPercent >= 0 &&
    value.progressPercent <= 100 &&
    typeof value.updatedAt === "number" &&
    Number.isFinite(value.updatedAt)
  );
}

export function parseLibraryState(serialized: string | null): LibraryState {
  if (serialized === null) return createEmptyLibraryState();

  try {
    const candidate: unknown = JSON.parse(serialized);
    if (!isRecord(candidate) || candidate.version !== 1) {
      return createEmptyLibraryState();
    }

    const favoriteArticleIds = Array.isArray(candidate.favoriteArticleIds)
      ? [
          ...new Set(
            candidate.favoriteArticleIds.filter(
              (articleId): articleId is string =>
                typeof articleId === "string" && articleId.length > 0
            )
          )
        ]
      : [];

    const progressByArticle: Record<string, ReadingProgress> = {};
    if (isRecord(candidate.progressByArticle)) {
      for (const [articleId, progress] of Object.entries(
        candidate.progressByArticle
      )) {
        if (isReadingProgress(articleId, progress)) {
          progressByArticle[articleId] = progress;
        }
      }
    }

    return {
      version: 1,
      favoriteArticleIds,
      progressByArticle,
      lastOpenedArticleId:
        typeof candidate.lastOpenedArticleId === "string"
          ? candidate.lastOpenedArticleId
          : null
    };
  } catch {
    return createEmptyLibraryState();
  }
}

export function loadLibraryState(storage: StorageReader): LibraryState {
  try {
    return parseLibraryState(storage.getItem(LIBRARY_STATE_STORAGE_KEY));
  } catch {
    return createEmptyLibraryState();
  }
}

export function persistLibraryState(
  storage: StorageWriter,
  state: LibraryState
): boolean {
  try {
    storage.setItem(LIBRARY_STATE_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function markArticleOpened(
  state: LibraryState,
  articleId: string
): LibraryState {
  if (state.lastOpenedArticleId === articleId) return state;

  return { ...state, lastOpenedArticleId: articleId };
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
  const existing = state.progressByArticle[progress.articleId];

  if (
    existing?.sentenceId === progress.sentenceId &&
    existing.progressPercent === progressPercent &&
    state.lastOpenedArticleId === progress.articleId
  ) {
    return state;
  }

  return {
    ...state,
    lastOpenedArticleId: progress.articleId,
    progressByArticle: {
      ...state.progressByArticle,
      [progress.articleId]: { ...progress, progressPercent }
    }
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
