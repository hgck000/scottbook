import { version as appVersion } from "../../../package.json";
import type { BuiltInArticle } from "../../content/types";
import type { LibraryState } from "../library/readingState";
import type { StoragePersistence } from "../pwa/pwaStatus";
import {
  isReviewableAssistanceItem,
  type AssistanceHistoryState
} from "../review/assistanceHistory";
import type {
  IndexedDbBootstrapResult,
  ScottBookStorageReport
} from "../storage/indexedDbRepository";

export type LocalDiagnosticRuntime = {
  online: boolean;
  displayMode: "standalone" | "browser";
  indexedDbSupported: boolean;
  serviceWorkerSupported: boolean;
  storageManagerSupported: boolean;
  cryptoSupported: boolean;
};

export type LocalDiagnosticInput = {
  libraryState: LibraryState;
  assistanceHistory: AssistanceHistoryState;
  articles: readonly BuiltInArticle[];
  storageReport: ScottBookStorageReport | null;
  localData: {
    phase: "checking" | "ready" | "fallback";
    source: IndexedDbBootstrapResult["source"] | null;
    quarantinedThisRun: number;
  };
  storagePersistence: StoragePersistence;
  runtime: LocalDiagnosticRuntime;
};

export type ScottBookLocalDiagnosticReport = {
  format: "scottbook-local-diagnostics";
  formatVersion: 1;
  appVersion: string;
  generatedAt: string;
  privacy: {
    transmitted: false;
    containsReadingText: false;
    containsArticleIds: false;
    containsUserAgent: false;
  };
  content: {
    builtInArticleCount: number;
    sentenceCount: number;
    wordTokenCount: number;
  };
  reading: {
    favoriteCount: number;
    progressCount: number;
    historyCount: number;
  };
  learning: {
    reviewItemCount: number;
    readingHelpCount: number;
    meaningHelpCount: number;
    knownCount: number;
    characterItemCount: number;
    wordItemCount: number;
    sentenceItemCount: number;
    recordingEnabled: boolean;
  };
  storage: ScottBookStorageReport | null;
  localData: LocalDiagnosticInput["localData"] & {
    storagePersistence: StoragePersistence;
  };
  runtime: LocalDiagnosticRuntime;
};

export function readLocalDiagnosticRuntime(): LocalDiagnosticRuntime {
  const hasWindow = typeof window !== "undefined";
  const hasNavigator = typeof navigator !== "undefined";
  const standalone =
    hasWindow &&
    window.matchMedia?.("(display-mode: standalone)").matches === true;

  return {
    online: hasNavigator ? navigator.onLine : true,
    displayMode: standalone ? "standalone" : "browser",
    indexedDbSupported: typeof globalThis.indexedDB !== "undefined",
    serviceWorkerSupported: hasNavigator && "serviceWorker" in navigator,
    storageManagerSupported: hasNavigator && "storage" in navigator,
    cryptoSupported: typeof globalThis.crypto?.subtle !== "undefined"
  };
}

export function createLocalDiagnosticReport(
  input: LocalDiagnosticInput,
  generatedAt = new Date().toISOString()
): ScottBookLocalDiagnosticReport {
  let sentenceCount = 0;
  let wordTokenCount = 0;
  for (const article of input.articles) {
    for (const paragraph of article.paragraphs) {
      sentenceCount += paragraph.sentences.length;
      for (const sentence of paragraph.sentences) {
        wordTokenCount += sentence.tokens.filter(
          (token) => token.kind === "word"
        ).length;
      }
    }
  }
  const reviewItems = Object.values(input.assistanceHistory.items).filter(
    isReviewableAssistanceItem
  );

  return {
    format: "scottbook-local-diagnostics",
    formatVersion: 1,
    appVersion,
    generatedAt,
    privacy: {
      transmitted: false,
      containsReadingText: false,
      containsArticleIds: false,
      containsUserAgent: false
    },
    content: {
      builtInArticleCount: input.articles.length,
      sentenceCount,
      wordTokenCount
    },
    reading: {
      favoriteCount: input.libraryState.favoriteArticleIds.length,
      progressCount: Object.keys(input.libraryState.progressByArticle).length,
      historyCount: Object.keys(input.libraryState.historyByArticle).length
    },
    learning: {
      reviewItemCount: reviewItems.length,
      readingHelpCount: reviewItems.filter(
        (item) => item.knownAt === null && item.meaningCount === 0
      ).length,
      meaningHelpCount: reviewItems.filter(
        (item) => item.knownAt === null && item.meaningCount > 0
      ).length,
      knownCount: reviewItems.filter((item) => item.knownAt !== null).length,
      characterItemCount: reviewItems.filter(
        (item) => item.scope === "character"
      ).length,
      wordItemCount: reviewItems.filter((item) => item.scope === "word").length,
      // Kept in diagnostics format v1 for older support tooling.
      sentenceItemCount: 0,
      recordingEnabled: input.assistanceHistory.recordingEnabled
    },
    storage: input.storageReport ? { ...input.storageReport } : null,
    localData: {
      ...input.localData,
      storagePersistence: input.storagePersistence
    },
    runtime: { ...input.runtime }
  };
}

export function downloadLocalDiagnosticReport(
  report: ScottBookLocalDiagnosticReport
): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ScottBook-diagnostics-${report.generatedAt.slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
