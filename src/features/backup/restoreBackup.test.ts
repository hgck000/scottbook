import { describe, expect, it } from "vitest";
import type { ImportedBook } from "../import/importedBook";
import {
  LIBRARY_STATE_BACKUP_STORAGE_KEY,
  LIBRARY_STATE_STORAGE_KEY,
  createEmptyLibraryState,
  markArticleCompleted,
  markArticleOpened,
  toggleFavoriteArticle,
  updateReadingProgress,
  type LibraryState
} from "../library/readingState";
import {
  READER_ASSISTANCE_SCOPE_STORAGE_KEY,
  READER_CONTENT_WIDTH_STORAGE_KEY,
  READER_FONT_FAMILY_STORAGE_KEY,
  READER_FONT_SIZE_STORAGE_KEY,
  READER_LINE_HEIGHT_STORAGE_KEY,
  READER_THEME_STORAGE_KEY
} from "../preferences/readerPreferences";
import { createEmptyAssistanceHistory } from "../review/assistanceHistory";
import {
  createScottBookBackup,
  type ScottBookBackupData
} from "./exportBackup";
import {
  MAX_BACKUP_FILE_BYTES,
  RESTORE_UNDO_STORAGE_KEY,
  applyScottBookRestore,
  getBackupFileSizeError,
  loadScottBookRestoreUndo,
  parseScottBookBackupText,
  undoLastScottBookRestore
} from "./restoreBackup";

function importedBookFixture(): ImportedBook {
  return {
    id: "imported:backup-fixture",
    kind: "imported",
    schemaVersion: 1,
    sourceType: "paste",
    sourceName: null,
    author: null,
    createdAt: 10,
    updatedAt: 10,
    characterCount: 3,
    annotationSource: "automatic-offline",
    analysisEngineVersion: "pinyin-pro-3.28.0+cvdict-c379d90",
    title: "Bài riêng",
    titlePinyin: "",
    titleTranslation: "Văn bản tự nhập",
    summary: "Phân tích tự động offline.",
    level: "Tự nhập",
    topic: "Phân tích tự động",
    estimatedMinutes: 1,
    accent: "jade",
    paragraphs: [{
      id: "imported:backup-fixture-p0",
      sentences: [{
        id: "imported:backup-fixture-p0-s0",
        translation: "Chưa có bản dịch câu trong chế độ phân tích offline.",
        translationStatus: "unavailable-offline",
        tokens: [{
          id: "imported:backup-fixture-p0-s0-t0",
          kind: "word",
          hanzi: "你好",
          pinyin: "nǐ hǎo",
          meaning: "xin chào",
          characters: [
            { hanzi: "你", pinyin: "nǐ", meaning: "bạn" },
            { hanzi: "好", pinyin: "hǎo", meaning: "tốt" }
          ]
        }, {
          id: "imported:backup-fixture-p0-s0-t1",
          kind: "punctuation",
          hanzi: "。"
        }]
      }]
    }]
  };
}

class MemoryStorage {
  readonly values: Map<string, string>;
  mutationCount = 0;
  failOnMutation: number | null = null;

  constructor(initial: Record<string, string> = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.maybeFail();
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.maybeFail();
    this.values.delete(key);
  }

  entries(): Record<string, string> {
    return Object.fromEntries(this.values);
  }

  private maybeFail(): void {
    this.mutationCount += 1;
    if (this.mutationCount === this.failOnMutation) {
      throw new Error("simulated storage failure");
    }
  }
}

function createCurrentData(): ScottBookBackupData {
  const opened = markArticleOpened(
    toggleFavoriteArticle(createEmptyLibraryState(), "article-a"),
    "article-a",
    100
  );
  return {
    libraryState: updateReadingProgress(opened, {
      articleId: "article-a",
      sentenceId: "s2",
      progressPercent: 50,
      updatedAt: 200
    }),
    preferences: {
      theme: "night",
      fontSize: 28,
      assistanceScope: "word",
      fontFamily: "serif",
      lineHeight: "compact",
      contentWidth: "narrow"
    },
    assistanceHistory: createEmptyAssistanceHistory()
  };
}

function createRestoredData(): ScottBookBackupData {
  const first = markArticleOpened(
    toggleFavoriteArticle(createEmptyLibraryState(), "article-b"),
    "article-b",
    300
  );
  const active = updateReadingProgress(first, {
    articleId: "article-b",
    sentenceId: "s3",
    progressPercent: 75,
    updatedAt: 400
  });
  const second = markArticleOpened(active, "article-c", 500);
  return {
    libraryState: markArticleCompleted(
      second,
      "article-c",
      "s4",
      600
    ),
    preferences: {
      theme: "oled",
      fontSize: 24,
      assistanceScope: "sentence",
      fontFamily: "sans",
      lineHeight: "airy",
      contentWidth: "wide"
    },
    assistanceHistory: createEmptyAssistanceHistory()
  };
}

