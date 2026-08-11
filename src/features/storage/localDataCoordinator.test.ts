import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import type { ScottBookBackupData } from "../backup/exportBackup";
import { RESTORE_UNDO_STORAGE_KEY } from "../backup/restoreBackup";
import {
  LIBRARY_STATE_BACKUP_STORAGE_KEY,
  LIBRARY_STATE_STORAGE_KEY,
  createEmptyLibraryState,
  markArticleOpened,
  toggleFavoriteArticle
} from "../library/readingState";
import {
  READER_ASSISTANCE_SCOPE_STORAGE_KEY,
  READER_FONT_SIZE_STORAGE_KEY,
  READER_THEME_STORAGE_KEY
} from "../preferences/readerPreferences";
import {
  ASSISTANCE_HISTORY_BACKUP_STORAGE_KEY,
  ASSISTANCE_HISTORY_STORAGE_KEY,
  createEmptyAssistanceHistory
} from "../review/assistanceHistory";
import { ScottBookIndexedDbRepository } from "./indexedDbRepository";
import { ScottBookLocalDataCoordinator } from "./localDataCoordinator";

class MemoryStorage {
  readonly values: Map<string, string>;

  constructor(initial: Record<string, string> = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  entries(): Record<string, string> {
    return Object.fromEntries(this.values);
  }
}

class FailOnceStorage extends MemoryStorage {
  private failed = false;

  constructor(
    initial: Record<string, string>,
    private readonly failedKey: string
  ) {
    super(initial);
  }

  override setItem(key: string, value: string): void {
    if (key === this.failedKey && !this.failed) {
      this.failed = true;
      throw new Error("simulated localStorage rejection");
    }
    super.setItem(key, value);
  }
}

class ControllableRepository extends ScottBookIndexedDbRepository {
  failQueuedWrites = false;

