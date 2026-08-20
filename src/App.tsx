import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { builtInLibrary } from "./content/builtInLibrary";
import type {
  AnnotatedSentence,
  BuiltInArticle,
  ReaderArticle
} from "./content/types";
import {
  createScottBookBackup,
  downloadScottBookBackup,
  type ScottBookBackup,
  type ScottBookBackupData,
  type ScottBookPortableData
} from "./features/backup/exportBackup";
import {
  getBackupFileSizeError,
  loadScottBookRestoreUndo,
  parseScottBookBackupText,
  type RestoreTransactionResult,
  type ScottBookBackupPreview
} from "./features/backup/restoreBackup";
import {
  createLocalDiagnosticReport,
  downloadLocalDiagnosticReport,
  readLocalDiagnosticRuntime
} from "./features/diagnostics/localDiagnostics";
import {
  advanceAssistance,
  type AssistanceSelection
} from "./features/reader/assistance";
import {
  filterArticleVocabulary,
  getArticleVocabulary,
  getLibraryVocabularyContexts,
  type ArticleVocabularyEntry
} from "./features/reader/articleVocabulary";
import { SentenceLine } from "./features/reader/SentenceLine";
import {
  getAssistanceScopeLabel,
  getAssistanceUnitKey,
  getSentenceAssistanceUnits,
  getSentenceText,
  isReaderAssistanceScope,
  type ReaderAssistanceScope,
  type ReaderAssistanceUnit
} from "./features/reader/readerScope";
import {
  createReaderHash,
  createVocabularyReaderHash,
  parseReaderHash
} from "./features/reader/readerNavigation";
import {
  getNextReadingChoice,
  type NextReadingChoice
} from "./features/reader/readingSequence";
import {
  getArticleSentenceIds,
  getSentenceProgressPercent,
  markArticleCompleted,
  markArticleOpened,
  persistLibraryState,
  resetArticleProgress,
  toggleFavoriteArticle,
  updateReadingProgress,
  type LibraryState,
  type ReadingHistoryEntry
} from "./features/library/readingState";
import {
  countArticlesByLevel,
  filterLibraryArticles,
  type LibraryLevelFilter,
  type LibraryStatusFilter
} from "./features/library/libraryDiscovery";
import {
  getLearningProgressOverview,
  type LearningProgressOverview
} from "./features/library/learningProgress";
import {
  countAssistanceReviewItems,
  filterAssistanceReviewItems,
  type AssistanceReviewFilter,
  type AssistanceReviewScopeFilter,
  type AssistanceReviewSort
} from "./features/review/reviewDiscovery";
import {
  advanceReviewPracticeStage,
  createReviewPracticeQueue,
  MAX_QUICK_REVIEW_ITEMS,
  type ReviewPracticeStage
} from "./features/review/reviewPractice";
import {
  getArticleAssistanceInsights,
  type ArticleAssistanceInsight
} from "./features/review/learningInsights";
import {
  articleTopics,
  countArticlesByLength,
  countArticlesByTopic,
  filterDiscoverArticles,
  getArticleLengthLabel,
  getArticleMetadata,
  type DiscoverLengthFilter,
  type DiscoverLevelFilter,
  type DiscoverTopicFilter
} from "./features/library/articleCatalog";
import {
  DEFAULT_READER_PREFERENCES,
  MAX_READER_FONT_SIZE,
  MIN_READER_FONT_SIZE,
  READER_ASSISTANCE_SCOPE_STORAGE_KEY,
  READER_CONTENT_WIDTH_STORAGE_KEY,
  READER_CONTENT_WIDTH_VALUES,
  READER_FONT_FAMILY_STORAGE_KEY,
  READER_FONT_SIZE_STORAGE_KEY,
  READER_LINE_HEIGHT_STORAGE_KEY,
  READER_LINE_HEIGHT_VALUES,
  READER_THEME_STORAGE_KEY,
  isReaderContentWidth,
  isReaderFontFamily,
  isReaderFontSize,
  isReaderLineHeight,
  isReaderTheme,
  type ReaderContentWidth,
  type ReaderFontFamily,
  type ReaderLineHeight,
  type ReaderPreferences,
  type ReaderTheme
} from "./features/preferences/readerPreferences";
import {
  deleteAssistanceItem,
  isReviewableAssistanceItem,
  markAssistanceKnown,
  persistAssistanceHistory,
  recordAssistance,
  setAssistanceRecording,
  toggleAssistancePinned,
  type AssistanceHistoryState,
  type AssistanceLevel,
  type AssistanceReviewItem
} from "./features/review/assistanceHistory";
import {
  pwaStatusStore,
  usePwaStatus,
  type PwaStatusSnapshot,
  type StoragePersistence
} from "./features/pwa/pwaStatus";
import {
  NATIVE_BACK_EVENT,
  registerAndroidBackNavigation
} from "./features/native/androidBackNavigation";
import { getInstallCopy } from "./features/pwa/installGuidance";
import {
  scottBookRepository,
  type IndexedDbBootstrapResult,
  type ScottBookStorageReport
} from "./features/storage/indexedDbRepository";
import { ScottBookLocalDataCoordinator } from "./features/storage/localDataCoordinator";
import { ImportScreen } from "./features/import/ImportScreen";
import {
  isImportedBook,
  removeImportedBookReferences,
  type ImportedBook
} from "./features/import/importedBook";
import {
  loadLocalDataFallback,
  tryLoadPrimaryLocalData
} from "./features/storage/localDataSnapshot";

type Route =
  | { name: "library" }
  | { name: "import" }
  | { name: "discover" }
  | { name: "review" }
  | { name: "practice" }
  | { name: "detail"; articleId: string }
  | {
      name: "reader";
      articleId: string;
      contextSentenceId?: string;
      contextSource?: "review" | "vocabulary";
      returnArticleId?: string;
    };

type LocalDataStatus = {
  phase: "checking" | "ready" | "fallback";
  source: IndexedDbBootstrapResult["source"] | null;
  quarantinedThisRun: number;
};

function parseRoute(): Route {
  if (window.location.hash === "#/import") return { name: "import" };
  if (window.location.hash === "#/review/practice") {
    return { name: "practice" };
  }
  if (window.location.hash === "#/review") return { name: "review" };
  if (window.location.hash === "#/discover") return { name: "discover" };

  const readerDestination = parseReaderHash(window.location.hash);
  if (readerDestination) {
    return { name: "reader", ...readerDestination };
  }

  const detailMatch = window.location.hash.match(/^#\/article\/(.+)$/);
  return detailMatch?.[1]
    ? { name: "detail", articleId: decodeURIComponent(detailMatch[1]) }
    : { name: "library" };
}

function useStoredState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return initial;
      const candidate: unknown = JSON.parse(stored);
      return isValid(candidate) ? candidate : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The current session still works when browser storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function findSelectedContext(
  article: ReaderArticle,
  selection: AssistanceSelection | null,
  scope: ReaderAssistanceScope
) {
  if (!selection) return null;

  for (const paragraph of article.paragraphs) {
    for (const sentence of paragraph.sentences) {
      const unit = getSentenceAssistanceUnits(sentence, scope).find(
        (candidate) =>
          getAssistanceUnitKey(sentence, candidate) === selection.key
      );
      if (unit) {
        return { sentence, unit };
      }
    }
  }

  return null;
}

function BookIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 9.5c6.1-2.1 11.4-1.3 16 2.4v26.6c-4.6-3.7-9.9-4.5-16-2.4V9.5Z" />
      <path d="M40 9.5c-6.1-2.1-11.4-1.3-16 2.4v26.6c4.6-3.7 9.9-4.5 16-2.4V9.5Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function App() {
  const pwaStatus = usePwaStatus();
  const [route, setRoute] = useState<Route>(parseRoute);
  const [bootstrapData] = useState(() => ({
    fallback: loadLocalDataFallback(window.localStorage),
    preferred: tryLoadPrimaryLocalData(window.localStorage)
  }));
  const [theme, setTheme] = useStoredState<ReaderTheme>(
    READER_THEME_STORAGE_KEY,
    bootstrapData.fallback.preferences.theme,
    isReaderTheme
  );
  const [fontSize, setFontSize] = useStoredState<number>(
    READER_FONT_SIZE_STORAGE_KEY,
    bootstrapData.fallback.preferences.fontSize,
    isReaderFontSize
  );
  const [assistanceScope, setAssistanceScope] =
    useStoredState<ReaderAssistanceScope>(
      READER_ASSISTANCE_SCOPE_STORAGE_KEY,
      bootstrapData.fallback.preferences.assistanceScope,
      isReaderAssistanceScope
    );
  const [fontFamily, setFontFamily] = useStoredState<ReaderFontFamily>(
    READER_FONT_FAMILY_STORAGE_KEY,
    bootstrapData.fallback.preferences.fontFamily,
    isReaderFontFamily
  );
  const [lineHeight, setLineHeight] = useStoredState<ReaderLineHeight>(
    READER_LINE_HEIGHT_STORAGE_KEY,
    bootstrapData.fallback.preferences.lineHeight,
    isReaderLineHeight
  );
  const [contentWidth, setContentWidth] = useStoredState<ReaderContentWidth>(
    READER_CONTENT_WIDTH_STORAGE_KEY,
    bootstrapData.fallback.preferences.contentWidth,
    isReaderContentWidth
  );
  const readerPreferences = useMemo<ReaderPreferences>(
    () => ({
      theme,
      fontSize,
      assistanceScope,
      fontFamily,
      lineHeight,
      contentWidth
    }),
    [
      assistanceScope,
      contentWidth,
      fontFamily,
      fontSize,
      lineHeight,
      theme
    ]
  );
  const [libraryState, setLibraryState] = useState<LibraryState>(
    bootstrapData.fallback.libraryState
  );
  const [assistanceHistory, setAssistanceHistory] =
    useState<AssistanceHistoryState>(
      bootstrapData.fallback.assistanceHistory
    );
  const [importedBooks, setImportedBooks] = useState<ImportedBook[]>([]);
  const [localDataCoordinator] = useState(
    () =>
      new ScottBookLocalDataCoordinator(
        scottBookRepository,
        window.localStorage
      )
  );
  const [localDataStatus, setLocalDataStatus] = useState<LocalDataStatus>({
    phase: "checking",
    source: null,
    quarantinedThisRun: 0
  });
  const routeKey =
    route.name === "reader" || route.name === "detail"
      ? `${route.name}:${route.articleId}`
      : route.name;
  const routeTitle =
    route.name === "library"
      ? "Thư viện · ScottBook"
      : route.name === "import"
        ? "Nhập văn bản · ScottBook"
      : route.name === "discover"
        ? "Khám phá · ScottBook"
        : route.name === "review"
          ? "Ôn lại · ScottBook"
          : route.name === "practice"
            ? "Luyện nhanh · ScottBook"
          : route.name === "detail"
            ? "Thông tin bài đọc · ScottBook"
            : "Bài đọc · ScottBook";
  const previousRouteRef = useRef<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    let active = true;
    let removeListener: (() => Promise<void>) | undefined;
    void registerAndroidBackNavigation().then((handle) => {
      if (!handle) return;
      if (!active) {
        void handle.remove();
        return;
      }
      removeListener = () => handle.remove();
    });
    return () => {
      active = false;
      void removeListener?.();
    };
  }, []);

  useEffect(() => {
    document.title = routeTitle;
    if (
      previousRouteRef.current !== null &&
      previousRouteRef.current !== routeKey
    ) {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById("main-content")?.focus({ preventScroll: true });
      });
      previousRouteRef.current = routeKey;
      return () => window.cancelAnimationFrame(frame);
    }
    previousRouteRef.current = routeKey;
  }, [routeKey, routeTitle]);

  useEffect(() => {
    persistLibraryState(window.localStorage, libraryState);
  }, [libraryState]);

  useEffect(() => {
    persistAssistanceHistory(window.localStorage, assistanceHistory);
  }, [assistanceHistory]);

  const openArticle = (articleId: string, contextSentenceId?: string) => {
    setLibraryState((current) =>
      markArticleOpened(current, articleId, Date.now())
    );
    window.location.assign(createReaderHash(articleId, contextSentenceId));
  };

  const openArticleDetails = (articleId: string) => {
    window.location.assign(`#/article/${encodeURIComponent(articleId)}`);
  };

  const openDiscover = () => {
    window.location.assign("#/discover");
  };

  const toggleFavorite = useCallback((articleId: string) => {
    setLibraryState((current) => toggleFavoriteArticle(current, articleId));
  }, []);

  const saveReadingPosition = useCallback(
    (articleId: string, sentenceId: string, progressPercent: number) => {
      setLibraryState((current) =>
        updateReadingProgress(current, {
          articleId,
          sentenceId,
          progressPercent,
          updatedAt: Date.now()
        })
      );
    },
    []
  );

  const completeArticle = useCallback(
    (articleId: string, lastSentenceId: string) => {
      setLibraryState((current) =>
        markArticleCompleted(
          current,
          articleId,
          lastSentenceId,
          Date.now()
        )
      );
    },
    []
  );

  const resetProgress = useCallback((articleId: string) => {
    setLibraryState((current) => resetArticleProgress(current, articleId));
  }, []);

  const replaceLocalData = useCallback((data: ScottBookBackupData) => {
    setLibraryState(data.libraryState);
    setTheme(data.preferences.theme);
    setFontSize(data.preferences.fontSize);
    setAssistanceScope(data.preferences.assistanceScope);
    setFontFamily(data.preferences.fontFamily);
    setLineHeight(data.preferences.lineHeight);
    setContentWidth(data.preferences.contentWidth);
    setAssistanceHistory(data.assistanceHistory);
  }, [
    setAssistanceScope,
    setContentWidth,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setTheme
  ]);

  useEffect(() => {
    let active = true;
    void localDataCoordinator
      .bootstrap(bootstrapData.fallback, bootstrapData.preferred)
      .then((result) => {
        if (!active) return;
        replaceLocalData(result.data);
        setImportedBooks(result.importedBooks ?? []);
        setLocalDataStatus({
          phase: result.available ? "ready" : "fallback",
          source: result.source,
          quarantinedThisRun: result.quarantinedThisRun
        });
      })
      .catch(() => {
        if (!active) return;
        setLocalDataStatus({
          phase: "fallback",
          source: "fallback",
          quarantinedThisRun: 0
        });
      });
    return () => {
      active = false;
    };
  }, [bootstrapData, localDataCoordinator, replaceLocalData]);

  useEffect(() => {
    if (localDataStatus.phase !== "ready") return;

    let active = true;
    void localDataCoordinator
      .persist({
        libraryState,
        preferences: readerPreferences,
        assistanceHistory
      })
      .then((succeeded) => {
        if (
          active &&
          (!succeeded || !localDataCoordinator.isUsingIndexedDb())
        ) {
          setLocalDataStatus((current) => ({
            ...current,
            phase: "fallback",
            source: "fallback"
          }));
        }
      });
    return () => {
      active = false;
    };
  }, [
    assistanceHistory,
    libraryState,
    localDataCoordinator,
    localDataStatus.phase,
    readerPreferences
  ]);

  const applyBackupRestore = useCallback(
    async (restoredData: ScottBookPortableData) => {
      const result = await localDataCoordinator.applyRestore(
        {
          libraryState,
          preferences: readerPreferences,
          assistanceHistory
        },
        importedBooks,
        restoredData
      );
      if (result.ok) {
        replaceLocalData(result.data);
        setImportedBooks(result.importedBooks ?? []);
      }
      if (!localDataCoordinator.isUsingIndexedDb()) {
        setLocalDataStatus((current) => ({
          ...current,
          phase: "fallback",
          source: "fallback"
        }));
      }
      return result;
    },
    [
      assistanceHistory,
      importedBooks,
      libraryState,
      localDataCoordinator,
      readerPreferences,
      replaceLocalData,
    ]
  );

  const undoBackupRestore = useCallback(async () => {
    const result = await localDataCoordinator.undoRestore({
      libraryState,
      preferences: readerPreferences,
      assistanceHistory
    });
    if (result.ok) {
      replaceLocalData(result.data);
      setImportedBooks(result.importedBooks ?? []);
    }
    if (!localDataCoordinator.isUsingIndexedDb()) {
      setLocalDataStatus((current) => ({
        ...current,
        phase: "fallback",
        source: "fallback"
      }));
    }
    return result;
  }, [
    assistanceHistory,
    libraryState,
    localDataCoordinator,
    readerPreferences,
    replaceLocalData,
  ]);

  const loadStorageReport = useCallback(() => {
    const storageManager =
      typeof navigator === "undefined" ? undefined : navigator.storage;
    const estimate = storageManager?.estimate
      ? () => storageManager.estimate()
      : undefined;
    return localDataCoordinator.getStorageReport(estimate);
  }, [localDataCoordinator]);

  const clearTranslationCache = useCallback(
    () => localDataCoordinator.clearTranslationCache(),
    [localDataCoordinator]
  );

  const preparePwaUpdate = useCallback(async () => {
    const prepared = await localDataCoordinator.prepareForUpdate({
      libraryState,
      preferences: readerPreferences,
      assistanceHistory
    });
    if (!localDataCoordinator.isUsingIndexedDb()) {
      setLocalDataStatus((current) => ({
        ...current,
        phase: "fallback",
        source: "fallback"
      }));
    }
    return prepared;
  }, [
    assistanceHistory,
    libraryState,
    localDataCoordinator,
    readerPreferences
  ]);

  const saveAssistance = useCallback(
    (
      article: ReaderArticle,
      sentence: AnnotatedSentence,
      unit: ReaderAssistanceUnit,
      level: AssistanceLevel
    ) => {
      const sentenceText = getSentenceText(sentence);
      setAssistanceHistory((current) =>
        recordAssistance(current, {
          articleId: article.id,
          sentenceId: sentence.id,
          sentenceText,
          sentenceTranslation: sentence.translation,
          hanzi: unit.hanzi,
          pinyin: unit.pinyin,
          meaning: unit.meaning,
          scope: unit.scope,
          level,
          occurredAt: Date.now()
        })
      );
    },
    []
  );

  const saveImportedBook = useCallback(
    async (book: ImportedBook) => {
      const saved = await localDataCoordinator.saveImportedBook(book);
      if (!saved) return false;
      setImportedBooks((current) => [book, ...current]);
      setLibraryState((current) => markArticleOpened(current, book.id, Date.now()));
      window.location.assign(createReaderHash(book.id));
      return true;
    },
    [localDataCoordinator]
  );

  const deleteImportedBook = useCallback(
    async (bookId: string) => {
      const currentData: ScottBookBackupData = {
        libraryState,
        preferences: readerPreferences,
        assistanceHistory
      };
      const nextData = removeImportedBookReferences(currentData, bookId);
      const result = await localDataCoordinator.deleteImportedBook(
        bookId,
        currentData,
        nextData
      );
      if (!result.ok) return result.message;
      replaceLocalData(result.data);
      setImportedBooks((current) => current.filter((book) => book.id !== bookId));
      return null;
    },
    [
      assistanceHistory,
      libraryState,
      localDataCoordinator,
      readerPreferences,
      replaceLocalData
    ]
  );

  const reviewableItems = Object.values(assistanceHistory.items).filter(
    isReviewableAssistanceItem
  );
  const activeReviewCount = reviewableItems.filter(
    (item) => item.knownAt === null
  ).length;

  const goHome = () => {
    window.location.assign("#/");
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "paper" ? "night" : "paper"));
  };

  const updateReaderPreferences = useCallback(
    (updates: Partial<ReaderPreferences>) => {
      if (updates.theme !== undefined) setTheme(updates.theme);
      if (updates.fontSize !== undefined) setFontSize(updates.fontSize);
      if (updates.assistanceScope !== undefined) {
        setAssistanceScope(updates.assistanceScope);
      }
      if (updates.fontFamily !== undefined) {
        setFontFamily(updates.fontFamily);
      }
      if (updates.lineHeight !== undefined) {
        setLineHeight(updates.lineHeight);
      }
      if (updates.contentWidth !== undefined) {
        setContentWidth(updates.contentWidth);
      }
    },
    [
      setAssistanceScope,
      setContentWidth,
      setFontFamily,
      setFontSize,
      setLineHeight,
      setTheme
    ]
  );

  let content;
  if (route.name === "reader") {
    const builtInArticle = builtInLibrary.find((item) => item.id === route.articleId);
    const article: ReaderArticle | undefined =
      builtInArticle ?? importedBooks.find((item) => item.id === route.articleId);
    const nextReading = builtInArticle
      ? getNextReadingChoice(builtInLibrary, builtInArticle.id, libraryState)
      : null;
    const readingProgress = article
      ? libraryState.progressByArticle[article.id]
      : undefined;
    const contextSentenceId =
      article &&
      route.contextSentenceId &&
      getArticleSentenceIds(article).includes(route.contextSentenceId)
        ? route.contextSentenceId
        : undefined;
    const contextSource = contextSentenceId
      ? route.contextSource ?? "review"
      : undefined;
    const returnArticleId =
      contextSource === "vocabulary" &&
      route.returnArticleId &&
      builtInLibrary.some((item) => item.id === route.returnArticleId)
        ? route.returnArticleId
        : undefined;
    const readerBackLabel: "Về thư viện" | "Về Ôn lại" | "Về bài trước" =
      contextSource === "vocabulary"
        ? returnArticleId
          ? "Về bài trước"
          : "Về thư viện"
        : contextSentenceId
          ? "Về Ôn lại"
          : "Về thư viện";
    const goBackFromReader =
      contextSource === "vocabulary"
        ? returnArticleId
          ? () => window.location.assign(createReaderHash(returnArticleId))
          : goHome
        : contextSentenceId
          ? () => window.location.assign("#/review")
          : goHome;
    content = article ? (
      <ReaderScreen
        key={`${article.id}:${contextSentenceId ?? "reading"}:${contextSource ?? "normal"}:${returnArticleId ?? "none"}`}
        article={article}
        preferences={readerPreferences}
        updatePreferences={updateReaderPreferences}
        toggleTheme={toggleTheme}
        goBack={goBackFromReader}
        backLabel={readerBackLabel}
        isFavorite={libraryState.favoriteArticleIds.includes(article.id)}
        toggleFavorite={() => toggleFavorite(article.id)}
        resumeSentenceId={contextSentenceId ?? readingProgress?.sentenceId}
        contextSentenceId={contextSentenceId}
        contextSource={contextSource}
        progressPercent={readingProgress?.progressPercent ?? 0}
        saveReadingPosition={saveReadingPosition}
        isCompleted={Boolean(
          libraryState.historyByArticle[article.id]?.completedAt
        )}
        completeArticle={() => {
          const sentenceIds = getArticleSentenceIds(article);
          const lastSentenceId = sentenceIds.at(-1);
          if (lastSentenceId) completeArticle(article.id, lastSentenceId);
        }}
        nextReading={nextReading}
        openNextArticle={() => {
          if (nextReading) openArticle(nextReading.article.id);
        }}
        saveAssistance={(sentence, unit, level) =>
          saveAssistance(article, sentence, unit, level)
        }
        openVocabularyContext={(targetArticleId, sentenceId) => {
          setLibraryState((current) =>
            markArticleOpened(current, targetArticleId, Date.now())
          );
          window.location.assign(
            createVocabularyReaderHash(targetArticleId, sentenceId, article.id)
          );
        }}
      />
    ) : (
      <NotFound goHome={goHome} isOnline={pwaStatus.isOnline} />
    );
  } else if (route.name === "import") {
    content = (
      <ImportScreen
        theme={theme}
        toggleTheme={toggleTheme}
        storageReady={localDataStatus.phase === "ready"}
        close={goHome}
        saveBook={saveImportedBook}
      />
    );
  } else if (route.name === "detail") {
    const article = builtInLibrary.find((item) => item.id === route.articleId);
    const readingProgress = article
      ? libraryState.progressByArticle[article.id]
      : undefined;
    content = article ? (
      <ArticleDetailScreen
        article={article}
        theme={theme}
        toggleTheme={toggleTheme}
        goDiscover={openDiscover}
        openArticle={() => openArticle(article.id)}
        isFavorite={libraryState.favoriteArticleIds.includes(article.id)}
        toggleFavorite={() => toggleFavorite(article.id)}
        progressPercent={readingProgress?.progressPercent ?? 0}
        isCompleted={Boolean(
          libraryState.historyByArticle[article.id]?.completedAt
        )}
        historyEntry={libraryState.historyByArticle[article.id]}
        reviewCount={activeReviewCount}
      />
    ) : (
      <NotFound goHome={goHome} isOnline={pwaStatus.isOnline} />
    );
  } else if (route.name === "discover") {
    content = (
      <DiscoverScreen
        theme={theme}
        toggleTheme={toggleTheme}
        openArticleDetails={openArticleDetails}
        libraryState={libraryState}
        reviewCount={activeReviewCount}
        toggleFavorite={toggleFavorite}
      />
    );
  } else if (route.name === "practice") {
    content = (
      <ReviewPracticeScreen
        preferences={readerPreferences}
        toggleTheme={toggleTheme}
        assistanceHistory={assistanceHistory}
        reviewCount={activeReviewCount}
        markKnown={(itemId) =>
          setAssistanceHistory((current) =>
            markAssistanceKnown(current, itemId, Date.now())
          )
        }
      />
    );
  } else if (route.name === "review") {
    content = (
      <ReviewScreen
        preferences={readerPreferences}
        toggleTheme={toggleTheme}
        libraryState={libraryState}
        assistanceHistory={assistanceHistory}
        importedBooks={importedBooks}
        reviewCount={activeReviewCount}
        setRecordingEnabled={(enabled) =>
          setAssistanceHistory((current) =>
            setAssistanceRecording(current, enabled)
          )
        }
        toggleReviewPinned={(itemId) =>
          setAssistanceHistory((current) =>
            toggleAssistancePinned(current, itemId)
          )
        }
        markReviewKnown={(itemId, known) =>
          setAssistanceHistory((current) =>
            markAssistanceKnown(current, itemId, known ? Date.now() : null)
          )
        }
        deleteReviewItem={(itemId) =>
          setAssistanceHistory((current) =>
            deleteAssistanceItem(current, itemId)
          )
        }
        openArticle={openArticle}
        resetProgress={resetProgress}
        storagePersistence={pwaStatus.storagePersistence}
        localDataStatus={localDataStatus}
        applyBackupRestore={applyBackupRestore}
        undoBackupRestore={undoBackupRestore}
        loadStorageReport={loadStorageReport}
        clearTranslationCache={clearTranslationCache}
      />
    );
  } else {
    content = (
      <LibraryScreen
        theme={theme}
        toggleTheme={toggleTheme}
        openArticle={openArticle}
        importedBooks={importedBooks}
        libraryState={libraryState}
        reviewCount={activeReviewCount}
        toggleFavorite={toggleFavorite}
        openImport={() => window.location.assign("#/import")}
        deleteImportedBook={deleteImportedBook}
      />
    );
  }

  return (
    <div data-theme={theme}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus();
          main?.scrollIntoView({ block: "start" });
        }}
      >
        Bỏ qua đến nội dung chính
      </a>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {routeTitle}
      </p>
      {content}
      <PwaStatusNotice
        status={pwaStatus}
        isReading={route.name === "reader"}
        prepareUpdate={preparePwaUpdate}
      />
    </div>
  );
}