describe("ScottBook backup restore", () => {
  it("rejects malformed JSON, another format, and unsupported versions", async () => {
    await expect(parseScottBookBackupText("not-json")).resolves.toMatchObject({
      ok: false,
      code: "invalid-json"
    });
    await expect(
      parseScottBookBackupText(JSON.stringify({ format: "another-app" }))
    ).resolves.toMatchObject({ ok: false, code: "invalid-format" });
    await expect(
      parseScottBookBackupText(
        JSON.stringify({ format: "scottbook-backup", formatVersion: 99 })
      )
    ).resolves.toMatchObject({ ok: false, code: "unsupported-version" });
  });

  it("rejects a file changed after its checksum was created", async () => {
    const backup = await createScottBookBackup(createCurrentData());
    const tampered = JSON.parse(JSON.stringify(backup)) as {
      data: { preferences: { fontSize: number } };
    };
    tampered.data.preferences.fontSize = 38;

    await expect(
      parseScottBookBackupText(JSON.stringify(tampered))
    ).resolves.toMatchObject({ ok: false, code: "checksum-mismatch" });
  });

  it("rejects invalid signed data instead of silently repairing it", async () => {
    const invalidState = {
      ...createEmptyLibraryState(),
      favoriteArticleIds: ["article-a", "article-a"]
    } as LibraryState;
    const signed = await createScottBookBackup({
      libraryState: invalidState,
      preferences: {
        theme: "paper",
        fontSize: 25,
        assistanceScope: "word",
        fontFamily: "serif",
        lineHeight: "comfortable",
        contentWidth: "balanced"
      },
      assistanceHistory: createEmptyAssistanceHistory()
    });

    await expect(
      parseScottBookBackupText(JSON.stringify(signed))
    ).resolves.toMatchObject({ ok: false, code: "invalid-data" });
  });

  it("returns a verified preview without writing any data", async () => {
    const backup = await createScottBookBackup(
      createRestoredData(),
      "2026-08-11T03:00:00.000Z"
    );
    const result = await parseScottBookBackupText(JSON.stringify(backup));

    expect(result).toMatchObject({
      ok: true,
      preview: {
        exportedAt: "2026-08-11T03:00:00.000Z",
        favoriteCount: 1,
        historyCount: 2,
        completedCount: 1,
        activeProgressCount: 1,
        assistanceItemCount: 0,
        theme: "oled",
        fontSize: 24,
        assistanceScope: "sentence",
        fontFamily: "sans",
        lineHeight: "airy",
        contentWidth: "wide"
      }
    });
  });

  it("keeps validated imported books in backup v2 and preview", async () => {
    const backup = await createScottBookBackup({
      ...createRestoredData(),
      importedBooks: [importedBookFixture()]
    });
    const result = await parseScottBookBackupText(JSON.stringify(backup));

    expect(result).toMatchObject({
      ok: true,
      preview: { importedBookCount: 1 },
      backup: {
        formatVersion: 2,
        data: { importedBooks: [{ id: "imported:backup-fixture" }] }
      }
    });
  });

  it("migrates a valid v0.9 backup that has no assistance history", async () => {
    const current = await createScottBookBackup(createCurrentData());
    const legacy = JSON.parse(JSON.stringify(current)) as {
      format: string;
      formatVersion: number;
      appVersion: string;
      exportedAt: string;
      data: Record<string, unknown>;
      checksum: { algorithm: "SHA-256"; value: string };
    };
    legacy.formatVersion = 1;
    delete legacy.data.importedBooks;
    delete legacy.data.assistanceHistory;
    const legacyPreferences = legacy.data.preferences as Record<string, unknown>;
    delete legacyPreferences.assistanceScope;
    delete legacyPreferences.fontFamily;
    delete legacyPreferences.lineHeight;
    delete legacyPreferences.contentWidth;
    const unsigned = {
      format: legacy.format,
      formatVersion: legacy.formatVersion,
      appVersion: legacy.appVersion,
      exportedAt: legacy.exportedAt,
      data: legacy.data
    };
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(JSON.stringify(unsigned))
    );
    legacy.checksum.value = Array.from(
      new Uint8Array(digest),
      (byte) => byte.toString(16).padStart(2, "0")
    ).join("");

    const result = await parseScottBookBackupText(JSON.stringify(legacy));
    expect(result).toMatchObject({
      ok: true,
      preview: { assistanceItemCount: 0 },
      backup: {
        data: {
          assistanceHistory: {
            version: 2,
            recordingEnabled: true,
            items: {}
          },
          preferences: {
            theme: "night",
            fontSize: 28,
            assistanceScope: "word",
            fontFamily: "serif",
            lineHeight: "comfortable",
            contentWidth: "balanced"
          }
        }
      }
    });
  });

  it("checks the 32 MB limit before a file is read", () => {
    expect(getBackupFileSizeError(MAX_BACKUP_FILE_BYTES)).toBeNull();
    expect(getBackupFileSizeError(MAX_BACKUP_FILE_BYTES + 1)).toContain(
      "2 MB"
    );
  });

  it("restores all keys together and supports one-level undo", () => {
    const currentData = createCurrentData();
    const restoredData = createRestoredData();
    const storage = new MemoryStorage({
      [LIBRARY_STATE_STORAGE_KEY]: JSON.stringify(currentData.libraryState),
      [LIBRARY_STATE_BACKUP_STORAGE_KEY]: "previous-safety-copy",
      [READER_THEME_STORAGE_KEY]: JSON.stringify(currentData.preferences.theme),
      [READER_FONT_SIZE_STORAGE_KEY]: JSON.stringify(
        currentData.preferences.fontSize
      ),
      [READER_ASSISTANCE_SCOPE_STORAGE_KEY]: JSON.stringify(
        currentData.preferences.assistanceScope
      ),
      [READER_FONT_FAMILY_STORAGE_KEY]: JSON.stringify(
        currentData.preferences.fontFamily
      ),
      [READER_LINE_HEIGHT_STORAGE_KEY]: JSON.stringify(
        currentData.preferences.lineHeight
      ),
      [READER_CONTENT_WIDTH_STORAGE_KEY]: JSON.stringify(
        currentData.preferences.contentWidth
      )
    });

    const restored = applyScottBookRestore(
      storage,
      currentData,
      restoredData,
      "2026-08-11T03:05:00.000Z"
    );

    expect(restored).toEqual({ ok: true, data: restoredData });
    expect(JSON.parse(storage.getItem(LIBRARY_STATE_STORAGE_KEY) ?? "")).toEqual(
      restoredData.libraryState
    );
    expect(
      JSON.parse(storage.getItem(LIBRARY_STATE_BACKUP_STORAGE_KEY) ?? "")
    ).toEqual(currentData.libraryState);
    expect(storage.getItem(READER_ASSISTANCE_SCOPE_STORAGE_KEY)).toBe(
      '"sentence"'
    );
    expect(storage.getItem(READER_THEME_STORAGE_KEY)).toBe('"oled"');
    expect(storage.getItem(READER_FONT_FAMILY_STORAGE_KEY)).toBe('"sans"');
    expect(storage.getItem(READER_LINE_HEIGHT_STORAGE_KEY)).toBe('"airy"');
    expect(storage.getItem(READER_CONTENT_WIDTH_STORAGE_KEY)).toBe('"wide"');
    expect(loadScottBookRestoreUndo(storage)?.data).toEqual(currentData);

    const undone = undoLastScottBookRestore(storage, restoredData);
    expect(undone).toEqual({ ok: true, data: currentData });
    expect(JSON.parse(storage.getItem(LIBRARY_STATE_STORAGE_KEY) ?? "")).toEqual(
      currentData.libraryState
    );
    expect(storage.getItem(READER_THEME_STORAGE_KEY)).toBe('"night"');
    expect(storage.getItem(READER_FONT_SIZE_STORAGE_KEY)).toBe("28");
    expect(storage.getItem(READER_ASSISTANCE_SCOPE_STORAGE_KEY)).toBe(
      '"word"'
    );
    expect(storage.getItem(READER_FONT_FAMILY_STORAGE_KEY)).toBe('"serif"');
    expect(storage.getItem(READER_LINE_HEIGHT_STORAGE_KEY)).toBe('"compact"');
    expect(storage.getItem(READER_CONTENT_WIDTH_STORAGE_KEY)).toBe('"narrow"');
    expect(storage.getItem(RESTORE_UNDO_STORAGE_KEY)).toBeNull();
  });

  it("rolls every raw key back when a restore write fails halfway", () => {
    const currentData = createCurrentData();
    const storage = new MemoryStorage({
      [LIBRARY_STATE_STORAGE_KEY]: JSON.stringify(currentData.libraryState),
      [LIBRARY_STATE_BACKUP_STORAGE_KEY]: "exact-old-backup",
      [READER_THEME_STORAGE_KEY]: '"night"',
      [READER_FONT_SIZE_STORAGE_KEY]: "28",
      [RESTORE_UNDO_STORAGE_KEY]: "exact-old-undo"
    });
    const before = storage.entries();
    storage.failOnMutation = 4;

    const result = applyScottBookRestore(
      storage,
      currentData,
      createRestoredData(),
      "2026-08-11T03:10:00.000Z"
    );

    expect(result).toMatchObject({ ok: false, rollbackSucceeded: true });
    expect(storage.entries()).toEqual(before);
  });

  it("also rolls back cleanly if an undo write fails halfway", () => {
    const currentData = createCurrentData();
    const restoredData = createRestoredData();
    const storage = new MemoryStorage({
      [LIBRARY_STATE_STORAGE_KEY]: JSON.stringify(currentData.libraryState),
      [READER_THEME_STORAGE_KEY]: '"night"',
      [READER_FONT_SIZE_STORAGE_KEY]: "28"
    });
    expect(
      applyScottBookRestore(
        storage,
        currentData,
        restoredData,
        "2026-08-11T03:15:00.000Z"
      ).ok
    ).toBe(true);
    const beforeUndo = storage.entries();
    storage.failOnMutation = storage.mutationCount + 3;

    const result = undoLastScottBookRestore(storage, restoredData);

    expect(result).toMatchObject({ ok: false, rollbackSucceeded: true });
    expect(storage.entries()).toEqual(beforeUndo);
    expect(loadScottBookRestoreUndo(storage)?.data).toEqual(currentData);
  });
});