  override enqueueSnapshot(data: ScottBookBackupData): Promise<boolean> {
    return this.failQueuedWrites
      ? Promise.resolve(false)
      : super.enqueueSnapshot(data);
  }
}

function createData(
  articleId: string,
  theme: "paper" | "night"
): ScottBookBackupData {
  return {
    libraryState: markArticleOpened(
      toggleFavoriteArticle(createEmptyLibraryState(), articleId),
      articleId,
      100
    ),
    preferences: {
      theme,
      fontSize: theme === "paper" ? 25 : 29,
      assistanceScope: "word"
    },
    assistanceHistory: createEmptyAssistanceHistory()
  };
}

function createStorage(data: ScottBookBackupData): MemoryStorage {
  return new MemoryStorage({
    [LIBRARY_STATE_STORAGE_KEY]: JSON.stringify(data.libraryState),
    [LIBRARY_STATE_BACKUP_STORAGE_KEY]: "exact-safety-copy",
    [READER_THEME_STORAGE_KEY]: JSON.stringify(data.preferences.theme),
    [READER_FONT_SIZE_STORAGE_KEY]: JSON.stringify(data.preferences.fontSize),
    [READER_ASSISTANCE_SCOPE_STORAGE_KEY]: JSON.stringify(
      data.preferences.assistanceScope
    ),
    [ASSISTANCE_HISTORY_STORAGE_KEY]: JSON.stringify(data.assistanceHistory),
    [ASSISTANCE_HISTORY_BACKUP_STORAGE_KEY]: "exact-assistance-safety-copy"
  });
}

describe("local-data coordinator", () => {
  it("keeps restore and undo synchronized across localStorage and IndexedDB", async () => {
    const factory = new IDBFactory();
    const databaseName = "coordinated-restore-success";
    const current = createData("current", "night");
    const restored = createData("restored", "paper");
    const storage = createStorage(current);
    const repository = new ScottBookIndexedDbRepository({ factory, databaseName });
    const coordinator = new ScottBookLocalDataCoordinator(repository, storage);
    await coordinator.bootstrap(current, current);

    await expect(coordinator.applyRestore(current, restored)).resolves.toEqual({
      ok: true,
      data: restored
    });
    expect(JSON.parse(storage.getItem(LIBRARY_STATE_STORAGE_KEY) ?? "")).toEqual(
      restored.libraryState
    );

    await expect(coordinator.undoRestore(restored)).resolves.toEqual({
      ok: true,
      data: current
    });
    expect(JSON.parse(storage.getItem(LIBRARY_STATE_STORAGE_KEY) ?? "")).toEqual(
      current.libraryState
    );
    expect(storage.getItem(RESTORE_UNDO_STORAGE_KEY)).toBeNull();
    await repository.close();

    const reopened = new ScottBookIndexedDbRepository({ factory, databaseName });
    const loaded = await reopened.bootstrap(restored, null);
    expect(loaded.data).toEqual(current);
    await reopened.close();
  });

  it("restores every local key if the IndexedDB mirror rejects a restore", async () => {
    const factory = new IDBFactory();
    const databaseName = "coordinated-restore-failure";
    const current = createData("safe-current", "night");
    const restored = createData("rejected-restore", "paper");
    const storage = createStorage(current);
    storage.setItem(RESTORE_UNDO_STORAGE_KEY, "exact-previous-undo");
    const repository = new ControllableRepository({ factory, databaseName });
    const coordinator = new ScottBookLocalDataCoordinator(repository, storage);
    await coordinator.bootstrap(current, current);
    const before = storage.entries();
    repository.failQueuedWrites = true;

    const result = await coordinator.applyRestore(current, restored);

    expect(result).toMatchObject({ ok: false, rollbackSucceeded: true });
    expect(storage.entries()).toEqual(before);
    await repository.close();

    const reopened = new ScottBookIndexedDbRepository({ factory, databaseName });
    const loaded = await reopened.bootstrap(restored, null);
    expect(loaded.data).toEqual(current);
    await reopened.close();
  });

  it("restores the pre-undo keys if IndexedDB rejects the undo", async () => {
    const factory = new IDBFactory();
    const databaseName = "coordinated-undo-failure";
    const current = createData("before-restore", "night");
    const restored = createData("after-restore", "paper");
    const storage = createStorage(current);
    const repository = new ControllableRepository({ factory, databaseName });
    const coordinator = new ScottBookLocalDataCoordinator(repository, storage);
    await coordinator.bootstrap(current, current);
    expect((await coordinator.applyRestore(current, restored)).ok).toBe(true);
    const beforeUndo = storage.entries();
    repository.failQueuedWrites = true;

    const result = await coordinator.undoRestore(restored);

    expect(result).toMatchObject({ ok: false, rollbackSucceeded: true });
    expect(storage.entries()).toEqual(beforeUndo);
    expect(storage.getItem(RESTORE_UNDO_STORAGE_KEY)).not.toBeNull();
    await repository.close();
  });

  it("continues with the proven localStorage transaction when IndexedDB is unavailable", async () => {
    const current = createData("fallback-current", "night");
    const restored = createData("fallback-restored", "paper");
    const storage = createStorage(current);
    const repository = new ScottBookIndexedDbRepository({
      factory: undefined,
      databaseName: "coordinator-fallback"
    });
    const coordinator = new ScottBookLocalDataCoordinator(repository, storage);
    const bootstrap = await coordinator.bootstrap(current, current);
    expect(bootstrap.available).toBe(false);

    await expect(coordinator.applyRestore(current, restored)).resolves.toEqual({
      ok: true,
      data: restored
    });
    expect(JSON.parse(storage.getItem(LIBRARY_STATE_STORAGE_KEY) ?? "")).toEqual(
      restored.libraryState
    );
  });

  it("flushes the latest compatible snapshot before a PWA update", async () => {
    const factory = new IDBFactory();
    const databaseName = "pwa-update-checkpoint";
    const initial = createData("before-update", "paper");
    const latest = createData("latest-reader-position", "night");
    const storage = createStorage(initial);
    const repository = new ScottBookIndexedDbRepository({ factory, databaseName });
    const coordinator = new ScottBookLocalDataCoordinator(repository, storage);
    await coordinator.bootstrap(initial, initial);

    await expect(coordinator.prepareForUpdate(latest)).resolves.toBe(true);
    expect(JSON.parse(storage.getItem(LIBRARY_STATE_STORAGE_KEY) ?? "")).toEqual(
      latest.libraryState
    );
    expect(JSON.parse(storage.getItem(READER_THEME_STORAGE_KEY) ?? "")).toBe(
      "night"
    );
    await repository.close();

    const reopened = new ScottBookIndexedDbRepository({ factory, databaseName });
    const loaded = await reopened.bootstrap(initial, null);
    expect(loaded.data).toEqual(latest);
    await reopened.close();
  });

  it("rolls local bytes back when the update safety write is rejected", async () => {
    const current = createData("safe-before-update", "paper");
    const latest = createData("rejected-update-state", "night");
    const initialStorage = createStorage(current).entries();
    const storage = new FailOnceStorage(
      initialStorage,
      READER_FONT_SIZE_STORAGE_KEY
    );
    const repository = new ScottBookIndexedDbRepository({
      factory: undefined,
      databaseName: "failed-local-update-checkpoint"
    });
    const coordinator = new ScottBookLocalDataCoordinator(repository, storage);
    await coordinator.bootstrap(current, current);
    const before = storage.entries();

    await expect(coordinator.prepareForUpdate(latest)).resolves.toBe(false);
    expect(storage.entries()).toEqual(before);
  });

  it("can update from a complete local snapshot if the IndexedDB flush fails", async () => {
    const factory = new IDBFactory();
    const databaseName = "pwa-update-indexeddb-fallback";
    const current = createData("indexeddb-current", "paper");
    const latest = createData("local-update-fallback", "night");
    const storage = createStorage(current);
    const repository = new ControllableRepository({ factory, databaseName });
    const coordinator = new ScottBookLocalDataCoordinator(repository, storage);
    await coordinator.bootstrap(current, current);
    repository.failQueuedWrites = true;

    await expect(coordinator.prepareForUpdate(latest)).resolves.toBe(true);
    expect(coordinator.isUsingIndexedDb()).toBe(false);
    expect(JSON.parse(storage.getItem(LIBRARY_STATE_STORAGE_KEY) ?? "")).toEqual(
      latest.libraryState
    );
    await repository.close();
  });
});
