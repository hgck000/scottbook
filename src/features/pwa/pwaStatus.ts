import { useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";

export type StoragePersistence =
  | "checking"
  | "available"
  | "granted"
  | "unsupported";

export type OfflineCapability = "checking" | "ready" | "unavailable";

export type PwaInstallMethod = "native" | "ios" | "macos" | "browser";
export type PwaInstallState =
  | "hidden"
  | "available"
  | "prompting"
  | "installed";

export type PwaNativeInstallPrompt = {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
};

export type PwaInstallEnvironment = {
  isInstalled: () => boolean;
  getManualMethod: () => Exclude<PwaInstallMethod, "native">;
  isDismissed: () => boolean;
  setDismissed: () => void;
  clearDismissed: () => void;
  addPromptListener: (
    listener: (prompt: PwaNativeInstallPrompt) => void
  ) => () => void;
  addInstalledListener: (listener: () => void) => () => void;
};

export const PWA_INSTALL_DISMISSED_STORAGE_KEY =
  "scottbook-pwa-install-dismissed-v1";

export type PwaStatusSnapshot = {
  isOnline: boolean;
  offlineCapability: OfflineCapability;
  needRefresh: boolean;
  updateAvailable: boolean;
  reloadPending: boolean;
  offlineReady: boolean;
  updating: boolean;
  updateError: string | null;
  storagePersistence: StoragePersistence;
  installState: PwaInstallState;
  installMethod: PwaInstallMethod | null;
  installError: string | null;
};

export type PwaStatusEnvironment = {
  getOnline: () => boolean;
  nativeRuntime?: boolean;
  supportsServiceWorker?: boolean;
  getServiceWorkerControlled?: () => boolean;
  addConnectionListener: (listener: () => void) => () => void;
  reload: () => void;
  storage?: {
    persisted: () => Promise<boolean>;
    persist: () => Promise<boolean>;
  };
  install?: PwaInstallEnvironment;
};

type UpdateServiceWorker = () => Promise<void>;
type PrepareForUpdate = () => Promise<boolean>;
type Listener = () => void;

const serverSnapshot: PwaStatusSnapshot = {
  isOnline: true,
  offlineCapability: "checking",
  needRefresh: false,
  updateAvailable: false,
  reloadPending: false,
  offlineReady: false,
  updating: false,
  updateError: null,
  storagePersistence: "checking",
  installState: "hidden",
  installMethod: null,
  installError: null
};

export function detectManualInstallMethod(
  userAgent: string,
  platform: string,
  maxTouchPoints: number
): Exclude<PwaInstallMethod, "native"> {
  const isAppleMobile =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1);
  if (isAppleMobile) return "ios";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "macos";
  return "browser";
}

function createBrowserInstallEnvironment(): PwaInstallEnvironment {
  const browserNavigator = navigator as Navigator & { standalone?: boolean };

  return {
    isInstalled: () =>
      window.matchMedia?.("(display-mode: standalone)").matches === true ||
      browserNavigator.standalone === true,
    getManualMethod: () =>
      detectManualInstallMethod(
        browserNavigator.userAgent,
        browserNavigator.platform,
        browserNavigator.maxTouchPoints
      ),
    isDismissed: () => {
      try {
        return (
          window.localStorage.getItem(PWA_INSTALL_DISMISSED_STORAGE_KEY) ===
          "1"
        );
      } catch {
        return false;
      }
    },
    setDismissed: () => {
      try {
        window.localStorage.setItem(PWA_INSTALL_DISMISSED_STORAGE_KEY, "1");
      } catch {
        // Dismissal persistence is optional when browser storage is blocked.
      }
    },
    clearDismissed: () => {
      try {
        window.localStorage.removeItem(PWA_INSTALL_DISMISSED_STORAGE_KEY);
      } catch {
        // The install guide can still be shown for the current session.
      }
    },
    addPromptListener: (listener) => {
      const onBeforeInstallPrompt = (event: Event) => {
        event.preventDefault();
        listener(event as Event & PwaNativeInstallPrompt);
      };
      window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      return () =>
        window.removeEventListener(
          "beforeinstallprompt",
          onBeforeInstallPrompt
        );
    },
    addInstalledListener: (listener) => {
      window.addEventListener("appinstalled", listener);
      return () => window.removeEventListener("appinstalled", listener);
    }
  };
}

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
  const nativeRuntime = Capacitor.isNativePlatform();
  const storage = storageManager
    ? {
        persisted: () => storageManager.persisted(),
        persist: () => storageManager.persist()
      }
    : undefined;

  return {
    getOnline: () => navigator.onLine,
    nativeRuntime,
    supportsServiceWorker: "serviceWorker" in navigator,
    getServiceWorkerControlled: () =>
      "serviceWorker" in navigator &&
      navigator.serviceWorker.controller !== null,
    addConnectionListener: (listener) => {
      window.addEventListener("online", listener);
      window.addEventListener("offline", listener);
      return () => {
        window.removeEventListener("online", listener);
        window.removeEventListener("offline", listener);
      };
    },
    reload: () => window.location.reload(),
    storage,
    install: nativeRuntime ? undefined : createBrowserInstallEnvironment()
  };
}

