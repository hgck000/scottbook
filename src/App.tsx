import { useCallback, useEffect, useRef, useState } from "react";
import { builtInLibrary } from "./content/builtInLibrary";
import type {
  AnnotatedSentence,
  BuiltInArticle
} from "./content/types";
import {
  createScottBookBackup,
  downloadScottBookBackup,
  type ScottBookBackup,
  type ScottBookBackupData
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
  MAX_READER_FONT_SIZE,
  MIN_READER_FONT_SIZE,
  READER_ASSISTANCE_SCOPE_STORAGE_KEY,
  READER_FONT_SIZE_STORAGE_KEY,
  READER_THEME_STORAGE_KEY,
  isReaderFontSize,
  isReaderTheme,
  type ReaderTheme
} from "./features/preferences/readerPreferences";
import {
  deleteAssistanceItem,
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
import { getInstallCopy } from "./features/pwa/installGuidance";
import {
  scottBookRepository,
  type IndexedDbBootstrapResult,
  type ScottBookStorageReport
} from "./features/storage/indexedDbRepository";
import { ScottBookLocalDataCoordinator } from "./features/storage/localDataCoordinator";
import {
  loadLocalDataFallback,
  tryLoadPrimaryLocalData
} from "./features/storage/localDataSnapshot";

type Route =
  | { name: "library" }
  | { name: "review" }
  | { name: "reader"; articleId: string };

type LocalDataStatus = {
  phase: "checking" | "ready" | "fallback";
  source: IndexedDbBootstrapResult["source"] | null;
  quarantinedThisRun: number;
};

function parseRoute(): Route {
  if (window.location.hash === "#/review") return { name: "review" };

  const match = window.location.hash.match(/^#\/read\/(.+)$/);
  return match?.[1]
    ? { name: "reader", articleId: decodeURIComponent(match[1]) }
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
  article: BuiltInArticle,
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
  const [libraryState, setLibraryState] = useState<LibraryState>(
    bootstrapData.fallback.libraryState
  );
  const [assistanceHistory, setAssistanceHistory] =
    useState<AssistanceHistoryState>(
      bootstrapData.fallback.assistanceHistory
    );
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
    route.name === "reader" ? `${route.name}:${route.articleId}` : route.name;
  const routeTitle =
    route.name === "library"
      ? "Thư viện · ScottBook"
      : route.name === "review"
        ? "Ôn lại · ScottBook"
        : "Bài đọc · ScottBook";
  const previousRouteRef = useRef<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
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

  const openArticle = (articleId: string) => {
    setLibraryState((current) =>
      markArticleOpened(current, articleId, Date.now())
    );
    window.location.hash = `/read/${encodeURIComponent(articleId)}`;
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
    setAssistanceHistory(data.assistanceHistory);
  }, [setAssistanceScope, setFontSize, setTheme]);

  useEffect(() => {
    let active = true;
    void localDataCoordinator
      .bootstrap(bootstrapData.fallback, bootstrapData.preferred)
      .then((result) => {
        if (!active) return;
        replaceLocalData(result.data);
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
        preferences: { theme, fontSize, assistanceScope },
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
    assistanceScope,
    fontSize,
    libraryState,
    localDataCoordinator,
    localDataStatus.phase,
    theme
  ]);

  const applyBackupRestore = useCallback(
    async (restoredData: ScottBookBackupData) => {
      const result = await localDataCoordinator.applyRestore(
        {
          libraryState,
          preferences: { theme, fontSize, assistanceScope },
          assistanceHistory
        },
        restoredData
      );
      if (result.ok) replaceLocalData(result.data);
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
      assistanceScope,
      fontSize,
      libraryState,
      localDataCoordinator,
      replaceLocalData,
      theme
    ]
  );

  const undoBackupRestore = useCallback(async () => {
    const result = await localDataCoordinator.undoRestore({
      libraryState,
      preferences: { theme, fontSize, assistanceScope },
      assistanceHistory
    });
    if (result.ok) replaceLocalData(result.data);
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
    assistanceScope,
    fontSize,
    libraryState,
    localDataCoordinator,
    replaceLocalData,
    theme
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
      preferences: { theme, fontSize, assistanceScope },
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
    assistanceScope,
    fontSize,
    libraryState,
    localDataCoordinator,
    theme
  ]);

  const saveAssistance = useCallback(
    (
      article: BuiltInArticle,
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

  const activeReviewCount = Object.values(assistanceHistory.items).filter(
    (item) => item.knownAt === null
  ).length;

  const goHome = () => {
    window.location.hash = "/";
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "paper" ? "night" : "paper"));
  };

  let content;
  if (route.name === "reader") {
    const article = builtInLibrary.find((item) => item.id === route.articleId);
    const readingProgress = article
      ? libraryState.progressByArticle[article.id]
      : undefined;
    content = article ? (
      <ReaderScreen
        key={article.id}
        article={article}
        fontSize={fontSize}
        setFontSize={setFontSize}
        assistanceScope={assistanceScope}
        setAssistanceScope={setAssistanceScope}
        theme={theme}
        toggleTheme={toggleTheme}
        goHome={goHome}
        isFavorite={libraryState.favoriteArticleIds.includes(article.id)}
        toggleFavorite={() => toggleFavorite(article.id)}
        resumeSentenceId={readingProgress?.sentenceId}
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
        saveAssistance={(sentence, unit, level) =>
          saveAssistance(article, sentence, unit, level)
        }
      />
    ) : (
      <NotFound goHome={goHome} isOnline={pwaStatus.isOnline} />
    );
  } else if (route.name === "review") {
    content = (
      <ReviewScreen
        theme={theme}
        fontSize={fontSize}
        assistanceScope={assistanceScope}
        toggleTheme={toggleTheme}
        libraryState={libraryState}
        assistanceHistory={assistanceHistory}
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
        libraryState={libraryState}
        reviewCount={activeReviewCount}
        toggleFavorite={toggleFavorite}
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

      <div
        className={`connection-chip${status.isOnline ? "" : " offline"}`}
        role="status"
      >
        <span aria-hidden="true" />
        {status.isOnline ? "Đã kết nối" : "Đang ngoại tuyến"}
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
  active: "library" | "review";
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
  active: "library" | "review";
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
  libraryState,
  reviewCount,
  toggleFavorite
}: {
  theme: ReaderTheme;
  toggleTheme: () => void;
  openArticle: (articleId: string) => void;
  libraryState: LibraryState;
  reviewCount: number;
  toggleFavorite: (articleId: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const favoriteIds = libraryState.favoriteArticleIds;
  const favoriteArticles = builtInLibrary.filter((article) =>
    favoriteIds.includes(article.id)
  );
  const visibleArticles =
    filter === "favorites"
      ? favoriteArticles
      : builtInLibrary;
  const continueArticle = builtInLibrary.find(
    (article) => article.id === libraryState.lastOpenedArticleId
  );
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

        <section className="library-section" aria-labelledby="reference-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Nội dung dựng sẵn</p>
              <h2 id="reference-heading">Bắt đầu với một đoạn ngắn</h2>
            </div>
            <span className="offline-pill">Không cần mạng</span>
          </div>

          <div className="library-filters" role="group" aria-label="Lọc thư viện">
            <button
              className={filter === "all" ? "active" : ""}
              type="button"
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
            >
              Tất cả <span>{builtInLibrary.length}</span>
            </button>
            <button
              className={filter === "favorites" ? "active" : ""}
              type="button"
              onClick={() => setFilter("favorites")}
              aria-pressed={filter === "favorites"}
            >
              Yêu thích <span>{favoriteArticles.length}</span>
            </button>
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
              <span aria-hidden="true">♡</span>
              <strong>Chưa có bài yêu thích.</strong>
              <p>Nhấn biểu tượng trái tim trên một bài để giữ nó ở đây.</p>
              <button type="button" onClick={() => setFilter("all")}>
                Xem tất cả bài
              </button>
            </div>
          )}
        </section>

        <section className="import-note" aria-labelledby="import-heading">
          <div className="import-mark" aria-hidden="true">＋</div>
          <div>
            <p className="eyebrow">Import nội dung riêng</p>
            <h2 id="import-heading">Chưa vội chọn một cách làm nửa vời.</h2>
            <p>
              ScottBook sẽ chỉ thêm import sau khi cách tách từ, tạo pinyin và
              dịch nội dung ngoài đủ chính xác để không làm hỏng trải nghiệm học.
            </p>
          </div>
          <span className="research-pill">Đang nghiên cứu</span>
        </section>
      </main>
      <MobileNavigation active="library" reviewCount={reviewCount} />
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

function ReviewScreen({
  theme,
  fontSize,
  assistanceScope,
  toggleTheme,
  libraryState,
  assistanceHistory,
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
  theme: ReaderTheme;
  fontSize: number;
  assistanceScope: ReaderAssistanceScope;
  toggleTheme: () => void;
  libraryState: LibraryState;
  assistanceHistory: AssistanceHistoryState;
  reviewCount: number;
  setRecordingEnabled: (enabled: boolean) => void;
  toggleReviewPinned: (itemId: string) => void;
  markReviewKnown: (itemId: string, known: boolean) => void;
  deleteReviewItem: (itemId: string) => void;
  openArticle: (articleId: string) => void;
  resetProgress: (articleId: string) => void;
  storagePersistence: StoragePersistence;
  localDataStatus: LocalDataStatus;
  applyBackupRestore: (
    data: ScottBookBackupData
  ) => Promise<RestoreTransactionResult>;
  undoBackupRestore: () => Promise<RestoreTransactionResult>;
  loadStorageReport: () => Promise<ScottBookStorageReport>;
  clearTranslationCache: () => Promise<number>;
}) {
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
                {Object.values(assistanceHistory.items).filter(
                  (item) => item.knownAt === null && item.meaningCount === 0
                ).length}
              </strong>
              <span>Cần cách đọc</span>
            </div>
            <div>
              <strong>
                {Object.values(assistanceHistory.items).filter(
                  (item) => item.knownAt === null && item.meaningCount > 0
                ).length}
              </strong>
              <span>Chưa hiểu nghĩa</span>
            </div>
          </div>
        </section>

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
          theme={theme}
          fontSize={fontSize}
          assistanceScope={assistanceScope}
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

type AssistanceReviewFilter = "reading" | "meaning" | "known";

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
  openArticle: (articleId: string) => void;
}) {
  const [filter, setFilter] = useState<AssistanceReviewFilter>("reading");
  const allItems = Object.values(history.items);
  const counts = {
    reading: allItems.filter(
      (item) => item.knownAt === null && item.meaningCount === 0
    ).length,
    meaning: allItems.filter(
      (item) => item.knownAt === null && item.meaningCount > 0
    ).length,
    known: allItems.filter((item) => item.knownAt !== null).length
  };
  const visibleItems = allItems
    .filter((item) => {
      if (filter === "known") return item.knownAt !== null;
      if (item.knownAt !== null) return false;
      return filter === "meaning"
        ? item.meaningCount > 0
        : item.meaningCount === 0;
    })
    .sort(
      (left, right) =>
        Number(right.pinned) - Number(left.pinned) ||
        right.lastSeenAt - left.lastSeenAt ||
        left.hanzi.localeCompare(right.hanzi, "zh-Hans")
    );
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
            Chữ, từ và câu từng cần trợ giúp
          </h2>
        </div>
        <label className="recording-toggle">
          <input
            type="checkbox"
            checked={history.recordingEnabled}
            onChange={(event) => setRecordingEnabled(event.currentTarget.checked)}
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
            <strong>{emptyCopy}</strong>
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
  openArticle: (articleId: string) => void;
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
            {article?.titleTranslation ?? "Bài dựng sẵn"} · gặp trong{" "}
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
              onClick={() => openArticle(latestContext.articleId)}
              aria-label={`Mở bài chứa ${item.hanzi}`}
            >
              Mở bài
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
  theme,
  fontSize,
  assistanceScope,
  storagePersistence,
  localDataStatus,
  applyBackupRestore,
  undoBackupRestore,
  loadStorageReport,
  clearTranslationCache
}: {
  libraryState: LibraryState;
  assistanceHistory: AssistanceHistoryState;
  theme: ReaderTheme;
  fontSize: number;
  assistanceScope: ReaderAssistanceScope;
  storagePersistence: StoragePersistence;
  localDataStatus: LocalDataStatus;
  applyBackupRestore: (
    data: ScottBookBackupData
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
    "Chỉ nhận bản sao ScottBook JSON tối đa 2 MB; đây không phải nhập sách TXT/EPUB."
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
        preferences: { theme, fontSize, assistanceScope },
        assistanceHistory
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
              : "Bản sao chứa tiến độ, từ cần ôn, yêu thích và tùy chỉnh giao diện."}
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
        ? `IndexedDB v${report?.schemaVersion ?? 3}`
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
          Xóa cache chỉ tác động vùng dịch tạm; bài đọc, tiến độ, yêu thích và
          cài đặt nằm ở các store khác. Có {report?.bookCount ?? 0} sách ngoài;
          import vẫn đang khóa.
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
        <div><strong>{preview.historyCount}</strong><span>Bài đã mở</span></div>
        <div><strong>{preview.completedCount}</strong><span>Hoàn thành</span></div>
        <div><strong>{preview.activeProgressCount}</strong><span>Đang đọc</span></div>
        <div><strong>{preview.favoriteCount}</strong><span>Yêu thích</span></div>
      </div>

      <dl className="restore-preferences">
        <div>
          <dt>Giao diện</dt>
          <dd>{preview.theme === "paper" ? "Sáng · giấy" : "Tối"}</dd>
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
  isFavorite,
  onToggleFavorite,
  progressPercent,
  isCompleted
}: {
  article: BuiltInArticle;
  index: number;
  onOpen: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  progressPercent: number;
  isCompleted: boolean;
}) {
  const wordCount = article.paragraphs.reduce(
    (total, paragraph) =>
      total +
      paragraph.sentences.reduce(
        (sentenceTotal, sentence) =>
          sentenceTotal + sentence.tokens.filter((token) => token.kind === "word").length,
        0
      ),
    0
  );

  return (
    <article
      className={`article-card accent-${article.accent}`}
      style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
    >
      <button
        className="article-card-open"
        type="button"
        onClick={onOpen}
        aria-label={`Mở bài ${article.titleTranslation}`}
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
            {article.topic} · {wordCount} cụm
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
  article: BuiltInArticle;
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
  fontSize,
  setFontSize,
  assistanceScope,
  setAssistanceScope,
  theme,
  toggleTheme,
  goHome,
  isFavorite,
  toggleFavorite,
  resumeSentenceId,
  progressPercent,
  saveReadingPosition,
  isCompleted,
  completeArticle,
  saveAssistance
}: {
  article: BuiltInArticle;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  assistanceScope: ReaderAssistanceScope;
  setAssistanceScope: React.Dispatch<
    React.SetStateAction<ReaderAssistanceScope>
  >;
  theme: ReaderTheme;
  toggleTheme: () => void;
  goHome: () => void;
  isFavorite: boolean;
  toggleFavorite: () => void;
  resumeSentenceId?: string;
  progressPercent: number;
  saveReadingPosition: (
    articleId: string,
    sentenceId: string,
    progressPercent: number
  ) => void;
  isCompleted: boolean;
  completeArticle: () => void;
  saveAssistance: (
    sentence: AnnotatedSentence,
    unit: ReaderAssistanceUnit,
    level: AssistanceLevel
  ) => void;
}) {
  const [selection, setSelection] = useState<AssistanceSelection | null>(null);
  const articleBodyRef = useRef<HTMLDivElement>(null);
  const restoredArticleRef = useRef<string | null>(null);
  const initialResumeSentenceRef = useRef(resumeSentenceId);

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
        articleBodyRef.current?.querySelectorAll<HTMLButtonElement>(
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

  useEffect(() => {
    if (restoredArticleRef.current === article.id) return;
    restoredArticleRef.current = article.id;

    if (!resumeSentenceId) return;
    const sentence = Array.from(
      articleBodyRef.current?.querySelectorAll<HTMLElement>(".sentence") ?? []
    ).find((candidate) => candidate.dataset.sentenceId === resumeSentenceId);
    if (!sentence) return;

    const frame = window.requestAnimationFrame(() => {
      sentence.scrollIntoView({ block: "center", behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [article.id, resumeSentenceId]);

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
    <div className="reader-shell">
      <header className="reader-toolbar">
        <button
          className="back-button"
          type="button"
          onClick={goHome}
          aria-label="Về thư viện"
        >
          <span aria-hidden="true">←</span>
          <span>Thư viện</span>
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
            onClick={() => setFontSize((size) => clampFontSize(size - 2))}
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
            onClick={() => setFontSize((size) => clampFontSize(size + 2))}
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
      </header>

      <main id="main-content" className="reader-page" tabIndex={-1}>
        <article className="reader-article" style={{ "--reader-font-size": `${fontSize}px` } as React.CSSProperties}>
          <header className="article-header">
            <span className="reader-level">{article.level} · {article.topic}</span>
            <h1 lang="zh-Hans">{article.title}</h1>
            <p className="title-pinyin">{article.titlePinyin}</p>
            <p className="title-translation">{article.titleTranslation}</p>
            <div className="reader-instruction">
              <span className="tap-demo">{scopeCopy.glyph}</span>
              <p>
                <strong>Chạm vào {scopeCopy.target}.</strong><br />
                Lần một hiện pinyin · lần hai hiện {scopeCopy.result} · lần ba
                đóng.
              </p>
            </div>
          </header>

          <ReaderScopeSelector
            scope={assistanceScope}
            onChange={(nextScope) => {
              setSelection(null);
              setAssistanceScope(nextScope);
            }}
          />

          <div className="article-body" ref={articleBodyRef}>
            {article.paragraphs.map((paragraph) => (
              <p key={paragraph.id}>
                {paragraph.sentences.map((sentence) => (
                  <SentenceLine
                    key={sentence.id}
                    sentence={sentence}
                    scope={assistanceScope}
                    selection={selection}
                    chooseUnit={chooseUnit}
                  />
                ))}
              </p>
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
        </article>
      </main>

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

function ReaderScopeSelector({
  scope,
  onChange
}: {
  scope: ReaderAssistanceScope;
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
    <div className="reader-scope-bar">
      <div>
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
            <span lang="zh-Hans">{option.glyph}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
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
        <div>
          <p className="assist-label">Pinyin</p>
          <strong className="assist-pinyin">{unit.pinyin}</strong>
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
                ? "Bản dịch câu"
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
