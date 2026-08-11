import type { ScottBookBackupData } from "../backup/exportBackup";
import {
  applyScottBookRestore,
  captureRestoreStorageSnapshot,
  restoreCapturedStorageSnapshot,
  undoLastScottBookRestore,
  writeScottBookDataBundle,
  type RestoreStorage,
  type RestoreTransactionResult
} from "../backup/restoreBackup";
import {
  ScottBookIndexedDbRepository,
  type IndexedDbBootstrapResult,
  type ScottBookStorageReport,
  type StorageEstimateReader
} from "./indexedDbRepository";
import {
  tryLoadPrimaryLocalData,
  validateLocalDataSnapshot
} from "./localDataSnapshot";

export class ScottBookLocalDataCoordinator {
  private indexedDbAvailable = false;
  private bootstrapPromise: Promise<IndexedDbBootstrapResult> | null = null;

  constructor(
    private readonly repository: ScottBookIndexedDbRepository,
    private readonly localStorage: RestoreStorage
  ) {}

  async bootstrap(
    fallbackData: ScottBookBackupData,
    preferredLocalData: ScottBookBackupData | null
  ): Promise<IndexedDbBootstrapResult> {
    this.bootstrapPromise ??= this.repository.bootstrap(
      fallbackData,
      preferredLocalData
    );
    const result = await this.bootstrapPromise;
    this.indexedDbAvailable = result.available;
    return result;
  }

  async persist(data: ScottBookBackupData): Promise<boolean> {
    if (!this.indexedDbAvailable) return true;
    try {
      const succeeded = await this.repository.enqueueSnapshot(data);
      if (!succeeded) this.indexedDbAvailable = false;
      return succeeded;
    } catch {
      this.indexedDbAvailable = false;
      return false;
    }
  }

  isUsingIndexedDb(): boolean {
    return this.indexedDbAvailable;
  }

  async prepareForUpdate(data: ScottBookBackupData): Promise<boolean> {
    const safeData = validateLocalDataSnapshot(data);
    if (!safeData) return false;

    if (this.bootstrapPromise) {
      try {
        await this.bootstrapPromise;
      } catch {
        // A valid local snapshot is still sufficient for fallback mode.
      }
    }

    let exactLocalSnapshot;
    try {
      exactLocalSnapshot = captureRestoreStorageSnapshot(this.localStorage);
    } catch {
      return false;
    }

    const previousData =
      tryLoadPrimaryLocalData(this.localStorage) ?? safeData;
    try {
      writeScottBookDataBundle(this.localStorage, safeData, previousData);
    } catch {
      restoreCapturedStorageSnapshot(
        this.localStorage,
        exactLocalSnapshot
      );
      return false;
    }

    if (this.indexedDbAvailable) {
      // The queue flushes all earlier reader writes before this final snapshot.
      // If IndexedDB rejects it, the complete local transaction above remains
      // a compatible source for the next version's bootstrap.
      await this.persist(safeData);
    }

    return true;
  }

  async applyRestore(
    currentData: ScottBookBackupData,
    restoredData: ScottBookBackupData
  ): Promise<RestoreTransactionResult> {
    let exactLocalSnapshot;
    try {
      exactLocalSnapshot = this.indexedDbAvailable
        ? captureRestoreStorageSnapshot(this.localStorage)
        : null;
    } catch {
      return {
        ok: false,
        rollbackSucceeded: true,
        message: "Trình duyệt không cho ScottBook đọc vùng lưu trữ local."
      };
    }

    const localResult = applyScottBookRestore(
      this.localStorage,
      currentData,
      restoredData
    );
    if (!localResult.ok || !this.indexedDbAvailable) return localResult;

    const indexedDbSaved = await this.persist(localResult.data);
    if (indexedDbSaved) return localResult;

    const rollbackSucceeded = exactLocalSnapshot
      ? restoreCapturedStorageSnapshot(this.localStorage, exactLocalSnapshot)
      : false;
    return {
      ok: false,
      rollbackSucceeded,
      message: rollbackSucceeded
        ? "IndexedDB chưa ghi được bản khôi phục; dữ liệu trước đó đã được giữ nguyên."
        : "Không thể đồng bộ IndexedDB và hoàn tác local đầy đủ. Hãy tải lại app trước khi tiếp tục."
    };
  }

  async undoRestore(
    currentData: ScottBookBackupData
  ): Promise<RestoreTransactionResult> {
    let exactLocalSnapshot;
    try {
      exactLocalSnapshot = this.indexedDbAvailable
        ? captureRestoreStorageSnapshot(this.localStorage)
        : null;
    } catch {
      return {
        ok: false,
        rollbackSucceeded: true,
        message: "Trình duyệt không cho ScottBook đọc vùng lưu trữ local."
      };
    }

    const localResult = undoLastScottBookRestore(
      this.localStorage,
      currentData
    );
    if (!localResult.ok || !this.indexedDbAvailable) return localResult;

    const indexedDbSaved = await this.persist(localResult.data);
    if (indexedDbSaved) return localResult;

    const rollbackSucceeded = exactLocalSnapshot
      ? restoreCapturedStorageSnapshot(this.localStorage, exactLocalSnapshot)
      : false;
    return {
      ok: false,
      rollbackSucceeded,
      message: rollbackSucceeded
        ? "IndexedDB chưa hoàn tác được; dữ liệu trước thao tác đã được giữ nguyên."
        : "Không thể đồng bộ IndexedDB và hoàn tác local đầy đủ. Hãy tải lại app trước khi tiếp tục."
    };
  }

  async clearTranslationCache(): Promise<number> {
    if (!this.indexedDbAvailable) {
      throw new Error("IndexedDB is unavailable");
    }
    return this.repository.clearTranslationCache();
  }

  getStorageReport(
    estimate?: StorageEstimateReader
  ): Promise<ScottBookStorageReport> {
    return this.repository.getStorageReport(estimate);
  }
}