export function createPwaStatusStore(environment: PwaStatusEnvironment) {
  const installEnvironment = environment.install;
  const initiallyInstalled = installEnvironment?.isInstalled() ?? false;
  const initialInstallMethod = initiallyInstalled
    ? null
    : (installEnvironment?.getManualMethod() ?? null);
  let snapshot: PwaStatusSnapshot = {
    ...serverSnapshot,
    isOnline: environment.getOnline(),
    offlineCapability:
      environment.nativeRuntime
        ? "ready"
        : environment.supportsServiceWorker === false
        ? "unavailable"
        : environment.getServiceWorkerControlled?.()
          ? "ready"
          : "checking",
    storagePersistence: environment.storage ? "checking" : "unsupported",
    installState: initiallyInstalled
      ? "installed"
      : initialInstallMethod && !installEnvironment?.isDismissed()
        ? "available"
        : "hidden",
    installMethod: initialInstallMethod
  };
  let updateServiceWorker: UpdateServiceWorker | null = null;
  let nativeInstallPrompt: PwaNativeInstallPrompt | null = null;
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
    const removeListeners = [environment.addConnectionListener(syncConnection)];

    if (installEnvironment) {
      removeListeners.push(
        installEnvironment.addPromptListener((prompt) => {
          nativeInstallPrompt = prompt;
          publish({
            installMethod: "native",
            installState: installEnvironment.isDismissed()
              ? "hidden"
              : "available",
            installError: null
          });
        }),
        installEnvironment.addInstalledListener(() => {
          nativeInstallPrompt = null;
          installEnvironment.setDismissed();
          publish({
            installState: "installed",
            installMethod: null,
            installError: null
          });
        })
      );
    }

    if (environment.storage) {
      environment.storage
        .persisted()
        .then((persisted) =>
          publish({ storagePersistence: persisted ? "granted" : "available" })
        )
        .catch(() => publish({ storagePersistence: "available" }));
    }

    return () => removeListeners.forEach((removeListener) => removeListener());
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const applyUpdate = async (prepareForUpdate?: PrepareForUpdate) => {
    if (!snapshot.reloadPending && !updateServiceWorker) {
      publish({ updateError: "Chưa thể kích hoạt bản cập nhật." });
      return;
    }

    publish({ updating: true, updateError: null });
    if (prepareForUpdate) {
      try {
        const prepared = await prepareForUpdate();
        if (!prepared) {
          publish({
            updating: false,
            updateError:
              "Chưa tạo được điểm an toàn cho dữ liệu. Bản cập nhật chưa được kích hoạt."
          });
          return;
        }
      } catch {
        publish({
          updating: false,
          updateError:
            "Chưa tạo được điểm an toàn cho dữ liệu. Bản cập nhật chưa được kích hoạt."
        });
        return;
      }
    }

    updateAccepted = true;
    if (snapshot.reloadPending) {
      environment.reload();
      return;
    }

    try {
      await updateServiceWorker?.();
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

  const requestInstall = async () => {
    if (!nativeInstallPrompt || snapshot.installMethod !== "native") {
      publish({
        installError:
          "Trình duyệt này cần cài ScottBook bằng hướng dẫn thủ công."
      });
      return false;
    }

    const prompt = nativeInstallPrompt;
    publish({ installState: "prompting", installError: null });
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      nativeInstallPrompt = null;
      installEnvironment?.setDismissed();
      if (choice.outcome === "accepted") {
        publish({
          installState: "installed",
          installMethod: null,
          installError: null
        });
        return true;
      }

      publish({
        installState: "hidden",
        installMethod: installEnvironment?.getManualMethod() ?? null,
        installError: null
      });
      return false;
    } catch {
      nativeInstallPrompt = null;
      publish({
        installState: "available",
        installMethod: installEnvironment?.getManualMethod() ?? "browser",
        installError: "Chưa mở được hộp thoại cài đặt của trình duyệt."
      });
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
      publish({
        needRefresh: true,
        updateAvailable: true,
        updateError: null
      }),
    notifyServiceWorkerRegistered: (registration?: {
      active?: unknown | null;
    }) =>
      publish({
        offlineCapability:
          environment.nativeRuntime
            ? "ready"
            : environment.supportsServiceWorker === false
            ? "unavailable"
            : registration?.active
              ? "ready"
              : "checking"
      }),
    notifyOfflineReady: () =>
      publish({ offlineReady: true, offlineCapability: "ready" }),
    notifyRegisterError: () => {
      const remainsOfflineReady = snapshot.offlineCapability === "ready";
      publish({
        offlineCapability: remainsOfflineReady ? "ready" : "unavailable",
        updateError: remainsOfflineReady
          ? "Không thể kiểm tra bản PWA mới. Bản hiện tại vẫn dùng được offline."
          : "Chưa thể chuẩn bị bản offline. Hãy giữ kết nối và thử mở lại ScottBook."
      });
    },
    handleServiceWorkerNeedsReload: () => {
      if (updateAccepted) {
        environment.reload();
      } else {
        publish({
          needRefresh: true,
          updateAvailable: true,
          reloadPending: true,
          updating: false
        });
      }
    },
    applyUpdate,
    dismissRefresh: () =>
      publish({ needRefresh: false, updateError: null, updating: false }),
    showRefresh: () => {
      if (snapshot.updateAvailable) publish({ needRefresh: true });
    },
    dismissOfflineReady: () => publish({ offlineReady: false }),
    dismissError: () => publish({ updateError: null }),
    requestPersistentStorage,
    requestInstall,
    dismissInstall: () => {
      installEnvironment?.setDismissed();
      publish({ installState: "hidden", installError: null });
    },
    showInstallHelp: () => {
      if (!installEnvironment || snapshot.installState === "installed") return;
      installEnvironment.clearDismissed();
      publish({
        installState: "available",
        installMethod: nativeInstallPrompt
          ? "native"
          : installEnvironment.getManualMethod(),
        installError: null
      });
    }
  };
}

export function getPwaConnectionLabel(
  isOnline: boolean,
  offlineCapability: OfflineCapability
): string {
  if (!isOnline) return "Đang ngoại tuyến";
  if (offlineCapability === "ready") {
    return "Có mạng · sẵn sàng offline";
  }
  if (offlineCapability === "unavailable") {
    return "Có mạng · offline chưa sẵn sàng";
  }
  return "Có mạng · đang chuẩn bị offline";
}

export const pwaStatusStore = createPwaStatusStore(createBrowserEnvironment());

export function usePwaStatus() {
  return useSyncExternalStore(
    pwaStatusStore.subscribe,
    pwaStatusStore.getSnapshot,
    pwaStatusStore.getServerSnapshot
  );
}
