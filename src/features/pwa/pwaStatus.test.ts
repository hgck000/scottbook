import { describe, expect, it, vi } from "vitest";
import {
  createPwaStatusStore,
  detectManualInstallMethod,
  getPwaConnectionLabel,
  type PwaNativeInstallPrompt
} from "./pwaStatus";

describe("controlled PWA lifecycle", () => {
  it("tracks connection changes and reloads only after an accepted update", async () => {
    let online = true;
    let connectionListener: () => void = () => undefined;
    const reload = vi.fn();
    const environment = {
      getOnline: () => online,
      addConnectionListener: (listener: () => void) => {
        connectionListener = listener;
        return () => undefined;
      },
      reload
    };
    const store = createPwaStatusStore(environment);
    const updateServiceWorker = vi.fn(async () => undefined);

    store.initialize();
    online = false;
    connectionListener();
    expect(store.getSnapshot().isOnline).toBe(false);

    store.setUpdateServiceWorker(updateServiceWorker);
    store.notifyNeedRefresh();
    expect(store.getSnapshot().needRefresh).toBe(true);
    await store.applyUpdate();
    expect(updateServiceWorker).toHaveBeenCalledOnce();
    expect(reload).not.toHaveBeenCalled();

    store.handleServiceWorkerNeedsReload();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("defers a reload triggered by another tab until the user accepts", async () => {
    const reload = vi.fn();
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload
    });

    store.handleServiceWorkerNeedsReload();
    expect(store.getSnapshot().reloadPending).toBe(true);
    expect(store.getSnapshot().needRefresh).toBe(true);
    expect(reload).not.toHaveBeenCalled();

    await store.applyUpdate();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("reports persistent-storage results without blocking normal storage", async () => {
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined,
      storage: {
        persisted: vi.fn(async () => false),
        persist: vi.fn(async () => true)
      }
    });

    store.initialize();
    await Promise.resolve();
    expect(store.getSnapshot().storagePersistence).toBe("available");

    await expect(store.requestPersistentStorage()).resolves.toBe(true);
    expect(store.getSnapshot().storagePersistence).toBe("granted");
  });

  it("keeps the current app running when service-worker activation fails", async () => {
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    });
    store.setUpdateServiceWorker(async () => {
      throw new Error("activation failed");
    });

    await store.applyUpdate();

    expect(store.getSnapshot().updating).toBe(false);
    expect(store.getSnapshot().updateError).toContain(
      "Dữ liệu đọc vẫn được giữ nguyên"
    );
  });

  it("creates a data safety point before activating or reloading", async () => {
    const order: string[] = [];
    const reload = vi.fn(() => order.push("reload"));
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload
    });
    store.setUpdateServiceWorker(async () => {
      order.push("activate");
    });
    store.notifyNeedRefresh();

    await store.applyUpdate(async () => {
      order.push("prepare");
      return true;
    });
    expect(order).toEqual(["prepare", "activate"]);

    store.handleServiceWorkerNeedsReload();
    expect(reload).toHaveBeenCalledOnce();
  });

  it("blocks activation when the data safety point cannot be written", async () => {
    const updateServiceWorker = vi.fn(async () => undefined);
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    });
    store.setUpdateServiceWorker(updateServiceWorker);
    store.notifyNeedRefresh();

    await store.applyUpdate(async () => false);

    expect(updateServiceWorker).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toMatchObject({
      updating: false,
      needRefresh: true,
      updateAvailable: true
    });
    expect(store.getSnapshot().updateError).toContain("điểm an toàn");
  });

  it("keeps a dismissed update reachable from the compact action", () => {
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    });
    store.notifyNeedRefresh();
    store.dismissRefresh();
    expect(store.getSnapshot()).toMatchObject({
      needRefresh: false,
      updateAvailable: true
    });

    store.showRefresh();
    expect(store.getSnapshot().needRefresh).toBe(true);
  });

  it("restores persistent offline readiness from an active service worker", () => {
    const store = createPwaStatusStore({
      getOnline: () => true,
      supportsServiceWorker: true,
      getServiceWorkerControlled: () => false,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    });

    expect(store.getSnapshot().offlineCapability).toBe("checking");
    store.notifyServiceWorkerRegistered({ active: {} });
    expect(store.getSnapshot().offlineCapability).toBe("ready");
    expect(store.getSnapshot().offlineReady).toBe(false);
  });

  it("treats a native bundle as offline-ready without browser install UI", () => {
    const store = createPwaStatusStore({
      getOnline: () => false,
      nativeRuntime: true,
      supportsServiceWorker: false,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    });

    expect(store.getSnapshot()).toMatchObject({
      isOnline: false,
      offlineCapability: "ready",
      installState: "hidden",
      installMethod: null
    });
  });

  it("keeps a completed precache ready even when a later update check fails", () => {
    const store = createPwaStatusStore({
      getOnline: () => true,
      supportsServiceWorker: true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    });

    store.notifyOfflineReady();
    expect(store.getSnapshot()).toMatchObject({
      offlineCapability: "ready",
      offlineReady: true
    });

    store.notifyRegisterError();
    expect(store.getSnapshot().offlineCapability).toBe("ready");
    expect(store.getSnapshot().updateError).toContain(
      "Bản hiện tại vẫn dùng được offline"
    );
  });

  it("reports unsupported offline setup without promising a usable cache", () => {
    const store = createPwaStatusStore({
      getOnline: () => true,
      supportsServiceWorker: true,
      getServiceWorkerControlled: () => false,
      addConnectionListener: () => () => undefined,
      reload: () => undefined
    });

    store.notifyRegisterError();
    expect(store.getSnapshot().offlineCapability).toBe("unavailable");
    expect(store.getSnapshot().updateError).toContain(
      "Chưa thể chuẩn bị bản offline"
    );
  });

  it("reports concise online and offline capability labels", () => {
    expect(getPwaConnectionLabel(true, "checking")).toBe(
      "Có mạng · đang chuẩn bị offline"
    );
    expect(getPwaConnectionLabel(true, "ready")).toBe(
      "Có mạng · sẵn sàng offline"
    );
    expect(getPwaConnectionLabel(true, "unavailable")).toBe(
      "Có mạng · offline chưa sẵn sàng"
    );
    expect(getPwaConnectionLabel(false, "unavailable")).toBe(
      "Đang ngoại tuyến"
    );
  });
});