function PwaStatusNotice({
  status,
  isReading,
  prepareUpdate
}: {
  status: PwaStatusSnapshot;
  isReading: boolean;
  prepareUpdate: () => Promise<boolean>;
}) {
  const installCopy = status.installMethod
    ? getInstallCopy(status.installMethod)
    : null;

  return (
    <div className="pwa-status-stack">
      {status.needRefresh ? (
        <aside className="update-notice" aria-live="polite">
          <div className="notice-icon" aria-hidden="true">↻</div>
          <div>
            <strong>Có phiên bản ScottBook mới</strong>
            <p>
              {isReading
                ? "ScottBook sẽ chốt vị trí đọc trước khi tải lại bản mới."
                : "Dữ liệu local sẽ được kiểm tra và chốt trước khi cập nhật."}
            </p>
            {status.updateError ? (
              <p className="notice-error">{status.updateError}</p>
            ) : null}
            <div className="notice-actions">
              <button
                className="notice-later"
                type="button"
                onClick={pwaStatusStore.dismissRefresh}
                disabled={status.updating}
              >
                Để sau
              </button>
              <button
                className="notice-update"
                type="button"
                onClick={() =>
                  void pwaStatusStore.applyUpdate(prepareUpdate)
                }
                disabled={status.updating}
              >
                {status.updating ? "Đang cập nhật…" : "Cập nhật bây giờ"}
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      {installCopy &&
      (status.installState === "available" ||
        status.installState === "prompting") ? (
        <aside className="install-notice" aria-live="polite">
          <div className="install-notice-icon" aria-hidden="true">↓</div>
          <div>
            <strong>{installCopy.title}</strong>
            <p>{installCopy.instruction}</p>
            {status.installError ? (
              <p className="notice-error">{status.installError}</p>
            ) : null}
            <div className="notice-actions">
              <button
                className="notice-later"
                type="button"
                onClick={pwaStatusStore.dismissInstall}
                disabled={status.installState === "prompting"}
              >
                Để sau
              </button>
              {status.installMethod === "native" ? (
                <button
                  className="notice-update"
                  type="button"
                  onClick={() => void pwaStatusStore.requestInstall()}
                  disabled={status.installState === "prompting"}
                >
                  {status.installState === "prompting"
                    ? "Đang mở…"
                    : "Cài ngay"}
                </button>
              ) : (
                <button
                  className="notice-update"
                  type="button"
                  onClick={pwaStatusStore.dismissInstall}
                >
                  Đã hiểu
                </button>
              )}
            </div>
          </div>
        </aside>
      ) : null}

      {status.offlineReady ? (
        <aside className="offline-ready-notice" aria-live="polite">
          <span aria-hidden="true">✓</span>
          <p>ScottBook đã sẵn sàng để đọc khi mất mạng.</p>
          <button
            type="button"
            onClick={pwaStatusStore.dismissOfflineReady}
            aria-label="Đóng thông báo offline"
          >
            ×
          </button>
        </aside>
      ) : null}

      {!status.needRefresh && status.updateError ? (
        <aside className="pwa-error-notice" aria-live="polite">
          <p>{status.updateError}</p>
          <button
            type="button"
            onClick={pwaStatusStore.dismissError}
            aria-label="Đóng thông báo lỗi cập nhật"
          >
            ×
          </button>
        </aside>
      ) : null}

      <div className="pwa-action-chips">
        {status.updateAvailable && !status.needRefresh ? (
          <button type="button" onClick={pwaStatusStore.showRefresh}>
            <span aria-hidden="true">↻</span>
            Cập nhật
          </button>
        ) : null}
        {status.installState === "hidden" && status.installMethod ? (
          <button type="button" onClick={pwaStatusStore.showInstallHelp}>
            <span aria-hidden="true">↓</span>
            Cài app
          </button>
        ) : null}
      </div>

    </div>
  );
}

function Brand() {
  return (
    <a className="brand" href="#/" aria-label="ScottBook — về thư viện">
      <span className="brand-icon">
        <BookIcon />
      </span>
      <span>ScottBook</span>
    </a>
  );
}

function Sidebar({
  active,
  reviewCount
}: {
  active: "library" | "discover" | "review";
  reviewCount: number;
}) {
  return (
    <aside className="sidebar">
      <Brand />
      <nav className="side-nav" aria-label="Điều hướng chính">
        <a
          className={`nav-item${active === "library" ? " active" : ""}`}
          href="#/"
          aria-current={active === "library" ? "page" : undefined}
        >
          <span aria-hidden="true">▤</span>
          Thư viện
        </a>
        <a
          className={`nav-item${active === "discover" ? " active" : ""}`}
          href="#/discover"
          aria-current={active === "discover" ? "page" : undefined}
        >
          <span aria-hidden="true">◇</span>
          Khám phá
        </a>
        <a
          className={`nav-item${active === "review" ? " active" : ""}`}
          href="#/review"
          aria-current={active === "review" ? "page" : undefined}
        >
          <span aria-hidden="true">◎</span>
          Ôn lại
          {reviewCount > 0 ? <small>{reviewCount}</small> : null}
        </a>
      </nav>
      <div className="sidebar-note">
        <span className="status-dot" />
        <strong>Hoàn toàn offline</strong>
        <p>Nội dung và lịch sử đọc chỉ nằm trên thiết bị này.</p>
      </div>
    </aside>
  );
}

function MobileNavigation({
  active,
  reviewCount
}: {
  active: "library" | "discover" | "review";
  reviewCount: number;
}) {
  return (
    <nav className="mobile-tabbar" aria-label="Điều hướng chính trên điện thoại">
      <a
        className={active === "library" ? "active" : ""}
        href="#/"
        aria-current={active === "library" ? "page" : undefined}
      >
        <span aria-hidden="true">▤</span>
        Thư viện
      </a>
      <a
        className={active === "discover" ? "active" : ""}
        href="#/discover"
        aria-current={active === "discover" ? "page" : undefined}
      >
        <span aria-hidden="true">◇</span>
        Khám phá
      </a>
      <a
        className={active === "review" ? "active" : ""}
        href="#/review"
        aria-current={active === "review" ? "page" : undefined}
      >
        <span aria-hidden="true">◎</span>
        Ôn lại
        {reviewCount > 0 ? <small>{reviewCount}</small> : null}
      </a>
    </nav>
  );
}

function LibraryScreen({
  theme,
  toggleTheme,
  openArticle,
  importedBooks,
  libraryState,
  reviewCount,
  toggleFavorite,
  openImport,
  deleteImportedBook
}: {
  theme: ReaderTheme;
  toggleTheme: () => void;
  openArticle: (articleId: string, contextSentenceId?: string) => void;
  importedBooks: readonly ImportedBook[];
  libraryState: LibraryState;
  reviewCount: number;
  toggleFavorite: (articleId: string) => void;
  openImport: () => void;
  deleteImportedBook: (bookId: string) => Promise<string | null>;
}) {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] =
    useState<LibraryLevelFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<LibraryStatusFilter>("all");
  const favoriteIds = libraryState.favoriteArticleIds;
  const levelCounts = useMemo(
    () => countArticlesByLevel(builtInLibrary),
    []
  );
  const statusCounts = useMemo(
    () => ({
      all: builtInLibrary.length,
      "in-progress": filterLibraryArticles(builtInLibrary, libraryState, {
        query: "",
        level: "all",
        status: "in-progress"
      }).length,
      completed: filterLibraryArticles(builtInLibrary, libraryState, {
        query: "",
        level: "all",
        status: "completed"
      }).length,
      favorites: filterLibraryArticles(builtInLibrary, libraryState, {
        query: "",
        level: "all",
        status: "favorites"
      }).length
    }),
    [libraryState]
  );
  const visibleArticles = useMemo(
    () =>
      filterLibraryArticles(builtInLibrary, libraryState, {
        query,
        level: levelFilter,
        status: statusFilter
      }),
    [levelFilter, libraryState, query, statusFilter]
  );
  const filtersActive =
    query.trim().length > 0 || levelFilter !== "all" || statusFilter !== "all";
  const resetDiscovery = () => {
    setQuery("");
    setLevelFilter("all");
    setStatusFilter("all");
  };
  const continueArticle: ReaderArticle | undefined = [
    ...importedBooks,
    ...builtInLibrary
  ].find((article) => article.id === libraryState.lastOpenedArticleId);
  const continueProgress = continueArticle
    ? libraryState.progressByArticle[continueArticle.id]
    : undefined;
  return (
    <div className="app-shell">
      <Sidebar active="library" reviewCount={reviewCount} />

      <main id="main-content" className="library-page" tabIndex={-1}>
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <p className="eyebrow">Thư viện tham khảo</p>
          <button
            className="icon-button theme-button"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "paper" ? "Bật giao diện tối" : "Bật giao diện sáng"}
          >
            {theme === "paper" ? "☾" : "☀"}
          </button>
        </header>

        <section className="hero">
          <div>
            <span className="hero-stamp">离线阅读 · Đọc ngoại tuyến</span>
            <h1>Đừng dịch vội.<br />Hãy hiểu trước.</h1>
            <p>
              Chạm một lần để xem pinyin. Chạm thêm lần nữa khi bạn thật sự
              cần nghĩa và bản dịch câu.
            </p>
          </div>
          <div className="hero-glyph" aria-hidden="true">
            <span>读</span>
            <small>dú · đọc</small>
          </div>
        </section>

        {continueArticle ? (
          <ContinueReadingCard
            article={continueArticle}
            progressPercent={continueProgress?.progressPercent ?? 0}
            isCompleted={Boolean(
              libraryState.historyByArticle[continueArticle.id]?.completedAt
            )}
            onOpen={() => openArticle(continueArticle.id)}
          />
        ) : null}

        <ImportedBooksSection
          books={importedBooks}
          libraryState={libraryState}
          openArticle={openArticle}
          openImport={openImport}
          deleteImportedBook={deleteImportedBook}
        />

        <section className="library-section" aria-labelledby="reference-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Nội dung dựng sẵn</p>
              <h2 id="reference-heading">Chọn một câu chuyện để bắt đầu</h2>
            </div>
            <span className="offline-pill">Không cần mạng</span>
          </div>

          <div className="library-discovery">
            <label className="library-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm Hanzi, pinyin hoặc nghĩa tiếng Việt"
                aria-label="Tìm trong thư viện offline"
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Xóa nội dung tìm kiếm"
                >
                  ×
                </button>
              ) : null}
            </label>

            <div className="discovery-filter-row">
              <span>Cấp độ</span>
              <div
                className="discovery-filter-buttons"
                role="group"
                aria-label="Lọc theo cấp độ HSK"
              >
                {([
                  { value: "all", label: "Tất cả", count: builtInLibrary.length, accent: "all" },
                  { value: "HSK 1", label: "HSK 1", count: levelCounts["HSK 1"], accent: "jade" },
                  { value: "HSK 2", label: "HSK 2", count: levelCounts["HSK 2"], accent: "amber" },
                  { value: "HSK 3", label: "HSK 3", count: levelCounts["HSK 3"], accent: "coral" },
                  { value: "HSK 4", label: "HSK 4", count: levelCounts["HSK 4"], accent: "violet" },
                  { value: "HSK 5", label: "HSK 5", count: levelCounts["HSK 5"], accent: "azure" }
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`level-filter level-${option.accent}${
                      levelFilter === option.value ? " active" : ""
                    }`}
                    aria-pressed={levelFilter === option.value}
                    onClick={() => setLevelFilter(option.value)}
                  >
                    {option.label} <small>{option.count}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="discovery-filter-row">
              <span>Trạng thái</span>
              <div
                className="discovery-filter-buttons"
                role="group"
                aria-label="Lọc theo trạng thái đọc"
              >
                {([
                  { value: "all", label: "Tất cả" },
                  { value: "in-progress", label: "Đang đọc" },
                  { value: "completed", label: "Đã xong" },
                  { value: "favorites", label: "Yêu thích" }
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={statusFilter === option.value ? "active" : ""}
                    aria-pressed={statusFilter === option.value}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label} <small>{statusCounts[option.value]}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="discovery-results">
              <p role="status" aria-live="polite">
                <strong>{visibleArticles.length}</strong> bài phù hợp
              </p>
              {filtersActive ? (
                <button type="button" onClick={resetDiscovery}>
                  Xóa bộ lọc
                </button>
              ) : (
                <span>Tìm ngay trong dữ liệu đã lưu offline</span>
              )}
            </div>
          </div>

          {visibleArticles.length > 0 ? (
            <div className="book-grid">
              {visibleArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  onOpen={() => openArticle(article.id)}
                  isFavorite={favoriteIds.includes(article.id)}
                  onToggleFavorite={() => toggleFavorite(article.id)}
                  progressPercent={
                    libraryState.progressByArticle[article.id]
                      ?.progressPercent ?? 0
                  }
                  isCompleted={Boolean(
                    libraryState.historyByArticle[article.id]?.completedAt
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="empty-library-state">
              <span aria-hidden="true">⌕</span>
              <strong>Không tìm thấy bài phù hợp.</strong>
              <p>Thử từ khóa khác hoặc xóa các bộ lọc đang chọn.</p>
              <button type="button" onClick={resetDiscovery}>
                Xóa bộ lọc
              </button>
            </div>
          )}
        </section>

      </main>
      <MobileNavigation active="library" reviewCount={reviewCount} />
    </div>
  );
}

function ImportedBooksSection({
  books,
  libraryState,
  openArticle,
  openImport,
  deleteImportedBook
}: {
  books: readonly ImportedBook[];
  libraryState: LibraryState;
  openArticle: (articleId: string) => void;
  openImport: () => void;
  deleteImportedBook: (bookId: string) => Promise<string | null>;
}) {
  const [deletingId, setDeletingId] = useState<string>();
  const [feedback, setFeedback] = useState("");
  const removeBook = async (book: ImportedBook) => {
    const confirmed = window.confirm(
      `Xóa “${book.title}” cùng tiến độ và ngữ cảnh trợ giúp của riêng sách này?`
    );
    if (!confirmed) return;
    setDeletingId(book.id);
    setFeedback("");
    const error = await deleteImportedBook(book.id);
    setDeletingId(undefined);
    setFeedback(error ?? `Đã xóa “${book.title}” khỏi thiết bị.`);
  };
  return (
    <section className="imported-library-section" aria-labelledby="imported-library-heading">
      <div className="section-heading imported-library-heading">
        <div>
          <p className="eyebrow">Nội dung của bạn</p>
          <h2 id="imported-library-heading">Sách tự nhập trên thiết bị</h2>
        </div>
        <button type="button" className="import-library-button" onClick={openImport}>
          <span aria-hidden="true">＋</span> Nhập Paste / TXT / EPUB
        </button>
      </div>
      <p className="automatic-analysis-note">
        Pinyin và nghĩa từ/cụm được phân tích tự động offline; hãy đối chiếu khi cần độ chính xác cao.
      </p>
      {books.length > 0 ? (
        <div className="imported-book-grid">
          {books.map((book) => {
            const progress = libraryState.progressByArticle[book.id]?.progressPercent ?? 0;
            return (
              <article className={`imported-book-card accent-${book.accent}`} key={book.id}>
                <button type="button" className="imported-book-open" onClick={() => openArticle(book.id)}>
                  <span className="automatic-badge">
                    {book.sourceType === "epub" ? "EPUB" : "Tự nhập"} · tự động
                  </span>
                  <h3>{book.title}</h3>
                  <p>{book.author ? `Tác giả: ${book.author}` : book.sourceName ?? "Văn bản đã dán"}</p>
                  <span>
                    {book.characterCount.toLocaleString("vi-VN")} ký tự
                    {book.sourceType === "epub" ? ` · ${book.chapterCount} chương` : ""}
                    {` · khoảng ${book.estimatedMinutes} phút`}
                  </span>
                  {progress > 0 ? (
                    <span className="progress-track" aria-label={`Đã đọc ${progress}%`}>
                      <span style={{ width: `${progress}%` }} />
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  className="imported-book-delete"
                  onClick={() => void removeBook(book)}
                  disabled={deletingId === book.id}
                  aria-label={`Xóa ${book.title}`}
                >
                  {deletingId === book.id ? "Đang xóa…" : "Xóa"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <button type="button" className="empty-imported-library" onClick={openImport}>
          <span aria-hidden="true">文</span>
          <strong>Chưa có sách tự nhập.</strong>
          <p>Dán văn bản, chọn TXT hoặc EPUB; kết quả sẽ mở lại được khi mất mạng.</p>
        </button>
      )}
      <p className="imported-library-feedback" aria-live="polite">{feedback}</p>
    </section>
  );
}

function DiscoverScreen({
  theme,
  toggleTheme,
  openArticleDetails,
  libraryState,
  reviewCount,
  toggleFavorite
}: {
  theme: ReaderTheme;
  toggleTheme: () => void;
  openArticleDetails: (articleId: string) => void;
  libraryState: LibraryState;
  reviewCount: number;
  toggleFavorite: (articleId: string) => void;
}) {
  const [levelFilter, setLevelFilter] =
    useState<DiscoverLevelFilter>("all");
  const [topicFilter, setTopicFilter] =
    useState<DiscoverTopicFilter>("all");
  const [lengthFilter, setLengthFilter] =
    useState<DiscoverLengthFilter>("all");
  const levelCounts = useMemo(
    () => countArticlesByLevel(builtInLibrary),
    []
  );
  const topicCounts = useMemo(
    () => countArticlesByTopic(builtInLibrary),
    []
  );
  const lengthCounts = useMemo(
    () => countArticlesByLength(builtInLibrary),
    []
  );
  const catalogSummary = useMemo(
    () => ({
      levelCount: Object.values(levelCounts).filter((count) => count > 0).length,
      sentenceCount: builtInLibrary.reduce(
        (total, article) => total + getArticleMetadata(article).sentenceCount,
        0
      )
    }),
    [levelCounts]
  );
  const visibleArticles = useMemo(
    () =>
      filterDiscoverArticles(builtInLibrary, {
        level: levelFilter,
        topic: topicFilter,
        length: lengthFilter
      }),
    [lengthFilter, levelFilter, topicFilter]
  );
  const filtersActive =
    levelFilter !== "all" || topicFilter !== "all" || lengthFilter !== "all";
  const resetFilters = () => {
    setLevelFilter("all");
    setTopicFilter("all");
    setLengthFilter("all");
  };

  return (
    <div className="app-shell">
      <Sidebar active="discover" reviewCount={reviewCount} />

      <main id="main-content" className="library-page discover-page" tabIndex={-1}>
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <p className="eyebrow">Khám phá thư viện</p>
          <button
            className="icon-button theme-button"
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "paper" ? "Bật giao diện tối" : "Bật giao diện sáng"
            }
          >
            {theme === "paper" ? "☾" : "☀"}
          </button>
        </header>

        <section className="discover-hero">
          <div>
            <span className="hero-stamp">选择阅读 · Chọn bài phù hợp</span>
            <h1>Chọn nhịp đọc,<br />rồi bắt đầu.</h1>
            <p>
              Lọc {builtInLibrary.length} bài đã được biên soạn theo cấp độ,
              chủ đề và thời lượng. Mọi thông tin này có sẵn ngay cả khi thiết
              bị không có mạng.
            </p>
            <a className="discover-library-link" href="#/">
              Cần tìm một từ hoặc cụm? Mở Thư viện <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="discover-hero-metrics" aria-label="Tóm tắt thư viện offline">
            <div>
              <strong>{builtInLibrary.length}</strong>
              <span>Bài dựng sẵn</span>
            </div>
            <div>
              <strong>{catalogSummary.levelCount}</strong>
              <span>Cấp độ HSK</span>
            </div>
            <div>
              <strong>{catalogSummary.sentenceCount}</strong>
              <span>Câu đã chú giải</span>
            </div>
          </div>
        </section>

        <section className="discover-section" aria-labelledby="discover-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Bộ lọc offline</p>
              <h2 id="discover-heading">Bài đọc cho buổi học này</h2>
            </div>
            <span className="offline-pill">Không cần mạng</span>
          </div>

          <div className="discover-filter-panel">
            <div className="discovery-filter-row">
              <span>Cấp độ</span>
              <div
                className="discovery-filter-buttons"
                role="group"
                aria-label="Lọc Khám phá theo cấp độ HSK"
              >
                {([
                  { value: "all", label: "Tất cả", count: builtInLibrary.length, accent: "all" },
                  { value: "HSK 1", label: "HSK 1", count: levelCounts["HSK 1"], accent: "jade" },
                  { value: "HSK 2", label: "HSK 2", count: levelCounts["HSK 2"], accent: "amber" },
                  { value: "HSK 3", label: "HSK 3", count: levelCounts["HSK 3"], accent: "coral" },
                  { value: "HSK 4", label: "HSK 4", count: levelCounts["HSK 4"], accent: "violet" },
                  { value: "HSK 5", label: "HSK 5", count: levelCounts["HSK 5"], accent: "azure" }
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`level-filter level-${option.accent}${
                      levelFilter === option.value ? " active" : ""
                    }`}
                    aria-pressed={levelFilter === option.value}
                    onClick={() => setLevelFilter(option.value)}
                  >
                    {option.label} <small>{option.count}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="discovery-filter-row">
              <span>Chủ đề</span>
              <div
                className="discovery-filter-buttons"
                role="group"
                aria-label="Lọc Khám phá theo chủ đề"
              >
                <button
                  type="button"
                  className={topicFilter === "all" ? "active" : ""}
                  aria-pressed={topicFilter === "all"}
                  onClick={() => setTopicFilter("all")}
                >
                  Tất cả <small>{builtInLibrary.length}</small>
                </button>
                {articleTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className={topicFilter === topic ? "active" : ""}
                    aria-pressed={topicFilter === topic}
                    onClick={() => setTopicFilter(topic)}
                  >
                    {topic} <small>{topicCounts[topic]}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="discovery-filter-row">
              <span>Độ dài</span>
              <div
                className="discovery-filter-buttons"
                role="group"
                aria-label="Lọc Khám phá theo độ dài bài đọc"
              >
                {([
                  { value: "all", label: "Tất cả", count: builtInLibrary.length },
                  { value: "short", label: "Ngắn · ≤2 phút", count: lengthCounts.short },
                  { value: "medium", label: "Vừa · 3 phút", count: lengthCounts.medium },
                  { value: "long", label: "Dài · ≥4 phút", count: lengthCounts.long }
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={lengthFilter === option.value ? "active" : ""}
                    aria-pressed={lengthFilter === option.value}
                    onClick={() => setLengthFilter(option.value)}
                  >
                    {option.label} <small>{option.count}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="discovery-results">
              <p role="status" aria-live="polite">
                <strong>{visibleArticles.length}</strong> bài phù hợp
              </p>
              {filtersActive ? (
                <button type="button" onClick={resetFilters}>
                  Xóa bộ lọc
                </button>
              ) : (
                <span>Chạm vào bài để xem thông tin trước khi đọc</span>
              )}
            </div>
          </div>

          {visibleArticles.length > 0 ? (
            <div className="book-grid">
              {visibleArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  onOpen={() => openArticleDetails(article.id)}
                  openLabel={`Xem thông tin ${article.titleTranslation}`}
                  isFavorite={libraryState.favoriteArticleIds.includes(article.id)}
                  onToggleFavorite={() => toggleFavorite(article.id)}
                  progressPercent={
                    libraryState.progressByArticle[article.id]?.progressPercent ?? 0
                  }
                  isCompleted={Boolean(
                    libraryState.historyByArticle[article.id]?.completedAt
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="empty-library-state">
              <span aria-hidden="true">◇</span>
              <strong>Chưa có bài khớp cả ba điều kiện.</strong>
              <p>Thử đổi cấp độ, chủ đề hoặc độ dài để xem lại thư viện.</p>
              <button type="button" onClick={resetFilters}>
                Xóa bộ lọc
              </button>
            </div>
          )}
        </section>
      </main>

      <MobileNavigation active="discover" reviewCount={reviewCount} />
    </div>
  );
}

function ArticleDetailScreen({
  article,
  theme,
  toggleTheme,
  goDiscover,
  openArticle,
  isFavorite,
  toggleFavorite,
  progressPercent,
  isCompleted,
  historyEntry,
  reviewCount
}: {
  article: BuiltInArticle;
  theme: ReaderTheme;
  toggleTheme: () => void;
  goDiscover: () => void;
  openArticle: () => void;
  isFavorite: boolean;
  toggleFavorite: () => void;
  progressPercent: number;
  isCompleted: boolean;
  historyEntry: ReadingHistoryEntry | undefined;
  reviewCount: number;
}) {
  const metadata = getArticleMetadata(article);
  const readingState = isCompleted
    ? "Đã hoàn thành"
    : progressPercent > 0
      ? `Đang đọc · ${progressPercent}%`
      : "Chưa bắt đầu";

  return (
    <div className="app-shell">
      <Sidebar active="discover" reviewCount={reviewCount} />

      <main id="main-content" className="library-page article-detail-page" tabIndex={-1}>
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <p className="eyebrow">Thông tin bài đọc</p>
          <button
            className="icon-button theme-button"
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "paper" ? "Bật giao diện tối" : "Bật giao diện sáng"
            }
          >
            {theme === "paper" ? "☾" : "☀"}
          </button>
        </header>

        <button className="detail-back-button" type="button" onClick={goDiscover}>
          <span aria-hidden="true">←</span> Về Khám phá
        </button>

        <section
          className={`article-detail-hero accent-${article.accent}`}
          aria-labelledby="article-detail-title"
        >
          <div className="article-detail-copy">
            <span className="hero-stamp">
              {article.level} · {article.topic} · Offline
            </span>
            <h1 id="article-detail-title" lang="zh-Hans">
              {article.title}
            </h1>
            <p className="article-detail-pinyin">{article.titlePinyin}</p>
            <p className="article-detail-translation">{article.titleTranslation}</p>
            <p className="article-detail-summary">{article.summary}</p>
            <div className="article-detail-actions">
              <button
                className="detail-read-button"
                type="button"
                onClick={openArticle}
                aria-label={`Đọc ngay ${article.titleTranslation}`}
              >
                {progressPercent > 0 && !isCompleted ? "Tiếp tục đọc" : "Đọc ngay"}
                <span aria-hidden="true">→</span>
              </button>
              <button
                className={`detail-favorite-button${isFavorite ? " active" : ""}`}
                type="button"
                onClick={toggleFavorite}
                aria-label={`${isFavorite ? "Bỏ" : "Thêm"} ${article.titleTranslation} ${
                  isFavorite ? "khỏi" : "vào"
                } mục yêu thích`}
                aria-pressed={isFavorite}
              >
                <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
                {isFavorite ? "Đã yêu thích" : "Yêu thích"}
              </button>
            </div>
          </div>
          <button className="detail-hero-back" type="button" onClick={goDiscover}>
            <span aria-hidden="true">←</span> Về Khám phá
          </button>
          <div className="article-detail-glyph" aria-hidden="true">
            {article.title.slice(0, 1)}
          </div>
        </section>

        <section className="article-detail-overview" aria-labelledby="article-overview-heading">
          <div>
            <p className="eyebrow">Trước khi đọc</p>
            <h2 id="article-overview-heading">Vừa đủ để bạn chọn đúng bài</h2>
            <p>
              Đây là thống kê từ dữ liệu đã biên soạn. Mở trang này không thay
              đổi tiến độ; ScottBook chỉ ghi lịch sử khi bạn bắt đầu đọc.
            </p>
          </div>
          <dl className="article-detail-stats" aria-label="Thống kê bài đọc">
            <div>
              <dt>Thời lượng</dt>
              <dd>{article.estimatedMinutes} phút</dd>
              <small>{getArticleLengthLabel(metadata.length)}</small>
            </div>
            <div>
              <dt>Câu</dt>
              <dd>{metadata.sentenceCount}</dd>
              <small>{metadata.paragraphCount} phần nội dung</small>
            </div>
            <div>
              <dt>Cụm đã chú giải</dt>
              <dd>{metadata.wordCount}</dd>
              <small>có pinyin và nghĩa</small>
            </div>
            <div>
              <dt>Hanzi trong bài</dt>
              <dd>{metadata.characterCount}</dd>
              <small>theo từng cụm</small>
            </div>
          </dl>
        </section>

        <section className="article-reading-state" aria-labelledby="article-reading-state-heading">
          <div>
            <p className="eyebrow">Tiến độ trên thiết bị này</p>
            <h2 id="article-reading-state-heading">{readingState}</h2>
            <p>
              {historyEntry
                ? `Bạn đã mở bài này ${historyEntry.openCount} lần. Vị trí đọc gần nhất được giữ trên thiết bị.`
                : "Bạn chưa mở bài này. Khi cần, hãy bắt đầu mà không phải tải thêm dữ liệu."}
            </p>
          </div>
          <div className="article-detail-progress">
            <div
              className="progress-track"
              role="progressbar"
              aria-label={`Tiến độ ${article.titleTranslation}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <span>{progressPercent}% đã đọc</span>
          </div>
        </section>
      </main>

      <MobileNavigation active="discover" reviewCount={reviewCount} />
    </div>
  );
}

const historyDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

function ReviewPracticeScreen({
  preferences,
  toggleTheme,
  assistanceHistory,
  reviewCount,
  markKnown
}: {
  preferences: ReaderPreferences;
  toggleTheme: () => void;
  assistanceHistory: AssistanceHistoryState;
  reviewCount: number;
  markKnown: (itemId: string) => void;
}) {
  const availableQueue = useMemo(
    () => createReviewPracticeQueue(Object.values(assistanceHistory.items)),
    [assistanceHistory.items]
  );
  const [sessionQueue, setSessionQueue] = useState<
    AssistanceReviewItem[] | null
  >(null);
  const queue = sessionQueue ?? availableQueue;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<ReviewPracticeStage>("hanzi");
  const [knownCount, setKnownCount] = useState(0);
  const [revisitCount, setRevisitCount] = useState(0);
  const currentItem = queue[currentIndex];
  const finished = queue.length > 0 && currentIndex >= queue.length;
  const progressPercent =
    queue.length === 0
      ? 0
      : Math.round((Math.min(currentIndex + 1, queue.length) / queue.length) * 100);

  const returnToReview = () => window.location.assign("#/review");
  const moveNext = (remembered: boolean) => {
    if (!currentItem) return;
    setSessionQueue(queue);
    if (remembered) {
      markKnown(currentItem.id);
      setKnownCount((count) => count + 1);
    } else {
      setRevisitCount((count) => count + 1);
    }
    setCurrentIndex((index) => index + 1);
    setStage("hanzi");
  };
  const restart = () => {
    setSessionQueue(
      createReviewPracticeQueue(Object.values(assistanceHistory.items))
    );
    setCurrentIndex(0);
    setStage("hanzi");
    setKnownCount(0);
    setRevisitCount(0);
  };

  return (
    <div className="app-shell">
      <Sidebar active="review" reviewCount={reviewCount} />

      <main
        id="main-content"
        className="library-page practice-page"
        tabIndex={-1}
      >
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <button
            className="practice-back-button"
            type="button"
            onClick={returnToReview}
          >
            ← Về Ôn lại
          </button>
          <button
            className="icon-button theme-button"
            type="button"
            onClick={toggleTheme}
            aria-label={
              preferences.theme === "paper"
                ? "Bật giao diện tối"
                : "Bật giao diện sáng"
            }
          >
            {preferences.theme === "paper" ? "☾" : "☀"}
          </button>
        </header>

        <section className="practice-heading" aria-labelledby="practice-heading">
          <p className="eyebrow">复习 · Ôn từ dấu vết đọc</p>
          <h1 id="practice-heading">Luyện nhanh những chỗ từng vấp.</h1>
          <p>
            Tối đa {MAX_QUICK_REVIEW_ITEMS} mục chưa biết, ưu tiên mục đã ghim
            và những nghĩa bạn từng phải mở nhiều hơn.
          </p>
        </section>

        {queue.length === 0 ? (
          <section className="practice-empty" role="status">
            <span aria-hidden="true">复</span>
            <h2>Chưa có mục nào cần luyện.</h2>
            <p>
              Mở pinyin hoặc nghĩa trong Reader trước; ScottBook sẽ tạo danh
              sách ngay trên thiết bị.
            </p>
            <button type="button" onClick={returnToReview}>
              Về Ôn lại
            </button>
          </section>
        ) : finished ? (
          <section className="practice-finished" aria-live="polite">
            <span aria-hidden="true">✓</span>
            <p className="eyebrow">Hoàn tất phiên</p>
            <h2>Đã đi qua {queue.length} mục.</h2>
            <div className="practice-result-stats">
              <div>
                <strong>{knownCount}</strong>
                <span>Đã nhớ</span>
              </div>
              <div>
                <strong>{revisitCount}</strong>
                <span>Cần ôn lại</span>
              </div>
            </div>
            <p>
              “Đã nhớ” được lưu vào danh sách Ôn lại. “Cần ôn lại” vẫn giữ
              nguyên để xuất hiện trong phiên sau.
            </p>
            <div className="practice-finished-actions">
              <button type="button" onClick={returnToReview}>
                Về Ôn lại
              </button>
              {revisitCount > 0 ? (
                <button type="button" onClick={restart}>
                  Luyện lại mục còn yếu
                </button>
              ) : null}
            </div>
          </section>
        ) : currentItem ? (
          <section className="practice-session" aria-live="polite">
            <div className="practice-progress-copy">
              <span>
                Mục {currentIndex + 1} / {queue.length}
              </span>
              <span>{progressPercent}% phiên ôn</span>
            </div>
            <div
              className="progress-track practice-progress-track"
              role="progressbar"
              aria-label="Tiến độ phiên luyện nhanh"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>

            <article className="practice-card">
              <span className="review-scope-badge">
                {getAssistanceScopeLabel(currentItem.scope)}
              </span>
              <strong lang="zh-Hans">{currentItem.hanzi}</strong>
              {stage !== "hanzi" ? (
                <p className="practice-pinyin">{currentItem.pinyin}</p>
              ) : null}
              {stage === "meaning" ? (
                <div className="practice-meaning">
                  <p>{currentItem.meaning}</p>
                  {currentItem.contexts[0] ? (
                    <blockquote>
                      <span lang="zh-Hans">
                        {currentItem.contexts[0].sentenceText}
                      </span>
                      <span>{currentItem.contexts[0].sentenceTranslation}</span>
                    </blockquote>
                  ) : null}
                </div>
              ) : null}
            </article>

            <div className="practice-actions">
              {stage === "hanzi" ? (
                <button
                  type="button"
                  onClick={() => setStage(advanceReviewPracticeStage(stage))}
                >
                  Hiện pinyin
                </button>
              ) : stage === "pinyin" ? (
                <button
                  type="button"
                  onClick={() => setStage(advanceReviewPracticeStage(stage))}
                >
                  Hiện nghĩa
                </button>
              ) : (
                <>
                  <button
                    className="practice-revisit-button"
                    type="button"
                    onClick={() => moveNext(false)}
                  >
                    Cần ôn lại
                  </button>
                  <button type="button" onClick={() => moveNext(true)}>
                    Đã nhớ
                  </button>
                </>
              )}
            </div>
            <p className="practice-privacy-note">
              Không chấm điểm, không gửi dữ liệu và không tự suy đoán lịch SRS.
            </p>
          </section>
        ) : null}
      </main>

      <MobileNavigation active="review" reviewCount={reviewCount} />
    </div>
  );
}

function ReviewScreen({
  preferences,
  toggleTheme,
  libraryState,
  assistanceHistory,
  importedBooks,
  reviewCount,
  setRecordingEnabled,
  toggleReviewPinned,
  markReviewKnown,
  deleteReviewItem,
  openArticle,
  resetProgress,
  storagePersistence,
  localDataStatus,
  applyBackupRestore,
  undoBackupRestore,
  loadStorageReport,
  clearTranslationCache
}: {
  preferences: ReaderPreferences;
  toggleTheme: () => void;
  libraryState: LibraryState;
  assistanceHistory: AssistanceHistoryState;
  importedBooks: readonly ImportedBook[];
  reviewCount: number;
  setRecordingEnabled: (enabled: boolean) => void;
  toggleReviewPinned: (itemId: string) => void;
  markReviewKnown: (itemId: string, known: boolean) => void;
  deleteReviewItem: (itemId: string) => void;
  openArticle: (articleId: string, contextSentenceId?: string) => void;
  resetProgress: (articleId: string) => void;
  storagePersistence: StoragePersistence;
  localDataStatus: LocalDataStatus;
  applyBackupRestore: (
    data: ScottBookPortableData
  ) => Promise<RestoreTransactionResult>;
  undoBackupRestore: () => Promise<RestoreTransactionResult>;
  loadStorageReport: () => Promise<ScottBookStorageReport>;
  clearTranslationCache: () => Promise<number>;
}) {
  const { theme } = preferences;
  const reviewableItems = Object.values(assistanceHistory.items).filter(
    isReviewableAssistanceItem
  );
  const historyItems: Array<{
    article: BuiltInArticle;
    entry: ReadingHistoryEntry;
  }> = [];
  for (const article of builtInLibrary) {
    const entry = libraryState.historyByArticle[article.id];
    if (entry) historyItems.push({ article, entry });
  }
  historyItems.sort(
    (left, right) => right.entry.lastOpenedAt - left.entry.lastOpenedAt
  );
  const completedCount = historyItems.filter(
    ({ entry }) => entry.completedAt !== null
  ).length;
  const learningProgress = getLearningProgressOverview(
    builtInLibrary,
    libraryState
  );
  const continueArticle = learningProgress.continueArticleId
    ? builtInLibrary.find(
        (article) => article.id === learningProgress.continueArticleId
      )
    : undefined;

  return (
    <div className="app-shell">
      <Sidebar active="review" reviewCount={reviewCount} />

      <main
        id="main-content"
        className="library-page review-page"
        tabIndex={-1}
      >
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <p className="eyebrow">Ôn lại trên thiết bị</p>
          <button
            className="icon-button theme-button"
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "paper"
                ? "Bật giao diện tối"
                : "Bật giao diện sáng"
            }
          >
            {theme === "paper" ? "☾" : "☀"}
          </button>
        </header>

        <section className="review-hero">
          <div>
            <span className="hero-stamp">学习记录 · Học từ lúc đọc</span>
            <h1>Những chỗ bạn đã thật sự cần trợ giúp.</h1>
            <p>
              ScottBook phân biệt lúc bạn chỉ cần cách đọc với lúc bạn cần cả
              nghĩa. Mọi ngữ cảnh đều nằm trên thiết bị này.
            </p>
          </div>
          <div className="review-stats" aria-label="Tóm tắt trợ giúp đọc">
            <div>
              <strong>
                {reviewableItems.filter(
                  (item) => item.knownAt === null && item.meaningCount === 0
                ).length}
              </strong>
              <span>Cần cách đọc</span>
            </div>
            <div>
              <strong>
                {reviewableItems.filter(
                  (item) => item.knownAt === null && item.meaningCount > 0
                ).length}
              </strong>
              <span>Chưa hiểu nghĩa</span>
            </div>
          </div>
        </section>

        <LearningProgressSection
          overview={learningProgress}
          continueArticle={continueArticle}
          openArticle={openArticle}
        />

        <LearningInsightsSection
          assistanceHistory={assistanceHistory}
          openArticle={openArticle}
        />

        <AssistanceReviewSection
          history={assistanceHistory}
          setRecordingEnabled={setRecordingEnabled}
          togglePinned={toggleReviewPinned}
          markKnown={markReviewKnown}
          deleteItem={deleteReviewItem}
          openArticle={openArticle}
        />

        <DataProtectionCard
          libraryState={libraryState}
          assistanceHistory={assistanceHistory}
          importedBooks={importedBooks}
          preferences={preferences}
          storagePersistence={storagePersistence}
          localDataStatus={localDataStatus}
          applyBackupRestore={applyBackupRestore}
          undoBackupRestore={undoBackupRestore}
          loadStorageReport={loadStorageReport}
          clearTranslationCache={clearTranslationCache}
        />

        <section className="history-section" aria-labelledby="history-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Tiến độ</p>
              <h2 id="history-heading">Lịch sử đọc gần đây</h2>
            </div>
            <span className="offline-pill">
              {historyItems.length} bài · {completedCount} hoàn thành
            </span>
          </div>

          {historyItems.length > 0 ? (
            <div className="history-list">
              {historyItems.map(({ article, entry }) => (
                <HistoryCard
                  key={article.id}
                  article={article}
                  entry={entry}
                  progressPercent={
                    libraryState.progressByArticle[article.id]
                      ?.progressPercent ?? 0
                  }
                  onOpen={() => openArticle(article.id)}
                  onReset={() => {
                    const confirmed = window.confirm(
                      `Đặt lại tiến độ “${article.titleTranslation}”? Lịch sử đã mở vẫn được giữ.`
                    );
                    if (confirmed) resetProgress(article.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="empty-history-state">
              <span aria-hidden="true">◎</span>
              <strong>Chưa có lịch sử đọc.</strong>
              <p>Mở một bài trong thư viện, ScottBook sẽ ghi nhớ ngay trên máy.</p>
              <a href="#/">Chọn bài đầu tiên</a>
            </div>
          )}
        </section>
      </main>

      <MobileNavigation active="review" reviewCount={reviewCount} />
    </div>
  );
}

function LearningProgressSection({
  overview,
  continueArticle,
  openArticle
}: {
  overview: LearningProgressOverview;
  continueArticle: BuiltInArticle | undefined;
  openArticle: (articleId: string) => void;
}) {
  return (
    <section
      className="learning-progress-section"
      aria-labelledby="learning-progress-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Toàn thư viện</p>
          <h2 id="learning-progress-heading">Tiến độ học của bạn</h2>
        </div>
        <span className="offline-pill">Tính hoàn toàn trên thiết bị</span>
      </div>

      <div className="learning-progress-layout">
        <div className="learning-progress-summary">
          <div className="learning-progress-percent" aria-hidden="true">
            <strong>{overview.progressPercent}%</strong>
            <span>đã đọc</span>
          </div>
          <div className="learning-progress-copy">
            <p>
              <strong>{overview.completed}</strong> hoàn thành ·{" "}
              <strong>{overview.inProgress}</strong> đang đọc ·{" "}
              <strong>{overview.unread}</strong> chưa đọc
            </p>
            <div
              className="progress-track learning-overall-track"
              role="progressbar"
              aria-label="Tiến độ toàn thư viện"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={overview.progressPercent}
            >
              <span style={{ width: `${overview.progressPercent}%` }} />
            </div>
            {continueArticle ? (
              <button
                type="button"
                onClick={() => openArticle(continueArticle.id)}
                aria-label={`Tiếp tục ${continueArticle.titleTranslation}`}
              >
                Tiếp tục · {continueArticle.titleTranslation}
              </button>
            ) : (
              <a href="#/discover">Chọn bài để bắt đầu</a>
            )}
          </div>
        </div>

        <div className="learning-level-list" aria-label="Tiến độ theo cấp HSK">
          {overview.byLevel.map((level) => (
            <div
              className={`learning-level-row accent-${
                level.level === "HSK 1"
                  ? "jade"
                  : level.level === "HSK 2"
                    ? "amber"
                    : "coral"
              }`}
              key={level.level}
            >
              <div>
                <strong>{level.level}</strong>
                <span>
                  {level.completed}/{level.total} hoàn thành
                  {level.inProgress > 0
                    ? ` · ${level.inProgress} đang đọc`
                    : ""}
                </span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label={`Tiến độ ${level.level}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={level.progressPercent}
              >
                <span style={{ width: `${level.progressPercent}%` }} />
              </div>
              <span>{level.progressPercent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningInsightsSection({
  assistanceHistory,
  openArticle
}: {
  assistanceHistory: AssistanceHistoryState;
  openArticle: (articleId: string) => void;
}) {
  const insights = getArticleAssistanceInsights(
    builtInLibrary,
    assistanceHistory
  ).filter((insight) => insight.assistanceOpens > 0);
  const totalAssistanceOpens = insights.reduce(
    (total, insight) => total + insight.assistanceOpens,
    0
  );

  return (
    <section
      className="learning-insights-section"
      aria-labelledby="learning-insights-heading"
    >
      <div className="section-heading learning-insights-heading">
        <div>
          <p className="eyebrow">Dấu vết theo bài</p>
          <h2 id="learning-insights-heading">
            Bài nào từng cần trợ giúp nhiều?
          </h2>
        </div>
        <span className="offline-pill">
          {insights.length}/{builtInLibrary.length} bài · {totalAssistanceOpens} lượt mở
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="learning-insights-empty" role="status">
          <span aria-hidden="true">读</span>
          <div>
            <strong>Chưa có dấu vết để so sánh.</strong>
            <p>
              Khi bạn mở pinyin hoặc nghĩa trong Reader, thống kê theo bài sẽ
              xuất hiện ở đây mà không gửi dữ liệu khỏi thiết bị.
            </p>
          </div>
          <a href="#/discover">Chọn một bài để đọc</a>
        </div>
      ) : (
        <div className="learning-insights-list">
          {insights.map((insight) => (
            <LearningInsightCard
              key={insight.article.id}
              insight={insight}
              openArticle={openArticle}
            />
          ))}
        </div>
      )}

      <p className="learning-insights-note">
        Tỉ lệ chỉ tính các từ/cụm riêng biệt từng được mở trợ giúp so với từ/cụm
        dựng sẵn trong bài. Đây là dấu vết đọc cục bộ, không phải điểm số hay
        đánh giá trình độ.
      </p>
    </section>
  );
}

function LearningInsightCard({
  insight,
  openArticle
}: {
  insight: ArticleAssistanceInsight;
  openArticle: (articleId: string) => void;
}) {
  const { article } = insight;

  return (
    <article
      className="learning-insight-card"
      aria-label={`Dấu vết trợ giúp bài ${article.titleTranslation}`}
    >
      <div className="learning-insight-title">
        <span className={`level-badge ${article.accent}`}>{article.level}</span>
        <div>
          <h3 lang="zh-Hans">{article.title}</h3>
          <p>
            {article.titlePinyin} · {article.titleTranslation}
          </p>
        </div>
      </div>

      <div className="learning-insight-coverage">
        <strong>{insight.assistedWordPercent}%</strong>
        <span>từ/cụm từng mở trợ giúp</span>
      </div>

      <div
        className="progress-track learning-insight-track"
        role="progressbar"
        aria-label={`Tỉ lệ từ/cụm từng cần trợ giúp trong ${article.titleTranslation}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={insight.assistedWordPercent}
      >
        <span style={{ width: `${insight.assistedWordPercent}%` }} />
      </div>

      <div className="learning-insight-footer">
        <p>
          <strong>
            {insight.assistedWordTypes}/{insight.totalWordTypes}
          </strong>{" "}
          từ/cụm · <strong>{insight.assistanceOpens}</strong> lượt mở ·{" "}
          <strong>{insight.activeReviewItems}</strong> mục đang ôn
          {insight.knownReviewItems > 0
            ? ` · ${insight.knownReviewItems} đã biết`
            : ""}
        </p>
        <button
          type="button"
          onClick={() => openArticle(article.id)}
          aria-label={`Đọc lại ${article.titleTranslation}`}
        >
          Đọc lại <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

function AssistanceReviewSection({
  history,
  setRecordingEnabled,
  togglePinned,
  markKnown,
  deleteItem,
  openArticle
}: {
  history: AssistanceHistoryState;
  setRecordingEnabled: (enabled: boolean) => void;
  togglePinned: (itemId: string) => void;
  markKnown: (itemId: string, known: boolean) => void;
  deleteItem: (itemId: string) => void;
  openArticle: (articleId: string, contextSentenceId?: string) => void;
}) {
  const [filter, setFilter] = useState<AssistanceReviewFilter>("reading");
  const [scope, setScope] = useState<AssistanceReviewScopeFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AssistanceReviewSort>("priority");
  const allItems = Object.values(history.items);
  const counts = countAssistanceReviewItems(allItems);
  const visibleItems = filterAssistanceReviewItems(allItems, {
    filter,
    scope,
    query,
    sort
  });
  const emptyCopy = {
    reading: "Chưa có mục nào bạn chỉ mở pinyin.",
    meaning: "Chưa có mục nào bạn phải mở đến nghĩa.",
    known: "Chưa có mục nào được đánh dấu đã biết."
  }[filter];

  return (
    <section
      className="assistance-review-section"
      aria-labelledby="assistance-review-heading"
    >
      <div className="section-heading assistance-review-heading">
        <div>
          <p className="eyebrow">Dấu vết học tập</p>
          <h2 id="assistance-review-heading">
            Chữ và từ/cụm từng cần trợ giúp
          </h2>
        </div>
        <div className="assistance-review-actions">
          <a href="#/review/practice">
            Luyện nhanh · {counts.reading + counts.meaning} mục
          </a>
          <label className="recording-toggle">
            <input
              type="checkbox"
              checked={history.recordingEnabled}
              onChange={(event) =>
                setRecordingEnabled(event.currentTarget.checked)
              }
            />
            <span>
              <strong>Ghi lịch sử trợ giúp</strong>
              <small>
                {history.recordingEnabled
                  ? "Đang lưu cục bộ"
                  : "Đã tạm dừng"}
              </small>
            </span>
          </label>
        </div>
      </div>

      <div
        className="review-filters"
        role="group"
        aria-label="Lọc từ cần ôn"
      >
        <button
          type="button"
          className={filter === "reading" ? "active" : ""}
          aria-pressed={filter === "reading"}
          onClick={() => setFilter("reading")}
        >
          Cần cách đọc <span>{counts.reading}</span>
        </button>
        <button
          type="button"
          className={filter === "meaning" ? "active" : ""}
          aria-pressed={filter === "meaning"}
          onClick={() => setFilter("meaning")}
        >
          Chưa hiểu nghĩa <span>{counts.meaning}</span>
        </button>
        <button
          type="button"
          className={filter === "known" ? "active" : ""}
          aria-pressed={filter === "known"}
          onClick={() => setFilter("known")}
        >
          Đã biết <span>{counts.known}</span>
        </button>
      </div>

      <div className="review-discovery-controls">
        <label className="review-search-field">
          <span>Tìm trong mục ôn lại</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Hán tự, pinyin hoặc nghĩa"
            aria-label="Tìm trong danh sách ôn lại"
          />
        </label>
        <label className="review-sort-field">
          <span>Sắp xếp</span>
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.currentTarget.value as AssistanceReviewSort)
            }
            aria-label="Sắp xếp danh sách ôn lại"
          >
            <option value="priority">Ưu tiên cần ôn</option>
            <option value="recent">Gặp gần đây</option>
            <option value="alphabetical">Theo Hán tự</option>
          </select>
        </label>
      </div>

      <div
        className="review-scope-filters"
        role="group"
        aria-label="Lọc theo phạm vi trợ giúp"
      >
        {(
          [
            ["all", "Tất cả"],
            ["character", "Chữ"],
            ["word", "Từ/cụm"]
          ] as const
        ).map(([candidateScope, label]) => (
          <button
            key={candidateScope}
            type="button"
            className={scope === candidateScope ? "active" : ""}
            aria-pressed={scope === candidateScope}
            onClick={() => setScope(candidateScope)}
          >
            {label}
          </button>
        ))}
        <p role="status">
          {visibleItems.length} mục phù hợp
        </p>
      </div>

      {visibleItems.length > 0 ? (
        <div className="review-word-list">
          {visibleItems.map((item) => (
            <AssistanceReviewCard
              key={item.id}
              item={item}
              togglePinned={() => togglePinned(item.id)}
              markKnown={(known) => markKnown(item.id, known)}
              deleteItem={() => {
                if (
                  window.confirm(
                    `Xóa “${item.hanzi}” khỏi lịch sử trợ giúp? Sách và tiến độ đọc vẫn được giữ.`
                  )
                ) {
                  deleteItem(item.id);
                }
              }}
              openArticle={openArticle}
            />
          ))}
        </div>
      ) : (
        <div className="empty-review-state" role="status">
          <span aria-hidden="true">字</span>
          <div>
            <strong>
              {query || scope !== "all"
                ? "Không có mục nào khớp bộ lọc hiện tại."
                : emptyCopy}
            </strong>
            <p>
              Chạm vào một từ trong bài đọc; ScottBook chỉ ghi mức trợ giúp bạn
              thực sự đã mở.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function AssistanceReviewCard({
  item,
  togglePinned,
  markKnown,
  deleteItem,
  openArticle
}: {
  item: AssistanceReviewItem;
  togglePinned: () => void;
  markKnown: (known: boolean) => void;
  deleteItem: () => void;
  openArticle: (articleId: string, contextSentenceId?: string) => void;
}) {
  const latestContext = item.contexts[0];
  const article = latestContext
    ? builtInLibrary.find((candidate) => candidate.id === latestContext.articleId)
    : undefined;
  const status =
    item.knownAt !== null
      ? "Đã biết"
      : item.meaningCount > 0
        ? "Chưa hiểu nghĩa"
        : "Cần cách đọc";

  return (
    <article
      className={`review-word-card scope-${item.scope}${item.pinned ? " pinned" : ""}`}
    >
      <header>
        <div className="review-word-identity">
          <strong lang="zh-Hans">{item.hanzi}</strong>
          <div>
            <span>{item.pinyin}</span>
            <p>{item.meaning}</p>
          </div>
        </div>
        <div className="review-word-badges">
          <span className="review-scope-badge">
            {getAssistanceScopeLabel(item.scope)}
          </span>
          <span
            className={`review-word-status${item.knownAt !== null ? " known" : ""}`}
          >
            {status}
          </span>
        </div>
      </header>

      {latestContext ? (
        <blockquote>
          <p lang="zh-Hans">{latestContext.sentenceText}</p>
          <p>{latestContext.sentenceTranslation}</p>
          <footer>
            {article?.titleTranslation ?? (latestContext.articleId.startsWith("imported:")
              ? "Sách tự nhập"
              : "Bài dựng sẵn")} · gặp trong{" "}
            {item.contexts.length} ngữ cảnh
          </footer>
        </blockquote>
      ) : null}

      <div className="review-word-footer">
        <p>
          Mở pinyin <strong>{item.pinyinCount}</strong> lần · mở nghĩa{" "}
          <strong>{item.meaningCount}</strong> lần · gần nhất{" "}
          {historyDateFormatter.format(item.lastSeenAt)}
        </p>
        <div>
          {latestContext ? (
            <button
              type="button"
              onClick={() =>
                openArticle(latestContext.articleId, latestContext.sentenceId)
              }
              aria-label={`Mở đúng câu có ${item.hanzi}`}
            >
              Mở đúng câu
            </button>
          ) : null}
          <button
            type="button"
            aria-pressed={item.pinned}
            aria-label={`${item.pinned ? "Bỏ ghim" : "Ghim"} ${item.hanzi}`}
            onClick={togglePinned}
          >
            {item.pinned ? "Bỏ ghim" : "Ghim"}
          </button>
          <button
            type="button"
            className="known-button"
            aria-label={`${item.knownAt === null ? "Đã biết" : "Cần học lại"} ${item.hanzi}`}
            onClick={() => markKnown(item.knownAt === null)}
          >
            {item.knownAt === null ? "Đã biết" : "Cần học lại"}
          </button>
          <button
            type="button"
            className="delete-review-button"
            onClick={deleteItem}
            aria-label={`Xóa ${item.hanzi} khỏi lịch sử trợ giúp`}
          >
            Xóa
          </button>
        </div>
      </div>
    </article>
  );
}

function DataProtectionCard({
  libraryState,
  assistanceHistory,
  importedBooks,
  preferences,
  storagePersistence,
  localDataStatus,
  applyBackupRestore,
  undoBackupRestore,
  loadStorageReport,
  clearTranslationCache
}: {
  libraryState: LibraryState;
  assistanceHistory: AssistanceHistoryState;
  importedBooks: readonly ImportedBook[];
  preferences: ReaderPreferences;
  storagePersistence: StoragePersistence;
  localDataStatus: LocalDataStatus;
  applyBackupRestore: (
    data: ScottBookPortableData
  ) => Promise<RestoreTransactionResult>;
  undoBackupRestore: () => Promise<RestoreTransactionResult>;
  loadStorageReport: () => Promise<ScottBookStorageReport>;
  clearTranslationCache: () => Promise<number>;
}) {
  const [exportStatus, setExportStatus] = useState<
    "idle" | "working" | "done" | "error"
  >("idle");
  const [diagnosticStatus, setDiagnosticStatus] = useState<
    "idle" | "working" | "done" | "error"
  >("idle");
  const [requestingStorage, setRequestingStorage] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<
    "idle" | "checking" | "applying" | "success" | "undone" | "error"
  >("idle");
  const [restoreMessage, setRestoreMessage] = useState(
    "Chỉ nhận bản sao ScottBook JSON tối đa 32 MB; TXT và EPUB được nhập ở Thư viện."
  );
  const [pendingRestore, setPendingRestore] = useState<{
    fileName: string;
    backup: ScottBookBackup;
    preview: ScottBookBackupPreview;
  } | null>(null);
  const [hasRestoreUndo, setHasRestoreUndo] = useState(
    () => loadScottBookRestoreUndo(window.localStorage) !== null
  );
  const [storageReport, setStorageReport] =
    useState<ScottBookStorageReport | null>(null);
  const [storageReportStatus, setStorageReportStatus] = useState<
    "idle" | "loading" | "clearing" | "ready" | "error"
  >("loading");
  const [storageReportMessage, setStorageReportMessage] = useState("");
  const restoreAttemptRef = useRef(0);
  const storageReportAttemptRef = useRef(0);

  const fetchStorageReport = useCallback(async () => {
    const attempt = ++storageReportAttemptRef.current;
    try {
      const report = await loadStorageReport();
      if (attempt !== storageReportAttemptRef.current) return;
      setStorageReport(report);
      setStorageReportStatus("ready");
    } catch {
      if (attempt !== storageReportAttemptRef.current) return;
      setStorageReportStatus("error");
      setStorageReportMessage("Chưa thể đọc thống kê lưu trữ lúc này.");
    }
  }, [loadStorageReport]);

  const refreshStorageReport = useCallback(async () => {
    setStorageReportMessage("");
    setStorageReportStatus("loading");
    await fetchStorageReport();
  }, [fetchStorageReport]);

  useEffect(() => {
    if (localDataStatus.phase === "checking") return;
    const attempt = ++storageReportAttemptRef.current;
    let active = true;
    void loadStorageReport().then(
      (report) => {
        if (!active || attempt !== storageReportAttemptRef.current) return;
        setStorageReport(report);
        setStorageReportStatus("ready");
      },
      () => {
        if (!active || attempt !== storageReportAttemptRef.current) return;
        setStorageReportStatus("error");
        setStorageReportMessage("Chưa thể đọc thống kê lưu trữ lúc này.");
      }
    );
    return () => {
      active = false;
    };
  }, [loadStorageReport, localDataStatus.phase]);

  const exportBackup = async () => {
    setExportStatus("working");
    try {
      const backup = await createScottBookBackup({
        libraryState,
        preferences,
        assistanceHistory,
        importedBooks: [...importedBooks]
      });
      downloadScottBookBackup(backup);
      setExportStatus("done");
    } catch {
      setExportStatus("error");
    }
  };

  const requestPersistentStorage = async () => {
    setRequestingStorage(true);
    await pwaStatusStore.requestPersistentStorage();
    setRequestingStorage(false);
  };

  const exportLocalDiagnostics = async () => {
    setDiagnosticStatus("working");
    try {
      let latestStorageReport = storageReport;
      if (!latestStorageReport) {
        latestStorageReport = await loadStorageReport();
        setStorageReport(latestStorageReport);
      }
      const report = createLocalDiagnosticReport({
        libraryState,
        assistanceHistory,
        articles: builtInLibrary,
        storageReport: latestStorageReport,
        localData: localDataStatus,
        storagePersistence,
        runtime: readLocalDiagnosticRuntime()
      });
      downloadLocalDiagnosticReport(report);
      setDiagnosticStatus("done");
    } catch {
      setDiagnosticStatus("error");
    }
  };

  const selectRestoreFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const attempt = ++restoreAttemptRef.current;
    setPendingRestore(null);
    const sizeError = getBackupFileSizeError(file.size);
    if (sizeError) {
      setRestoreStatus("error");
      setRestoreMessage(`${sizeError} Dữ liệu hiện tại chưa bị thay đổi.`);
      return;
    }

    setRestoreStatus("checking");
    setRestoreMessage("Đang kiểm tra cấu trúc và checksum SHA-256…");
    try {
      const result = await parseScottBookBackupText(await file.text());
      if (attempt !== restoreAttemptRef.current) return;

      if (!result.ok) {
        setRestoreStatus("error");
        setRestoreMessage(`${result.message} Dữ liệu hiện tại chưa bị thay đổi.`);
        return;
      }

      setPendingRestore({
        fileName: file.name,
        backup: result.backup,
        preview: result.preview
      });
      setRestoreStatus("idle");
      setRestoreMessage(
        "File đã vượt qua kiểm tra. Hãy xem bản tóm tắt trước khi xác nhận."
      );
    } catch {
      if (attempt !== restoreAttemptRef.current) return;
      setRestoreStatus("error");
      setRestoreMessage(
        "Không thể đọc hoặc kiểm tra file này. Dữ liệu hiện tại chưa bị thay đổi."
      );
    }
  };

  const cancelRestore = () => {
    restoreAttemptRef.current += 1;
    setPendingRestore(null);
    setRestoreStatus("idle");
    setRestoreMessage("Đã hủy xem trước; dữ liệu hiện tại chưa bị thay đổi.");
  };

  const confirmRestore = async () => {
    if (!pendingRestore) return;

    setRestoreStatus("applying");
    const result = await applyBackupRestore(pendingRestore.backup.data);

    if (!result.ok) {
      setRestoreStatus("error");
      setRestoreMessage(result.message);
      return;
    }

    setPendingRestore(null);
    setHasRestoreUndo(true);
    setRestoreStatus("success");
    setRestoreMessage(
      "Đã khôi phục bản sao. Bạn có thể hoàn tác một lần về dữ liệu trước đó."
    );
    void refreshStorageReport();
  };

  const undoRestore = async () => {
    setRestoreStatus("applying");
    const result = await undoBackupRestore();

    if (!result.ok) {
      setRestoreStatus("error");
      setRestoreMessage(result.message);
      setHasRestoreUndo(
        loadScottBookRestoreUndo(window.localStorage) !== null
      );
      return;
    }

    setPendingRestore(null);
    setHasRestoreUndo(false);
    setRestoreStatus("undone");
    setRestoreMessage("Đã hoàn tác và trở về dữ liệu trước lần khôi phục gần nhất.");
    void refreshStorageReport();
  };

  const clearCache = async () => {
    setStorageReportStatus("clearing");
    setStorageReportMessage("");
    try {
      const clearedCount = await clearTranslationCache();
      setStorageReportMessage(
        clearedCount > 0
          ? `Đã xóa ${clearedCount} mục cache dịch; sách và tiến độ được giữ nguyên.`
          : "Cache dịch đang trống; sách và tiến độ không bị chạm tới."
      );
      setStorageReportStatus("loading");
      await fetchStorageReport();
    } catch {
      setStorageReportStatus("error");
      setStorageReportMessage(
        "Chưa thể xóa cache. Sách, tiến độ và cài đặt không bị thay đổi."
      );
    }
  };

  const persistenceLabel = {
    checking: "Đang kiểm tra bộ nhớ",
    available: "Bộ nhớ tiêu chuẩn",
    granted: "Lưu trữ bền vững đã bật",
    unsupported: "Trình duyệt tự quản lý bộ nhớ"
  }[storagePersistence];
  const restoreBusy =
    restoreStatus === "checking" || restoreStatus === "applying";

  return (
    <section
      className="data-protection-card"
      aria-labelledby="protection-heading"
    >
      <div className="protection-icon" aria-hidden="true">◇</div>
      <div className="protection-copy">
        <p className="eyebrow">An toàn dữ liệu local</p>
        <h2 id="protection-heading">Bảo vệ tiến độ trước khi cập nhật</h2>
        <p>
          Mỗi lần ghi, ScottBook giữ lại bản hợp lệ trước đó để tự phục hồi.
          Bản xuất JSON có checksum SHA-256; file chỉ được khôi phục sau khi
          kiểm tra xong và bạn xác nhận bản xem trước.
        </p>
        <div className="protection-statuses">
          <span className={storagePersistence === "granted" ? "granted" : ""}>
            <i aria-hidden="true" />
            {persistenceLabel}
          </span>
          <span>
            <i aria-hidden="true" />
            Backup local tự động
          </span>
        </div>
        <p className="export-feedback" aria-live="polite">
          {exportStatus === "done"
            ? "Đã tải bản sao JSON có checksum."
            : exportStatus === "error"
              ? "Chưa thể tạo bản sao. Dữ liệu trong app không bị thay đổi."
              : "Bản sao chứa sách tự nhập, tiến độ, từ cần ôn, yêu thích và giao diện."}
        </p>
        <p
          className={`restore-feedback${restoreStatus === "error" ? " error" : ""}${restoreStatus === "success" || restoreStatus === "undone" ? " success" : ""}`}
          aria-live="polite"
        >
          {restoreMessage}
        </p>
        <p className="diagnostic-feedback" aria-live="polite">
          {diagnosticStatus === "done"
            ? "Đã tải chẩn đoán local đã ẩn nội dung và định danh bài đọc."
            : diagnosticStatus === "error"
              ? "Chưa thể tạo file chẩn đoán; không dữ liệu nào được gửi đi."
              : "Chẩn đoán chỉ chứa phiên bản, số lượng và trạng thái lưu trữ; không có nội dung bài đọc."}
        </p>
      </div>
      <div className="protection-actions">
        {storagePersistence === "available" ? (
          <button
            className="persistence-button"
            type="button"
            onClick={() => void requestPersistentStorage()}
            disabled={requestingStorage}
          >
            {requestingStorage ? "Đang yêu cầu…" : "Bật lưu trữ bền vững"}
          </button>
        ) : null}
        <button
          className="backup-button"
          type="button"
          onClick={() => void exportBackup()}
          disabled={exportStatus === "working"}
        >
          {exportStatus === "working" ? "Đang tạo…" : "Tải bản sao JSON"}
        </button>
        <button
          className="diagnostic-button"
          type="button"
          onClick={() => void exportLocalDiagnostics()}
          disabled={diagnosticStatus === "working"}
        >
          {diagnosticStatus === "working"
            ? "Đang tổng hợp…"
            : "Tải chẩn đoán local"}
        </button>
        <label
          className={`restore-file-button${restoreBusy ? " disabled" : ""}`}
        >
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => void selectRestoreFile(event)}
            disabled={restoreBusy}
          />
          {restoreStatus === "checking"
            ? "Đang kiểm tra…"
            : "Chọn bản sao JSON"}
        </label>
        {hasRestoreUndo ? (
          <button
            className="undo-restore-button"
            type="button"
            onClick={undoRestore}
            disabled={restoreBusy}
          >
            Hoàn tác lần khôi phục
          </button>
        ) : null}
      </div>
      {pendingRestore ? (
        <RestorePreview
          fileName={pendingRestore.fileName}
          preview={pendingRestore.preview}
          applying={restoreStatus === "applying"}
          onCancel={cancelRestore}
          onConfirm={confirmRestore}
        />
      ) : null}
      <StorageOverview
        localDataStatus={localDataStatus}
        report={storageReport}
        status={storageReportStatus}
        message={storageReportMessage}
        onRefresh={() => void refreshStorageReport()}
        onClearCache={() => void clearCache()}
      />
    </section>
  );
}

function formatStorageBytes(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Chưa xác định";
  if (value < 1_024) return `${Math.round(value)} B`;
  if (value < 1_048_576) return `${(value / 1_024).toFixed(1)} KB`;
  if (value < 1_073_741_824) {
    return `${(value / 1_048_576).toFixed(1)} MB`;
  }
  return `${(value / 1_073_741_824).toFixed(1)} GB`;
}

function formatStoragePercent(
  usageBytes: number | null | undefined,
  quotaBytes: number | null | undefined
): string | null {
  if (
    usageBytes === null ||
    usageBytes === undefined ||
    quotaBytes === null ||
    quotaBytes === undefined ||
    quotaBytes <= 0
  ) {
    return null;
  }
  return `${Math.min(100, Math.round((usageBytes / quotaBytes) * 100))}% quota`;
}

function StorageOverview({
  localDataStatus,
  report,
  status,
  message,
  onRefresh,
  onClearCache
}: {
  localDataStatus: LocalDataStatus;
  report: ScottBookStorageReport | null;
  status: "idle" | "loading" | "clearing" | "ready" | "error";
  message: string;
  onRefresh: () => void;
  onClearCache: () => void;
}) {
  const sourceMessage = {
    "local-storage": "Đã chuyển dữ liệu v0.5 hiện có sang IndexedDB.",
    "indexed-db": "Đã nạp bản dữ liệu IndexedDB hợp lệ trên thiết bị.",
    recovered: "Đã cô lập record hỏng và phục hồi từ phần dữ liệu an toàn.",
    default: "Đã khởi tạo kho IndexedDB mới trên thiết bị.",
    fallback: "IndexedDB không khả dụng; ScottBook tiếp tục dùng localStorage."
  }[localDataStatus.source ?? "fallback"];
  const storageBusy = status === "loading" || status === "clearing";
  const storagePercent = formatStoragePercent(
    report?.usageBytes,
    report?.quotaBytes
  );
  const modeLabel =
    localDataStatus.phase === "checking"
      ? "Đang khởi tạo"
      : localDataStatus.phase === "ready"
        ? `IndexedDB v${report?.schemaVersion ?? 4}`
        : "localStorage fallback";

  return (
    <section className="storage-overview" aria-labelledby="storage-overview-heading">
      <div className="storage-overview-heading">
        <div>
          <p className="eyebrow">Kho dữ liệu trên thiết bị</p>
          <h3 id="storage-overview-heading">Dung lượng và vùng cache tách biệt</h3>
          <p>{sourceMessage}</p>
        </div>
        <span
          className={`storage-mode-badge${localDataStatus.phase === "fallback" ? " fallback" : ""}`}
        >
          {modeLabel}
        </span>
      </div>

      <div className="storage-metrics" aria-label="Thống kê kho dữ liệu">
        <div>
          <span>Dung lượng app</span>
          <strong>{formatStorageBytes(report?.usageBytes)}</strong>
          <small className={`storage-pressure ${report?.pressure ?? "unknown"}`}>
            {storagePercent ?? "toàn bộ origin"}
          </small>
        </div>
        <div>
          <span>Cache dịch</span>
          <strong>{report?.cacheCount ?? 0}</strong>
          <small>mục có thể xóa</small>
        </div>
        <div>
          <span>Record cô lập</span>
          <strong>{report?.quarantinedCount ?? 0}</strong>
          <small>
            {localDataStatus.quarantinedThisRun > 0
              ? `${localDataStatus.quarantinedThisRun} mục vừa phát hiện`
              : "không dùng để ghi đè"}
          </small>
        </div>
        <div>
          <span>Từ đã ghi</span>
          <strong>{report?.eventCount ?? 0}</strong>
          <small>lịch sử trợ giúp cục bộ</small>
        </div>
      </div>

      {report?.pressure === "warning" || report?.pressure === "critical" ? (
        <p className={`storage-pressure-note ${report.pressure}`} role="status">
          {report.pressure === "critical"
            ? "Bộ nhớ origin gần đầy. Hãy tải bản sao JSON trước khi xóa cache dịch."
            : "Dung lượng origin đã vượt 80%. Nên tạo bản sao JSON để giữ đường phục hồi."}
        </p>
      ) : null}

      <div className="storage-overview-footer">
        <p>
          Xóa cache chỉ tác động vùng dịch tạm; sách tự nhập, tiến độ, yêu thích
          và cài đặt nằm ở các store khác. Có {report?.bookCount ?? 0} sách tự nhập.
        </p>
        <div>
          <button type="button" onClick={onRefresh} disabled={storageBusy}>
            {status === "loading" ? "Đang đọc…" : "Làm mới"}
          </button>
          <button
            className="clear-cache-button"
            type="button"
            onClick={onClearCache}
            disabled={
              storageBusy ||
              localDataStatus.phase !== "ready" ||
              !report?.indexedDbAvailable
            }
          >
            {status === "clearing" ? "Đang xóa…" : "Xóa cache dịch"}
          </button>
        </div>
      </div>
      <p
        className={`storage-report-feedback${status === "error" ? " error" : ""}`}
        aria-live="polite"
      >
        {message}
      </p>
    </section>
  );
}

function RestorePreview({
  fileName,
  preview,
  applying,
  onCancel,
  onConfirm
}: {
  fileName: string;
  preview: ScottBookBackupPreview;
  applying: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="restore-preview" aria-labelledby="restore-preview-heading">
      <div className="restore-preview-heading">
        <div>
          <span className="verified-badge">✓ Checksum hợp lệ</span>
          <h3 id="restore-preview-heading">Xem trước bản khôi phục</h3>
          <p title={fileName}>{fileName}</p>
        </div>
        <p>
          Xuất {historyDateFormatter.format(new Date(preview.exportedAt))} ·
          ScottBook {preview.appVersion}
        </p>
      </div>

      <div className="restore-preview-stats" aria-label="Dữ liệu trong bản sao">
        <div><strong>{preview.importedBookCount}</strong><span>Sách tự nhập</span></div>
        <div><strong>{preview.historyCount}</strong><span>Bài đã mở</span></div>
        <div><strong>{preview.completedCount}</strong><span>Hoàn thành</span></div>
        <div><strong>{preview.activeProgressCount}</strong><span>Đang đọc</span></div>
        <div><strong>{preview.favoriteCount}</strong><span>Yêu thích</span></div>
      </div>

      <dl className="restore-preferences">
        <div>
          <dt>Giao diện</dt>
          <dd>
            {preview.theme === "paper"
              ? "Sáng · giấy"
              : preview.theme === "night"
                ? "Tối"
                : "OLED · đen"}
          </dd>
        </div>
        <div>
          <dt>Cỡ chữ</dt>
          <dd>{preview.fontSize}px</dd>
        </div>
        <div>
          <dt>Phạm vi trợ giúp</dt>
          <dd>{getAssistanceScopeLabel(preview.assistanceScope)}</dd>
        </div>
        <div>
          <dt>Kiểu chữ</dt>
          <dd>{preview.fontFamily === "serif" ? "Có chân" : "Không chân"}</dd>
        </div>
        <div>
          <dt>Giãn dòng</dt>
          <dd>
            {{ compact: "Gọn", comfortable: "Thoải mái", airy: "Thoáng" }[
              preview.lineHeight
            ]}
          </dd>
        </div>
        <div>
          <dt>Khổ đọc</dt>
          <dd>
            {{ narrow: "Hẹp", balanced: "Cân bằng", wide: "Rộng" }[
              preview.contentWidth
            ]}
          </dd>
        </div>
        <div>
          <dt>Mục cần ôn</dt>
          <dd>{preview.assistanceItemCount}</dd>
        </div>
      </dl>

      <div className="restore-confirmation">
        <p>
          Xác nhận sẽ thay dữ liệu hiện tại bằng bản sao này. ScottBook giữ dữ
          liệu hiện tại để bạn hoàn tác một lần.
        </p>
        <div>
          <button type="button" onClick={onCancel} disabled={applying}>
            Hủy
          </button>
          <button
            className="confirm-restore-button"
            type="button"
            onClick={onConfirm}
            disabled={applying}
          >
            {applying ? "Đang khôi phục…" : "Xác nhận khôi phục"}
          </button>
        </div>
      </div>
    </section>
  );
}

function HistoryCard({
  article,
  entry,
  progressPercent,
  onOpen,
  onReset
}: {
  article: BuiltInArticle;
  entry: ReadingHistoryEntry;
  progressPercent: number;
  onOpen: () => void;
  onReset: () => void;
}) {
  const isCompleted = entry.completedAt !== null;
  const displayProgress = isCompleted ? 100 : progressPercent;
  const canReset = displayProgress > 0;

  return (
    <article className={`history-card accent-${article.accent}`}>
      <div className="history-glyph" aria-hidden="true">
        {article.title.slice(0, 1)}
      </div>
      <div className="history-copy">
        <div className="history-title-row">
          <div>
            <span className="level-badge">{article.level}</span>
            <h3>{article.title}</h3>
            <p>{article.titlePinyin} · {article.titleTranslation}</p>
          </div>
          <span
            className={`history-status${isCompleted ? " completed" : ""}`}
          >
            {isCompleted
              ? "Đã hoàn thành"
              : displayProgress > 0
                ? `Đang đọc · ${displayProgress}%`
                : "Đã mở"}
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label={`Tiến độ ${article.titleTranslation}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={displayProgress}
        >
          <span style={{ width: `${displayProgress}%` }} />
        </div>
        <div className="history-footer">
          <p>
            Gần nhất {historyDateFormatter.format(entry.lastOpenedAt)} · đã mở{" "}
            {entry.openCount} lần
          </p>
          <div className="history-actions">
            {canReset ? (
              <button className="reset-button" type="button" onClick={onReset}>
                Đặt lại
              </button>
            ) : null}
            <button className="resume-button" type="button" onClick={onOpen}>
              {isCompleted
                ? "Đọc lại"
                : displayProgress > 0
                  ? "Tiếp tục"
                  : "Bắt đầu"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ArticleCard({
  article,
  index,
  onOpen,
  openLabel,
  isFavorite,
  onToggleFavorite,
  progressPercent,
  isCompleted
}: {
  article: BuiltInArticle;
  index: number;
  onOpen: () => void;
  openLabel?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  progressPercent: number;
  isCompleted: boolean;
}) {
  const metadata = getArticleMetadata(article);

  return (
    <article
      className={`article-card accent-${article.accent}`}
      style={{ "--delay": `${Math.min(index, 8) * 70}ms` } as React.CSSProperties}
    >
      <button
        className="article-card-open"
        type="button"
        onClick={onOpen}
        aria-label={openLabel ?? `Mở bài ${article.titleTranslation}`}
      >
        <span className="card-topline">
          <span className="level-badge">{article.level}</span>
          <span>{article.estimatedMinutes} phút</span>
        </span>
        <span className="card-glyph" aria-hidden="true">
          {article.title.slice(0, 1)}
        </span>
        <span className="article-title">{article.title}</span>
        <span className="article-pinyin">{article.titlePinyin}</span>
        <span className="article-translation">{article.titleTranslation}</span>
        <span className="article-summary">{article.summary}</span>
        {progressPercent > 0 ? (
          <span
            className="card-progress"
            aria-label={
              isCompleted ? "Đã hoàn thành" : `Đã đọc ${progressPercent}%`
            }
          >
            <span className="progress-copy">
              {isCompleted ? "Đã hoàn thành" : `Đã đọc ${progressPercent}%`}
            </span>
            <span className="progress-track" aria-hidden="true">
              <span style={{ width: `${progressPercent}%` }} />
            </span>
          </span>
        ) : null}
        <span className="card-footer">
          <span>
            {article.topic} · {metadata.wordCount} cụm
          </span>
          <span className="card-arrow">
            <ChevronIcon />
          </span>
        </span>
      </button>
      <button
        className={`favorite-button${isFavorite ? " active" : ""}`}
        type="button"
        onClick={onToggleFavorite}
        aria-label={`${isFavorite ? "Bỏ" : "Thêm"} ${article.titleTranslation} ${
          isFavorite ? "khỏi" : "vào"
        } mục yêu thích`}
        aria-pressed={isFavorite}
      >
        <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
      </button>
    </article>
  );
}

function ContinueReadingCard({
  article,
  progressPercent,
  isCompleted,
  onOpen
}: {
  article: ReaderArticle;
  progressPercent: number;
  isCompleted: boolean;
  onOpen: () => void;
}) {
  return (
    <section
      className={`continue-section accent-${article.accent}`}
      aria-labelledby="continue-heading"
    >
      <div className="continue-glyph" aria-hidden="true">
        {article.title.slice(0, 1)}
      </div>
      <div className="continue-copy">
        <p className="eyebrow">Đọc tiếp trên thiết bị này</p>
        <h2 id="continue-heading">{article.title}</h2>
        <p>
          {isCompleted
            ? "Bạn đã hoàn thành bài này. Có thể đọc lại bất cứ lúc nào."
            : progressPercent > 0
            ? `ScottBook đã giữ lại vị trí gần nhất · ${progressPercent}% bài đọc.`
            : "Bài vừa mở đã sẵn sàng để bạn tiếp tục."}
        </p>
        <span className="progress-track" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </span>
      </div>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Tiếp tục bài ${article.titleTranslation}`}
      >
        {isCompleted
          ? "Đọc lại"
          : progressPercent > 0
            ? "Tiếp tục đọc"
            : "Bắt đầu đọc"}
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

function ReaderScreen({
  article,
  preferences,
  updatePreferences,
  toggleTheme,
  goBack,
  backLabel,
  isFavorite,
  toggleFavorite,
  resumeSentenceId,
  contextSentenceId,
  contextSource,
  progressPercent,
  saveReadingPosition,
  isCompleted,
  completeArticle,
  nextReading,
  openNextArticle,
  saveAssistance,
  openVocabularyContext
}: {
  article: ReaderArticle;
  preferences: ReaderPreferences;
  updatePreferences: (updates: Partial<ReaderPreferences>) => void;
  toggleTheme: () => void;
  goBack: () => void;
  backLabel: "Về thư viện" | "Về Ôn lại" | "Về bài trước";
  isFavorite: boolean;
  toggleFavorite: () => void;
  resumeSentenceId?: string;
  contextSentenceId?: string;
  contextSource?: "review" | "vocabulary";
  progressPercent: number;
  saveReadingPosition: (
    articleId: string,
    sentenceId: string,
    progressPercent: number
  ) => void;
  isCompleted: boolean;
  completeArticle: () => void;
  nextReading: NextReadingChoice | null;
  openNextArticle: () => void;
  saveAssistance: (
    sentence: AnnotatedSentence,
    unit: ReaderAssistanceUnit,
    level: AssistanceLevel
  ) => void;
  openVocabularyContext: (articleId: string, sentenceId: string) => void;
}) {
  const {
    theme,
    fontSize,
    assistanceScope,
    fontFamily,
    lineHeight,
    contentWidth
  } = preferences;
  const [selection, setSelection] = useState<AssistanceSelection | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [vocabularyOpen, setVocabularyOpen] = useState(false);
  const [scopeCompact, setScopeCompact] = useState(false);
  const [vocabularyTargetSentenceId, setVocabularyTargetSentenceId] =
    useState<string>();
  const articleBodyRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const vocabularyButtonRef = useRef<HTMLButtonElement>(null);
  const restoredArticleRef = useRef<string | null>(null);
  const initialResumeSentenceRef = useRef(resumeSentenceId);
  const articleVocabulary = useMemo(
    () => getArticleVocabulary(article),
    [article]
  );
  const importedArticle = isImportedBook(article) ? article : null;

  const selectedContext = findSelectedContext(
    article,
    selection,
    assistanceScope
  );

  const closeAssistance = useCallback((restoreFocus: boolean) => {
    const selectedKey = selection?.key;
    setSelection(null);
    if (!restoreFocus || !selectedKey) return;

    window.requestAnimationFrame(() => {
      const selectedToken = Array.from(
        articleBodyRef.current?.querySelectorAll<HTMLElement>(
          "[data-reader-unit]"
        ) ?? []
      ).find((candidate) => candidate.dataset.assistanceKey === selectedKey);
      selectedToken?.focus();
    });
  }, [selection]);

  useEffect(() => {
    if (!selection) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeAssistance(true);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeAssistance, selection]);

  const closeReaderSettings = useCallback((restoreFocus: boolean) => {
    setSettingsOpen(false);
    if (!restoreFocus) return;
    window.requestAnimationFrame(() => settingsButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("reader-settings")?.focus();
    });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeReaderSettings(true);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeReaderSettings, settingsOpen]);

  const closeArticleVocabulary = useCallback((restoreFocus: boolean) => {
    setVocabularyOpen(false);
    if (!restoreFocus) return;
    window.requestAnimationFrame(() => vocabularyButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!vocabularyOpen) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("reader-vocabulary-search")?.focus();
    });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeArticleVocabulary(true);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeArticleVocabulary, vocabularyOpen]);

  useEffect(() => {
    const handleNativeBack = (event: Event) => {
      if (selection) {
        event.preventDefault();
        closeAssistance(false);
      } else if (settingsOpen) {
        event.preventDefault();
        closeReaderSettings(false);
      } else if (vocabularyOpen) {
        event.preventDefault();
        closeArticleVocabulary(false);
      }
    };
    window.addEventListener(NATIVE_BACK_EVENT, handleNativeBack);
    return () =>
      window.removeEventListener(NATIVE_BACK_EVENT, handleNativeBack);
  }, [
    closeArticleVocabulary,
    closeAssistance,
    closeReaderSettings,
    selection,
    settingsOpen,
    vocabularyOpen
  ]);

  useEffect(() => {
    let frame = 0;
    const updateCompactState = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setScopeCompact(window.scrollY > 260);
      });
    };
    updateCompactState();
    window.addEventListener("scroll", updateCompactState, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateCompactState);
    };
  }, [article.id]);

  const jumpToVocabularySentence = (sentenceId: string) => {
    setVocabularyTargetSentenceId(sentenceId);
    setVocabularyOpen(false);
    setSelection(null);

    window.requestAnimationFrame(() => {
      const sentence = Array.from(
        articleBodyRef.current?.querySelectorAll<HTMLElement>(".sentence") ?? []
      ).find((candidate) => candidate.dataset.sentenceId === sentenceId);
      sentence?.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth"
      });
      sentence?.focus({ preventScroll: true });
    });
  };

  const jumpToImportedChapter = (paragraphId: string) => {
    setSelection(null);
    window.requestAnimationFrame(() => {
      const section = Array.from(
        articleBodyRef.current?.querySelectorAll<HTMLElement>(
          "[data-paragraph-id]"
        ) ?? []
      ).find((candidate) => candidate.dataset.paragraphId === paragraphId);
      section?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth"
      });
      section?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (restoredArticleRef.current === article.id) return;
    restoredArticleRef.current = article.id;

    if (!resumeSentenceId) {
      const frame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const sentence = Array.from(
      articleBodyRef.current?.querySelectorAll<HTMLElement>(".sentence") ?? []
    ).find((candidate) => candidate.dataset.sentenceId === resumeSentenceId);
    if (!sentence) return;

    const frame = window.requestAnimationFrame(() => {
      sentence.scrollIntoView({ block: "center", behavior: "auto" });
      if (contextSentenceId) sentence.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [article.id, contextSentenceId, resumeSentenceId]);

  useEffect(() => {
    const articleBody = articleBodyRef.current;
    if (!articleBody) return;

    const sentenceIds = getArticleSentenceIds(article);
    const sentenceElements = Array.from(
      articleBody.querySelectorAll<HTMLElement>(".sentence")
    );
    if (sentenceElements.length === 0) return;

    const recordSentence = (sentenceId: string) => {
      saveReadingPosition(
        article.id,
        sentenceId,
        getSentenceProgressPercent(sentenceIds, sentenceId)
      );
    };

    if (!("IntersectionObserver" in window)) {
      const fallbackSentenceId =
        initialResumeSentenceRef.current &&
        sentenceIds.includes(initialResumeSentenceRef.current)
          ? initialResumeSentenceRef.current
          : sentenceIds[0];
      if (fallbackSentenceId) recordSentence(fallbackSentenceId);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const readingLine = window.innerHeight * 0.32;
        const nearestSentence = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              Math.abs(left.boundingClientRect.top - readingLine) -
              Math.abs(right.boundingClientRect.top - readingLine)
          )[0]?.target as HTMLElement | undefined;
        const sentenceId = nearestSentence?.dataset.sentenceId;
        if (sentenceId) recordSentence(sentenceId);
      },
      {
        rootMargin: "-20% 0px -62% 0px",
        threshold: [0, 0.25, 0.75]
      }
    );

    sentenceElements.forEach((sentence) => observer.observe(sentence));
    return () => observer.disconnect();
  }, [article, saveReadingPosition]);

  const chooseUnit = (
    sentence: AnnotatedSentence,
    unit: ReaderAssistanceUnit
  ) => {
    const key = getAssistanceUnitKey(sentence, unit);
    const next = advanceAssistance(selection, key);
    setSelection(next);
    if (next) {
      saveAssistance(
        sentence,
        unit,
        next.level === 1 ? "pinyin" : "meaning"
      );
    }
  };

  const scopeCopy = {
    character: { glyph: "字", target: "một chữ", result: "nghĩa" },
    word: { glyph: "词", target: "một từ hoặc cụm", result: "nghĩa" },
    sentence: { glyph: "句", target: "một câu", result: "bản dịch" }
  }[assistanceScope];

  const clampFontSize = (next: number) =>
    Math.min(MAX_READER_FONT_SIZE, Math.max(MIN_READER_FONT_SIZE, next));

  return (
    <div className={`reader-shell accent-${article.accent}`}>
      <header className="reader-toolbar">
        <button
          className="back-button"
          type="button"
          onClick={goBack}
          aria-label={backLabel}
        >
          <span aria-hidden="true">←</span>
          <span>
            {backLabel === "Về Ôn lại"
              ? "Ôn lại"
              : backLabel === "Về bài trước"
                ? "Bài trước"
                : "Thư viện"}
          </span>
        </button>
        <div className="reader-title-small">
          <strong>{article.title}</strong>
          <span>{article.level}</span>
        </div>
        <div className="reader-actions">
          <button
            className={`icon-button reader-favorite${isFavorite ? " active" : ""}`}
            type="button"
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Bỏ bài khỏi yêu thích" : "Thêm bài vào yêu thích"}
            aria-pressed={isFavorite}
          >
            <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
          </button>
          <button
            className="text-control"
            type="button"
            onClick={() =>
              updatePreferences({ fontSize: clampFontSize(fontSize - 2) })
            }
            aria-label="Giảm cỡ chữ"
          >
            A−
          </button>
          <span className="font-size-value" aria-label={`Cỡ chữ ${fontSize}`}>
            {fontSize}
          </span>
          <button
            className="text-control"
            type="button"
            onClick={() =>
              updatePreferences({ fontSize: clampFontSize(fontSize + 2) })
            }
            aria-label="Tăng cỡ chữ"
          >
            A+
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "paper" ? "Bật giao diện tối" : "Bật giao diện sáng"}
          >
            {theme === "paper" ? "☾" : "☀"}
          </button>
          <button
            ref={vocabularyButtonRef}
            className="icon-button reader-vocabulary-button"
            type="button"
            onClick={() => {
              setSelection(null);
              setSettingsOpen(false);
              setVocabularyOpen(true);
            }}
            aria-label="Mở từ trong bài"
            aria-controls="reader-vocabulary"
            aria-expanded={vocabularyOpen}
          >
            <span aria-hidden="true" lang="zh-Hans">词</span>
          </button>
          <button
            ref={settingsButtonRef}
            className="icon-button reader-settings-button"
            type="button"
            onClick={() => {
              setSelection(null);
              setVocabularyOpen(false);
              setSettingsOpen(true);
            }}
            aria-label="Mở cài đặt đọc"
            aria-controls="reader-settings"
            aria-expanded={settingsOpen}
          >
            <span aria-hidden="true">⚙</span>
          </button>
        </div>
        <div
          className="reader-progress"
          role="progressbar"
          aria-label="Tiến độ bài đọc"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        {contextSentenceId ? (
          <div className="reader-context-notice" role="status">
            <span>
              {contextSource === "vocabulary"
                ? "Đã mở ngữ cảnh từ Từ trong bài"
                : "Đã mở đúng câu từ Ôn lại"}
            </span>
            <button type="button" onClick={goBack}>
              {backLabel}
            </button>
          </div>
        ) : null}
      </header>

      <main id="main-content" className="reader-page" tabIndex={-1}>
        <article
          className={`reader-article accent-${article.accent}`}
          data-reader-font={fontFamily}
          data-reader-line-height={lineHeight}
          data-reader-content-width={contentWidth}
          style={
            {
              "--reader-font-size": `${fontSize}px`,
              "--reader-line-height": READER_LINE_HEIGHT_VALUES[lineHeight],
              "--reader-content-width": `${READER_CONTENT_WIDTH_VALUES[contentWidth]}px`
            } as React.CSSProperties
          }
        >
          <header className="article-header">
            <span className="reader-level">{article.level} · {article.topic}</span>
            <h1 lang={"kind" in article ? undefined : "zh-Hans"}>{article.title}</h1>
            {article.titlePinyin ? <p className="title-pinyin">{article.titlePinyin}</p> : null}
            <p className="title-translation">{article.titleTranslation}</p>
            {"kind" in article ? (
              <p className="reader-automatic-warning">
                Phân tích tự động offline · nghĩa từ/cụm có thể sai · chưa dịch cả câu
              </p>
            ) : null}
            <div className="reader-instruction">
              <span className="tap-demo">{scopeCopy.glyph}</span>
              <p>
                <strong>Chạm vào {scopeCopy.target}.</strong><br />
                Lần một hiện {assistanceScope === "sentence"
                  ? "pinyin"
                  : "pinyin + âm Hán-Việt"} · lần hai hiện {scopeCopy.result} ·
                lần ba đóng.
              </p>
            </div>
          </header>

          <ReaderScopeSelector
            scope={assistanceScope}
            compact={scopeCompact}
            onChange={(nextScope) => {
              setSelection(null);
              updatePreferences({ assistanceScope: nextScope });
            }}
          />

          {importedArticle?.sourceType === "epub" &&
          importedArticle.tableOfContents.length > 0 ? (
            <nav className="reader-epub-toc" aria-label="Mục lục EPUB">
              <details>
                <summary>
                  Mục lục · {importedArticle.chapterCount} chương
                </summary>
                <ol>
                  {importedArticle.tableOfContents.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => jumpToImportedChapter(entry.paragraphId)}
                      >
                        {entry.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </details>
            </nav>
          ) : null}

          <div className="article-body" ref={articleBodyRef}>
            {article.paragraphs.map((paragraph) => (
              <section
                className="reader-section"
                key={paragraph.id}
                data-paragraph-id={paragraph.id}
                tabIndex={paragraph.sectionTitle ? -1 : undefined}
              >
                {paragraph.sectionTitle ? (
                  <header className="reader-section-heading">
                    <h2 lang="zh-Hans">{paragraph.sectionTitle}</h2>
                    {paragraph.sectionTitlePinyin ? (
                      <p className="reader-section-pinyin">
                        {paragraph.sectionTitlePinyin}
                      </p>
                    ) : null}
                    {paragraph.sectionTitleTranslation ? (
                      <p className="reader-section-translation">
                        {paragraph.sectionTitleTranslation}
                      </p>
                    ) : null}
                  </header>
                ) : null}
                <p>
                  {paragraph.sentences.map((sentence) => (
                    <SentenceLine
                      key={sentence.id}
                      sentence={sentence}
                      scope={assistanceScope}
                      selection={selection}
                      chooseUnit={chooseUnit}
                      targetSource={
                        sentence.id === contextSentenceId
                          ? contextSource ?? "review"
                          : sentence.id === vocabularyTargetSentenceId
                            ? "vocabulary"
                            : undefined
                      }
                    />
                  ))}
                </p>
              </section>
            ))}
          </div>

          <footer className="article-end">
            <div className="end-seal">
              <span>完</span>
              <p>
                Hết bài · mọi chú thích của bài này đã nằm sẵn trên thiết bị.
              </p>
            </div>
            {isCompleted ? (
              <div className="completion-badge">
                <span aria-hidden="true">✓</span>
                Đã hoàn thành
              </div>
            ) : (
              <button
                className="complete-button"
                type="button"
                onClick={completeArticle}
              >
                <span aria-hidden="true">✓</span>
                Đánh dấu đã đọc xong
              </button>
            )}
          </footer>

          {nextReading ? (
            <NextReadingCard
              choice={nextReading}
              openArticle={openNextArticle}
            />
          ) : null}
        </article>
      </main>

      {settingsOpen ? (
        <>
          <button
            className="reader-settings-scrim"
            type="button"
            aria-label="Đóng cài đặt đọc"
            onClick={() => closeReaderSettings(true)}
          />
          <ReaderSettingsPanel
            preferences={preferences}
            updatePreferences={updatePreferences}
            close={() => closeReaderSettings(true)}
          />
        </>
      ) : null}

      {vocabularyOpen ? (
        <>
          <button
            className="reader-settings-scrim"
            type="button"
            aria-label="Đóng từ trong bài"
            onClick={() => closeArticleVocabulary(true)}
          />
          <ArticleVocabularyPanel
            article={article}
            entries={articleVocabulary}
            close={() => closeArticleVocabulary(true)}
            jumpToSentence={jumpToVocabularySentence}
            jumpToLibrarySentence={openVocabularyContext}
          />
        </>
      ) : null}

      {selection && selectedContext ? (
        <AssistancePanel
          level={selection.level}
          sentence={selectedContext.sentence}
          unit={selectedContext.unit}
          close={() => closeAssistance(true)}
        />
      ) : null}
    </div>
  );
}

function NextReadingCard({
  choice,
  openArticle
}: {
  choice: NextReadingChoice;
  openArticle: () => void;
}) {
  const reasonCopy = {
    new: "Bài chưa đọc tiếp theo",
    "in-progress": "Tiếp tục một bài còn dang dở",
    revisit: "Cả thư viện đã hoàn thành · đọc lại"
  }[choice.reason];

  return (
    <section
      className="reader-next-card"
      aria-labelledby="reader-next-heading"
    >
      <div className="reader-next-glyph" aria-hidden="true">
        {choice.article.title.slice(0, 1)}
      </div>
      <div className="reader-next-copy">
        <p className="eyebrow">{reasonCopy}</p>
        <h2 id="reader-next-heading" lang="zh-Hans">
          {choice.article.title}
        </h2>
        <p className="reader-next-pinyin">{choice.article.titlePinyin}</p>
        <p className="reader-next-translation">
          {choice.article.titleTranslation}
        </p>
        <span>
          {choice.article.level} · {choice.article.topic} · khoảng{" "}
          {choice.article.estimatedMinutes} phút
        </span>
      </div>
      <button
        type="button"
        onClick={openArticle}
        aria-label={`Đọc bài tiếp theo: ${choice.article.titleTranslation}`}
      >
        {choice.reason === "in-progress"
          ? "Tiếp tục đọc"
          : choice.reason === "revisit"
            ? "Đọc lại"
            : "Đọc tiếp"}
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

function ArticleVocabularyPanel({
  article,
  entries,
  close,
  jumpToSentence,
  jumpToLibrarySentence
}: {
  article: ReaderArticle;
  entries: readonly ArticleVocabularyEntry[];
  close: () => void;
  jumpToSentence: (sentenceId: string) => void;
  jumpToLibrarySentence: (articleId: string, sentenceId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState<string>();
  const [contextScope, setContextScope] = useState<"article" | "library">(
    "article"
  );
  const contextBackButtonRef = useRef<HTMLButtonElement>(null);
  const filteredEntries = useMemo(
    () => filterArticleVocabulary(entries, query),
    [entries, query]
  );
  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId);
  const selectedLibraryGroups = useMemo(
    () =>
      selectedEntry
        ? getLibraryVocabularyContexts(builtInLibrary, selectedEntry)
        : [],
    [selectedEntry]
  );
  const orderedSelectedLibraryGroups = [
    ...selectedLibraryGroups.filter((group) => group.articleId === article.id),
    ...selectedLibraryGroups.filter((group) => group.articleId !== article.id)
  ];
  const selectedLibraryOccurrenceCount = selectedLibraryGroups.reduce(
    (total, group) => total + group.occurrences.length,
    0
  );
  const selectedHasAdditionalLibraryContexts = Boolean(
    selectedEntry &&
      selectedLibraryOccurrenceCount > selectedEntry.occurrences.length
  );

  useEffect(() => {
    if (!selectedEntry) return;
    const frame = window.requestAnimationFrame(() => {
      contextBackButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedEntry]);

  const returnToVocabularyList = () => {
    setSelectedEntryId(undefined);
    setContextScope("article");
    window.requestAnimationFrame(() => {
      document.getElementById("reader-vocabulary-search")?.focus();
    });
  };

  return (
    <aside
      id="reader-vocabulary"
      className="reader-vocabulary-panel"
      role="region"
      aria-labelledby="reader-vocabulary-heading"
    >
      <header>
        <div>
          <p className="eyebrow">{article.level} · dữ liệu offline</p>
          <h2 id="reader-vocabulary-heading">Từ trong bài</h2>
          <span>
            {selectedEntry
              ? contextScope === "library"
                ? `${selectedLibraryOccurrenceCount} ngữ cảnh · ${selectedLibraryGroups.length} bài`
                : `${selectedEntry.occurrences.length} ngữ cảnh trong bài`
              : `${entries.length} từ/cụm duy nhất`}
          </span>
        </div>
        <button type="button" onClick={close} aria-label="Đóng từ trong bài">
          ×
        </button>
      </header>

      {selectedEntry ? (
        <>
          <div className="reader-vocabulary-context-heading">
            <button
              ref={contextBackButtonRef}
              type="button"
              onClick={returnToVocabularyList}
              aria-label="Về danh sách từ"
            >
              <span aria-hidden="true">←</span>
              Danh sách từ
            </button>
            <div className="reader-vocabulary-context-entry">
              <strong lang="zh-Hans">{selectedEntry.hanzi}</strong>
              <span>{selectedEntry.pinyin}</span>
              <p>{selectedEntry.meaning}</p>
            </div>
            {selectedHasAdditionalLibraryContexts ? (
              <div
                className="reader-vocabulary-context-scope"
                role="group"
                aria-label={`Phạm vi ngữ cảnh của ${selectedEntry.hanzi}`}
              >
                <button
                  type="button"
                  className={contextScope === "article" ? "active" : ""}
                  aria-pressed={contextScope === "article"}
                  onClick={() => setContextScope("article")}
                >
                  Bài này · {selectedEntry.occurrences.length}
                </button>
                <button
                  type="button"
                  className={contextScope === "library" ? "active" : ""}
                  aria-pressed={contextScope === "library"}
                  onClick={() => setContextScope("library")}
                >
                  Cả thư viện · {selectedLibraryOccurrenceCount}
                </button>
              </div>
            ) : null}
          </div>
          {contextScope === "article" ? (
            <ol
              className="reader-vocabulary-context-list"
              aria-label={`Các ngữ cảnh của ${selectedEntry.hanzi}`}
            >
              {selectedEntry.occurrences.map((occurrence, index) => (
                <li key={`${occurrence.sentenceId}:${index}`}>
                  <VocabularyContextCard
                    entry={selectedEntry}
                    occurrence={occurrence}
                    index={index}
                    total={selectedEntry.occurrences.length}
                    jump={() => jumpToSentence(occurrence.sentenceId)}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <div
              className="reader-vocabulary-library-contexts"
              aria-label={`Các ngữ cảnh toàn thư viện của ${selectedEntry.hanzi}`}
            >
              {orderedSelectedLibraryGroups.map((group) => (
                <section
                  key={group.articleId}
                  className="reader-vocabulary-context-group"
                  aria-label={`Ngữ cảnh trong bài ${group.articleTitleTranslation}`}
                >
                  <header>
                    <div>
                      <span>{group.articleLevel}</span>
                      <h3 lang="zh-Hans">{group.articleTitle}</h3>
                      <p>{group.articleTitleTranslation}</p>
                    </div>
                    <strong>{group.occurrences.length} câu</strong>
                  </header>
                  <ol>
                    {group.occurrences.map((occurrence, index) => (
                      <li
                        key={`${group.articleId}:${occurrence.sentenceId}:${index}`}
                      >
                        <VocabularyContextCard
                          entry={selectedEntry}
                          occurrence={occurrence}
                          index={index}
                          total={group.occurrences.length}
                          articleTitleTranslation={group.articleTitleTranslation}
                          jump={() =>
                            group.articleId === article.id
                              ? jumpToSentence(occurrence.sentenceId)
                              : jumpToLibrarySentence(
                                  group.articleId,
                                  occurrence.sentenceId
                                )
                          }
                        />
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="reader-vocabulary-search">
            <label htmlFor="reader-vocabulary-search">Tìm trong bài này</label>
            <input
              id="reader-vocabulary-search"
              type="search"
              value={query}
              placeholder="Hanzi, pinyin hoặc nghĩa"
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
            <span aria-live="polite">
              {filteredEntries.length}/{entries.length} từ/cụm
            </span>
          </div>
          {filteredEntries.length > 0 ? (
        <ol
          className="reader-vocabulary-list"
          aria-label="Danh sách từ trong bài"
        >
          {filteredEntries.map((entry) => {
            const firstOccurrence = entry.occurrences[0];
            if (!firstOccurrence) return null;
            const opensArticleContexts = entry.occurrences.length > 1;
            return (
              <li key={entry.id}>
                <article>
                  <div className="reader-vocabulary-word">
                    <strong lang="zh-Hans">{entry.hanzi}</strong>
                    <span>{entry.pinyin}</span>
                  </div>
                  <p>{entry.meaning}</p>
                  <button
                    type="button"
                    aria-label={
                      opensArticleContexts
                        ? `Xem ${entry.occurrences.length} ngữ cảnh của ${entry.hanzi}`
                        : `Tìm thêm ngữ cảnh của ${entry.hanzi}`
                    }
                    onClick={() => {
                      if (opensArticleContexts) {
                        setContextScope("article");
                        setSelectedEntryId(entry.id);
                        return;
                      }
                      const libraryGroups = getLibraryVocabularyContexts(
                        builtInLibrary,
                        entry
                      );
                      const libraryOccurrenceCount = libraryGroups.reduce(
                        (total, group) => total + group.occurrences.length,
                        0
                      );
                      if (libraryOccurrenceCount > 1) {
                        setContextScope("library");
                        setSelectedEntryId(entry.id);
                        return;
                      }
                      jumpToSentence(firstOccurrence.sentenceId);
                    }}
                  >
                    {opensArticleContexts
                      ? `${entry.occurrences.length} trong bài`
                      : "Tìm thêm"}
                    <span aria-hidden="true">→</span>
                  </button>
                </article>
              </li>
            );
          })}
        </ol>
          ) : (
            <div className="reader-vocabulary-empty">
              <strong>Không tìm thấy từ/cụm phù hợp</strong>
              <p>Thử Hanzi, pinyin không dấu thanh hoặc nghĩa tiếng Việt.</p>
              <button type="button" onClick={() => setQuery("")}>Xóa tìm kiếm</button>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

function VocabularyContextCard({
  entry,
  occurrence,
  index,
  total,
  articleTitleTranslation,
  jump
}: {
  entry: ArticleVocabularyEntry;
  occurrence: ArticleVocabularyEntry["occurrences"][number];
  index: number;
  total: number;
  articleTitleTranslation?: string;
  jump: () => void;
}) {
  return (
    <article className="reader-vocabulary-context-card">
      <header>
        <span>
          Ngữ cảnh {index + 1}/{total}
        </span>
        <button
          type="button"
          aria-label={
            articleTitleTranslation
              ? `Tới ngữ cảnh ${index + 1} của ${entry.hanzi} trong bài ${articleTitleTranslation}`
              : `Tới ngữ cảnh ${index + 1} của ${entry.hanzi}`
          }
          onClick={jump}
        >
          Tới câu <span aria-hidden="true">→</span>
        </button>
      </header>
      <p className="reader-vocabulary-context-hanzi" lang="zh-Hans">
        {occurrence.sentenceText.split(entry.hanzi).map(
          (part, partIndex, parts) => (
            <span key={`${partIndex}:${part}`}>
              {part}
              {partIndex < parts.length - 1 ? (
                <mark>{entry.hanzi}</mark>
              ) : null}
            </span>
          )
        )}
      </p>
      <p className="reader-vocabulary-context-translation">
        {occurrence.sentenceTranslation}
      </p>
    </article>
  );
}

function ReaderScopeSelector({
  scope,
  compact,
  onChange
}: {
  scope: ReaderAssistanceScope;
  compact: boolean;
  onChange: (scope: ReaderAssistanceScope) => void;
}) {
  const options: Array<{
    value: ReaderAssistanceScope;
    glyph: string;
    label: string;
  }> = [
    { value: "character", glyph: "字", label: "Chữ" },
    { value: "word", glyph: "词", label: "Từ/cụm" },
    { value: "sentence", glyph: "句", label: "Câu" }
  ];

  return (
    <div className="reader-scope-bar" data-compact={compact}>
      <div className="reader-scope-copy" aria-hidden={compact}>
        <strong>Phạm vi trợ giúp</strong>
        <span>Dữ liệu viết sẵn · dùng offline</span>
      </div>
      <div
        className="reader-scope-switch"
        role="group"
        aria-label="Chọn phạm vi trợ giúp đọc"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={scope === option.value ? "active" : ""}
            aria-pressed={scope === option.value}
            aria-label={`${option.label} (${option.glyph})`}
            onClick={() => onChange(option.value)}
          >
            <span className="reader-scope-glyph" lang="zh-Hans">
              {option.glyph}
            </span>
            <span className="reader-scope-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReaderSettingsPanel({
  preferences,
  updatePreferences,
  close
}: {
  preferences: ReaderPreferences;
  updatePreferences: (updates: Partial<ReaderPreferences>) => void;
  close: () => void;
}) {
  const clampFontSize = (next: number) =>
    Math.min(MAX_READER_FONT_SIZE, Math.max(MIN_READER_FONT_SIZE, next));
  const themeOptions: Array<{
    value: ReaderTheme;
    label: string;
    note: string;
  }> = [
    { value: "paper", label: "Giấy", note: "Dịu, sáng" },
    { value: "night", label: "Tối", note: "Xám đen" },
    { value: "oled", label: "OLED", note: "Đen tuyệt đối" }
  ];
  const fontOptions: Array<{ value: ReaderFontFamily; label: string }> = [
    { value: "serif", label: "Có chân" },
    { value: "sans", label: "Không chân" }
  ];
  const lineHeightOptions: Array<{
    value: ReaderLineHeight;
    label: string;
    note: string;
  }> = [
    { value: "compact", label: "Gọn", note: "1.65" },
    { value: "comfortable", label: "Thoải mái", note: "2.05" },
    { value: "airy", label: "Thoáng", note: "2.35" }
  ];
  const widthOptions: Array<{
    value: ReaderContentWidth;
    label: string;
    note: string;
  }> = [
    { value: "narrow", label: "Hẹp", note: "620 px" },
    { value: "balanced", label: "Cân bằng", note: "760 px" },
    { value: "wide", label: "Rộng", note: "920 px" }
  ];

  return (
    <aside
      id="reader-settings"
      className="reader-settings-panel"
      role="region"
      aria-labelledby="reader-settings-heading"
      tabIndex={-1}
    >
      <header>
        <div>
          <p className="eyebrow">Hiển thị trên thiết bị này</p>
          <h2 id="reader-settings-heading">Cài đặt đọc</h2>
        </div>
        <button type="button" onClick={close} aria-label="Đóng cài đặt đọc">
          ×
        </button>
      </header>

      <div className="reader-settings-scroll">
        <section className="reader-setting-section">
          <div className="reader-setting-heading">
            <h3>Giao diện</h3>
            <span>Giấy, tối hoặc đen OLED</span>
          </div>
          <div className="reader-setting-options theme-options" role="group" aria-label="Giao diện đọc">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={preferences.theme === option.value ? "active" : ""}
                data-theme-choice={option.value}
                aria-pressed={preferences.theme === option.value}
                onClick={() => updatePreferences({ theme: option.value })}
              >
                <span className="theme-swatch" aria-hidden="true" />
                <strong>{option.label}</strong>
                <small>{option.note}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="reader-setting-section">
          <div className="reader-setting-heading">
            <h3>Cỡ chữ</h3>
            <output htmlFor="reader-font-size">{preferences.fontSize}px</output>
          </div>
          <div className="reader-font-size-control">
            <button
              type="button"
              aria-label="Giảm cỡ chữ trong cài đặt"
              onClick={() =>
                updatePreferences({
                  fontSize: clampFontSize(preferences.fontSize - 1)
                })
              }
            >
              A−
            </button>
            <input
              id="reader-font-size"
              type="range"
              min={MIN_READER_FONT_SIZE}
              max={MAX_READER_FONT_SIZE}
              step={1}
              value={preferences.fontSize}
              aria-label="Cỡ chữ bài đọc"
              onChange={(event) =>
                updatePreferences({ fontSize: Number(event.target.value) })
              }
            />
            <button
              type="button"
              aria-label="Tăng cỡ chữ trong cài đặt"
              onClick={() =>
                updatePreferences({
                  fontSize: clampFontSize(preferences.fontSize + 1)
                })
              }
            >
              A+
            </button>
          </div>
        </section>

        <section className="reader-setting-section">
          <div className="reader-setting-heading">
            <h3>Kiểu chữ</h3>
            <span>Chỉ áp dụng cho nội dung đọc</span>
          </div>
          <div className="reader-setting-options two-columns" role="group" aria-label="Kiểu chữ bài đọc">
            {fontOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`font-choice ${option.value}${preferences.fontFamily === option.value ? " active" : ""}`}
                aria-pressed={preferences.fontFamily === option.value}
                onClick={() =>
                  updatePreferences({ fontFamily: option.value })
                }
              >
                <span lang="zh-Hans">阅读</span>
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="reader-setting-section">
          <div className="reader-setting-heading">
            <h3>Giãn dòng</h3>
            <span>Khoảng thở giữa các dòng chữ</span>
          </div>
          <div className="reader-setting-options" role="group" aria-label="Độ giãn dòng">
            {lineHeightOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={preferences.lineHeight === option.value ? "active" : ""}
                aria-pressed={preferences.lineHeight === option.value}
                onClick={() =>
                  updatePreferences({ lineHeight: option.value })
                }
              >
                <strong>{option.label}</strong>
                <small>{option.note}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="reader-setting-section">
          <div className="reader-setting-heading">
            <h3>Khổ đọc</h3>
            <span>Tự co vừa màn hình điện thoại</span>
          </div>
          <div className="reader-setting-options" role="group" aria-label="Độ rộng khổ đọc">
            {widthOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={preferences.contentWidth === option.value ? "active" : ""}
                aria-pressed={preferences.contentWidth === option.value}
                onClick={() =>
                  updatePreferences({ contentWidth: option.value })
                }
              >
                <strong>{option.label}</strong>
                <small>{option.note}</small>
              </button>
            ))}
          </div>
        </section>

        <div
          className={`reader-settings-preview font-${preferences.fontFamily}`}
          style={
            {
              "--preview-line-height":
                READER_LINE_HEIGHT_VALUES[preferences.lineHeight]
            } as React.CSSProperties
          }
          aria-label="Xem trước kiểu đọc"
        >
          <span lang="zh-Hans">先理解，再翻译。</span>
          <small>Xiān lǐjiě, zài fānyì.</small>
        </div>
      </div>

      <footer>
        <button
          className="reader-settings-reset"
          type="button"
          onClick={() =>
            updatePreferences({
              theme: DEFAULT_READER_PREFERENCES.theme,
              fontSize: DEFAULT_READER_PREFERENCES.fontSize,
              fontFamily: DEFAULT_READER_PREFERENCES.fontFamily,
              lineHeight: DEFAULT_READER_PREFERENCES.lineHeight,
              contentWidth: DEFAULT_READER_PREFERENCES.contentWidth
            })
          }
        >
          Đặt lại mặc định
        </button>
        <button className="reader-settings-done" type="button" onClick={close}>
          Xong
        </button>
      </footer>
    </aside>
  );
}

function AssistancePanel({
  level,
  sentence,
  unit,
  close
}: {
  level: 1 | 2;
  sentence: AnnotatedSentence;
  unit: ReaderAssistanceUnit;
  close: () => void;
}) {
  const sentenceText = getSentenceText(sentence);
  const scopeLabel = getAssistanceScopeLabel(unit.scope).toLocaleLowerCase(
    "vi-VN"
  );

  return (
    <aside
      id="reader-assistance"
      className="assist-panel"
      role="region"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Trợ giúp ${scopeLabel}`}
    >
      <div className="assist-handle" aria-hidden="true" />
      <div className={`assist-word scope-${unit.scope}`}>
        <span className="assist-hanzi" lang="zh-Hans">{unit.hanzi}</span>
        <div className="assist-pronunciations">
          <div>
            <p className="assist-label">Pinyin</p>
            <strong className="assist-pinyin">{unit.pinyin}</strong>
          </div>
          {unit.scope !== "sentence" && unit.hanViet ? (
            <div>
              <p className="assist-label">Âm Hán-Việt</p>
              <strong
                className="assist-han-viet"
                title={unit.hanVietAmbiguous
                  ? "Chữ này có nhiều âm Hán-Việt; ScottBook giữ lại các khả năng."
                  : undefined}
              >
                {unit.hanViet}
              </strong>
            </div>
          ) : null}
        </div>
      </div>

      {level === 1 ? (
        <p className="assist-hint">
          Chạm lại {scopeLabel} đang chọn để mở{" "}
          {unit.scope === "sentence" ? "bản dịch" : "nghĩa"}.
        </p>
      ) : (
        <div className="assist-details">
          <div>
            <p className="assist-label">
              {unit.scope === "sentence"
                ? sentence.translationStatus === "unavailable-offline"
                  ? "Giới hạn phân tích offline"
                  : "Bản dịch câu"
                : "Nghĩa trong ngữ cảnh"}
            </p>
            <strong className="assist-meaning">{unit.meaning}</strong>
          </div>
          {unit.scope !== "sentence" ? (
            <div className="sentence-translation">
              <p lang="zh-Hans">{sentenceText}</p>
              <strong>{sentence.translation}</strong>
            </div>
          ) : null}
        </div>
      )}

      <button className="assist-close" type="button" onClick={close} aria-label="Đóng trợ giúp">
        ×
      </button>
    </aside>
  );
}

function NotFound({
  goHome,
  isOnline
}: {
  goHome: () => void;
  isOnline: boolean;
}) {
  return (
    <main id="main-content" className="not-found" tabIndex={-1}>
      <span>{isOnline ? "404" : "OFFLINE"}</span>
      <h1>
        {isOnline
          ? "Không tìm thấy bài đọc."
          : "Bài đọc này chưa có trên thiết bị."}
      </h1>
      <p>
        {isOnline
          ? "Liên kết có thể đã sai. Thư viện dựng sẵn vẫn còn nguyên."
          : "Bạn đang ngoại tuyến. Hãy về thư viện để mở một bài đã có sẵn trong ScottBook."}
      </p>
      <button type="button" onClick={goHome}>Về thư viện</button>
    </main>
  );
}

export default App;
