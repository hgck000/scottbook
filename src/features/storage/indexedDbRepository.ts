import type { ScottBookBackupData } from "../backup/exportBackup";
import { validateLibraryStateSnapshot } from "../library/readingState";
import { validateReaderPreferences } from "../preferences/readerPreferences";
import {
  createEmptyAssistanceHistory,
  validateAssistanceHistorySnapshot
} from "../review/assistanceHistory";
import { validateLocalDataSnapshot } from "./localDataSnapshot";
import {
  validateImportedBook,
  type ImportedBook
} from "../import/importedBook";

export const SCOTTBOOK_DATABASE_NAME = "scottbook-local-data";
export const SCOTTBOOK_DATABASE_VERSION = 4;

export const SCOTTBOOK_STORE_NAMES = {
  books: "books",
  progress: "progress",
  settings: "settings",
  events: "events",
  cache: "cache",
  meta: "meta",
  quarantine: "quarantine",
  bookRestoreUndo: "book-restore-undo"
} as const;

const LIBRARY_STATE_RECORD_ID = "library-state";
const READER_PREFERENCES_RECORD_ID = "reader-preferences";
const ASSISTANCE_HISTORY_RECORD_ID = "assistance-history";

type SnapshotRecord = {
  id: string;
  value: unknown;
  updatedAt: number;
};

type CorruptRecord = {
  storeName: string;
  recordKey: string;
  reason: string;
  payload: unknown;
};

export type IndexedDbBootstrapResult = {
  available: boolean;
  data: ScottBookBackupData;
  importedBooks: ImportedBook[];
  source:
    | "local-storage"
    | "indexed-db"
    | "recovered"
    | "default"
    | "fallback";
  quarantinedThisRun: number;
};

export type ScottBookStorageReport = {
  indexedDbAvailable: boolean;
  schemaVersion: number | null;
  usageBytes: number | null;
  quotaBytes: number | null;
  bookCount: number;
  eventCount: number;
  cacheCount: number;
  quarantinedCount: number;
  pressure: StoragePressure;
};

export type StoragePressure = "unknown" | "normal" | "warning" | "critical";

export type StorageEstimateReader = () => Promise<{
  usage?: number;
  quota?: number;
}>;

type RepositoryOptions = {
  factory?: IDBFactory;
  databaseName?: string;
  now?: () => number;
};