describe("PWA installation", () => {
  it("detects Apple mobile devices including iPadOS desktop user agents", () => {
    expect(
      detectManualInstallMethod("Mozilla/5.0 (iPhone)", "iPhone", 5)
    ).toBe("ios");
    expect(
      detectManualInstallMethod("Mozilla/5.0 (Macintosh)", "MacIntel", 5)
    ).toBe("ios");
    expect(
      detectManualInstallMethod("Mozilla/5.0 (Macintosh)", "MacIntel", 0)
    ).toBe("macos");
    expect(
      detectManualInstallMethod("Mozilla/5.0 (Linux; Android 16)", "Linux", 5)
    ).toBe("browser");
  });

  it("captures and resolves the native browser install prompt", async () => {
    let promptListener: (prompt: PwaNativeInstallPrompt) => void =
      () => undefined;
    let dismissed = false;
    const prompt = vi.fn(async () => undefined);
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined,
      install: {
        isInstalled: () => false,
        getManualMethod: () => "browser",
        isDismissed: () => dismissed,
        setDismissed: () => {
          dismissed = true;
        },
        clearDismissed: () => {
          dismissed = false;
        },
        addPromptListener: (listener) => {
          promptListener = listener;
          return () => undefined;
        },
        addInstalledListener: () => () => undefined
      }
    });
    store.initialize();
    promptListener({
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" })
    });
    expect(store.getSnapshot()).toMatchObject({
      installState: "available",
      installMethod: "native"
    });

    await expect(store.requestInstall()).resolves.toBe(true);
    expect(prompt).toHaveBeenCalledOnce();
    expect(dismissed).toBe(true);
    expect(store.getSnapshot()).toMatchObject({
      installState: "installed",
      installMethod: null
    });
  });

  it("persists dismissal but leaves manual guidance reopenable", () => {
    let dismissed = true;
    const store = createPwaStatusStore({
      getOnline: () => true,
      addConnectionListener: () => () => undefined,
      reload: () => undefined,
      install: {
        isInstalled: () => false,
        getManualMethod: () => "ios",
        isDismissed: () => dismissed,
        setDismissed: () => {
          dismissed = true;
        },
        clearDismissed: () => {
          dismissed = false;
        },
        addPromptListener: () => () => undefined,
        addInstalledListener: () => () => undefined
      }
    });
    expect(store.getSnapshot()).toMatchObject({
      installState: "hidden",
      installMethod: "ios"
    });

    store.showInstallHelp();
    expect(dismissed).toBe(false);
    expect(store.getSnapshot().installState).toBe("available");

    store.dismissInstall();
    expect(dismissed).toBe(true);
    expect(store.getSnapshot().installState).toBe("hidden");
  });
});
