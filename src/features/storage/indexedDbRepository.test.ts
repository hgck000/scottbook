import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import type { ScottBookBackupData } from "../backup/exportBackup";
import {
  createEmptyLibraryState,
  markArticleOpened,
  toggleFavoriteArticle
} from "../library/readingState";
import {
  SCOTTBOOK_DATABASE_VERSION,
  SCOTTBOOK_STORE_NAMES,
  ScottBookIndexedDbRepository
} from "./indexedDbRepository";

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

function createData(
  articleId: string,
  theme: "paper" | "night" = "paper"
): ScottBookBackupData {
  return {
    libraryState: markArticleOpened(
      toggleFavoriteArticle(createEmptyLibraryState(), articleId),
      articleId,
      100
    ),
    preferences: { theme, fontSize: theme === "paper" ? 25 : 28 }
  };
}

async function createVersionOneFixture(
  factory: IDBFactory,
  databaseName: string,
  libraryValue: unknown,
  preferencesValue: unknown
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = factory.open(databaseName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      database.createObjectStore(SCOTTBOOK_STORE_NAMES.books, { keyPath: "id" });
      const progress = database.createObjectStore(
        SCOTTBOOK_STORE_NAMES.progress,
        { keyPath: "id" }
      );
      const settings = database.createObjectStore(
        SCOTTBOOK_STORE_NAMES.settings,
        { keyPath: "id" }
      );
      database.createObjectStore(SCOTTBOOK_STORE_NAMES.events, {
        keyPath: "id",
        autoIncrement: true
      });
      database.createObjectStore(SCOTTBOOK_STORE_NAMES.cache, { keyPath: "key" });
      database.createObjectStore(SCOTTBOOK_STORE_NAMES.meta, { keyPath: "key" });
      progress.put({ id: "library-state", value: libraryValue, updatedAt: 10 });
      settings.put({
        id: "reader-preferences",
        value: preferencesValue,
        updatedAt: 10
      });
    };
    request.onsuccess = () => {
      request.result.close();
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

async function openDatabase(
  factory: IDBFactory,
  databaseName: string
): Promise<IDBDatabase> {
  return requestResult(factory.open(databaseName));
}

describe("IndexedDB local-data repository", () => {
  it("migrates the complete v0.5 local snapshot and reads it after reopen", async () => {
    const factory = new IDBFactory();
    const databaseName = "migration-from-local-storage";
    const data = createData("article-a", "night");
    const repository = new ScottBookIndexedDbRepository({
      factory,
      databaseName,
      now: () => 1_000
    });

    const migrated = await repository.bootstrap(data, data);
    expect(migrated).toMatchObject({
      available: true,
      source: "local-storage",
      data,
      quarantinedThisRun: 0
    });
    await repository.close();

    const reopened = new ScottBookIndexedDbRepository({ factory, databaseName });
    const loaded = await reopened.bootstrap(
      {
        libraryState: createEmptyLibraryState(),
        preferences: { theme: "paper", fontSize: 25 }
      },
      null
    );
    expect(loaded).toMatchObject({
      available: true,
      source: "indexed-db",
      data
    });
    await reopened.close();
  });

  it("upgrades a v1 fixture to v2 without losing valid records", async () => {
    const factory = new IDBFactory();
    const databaseName = "schema-v1-to-v2";
    const data = createData("article-v1", "night");
    await createVersionOneFixture(
      factory,
      databaseName,
      data.libraryState,
      data.preferences
    );

    const repository = new ScottBookIndexedDbRepository({
      factory,
      databaseName,
      now: () => 2_000
    });
    const result = await repository.bootstrap(data, null);
    expect(result).toMatchObject({
      available: true,
      source: "indexed-db",
      data
    });

    const database = await openDatabase(factory, databaseName);
    expect(database.version).toBe(SCOTTBOOK_DATABASE_VERSION);
    expect(database.objectStoreNames.contains(SCOTTBOOK_STORE_NAMES.quarantine))
      .toBe(true);
    database.close();
    await repository.close();
  });

  it("quarantines one corrupt record and preserves the valid half", async () => {
    const factory = new IDBFactory();
    const databaseName = "corrupt-record-isolation";
    const fallback = createData("safe-fallback", "paper");
    const corruptLibrary = {
      ...fallback.libraryState,
      favoriteArticleIds: ["duplicate", "duplicate"]
    };
    await createVersionOneFixture(
      factory,
      databaseName,
      corruptLibrary,
      { theme: "night", fontSize: 30 }
    );

    const repository = new ScottBookIndexedDbRepository({
      factory,
      databaseName,
      now: () => 3_000
    });
    const result = await repository.bootstrap(fallback, null);
    expect(result).toMatchObject({
      available: true,
      source: "recovered",
      quarantinedThisRun: 1,
      data: {
        libraryState: fallback.libraryState,
        preferences: { theme: "night", fontSize: 30 }
      }
    });

    const report = await repository.getStorageReport();
    expect(report.quarantinedCount).toBe(1);
    await repository.close();
  });

  it("clears only translation cache records", async () => {
    const factory = new IDBFactory();
    const databaseName = "isolated-cache-clear";
    const data = createData("kept-progress", "paper");
    const repository = new ScottBookIndexedDbRepository({ factory, databaseName });
    await repository.bootstrap(data, data);

    const database = await openDatabase(factory, databaseName);
    const transaction = database.transaction(
      [SCOTTBOOK_STORE_NAMES.books, SCOTTBOOK_STORE_NAMES.cache],
      "readwrite"
    );
    const done = transactionDone(transaction);
    transaction.objectStore(SCOTTBOOK_STORE_NAMES.books).put({
      id: "future-book",
      title: "Reserved repository fixture"
    });
    transaction.objectStore(SCOTTBOOK_STORE_NAMES.cache).put({
      key: "zh:vi:fixture",
      value: "bản dịch cache"
    });
    await done;
    database.close();

    await expect(repository.clearTranslationCache()).resolves.toBe(1);
    const report = await repository.getStorageReport(async () => ({
      usage: 4_096,
      quota: 1_048_576
    }));
    expect(report).toMatchObject({
      indexedDbAvailable: true,
      schemaVersion: 2,
      usageBytes: 4_096,
      quotaBytes: 1_048_576,
      bookCount: 1,
      cacheCount: 0
    });

    await repository.close();
    const reopened = new ScottBookIndexedDbRepository({ factory, databaseName });
    const loaded = await reopened.bootstrap(data, null);
    expect(loaded.data.libraryState).toEqual(data.libraryState);
    await reopened.close();
  });

  it("serializes queued writes so the newest snapshot wins", async () => {
    const factory = new IDBFactory();
    const databaseName = "queued-snapshot-writes";
    const first = createData("first");
    const second = createData("second", "night");
    const repository = new ScottBookIndexedDbRepository({ factory, databaseName });
    await repository.bootstrap(first, first);

    await expect(
      Promise.all([
        repository.enqueueSnapshot(first),
        repository.enqueueSnapshot(second)
      ])
    ).resolves.toEqual([true, true]);
    await repository.close();

    const reopened = new ScottBookIndexedDbRepository({ factory, databaseName });
    const loaded = await reopened.bootstrap(first, null);
    expect(loaded.data).toEqual(second);
    await reopened.close();
  });

  it("falls back without blocking the app when IndexedDB is unavailable", async () => {
    const data = createData("fallback-only");
    const repository = new ScottBookIndexedDbRepository({
      factory: undefined,
      databaseName: "unavailable"
    });

    await expect(repository.bootstrap(data, data)).resolves.toEqual({
      available: false,
      data,
      source: "fallback",
      quarantinedThisRun: 0
    });
  });
});