export function getStoragePressure(
  usageBytes: number | null,
  quotaBytes: number | null
): StoragePressure {
  if (
    usageBytes === null ||
    quotaBytes === null ||
    usageBytes < 0 ||
    quotaBytes <= 0
  ) {
    return "unknown";
  }

  const ratio = usageBytes / quotaBytes;
  if (ratio >= 0.95) return "critical";
  if (ratio >= 0.8) return "warning";
  return "normal";
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSnapshotRecord(
  value: unknown,
  expectedId: string
): value is SnapshotRecord {
  return (
    isRecord(value) &&
    value.id === expectedId &&
    Object.hasOwn(value, "value") &&
    typeof value.updatedAt === "number" &&
    Number.isSafeInteger(value.updatedAt) &&
    value.updatedAt >= 0
  );
}

function createStoreIfMissing(
  database: IDBDatabase,
  storeName: string,
  options: IDBObjectStoreParameters
): void {
  if (!database.objectStoreNames.contains(storeName)) {
    database.createObjectStore(storeName, options);
  }
}

function cloneSnapshot(data: ScottBookBackupData): ScottBookBackupData {
  const validated = validateLocalDataSnapshot(data);
  if (!validated) throw new Error("Invalid ScottBook local data snapshot");
  return validated;
}

function parseLibraryRecord(value: unknown): {
  data: ScottBookBackupData["libraryState"] | null;
  corrupt: boolean;
} {
  if (value === undefined) return { data: null, corrupt: false };
  if (!isSnapshotRecord(value, LIBRARY_STATE_RECORD_ID)) {
    return { data: null, corrupt: true };
  }
  const data = validateLibraryStateSnapshot(value.value);
  return { data, corrupt: data === null };
}

function parsePreferencesRecord(value: unknown): {
  data: ScottBookBackupData["preferences"] | null;
  corrupt: boolean;
} {
  if (value === undefined) return { data: null, corrupt: false };
  if (!isSnapshotRecord(value, READER_PREFERENCES_RECORD_ID)) {
    return { data: null, corrupt: true };
  }
  const data = validateReaderPreferences(value.value);
  return data
    ? { data, corrupt: false }
    : { data: null, corrupt: true };
}

function parseAssistanceRecord(value: unknown): {
  data: ScottBookBackupData["assistanceHistory"] | null;
  corrupt: boolean;
} {
  if (value === undefined) {
    return { data: createEmptyAssistanceHistory(), corrupt: false };
  }
  if (!isSnapshotRecord(value, ASSISTANCE_HISTORY_RECORD_ID)) {
    return { data: null, corrupt: true };
  }
  const data = validateAssistanceHistorySnapshot(value.value);
  return { data, corrupt: data === null };
}

function parseImportedBooks(values: unknown[]): {
  books: ImportedBook[];
  corrupt: CorruptRecord[];
} {
  const books: ImportedBook[] = [];
  const corrupt: CorruptRecord[] = [];
  for (const value of values) {
    const result = validateImportedBook(value);
    if (result.ok) {
      books.push(result.book);
      continue;
    }
    const recordKey = isRecord(value) && typeof value.id === "string"
      ? value.id
      : `unknown-book-${corrupt.length}`;
    corrupt.push({
      storeName: SCOTTBOOK_STORE_NAMES.books,
      recordKey,
      reason: result.message,
      payload: value
    });
  }
  books.sort((left, right) => right.createdAt - left.createdAt);
  return { books, corrupt };
}

function cloneImportedBooks(values: readonly ImportedBook[]): ImportedBook[] {
  const seen = new Set<string>();
  return values.map((value) => {
    const result = validateImportedBook(value);
    if (!result.ok || seen.has(value.id)) {
      throw new Error(result.ok ? "Duplicate imported book id" : result.message);
    }
    seen.add(value.id);
    return result.book;
  });
}

function writeSnapshotRecords(
  transaction: IDBTransaction,
  data: ScottBookBackupData,
  updatedAt: number,
  marker: string
): Array<Promise<unknown>> {
  return [
    requestResult(
      transaction.objectStore(SCOTTBOOK_STORE_NAMES.progress).put({
        id: LIBRARY_STATE_RECORD_ID,
        value: data.libraryState,
        updatedAt
      })
    ),
    requestResult(
      transaction.objectStore(SCOTTBOOK_STORE_NAMES.settings).put({
        id: READER_PREFERENCES_RECORD_ID,
        value: data.preferences,
        updatedAt
      })
    ),
    requestResult(
      transaction.objectStore(SCOTTBOOK_STORE_NAMES.events).put({
        id: ASSISTANCE_HISTORY_RECORD_ID,
        value: data.assistanceHistory,
        updatedAt
      })
    ),
    requestResult(
      transaction.objectStore(SCOTTBOOK_STORE_NAMES.meta).put({
        key: marker,
        completedAt: updatedAt
      })
    )
  ];
}

export class ScottBookIndexedDbRepository {
  private readonly factory: IDBFactory | undefined;
  private readonly databaseName: string;
  private readonly now: () => number;
  private databasePromise: Promise<IDBDatabase> | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(options: RepositoryOptions = {}) {
    this.factory = options.factory ?? globalThis.indexedDB;
    this.databaseName = options.databaseName ?? SCOTTBOOK_DATABASE_NAME;
    this.now = options.now ?? Date.now;
  }

  private openDatabase(): Promise<IDBDatabase> {
    const factory = this.factory;
    if (!factory) {
      return Promise.reject(new Error("IndexedDB is unavailable"));
    }
    if (this.databasePromise) return this.databasePromise;

    this.databasePromise = new Promise((resolve, reject) => {
      const request = factory.open(
        this.databaseName,
        SCOTTBOOK_DATABASE_VERSION
      );
      let blocked = false;

      request.onupgradeneeded = (event) => {
        const database = request.result;
        createStoreIfMissing(database, SCOTTBOOK_STORE_NAMES.books, {
          keyPath: "id"
        });
        createStoreIfMissing(database, SCOTTBOOK_STORE_NAMES.progress, {
          keyPath: "id"
        });
        createStoreIfMissing(database, SCOTTBOOK_STORE_NAMES.settings, {
          keyPath: "id"
        });
        createStoreIfMissing(database, SCOTTBOOK_STORE_NAMES.events, {
          keyPath: "id",
          autoIncrement: true
        });
        createStoreIfMissing(database, SCOTTBOOK_STORE_NAMES.cache, {
          keyPath: "key"
        });
        createStoreIfMissing(database, SCOTTBOOK_STORE_NAMES.meta, {
          keyPath: "key"
        });
        createStoreIfMissing(database, SCOTTBOOK_STORE_NAMES.quarantine, {
          keyPath: "id",
          autoIncrement: true
        });
        createStoreIfMissing(database, SCOTTBOOK_STORE_NAMES.bookRestoreUndo, {
          keyPath: "id"
        });

        const transaction = request.transaction;
        if (transaction) {
          transaction.objectStore(SCOTTBOOK_STORE_NAMES.meta).put({
            key: "schema",
            version: SCOTTBOOK_DATABASE_VERSION,
            upgradedFrom: (event as IDBVersionChangeEvent).oldVersion,
            upgradedAt: this.now()
          });
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        if (blocked) {
          database.close();
          return;
        }
        database.onversionchange = () => {
          database.close();
          this.databasePromise = null;
        };
        resolve(database);
      };
      request.onerror = () => {
        this.databasePromise = null;
        reject(request.error ?? new Error("Unable to open IndexedDB"));
      };
      request.onblocked = () => {
        blocked = true;
        this.databasePromise = null;
        reject(new Error("IndexedDB upgrade is blocked"));
      };
    });

    return this.databasePromise;
  }

  async bootstrap(
    fallbackData: ScottBookBackupData,
    preferredLocalData: ScottBookBackupData | null
  ): Promise<IndexedDbBootstrapResult> {
    const safeFallback = cloneSnapshot(fallbackData);
    const safePreferred = preferredLocalData
      ? cloneSnapshot(preferredLocalData)
      : null;

    let database: IDBDatabase;
    try {
      database = await this.openDatabase();
    } catch {
      return {
        available: false,
        data: safeFallback,
        importedBooks: [],
        source: "fallback",
        quarantinedThisRun: 0
      };
    }

    try {
      const readTransaction = database.transaction(
        [
          SCOTTBOOK_STORE_NAMES.progress,
          SCOTTBOOK_STORE_NAMES.settings,
          SCOTTBOOK_STORE_NAMES.events,
          SCOTTBOOK_STORE_NAMES.books
        ],
        "readonly"
      );
      const readDone = transactionDone(readTransaction);
      const libraryRequest = readTransaction
        .objectStore(SCOTTBOOK_STORE_NAMES.progress)
        .get(LIBRARY_STATE_RECORD_ID);
      const preferencesRequest = readTransaction
        .objectStore(SCOTTBOOK_STORE_NAMES.settings)
        .get(READER_PREFERENCES_RECORD_ID);
      const assistanceRequest = readTransaction
        .objectStore(SCOTTBOOK_STORE_NAMES.events)
        .get(ASSISTANCE_HISTORY_RECORD_ID);
      const booksRequest = readTransaction
        .objectStore(SCOTTBOOK_STORE_NAMES.books)
        .getAll();
      const [rawLibrary, rawPreferences, rawAssistance, rawBooks] = await Promise.all([
        requestResult(libraryRequest),
        requestResult(preferencesRequest),
        requestResult(assistanceRequest),
        requestResult(booksRequest),
        readDone
      ]);

      const library = parseLibraryRecord(rawLibrary);
      const preferences = parsePreferencesRecord(rawPreferences);
      const assistance = parseAssistanceRecord(rawAssistance);
      const imported = parseImportedBooks(rawBooks);
      const corruptRecords: CorruptRecord[] = [];
      corruptRecords.push(...imported.corrupt);
      if (library.corrupt) {
        corruptRecords.push({
          storeName: SCOTTBOOK_STORE_NAMES.progress,
          recordKey: LIBRARY_STATE_RECORD_ID,
          reason: "Invalid library-state record",
          payload: rawLibrary
        });
      }
      if (preferences.corrupt) {
        corruptRecords.push({
          storeName: SCOTTBOOK_STORE_NAMES.settings,
          recordKey: READER_PREFERENCES_RECORD_ID,
          reason: "Invalid reader-preferences record",
          payload: rawPreferences
        });
      }
      if (assistance.corrupt) {
        corruptRecords.push({
          storeName: SCOTTBOOK_STORE_NAMES.events,
          recordKey: ASSISTANCE_HISTORY_RECORD_ID,
          reason: "Invalid assistance-history record",
          payload: rawAssistance
        });
      }

      let data: ScottBookBackupData;
      let source: IndexedDbBootstrapResult["source"];
      if (safePreferred) {
        data = safePreferred;
        source = "local-storage";
      } else if (library.data && preferences.data && assistance.data) {
        data = {
          libraryState: library.data,
          preferences: preferences.data,
          assistanceHistory:
            assistance.data ?? safeFallback.assistanceHistory
        };
        source = "indexed-db";
      } else {
        data = {
          libraryState: library.data ?? safeFallback.libraryState,
          preferences: preferences.data ?? safeFallback.preferences,
          assistanceHistory:
            assistance.data ?? safeFallback.assistanceHistory
        };
        source =
          rawLibrary === undefined &&
          rawPreferences === undefined &&
          rawAssistance === undefined
            ? "default"
            : "recovered";
      }

      await this.writeBootstrap(data, source, corruptRecords);
      return {
        available: true,
        data,
        importedBooks: imported.books,
        source,
        quarantinedThisRun: corruptRecords.length
      };
    } catch {
      return {
        available: false,
        data: safeFallback,
        importedBooks: [],
        source: "fallback",
        quarantinedThisRun: 0
      };
    }
  }

  private async writeBootstrap(
    data: ScottBookBackupData,
    source: IndexedDbBootstrapResult["source"],
    corruptRecords: CorruptRecord[]
  ): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      [
        SCOTTBOOK_STORE_NAMES.progress,
        SCOTTBOOK_STORE_NAMES.settings,
        SCOTTBOOK_STORE_NAMES.events,
        SCOTTBOOK_STORE_NAMES.meta,
        SCOTTBOOK_STORE_NAMES.quarantine,
        SCOTTBOOK_STORE_NAMES.books
      ],
      "readwrite"
    );
    const done = transactionDone(transaction);
    const updatedAt = this.now();
    const requests: Array<Promise<unknown>> = [
      requestResult(
        transaction.objectStore(SCOTTBOOK_STORE_NAMES.progress).put({
          id: LIBRARY_STATE_RECORD_ID,
          value: data.libraryState,
          updatedAt
        })
      ),
      requestResult(
        transaction.objectStore(SCOTTBOOK_STORE_NAMES.settings).put({
          id: READER_PREFERENCES_RECORD_ID,
          value: data.preferences,
          updatedAt
        })
      ),
      requestResult(
        transaction.objectStore(SCOTTBOOK_STORE_NAMES.events).put({
          id: ASSISTANCE_HISTORY_RECORD_ID,
          value: data.assistanceHistory,
          updatedAt
        })
      ),
      requestResult(
        transaction.objectStore(SCOTTBOOK_STORE_NAMES.meta).put({
          key: "bootstrap",
          source,
          completedAt: updatedAt
        })
      )
    ];

    const quarantineStore = transaction.objectStore(
      SCOTTBOOK_STORE_NAMES.quarantine
    );
    for (const corruptRecord of corruptRecords) {
      requests.push(
        requestResult(
          quarantineStore.add({
            ...corruptRecord,
            capturedAt: updatedAt
          })
        )
      );
      if (corruptRecord.storeName === SCOTTBOOK_STORE_NAMES.books) {
        requests.push(
          requestResult(
            transaction
              .objectStore(SCOTTBOOK_STORE_NAMES.books)
              .delete(corruptRecord.recordKey)
          )
        );
      }
    }

    await Promise.all([...requests, done]);
  }

  async saveSnapshot(data: ScottBookBackupData): Promise<void> {
    const safeData = cloneSnapshot(data);
    const database = await this.openDatabase();
    const transaction = database.transaction(
      [
        SCOTTBOOK_STORE_NAMES.progress,
        SCOTTBOOK_STORE_NAMES.settings,
        SCOTTBOOK_STORE_NAMES.events,
        SCOTTBOOK_STORE_NAMES.meta
      ],
      "readwrite"
    );
    const done = transactionDone(transaction);
    const updatedAt = this.now();
    await Promise.all([
      ...writeSnapshotRecords(transaction, safeData, updatedAt, "last-write"),
      done
    ]);
  }

  enqueueSnapshot(data: ScottBookBackupData): Promise<boolean> {
    const safeData = cloneSnapshot(data);
    const operation = this.writeQueue.then(() => this.saveSnapshot(safeData));
    this.writeQueue = operation.catch(() => undefined);
    return operation.then(
      () => true,
      () => false
    );
  }

  async saveImportedBook(book: ImportedBook): Promise<void> {
    const [safeBook] = cloneImportedBooks([book]);
    if (!safeBook) throw new Error("Invalid imported book");
    await this.writeQueue;
    const database = await this.openDatabase();
    const transaction = database.transaction(
      [SCOTTBOOK_STORE_NAMES.books, SCOTTBOOK_STORE_NAMES.meta],
      "readwrite"
    );
    const done = transactionDone(transaction);
    const updatedAt = this.now();
    await Promise.all([
      requestResult(
        transaction.objectStore(SCOTTBOOK_STORE_NAMES.books).put(safeBook)
      ),
      requestResult(
        transaction.objectStore(SCOTTBOOK_STORE_NAMES.meta).put({
          key: "last-book-write",
          bookId: safeBook.id,
          completedAt: updatedAt
        })
      ),
      done
    ]);
  }

  async deleteImportedBookAndSaveSnapshot(
    bookId: string,
    data: ScottBookBackupData
  ): Promise<void> {
    const safeData = cloneSnapshot(data);
    if (!bookId.startsWith("imported:") || bookId.length > 200) {
      throw new Error("Invalid imported book id");
    }
    await this.writeQueue;
    const database = await this.openDatabase();
    const transaction = database.transaction(
      [
        SCOTTBOOK_STORE_NAMES.books,
        SCOTTBOOK_STORE_NAMES.progress,
        SCOTTBOOK_STORE_NAMES.settings,
        SCOTTBOOK_STORE_NAMES.events,
        SCOTTBOOK_STORE_NAMES.meta
      ],
      "readwrite"
    );
    const done = transactionDone(transaction);
    const updatedAt = this.now();
    await Promise.all([
      requestResult(
        transaction.objectStore(SCOTTBOOK_STORE_NAMES.books).delete(bookId)
      ),
      ...writeSnapshotRecords(transaction, safeData, updatedAt, "last-book-delete"),
      done
    ]);
  }

  async replaceImportedBooksForRestore(
    data: ScottBookBackupData,
    currentBooks: readonly ImportedBook[],
    restoredBooks: readonly ImportedBook[]
  ): Promise<void> {
    const safeData = cloneSnapshot(data);
    const safeCurrent = cloneImportedBooks(currentBooks);
    const safeRestored = cloneImportedBooks(restoredBooks);
    await this.writeQueue;
    const database = await this.openDatabase();
    const transaction = database.transaction(
      [
        SCOTTBOOK_STORE_NAMES.books,
        SCOTTBOOK_STORE_NAMES.bookRestoreUndo,
        SCOTTBOOK_STORE_NAMES.progress,
        SCOTTBOOK_STORE_NAMES.settings,
        SCOTTBOOK_STORE_NAMES.events,
        SCOTTBOOK_STORE_NAMES.meta
      ],
      "readwrite"
    );
    const done = transactionDone(transaction);
    const books = transaction.objectStore(SCOTTBOOK_STORE_NAMES.books);
    const undo = transaction.objectStore(SCOTTBOOK_STORE_NAMES.bookRestoreUndo);
    const requests: Array<Promise<unknown>> = [
      requestResult(books.clear()),
      requestResult(undo.clear())
    ];
    for (const book of safeCurrent) requests.push(requestResult(undo.put(book)));
    for (const book of safeRestored) requests.push(requestResult(books.put(book)));
    requests.push(
      ...writeSnapshotRecords(
        transaction,
        safeData,
        this.now(),
        "last-portable-restore"
      )
    );
    await Promise.all([...requests, done]);
  }

  async undoImportedBooksRestore(data: ScottBookBackupData): Promise<ImportedBook[]> {
    const safeData = cloneSnapshot(data);
    await this.writeQueue;
    const database = await this.openDatabase();
    const readTransaction = database.transaction(
      SCOTTBOOK_STORE_NAMES.bookRestoreUndo,
      "readonly"
    );
    const readDone = transactionDone(readTransaction);
    const rawUndo = await Promise.all([
      requestResult(
        readTransaction.objectStore(SCOTTBOOK_STORE_NAMES.bookRestoreUndo).getAll()
      ),
      readDone
    ]).then(([books]) => books);
    const safeUndo = cloneImportedBooks(rawUndo);

    const transaction = database.transaction(
      [
        SCOTTBOOK_STORE_NAMES.books,
        SCOTTBOOK_STORE_NAMES.bookRestoreUndo,
        SCOTTBOOK_STORE_NAMES.progress,
        SCOTTBOOK_STORE_NAMES.settings,
        SCOTTBOOK_STORE_NAMES.events,
        SCOTTBOOK_STORE_NAMES.meta
      ],
      "readwrite"
    );
    const done = transactionDone(transaction);
    const books = transaction.objectStore(SCOTTBOOK_STORE_NAMES.books);
    const undo = transaction.objectStore(SCOTTBOOK_STORE_NAMES.bookRestoreUndo);
    const requests: Array<Promise<unknown>> = [
      requestResult(books.clear()),
      requestResult(undo.clear())
    ];
    for (const book of safeUndo) requests.push(requestResult(books.put(book)));
    requests.push(
      ...writeSnapshotRecords(
        transaction,
        safeData,
        this.now(),
        "last-portable-restore-undo"
      )
    );
    await Promise.all([...requests, done]);
    return safeUndo.sort((left, right) => right.createdAt - left.createdAt);
  }

  async clearTranslationCache(): Promise<number> {
    await this.writeQueue;
    const database = await this.openDatabase();
    const transaction = database.transaction(
      SCOTTBOOK_STORE_NAMES.cache,
      "readwrite"
    );
    const done = transactionDone(transaction);
    const store = transaction.objectStore(SCOTTBOOK_STORE_NAMES.cache);
    const countRequest = store.count();
    const clearRequest = store.clear();
    const [count] = await Promise.all([
      requestResult(countRequest),
      requestResult(clearRequest),
      done
    ]);
    return count;
  }

  async getStorageReport(
    estimate?: StorageEstimateReader
  ): Promise<ScottBookStorageReport> {
    let usageBytes: number | null = null;
    let quotaBytes: number | null = null;
    if (estimate) {
      try {
        const result = await estimate();
        usageBytes =
          typeof result.usage === "number" && Number.isFinite(result.usage)
            ? result.usage
            : null;
        quotaBytes =
          typeof result.quota === "number" && Number.isFinite(result.quota)
            ? result.quota
            : null;
      } catch {
        // IndexedDB record counts remain useful without an origin estimate.
      }
    }

    try {
      await this.writeQueue;
      const database = await this.openDatabase();
      const transaction = database.transaction(
        [
          SCOTTBOOK_STORE_NAMES.books,
          SCOTTBOOK_STORE_NAMES.events,
          SCOTTBOOK_STORE_NAMES.cache,
          SCOTTBOOK_STORE_NAMES.quarantine
        ],
        "readonly"
      );
      const done = transactionDone(transaction);
      const [bookCount, eventCount, cacheCount, quarantinedCount] =
        await Promise.all([
          requestResult(
            transaction.objectStore(SCOTTBOOK_STORE_NAMES.books).count()
          ),
          requestResult(
            transaction
              .objectStore(SCOTTBOOK_STORE_NAMES.events)
              .get(ASSISTANCE_HISTORY_RECORD_ID)
          ),
          requestResult(
            transaction.objectStore(SCOTTBOOK_STORE_NAMES.cache).count()
          ),
          requestResult(
            transaction.objectStore(SCOTTBOOK_STORE_NAMES.quarantine).count()
          ),
          done
        ]);

      const assistance = parseAssistanceRecord(eventCount);
      return {
        indexedDbAvailable: true,
        schemaVersion: SCOTTBOOK_DATABASE_VERSION,
        usageBytes,
        quotaBytes,
        bookCount,
        eventCount: assistance.data
          ? Object.keys(assistance.data.items).length
          : 0,
        cacheCount,
        quarantinedCount,
        pressure: getStoragePressure(usageBytes, quotaBytes)
      };
    } catch {
      return {
        indexedDbAvailable: false,
        schemaVersion: null,
        usageBytes,
        quotaBytes,
        bookCount: 0,
        eventCount: 0,
        cacheCount: 0,
        quarantinedCount: 0,
        pressure: getStoragePressure(usageBytes, quotaBytes)
      };
    }
  }

  async close(): Promise<void> {
    try {
      const database = await this.databasePromise;
      database?.close();
    } catch {
      // A rejected open attempt has no live connection to close.
    } finally {
      this.databasePromise = null;
    }
  }
}

export const scottBookRepository = new ScottBookIndexedDbRepository();
