import { useSyncExternalStore } from "react";

export type StoragePersistence =
  | "checking"
  | "available"
  | "granted"
  | "unsupported";

export type PwaStatusSnapshot = {
  isOnline: boolean;
  needRefresh: boolean;
  reloadPending: boolean;
  offlineReady: boolean;
  updating: boolean;
  updateError: string | null;
  storagePersistence: StoragePersistence;
};

export type PwaStatusEnvironment = {
  getOnline: () => boolean;
  addConnectionListener: (listener: () => void) => () => void;
  reload: () => void;
  storage?: {
    persisted: () => Promise<boolean>;
    persist: () => Promise<boolean>;
  };
};

type UpdateServiceWorker = () => Promise<void>;
type Listener = () => void;

const serverSnapshot: PwaStatusSnapshot = {
  isOnline: true,
  needRefresh: false,
  reloadPending: false,
  offlineReady: false,
  updating: false,
  updateError: null,
  storagePersistence: "checking"
};

function createBrowserEnvironment(): PwaStatusEnvironment {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    };
  }

  const storageManager =
    "storage" in navigator ? navigator.storage : undefined;
  const storage = storageManager
    ? {
        persisted: () => storageManager.persisted(),
        persist: () => storageManager.persist()
      }
    : undefined;

  return {
    getOnline: () => navigator.onLine,
    addConnectionListener: (listener) => {
      window.addEventListener("online", listener);
      window.addEventListener("offline", listener);
      return () => {
        window.removeEventListener("online", listener);
        window.removeEventListener("offline", listener);
      };
    },
    reload: () => window.location.reload(),
    storage
  };
}

export function createPwaStatusStore(environment: PwaStatusEnvironment) {
  let snapshot: PwaStatusSnapshot = {
    ...serverSnapshot,
    isOnline: environment.getOnline(),
    storagePersistence: environment.storage ? "checking" : "unsupported"
  };
  let updateServiceWorker: UpdateServiceWorker | null = null;
  let updateAccepted = false;
  let initialized = false;
  const listeners = new Set<Listener>();

  const publish = (changes: Partial<PwaStatusSnapshot>) => {
    snapshot = { ...snapshot, ...changes };
    listeners.forEach((listener) => listener());
  };

  const initialize = () => {
    if (initialized) return () => undefined;
    initialized = true;

    const syncConnection = () =>
      publish({ isOnline: environment.getOnline() });
    const removeConnectionListener =
      environment.addConnectionListener(syncConnection);

    if (environment.storage) {
      environment.storage
        .persisted()
        .then((persisted) =>
          publish({ storagePersistence: persisted ? "granted" : "available" })
        )
        .catch(() => publish({ storagePersistence: "available" }));
    }

    return removeConnectionListener;
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const applyUpdate = async () => {
    if (snapshot.reloadPending) {
      updateAccepted = true;
      environment.reload();
      return;
    }

    if (!updateServiceWorker) {
      publish({ updateError: "Chưa thể kích hoạt bản cập nhật." });
      return;
    }

    updateAccepted = true;
    publish({ updating: true, updateError: null });
    try {
      await updateServiceWorker();
    } catch {
      updateAccepted = false;
      publish({
        updating: false,
        updateError: "Cập nhật chưa thành công. Dữ liệu đọc vẫn được giữ nguyên."
      });
    }
  };

  const requestPersistentStorage = async () => {
    if (!environment.storage) {
      publish({ storagePersistence: "unsupported" });
      return false;
    }

    try {
      const granted = await environment.storage.persist();
      publish({ storagePersistence: granted ? "granted" : "available" });
      return granted;
    } catch {
      publish({ storagePersistence: "available" });
      return false;
    }
  };

  return {
    initialize,
    subscribe,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    setUpdateServiceWorker: (handler: UpdateServiceWorker) => {
      updateServiceWorker = handler;
    },
    notifyNeedRefresh: () =>
      publish({ needRefresh: true, updateError: null }),
    notifyOfflineReady: () => publish({ offlineReady: true }),
    notifyRegisterError: () =>
      publish({
        updateError:
          "Không thể kiểm tra bản PWA mới. Bản hiện tại vẫn dùng được offline."
      }),
    handleServiceWorkerNeedsReload: () => {
      if (updateAccepted) {
        environment.reload();
      } else {
        publish({ needRefresh: true, reloadPending: true, updating: false });
      }
    },
    applyUpdate,
    dismissRefresh: () =>
      publish({ needRefresh: false, updateError: null, updating: false }),
    dismissOfflineReady: () => publish({ offlineReady: false }),
    dismissError: () => publish({ updateError: null }),
    requestPersistentStorage
  };
}

export const pwaStatusStore = createPwaStatusStore(createBrowserEnvironment());

export function usePwaStatus() {
  return useSyncExternalStore(
    pwaStatusStore.subscribe,
    pwaStatusStore.getSnapshot,
    pwaStatusStore.getServerSnapshot
  );
}
