import { describe, expect, it } from "vitest";
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
  READER_FONT_SIZE_STORAGE_KEY,
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
    preferences: { theme: "night", fontSize: 28 },
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
    preferences: { theme: "paper", fontSize: 24 },
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
      preferences: { theme: "paper", fontSize: 25 },
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
        theme: "paper",
        fontSize: 24
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
    delete legacy.data.assistanceHistory;
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
            version: 1,
            recordingEnabled: true,
            items: {}
          }
        }
      }
    });
  });

  it("checks the 2 MB limit before a file is read", () => {
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
    expect(loadScottBookRestoreUndo(storage)?.data).toEqual(currentData);

    const undone = undoLastScottBookRestore(storage, restoredData);
    expect(undone).toEqual({ ok: true, data: currentData });
    expect(JSON.parse(storage.getItem(LIBRARY_STATE_STORAGE_KEY) ?? "")).toEqual(
      currentData.libraryState
    );
    expect(storage.getItem(READER_THEME_STORAGE_KEY)).toBe('"night"');
    expect(storage.getItem(READER_FONT_SIZE_STORAGE_KEY)).toBe("28");
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
