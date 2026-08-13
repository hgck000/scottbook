import { describe, expect, it } from "vitest";
import { builtInLibrary } from "../../content/builtInLibrary";
import {
  createEmptyLibraryState,
  markArticleOpened,
  toggleFavoriteArticle,
  updateReadingProgress
} from "../library/readingState";
import {
  createEmptyAssistanceHistory,
  recordAssistance
} from "../review/assistanceHistory";
import { createLocalDiagnosticReport } from "./localDiagnostics";

describe("local diagnostic export", () => {
  it("reports counts and storage health without leaking reading content or ids", () => {
    const privateArticleId = "private-article-id-must-not-leak";
    let libraryState = toggleFavoriteArticle(
      createEmptyLibraryState(),
      privateArticleId
    );
    libraryState = markArticleOpened(libraryState, privateArticleId, 100);
    libraryState = updateReadingProgress(libraryState, {
      articleId: privateArticleId,
      sentenceId: "private-sentence-id-must-not-leak",
      progressPercent: 40,
      updatedAt: 200
    });

    const report = createLocalDiagnosticReport(
      {
        libraryState,
        assistanceHistory: recordAssistance(
          createEmptyAssistanceHistory(),
          {
            articleId: privateArticleId,
            sentenceId: "private-sentence-id-must-not-leak",
            sentenceText: "私密句子",
            sentenceTranslation: "câu riêng tư",
            hanzi: "私密",
            pinyin: "sīmì",
            meaning: "riêng tư",
            scope: "word",
            level: "meaning",
            occurredAt: 200
          }
        ),
        articles: builtInLibrary,
        storageReport: {
          indexedDbAvailable: true,
          schemaVersion: 3,
          usageBytes: 8_192,
          quotaBytes: 1_048_576,
          bookCount: 0,
          eventCount: 0,
          cacheCount: 0,
          quarantinedCount: 0,
          pressure: "normal"
        },
        localData: {
          phase: "ready",
          source: "indexed-db",
          quarantinedThisRun: 0
        },
        storagePersistence: "granted",
        runtime: {
          online: false,
          displayMode: "standalone",
          indexedDbSupported: true,
          serviceWorkerSupported: true,
          storageManagerSupported: true,
          cryptoSupported: true
        }
      },
      "2026-08-11T04:00:00.000Z"
    );
    const serialized = JSON.stringify(report);

    expect(report).toMatchObject({
      format: "scottbook-local-diagnostics",
      formatVersion: 1,
      appVersion: "0.25.0",
      generatedAt: "2026-08-11T04:00:00.000Z",
      privacy: {
        transmitted: false,
        containsReadingText: false,
        containsArticleIds: false,
        containsUserAgent: false
      },
      reading: { favoriteCount: 1, progressCount: 1, historyCount: 1 },
      learning: {
        reviewItemCount: 1,
        readingHelpCount: 0,
        meaningHelpCount: 1,
        knownCount: 0,
        characterItemCount: 0,
        wordItemCount: 1,
        sentenceItemCount: 0,
        recordingEnabled: true
      }
    });
    expect(report.content.builtInArticleCount).toBe(builtInLibrary.length);
    expect(report.content.sentenceCount).toBeGreaterThan(0);
    expect(report.content.wordTokenCount).toBeGreaterThan(0);
    expect(serialized).not.toContain(privateArticleId);
    expect(serialized).not.toContain("private-sentence-id-must-not-leak");
    expect(serialized).not.toContain("私密句子");
    expect(serialized).not.toContain(builtInLibrary[0]?.title ?? "missing");
    expect(serialized).not.toMatch(/https?:\/\//);
  });
});
